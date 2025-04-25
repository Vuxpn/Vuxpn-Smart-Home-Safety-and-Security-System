import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import SafeAreaWrapper from '../../../components/layout/SafeAreaWrapper';
import Button from '../../../components/ui/Button';
import useAuth from '../../../hook/useAuth';

export default function ProfileScreen() {
    const { user, logout, isLoading } = useAuth();

    return (
        <SafeAreaWrapper>
            <View className="flex-1">
                <Text className="text-2xl font-bold">Tài khoản</Text>
                <Text className="text-gray-500 mt-1">Thông tin cá nhân</Text>

                <View className="bg-white shadow-sm rounded-xl p-6 mt-6">
                    <Text className="text-lg font-bold">{user?.name || 'Người dùng'}</Text>
                    <Text className="text-gray-600 mt-1">{user?.email || 'user@example.com'}</Text>
                </View>

                <View className="mt-auto mb-6">
                    <Button title="Đăng xuất" onPress={logout} isLoading={isLoading} variant="danger" />
                </View>
            </View>
        </SafeAreaWrapper>
    );
}
