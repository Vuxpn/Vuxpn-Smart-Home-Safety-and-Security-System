import { AxiosError } from 'axios';
import apiClient from './apiClient';
import axios, { CancelToken } from 'axios';

const deviceService = {
    async getDevices(homeId: string): Promise<any> {
        const response = await apiClient.get(`/device/home/${homeId}`);
        return response.data;
    },

    async getDeviceById(deviceId: string): Promise<any> {
        const response = await apiClient.get(`/device/detail/${deviceId}`);
        return response.data;
    },

    async addDevice(homeId: string, deviceData: any, cancelToken?: CancelToken): Promise<any> {
        try {
            const data = { ...deviceData, homeId };

            const response = await apiClient.post(`/device/create`, data, {
                cancelToken,
                timeout: 32000,
            });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) {
                throw error;
            }

            if (
                error instanceof Error &&
                (error.message.includes('timeout') ||
                    error.message.includes('Verification timeout') ||
                    (error instanceof AxiosError && error.code === 'ECONNABORTED'))
            ) {
                throw new Error('timeout');
            }

            throw error;
        }
    },

    async updateDevice(deviceId: string, deviceData: any): Promise<any> {
        const response = await apiClient.put(`/device/${deviceId}`, deviceData);
        return response.data;
    },

    async deleteDevice(deviceId: string): Promise<any> {
        const response = await apiClient.delete(`/device/delete/${deviceId}`);
        return {
            success: response.status >= 200 && response.status < 300,
            data: response.data,
            status: response.status,
        };
    },

    async connectDevice(deviceId: string): Promise<any> {
        const response = await apiClient.post(`/device/${deviceId}/connect`);
        return {
            success: response.status >= 200 && response.status < 300,
            data: response.data,
            status: response.status,
        };
    },

    async disconnectDevice(deviceId: string): Promise<any> {
        const response = await apiClient.post(`/device/${deviceId}/disconnect`);
        return {
            success: response.status >= 200 && response.status < 300,
            data: response.data,
            status: response.status,
        };
    },
};

export default deviceService;
