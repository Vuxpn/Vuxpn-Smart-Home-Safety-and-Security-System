// AppMobile/app/(main)/home/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import SafeAreaWrapper from '../../../components/layout/SafeAreaWrapper';
import HomeHeader from '../../../components/home/HomeHeader';
import useHouse from '../../../hook/useHouse';
import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import socketService from '../../../services/socketService';
import useDeviceStore from '../../../store/deviceStore';

export default function HomeScreen() {
    const { homes, currentHome, isLoading, loadHomes, setCurrentHome } = useHouse();
    const { devices } = useDeviceStore();
    const [sensorDeviceId, setSensorDeviceId] = useState<string | undefined>(undefined);

    useEffect(() => {
        loadHomes();
    }, []);

    useEffect(() => {
        if (devices && devices.length > 0) {
            const sensorDevice = devices.find(
                (device) => device.type === 'Atmosphere Sensor' && device.state === 'ACTIVE',
            );

            if (sensorDevice) {
                console.log(`Found sensor device: ${sensorDevice.deviceId}`);
                setSensorDeviceId(sensorDevice.deviceId);
            }
        }
    }, [devices]);

    useEffect(() => {
        return () => {
            if (sensorDeviceId) {
                socketService.unsubscribeFromDevice(sensorDeviceId);
            }
        };
    }, []);

    if (isLoading && homes.length === 0) {
        return (
            <LinearGradient colors={['#ffe0e3', '#fff0f2', '#ffffff']} style={styles.gradientContainer}>
                <SafeAreaWrapper backgroundColor="transparent">
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#f04037" />
                        <Text className="mt-4 text-gray-500">Đang tải dữ liệu...</Text>
                    </View>
                </SafeAreaWrapper>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#ffe0e3', '#fff0f2', '#ffffff']}
            style={styles.gradientContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <SafeAreaWrapper backgroundColor="transparent">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    {/* Header với thông tin nhà */}
                    <HomeHeader
                        currentHome={currentHome}
                        homes={homes}
                        onSelectHome={setCurrentHome}
                        sensorDeviceId={sensorDeviceId}
                    />

                    {/* Phần còn lại của màn hình Home */}
                    <View>
                        {/* Các chức năng dịch vụ */}
                        <View className="bg-white rounded-3xl p-5 mb-6 shadow-md mx-1">
                            <View className="flex-row flex-wrap justify-evenly">
                                {/* Thanh toán cước */}
                                <View className="w-[23%] mb-4 items-center">
                                    <View className="w-14 h-14 bg-red-50 rounded-xl items-center justify-center mb-2 shadow-sm border border-red-100">
                                        <Image
                                            source={{ uri: 'https://img.icons8.com/ios-filled/50/FF6F61/bill.png' }}
                                            className="w-8 h-8"
                                        />
                                    </View>
                                    <Text className="text-center text-sm font-medium">Thanh toán Cước</Text>
                                </View>

                                {/* Thanh toán tự động */}
                                <View className="w-[23%] mb-4 items-center">
                                    <View className="w-14 h-14 bg-red-50 rounded-xl items-center justify-center mb-2 shadow-sm border border-red-100">
                                        <Image
                                            source={{
                                                uri: 'https://img.icons8.com/ios-filled/50/FF6F61/automatic.png',
                                            }}
                                            className="w-8 h-8"
                                        />
                                    </View>
                                    <Text className="text-center text-sm font-medium">Thanh toán Tự động</Text>
                                </View>

                                {/* Dịch vụ Camera */}
                                <View className="w-[23%] mb-4 items-center">
                                    <View className="w-14 h-14 bg-red-50 rounded-xl items-center justify-center mb-2 shadow-sm border border-red-100">
                                        <Image
                                            source={{ uri: 'https://img.icons8.com/ios-filled/50/FF6F61/camera.png' }}
                                            className="w-8 h-8"
                                        />
                                    </View>
                                    <Text className="text-center text-sm font-medium">Dịch vụ Camera</Text>
                                </View>

                                {/* Báo hỏng, khiếu nại */}
                                <View className="w-[23%] mb-4 items-center">
                                    <View className="w-14 h-14 bg-red-50 rounded-xl items-center justify-center mb-2 shadow-sm border border-red-100">
                                        <Image
                                            source={{ uri: 'https://img.icons8.com/ios-filled/50/FF6F61/error.png' }}
                                            className="w-8 h-8"
                                        />
                                    </View>
                                    <Text className="text-center text-sm font-medium">Báo hỏng, khiếu nại</Text>
                                </View>
                            </View>
                        </View>

                        {/* Camera section */}
                        <View className="px-1">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold">Camera</Text>
                                <Text className="text-red-500 font-medium">Xem nhiều màn hình</Text>
                            </View>
                            <View className="bg-white rounded-3xl overflow-hidden shadow-md mb-6">
                                <View className="h-52 relative">
                                    <Image
                                        source={require('@/assets/images/camera.png')}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                        }}
                                        resizeMode="cover"
                                    />
                                    <View className="absolute top-4 left-4 bg-red-500 rounded-full px-3 py-1 flex-row items-center z-10">
                                        <Text className="text-white">Chia sẻ</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="font-bold">Phòng Khách</Text>
                                    <View className="flex-row items-center mt-1">
                                        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                        <Text className="text-green-500">Trực tuyến</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Thiết bị section */}
                        <View className="px-1">
                            <Text className="text-lg font-bold mb-4">Nhóm thiết bị</Text>
                            <View className="bg-white rounded-3xl p-5 shadow-md mb-4">
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mr-3">
                                            <Image
                                                source={{
                                                    uri: 'https://img.icons8.com/ios-filled/50/FF6F61/shield-checked.png',
                                                }}
                                                className="w-7 h-7"
                                            />
                                        </View>
                                        <View>
                                            <Text className="font-semibold">an toàn</Text>
                                            <Text className="text-gray-500">{currentHome?.name || 'Nhà của tôi'}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row">
                                        <View className="bg-gray-200 rounded-full px-5 py-2 mr-2">
                                            <Text className="font-medium">Bật</Text>
                                        </View>
                                        <View className="bg-red-500 rounded-full px-5 py-2">
                                            <Text className="text-white font-medium">Tắt</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="bg-white rounded-3xl p-5 shadow-md mb-6">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 rounded-full bg-yellow-100 items-center justify-center mr-3">
                                            <Image
                                                source={{ uri: 'https://img.icons8.com/ios-filled/50/FFC107/sun.png' }}
                                                className="w-7 h-7"
                                            />
                                        </View>
                                        <Text className="text-gray-700 font-medium">Độ sáng nhóm đèn</Text>
                                    </View>

                                    <Text className="font-bold text-lg">100%</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaWrapper>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});
