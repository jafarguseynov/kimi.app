import apiClient from './client';

export interface DuelHistoryItem {
  id: string;
  subject: string;
  opponentName: string | null;
  myScore: number;
  opponentScore: number;
  result: 'win' | 'loss' | 'draw';
  stake: number;
  xpEarned: number;
  createdAt: string;
}

export interface DuelStats {
  winRate: number;
  total: number;
  wins: number;
}

// Cari istifadəçiyə gələn, hələ cavablandırılmamış canlı duel dəvəti.
export interface PendingDuelInvite {
  id: string;
  challengerName: string;
  challengerLevel?: number;
  challengerSchool?: string;
  challengerXp?: number;
  challengerWinRate?: number;
  subject?: string;
  questionCount?: number;
  stake?: number;
}

// Cari istifadəçinin duel tarixçəsi (son oyunlar).
export const getDuelHistory = (limit = 30) =>
  apiClient.get<DuelHistoryItem[]>('/duel/history', { params: { limit } }).then((r) => r.data);

// Qalibiyyət statistikası (winRate, total, wins).
export const getDuelStats = () =>
  apiClient.get<DuelStats>('/duel/stats').then((r) => r.data);

// Gözləyən canlı duel dəvəti (varsa) — yoxdursa null.
export const getPendingDuelInvite = () =>
  apiClient
    .get<PendingDuelInvite | null>('/duel/invite/pending')
    .then((r) => r.data ?? null)
    .catch(() => null);

// Dosta duel dəvəti göndər. Qaytarır: yaradılmış dəvət (id ilə).
export const createDuelInvite = (
  opponentId: string,
  opts: { subject?: string; questionCount?: number; stake?: number },
) =>
  apiClient
    .post<PendingDuelInvite & { challengerId: string; opponentId: string }>('/duel/invite', {
      opponentId,
      ...opts,
    })
    .then((r) => r.data);

// Gələn dəvətə cavab: qəbul/imtina.
export const respondDuelInvite = (inviteId: string, accept: boolean) =>
  apiClient
    .post<{ status: string; inviteId: string }>(`/duel/invite/${inviteId}/respond`, { accept })
    .then((r) => r.data);

// Çağıran öz dəvətini ləğv edir.
export const cancelDuelInvite = (inviteId: string) =>
  apiClient.post(`/duel/invite/${inviteId}/cancel`, {}).then((r) => r.data).catch(() => null);
