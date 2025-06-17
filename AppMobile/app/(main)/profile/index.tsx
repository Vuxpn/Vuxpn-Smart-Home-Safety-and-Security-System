import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SafeAreaWrapper from '../../../components/layout/SafeAreaWrapper';
import useAuth from '../../../hook/useAuth';

export default function ProfileScreen() {
    const { user, logout, isLoading } = useAuth();

    const handleLogout = () => {
        logout();
    };

    // Danh sách menu
    const menuItems = [
        {
            id: 'notifications',
            title: 'Trung tâm thông báo',
            icon: <Ionicons name="notifications-outline" size={22} color="#e53935" />,
            onPress: () => router.push('/home/notification'),
            showBadge: true,
        },
        {
            id: 'house-management',
            title: 'Quản lý nhà',
            icon: <Ionicons name="home-outline" size={22} color="#e53935" />,
            onPress: () => router.push('/home/manage-house'),
        },
        {
            id: 'devices',
            title: 'Quản lý thiết bị',
            icon: <MaterialCommunityIcons name="devices" size={22} color="#e53935" />,
            onPress: () => router.push('/devices'),
        },
        {
            id: 'payment',
            title: 'Liên kết thanh toán',
            icon: <MaterialCommunityIcons name="credit-card-outline" size={22} color="#e53935" />,
            onPress: () => {},
        },
        {
            id: 'terms',
            title: 'Điều khoản và chính sách',
            icon: <Ionicons name="shield-checkmark-outline" size={22} color="#e53935" />,
            onPress: () => {},
        },
        {
            id: 'version',
            title: 'Phiên bản ứng dụng',
            icon: <AntDesign name="appstore-o" size={22} color="#e53935" />,
            value: '1.1.0',
            hideArrow: true,
        },
        {
            id: 'support',
            title: 'Hỗ trợ',
            icon: <Ionicons name="help-circle-outline" size={22} color="#e53935" />,
            onPress: () => {},
        },
    ];

    return (
        <SafeAreaWrapper>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Gradient header with user info */}
                <LinearGradient colors={['#fff5f5', '#ffffff']} style={styles.header}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={40} color="#e53935" />
                            </View>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.greeting}>Xin chào</Text>
                            <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => router.push('/profile/edit-profile')}
                        >
                            <Feather name="chevron-right" size={24} color="#bbb" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={item.onPress}
                            disabled={!item.onPress}
                        >
                            <View style={styles.menuIconContainer}>{item.icon}</View>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            {item.showBadge && <View style={styles.notificationBadge} />}
                            {item.value ? (
                                <Text style={styles.menuValue}>{item.value}</Text>
                            ) : !item.hideArrow ? (
                                <Feather name="chevron-right" size={22} color="#999" />
                            ) : null}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Survey section */}
                <View style={styles.surveyContainer}>
                    <View style={styles.surveyTextContainer}>
                        <Text style={styles.surveyTitle}>Chia sẻ ý kiến của bạn về dịch vụ SnS Home</Text>
                        <TouchableOpacity style={styles.surveyButton}>
                            <Text style={styles.surveyButtonText}>Tham gia khảo sát</Text>
                        </TouchableOpacity>
                    </View>
                    {/* <Image source={require('../../../assets/images/robot.png')} style={styles.robotImage} /> */}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutContainer} onPress={handleLogout} disabled={isLoading}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="log-out-outline" size={22} color="#e53935" />
                    </View>
                    <Text style={styles.menuTitle}>Đăng xuất</Text>
                    <Feather name="chevron-right" size={22} color="#999" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 16,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 14,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e53935',
    },
    userInfo: {
        flex: 1,
    },
    greeting: {
        fontSize: 16,
        color: '#e53935',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#e53935',
    },
    editButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuTitle: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    menuValue: {
        fontSize: 16,
        color: '#999',
    },
    notificationBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e53935',
        position: 'absolute',
        top: 16,
        right: 42,
    },
    surveyContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        alignItems: 'center',
    },
    surveyTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    surveyTitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 14,
    },
    surveyButton: {
        backgroundColor: '#e53935',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 30,
        alignSelf: 'flex-start',
    },
    surveyButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    robotImage: {
        width: 90,
        height: 90,
        resizeMode: 'contain',
    },
    logoutContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
});
