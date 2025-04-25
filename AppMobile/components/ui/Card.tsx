import React, { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

interface CardProps {
    title?: string;
    children: ReactNode;
    onPress?: () => void;
    className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, onPress, className = '' }) => {
    const CardComponent = onPress ? Pressable : View;

    return (
        <CardComponent className={`bg-white rounded-xl p-4 shadow-sm mb-4 ${className}`} onPress={onPress}>
            {title && <Text className="text-lg font-bold mb-2">{title}</Text>}
            {children}
        </CardComponent>
    );
};

export default Card;
