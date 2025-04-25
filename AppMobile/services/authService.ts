import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

const authService = {
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        await AsyncStorage.setItem('accessToken', response.data.access_token);
        await AsyncStorage.setItem('refreshToken', response.data.refresh_token);
        return response.data;
    },

    async register(data: RegisterData): Promise<any> {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    async logout(): Promise<void> {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        try {
            await apiClient.post('/auth/logout', { refresh_token: refreshToken });
        } catch (error) {
            console.error('Logout API error:', error);
        }
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
    },

    async changePassword(data: ChangePasswordData): Promise<any> {
        const response = await apiClient.patch('/auth/change-password', data);
        return response.data;
    },

    async getProfile(): Promise<any> {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },
};

export default authService;
