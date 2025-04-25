import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const BottomTabBar = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#3498db',
                tabBarInactiveTintColor: '#95a5a6',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    height: 60,
                    paddingBottom: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="home/index"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="devices/index"
                options={{
                    title: 'Thiết bị',
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="devices" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile/index"
                options={{
                    title: 'Tài khoản',
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
};

export default BottomTabBar;
