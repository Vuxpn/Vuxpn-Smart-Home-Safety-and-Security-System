import { create } from 'zustand';
import houseService from '../services/homeService';

interface Home {
    _id: string;
    name: string;
    address: string;
    members?: any[];
    owner?: any;
}

interface HomeState {
    homes: Home[];
    currentHome: Home | null;
    isLoading: boolean;
    error: string | null;

    getHomes: () => Promise<void>;
    getHomeById: (homeId: string) => Promise<void>;
    createHome: (homeData: any) => Promise<void>;
    updateHome: (homeId: string, homeData: any) => Promise<void>;
    deleteHome: (homeId: string) => Promise<void>;
    addMemberByEmail: (homeId: string, email: string) => Promise<void>;
    removeMember: (homeId: string, memberId: string) => Promise<void>;
    setCurrentHome: (home: Home) => void;
    clearError: () => void;
}

const useHomeStore = create<HomeState>((set, get) => ({
    homes: [],
    currentHome: null,
    isLoading: false,
    error: null,

    getHomes: async () => {
        try {
            set({ isLoading: true, error: null });
            const homes = await houseService.getHomes();
            set({ homes, isLoading: false });

            // Nếu có nhà và chưa có nhà hiện tại, đặt nhà đầu tiên làm nhà hiện tại
            if (homes.length > 0 && !get().currentHome) {
                set({ currentHome: homes[0] });
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể lấy danh sách nhà',
            });
        }
    },

    getHomeById: async (homeId: string) => {
        try {
            set({ isLoading: true, error: null });
            const home = await houseService.getHomeById(homeId);
            set({ currentHome: home, isLoading: false });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể lấy thông tin nhà',
            });
        }
    },

    createHome: async (homeData: any) => {
        try {
            set({ isLoading: true, error: null });
            const newHome = await houseService.createHome(homeData);

            const homes = [...get().homes, newHome];
            set({
                homes,
                currentHome: newHome,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể tạo nhà mới',
            });
            throw error;
        }
    },

    updateHome: async (homeId: string, homeData: any) => {
        try {
            set({ isLoading: true, error: null });
            const updatedHome = await houseService.updateHome(homeId, homeData);

            const homes = get().homes.map((home) => (home._id === homeId ? updatedHome : home));

            set({
                homes,
                currentHome: get().currentHome?._id === homeId ? updatedHome : get().currentHome,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể cập nhật thông tin nhà',
            });
            throw error;
        }
    },

    deleteHome: async (homeId: string) => {
        try {
            set({ isLoading: true, error: null });
            await houseService.deleteHome(homeId);

            const homes = get().homes.filter((home) => home._id !== homeId);
            const currentHome =
                get().currentHome?._id === homeId ? (homes.length > 0 ? homes[0] : null) : get().currentHome;

            set({ homes, currentHome, isLoading: false });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể xóa nhà',
            });
            throw error;
        }
    },

    addMemberByEmail: async (homeId: string, email: string) => {
        try {
            set({ isLoading: true, error: null });
            const updatedHome = await houseService.addMember(homeId, email);

            // Cập nhật danh sách nhà và nhà hiện tại với thành viên mới
            const homes = get().homes.map((home) => (home._id === homeId ? updatedHome : home));

            set({
                homes,
                currentHome: get().currentHome?._id === homeId ? updatedHome : get().currentHome,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể thêm thành viên',
            });
            throw error;
        }
    },

    removeMember: async (homeId: string, memberId: string) => {
        try {
            set({ isLoading: true, error: null });
            const updatedHome = await houseService.removeMember(homeId, memberId);

            // Cập nhật danh sách nhà và nhà hiện tại sau khi xóa thành viên
            const homes = get().homes.map((home) => (home._id === homeId ? updatedHome : home));

            set({
                homes,
                currentHome: get().currentHome?._id === homeId ? updatedHome : get().currentHome,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể xóa thành viên',
            });
            throw error;
        }
    },

    setCurrentHome: (home: Home) => set({ currentHome: home }),

    clearError: () => set({ error: null }),
}));

export default useHomeStore;
