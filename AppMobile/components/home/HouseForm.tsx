import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location'; // Replace Geolocation with expo-location
import MapView, { Marker } from 'react-native-maps';
import SafeAreaWrapper from '@/components/layout/SafeAreaWrapper';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useHouse from '@/hook/useHouse';

interface HouseFormProps {
    homeId?: string;
}

export default function HouseForm({ homeId }: HouseFormProps) {
    const { homes, isLoading, createHome, updateHome, getHomeById } = useHouse();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [nameError, setNameError] = useState('');
    const [addressError, setAddressError] = useState('');

    // State for map
    const [mapVisible, setMapVisible] = useState(false);
    const [location, setLocation] = useState({
        latitude: 21.0285, // Default: Hà Nội
        longitude: 105.8542,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const isEditMode = !!homeId;

    useEffect(() => {
        if (isEditMode) {
            loadHomeData();
        }
    }, [homeId]);

    const loadHomeData = async () => {
        if (!homeId) return;

        setLoading(true);
        try {
            const existingHome = homes.find((home) => home._id === homeId);

            if (existingHome) {
                setName(existingHome.name);
                setAddress(existingHome.address);
            } else {
                await getHomeById(homeId);
                const home = homes.find((h) => h._id === homeId);
                if (home) {
                    setName(home.name);
                    setAddress(home.address);
                }
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông tin nhà');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        let isValid = true;

        if (!name.trim()) {
            setNameError('Vui lòng nhập tên nhà');
            isValid = false;
        } else {
            setNameError('');
        }

        if (!address.trim()) {
            setAddressError('Vui lòng nhập địa chỉ');
            isValid = false;
        } else {
            setAddressError('');
        }

        return isValid;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const houseData = { name, address };

            if (isEditMode && homeId) {
                await updateHome(homeId, houseData);
                Alert.alert('Thành công', 'Cập nhật thông tin nhà thành công');
            } else {
                await createHome(houseData);
                Alert.alert('Thành công', 'Thêm nhà mới thành công');
            }
            router.back();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể lưu thông tin nhà');
        } finally {
            setLoading(false);
        }
    };

    const requestLocationPermission = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Quyền truy cập vị trí bị từ chối');
                return false;
            }

            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            return true;
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const openMap = async () => {
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
            setMapVisible(true);
        }
    };

    const getAddressFromCoordinates = async (lat: number, lng: number) => {
        try {
            const geocode = await Location.reverseGeocodeAsync({
                latitude: lat,
                longitude: lng,
            });

            if (geocode.length > 0) {
                const { streetNumber, street, city, region, country } = geocode[0];
                const formattedAddress = [streetNumber, street, city, region, country].filter(Boolean).join(', ');
                setAddress(formattedAddress);
            } else {
                Alert.alert('Lỗi', 'Không thể lấy địa chỉ từ tọa độ');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lấy địa chỉ từ tọa độ');
        }
    };

    const renderMapModal = () => (
        <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
            <View style={{ flex: 1 }}>
                <MapView
                    style={{ flex: 1 }}
                    region={location}
                    showsUserLocation
                    onRegionChangeComplete={(region) => setLocation(region)}
                >
                    <Marker
                        draggable
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        onDragEnd={(e) => {
                            const { latitude, longitude } = e.nativeEvent.coordinate;
                            setLocation({ ...location, latitude, longitude });
                        }}
                    />
                </MapView>

                <View
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 0,
                        right: 0,
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                    }}
                >
                    <TouchableOpacity
                        style={{ backgroundColor: '#f04037', padding: 15, borderRadius: 10 }}
                        onPress={() => setMapVisible(false)}
                    >
                        <Text style={{ color: 'white' }}>Hủy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ backgroundColor: '#3498db', padding: 15, borderRadius: 10 }}
                        onPress={async () => {
                            await getAddressFromCoordinates(location.latitude, location.longitude);
                            setMapVisible(false);
                        }}
                    >
                        <Text style={{ color: 'white' }}>Chọn vị trí này</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaWrapper>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="flex-row items-center mb-6">
                        <TouchableOpacity className="p-2 mr-2" onPress={() => router.back()}>
                            <Feather name="arrow-left" size={24} color="black" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold">{isEditMode ? 'Chỉnh sửa nhà' : 'Thêm nhà mới'}</Text>
                    </View>

                    {loading && !isLoading ? (
                        <View className="flex-1 justify-center items-center py-10">
                            <ActivityIndicator size="large" color="#f04037" />
                            <Text className="mt-4 text-gray-500">
                                {isEditMode ? 'Đang tải thông tin...' : 'Đang xử lý...'}
                            </Text>
                        </View>
                    ) : (
                        <View className="mt-4">
                            <Input
                                label="Tên nhà"
                                value={name}
                                onChangeText={setName}
                                placeholder="Nhập tên nhà"
                                error={nameError}
                            />

                            <View style={{ marginTop: 16 }}>
                                <Input
                                    label="Địa chỉ"
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Nhập địa chỉ nhà"
                                    error={addressError}
                                />
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 8,
                                    }}
                                    onPress={openMap}
                                >
                                    <Feather name="map-pin" size={16} color="#3498db" />
                                    <Text style={{ color: '#3498db', marginLeft: 5 }}>Chọn từ bản đồ</Text>
                                </TouchableOpacity>
                            </View>

                            <Button
                                title={isEditMode ? 'Cập nhật' : 'Thêm mới'}
                                onPress={handleSubmit}
                                isLoading={loading}
                                className="mt-4"
                            />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {renderMapModal()}
        </SafeAreaWrapper>
    );
}
