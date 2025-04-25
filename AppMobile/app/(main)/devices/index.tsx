import React from 'react';
import { View, Text } from 'react-native';
import SafeAreaWrapper from '../../../components/layout/SafeAreaWrapper';

export default function DevicesScreen() {
    return (
        <SafeAreaWrapper>
            <View>
                <Text className="text-2xl font-bold">Thiết bị</Text>
                <Text className="text-gray-500 mt-1">Quản lý thiết bị thông minh</Text>

                <View className="bg-gray-100 p-6 rounded-xl mt-6 items-center">
                    <Text className="text-gray-600">Chưa có thiết bị nào</Text>
                </View>
            </View>
        </SafeAreaWrapper>
    );
}
