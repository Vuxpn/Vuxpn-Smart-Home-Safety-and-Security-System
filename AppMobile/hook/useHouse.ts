// AppMobile/hook/useHouse.ts (nếu cần cập nhật)
import { useEffect } from 'react';
import { Alert } from 'react-native';
import useHomeStore from '../store/houseStore';

export default function useHouse() {
    const {
        homes,
        currentHome,
        isLoading,
        error,
        getHomes,
        getHomeById,
        createHome,
        updateHome,
        deleteHome,
        setCurrentHome,
    } = useHomeStore();

    useEffect(() => {
        loadHomes();
    }, []);

    const loadHomes = async () => {
        try {
            await getHomes();
        } catch (error: any) {
            console.error('Lỗi khi tải danh sách nhà:', error.message);
        }
    };

    return {
        homes,
        currentHome,
        isLoading,
        error,
        loadHomes,
        getHomeById,
        createHome,
        updateHome,
        deleteHome,
        setCurrentHome,
    };
}
