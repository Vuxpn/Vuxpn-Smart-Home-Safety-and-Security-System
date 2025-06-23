import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

//const API_URL = 'http://192.168.1.44:3001';
//const API_URL = 'http://127.0.0.1:3001';
export const API_URL = 'http://192.168.151.167:3001';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để tự động gắn token vào header
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Thêm interceptor để xử lý refresh token khi token hết hạn
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa thử refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // Nếu không có refresh token, logout
                    await AsyncStorage.removeItem('accessToken');
                    return Promise.reject(error);
                }

                // Gọi API để lấy token mới
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                // Lưu token mới
                await AsyncStorage.setItem('accessToken', response.data.access_token);

                // Gắn token mới vào request cũ và thử lại
                originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Nếu refresh token thất bại, logout
                await AsyncStorage.removeItem('accessToken');
                await AsyncStorage.removeItem('refreshToken');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

export default apiClient;
