import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Switch, Image, Dimensions } from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { showToast } from '../../ui/Toast';
import detectionService from '../../../services/detectionService';
import { router } from 'expo-router';

interface SecurityCameraControlsProps {
    deviceId: string;
    name: string;
}

const SecurityCameraControls: React.FC<SecurityCameraControlsProps> = ({ deviceId, name }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isWarningEnabled, setIsWarningEnabled] = useState(false);
    const [detectionMode, setDetectionMode] = useState<'normal' | 'safe'>('normal');
    const [ledTimeout, setLedTimeout] = useState(30);
    const [buzzerTimeout, setBuzzerTimeout] = useState(10);
    const [showSettings, setShowSettings] = useState(false);
    const [latestImage, setLatestImage] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(false);

    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth - 80;

    useEffect(() => {
        loadLatestDetection();
    }, [deviceId]);

    const loadLatestDetection = async () => {
        try {
            setIsLoadingImage(true);
            const response = await detectionService.getDetectionHistory(deviceId);
            if (response.success && response.data && response.data.length > 0) {
                const latestDetection = response.data[0];
                if (latestDetection.url) {
                    setLatestImage(latestDetection.url);
                }
            }
        } catch (error) {
            console.error('Error loading detection history:', error);
        } finally {
            setIsLoadingImage(false);
        }
    };

    const handleToggleWarning = async (value: boolean) => {
        try {
            setIsLoading(true);
            if (value) {
                const response = await detectionService.turnOnWarning(deviceId);
                if (response.success) {
                    showToast('success', 'Thành công', response.message);
                    setIsWarningEnabled(true);
                }
            } else {
                const response = await detectionService.turnOffWarning(deviceId);
                if (response.success) {
                    showToast('success', 'Thành công', response.message);
                    setIsWarningEnabled(false);
                }
            }
        } catch (error) {
            showToast('error', 'Lỗi', 'Không thể thay đổi cài đặt cảnh báo');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeMode = async (mode: 'normal' | 'safe') => {
        try {
            setIsLoading(true);
            let response;
            if (mode === 'safe') {
                response = await detectionService.changeToSafeMode(deviceId);
            } else {
                response = await detectionService.changeToNormalMode(deviceId);
            }

            if (response.success) {
                showToast('success', 'Thành công', response.message);
                setDetectionMode(mode);
            }
        } catch (error) {
            showToast('error', 'Lỗi', 'Không thể thay đổi chế độ phát hiện');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            setIsLoading(true);

            // Lưu thời gian đèn LED
            const ledResponse = await detectionService.changeLedTime(deviceId, ledTimeout);
            if (!ledResponse.success) {
                showToast('error', 'Lỗi', 'Không thể thay đổi thời gian đèn LED');
                return;
            }

            // Lưu thời gian chuông báo
            const buzzerResponse = await detectionService.changeBuzzerTime(deviceId, buzzerTimeout);
            if (!buzzerResponse.success) {
                showToast('error', 'Lỗi', 'Không thể thay đổi thời gian chuông báo');
                return;
            }

            showToast('success', 'Thành công', 'Đã lưu cài đặt thành công');
            setShowSettings(false);
        } catch (error) {
            showToast('error', 'Lỗi', 'Không thể lưu cài đặt');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const viewAllDetections = () => {
        router.push(`/home/notification?filter=camera&deviceId=${deviceId}`);
    };

    return (
        <View style={styles.container}>
            {/* Camera Preview */}
            <View style={styles.previewContainer}>
                <Text style={styles.sectionTitle}>Ảnh phát hiện mới nhất</Text>
                <View style={[styles.imageContainer, { width: imageWidth, height: imageWidth * 0.75 }]}>
                    {isLoadingImage ? (
                        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
                    ) : latestImage ? (
                        <Image source={{ uri: latestImage }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.noImageContainer}>
                            <Feather name="camera-off" size={40} color="#999" />
                            <Text style={styles.noImageText}>Không có ảnh phát hiện</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={styles.viewAllButton} onPress={viewAllDetections}>
                    <Text style={styles.viewAllText}>Xem tất cả lịch sử phát hiện</Text>
                    <Feather name="arrow-right" size={16} color="#2196F3" />
                </TouchableOpacity>
            </View>

            {/* Điều khiển thiết bị */}
            <View style={styles.controlsContainer}>
                <Text style={styles.sectionTitle}>Điều khiển thiết bị</Text>

                {/* Chế độ phát hiện */}
                <View style={styles.controlItem}>
                    <View style={styles.controlInfo}>
                        <Feather name="eye" size={24} color="#2196F3" />
                        <Text style={styles.controlLabel}>Chế độ phát hiện</Text>
                    </View>
                    <View style={styles.modeButtons}>
                        <TouchableOpacity
                            style={[styles.modeButton, detectionMode === 'normal' && styles.modeButtonActive]}
                            onPress={() => handleChangeMode('normal')}
                            disabled={isLoading}
                        >
                            <Text
                                style={[
                                    styles.modeButtonText,
                                    detectionMode === 'normal' && styles.modeButtonTextActive,
                                ]}
                            >
                                Bình thường
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modeButton, detectionMode === 'safe' && styles.modeButtonActive]}
                            onPress={() => handleChangeMode('safe')}
                            disabled={isLoading}
                        >
                            <Text
                                style={[styles.modeButtonText, detectionMode === 'safe' && styles.modeButtonTextActive]}
                            >
                                An toàn
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Cảnh báo âm thanh */}
                <View style={styles.controlItem}>
                    <View style={styles.controlInfo}>
                        <MaterialIcons name="notifications-active" size={24} color="#FFA000" />
                        <Text style={styles.controlLabel}>Cảnh báo âm thanh</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="small" color="#f04037" />
                    ) : (
                        <Switch
                            value={isWarningEnabled}
                            onValueChange={handleToggleWarning}
                            thumbColor={isWarningEnabled ? '#f04037' : '#f4f3f4'}
                            trackColor={{ false: '#d1d1d1', true: '#f9a7a1' }}
                        />
                    )}
                </View>

                <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(!showSettings)}>
                    <Ionicons name="settings-outline" size={20} color="white" />
                    <Text style={styles.settingsButtonText}>Cài đặt thời gian</Text>
                </TouchableOpacity>
            </View>

            {/* Cài đặt thời gian */}
            {showSettings && (
                <View style={styles.settingsContainer}>
                    <Text style={styles.settingsTitle}>Cài đặt thời gian</Text>

                    {/* Thời gian đèn LED */}
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Thời gian đèn LED (giây):</Text>
                        <Text style={styles.settingValue}>{ledTimeout}</Text>
                    </View>
                    <View style={styles.customSlider}>
                        <TouchableOpacity
                            style={styles.sliderButton}
                            onPress={() => setLedTimeout(Math.max(5, ledTimeout - 5))}
                        >
                            <Text style={styles.sliderButtonText}>-</Text>
                        </TouchableOpacity>

                        <View style={styles.sliderTrack}>
                            <View style={[styles.sliderFill, { width: `${((ledTimeout - 5) / 55) * 100}%` }]} />
                        </View>

                        <TouchableOpacity
                            style={styles.sliderButton}
                            onPress={() => setLedTimeout(Math.min(60, ledTimeout + 5))}
                        >
                            <Text style={styles.sliderButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Thời gian chuông báo */}
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Thời gian chuông báo (giây):</Text>
                        <Text style={styles.settingValue}>{buzzerTimeout}</Text>
                    </View>
                    <View style={styles.customSlider}>
                        <TouchableOpacity
                            style={[styles.sliderButton, { backgroundColor: '#FFA000' }]}
                            onPress={() => setBuzzerTimeout(Math.max(5, buzzerTimeout - 5))}
                        >
                            <Text style={styles.sliderButtonText}>-</Text>
                        </TouchableOpacity>

                        <View style={styles.sliderTrack}>
                            <View
                                style={[
                                    styles.sliderFill,
                                    { backgroundColor: '#FFA000', width: `${((buzzerTimeout - 5) / 25) * 100}%` },
                                ]}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.sliderButton, { backgroundColor: '#FFA000' }]}
                            onPress={() => setBuzzerTimeout(Math.min(30, buzzerTimeout + 5))}
                        >
                            <Text style={styles.sliderButtonText}>+</Text>
                        </TouchableOpacity>
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
    previewContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    imageContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        marginTop: 10,
        color: '#999',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    viewAllText: {
        color: '#2196F3',
        fontWeight: '500',
        marginRight: 4,
    },
    controlsContainer: {
        marginBottom: 16,
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
    modeButtons: {
        flexDirection: 'row',
    },
    modeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginLeft: 6,
    },
    modeButtonActive: {
        backgroundColor: '#2196F3',
    },
    modeButtonText: {
        fontSize: 12,
        color: '#666',
    },
    modeButtonTextActive: {
        color: 'white',
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
        marginBottom: 16,
        color: '#333',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    settingLabel: {
        fontSize: 14,
        color: '#666',
    },
    settingValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
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
    customSlider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sliderButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    sliderTrack: {
        flex: 1,
        height: 10,
        backgroundColor: '#d1d1d1',
        marginHorizontal: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: '#2196F3',
        borderRadius: 5,
    },
});

export default SecurityCameraControls;
