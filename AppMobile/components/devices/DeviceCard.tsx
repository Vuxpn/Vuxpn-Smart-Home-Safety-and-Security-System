import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Device } from '../../interfaces/device.interface';
import Card from '../ui/Card';
import { showToast } from '../ui/Toast';
import deviceService from '../../services/deviceService';
import SmartLockControls from './SmartLock/SmartLockControls';
import { router } from 'expo-router';
import smartLockService from '../../services/smartLockService';
import AtmosphereSensorControls from './AtmosphereSensor/AtmosphereSensorControls';
import SecurityCameraControls from './SecurityCamera/SecurityCameraControls';

interface DeviceCardProps {
    device: Device;
    onRefresh: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onRefresh }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [expandSmartLock, setExpandSmartLock] = useState(false);
    const [isLocked, setIsLocked] = useState(true);
    const [isLoadingLockStatus, setIsLoadingLockStatus] = useState(false);
    const [expandAtmSensor, setExpandAtmSensor] = useState(false);
    const [warningStatus, setWarningStatus] = useState(false);
    const [fanStatus, setFanStatus] = useState(false);
    const [expandSecurityCamera, setExpandSecurityCamera] = useState(false);

    useEffect(() => {
        if (device.type === 'SmartLock' && device.state === 'ACTIVE') {
            fetchLockStatus();
        }
    }, [device]);

    const fetchLockStatus = async () => {
        if (device.type !== 'SmartLock') return;

        try {
            setIsLoadingLockStatus(true);
            const response = await smartLockService.getLockStatus(device.deviceId);
            if (response.success && response.data) {
                setIsLocked(response.data.locked);
            }
        } catch (error) {
            console.error('Error fetching lock status:', error);
        } finally {
            setIsLoadingLockStatus(false);
        }
    };

    const handleConnect = async () => {
        try {
            setIsConnecting(true);
            const response = await deviceService.connectDevice(device.deviceId);

            if (response.success) {
                showToast('success', 'Kết nối thành công', `Đã kết nối với thiết bị ${device.name}`);
                onRefresh();
            } else {
                showToast('error', 'Lỗi kết nối', 'Không thể kết nối thiết bị');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Không thể kết nối thiết bị';
            showToast('error', 'Lỗi kết nối', errorMsg);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            setIsDisconnecting(true);
            const response = await deviceService.disconnectDevice(device.deviceId);

            if (response.success) {
                showToast('info', 'Đã ngắt kết nối', `Đã ngắt kết nối thiết bị ${device.name}`);
                onRefresh();
            } else {
                showToast('error', 'Lỗi ngắt kết nối', 'Không thể ngắt kết nối thiết bị');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Không thể ngắt kết nối thiết bị';
            showToast('error', 'Lỗi ngắt kết nối', errorMsg);
        } finally {
            setIsDisconnecting(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('Xác nhận xóa', `Bạn có chắc chắn muốn xóa thiết bị "${device.name}"?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setIsDeleting(true);
                        const response = await deviceService.deleteDevice(device.deviceId);

                        if (response.success) {
                            showToast('success', 'Đã xóa thiết bị', `Thiết bị ${device.name} đã được xóa thành công`);
                            onRefresh();
                        } else {
                            showToast('error', 'Lỗi xóa thiết bị', 'Không thể xóa thiết bị');
                        }
                    } catch (error: any) {
                        const errorMsg = error.response?.data?.message || error.message || 'Không thể xóa thiết bị';
                        showToast('error', 'Lỗi xóa thiết bị', errorMsg);
                    } finally {
                        setIsDeleting(false);
                    }
                },
            },
        ]);
    };

    const toggleDeviceControls = () => {
        if (device.type === 'SmartLock') {
            setExpandSmartLock(!expandSmartLock);
            if (!expandSmartLock && device.state === 'ACTIVE') {
                fetchLockStatus();
            }
        } else if (device.type === 'Atmosphere Sensor') {
            setExpandAtmSensor(!expandAtmSensor);
        } else if (device.type === 'Security Camera') {
            setExpandSecurityCamera(!expandSecurityCamera);
        }
    };

    const getDeviceIcon = () => {
        switch (device.type) {
            case 'Light':
                return <Ionicons name="bulb" size={28} color="#FFD700" />;
            case 'Atmosphere Sensor':
                return <MaterialCommunityIcons name="air-filter" size={28} color="#4CAF50" />;
            case 'Security Camera':
                return <Feather name="camera" size={28} color="#2196F3" />;
            case 'SmartLock':
                if (isLoadingLockStatus) {
                    return <ActivityIndicator size="small" color="#9C27B0" />;
                }
                return isLocked ? (
                    <MaterialIcons name="lock" size={28} color="#9C27B0" />
                ) : (
                    <MaterialIcons name="lock-open" size={28} color="#9C27B0" />
                );
            default:
                return <Feather name="smartphone" size={28} color="#9E9E9E" />;
        }
    };

    const getStatusColor = () => {
        return device.state === 'ACTIVE' ? '#4CAF50' : '#F44336';
    };

    const handleSensorStatusChange = (type: 'warning' | 'fan', isOn: boolean) => {
        if (type === 'warning') {
            setWarningStatus(isOn);
        } else if (type === 'fan') {
            setFanStatus(isOn);
        }
    };

    return (
        <Card className="mb-3">
            <TouchableOpacity activeOpacity={device.type === 'SmartLock' ? 0.7 : 1} onPress={toggleDeviceControls}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View className="bg-gray-100 p-3 rounded-full mr-3">{getDeviceIcon()}</View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold">{device.name}</Text>
                            <View className="flex-row items-center mt-1">
                                <View
                                    className="h-2 w-2 rounded-full mr-2"
                                    style={{ backgroundColor: getStatusColor() }}
                                />
                                <Text className="text-gray-600">
                                    {device.state === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                                </Text>
                            </View>
                            <Text className="text-gray-500 text-sm mt-1">{device.type}</Text>
                            {device.description && (
                                <Text className="text-gray-500 text-sm mt-1">{device.description}</Text>
                            )}
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        {device.state === 'ACTIVE' ? (
                            <TouchableOpacity
                                onPress={handleDisconnect}
                                disabled={isDisconnecting}
                                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2"
                            >
                                {isDisconnecting ? (
                                    <ActivityIndicator size="small" color="#F44336" />
                                ) : (
                                    <Feather name="wifi-off" size={20} color="#F44336" />
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={handleConnect}
                                disabled={isConnecting}
                                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2"
                            >
                                {isConnecting ? (
                                    <ActivityIndicator size="small" color="#4CAF50" />
                                ) : (
                                    <Feather name="wifi" size={20} color="#4CAF50" />
                                )}
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={handleDelete}
                            disabled={isDeleting}
                            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#F44336" />
                            ) : (
                                <Feather name="trash-2" size={20} color="#F44336" />
                            )}
                        </TouchableOpacity>

                        {device.type === 'SmartLock' && (
                            <TouchableOpacity
                                onPress={toggleDeviceControls}
                                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center ml-2"
                            >
                                <MaterialIcons
                                    name={expandSmartLock ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    size={24}
                                    color="#9C27B0"
                                />
                            </TouchableOpacity>
                        )}

                        {device.type === 'Atmosphere Sensor' && (
                            <TouchableOpacity
                                onPress={toggleDeviceControls}
                                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center ml-2"
                            >
                                <MaterialIcons
                                    name={expandAtmSensor ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    size={24}
                                    color="#4CAF50"
                                />
                            </TouchableOpacity>
                        )}

                        {device.type === 'Security Camera' && (
                            <TouchableOpacity
                                onPress={toggleDeviceControls}
                                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center ml-2"
                            >
                                <MaterialIcons
                                    name={expandSecurityCamera ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    size={24}
                                    color="#2196F3"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {device.type === 'SmartLock' && expandSmartLock && device.state === 'ACTIVE' && (
                    <SmartLockControls
                        deviceId={device.deviceId}
                        name={device.name}
                        onRefreshStatus={fetchLockStatus}
                    />
                )}

                {device.type === 'SmartLock' && expandSmartLock && device.state !== 'ACTIVE' && (
                    <View className="mt-3 bg-red-50 p-3 rounded-lg">
                        <Text className="text-red-500 text-center">
                            Thiết bị đang không hoạt động. Vui lòng kết nối thiết bị để sử dụng các tính năng.
                        </Text>
                    </View>
                )}

                {device.type === 'SmartLock' && (
                    <TouchableOpacity
                        style={styles.viewLogsButton}
                        onPress={() => router.push(`/home/notification?filter=smartHome&deviceId=${device.deviceId}`)}
                    >
                        <Feather name="clock" size={16} color="#9C27B0" />
                        <Text style={styles.viewLogsText}>Xem lịch sử</Text>
                    </TouchableOpacity>
                )}

                {/* Atmosphere Sensor Controls */}
                {device.type === 'Atmosphere Sensor' && expandAtmSensor && device.state === 'ACTIVE' && (
                    <AtmosphereSensorControls
                        deviceId={device.deviceId}
                        name={device.name}
                        onStatusChange={handleSensorStatusChange}
                    />
                )}

                {/* Thông báo khi thiết bị không hoạt động */}
                {device.type === 'Atmosphere Sensor' && expandAtmSensor && device.state !== 'ACTIVE' && (
                    <View className="mt-3 bg-red-50 p-3 rounded-lg">
                        <Text className="text-red-500 text-center">
                            Thiết bị đang không hoạt động. Vui lòng kết nối thiết bị để sử dụng các tính năng.
                        </Text>
                    </View>
                )}

                {device.type === 'Security Camera' && expandSecurityCamera && device.state === 'ACTIVE' && (
                    <SecurityCameraControls deviceId={device.deviceId} name={device.name} />
                )}

                {device.type === 'Security Camera' && expandSecurityCamera && device.state !== 'ACTIVE' && (
                    <View className="mt-3 bg-red-50 p-3 rounded-lg">
                        <Text className="text-red-500 text-center">
                            Thiết bị đang không hoạt động. Vui lòng kết nối thiết bị để sử dụng các tính năng.
                        </Text>
                    </View>
                )}

                {device.type === 'Security Camera' && (
                    <TouchableOpacity
                        style={styles.viewLogsButton}
                        onPress={() => router.push(`/home/notification?filter=camera&deviceId=${device.deviceId}`)}
                    >
                        <Feather name="camera" size={16} color="#2196F3" />
                        <Text style={[styles.viewLogsText, { color: '#2196F3' }]}>Xem lịch sử phát hiện</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </Card>
    );
};

const styles = StyleSheet.create({
    viewLogsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f3e5f5',
        borderRadius: 8,
        marginTop: 12,
    },
    viewLogsText: {
        color: '#9C27B0',
        marginLeft: 8,
        fontWeight: '500',
    },
});

export default DeviceCard;
