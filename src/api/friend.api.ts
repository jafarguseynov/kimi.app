import apiClient from './client';

export interface FriendItem {
  friendshipId: string;
  id: string;
  name: string;
  avatarUrl: string | null;
  online: boolean;
  lastSeenAt: string | null;
}

export interface FriendSearchItem {
  id: string;
  name: string;
  avatarUrl: string | null;
  online: boolean;
  relation: 'none' | 'requested' | 'incoming' | 'friends';
  subtitle?: string | null; // ayırd edici: şəhər · məktəb
}

// Qəbul edilmiş dostlar.
export const getFriends = () =>
  apiClient.get<FriendItem[]>('/friends').then((r) => r.data);

// Gələn (qəbul gözləyən) dostluq sorğuları.
export const getFriendRequests = () =>
  apiClient.get<FriendItem[]>('/friends/requests').then((r) => r.data);

// Dost əlavə etmək üçün istifadəçi axtarışı.
export const searchUsers = (q: string) =>
  apiClient.get<FriendSearchItem[]>('/friends/search', { params: { q } }).then((r) => r.data);

// Dostluq sorğusu göndər.
export const sendFriendRequest = (targetId: string) =>
  apiClient.post('/friends/request', { targetId }).then((r) => r.data);

// Gələn sorğunu qəbul et / rədd et.
export const respondFriendRequest = (friendshipId: string, accept: boolean) =>
  apiClient.post(`/friends/${friendshipId}/respond`, { accept }).then((r) => r.data);

// Dostluğu sil.
export const removeFriend = (friendshipId: string) =>
  apiClient.delete(`/friends/${friendshipId}`).then((r) => r.data);
