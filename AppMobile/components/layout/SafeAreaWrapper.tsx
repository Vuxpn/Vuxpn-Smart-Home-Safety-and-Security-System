import React, { ReactNode } from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';

interface SafeAreaWrapperProps {
    children: ReactNode;
}

const SafeAreaWrapper = ({ children }: SafeAreaWrapperProps) => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <View className="flex-1 px-4 py-4">{children}</View>
        </SafeAreaView>
    );
};

export default SafeAreaWrapper;
