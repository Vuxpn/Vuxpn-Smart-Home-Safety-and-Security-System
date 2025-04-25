// AppMobile/components/home/HomeHeader.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Home {
    _id: string;
    name: string;
    address: string;
}

interface HomeHeaderProps {
    currentHome: Home | null;
    homes: Home[];
    onSelectHome: (home: Home) => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ currentHome, homes, onSelectHome }) => {
    const [showHouseMenu, setShowHouseMenu] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);

    // Giá trị mặc định cho thông tin môi trường
    const temperature = '27°C';
    const humidity = '84%';
    const gasLevel = 'An toàn';

    return (
        <View className="mb-5">
            {/* Dòng 1: Tên nhà và các nút */}
            <View className="flex-row items-center justify-between mb-2">
                <Pressable className="flex-row items-center" onPress={() => setShowHouseMenu(true)}>
                    <Text className="text-2xl font-bold mr-1">{currentHome?.name || 'Nhà của tôi'}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
                </Pressable>

                <View className="flex-row">
                    {/* Nút thông báo */}
                    <Pressable className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2">
                        <Ionicons name="notifications-outline" size={22} color="black" />
                        <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></View>
                    </Pressable>

                    {/* Nút menu 3 chấm */}
                    <Pressable
                        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                        onPress={() => setShowOptionsMenu(true)}
                    >
                        <Feather name="more-vertical" size={22} color="black" />
                    </Pressable>
                </View>
            </View>

            {/* Dòng 2: Thông tin về vị trí, nhiệt độ, độ ẩm, khí gas */}
            <View className="flex-row flex-wrap items-center w-[80%]">
                {/* Vị trí */}
                <View className="flex-row items-center mr-4 my-1">
                    <Feather name="map-pin" size={16} color="gray" />
                    <Text className="text-gray-500 ml-1">{currentHome?.address || 'Hà Nội'}</Text>
                </View>

                {/* Nhiệt độ */}
                <View className="flex-row items-center mr-4 my-1">
                    <Feather name="thermometer" size={16} color="orange" />
                    <Text className="text-gray-500 ml-1">{temperature}</Text>
                </View>

                {/* Độ ẩm */}
                <View className="flex-row items-center mr-4 my-1">
                    <Feather name="droplet" size={16} color="blue" />
                    <Text className="text-gray-500 ml-1">{humidity}</Text>
                </View>

                {/* Khí gas */}
                <View className="flex-row items-center my-1">
                    <MaterialCommunityIcons name="gas-cylinder" size={16} color="green" />
                    <Text className="text-gray-500 ml-1">{gasLevel}</Text>
                </View>
            </View>

            {/* Modal chọn nhà */}
            <Modal
                visible={showHouseMenu}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowHouseMenu(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Nhà của tôi</Text>
                            <Pressable onPress={() => setShowHouseMenu(false)}>
                                <Ionicons name="close" size={24} color="black" />
                            </Pressable>
                        </View>

                        <FlatList
                            data={homes}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={styles.homeItem}
                                    onPress={() => {
                                        onSelectHome(item);
                                        setShowHouseMenu(false);
                                    }}
                                >
                                    <Ionicons name="home-outline" size={22} color="#f04037" />
                                    <Text style={styles.homeName}>{item.name}</Text>
                                </Pressable>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyText}>Không có nhà nào</Text>}
                        />

                        <Pressable
                            style={styles.manageButton}
                            onPress={() => {
                                setShowHouseMenu(false);
                                router.push('/home/manage-house');
                            }}
                        >
                            <Text style={styles.manageButtonText}>Quản lý nhà</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Modal tùy chọn 3 chấm */}
            <Modal
                visible={showOptionsMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowOptionsMenu(false)}
            >
                <Pressable style={styles.modalContainer} onPress={() => setShowOptionsMenu(false)}>
                    <View style={[styles.optionsMenu, { right: 10, top: 70 }]}>
                        <Pressable
                            style={styles.optionItem}
                            onPress={() => {
                                setShowOptionsMenu(false);
                                router.push('/home/manage-house');
                            }}
                        >
                            <Ionicons name="home" size={20} color="black" />
                            <Text style={styles.optionText}>Quản lý nhà</Text>
                        </Pressable>

                        <Pressable
                            style={styles.optionItem}
                            onPress={() => {
                                setShowOptionsMenu(false);
                                // router.push('/home/add-device');
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={20} color="black" />
                            <Text style={styles.optionText}>Thêm thiết bị</Text>
                        </Pressable>

                        <Pressable
                            style={styles.optionItem}
                            onPress={() => {
                                setShowOptionsMenu(false);
                                //router.push('/home/members');
                            }}
                        >
                            <Ionicons name="people-outline" size={20} color="black" />
                            <Text style={styles.optionText}>Quản lý thành viên</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 30,
        maxHeight: '70%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    homeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    homeName: {
        fontSize: 16,
        marginLeft: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: 'gray',
    },
    manageButton: {
        backgroundColor: '#f04037',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    manageButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    optionsMenu: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: 200,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    optionText: {
        marginLeft: 12,
        fontSize: 14,
    },
});

export default HomeHeader;
