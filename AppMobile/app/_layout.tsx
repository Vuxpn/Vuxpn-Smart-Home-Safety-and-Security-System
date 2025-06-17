import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import './global.css';
import { ToastProvider, useToast, registerToast } from '@/components/ui/Toast';

export default function RootLayout() {
    return (
        <ToastProvider>
            <ToastRegistrar />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(main)" />
            </Stack>
        </ToastProvider>
    );
}

// Component nhỏ này đăng ký toast functions toàn cục
const ToastRegistrar = () => {
    const toast = useToast();

    useEffect(() => {
        registerToast(toast);
    }, [toast]);

    return null;
};
