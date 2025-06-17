import apiClient from './apiClient';
import { AxiosError } from 'axios';

const gasWarningService = {
    async turnOnWarning(deviceId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/gaswarning/${deviceId}/onwarning`);
            return {
                success: response.status === 200 || response.status === 201,
                data: response.data,
                message: 'Đã bật cảnh báo thành công',
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async turnOffWarning(deviceId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/gaswarning/${deviceId}/offwarning`);
            return {
                success: response.status === 200 || response.status === 201,
                data: response.data,
                message: 'Đã tắt cảnh báo thành công',
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async turnOnFan(deviceId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/gaswarning/${deviceId}/onfanwarning`);
            return {
                success: response.status === 200 || response.status === 201,
                data: response.data,
                message: 'Đã bật quạt thông gió thành công',
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async turnOffFan(deviceId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/gaswarning/${deviceId}/offfanwarning`);
            return {
                success: response.status === 200 || response.status === 201,
                data: response.data,
                message: 'Đã tắt quạt thông gió thành công',
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async changeWarningLevel(deviceId: string, gasValue: number, temValue: number): Promise<any> {
        try {
            const response = await apiClient.post(`/gaswarning/${deviceId}/warningLevel`, {
                gasValue,
                temValue,
            });
            return {
                success: response.status === 200 || response.status === 201,
                data: response.data,
                message: 'Đã cập nhật ngưỡng cảnh báo thành công',
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },
};

export default gasWarningService;
