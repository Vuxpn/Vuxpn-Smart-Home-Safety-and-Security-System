import apiClient from './apiClient';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'camera' | 'smartHome' | 'system';
    isRead: boolean;
    createdAt: string;
}

const notificationService = {
    async getNotifications(): Promise<Notification[]> {
        const response = await apiClient.get('/notifications');
        return response.data;
    },

    async markAsRead(notificationId: string): Promise<any> {
        const response = await apiClient.put(`/notifications/${notificationId}/read`);
        return response.data;
    },

    async markAllAsRead(): Promise<any> {
        const response = await apiClient.put('/notifications/read-all');
        return response.data;
    },

    async deleteNotification(notificationId: string): Promise<any> {
        const response = await apiClient.delete(`/notifications/${notificationId}`);
        return response.data;
    },

    async deleteMultipleNotifications(notificationIds: string[]): Promise<any> {
        const response = await apiClient.post('/notifications/delete-multiple', { ids: notificationIds });
        return response.data;
    },
};

export default notificationService;
