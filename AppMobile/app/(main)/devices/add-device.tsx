import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Image, ScrollView, Modal, useWindowDimensions, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, Feather, AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeAreaWrapper from '@/components/layout/SafeAreaWrapper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BarcodeScanningResult } from 'expo-camera';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useHouse from '@/hook/useHouse';
import deviceService from '@/services/deviceService';
import { showToast } from '@/components/ui/Toast';
import axios, { CancelTokenSource } from 'axios';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// Định nghĩa interface cho thiết bị
interface DeviceBrand {
    id: string;
    name: string;
    type: string;
    imageSrc: any;
}

// Các loại thiết bị được hỗ trợ
const gasDevices: DeviceBrand[] = [
    { id: 'gas1', name: 'Gas Sensor A1', type: 'Atmosphere Sensor', imageSrc: require('@/assets/images/gas1.png') },
    { id: 'gas2', name: 'Gas Sensor B2', type: 'Atmosphere Sensor', imageSrc: require('@/assets/images/gas2.png') },
    { id: 'gas3', name: 'Gas Sensor C3', type: 'Atmosphere Sensor', imageSrc: require('@/assets/images/gas3.png') },
];

const securityDevices: DeviceBrand[] = [
    { id: 'cam1', name: 'Security Camera A1', type: 'Security Camera', imageSrc: require('@/assets/images/cam1.png') },
    { id: 'cam2', name: 'Security Camera B2', type: 'Security Camera', imageSrc: require('@/assets/images/cam2.png') },
    { id: 'cam3', name: 'Security Camera C3', type: 'Security Camera', imageSrc: require('@/assets/images/cam3.png') },
];

const smartLockDevices: DeviceBrand[] = [
    { id: 'lock1', name: 'Smart Lock A1', type: 'SmartLock', imageSrc: require('@/assets/images/lock1.png') },
    { id: 'lock2', name: 'Smart Lock B2', type: 'SmartLock', imageSrc: require('@/assets/images/lock2.png') },
    { id: 'lock3', name: 'Smart Lock C3', type: 'SmartLock', imageSrc: require('@/assets/images/lock3.png') },
];

const AddDevicePage = () => {
    const [index, setIndex] = useState(0);
    const [selectedDevice, setSelectedDevice] = useState<DeviceBrand | null>(null);
    const [showScanner, setShowScanner] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const { currentHome } = useHouse();
    const layout = useWindowDimensions();
    const screenWidth = Dimensions.get('window').width;

    // Form state
    const [deviceId, setDeviceId] = useState('');
    const [deviceName, setDeviceName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const cancelTokenRef = useRef<CancelTokenSource | null>(null);
    const [errors, setErrors] = useState({
        deviceId: '',
        deviceName: '',
    });

    // Các tab cho thiết bị
    const [topRoutes] = useState([
        { key: 'all', title: 'Tất cả' },
        { key: 'brand', title: 'Thương hiệu' },
    ]);

    const [routes] = useState([
        { key: 'gas', title: 'Cảm biến' },
        { key: 'security', title: 'Camera' },
        { key: 'lock', title: 'Khóa cửa' },
        { key: 'light', title: 'Chiếu sáng' },
        { key: 'home', title: 'Thiết bị gia dụng' },
        { key: 'remote', title: 'Bộ điều khiển thông minh' },
    ]);

    // Timer animation
    const timerColor = countdown <= 10 ? '#f44336' : countdown <= 20 ? '#ff9800' : '#4caf50';

    // Đếm ngược khi đang xác thực
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (verifying && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (verifying && countdown === 0) {
            setVerifying(false);
            showToast(
                'error',
                'Hết thời gian',
                'Quá thời gian phản hồi từ thiết bị. Vui lòng đảm bảo thiết bị đã được bật và ở chế độ kết nối.',
            );
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [verifying, countdown]);

    // Reset các trạng thái khi đóng form
    useEffect(() => {
        if (!selectedDevice) {
            setVerifying(false);
            setCountdown(30);
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('Form closed by user');
                cancelTokenRef.current = null;
            }
        }
    }, [selectedDevice]);

    const handleDevicePress = (device: DeviceBrand) => {
        setSelectedDevice(device);
        setDeviceName(device.name);
    };

    const validateForm = () => {
        const newErrors = {
            deviceId: deviceId ? '' : 'Mã thiết bị không được để trống',
            deviceName: deviceName ? '' : 'Tên thiết bị không được để trống',
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error !== '');
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        if (!currentHome) {
            showToast('error', 'Lỗi', 'Bạn chưa chọn nhà');
            return;
        }
        if (!selectedDevice) return;

        setLoading(true);
        setVerifying(true);
        setCountdown(30);

        // Tạo token để cancel request
        cancelTokenRef.current = axios.CancelToken.source();

        try {
            // Chuẩn bị dữ liệu thiết bị
            const deviceData = {
                deviceId: deviceId,
                name: deviceName,
                homeId: currentHome._id,
                description: description || '',
                type: selectedDevice.type,
            };

            // Gọi API để thêm thiết bị với cancelToken
            const response = await deviceService.addDevice(currentHome._id, deviceData, cancelTokenRef.current.token);

            setVerifying(false);
            showToast('success', 'Thành công', 'Đã thêm thiết bị thành công');
            setSelectedDevice(null);
            setDeviceId('');
            setDeviceName('');
            setDescription('');
        } catch (error: unknown) {
            setVerifying(false);
            if (axios.isCancel(error)) {
                showToast('info', 'Đã hủy', 'Yêu cầu xác thực thiết bị đã bị hủy');
            } else if (error instanceof Error && error.message.includes('timeout')) {
                showToast(
                    'error',
                    'Hết thời gian',
                    'Quá thời gian phản hồi từ thiết bị. Vui lòng đảm bảo thiết bị đã được bật và ở chế độ kết nối.',
                );
            } else {
                showToast('error', 'Lỗi', 'Không thể thêm thiết bị. Vui lòng thử lại sau.');
            }
            console.error('Error adding device:', error);
        } finally {
            setLoading(false);
            cancelTokenRef.current = null;
        }
    };

    const handleScanPress = async () => {
        const { granted } = await requestPermission();
        if (granted) {
            setShowScanner(true);
        } else {
            showToast('warning', 'Cảnh báo', 'Bạn cần cấp quyền truy cập camera để quét mã QR');
        }
    };

    const handleBarCodeScanned = (result: BarcodeScanningResult) => {
        setShowScanner(false);
        if (result.data) {
            try {
                const deviceData = JSON.parse(result.data);
                setDeviceId(deviceData.deviceId || '');
                showToast('success', 'Quét mã thành công', `Đã quét mã thiết bị: ${deviceData.deviceId}`);
            } catch (error) {
                showToast('error', 'Lỗi', 'Mã QR không hợp lệ. Vui lòng thử lại.');
            }
        }
    };

    // Hiển thị thiết bị cho tab Gas
    const GasRoute = () => <DeviceGrid devices={gasDevices} onDevicePress={handleDevicePress} />;

    // Hiển thị thiết bị cho tab Security
    const SecurityRoute = () => <DeviceGrid devices={securityDevices} onDevicePress={handleDevicePress} />;

    // Hiển thị thiết bị cho tab Smart Lock
    const LockRoute = () => <DeviceGrid devices={smartLockDevices} onDevicePress={handleDevicePress} />;

    // Tab trống cho các tab khác
    const EmptyRoute = () => (
        <View className="flex-1 items-center justify-center p-5">
            <Text className="text-gray-500">Không có thiết bị nào</Text>
        </View>
    );

    const renderScene = SceneMap({
        gas: GasRoute,
        security: SecurityRoute,
        lock: LockRoute,
        light: EmptyRoute,
        control: EmptyRoute,
        home: EmptyRoute,
        remote: EmptyRoute,
    });

    // Render bảng thông báo tìm thiết bị
    const renderSearchingNotice = () => (
        <View className="bg-white rounded-full flex-row items-center p-4 mb-4 mt-5">
            <View className="w-14 h-14 bg-red-100 rounded-full items-center justify-center mr-3">
                <View className="w-8 h-8 bg-red-400 rounded-full" />
            </View>
            <View className="flex-1">
                <Text className="text-base">
                    Đang tìm các thiết bị xung quanh. Hãy đảm bảo các thiết bị của bạn đã ở chế độ chờ kết nối.
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaWrapper>
            <View className="flex-row items-center justify-between mb-2">
                <Pressable className="p-2" onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </Pressable>
                <Text className="text-xl font-bold">Thêm thiết bị</Text>
                <Pressable className="p-2" onPress={handleScanPress}>
                    <MaterialIcons name="qr-code-scanner" size={24} color="black" />
                </Pressable>
            </View>

            {renderSearchingNotice()}

            <View className="flex-1">
                <Text className="text-lg font-medium mb-2">Thêm thiết bị thủ công</Text>

                {/* Tab view cho Tất cả/Thương hiệu */}
                <View className="mb-4">
                    <View className="flex-row border-b border-gray-200">
                        {topRoutes.map((route, i) => (
                            <Pressable
                                key={route.key}
                                className={`flex-1 items-center py-3 ${
                                    index === 0 && i === 0 ? 'border-b-2 border-red-500' : ''
                                }`}
                                onPress={() => {
                                    /* handle tab press */
                                }}
                            >
                                <Text
                                    className={`font-medium ${
                                        index === 0 && i === 0 ? 'text-red-500' : 'text-gray-500'
                                    }`}
                                >
                                    {route.title}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Danh sách thiết bị */}
                <View className="flex-1 flex-row">
                    {/* Sidebar */}
                    <View className="w-1/4 border-r border-gray-200">
                        {routes.map((route, i) => (
                            <Pressable
                                key={route.key}
                                className={`py-5 px-2 items-center ${index === i ? 'bg-red-500' : 'bg-white'}`}
                                onPress={() => setIndex(i)}
                            >
                                <Text
                                    className={`text-sm font-medium text-center ${
                                        index === i ? 'text-white' : 'text-gray-600'
                                    }`}
                                >
                                    {route.title}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Main content */}
                    <View className="w-3/4 flex-1">
                        <TabView
                            navigationState={{ index, routes }}
                            renderScene={renderScene}
                            onIndexChange={setIndex}
                            initialLayout={{ width: layout.width * 0.75 }}
                            renderTabBar={() => null}
                            swipeEnabled={false}
                        />
                    </View>
                </View>
            </View>

            {/* Form thêm thiết bị */}
            <Modal
                visible={!!selectedDevice}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    // Cancel API call if verifying when modal closed
                    if (verifying && cancelTokenRef.current) {
                        cancelTokenRef.current.cancel('Form closed by user');
                    }
                    setSelectedDevice(null);
                }}
            >
                {selectedDevice && (
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-white rounded-t-3xl p-4">
                            <View className="flex-row justify-between items-center mb-5">
                                <Text className="text-xl font-bold">Thêm thiết bị mới</Text>
                                <Pressable className="p-2" onPress={() => setSelectedDevice(null)}>
                                    <Ionicons name="close" size={24} color="black" />
                                </Pressable>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="bg-gray-100 rounded-xl p-4 mb-5">
                                    <Text className="text-gray-600 text-sm mb-1">{selectedDevice.type}</Text>
                                    <Text className="text-lg font-bold">{selectedDevice.name}</Text>
                                </View>

                                {verifying && (
                                    <Animated.View
                                        entering={FadeIn}
                                        exiting={FadeOut}
                                        className="bg-yellow-50 p-4 rounded-lg mb-4"
                                    >
                                        <View className="flex-row items-center">
                                            <View
                                                className="w-8 h-8 rounded-full justify-center items-center mr-3"
                                                style={{ backgroundColor: '#fff8e1' }}
                                            >
                                                <AntDesign name="clockcircle" size={18} color={timerColor} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-yellow-800 font-medium text-base">
                                                    Đang xác thực thiết bị
                                                </Text>
                                                <Text className="text-yellow-700 mt-1">
                                                    Vui lòng đợi phản hồi từ thiết bị
                                                </Text>
                                            </View>
                                            <View
                                                className="w-9 h-9 rounded-full justify-center items-center"
                                                style={{ backgroundColor: timerColor + '20' }}
                                            >
                                                <Text style={{ color: timerColor, fontWeight: '600' }}>
                                                    {countdown}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-yellow-600 text-sm mt-3">
                                            Đảm bảo rằng thiết bị của bạn đang ở chế độ kết nối và đèn báo hiệu đang
                                            nhấp nháy.
                                        </Text>
                                    </Animated.View>
                                )}

                                <Input
                                    label="Mã thiết bị"
                                    value={deviceId}
                                    onChangeText={setDeviceId}
                                    placeholder="Nhập mã thiết bị"
                                    error={errors.deviceId}
                                    editable={!verifying}
                                />

                                <Input
                                    label="Tên thiết bị"
                                    value={deviceName}
                                    onChangeText={setDeviceName}
                                    placeholder="Nhập tên thiết bị"
                                    error={errors.deviceName}
                                    editable={!verifying}
                                />

                                <Input
                                    label="Mô tả (tùy chọn)"
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Nhập mô tả về thiết bị"
                                    editable={!verifying}
                                />

                                <Button
                                    title={verifying ? 'Đang xác thực...' : 'Thêm thiết bị'}
                                    onPress={handleSubmit}
                                    isLoading={loading}
                                    disabled={loading || verifying}
                                    className="mt-2"
                                />

                                {verifying && (
                                    <Button
                                        title="Huỷ xác thực"
                                        onPress={() => {
                                            if (cancelTokenRef.current) {
                                                cancelTokenRef.current.cancel('Cancelled by user');
                                                cancelTokenRef.current = null;
                                            }
                                            setVerifying(false);
                                            setLoading(false);
                                            showToast('info', 'Đã hủy', 'Quá trình xác thực thiết bị đã bị hủy');
                                        }}
                                        variant="outline"
                                        className="mt-2"
                                    />
                                )}
                            </ScrollView>
                        </View>
                    </View>
                )}
            </Modal>

            {/* Camera Scanner */}
            <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
                <View className="flex-1">
                    <CameraView
                        className="flex-1"
                        onBarcodeScanned={showScanner ? handleBarCodeScanned : undefined}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr'],
                        }}
                    >
                        <View className="flex-row items-center p-5 bg-black/30">
                            <Pressable className="p-2" onPress={() => setShowScanner(false)}>
                                <Ionicons name="close" size={30} color="white" />
                            </Pressable>
                            <Text className="text-white text-lg font-bold ml-2">Quét mã QR của thiết bị</Text>
                        </View>
                        <View className="flex-1 justify-center items-center">
                            <View className="w-52 h-52 border-2 border-white bg-transparent" />
                        </View>
                    </CameraView>
                </View>
            </Modal>
        </SafeAreaWrapper>
    );
};

// Component hiển thị lưới thiết bị
const DeviceGrid = ({
    devices,
    onDevicePress,
}: {
    devices: DeviceBrand[];
    onDevicePress: (device: DeviceBrand) => void;
}) => {
    return (
        <ScrollView className="bg-white">
            <View className="flex-row flex-wrap px-4 py-2">
                {devices.map((device) => (
                    <Pressable key={device.id} className="w-1/3 items-center p-2" onPress={() => onDevicePress(device)}>
                        <View className="bg-white rounded-lg w-full items-center p-3 shadow-sm border border-gray-100">
                            <Image source={device.imageSrc} className="w-16 h-16" resizeMode="contain" />
                            <Text className="text-center text-xs mt-2">{device.name}</Text>
                        </View>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
};

export default AddDevicePage;
