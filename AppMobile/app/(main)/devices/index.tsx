import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import SafeAreaWrapper from '../../../components/layout/SafeAreaWrapper';
import DeviceList from '../../../components/devices/DeviceList';
import useDeviceStore from '../../../store/deviceStore';
import useHomeStore from '../../../store/houseStore';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import HomeHeader from '../../../components/home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { showToast } from '../../../components/ui/Toast';

export default function DevicesScreen() {
    const { devices, isLoading, error, getDevices } = useDeviceStore();
    const { currentHome, homes, setCurrentHome } = useHomeStore();

    useEffect(() => {
        if (currentHome) {
            loadDevices();
        }
    }, [currentHome]);

    const loadDevices = async () => {
        if (currentHome) {
            try {
                await getDevices(currentHome._id);
            } catch (error) {
                showToast('error', 'Lỗi', 'Không thể tải danh sách thiết bị');
            }
        }
    };

    const handleSelectHome = (home: { _id: string; name: string }) => {
        setCurrentHome(home);
        // Khi chọn nhà mới, tự động fetch lại danh sách thiết bị
        getDevices(home._id);
        showToast('info', 'Đã chuyển nhà', `Đã chuyển sang nhà ${home.name}`);
    };

    if (!currentHome) {
        return (
            <LinearGradient colors={['#ffe0e3', '#fff0f2', '#ffffff']} style={styles.gradientContainer}>
                <SafeAreaWrapper backgroundColor="transparent">
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-lg text-gray-600 mb-4">Bạn chưa có nhà nào</Text>
                        <View className="w-40">
                            <Feather.Button
                                name="home"
                                backgroundColor="#f04037"
                                onPress={() => router.push('/home/house-form')}
                                borderRadius={10}
                            >
                                Tạo nhà mới
                            </Feather.Button>
                        </View>
                    </View>
                </SafeAreaWrapper>
            </LinearGradient>
        );
    }

    if (isLoading && devices.length === 0) {
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
                <View className="flex-1 px-4">
                    <HomeHeader currentHome={currentHome} homes={homes} onSelectHome={handleSelectHome} />

                    {error ? (
                        <View className="bg-red-100 p-4 rounded-xl mb-4">
                            <Text className="text-red-600">{error}</Text>
                        </View>
                    ) : null}

                    <DeviceList
                        devices={devices.filter((device) => device.homeId === currentHome._id)}
                        isLoading={isLoading}
                        onRefresh={getDevices}
                        onAddDevice={() => router.push('/devices/add-device')}
                    />
                </View>
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
