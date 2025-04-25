import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import Card from '../ui/Card';
import { Feather } from '@expo/vector-icons';

interface House {
    _id: string;
    name: string;
    address: string;
}

interface HouseListProps {
    houses: House[];
    isLoading: boolean;
    onSelectHouse?: (house: House) => void;
}

const HouseList: React.FC<HouseListProps> = ({ houses, isLoading, onSelectHouse }) => {
    if (isLoading) {
        return (
            <View className="py-10 items-center">
                <Feather name="loader" size={32} color="#f04037" />
                <Text className="text-gray-500 mt-3">Đang tải...</Text>
            </View>
        );
    }

    if (houses.length === 0) {
        return (
            <View className="py-10 items-center">
                <Image
                    source={require('../../assets/empty-house.png')}
                    style={styles.emptyImage}
                    defaultSource={require('../../assets/empty-house.png')}
                />
                <Text className="text-gray-700 font-medium text-lg mt-4">Chưa có ngôi nhà nào</Text>
                <Text className="text-gray-500 mt-1 text-center">Hãy thêm ngôi nhà đầu tiên của bạn</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={houses}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
                <Card
                    onPress={() => onSelectHouse && onSelectHouse(item)}
                    className="mb-4 overflow-hidden border border-gray-100"
                >
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 rounded-full bg-red-50 mr-4 items-center justify-center">
                            <Feather name="home" size={22} color="#f04037" />
                        </View>
                        <View className="flex-1 ">
                            <Text className="text-lg font-bold">{item.name}</Text>
                            <View className="flex-row items-center mt-1 ">
                                <Feather name="map-pin" size={12} color="#666" />
                                <Text className="text-gray-500 ml-1 text-sm ">{item.address}</Text>
                            </View>
                        </View>
                    </View>
                </Card>
            )}
        />
    );
};

const styles = StyleSheet.create({
    emptyImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        tintColor: '#ccc',
    },
});

export default HouseList;
