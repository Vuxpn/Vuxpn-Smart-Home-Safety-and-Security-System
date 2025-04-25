import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface HomeHeaderProps {
    title: string;
    subtitle?: string;
    showAddButton?: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ title, subtitle, showAddButton = true }) => {
    return (
        <View className="flex-row items-center justify-between mb-6">
            <View>
                <Text className="text-2xl font-bold">{title}</Text>
                {subtitle && <Text className="text-gray-500 mt-1">{subtitle}</Text>}
            </View>

            {showAddButton && (
                <Pressable
                    className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center"
                    onPress={() => router.push('/home/manage-house')}
                >
                    <MaterialIcons name="add" size={24} color="white" />
                </Pressable>
            )}
        </View>
    );
};

export default HomeHeader;
