import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface InputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    error?: string;
}

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    error,
}: InputProps) => {
    return (
        <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">{label}</Text>
            <TextInput
                className={`border ${error ? 'border-red-500' : 'border-gray-300'} bg-white rounded-xl px-4 py-3`}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
            />
            {error ? <Text className="text-red-500 mt-1 text-sm">{error}</Text> : null}
        </View>
    );
};

export default Input;
