import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Switch } from 'react-native';
import { Feather, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { showToast } from '../../ui/Toast';
import gasWarningService from '../../../services/gasWarningService';
import socketService from '../../../services/socketService';

interface AtmosphereSensorControlsProps {
    deviceId: string;
    name: string;
    onStatusChange?: (type: 'warning' | 'fan', isOn: boolean) => void;
}

const AtmosphereSensorControls: React.FC<AtmosphereSensorControlsProps> = ({ deviceId, name, onStatusChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isWarningOn, setIsWarningOn] = useState(false);
    const [isFanOn, setIsFanOn] = useState(false);
    const [gasValue, setGasValue] = useState('70');
    const [temValue, setTemValue] = useState('40');
    const [showSettings, setShowSettings] = useState(false);
    const [sensorValues, setSensorValues] = useState({
        gasLevel: 0,
        temperature: 0,
        humidity: 0,
    });

    useEffect(() => {
        // Đăng ký nhận dữ liệu từ thiết bị
        socketService.subscribeToDevice(deviceId);

        // Thêm listener để nhận dữ liệu
        const handleSensorData = (data: { type: string; value: number; timestamp: string }) => {
            if (data.type === 'gasLevel') {
                setSensorValues((prev) => ({ ...prev, gasLevel: data.value }));
            } else if (data.type === 'temperature') {
                setSensorValues((prev) => ({ ...prev, temperature: data.value }));
            } else if (data.type === 'humidity') {
                setSensorValues((prev) => ({ ...prev, humidity: data.value }));
            }
        };

        socketService.addSensorDataListener(deviceId, handleSensorData);

        // Cập nhật giá trị từ service nếu đã có
        const currentValues = socketService.getSensorValues();
        setSensorValues(currentValues);

        return () => {
            // Hủy đăng ký khi component unmount
            socketService.removeSensorDataListener(deviceId, handleSensorData);
            socketService.unsubscribeFromDevice(deviceId);
        };
    }, [deviceId]);

    const handleToggleWarning = async (value: boolean) => {
        try {
            setIsLoading(true);
            if (value) {
                await gasWarningService.turnOnWarning(deviceId);
                showToast('success', 'Thành công', 'Đã bật cảnh báo âm thanh');
                setIsWarningOn(true);
                onStatusChange?.('warning', true);
            } else {
                await gasWarningService.turnOffWarning(deviceId);
                showToast('success', 'Thành công', 'Đã tắt cảnh báo âm thanh');
                setIsWarningOn(false);
                onStatusChange?.('warning', false);
            }
        } catch (error) {
            showToast('error', 'Lỗi', 'Không thể điều khiển cảnh báo');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleFan = async (value: boolean) => {
        try {
            setIsLoading(true);
            if (value) {
                await gasWarningService.turnOnFan(deviceId);
                showToast('success', 'Thành công', 'Đã bật quạt thông gió');
                setIsFanOn(true);
                onStatusChange?.('fan', true);
            } else {
                await gasWarningService.turnOffFan(deviceId);
                showToast('success', 'Thành công', 'Đã tắt quạt thông gió');
                setIsFanOn(false);
                onStatusChange?.('fan', false);
            }
        } catch (error) {
            showToast('error', 'Lỗi', 'Không thể điều khiển quạt thông gió');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            setIsLoading(true);
            const gasValueNum = parseInt(gasValue);
            const temValueNum = parseInt(temValue);

            if (isNaN(gasValueNum) || isNaN(temValueNum)) {
                showToast('error', 'Lỗi', 'Vui lòng nhập giá trị hợp lệ');
                return;
            }

            const response = await gasWarningService.changeWarningLevel(deviceId, gasValueNum, temValueNum);
            if (response) {
                showToast('success', 'Thành công', 'Đã cập nhật ngưỡng cảnh báo');
                socketService.setWarningThreshold(gasValueNum);
                setShowSettings(false);
            }
        } catch (error) {
            showToast('error', 'Lỗi', 'Không thể cập nhật ngưỡng cảnh báo');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getGasLevelColor = () => {
        const gasLevel = sensorValues.gasLevel;
        if (gasLevel < 70) return '#4CAF50'; // An toàn
        if (gasLevel > 70 && gasLevel < 100) return '#FFA000'; // Cảnh báo
        return '#F44336'; // Nguy hiểm
    };

    return (
        <View style={styles.container}>
            {/* Hiển thị dữ liệu cảm biến */}
            <View style={styles.sensorDataContainer}>
                <Text style={styles.sensorTitle}>Dữ liệu cảm biến</Text>

                <View style={styles.sensorGrid}>
                    <View style={styles.sensorCard}>
                        <Feather name="thermometer" size={24} color="#FF5722" />
                        <Text style={styles.sensorValue}>{sensorValues.temperature.toFixed(1)}°C</Text>
                        <Text style={styles.sensorLabel}>Nhiệt độ</Text>
                    </View>

                    <View style={styles.sensorCard}>
                        <Feather name="droplet" size={24} color="#2196F3" />
                        <Text style={styles.sensorValue}>{sensorValues.humidity.toFixed(1)}%</Text>
                        <Text style={styles.sensorLabel}>Độ ẩm</Text>
                    </View>

                    <View style={styles.sensorCard}>
                        <MaterialCommunityIcons name="gas-cylinder" size={24} color={getGasLevelColor()} />
                        <Text style={[styles.sensorValue, { color: getGasLevelColor() }]}>
                            {sensorValues.gasLevel.toFixed(0)}
                        </Text>
                        <Text style={styles.sensorLabel}>Khí Gas</Text>
                    </View>
                </View>
            </View>

            {/* Điều khiển thiết bị */}
            <View style={styles.controlsContainer}>
                <Text style={styles.controlsTitle}>Điều khiển thiết bị</Text>

                <View style={styles.controlItem}>
                    <View style={styles.controlInfo}>
                        <MaterialIcons name="warning" size={24} color="#FFA000" />
                        <Text style={styles.controlLabel}>Cảnh báo âm thanh</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="small" color="#f04037" />
                    ) : (
                        <Switch
                            value={isWarningOn}
                            onValueChange={handleToggleWarning}
                            thumbColor={isWarningOn ? '#f04037' : '#f4f3f4'}
                            trackColor={{ false: '#d1d1d1', true: '#f9a7a1' }}
                        />
                    )}
                </View>

                <View style={styles.controlItem}>
                    <View style={styles.controlInfo}>
                        <MaterialIcons name="hvac" size={24} color="#2196F3" />
                        <Text style={styles.controlLabel}>Quạt thông gió</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="small" color="#f04037" />
                    ) : (
                        <Switch
                            value={isFanOn}
                            onValueChange={handleToggleFan}
                            thumbColor={isFanOn ? '#f04037' : '#f4f3f4'}
                            trackColor={{ false: '#d1d1d1', true: '#f9a7a1' }}
                        />
                    )}
                </View>

                <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(!showSettings)}>
                    <Ionicons name="settings-outline" size={20} color="white" />
                    <Text style={styles.settingsButtonText}>Cài đặt ngưỡng cảnh báo</Text>
                </TouchableOpacity>
            </View>

            {/* Cài đặt ngưỡng cảnh báo */}
            {showSettings && (
                <View style={styles.settingsContainer}>
                    <Text style={styles.settingsTitle}>Ngưỡng cảnh báo</Text>

                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Ngưỡng khí gas:</Text>
                        <TextInput
                            style={styles.input}
                            value={gasValue}
                            onChangeText={setGasValue}
                            keyboardType="number-pad"
                            placeholder="Nhập ngưỡng khí gas"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Ngưỡng nhiệt độ:</Text>
                        <TextInput
                            style={styles.input}
                            value={temValue}
                            onChangeText={setTemValue}
                            keyboardType="number-pad"
                            placeholder="Nhập ngưỡng nhiệt độ"
                        />
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.saveButtonText}>Lưu cài đặt</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sensorDataContainer: {
        marginBottom: 16,
    },
    sensorTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    sensorGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sensorCard: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    sensorValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    sensorLabel: {
        fontSize: 12,
        color: '#666',
    },
    controlsContainer: {
        marginBottom: 16,
    },
    controlsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    controlItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    controlInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlLabel: {
        marginLeft: 12,
        fontSize: 15,
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f04037',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    settingsButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    settingsContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    settingsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    inputLabel: {
        width: 120,
        fontSize: 14,
        color: '#666',
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default AtmosphereSensorControls;
