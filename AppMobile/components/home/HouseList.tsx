import React from 'react';
import { View, Text, FlatList } from 'react-native';
import Card from '../ui/Card';

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
                <Text className="text-gray-500">Đang tải...</Text>
            </View>
        );
    }

    if (houses.length === 0) {
        return (
            <View className="py-10 items-center">
                <Text className="text-gray-500">Bạn chưa có ngôi nhà nào</Text>
                <Text className="text-gray-500 mt-1">Hãy thêm ngôi nhà đầu tiên của bạn</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={houses}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <Card onPress={() => onSelectHouse && onSelectHouse(item)}>
                    <Text className="text-lg font-bold">{item.name}</Text>
                    <Text className="text-gray-500 mt-1">{item.address}</Text>
                </Card>
            )}
        />
    );
};

export default HouseList;
