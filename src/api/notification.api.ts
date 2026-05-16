import client from './client';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const res = await client.get('/notification');
  return res.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await client.get('/notification/unread-count');
  return res.data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await client.post(`/notification/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await client.post('/notification/read-all');
};
