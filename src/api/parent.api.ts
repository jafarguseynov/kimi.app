import apiClient from './client';

export interface ChildItem {
  linkId: string;
  id: string;
  name: string;
  avatarUrl: string | null;
  grade: string | null;
  school: string | null;
  relationship: 'mother' | 'father' | 'guardian' | 'other';
  online: boolean;
  lastSeenAt: string | null;
  avgScore: number;
  attempts: number;
  lastActiveAt: string | null;
}

// Cari valideynin bağlı uşaqları.
export const getMyChildren = () =>
  apiClient.get<ChildItem[]>('/parent/children').then((r) => r.data);

// Uşağı e-poçt və ya telefon nömrəsi ilə bağla.
export const linkChild = (identifier: string) =>
  apiClient.post('/parent/link', { identifier }).then((r) => r.data);

// Bağlantını sil.
export const unlinkChild = (linkId: string) =>
  apiClient.delete(`/parent/children/${linkId}`).then((r) => r.data);
