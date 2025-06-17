import apiClient from './apiClient';
import { AxiosError } from 'axios';

const detectionService = {
    async turnOnWarning(deviceId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/detectionwarning/${deviceId}/ondetectwarning`);
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
            const response = await apiClient.post(`/detectionwarning/${deviceId}/offdetectwarning`);
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

    async changeLedTime(deviceId: string, timeout: number): Promise<any> {
        try {
            const response = await apiClient.post(`/detectionwarning/changetimeled/${deviceId}`, {
                timeout: timeout,
            });
            return {
                success: response.status === 200 || response.status === 201,
                data: response.data,
                message: `Đã đặt thời gian đèn thành ${timeout} giây`,
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async changeBuzzerTime(deviceId: string, timeout: number): Promise<any> {
        try {
            const response = await apiClient.post(`/detectionwarning/changetimebuzzer/${deviceId}`, {
                timeout: timeout,
            });
            return {
                success: response.status === 200 || response.status === 201,
                data: response.data,
                message: `Đã đặt thời gian chuông báo thành ${timeout} giây`,
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async changeToSafeMode(deviceId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/detectionwarning/safemode/${deviceId}`);
            return {
                success: response.status === 200 || response.status === 201,
                data: response.data,
                message: 'Đã chuyển sang chế độ an toàn',
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async changeToNormalMode(deviceId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/detectionwarning/normalmode/${deviceId}`);
            return {
                success: response.status === 200 || response.status === 201,
                data: response.data,
                message: 'Đã chuyển sang chế độ bình thường',
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async getDetectionHistory(deviceId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/detectionwarning/images/${deviceId}`);
            return {
                success: response.status === 200,
                data: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async getDetectionImage(imageId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/detection/image/${imageId}`, {
                responseType: 'blob',
            });
            return {
                success: response.status === 200,
                data: response.data,
                url: URL.createObjectURL(response.data),
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },
};

export default detectionService;
