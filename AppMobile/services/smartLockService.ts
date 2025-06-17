import apiClient from './apiClient';
import { AxiosError } from 'axios';
const smartLockService = {
    async unlockDoor(deviceId: string, password: string): Promise<any> {
        try {
            const response = await apiClient.post(`/smartlock/${deviceId}/unlock`, {
                password,
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async lockDoor(deviceId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/smartlock/${deviceId}/lock`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async changePassword(deviceId: string, oldPassword: string, newPassword: string): Promise<any> {
        try {
            const response = await apiClient.post(`/smartlock/${deviceId}/changepassword`, {
                oldPassword,
                newPassword,
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async getLockStatus(deviceId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/smartlock/${deviceId}/status`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async getDoorLogs(deviceId: string, limit = 10): Promise<any> {
        try {
            const response = await apiClient.get(`/smartlock/${deviceId}/logs?limit=${limit}`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },
};

export default smartLockService;
