import api from './client';

export interface SubscriptionStatus {
  active: boolean;
  endsAt: string | null;
}

// Müəllim abunəliyini aktivləşdirir (ödəniş axınından çağırılır). months: 3 | 6 | 12
export const subscribeTeacher = (months: number) =>
  api.post<{ success: boolean; endsAt: string }>('/subscription/subscribe', { months }).then((r) => r.data);

export const getSubscriptionStatus = () =>
  api.get<SubscriptionStatus>('/subscription/status').then((r) => r.data);
