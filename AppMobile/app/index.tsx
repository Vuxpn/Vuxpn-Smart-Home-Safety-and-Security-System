import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            setIsAuthenticated(!!token);
        } catch (error) {
            console.error('Lỗi kiểm tra xác thực:', error);
            setIsAuthenticated(false);
        }
    };

    if (isAuthenticated === null) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(main)/home" />;
    }

    return <Redirect href="/(auth)/login" />;
}
