import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useDevice } from '../../contexts/DeviceContext';
import { io } from 'socket.io-client';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WS_URL = 'wss://e6b1298d0857429c89f18a2890b4f84c.s1.eu.hivemq.cloud:8884/mqtt';
const RECONNECT_DELAY = 10000;
const MAX_HISTORICAL_POINTS = 20;

export default function AtmosphereSensorDetail({ device }) {
    const [sensorData, setSensorData] = useState({
        temperature: 0,
        humidity: 0,
        gasLevel: 0,
    });

    const [historicalData, setHistoricalData] = useState({
        labels: [],
        temperature: [],
        humidity: [],
        gasLevel: [],
    });

    const [warningConfig, setWarningConfig] = useState({
        gasValue: 70,
        temValue: 50,
    });

    const [warningState, setWarningState] = useState('OFF');
    const [wsConnection, setWsConnection] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const { controlWarning, updateWarningThresholds, loading: apiLoading } = useDevice();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Kết nối tới WebSocket server
        const newSocket = io('http://localhost:3001', {
            transports: ['websocket'],
            reconnection: true,
        });

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            // Đăng ký nhận dữ liệu cho thiết bị cụ thể
            newSocket.emit('subscribe_device', device.deviceId);
        });

        // Lắng nghe dữ liệu sensor
        newSocket.on(`sensor_data_${device.deviceId}`, (data) => {
            const { type, value, timestamp } = data;
            console.log('Received sensor data:', data);

            // Đảm bảo value là số
            const numericValue = Number(value);

            if (!isNaN(numericValue)) {
                // Cập nhật dữ liệu sensor theo loại
                setSensorData((prev) => ({
                    ...prev,
                    [type]: numericValue,
                }));

                // Cập nhật dữ liệu lịch sử
                setHistoricalData((prev) => {
                    const newLabels = [...prev.labels, new Date(timestamp).toLocaleTimeString()];
                    const newData = {
                        ...prev,
                        [type]: [...prev[type], numericValue],
                        labels: newLabels,
                    };

                    // Giới hạn số điểm dữ liệu
                    if (newLabels.length > MAX_HISTORICAL_POINTS) {
                        newData.labels = newLabels.slice(-MAX_HISTORICAL_POINTS);
                        newData[type] = newData[type].slice(-MAX_HISTORICAL_POINTS);
                    }

                    return newData;
                });

                // Kiểm tra ngưỡng cảnh báo
                checkThresholds(type, numericValue);
            }
        });

        setSocket(newSocket);

        // Cleanup khi component unmount
        return () => {
            if (newSocket) {
                newSocket.emit('unsubscribe_device', device.deviceId);
                newSocket.disconnect();
            }
        };
    }, [device.deviceId]);

    // Hàm kiểm tra ngưỡng cảnh báo
    const checkThresholds = (type, value) => {
        if (type === 'temperature' && value > warningConfig.temValue) {
            toast.warning(`High Temperature Alert: ${value.toFixed(1)}°C`, {
                position: 'top-right',
                autoClose: 5000,
            });
        }
        if (type === 'gasLevel' && value > warningConfig.gasValue) {
            toast.error(`Dangerous Gas Level: ${value.toFixed(1)} ppm`, {
                position: 'top-right',
                autoClose: 5000,
            });
        }
    };

    const handleWarningControl = async (state) => {
        try {
            await controlWarning(device.deviceId, state);
            setWarningState(state);

            if (wsConnection?.readyState === WebSocket.OPEN) {
                wsConnection.send(
                    JSON.stringify({
                        type: 'publish',
                        topic: `iot/warning/control/${device.deviceId}`,
                        message: state,
                    }),
                );
            }

            setWarningState(state);
            toast.success(`Warning system ${state}`);
        } catch (error) {
            console.error('Warning control error:', error);
            toast.error('Failed to update warning state');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleThresholdUpdate = async () => {
        try {
            setIsConnecting(true);
            await updateWarningThresholds(device.deviceId, warningConfig);

            if (socket?.connected) {
                socket.emit('warning_threshold', {
                    deviceId: device.deviceId,
                    config: warningConfig,
                });
            }

            toast.success('Thresholds updated successfully');
        } catch (error) {
            console.error('Threshold update error:', error);
            toast.error('Failed to update thresholds');
        } finally {
            setIsConnecting(false);
        }
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="space-y-8 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-6">Real-time Monitoring</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                            className={`rounded-lg p-4 ${
                                sensorData.temperature > warningConfig.temValue
                                    ? 'bg-red-50 border-2 border-red-500'
                                    : 'bg-blue-50'
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-gray-500">Temperature</span>
                                <span className="text-3xl font-bold text-gray-900">
                                    {typeof sensorData.temperature === 'number'
                                        ? sensorData.temperature.toFixed(1)
                                        : '0.0'}
                                    °C
                                </span>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-gray-500">Humidity</span>
                                <span className="text-3xl font-bold text-gray-900">
                                    {sensorData.humidity?.toFixed(1) || '0.0'}%
                                </span>
                            </div>
                        </div>

                        <div
                            className={`rounded-lg p-4 ${
                                sensorData.gasLevel > warningConfig.gasValue
                                    ? 'bg-red-50 border-2 border-red-500'
                                    : 'bg-blue-50'
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-gray-500">Gas Level</span>
                                <span className="text-3xl font-bold text-gray-900">
                                    {sensorData.gasLevel?.toFixed(1) || '0.0'} ppm
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 h-64">
                        <Line
                            data={{
                                labels: historicalData.labels,
                                datasets: [
                                    {
                                        label: 'Temperature (°C)',
                                        data: historicalData.temperature,
                                        borderColor: 'rgb(255, 99, 132)',
                                        tension: 0.1,
                                    },
                                    {
                                        label: 'Humidity (%)',
                                        data: historicalData.humidity,
                                        borderColor: 'rgb(53, 162, 235)',
                                        tension: 0.1,
                                    },
                                    {
                                        label: 'Gas Level (ppm)',
                                        data: historicalData.gasLevel,
                                        borderColor: 'rgb(75, 192, 192)',
                                        tension: 0.1,
                                    },
                                ],
                            }}
                            options={chartOptions}
                        />
                    </div>
                </div>

                {/* Warning Configuration Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-6">Warning Configuration</h2>

                    {/* Warning Status */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Warning System</span>
                            <button
                                onClick={() => handleWarningControl(warningState === 'ON' ? 'OFF' : 'ON')}
                                disabled={isConnecting}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    warningState === 'ON'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {isConnecting ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    warningState
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gas Warning Threshold (ppm)
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    value={warningConfig.gasValue}
                                    onChange={(e) =>
                                        setWarningConfig({
                                            ...warningConfig,
                                            gasValue: parseFloat(e.target.value),
                                        })
                                    }
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                <span className="text-sm text-gray-500">ppm</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Temperature Warning Threshold
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    value={warningConfig.temValue}
                                    onChange={(e) =>
                                        setWarningConfig({
                                            ...warningConfig,
                                            temValue: parseFloat(e.target.value),
                                        })
                                    }
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                <span className="text-sm text-gray-500">°C</span>
                            </div>
                        </div>

                        <button
                            onClick={handleThresholdUpdate}
                            disabled={isConnecting}
                            className="w-full mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isConnecting ? 'Updating...' : 'Update Thresholds'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
