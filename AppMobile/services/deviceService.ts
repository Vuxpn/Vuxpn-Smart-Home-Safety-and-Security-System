import apiClient from './apiClient';

const deviceService = {
    async getDevices(homeId: string): Promise<any> {
        const response = await apiClient.get(`/devices/${homeId}`);
        return response.data;
    },

    async getDeviceById(deviceId: string): Promise<any> {
        const response = await apiClient.get(`/devices/detail/${deviceId}`);
        return response.data;
    },

    async addDevice(homeId: string, deviceData: any): Promise<any> {
        const response = await apiClient.post(`/devices/${homeId}`, deviceData);
        return response.data;
    },

    async updateDevice(deviceId: string, deviceData: any): Promise<any> {
        const response = await apiClient.put(`/devices/${deviceId}`, deviceData);
        return response.data;
    },

    async deleteDevice(deviceId: string): Promise<any> {
        const response = await apiClient.delete(`/devices/${deviceId}`);
        return response.data;
    },
};

export default deviceService;
