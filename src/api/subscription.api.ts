import api from './client';

export interface SubscriptionStatus {
  active: boolean;
  endsAt: string | null;
}

// Admin paneldən idarə olunan premium paket
export interface SubscriptionPlan {
  id: string;
  key: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  durationDays: number;
  audience: 'all' | 'teacher' | 'student';
  badge: string | null;
  features: string[] | null;
  isActive: boolean;
  sortOrder: number;
}

// Aktiv premium paketləri çək (admin idarəli) — audience-ə görə mobildə süzülür.
export const getPlans = () =>
  api.get<SubscriptionPlan[]>('/subscription/plans').then((r) => r.data);

// Müəllim abunəliyini aktivləşdirir (ödəniş axınından çağırılır). months: 3 | 6 | 12
export const subscribeTeacher = (months: number) =>
  api.post<{ success: boolean; endsAt: string }>('/subscription/subscribe', { months }).then((r) => r.data);

// Paket key-i ilə abunə ol (müəllim & şagird) — qiymət/müddət serverdə paketdən götürülür.
export const subscribeByPlan = (planKey: string) =>
  api.post<{ success: boolean; endsAt: string }>('/subscription/subscribe', { planKey }).then((r) => r.data);

export const getSubscriptionStatus = () =>
  api.get<SubscriptionStatus>('/subscription/status').then((r) => r.data);
