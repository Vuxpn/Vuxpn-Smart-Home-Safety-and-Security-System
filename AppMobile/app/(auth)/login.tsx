import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import LoginForm from '../../components/auth/LoginForm';
import SafeAreaWrapper from '../../components/layout/SafeAreaWrapper';
import { Icons } from '@/constants/icons';

export default function LoginScreen() {
    return (
        <SafeAreaWrapper>
            <View className="flex-1 px-6 py-6">
                {/* Header: Logo + App Name */}
                <View className="items-center mt-10 mb-10">
                    <Image source={Icons.logo} className="w-20 h-20 mb-3" resizeMode="contain" />
                    <Text className="text-2xl font-bold text-black">SnSHome</Text>
                </View>

                {/* Login form */}
                <View className="flex-none mt-10">
                    <LoginForm />
                </View>

                {/* Footer: Đăng ký */}
                <View className="flex-row justify-center mt-10 mb-6">
                    <Text className="text-gray-600">Bạn chưa có tài khoản? </Text>
                    <Link href="/(auth)/register" asChild>
                        <TouchableOpacity>
                            <Text className="text-primary font-semibold underline">Đăng ký</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </SafeAreaWrapper>
    );
}
