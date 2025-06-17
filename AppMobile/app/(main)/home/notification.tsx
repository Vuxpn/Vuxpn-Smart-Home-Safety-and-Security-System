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
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SafeAreaWrapper from '@/components/layout/SafeAreaWrapper';
import smartLockService from '../../../services/smartLockService';
import detectionService from '../../../services/detectionService';
import useDeviceStore from '../../../store/deviceStore';

const { width } = Dimensions.get('window');

function NotificationScreen() {
    const [activeTab, setActiveTab] = useState('camera');
    const [detectionHistory, setDetectionHistory] = useState([]);
    const [doorLogs, setDoorLogs] = useState([]);
    const [isLoadingDetectionHistory, setIsLoadingDetectionHistory] = useState(false);
    const [isLoadingDoorLogs, setIsLoadingDoorLogs] = useState(false);

    // Filter states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateFilterMode, setDateFilterMode] = useState('all'); // 'all' or 'specific'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDeviceFilter, setShowDeviceFilter] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [availableDevices, setAvailableDevices] = useState([]);

    const { deviceId, filter } = useLocalSearchParams();
    const { devices } = useDeviceStore();

    useEffect(() => {
        // Set active tab dựa trên filter
        if (filter === 'camera') {
            setActiveTab('camera');
        } else if (filter === 'smartHome') {
            setActiveTab('smartHome');
        }
    }, [filter]);

    useEffect(() => {
        // Load available devices based on active tab
        if (activeTab === 'camera') {
            const cameraDevices = devices.filter((device) => device.type === 'Security Camera');
            setAvailableDevices(cameraDevices);
            loadDetectionHistory();
        } else if (activeTab === 'smartHome') {
            const lockDevices = devices.filter((device) => device.type === 'SmartLock');
            setAvailableDevices(lockDevices);
            loadDoorLogs();
        }
    }, [activeTab, devices, dateFilterMode, selectedDate, selectedDevice]);

    const loadDetectionHistory = async () => {
        try {
            setIsLoadingDetectionHistory(true);
            const cameraDevices = devices.filter((device) => device.type === 'Security Camera');
            const devicesToLoad = selectedDevice ? [selectedDevice] : cameraDevices;

            const allDetections = [];

            for (const device of devicesToLoad) {
                try {
                    const response = await detectionService.getDetectionHistory(device.deviceId);
                    if (response.success && response.data) {
                        const deviceDetections = response.data
                            .filter((item) => {
                                // Filter by date if specific date mode is selected
                                if (dateFilterMode === 'specific') {
                                    const itemDate = new Date(item.createdAt);
                                    const filterDate = new Date(selectedDate);
                                    return itemDate.toDateString() === filterDate.toDateString();
                                }
                                // If mode is 'all', don't filter by date
                                return true;
                            })
                            .map((item: any) => ({
                                id: item._id || `${device.deviceId}-${item.createdAt}`,
                                title: 'Phát hiện chuyển động',
                                message: `Thiết bị: ${device.name}`,
                                type: 'camera',
                                isRead: true,
                                createdAt: item.createdAt,
                                imageUrl: item.url,
                                deviceId: device.deviceId,
                                deviceName: device.name,
                                time: new Date(item.createdAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                }),
                            }));
                        allDetections.push(...deviceDetections);
                    }
                } catch (error) {
                    console.error(`Error loading detection history for device ${device.deviceId}:`, error);
                }
            }

            // Sắp xếp theo thời gian mới nhất
            allDetections.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setDetectionHistory(allDetections);
        } catch (error) {
            console.error('Error loading detection history:', error);
        } finally {
            setIsLoadingDetectionHistory(false);
        }
    };

    const loadDoorLogs = async () => {
        try {
            setIsLoadingDoorLogs(true);
            const lockDevices = devices.filter((device) => device.type === 'SmartLock');
            const devicesToLoad = selectedDevice ? [selectedDevice] : lockDevices;

            const allLogs = [];

            for (const device of devicesToLoad) {
                try {
                    const response = await smartLockService.getDoorLogs(device.deviceId, 50);
                    if (response.success && response.data) {
                        const deviceLogs = response.data
                            .filter((log) => {
                                // Filter by date if specific date mode is selected
                                if (dateFilterMode === 'specific') {
                                    const logDate = new Date(log.timestamp);
                                    const filterDate = new Date(selectedDate);
                                    return logDate.toDateString() === filterDate.toDateString();
                                }
                                // If mode is 'all', don't filter by date
                                return true;
                            })
                            .map((log: any) => ({
                                id: log._id || `${device.deviceId}-${log.timestamp}`,
                                title:
                                    log.event === 'door_opened'
                                        ? 'Mở cửa thành công'
                                        : log.event === 'door_locked'
                                        ? 'Đã khóa cửa'
                                        : log.event,
                                message: `Thiết bị: ${device.name} - ${log.status}`,
                                type: 'smartHome',
                                isRead: true,
                                createdAt: log.timestamp,
                                deviceId: device.deviceId,
                                deviceName: device.name,
                                time: new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                }),
                            }));
                        allLogs.push(...deviceLogs);
                    }
                } catch (error) {
                    console.error(`Error loading door logs for device ${device.deviceId}:`, error);
                }
            }

            // Sắp xếp theo thời gian mới nhất
            allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setDoorLogs(allLogs);
        } catch (error) {
            console.error('Error loading door logs:', error);
        } finally {
            setIsLoadingDoorLogs(false);
        }
    };

    const resetFilters = () => {
        setDateFilterMode('all');
        setSelectedDate(new Date());
        setSelectedDevice(null);
    };

    const getDateDisplayText = () => {
        if (dateFilterMode === 'all') {
            return 'Tất cả';
        } else {
            return selectedDate.toLocaleDateString('vi-VN');
        }
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name={activeTab === 'camera' ? 'camera-outline' : 'lock-closed-outline'}
                size={50}
                color="#d1d1d1"
            />
            <Text style={styles.emptyText}>
                {activeTab === 'camera' ? 'Không có hình ảnh phát hiện nào' : 'Không có lịch sử mở cửa'}
            </Text>
            <Text style={styles.emptySubText}>
                {dateFilterMode === 'specific'
                    ? 'Không có dữ liệu cho ngày đã chọn'
                    : 'Thử thay đổi bộ lọc để xem thêm dữ liệu'}
            </Text>
        </View>
    );

    const renderDetectionItem = ({ item, index }) => (
        <View style={styles.detectionItem}>
            <View style={styles.timeContainer}>
                <View style={styles.timeWrapper}>
                    <Ionicons name="time-outline" size={12} color="#e53935" />
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={styles.timeLine}>
                    <View style={styles.timelineDot} />
                    {index < (activeTab === 'camera' ? detectionHistory : doorLogs).length - 1 && (
                        <View style={styles.timelineLine} />
                    )}
                </View>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.contentHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={activeTab === 'camera' ? 'videocam' : 'lock-closed'}
                            size={16}
                            color={activeTab === 'camera' ? '#e53935' : '#2196F3'}
                        />
                    </View>
                    <Text style={styles.detectionTitle}>{item.title}</Text>
                </View>

                {activeTab === 'camera' && item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.detectionImage} resizeMode="cover" />
                )}

                <Text style={styles.detectionMessage}>{item.message}</Text>

                {/* Hiển thị ngày nếu đang ở chế độ "Tất cả" */}
                {dateFilterMode === 'all' && (
                    <Text style={styles.detectionDate}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                    </Text>
                )}
            </View>
        </View>
    );

    // Custom Date Picker Component with modes
    const renderDatePicker = () => {
        const generateCalendarDates = () => {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            // Get first day of current month
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);

            const dates = [];
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const date = new Date(currentYear, currentMonth, day);
                if (date <= today) {
                    // Only show dates up to today
                    dates.push(date);
                }
            }

            return dates.reverse(); // Show newest dates first
        };

        return (
            <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn thời gian</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.dateList}>
                            {/* Option: All dates */}
                            <TouchableOpacity
                                style={[styles.dateItem, dateFilterMode === 'all' && styles.selectedDateItem]}
                                onPress={() => {
                                    setDateFilterMode('all');
                                    setShowDatePicker(false);
                                }}
                            >
                                <View style={styles.dateItemContent}>
                                    <Ionicons
                                        name="infinite"
                                        size={20}
                                        color={dateFilterMode === 'all' ? '#e53935' : '#666'}
                                    />
                                    <Text
                                        style={[
                                            styles.dateItemText,
                                            dateFilterMode === 'all' && styles.selectedDateText,
                                        ]}
                                    >
                                        Tất cả thời gian
                                    </Text>
                                </View>
                                {dateFilterMode === 'all' && <Ionicons name="checkmark" size={20} color="#e53935" />}
                            </TouchableOpacity>

                            {/* Separator */}
                            <View style={styles.separator}>
                                <Text style={styles.separatorText}>Chọn ngày cụ thể</Text>
                            </View>

                            {/* Calendar dates */}
                            {generateCalendarDates().map((date, index) => {
                                const isSelected =
                                    dateFilterMode === 'specific' &&
                                    selectedDate.toDateString() === date.toDateString();

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.dateItem, isSelected && styles.selectedDateItem]}
                                        onPress={() => {
                                            setDateFilterMode('specific');
                                            setSelectedDate(date);
                                            setShowDatePicker(false);
                                        }}
                                    >
                                        <View style={styles.dateItemContent}>
                                            <Ionicons
                                                name="calendar"
                                                size={20}
                                                color={isSelected ? '#e53935' : '#666'}
                                            />
                                            <View>
                                                <Text
                                                    style={[styles.dateItemText, isSelected && styles.selectedDateText]}
                                                >
                                                    {date.toLocaleDateString('vi-VN', {
                                                        weekday: 'long',
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                    })}
                                                </Text>
                                                {date.toDateString() === new Date().toDateString() && (
                                                    <Text style={styles.todayText}>Hôm nay</Text>
                                                )}
                                            </View>
                                        </View>
                                        {isSelected && <Ionicons name="checkmark" size={20} color="#e53935" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderDeviceFilterModal = () => (
        <Modal
            visible={showDeviceFilter}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDeviceFilter(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chọn thiết bị</Text>
                        <TouchableOpacity onPress={() => setShowDeviceFilter(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.deviceList}>
                        <TouchableOpacity
                            style={[styles.deviceItem, !selectedDevice && styles.selectedDeviceItem]}
                            onPress={() => {
                                setSelectedDevice(null);
                                setShowDeviceFilter(false);
                            }}
                        >
                            <View style={styles.deviceItemContent}>
                                <Ionicons name="apps" size={20} color={!selectedDevice ? '#e53935' : '#666'} />
                                <Text style={[styles.deviceItemText, !selectedDevice && styles.selectedDeviceText]}>
                                    Tất cả thiết bị
                                </Text>
                            </View>
                            {!selectedDevice && <Ionicons name="checkmark" size={20} color="#e53935" />}
                        </TouchableOpacity>

                        {availableDevices.map((device) => {
                            const isSelected = selectedDevice?.deviceId === device.deviceId;
                            return (
                                <TouchableOpacity
                                    key={device.deviceId}
                                    style={[styles.deviceItem, isSelected && styles.selectedDeviceItem]}
                                    onPress={() => {
                                        setSelectedDevice(device);
                                        setShowDeviceFilter(false);
                                    }}
                                >
                                    <View style={styles.deviceItemContent}>
                                        <Ionicons
                                            name={device.type === 'Security Camera' ? 'videocam' : 'lock-closed'}
                                            size={20}
                                            color={isSelected ? '#e53935' : '#666'}
                                        />
                                        <Text style={[styles.deviceItemText, isSelected && styles.selectedDeviceText]}>
                                            {device.name}
                                        </Text>
                                    </View>
                                    {isSelected && <Ionicons name="checkmark" size={20} color="#e53935" />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const currentData = activeTab === 'camera' ? detectionHistory : doorLogs;
    const currentLoading = activeTab === 'camera' ? isLoadingDetectionHistory : isLoadingDoorLogs;

    return (
        <LinearGradient colors={['#f9f9f9', '#ffffff']} style={styles.container}>
            <SafeAreaWrapper>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Feather name="arrow-left" size={20} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lịch sử giám sát</Text>
                    <TouchableOpacity style={styles.filterButton} onPress={resetFilters}>
                        <Feather name="refresh-cw" size={20} color="#e53935" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'camera' && styles.activeTab]}
                        onPress={() => setActiveTab('camera')}
                    >
                        <Ionicons name="videocam" size={20} color={activeTab === 'camera' ? '#e53935' : '#666'} />
                        <Text style={[styles.tabText, activeTab === 'camera' && styles.activeTabText]}>Phát hiện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'smartHome' && styles.activeTab]}
                        onPress={() => setActiveTab('smartHome')}
                    >
                        <Ionicons name="lock-closed" size={20} color={activeTab === 'smartHome' ? '#e53935' : '#666'} />
                        <Text style={[styles.tabText, activeTab === 'smartHome' && styles.activeTabText]}>
                            Khóa cửa
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <TouchableOpacity style={styles.filterItem} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.filterText}>{getDateDisplayText()}</Text>
                        <Ionicons name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.filterItem} onPress={() => setShowDeviceFilter(true)}>
                        <Ionicons name="hardware-chip-outline" size={16} color="#666" />
                        <Text style={styles.filterText}>
                            {selectedDevice ? selectedDevice.name : 'Tất cả thiết bị'}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {currentLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#e53935" />
                            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                        </View>
                    ) : currentData.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        <FlatList
                            data={currentData}
                            keyExtractor={(item) => item.id}
                            renderItem={renderDetectionItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContainer}
                            onRefresh={() => {
                                if (activeTab === 'camera') {
                                    loadDetectionHistory();
                                } else {
                                    loadDoorLogs();
                                }
                            }}
                            refreshing={currentLoading}
                        />
                    )}
                </View>

                {/* Custom Date Picker */}
                {renderDatePicker()}

                {/* Device Filter Modal */}
                {renderDeviceFilterModal()}
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
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#fff5f5',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: '#e53935',
        fontWeight: 'bold',
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    filterItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        gap: 8,
    },
    filterText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    emptySubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
    listContainer: {
        paddingVertical: 16,
    },
    detectionItem: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    timeContainer: {
        alignItems: 'center',
        marginRight: 16,
    },
    timeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff5f5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    timeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#e53935',
    },
    timeLine: {
        alignItems: 'center',
        marginTop: 8,
    },
    timelineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e53935',
    },
    timelineLine: {
        width: 2,
        height: 40,
        backgroundColor: '#f0f0f0',
        marginTop: 4,
    },
    contentContainer: {
        flex: 1,
    },
    contentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    detectionImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginVertical: 8,
    },
    detectionMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    detectionDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    deviceList: {
        maxHeight: 300,
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    deviceItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectedDeviceItem: {
        backgroundColor: '#fff5f5',
    },
    deviceItemText: {
        fontSize: 16,
        color: '#333',
    },
    selectedDeviceText: {
        color: '#e53935',
        fontWeight: '500',
    },
    dateList: {
        maxHeight: 400,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    dateItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectedDateItem: {
        backgroundColor: '#fff5f5',
    },
    dateItemText: {
        fontSize: 16,
        color: '#333',
    },
    selectedDateText: {
        color: '#e53935',
        fontWeight: '500',
    },
    separator: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    separatorText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    todayText: {
        fontSize: 12,
        color: '#e53935',
        fontWeight: '500',
    },
});

// Export default để fix lỗi missing default export
export default NotificationScreen;
