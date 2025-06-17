import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Animated,
    Dimensions,
    Pressable,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SafeAreaWrapper from '@/components/layout/SafeAreaWrapper';
import useNotification from '@/hook/useNotification';
import smartLockService from '../../../services/smartLockService';
import markAsRead from '@/hook/useNotification';
import detectionService from '../../../services/detectionService';
const { width } = Dimensions.get('window');

export default function NotificationScreen() {
    const {
        notificationsByType,
        isLoading,
        markAllAsRead,
        deleteNotification,
        deleteMultipleNotifications,
        loadNotifications,
        setNotificationsByType,
    } = useNotification();

    const [activeTab, setActiveTab] = useState('system'); // camera, smartHome, system
    const [longPressMode, setLongPressMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [doorLogs, setDoorLogs] = useState([]);
    const [isLoadingDoorLogs, setIsLoadingDoorLogs] = useState(false);
    const { deviceId, filter } = useLocalSearchParams();

    // Animation
    const slideAnimation = useRef(new Animated.Value(0)).current;
    const tabIndicatorPosition = useRef(new Animated.Value(2)).current; // 0, 1, 2 tương ứng với 3 tabs

    // Trong component NotificationScreen, thêm state để lưu trữ lịch sử phát hiện
    const [detectionImages, setDetectionImages] = useState<{ [key: string]: string }>({});
    const [isLoadingImages, setIsLoadingImages] = useState(false);

    useEffect(() => {
        // Animation khi chuyển tab
        Animated.spring(tabIndicatorPosition, {
            toValue: activeTab === 'camera' ? 0 : activeTab === 'smartHome' ? 1 : 2,
            useNativeDriver: false,
            friction: 8,
            tension: 50,
        }).start();

        // Slide animation cho nội dung
        Animated.timing(slideAnimation, {
            toValue: activeTab === 'camera' ? 0 : activeTab === 'smartHome' ? -width : -width * 2,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [activeTab]);

    useEffect(() => {
        if (deviceId && filter === 'smartHome') {
            loadDoorLogs(deviceId as string);
        }
    }, [deviceId]);

    useEffect(() => {
        if (activeTab === 'camera' && deviceId) {
            loadDetectionHistory(deviceId as string);
        }
    }, [activeTab, deviceId]);

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
        } catch (error) {
            console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
        }
    };

    const handleDeleteSelectedItems = async () => {
        try {
            await deleteMultipleNotifications(selectedItems);
            setLongPressMode(false);
            setSelectedItems([]);
        } catch (error) {
            console.error('Lỗi khi xóa thông báo:', error);
        }
    };

    const toggleSelectItem = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((item) => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleLongPress = (id: string) => {
        setLongPressMode(true);
        toggleSelectItem(id);
    };

    const handleItemPress = (id: string) => {
        if (longPressMode) {
            toggleSelectItem(id);
        } else {
            // Xử lý khi nhấn vào thông báo - đánh dấu đã đọc
            markAsRead(id);
        }
    };

    const renderEmptyNotification = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={50} color="#d1d1d1" />
            <Text style={styles.emptyText}>Không có thông báo</Text>
        </View>
    );

    const renderNotificationItem = ({ item }) => (
        <Pressable
            style={[
                styles.notificationItem,
                selectedItems.includes(item.id) && styles.notificationSelected,
                !item.isRead && styles.notificationUnread,
            ]}
            onPress={() => handleItemPress(item.id)}
            onLongPress={() => handleLongPress(item.id)}
            delayLongPress={2000}
        >
            <View style={styles.notificationIcon}>
                {item.type === 'camera' ? (
                    <Ionicons name="videocam" size={20} color="#e53935" />
                ) : item.type === 'smartHome' ? (
                    <MaterialCommunityIcons name="home-automation" size={20} color="#039be5" />
                ) : (
                    <Ionicons name="settings-sharp" size={20} color="#43a047" />
                )}
            </View>
            <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>
                    {new Date(item.createdAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    })}
                </Text>

                {/* Hiển thị ảnh cho thông báo camera */}
                {item.type === 'camera' && item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.notificationImage} resizeMode="cover" />
                )}
            </View>
            {longPressMode && (
                <View style={[styles.checkbox, selectedItems.includes(item.id) && styles.checkboxSelected]}>
                    {selectedItems.includes(item.id) && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
            )}
            {!item.isRead && !longPressMode && <View style={styles.unreadDot} />}
        </Pressable>
    );

    const indicatorLeft = tabIndicatorPosition.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['0%', '33.33%', '66.66%'],
    });

    const loadDoorLogs = async (deviceId: string) => {
        try {
            setIsLoadingDoorLogs(true);
            const response = await smartLockService.getDoorLogs(deviceId, 20);
            if (response.success && response.data) {
                // Chuyển đổi lịch sử thành định dạng thông báo
                const logsAsNotifications = response.data.map((log: any) => ({
                    id: log._id || `${log.deviceId}-${log.timestamp}`,
                    title:
                        log.event === 'door_opened'
                            ? 'Mở cửa thành công'
                            : log.event === 'door_locked'
                            ? 'Đã khóa cửa'
                            : log.event,
                    message: `Trạng thái: ${log.status}`,
                    type: 'smartHome',
                    isRead: true,
                    createdAt: log.timestamp,
                }));
                setDoorLogs(logsAsNotifications);
                // Nếu có filter, đặt activeTab
                if (filter === 'smartHome') {
                    setActiveTab('smartHome');
                }
            }
        } catch (error) {
            console.error('Error loading door logs:', error);
        } finally {
            setIsLoadingDoorLogs(false);
        }
    };

    const loadDetectionHistory = async (deviceId: string) => {
        try {
            setIsLoadingImages(true);
            const response = await detectionService.getDetectionHistory(deviceId);
            if (response.success && response.data) {
                const history = response.data;

                // Chuyển đổi lịch sử thành định dạng thông báo
                const detectionNotifications = history.map((item: any) => ({
                    id: item._id || `${item.deviceId}-${item.createdAt}`,
                    title: 'Phát hiện chuyển động',
                    message: `Thời gian: ${new Date(item.createdAt).toLocaleString('vi-VN')}`,
                    type: 'camera',
                    isRead: true,
                    createdAt: item.createdAt,
                    imageUrl: item.url,
                }));

                // Cập nhật state thông báo camera
                setNotificationsByType((prev) => ({
                    ...prev,
                    camera: detectionNotifications,
                }));

                // Set filter nếu cần
                if (filter === 'camera') {
                    setActiveTab('camera');
                }
            }
        } catch (error) {
            console.error('Error loading detection history:', error);
        } finally {
            setIsLoadingImages(false);
        }
    };

    const currentNotifications =
        activeTab === 'camera'
            ? notificationsByType.camera
            : activeTab === 'smartHome'
            ? [...notificationsByType.smartHome, ...(deviceId ? doorLogs : [])]
            : notificationsByType.system;

    return (
        <LinearGradient colors={['#f9f9f9', '#ffffff']} style={styles.container}>
            <SafeAreaWrapper>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
                        onPress={() => router.back()}
                    >
                        <Feather name="arrow-left" size={20} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thông báo</Text>
                    {longPressMode ? (
                        <TouchableOpacity style={styles.readAllButton} onPress={handleDeleteSelectedItems}>
                            <Text style={styles.deleteText}>Xóa</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.readAllButton} onPress={handleMarkAllAsRead}>
                            <Text style={styles.readAllText}>Đọc tất cả</Text>
                            <Ionicons name="checkmark-circle" size={18} color="#e53935" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity style={[styles.tab]} onPress={() => setActiveTab('camera')}>
                        <Text style={[styles.tabText, activeTab === 'camera' && styles.activeTabText]}>Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.tab]} onPress={() => setActiveTab('smartHome')}>
                        <Text style={[styles.tabText, activeTab === 'smartHome' && styles.activeTabText]}>
                            Smart home
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.tab]} onPress={() => setActiveTab('system')}>
                        <Text style={[styles.tabText, activeTab === 'system' && styles.activeTabText]}>Hệ thống</Text>
                    </TouchableOpacity>

                    {/* Tab Indicator */}
                    <Animated.View style={[styles.tabIndicator, { left: indicatorLeft }]} />
                </View>

                {longPressMode && (
                    <View style={styles.longPressGuide}>
                        <Text style={styles.guideText}>Giữ 2s để chọn sự kiện muốn xoá</Text>
                    </View>
                )}

                {/* Chỉ hiển thị tab hiện tại thay vì dùng animation */}
                <View style={styles.tabContent}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#e53935" />
                            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
                        </View>
                    ) : currentNotifications.length === 0 ? (
                        renderEmptyNotification()
                    ) : (
                        <FlatList
                            data={currentNotifications}
                            keyExtractor={(item) => item.id}
                            renderItem={renderNotificationItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContainer}
                            onRefresh={loadNotifications}
                            refreshing={isLoading}
                        />
                    )}
                </View>

                {deviceId && filter === 'smartHome' && (
                    <View style={styles.deviceInfoBanner}>
                        <MaterialIcons name="lock" size={18} color="#9C27B0" />
                        <Text style={styles.deviceInfoText}>Lịch sử mở khóa - Thiết bị: {deviceId}</Text>
                    </View>
                )}
            </SafeAreaWrapper>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    readAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readAllText: {
        color: '#e53935',
        fontWeight: '500',
        marginRight: 4,
    },
    deleteText: {
        color: '#e53935',
        fontWeight: '500',
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        position: 'relative',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    tabText: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#e53935',
        fontWeight: 'bold',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: -1,
        width: '33.33%',
        height: 3,
        backgroundColor: '#e53935',
    },
    tabContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#999',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#999',
    },
    longPressGuide: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    guideText: {
        fontSize: 14,
        color: '#666',
    },
    notificationItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationSelected: {
        backgroundColor: '#fff9f9',
        borderColor: '#ffcdd2',
        borderWidth: 1,
    },
    notificationUnread: {
        backgroundColor: '#fef8f8',
    },
    notificationIcon: {
        marginRight: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#e53935',
        marginLeft: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e53935',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    checkboxSelected: {
        backgroundColor: '#e53935',
    },
    deviceInfoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3e5f5',
        padding: 8,
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 8,
    },
    deviceInfoText: {
        marginLeft: 8,
        color: '#9C27B0',
        fontWeight: '500',
    },
    notificationImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginTop: 8,
    },
});
