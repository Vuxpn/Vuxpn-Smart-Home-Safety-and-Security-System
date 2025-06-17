import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Device } from '../../interfaces/device.interface';
import DeviceCard from './DeviceCard';
import { Feather } from '@expo/vector-icons';

interface DeviceListProps {
    devices: Device[];
    isLoading: boolean;
    onRefresh: () => void;
    onAddDevice: () => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, isLoading, onRefresh, onAddDevice }) => {
    if (devices.length === 0) {
        return (
            <View className="flex-1 items-center justify-center">
                <View className="bg-gray-100 p-8 rounded-xl items-center w-full">
                    <Feather name="box" size={50} color="#9e9e9e" />
                    <Text className="text-gray-600 mt-4 text-lg font-medium">Chưa có thiết bị nào</Text>
                    <TouchableOpacity
                        onPress={onAddDevice}
                        className="mt-4 bg-primary py-3 px-6 rounded-xl flex-row items-center"
                    >
                        <Feather name="plus" size={18} color="white" />
                        <Text className="text-white font-medium ml-2">Thêm thiết bị</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <TouchableOpacity
                onPress={onAddDevice}
                className="absolute bottom-4 right-4 z-10 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
                style={{ elevation: 5 }}
            >
                <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>

            <FlatList
                data={devices}
                keyExtractor={(item) => item.deviceId}
                renderItem={({ item }) => <DeviceCard device={item} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: 80 }}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={['#f04037']} />}
            />
        </View>
    );
};

export default DeviceList;
