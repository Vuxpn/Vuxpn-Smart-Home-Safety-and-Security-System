import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/authStore';

export default function useAuth() {
    const { user, isAuthenticated, isLoading, error, login, register, logout, getProfile } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                await getProfile();
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    };

    const loginWithRedirect = async (email: string, password: string) => {
        try {
            await login({ email, password });
            router.replace('/(main)/home');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const registerWithRedirect = async (name: string, email: string, password: string) => {
        try {
            await register({ name, email, password });
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    const logoutWithRedirect = async () => {
        try {
            await logout();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login: loginWithRedirect,
        register: registerWithRedirect,
        logout: logoutWithRedirect,
    };
}
