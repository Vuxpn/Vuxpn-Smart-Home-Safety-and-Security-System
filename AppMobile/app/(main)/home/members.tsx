import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeAreaWrapper from '../../../components/layout/SafeAreaWrapper';
import useHouse from '../../../hook/useHouse';
import Card from '../../../components/ui/Card';

export default function MembersScreen() {
    const { currentHome, isLoading, addMemberByEmail, removeMember } = useHouse();
    const [email, setEmail] = useState('');
    const [addingMember, setAddingMember] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

    if (!currentHome) {
        return (
            <SafeAreaWrapper>
                <View className="flex-1 justify-center items-center">
                    <Text>Không có thông tin nhà</Text>
                    <TouchableOpacity className="mt-4 bg-red-500 px-4 py-2 rounded-lg" onPress={() => router.back()}>
                        <Text className="text-white">Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaWrapper>
        );
    }

    const handleAddMember = async () => {
        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email thành viên');
            return;
        }

        try {
            setAddingMember(true);
            await addMemberByEmail(currentHome._id, email);
            setEmail('');
            Alert.alert('Thành công', 'Đã thêm thành viên vào nhà');
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể thêm thành viên');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = (memberId: string, memberName: string) => {
        Alert.alert('Xác nhận xóa', `Bạn có chắc chắn muốn xóa thành viên "${memberName}" khỏi nhà này?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setRemovingMemberId(memberId);
                        await removeMember(currentHome._id, memberId);
                        Alert.alert('Thành công', 'Đã xóa thành viên khỏi nhà');
                    } catch (error: any) {
                        Alert.alert('Lỗi', error.message || 'Không thể xóa thành viên');
                    } finally {
                        setRemovingMemberId(null);
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaWrapper>
            <View className="flex-row items-center mb-6">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
                    onPress={() => router.back()}
                >
                    <Feather name="arrow-left" size={20} color="black" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold">Quản lý thành viên</Text>
            </View>

            {/* Header với icon và thống kê */}
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center">
                    <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center border border-red-100">
                        <Feather name="users" size={28} color="#f04037" />
                    </View>
                    <View className="ml-4">
                        <Text className="text-xl font-bold">{currentHome.name}</Text>
                        <Text className="text-gray-500">{currentHome.members?.length || 0} thành viên trong nhà</Text>
                    </View>
                </View>
            </View>

            {/* Form thêm thành viên */}
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold mb-3">Thêm thành viên mới</Text>
                <View className="flex-row items-center">
                    <TextInput
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2 mr-2"
                        placeholder="Nhập email thành viên"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        className="bg-red-500 h-10 w-10 rounded-full items-center justify-center"
                        onPress={handleAddMember}
                        disabled={addingMember}
                    >
                        {addingMember ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <AntDesign name="plus" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
                <Text className="text-primary text-sm mt-2">* Người dùng phải đã đăng ký tài khoản trên hệ thống</Text>
            </View>

            <Text className="text-lg font-semibold mb-3">Danh sách thành viên</Text>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#f04037" />
                    <Text className="mt-4 text-gray-500">Đang tải danh sách thành viên...</Text>
                </View>
            ) : currentHome.members?.length === 0 ? (
                <View className="bg-white rounded-xl p-5 items-center">
                    <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-2">
                        <Feather name="users" size={24} color="#95a5a6" />
                    </View>
                    <Text className="text-gray-700 font-medium text-lg">Chưa có thành viên nào</Text>
                    <Text className="text-gray-500 text-center mt-1">Thêm thành viên để chia sẻ quyền quản lý nhà</Text>
                </View>
            ) : (
                <FlatList
                    data={currentHome.members}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <Card className="mb-4">
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-3 border border-blue-100">
                                    <Text className="text-lg font-bold text-blue-500">
                                        {(item.name || item.email).charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-bold">{item.name || '-'}</Text>
                                    <Text className="text-gray-500">{item.email}</Text>
                                </View>
                                <TouchableOpacity
                                    className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
                                    onPress={() => handleRemoveMember(item._id, item.name || item.email)}
                                    disabled={removingMemberId === item._id}
                                >
                                    {removingMemberId === item._id ? (
                                        <ActivityIndicator size="small" color="#e74c3c" />
                                    ) : (
                                        <Feather name="trash-2" size={18} color="#e74c3c" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </Card>
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View className="items-center py-4">
                            <Text className="text-gray-400">Chưa có thành viên nào</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaWrapper>
    );
}
