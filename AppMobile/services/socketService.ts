import io, { Socket } from 'socket.io-client';
import { API_URL } from './apiClient';
import { showToast } from '../components/ui/Toast';

interface SensorData {
    type: 'temperature' | 'humidity' | 'gasLevel';
    value: number;
    timestamp: string;
}

class SocketService {
    private socket: Socket | null = null;
    private subscribedDevices: Set<string> = new Set();
    private listeners: Map<string, ((data: SensorData) => void)[]> = new Map();
    private gasLevel: number = 0;
    private temperature: number = 0;
    private humidity: number = 0;
    private warningThreshold: number = 80; // Ngưỡng cảnh báo khí gas
    private lastWarningTime: number = 0;

    constructor() {
        this.connect();
    }

    private connect(): void {
        try {
            this.socket = io(API_URL, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('Socket connected');

                // Đăng ký lại các thiết bị đã subscribe trước đó
                this.subscribedDevices.forEach((deviceId) => {
                    this.subscribeToDevice(deviceId);
                });
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            this.socket.on('error', (error: any) => {
                console.error('Socket error:', error);
            });
        } catch (error) {
            console.error('Socket connection error:', error);
        }
    }

    subscribeToDevice(deviceId: string): void {
        if (!this.socket) {
            this.connect();
        }

        if (this.socket) {
            this.socket.emit('subscribe_device', deviceId);
            this.subscribedDevices.add(deviceId);

            // Lắng nghe dữ liệu từ thiết bị này
            const eventName = `sensor_data_${deviceId}`;
            this.socket.on(eventName, (data: SensorData) => {
                this.processSensorData(deviceId, data);
            });
        }
    }

    unsubscribeFromDevice(deviceId: string): void {
        if (this.socket) {
            this.socket.emit('unsubscribe_device', deviceId);
            this.subscribedDevices.delete(deviceId);

            // Hủy lắng nghe dữ liệu từ thiết bị này
            const eventName = `sensor_data_${deviceId}`;
            this.socket.off(eventName);
        }
    }

    addSensorDataListener(deviceId: string, callback: (data: SensorData) => void): void {
        if (!this.listeners.has(deviceId)) {
            this.listeners.set(deviceId, []);
        }
        this.listeners.get(deviceId)?.push(callback);
    }

    removeSensorDataListener(deviceId: string, callback: (data: SensorData) => void): void {
        if (this.listeners.has(deviceId)) {
            const deviceListeners = this.listeners.get(deviceId) || [];
            const index = deviceListeners.indexOf(callback);
            if (index !== -1) {
                deviceListeners.splice(index, 1);
            }
        }
    }

    private processSensorData(deviceId: string, data: SensorData): void {
        // Cập nhật giá trị cảm biến
        if (data.type === 'gasLevel') {
            this.gasLevel = data.value;
            // Kiểm tra ngưỡng cảnh báo
            this.checkGasWarning();
        } else if (data.type === 'temperature') {
            this.temperature = data.value;
        } else if (data.type === 'humidity') {
            this.humidity = data.value;
        }

        // Gọi tất cả các callback đã đăng ký cho thiết bị này
        const callbacks = this.listeners.get(deviceId) || [];
        callbacks.forEach((callback) => callback(data));
    }

    private checkGasWarning(): void {
        const now = Date.now();
        // Chỉ hiển thị cảnh báo nếu cách lần cảnh báo trước ít nhất 1 phút
        if (this.gasLevel > this.warningThreshold && now - this.lastWarningTime > 10000) {
            showToast(
                'error',
                'Cảnh báo nguy hiểm!',
                `Phát hiện nồng độ khí gas cao (${this.gasLevel}). Vui lòng kiểm tra ngay!`,
            );
            this.lastWarningTime = now;
        }
    }

    // Lấy các giá trị cảm biến hiện tại
    getSensorValues() {
        return {
            gasLevel: this.gasLevel,
            temperature: this.temperature,
            humidity: this.humidity,
        };
    }

    setWarningThreshold(value: number): void {
        this.warningThreshold = value;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();
