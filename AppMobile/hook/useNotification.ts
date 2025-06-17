import { useEffect } from 'react';
import useNotificationStore from '../store/notificationStore';

export default function useNotification() {
    const {
        notifications,
        unreadCount,
        isLoading,
        error,
        getNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteMultipleNotifications,
    } = useNotificationStore();

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            await getNotifications();
        } catch (error) {
            console.error('Lỗi khi tải thông báo:', error);
        }
    };

    // Nhóm thông báo theo loại
    const notificationsByType = {
        camera: notifications.filter((n) => n.type === 'camera'),
        smartHome: notifications.filter((n) => n.type === 'smartHome'),
        system: notifications.filter((n) => n.type === 'system'),
    };

    return {
        notifications,
        notificationsByType,
        unreadCount,
        isLoading,
        error,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteMultipleNotifications,
    };
}
