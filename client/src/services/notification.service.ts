import api from './api';
import type { User } from '@utils/types';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export const notificationService = {
  getNotifications: async (unreadOnly: boolean = false): Promise<NotificationResponse> => {
    const response = await api.get<{ success: boolean; data: NotificationResponse }>('/notifications', {
      params: { unread: unreadOnly ? 'true' : undefined },
    });
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  clearAll: async (): Promise<void> => {
    await api.delete('/notifications');
  },
};
