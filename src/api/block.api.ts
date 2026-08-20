import apiClient from './client';

/**
 * İstifadəçi blokları — «Bloklanmış istifadəçilər» ekranı və çat menyusu.
 * Blok iki tərəflidir: bloklamış cütlük bir-birinə mesaj yaza bilmir.
 */
export interface BlockedUser {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  blockedAt: string;
}

export const getBlockedUsers = () =>
  apiClient.get<BlockedUser[]>('/blocks').then((r) => r.data);

export const getBlockStatus = (userId: string) =>
  apiClient.get<{ blocked: boolean; blockedBy: boolean }>(`/blocks/status/${userId}`).then((r) => r.data);

export const blockUser = (userId: string) =>
  apiClient.post(`/blocks/${userId}`).then((r) => r.data);

export const unblockUser = (userId: string) =>
  apiClient.delete(`/blocks/${userId}`).then((r) => r.data);
