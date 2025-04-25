import React, { ReactNode } from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';

interface SafeAreaWrapperProps {
    children: ReactNode;
    backgroundColor?: string;
}

const SafeAreaWrapper = ({ children, backgroundColor = 'transparent' }: SafeAreaWrapperProps) => {
    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor }}>
            <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
            <View className="flex-1 px-4 py-4">{children}</View>
        </SafeAreaView>
    );
};

export default SafeAreaWrapper;
