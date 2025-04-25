import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Link } from 'expo-router';
import RegisterForm from '../../components/auth/RegisterForm';
import SafeAreaWrapper from '../../components/layout/SafeAreaWrapper';
import { Icons } from '@/constants/icons';

export default function RegisterScreen() {
    return (
        <SafeAreaWrapper>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-1 px-6 py-6">
                    <View className="items-center mt-5 mb-10">
                        <Image source={Icons.logo} className="w-20 h-20 mb-3" resizeMode="contain" />
                        <Text className="text-2xl font-bold text-black">SnSHome</Text>
                    </View>

                    <RegisterForm />

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-gray-600">Đã có tài khoản? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-primary font-medium">Đăng nhập</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaWrapper>
    );
}
