import { create } from 'zustand';
import deviceService from '../services/deviceService';
import { Device } from '../interfaces/device.interface';
import { showToast } from '../components/ui/Toast';

interface DeviceState {
    devices: Device[];
    currentDevice: Device | null;
    isLoading: boolean;
    error: string | null;

    getDevices: (homeId: string) => Promise<void>;
    getDeviceById: (deviceId: string) => Promise<void>;
    addDevice: (homeId: string, deviceData: any) => Promise<void>;
    updateDevice: (deviceId: string, deviceData: any) => Promise<void>;
    deleteDevice: (deviceId: string) => Promise<void>;
    connectDevice: (deviceId: string) => Promise<void>;
    disconnectDevice: (deviceId: string) => Promise<void>;
    clearError: () => void;
}

const useDeviceStore = create<DeviceState>((set, get) => ({
    devices: [],
    currentDevice: null,
    isLoading: false,
    error: null,

    getDevices: async (homeId: string) => {
        try {
            set({ isLoading: true, error: null });
            const response = await deviceService.getDevices(homeId);
            if (response.success) {
                set({ devices: response.data, isLoading: false });
            } else {
                set({
                    isLoading: false,
                    error: response.message || 'Không thể lấy danh sách thiết bị',
                });
                showToast('error', 'Lỗi', 'Không thể lấy danh sách thiết bị');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Không thể lấy danh sách thiết bị';
            set({
                isLoading: false,
                error: errorMsg,
            });
            showToast('error', 'Lỗi', errorMsg);
        }
    },

    getDeviceById: async (deviceId: string) => {
        try {
            set({ isLoading: true, error: null });
            const device = await deviceService.getDeviceById(deviceId);
            set({ currentDevice: device, isLoading: false });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Không thể lấy thông tin thiết bị';
            set({
                isLoading: false,
                error: errorMsg,
            });
            showToast('error', 'Lỗi', errorMsg);
        }
    },

    addDevice: async (homeId: string, deviceData: any) => {
        try {
            set({ isLoading: true, error: null });
            const response = await deviceService.addDevice(homeId, deviceData);

            if (response && response.success) {
                const newDevice = response.data;
                set({
                    devices: [...get().devices, newDevice],
                    isLoading: false,
                    error: null,
                });
                showToast('success', 'Thành công', `Đã thêm thiết bị ${deviceData.name}`);
                return newDevice;
            } else {
                throw new Error(response?.message || 'Không thể thêm thiết bị mới');
            }
        } catch (error: any) {
            let errorMsg = 'Không thể thêm thiết bị mới';

            if (error.message === 'timeout') {
                errorMsg = 'Quá thời gian xác minh thiết bị, vui lòng thử lại';
            } else {
                errorMsg = error.response?.data?.message || error.message || errorMsg;
            }

            set({
                isLoading: false,
                error: errorMsg,
            });
            showToast('error', 'Lỗi', errorMsg);
            throw error;
        }
    },

    updateDevice: async (deviceId: string, deviceData: any) => {
        try {
            set({ isLoading: true, error: null });
            const response = await deviceService.updateDevice(deviceId, deviceData);

            if (response && response.success) {
                const updatedDevice = response.data;
                set({
                    devices: get().devices.map((device) => (device.deviceId === deviceId ? updatedDevice : device)),
                    currentDevice: get().currentDevice?.deviceId === deviceId ? updatedDevice : get().currentDevice,
                    isLoading: false,
                    error: null,
                });
                showToast('success', 'Thành công', `Đã cập nhật thiết bị ${updatedDevice.name}`);
            } else {
                throw new Error(response?.message || 'Không thể cập nhật thiết bị');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Không thể cập nhật thiết bị';
            set({
                isLoading: false,
                error: errorMsg,
            });
            showToast('error', 'Lỗi', errorMsg);
            throw error;
        }
    },

    deleteDevice: async (deviceId: string) => {
        try {
            set({ isLoading: true, error: null });

            const deviceToDelete = get().devices.find((d) => d.deviceId === deviceId);

            const response = await deviceService.deleteDevice(deviceId);

            if (response && response.success) {
                set({
                    devices: get().devices.filter((device) => device.deviceId !== deviceId),
                    currentDevice: get().currentDevice?.deviceId === deviceId ? null : get().currentDevice,
                    isLoading: false,
                    error: null,
                });

                showToast(
                    'success',
                    'Đã xóa thiết bị',
                    `Thiết bị ${deviceToDelete?.name || ''} đã được xóa thành công`,
                );
            } else {
                throw new Error(response?.message || 'Không thể xóa thiết bị');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Không thể xóa thiết bị';
            set({
                isLoading: false,
                error: errorMsg,
            });
            showToast('error', 'Lỗi xóa thiết bị', errorMsg);
            throw error;
        }
    },

    connectDevice: async (deviceId: string) => {
        try {
            set({ isLoading: true, error: null });

            const deviceToConnect = get().devices.find((d) => d.deviceId === deviceId);

            const response = await deviceService.connectDevice(deviceId);

            if (response && response.success) {
                set({
                    devices: get().devices.map((device) =>
                        device.deviceId === deviceId ? { ...device, state: 'ACTIVE' } : device,
                    ),
                    currentDevice:
                        get().currentDevice?.deviceId === deviceId
                            ? ({ ...get().currentDevice, state: 'ACTIVE' } as Device)
                            : get().currentDevice,
                    isLoading: false,
                    error: null,
                });

                showToast('success', 'Kết nối thành công', `Đã kết nối với thiết bị ${deviceToConnect?.name || ''}`);
            } else {
                throw new Error(response?.message || 'Không thể kết nối thiết bị');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Không thể kết nối thiết bị';
            set({
                isLoading: false,
                error: errorMsg,
            });
            showToast('error', 'Lỗi kết nối', errorMsg);
            throw error;
        }
    },

    disconnectDevice: async (deviceId: string) => {
        try {
            set({ isLoading: true, error: null });

            const deviceToDisconnect = get().devices.find((d) => d.deviceId === deviceId);

            const response = await deviceService.disconnectDevice(deviceId);

            if (response && response.success) {
                set({
                    devices: get().devices.map((device) =>
                        device.deviceId === deviceId ? { ...device, state: 'INACTIVE' } : device,
                    ),
                    currentDevice:
                        get().currentDevice?.deviceId === deviceId
                            ? ({ ...get().currentDevice, state: 'INACTIVE' } as Device)
                            : get().currentDevice,
                    isLoading: false,
                    error: null,
                });

                showToast('info', 'Đã ngắt kết nối', `Đã ngắt kết nối thiết bị ${deviceToDisconnect?.name || ''}`);
            } else {
                throw new Error(response?.message || 'Không thể ngắt kết nối thiết bị');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Không thể ngắt kết nối thiết bị';
            set({
                isLoading: false,
                error: errorMsg,
            });
            showToast('error', 'Lỗi ngắt kết nối', errorMsg);
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useDeviceStore;
