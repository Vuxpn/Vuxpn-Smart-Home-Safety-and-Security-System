import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SafeAreaWrapper from '../../../components/layout/SafeAreaWrapper';
import useHouse from '../../../hook/useHouse';
import Card from '../../../components/ui/Card';

export default function ManageHouseScreen() {
    const { homes, isLoading, loadHomes, deleteHome } = useHouse();
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadHomes();
    }, []);

    const handleAddHouse = () => {
        router.push('/home/house-form');
    };

    const handleEditHouse = (homeId: string) => {
        router.push({ pathname: '/home/house-form', params: { id: homeId } });
    };

    const handleDeleteHouse = (homeId: string, homeName: string) => {
        Alert.alert('Xác nhận xóa', `Bạn có chắc chắn muốn xóa nhà "${homeName}" không?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setDeleting(homeId);
                        await deleteHome(homeId);
                        Alert.alert('Thành công', 'Đã xóa nhà thành công');
                    } catch (error: any) {
                        Alert.alert('Lỗi', error.message || 'Không thể xóa nhà');
                    } finally {
                        setDeleting(null);
                    }
                },
            },
        ]);
    };

    const renderHouseItem = ({ item }: { item: any }) => (
        <Card className="mb-4 relative overflow-hidden">
            <LinearGradient colors={['#fff5f6', '#ffffff']} style={StyleSheet.absoluteFillObject} />

            <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-full bg-red-50 mr-4 items-center justify-center border border-red-100">
                    <Feather name="home" size={24} color="#f04037" />
                </View>

                <View className="flex-1">
                    <Text className="text-lg font-bold">{item.name}</Text>
                    <View className="flex-row items-center mt-1">
                        <Feather name="map-pin" size={14} color="#666" />
                        <Text className="text-gray-600 ml-1">{item.address}</Text>
                    </View>

                    {item.owner && (
                        <View className="flex-row items-center mt-2">
                            <Feather name="user" size={14} color="#666" />
                            <Text className="text-gray-500 ml-1 text-sm">
                                Chủ sở hữu: {item.owner.name || item.owner.email}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="flex-row">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-2"
                        onPress={() => handleEditHouse(item._id)}
                    >
                        <Feather name="edit-2" size={18} color="#3498db" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
                        onPress={() => handleDeleteHouse(item._id, item.name)}
                        disabled={deleting === item._id}
                    >
                        {deleting === item._id ? (
                            <ActivityIndicator size="small" color="#e74c3c" />
                        ) : (
                            <Feather name="trash-2" size={18} color="#e74c3c" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

    return (
        <SafeAreaWrapper>
            <View className="flex-row items-center mb-6">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
                    onPress={() => router.back()}
                >
                    <Feather name="arrow-left" size={20} color="black" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold">Quản lý nhà</Text>
            </View>

            {/* Header với icon và thống kê */}
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center">
                    <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center border border-red-100">
                        <Feather name="home" size={28} color="#f04037" />
                    </View>
                    <View className="ml-4">
                        <Text className="text-xl font-bold">Ngôi nhà của bạn</Text>
                        <Text className="text-gray-500">{homes.length} ngôi nhà trong danh sách</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                className="flex-row items-center justify-center bg-red-500 rounded-xl py-3 mb-6"
                onPress={handleAddHouse}
            >
                <Feather name="plus" size={18} color="white" />
                <Text className="text-white font-medium ml-2">Thêm nhà mới</Text>
            </TouchableOpacity>

            {isLoading && homes.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#f04037" />
                    <Text className="mt-4 text-gray-500">Đang tải danh sách nhà...</Text>
                </View>
            ) : homes.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="mt-4 text-gray-700 font-medium text-lg">Bạn chưa có ngôi nhà nào</Text>
                    <Text className="text-gray-500 mt-1 text-center">Hãy thêm ngôi nhà đầu tiên của bạn</Text>
                </View>
            ) : (
                <FlatList
                    data={homes}
                    keyExtractor={(item) => item._id}
                    renderItem={renderHouseItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaWrapper>
    );
}
