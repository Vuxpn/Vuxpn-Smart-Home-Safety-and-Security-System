import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SafeAreaWrapper from '../../components/layout/SafeAreaWrapper';
import { Icons } from '@/constants/icons';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const validateEmail = () => {
        if (!email.trim()) {
            setEmailError('Email không được để trống');
            return false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError('Email không hợp lệ');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleSubmit = () => {
        if (validateEmail()) {
            setIsLoading(true);

            // Mô phỏng gửi yêu cầu API
            setTimeout(() => {
                setIsLoading(false);
                setIsSent(true);
            }, 1500);

            // Gọi API khi sẵn sàng:
            // authService.forgotPassword(email)
            //   .then(() => setIsSent(true))
            //   .catch(err => console.error(err))
            //   .finally(() => setIsLoading(false));
        }
    };

    return (
        <SafeAreaWrapper>
            <View className="flex-1 px-6 py-6">
                <TouchableOpacity onPress={() => router.back()} className="absolute top-6 left-2">
                    <Text className="text-primary underline">Quay lại</Text>
                </TouchableOpacity>

                <View className="items-center mb-8">
                    <View className="items-center mt-10 mb-10">
                        <Image source={Icons.logo} className="w-20 h-20 mb-3" resizeMode="contain" />
                        <Text className="text-2xl font-bold text-black">SnSHome</Text>
                    </View>
                </View>

                {isSent ? (
                    <View className="bg-green-100 p-4 rounded-xl mb-4">
                        <Text className="text-green-700 text-center">
                            Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn
                        </Text>
                    </View>
                ) : (
                    <>
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setEmailError('');
                            }}
                            placeholder="Nhập email của bạn"
                            keyboardType="email-address"
                            error={emailError}
                        />

                        <Button title="Gửi yêu cầu" onPress={handleSubmit} isLoading={isLoading} className="mt-4" />
                    </>
                )}

                {isSent && (
                    <Button
                        title="Quay lại đăng nhập"
                        onPress={() => router.push('/(auth)/login')}
                        variant="outline"
                        className="mt-4"
                    />
                )}
            </View>
        </SafeAreaWrapper>
    );
}
