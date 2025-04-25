import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    disabled?: boolean;
    className?: string;
}

const Button = ({
    title,
    onPress,
    isLoading = false,
    variant = 'primary',
    disabled = false,
    className = '',
}: ButtonProps) => {
    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return 'bg-primary';
            case 'secondary':
                return 'bg-gray-500';
            case 'outline':
                return 'bg-transparent border border-blue-500';
            case 'danger':
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    };

    const getTextStyle = () => {
        return variant === 'outline' ? 'text-blue-500' : 'text-black';
    };

    return (
        <TouchableOpacity
            className={`${getButtonStyle()} rounded-xl py-3 px-4 items-center ${
                disabled || isLoading ? 'opacity-50' : 'opacity-100'
            } ${className}`}
            onPress={onPress}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' ? '#3498db' : 'white'} />
            ) : (
                <Text className={`font-medium text-base  ${getTextStyle()}`}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;
