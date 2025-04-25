import React from 'react';
import { View, Text } from 'react-native';
import SafeAreaWrapper from '../../../components/layout/SafeAreaWrapper';

export default function HomeScreen() {
    return (
        <SafeAreaWrapper>
            <View>
                <Text className="text-2xl font-bold">Trang chủ</Text>
                <Text className="text-gray-500 mt-1">Chào mừng đến với Smart Home Safety</Text>

                <View className="bg-blue-50 p-6 rounded-xl mt-6">
                    <Text className="text-blue-800 font-medium text-lg">Đăng nhập thành công!</Text>
                    <Text className="text-blue-600 mt-2">
                        Bạn đã đăng nhập thành công vào hệ thống. Đây là trang chủ của ứng dụng.
                    </Text>
                </View>
            </View>
        </SafeAreaWrapper>
    );
}
