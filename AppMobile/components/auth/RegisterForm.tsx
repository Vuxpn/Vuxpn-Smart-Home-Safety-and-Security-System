import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useAuth from '../../hook/useAuth';

const RegisterForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const { register, isLoading, error: authError } = useAuth();

    const validateForm = () => {
        let isValid = true;

        // Validate name
        if (!name.trim()) {
            setNameError('Họ tên không được để trống');
            isValid = false;
        } else {
            setNameError('');
        }

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
        } else if (password.length < 6) {
            setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
            isValid = false;
        } else {
            setPasswordError('');
        }

        // Validate confirm password
        if (password !== confirmPassword) {
            setConfirmPasswordError('Mật khẩu xác nhận không khớp');
            isValid = false;
        } else {
            setConfirmPasswordError('');
        }

        return isValid;
    };

    const handleRegister = () => {
        if (validateForm()) {
            register(name, email, password);
        }
    };

    return (
        <View>
            {authError ? (
                <View className="bg-red-100 p-3 rounded-xl mb-4">
                    <Text className="text-red-500">{authError}</Text>
                </View>
            ) : null}

            <Input
                label="Họ tên"
                value={name}
                onChangeText={(text) => {
                    setName(text);
                    setNameError('');
                }}
                placeholder="Nhập họ tên của bạn"
                error={nameError}
            />

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

            <Input
                label="Xác nhận mật khẩu"
                value={confirmPassword}
                onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
                }}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry
                error={confirmPasswordError}
            />

            <Button title="Đăng ký" onPress={handleRegister} isLoading={isLoading} className="mt-4" />
        </View>
    );
};

export default RegisterForm;
