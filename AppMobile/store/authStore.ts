import { create } from 'zustand';
import authService, { LoginData, RegisterData, ChangePasswordData } from '../services/authService';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (data: ChangePasswordData) => Promise<void>;
    getProfile: () => Promise<void>;
    clearError: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (data: LoginData) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authService.login(data);
            set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Đăng nhập thất bại',
            });
            throw error;
        }
    },

    register: async (data: RegisterData) => {
        try {
            set({ isLoading: true, error: null });
            await authService.register(data);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Đăng ký thất bại',
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true });
            await authService.logout();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    changePassword: async (data: ChangePasswordData) => {
        try {
            set({ isLoading: true, error: null });
            await authService.changePassword(data);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Thay đổi mật khẩu thất bại',
            });
            throw error;
        }
    },

    getProfile: async () => {
        try {
            set({ isLoading: true, error: null });
            const userData = await authService.getProfile();
            set({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                isAuthenticated: false,
                error: error.response?.data?.message || 'Lấy thông tin người dùng thất bại',
            });
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
