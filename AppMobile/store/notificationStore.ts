import { create } from 'zustand';
import notificationService, { Notification } from '@/services/notificationService';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    getNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    deleteMultipleNotifications: (notificationIds: string[]) => Promise<void>;
    clearError: () => void;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    getNotifications: async () => {
        try {
            set({ isLoading: true, error: null });
            const notifications = await notificationService.getNotifications();
            const unreadCount = notifications.filter((n) => !n.isRead).length;

            set({
                notifications,
                unreadCount,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể lấy thông báo',
            });
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);

            const updatedNotifications = get().notifications.map((notification) =>
                notification.id === notificationId ? { ...notification, isRead: true } : notification,
            );

            const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;

            set({
                notifications: updatedNotifications,
                unreadCount,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Không thể đánh dấu đã đọc',
            });
        }
    },

    markAllAsRead: async () => {
        try {
            set({ isLoading: true, error: null });
            await notificationService.markAllAsRead();

            const updatedNotifications = get().notifications.map((notification) => ({ ...notification, isRead: true }));

            set({
                notifications: updatedNotifications,
                unreadCount: 0,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc',
            });
        }
    },

    deleteNotification: async (notificationId: string) => {
        try {
            set({ isLoading: true, error: null });
            await notificationService.deleteNotification(notificationId);

            const updatedNotifications = get().notifications.filter(
                (notification) => notification.id !== notificationId,
            );

            const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;

            set({
                notifications: updatedNotifications,
                unreadCount,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể xóa thông báo',
            });
        }
    },

    deleteMultipleNotifications: async (notificationIds: string[]) => {
        try {
            set({ isLoading: true, error: null });
            await notificationService.deleteMultipleNotifications(notificationIds);

            const updatedNotifications = get().notifications.filter(
                (notification) => !notificationIds.includes(notification.id),
            );

            const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;

            set({
                notifications: updatedNotifications,
                unreadCount,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Không thể xóa nhiều thông báo',
            });
        }
    },

    clearError: () => set({ error: null }),
}));

export default useNotificationStore;
