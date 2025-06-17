import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import SafeAreaWrapper from '../../../components/layout/SafeAreaWrapper';
import { useLocalSearchParams, router } from 'expo-router';
import useDeviceStore from '../../../store/deviceStore';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Device } from '../../../interfaces/device.interface';
import { showToast } from '../../../components/ui/Toast';
import SmartLockControls from '../../../components/devices/SmartLock/SmartLockControls';
import smartLockService from '../../../services/smartLockService';

export default function DeviceDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getDeviceById, currentDevice, isLoading } = useDeviceStore();
    const [device, setDevice] = useState<Device | null>(null);
    const [doorLogs, setDoorLogs] = useState([]);
    const [isLoadingDoorLogs, setIsLoadingDoorLogs] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    useEffect(() => {
        if (id) {
            loadDevice();
        }
    }, [id]);

    useEffect(() => {
        if (currentDevice) {
            setDevice(currentDevice);
        }
    }, [currentDevice]);

    useEffect(() => {
        if (device?.type === 'Smart Lock') {
            loadDoorLogs();
        }
    }, [device]);

    const loadDevice = async () => {
        try {
            await getDeviceById(id as string);
        } catch (error) {
            showToast('error', 'Lỗi', 'Không thể tải thông tin thiết bị');
            router.back();
        }
    };

    const loadDoorLogs = async () => {
        if (!device) return;

        try {
            setIsLoadingDoorLogs(true);
            const response = await smartLockService.getDoorLogs(device.deviceId, 5);
            if (response.success && response.data) {
                setDoorLogs(response.data);
            }
        } catch (error) {
            console.error('Error loading door logs:', error);
        } finally {
            setIsLoadingDoorLogs(false);
        }
    };

    const getDeviceIcon = () => {
        if (!device) return <Feather name="smartphone" size={40} color="#9E9E9E" />;

        switch (device.type) {
            case 'Light':
                return <Feather name="sun" size={40} color="#FFD700" />;
            case 'Atmosphere Sensor':
                return <Feather name="thermometer" size={40} color="#4CAF50" />;
            case 'Security Camera':
                return <Feather name="camera" size={40} color="#2196F3" />;
            case 'SmartLock':
                return <MaterialIcons name="lock" size={40} color="#9C27B0" />;
            default:
                return <Feather name="smartphone" size={40} color="#9E9E9E" />;
        }
    };

    const getStatusColor = () => {
        return device?.state === 'ACTIVE' ? '#4CAF50' : '#F44336';
    };

    const viewAllLogs = () => {
        router.push(`/home/notification?filter=smartHome&deviceId=${device.deviceId}`);
    };

    if (isLoading || !device) {
        return (
            <LinearGradient colors={['#ffe0e3', '#fff0f2', '#ffffff']} style={styles.gradientContainer}>
                <SafeAreaWrapper backgroundColor="transparent">
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#f04037" />
                        <Text style={styles.loadingText}>Đang tải thông tin thiết bị...</Text>
                    </View>
                </SafeAreaWrapper>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#ffe0e3', '#fff0f2', '#ffffff']} style={styles.gradientContainer}>
            <SafeAreaWrapper backgroundColor="transparent">
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Feather name="arrow-left" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Chi tiết thiết bị</Text>
                    </View>

                    <View style={styles.deviceInfoCard}>
                        <View style={styles.iconContainer}>{getDeviceIcon()}</View>
                        <Text style={styles.deviceName}>{device.name}</Text>

                        <View style={styles.statusContainer}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                            <Text style={styles.statusText}>
                                {device.state === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                            </Text>
                        </View>

                        <View style={styles.detailsContainer}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Loại thiết bị:</Text>
                                <Text style={styles.detailValue}>{device.type}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>ID thiết bị:</Text>
                                <Text style={styles.detailValue}>{device.deviceId}</Text>
                            </View>

                            {device.description && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Mô tả:</Text>
                                    <Text style={styles.detailValue}>{device.description}</Text>
                                </View>
                            )}
                        </View>

                        {/* Hiển thị các điều khiển SmartLock nếu là thiết bị khóa thông minh */}
                        {device.type === 'SmartLock' && device.state === 'ACTIVE' && (
                            <View style={styles.smartLockControlsContainer}>
                                <Text style={styles.controlsTitle}>Điều khiển khóa thông minh</Text>
                                <SmartLockControls deviceId={device.deviceId} name={device.name} />
                            </View>
                        )}

                        {/* Thông báo khi thiết bị không hoạt động */}
                        {device.type === 'SmartLock' && device.state !== 'ACTIVE' && (
                            <View style={styles.inactiveMessage}>
                                <MaterialIcons name="error-outline" size={24} color="#F44336" />
                                <Text style={styles.inactiveText}>
                                    Thiết bị đang không hoạt động. Vui lòng kết nối thiết bị để sử dụng các tính năng.
                                </Text>
                            </View>
                        )}

                        {device?.type === 'Smart Lock' && (
                            <View style={styles.logsSection}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Lịch sử mở khóa gần đây</Text>
                                    <TouchableOpacity onPress={() => setShowLogs(!showLogs)}>
                                        <Feather
                                            name={showLogs ? 'chevron-up' : 'chevron-down'}
                                            size={20}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {showLogs && (
                                    <>
                                        {isLoadingDoorLogs ? (
                                            <ActivityIndicator
                                                size="small"
                                                color="#9C27B0"
                                                style={{ marginVertical: 12 }}
                                            />
                                        ) : doorLogs.length === 0 ? (
                                            <Text style={styles.emptyLogsText}>Chưa có lịch sử mở khóa</Text>
                                        ) : (
                                            <>
                                                {doorLogs.map((log, index) => (
                                                    <View key={index} style={styles.logItem}>
                                                        <View style={styles.logIcon}>
                                                            <Feather name="unlock" size={16} color="#4CAF50" />
                                                        </View>
                                                        <View style={styles.logContent}>
                                                            <Text style={styles.logEvent}>
                                                                {log.event === 'door_opened'
                                                                    ? 'Mở cửa thành công'
                                                                    : log.event}
                                                            </Text>
                                                            <Text style={styles.logTime}>
                                                                {new Date(log.timestamp).toLocaleString()}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))}

                                                <TouchableOpacity style={styles.viewAllButton} onPress={viewAllLogs}>
                                                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                                                    <Feather name="arrow-right" size={16} color="#9C27B0" />
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaWrapper>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    scrollContent: {
        padding: 16,
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    deviceInfoCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        backgroundColor: '#f5f5f5',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    deviceName: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        color: '#666',
    },
    detailsContainer: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 16,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    detailLabel: {
        width: 100,
        fontWeight: '600',
        color: '#666',
        fontSize: 15,
    },
    detailValue: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    smartLockControlsContainer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 16,
    },
    controlsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    inactiveMessage: {
        marginTop: 20,
        backgroundColor: '#ffebee',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inactiveText: {
        marginLeft: 8,
        color: '#d32f2f',
        flex: 1,
    },
    logsSection: {
        marginTop: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyLogsText: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 12,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    logIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logContent: {
        flex: 1,
    },
    logEvent: {
        fontSize: 14,
        fontWeight: '500',
    },
    logTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 8,
    },
    viewAllText: {
        color: '#9C27B0',
        marginRight: 4,
        fontWeight: '500',
    },
});
