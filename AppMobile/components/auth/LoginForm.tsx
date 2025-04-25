import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useAuth from '../../hook/useAuth';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const { login, isLoading, error: authError } = useAuth();
    const [rememberAccount, setRememberAccount] = useState(false);

    const validateForm = () => {
        let isValid = true;

        // Validate email
        if (!email.trim()) {
            setEmailError('Email không được để trống');
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError('Email không hợp lệ');
            isValid = false;
        } else {
            setEmailError('');
        }

        // Validate password
        if (!password) {
            setPasswordError('Mật khẩu không được để trống');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };

    const handleLogin = () => {
        if (validateForm()) {
            login(email, password);
        }
    };

    const handleForgotPassword = () => {
        router.push('/(auth)/forgot-password');
    };

    return (
        <View>
            {authError ? (
                <View className="bg-red-100 p-3 rounded-xl mb-4">
                    <Text className="text-red-500">{authError}</Text>
                </View>
            ) : null}

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

            <Input
                label="Mật khẩu"
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                }}
                placeholder="Nhập mật khẩu"
                secureTextEntry
                error={passwordError}
            />

            <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                    onPress={() => setRememberAccount(!rememberAccount)}
                    className="flex-row items-center"
                >
                    <View
                        className={`w-5 h-5 border border-gray-400 mr-2 ${rememberAccount ? 'bg-primary' : 'bg-white'}`}
                    >
                        {rememberAccount && <Text className="text-white text-xs text-center">✓</Text>}
                    </View>
                    <Text className="text-gray-700">Ghi nhớ tài khoản</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                    <Text className="text-primary font-semibold underline">Quên mật khẩu?</Text>
                </TouchableOpacity>
            </View>
            <Button title="Đăng nhập" onPress={handleLogin} isLoading={isLoading} />
        </View>
    );
};

export default LoginForm;
