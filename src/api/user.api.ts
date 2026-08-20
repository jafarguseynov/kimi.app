import apiClient from './client';
import { UserProfile } from '../types/auth.types';

export interface Teacher {
  id: string;
  name: string;
  subjects?: string[];
  hourlyRate?: number;
  rating?: number;
  bio?: string;
  headline?: string | null;
  role: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  offersFreeDemo?: boolean;
  profileViews?: number; // real profil baxış sayı (backend)
}

export interface TeacherAnalytics {
  monthlyEarnings: number;
  totalStudents: number;
  profileViews: number;
  rating: number;
  activeQueries: number;
}

export const getMe = () =>
  apiClient.get<UserProfile>('/user/me').then((r) => r.data);

export const updateUser = (data: Partial<UserProfile>) =>
  apiClient.put<UserProfile>('/user/update', data).then((r) => r.data);

export const getTeachers = (params?: { limit?: number; subject?: string; q?: string }) =>
  apiClient.get<Teacher[]>('/user/teachers', { params }).then((r) => r.data);

export const getTeacherAnalytics = () =>
  apiClient.get<TeacherAnalytics>('/user/teacher/analytics').then((r) => r.data);

// Tək müəllimi id ilə gətir (avatar + ad + profil) — rəy ekranında şəkil üçün.
export const getTeacherById = (id: string) =>
  apiClient.get<{ id: string; name?: string; avatarUrl?: string | null }>(`/user/teacher/${id}`)
    .then((r) => r.data)
    .catch(() => null);

// Məzmun/istifadəçi şikayəti (moderation) — POST /report.
export const reportContent = (data: { targetId: string; targetType: string; reason: string }) =>
  apiClient.post('/report', data).then((r) => r.data);

// Müəllim profilinə baxış qeyd et — hər açılışda +1.
export const recordTeacherView = (teacherId: string) =>
  apiClient.post<{ profileViews?: number }>(`/user/teacher/${teacherId}/view`, {}).then((r) => r.data).catch(() => null);

export interface TeacherStudent {
  id: string;
  name: string;
  subjects: string[];
  examsTaken: number;
  avgScore: number | null;
  weakSubjects: { subject: string; avg: number }[];
  lastActivityAt: string | null;
}

export const getTeacherStudents = () =>
  apiClient.get<TeacherStudent[]>('/user/teacher/students').then((r) => r.data);

export const boostTeacher = (days: number) =>
  apiClient.post<{ success: boolean; featuredUntil: string }>('/user/teacher/boost', { days }).then((r) => r.data);

// Yarımçıq profil üçün xatırlatma bildirişi yaradır (72h idempotent — backend tərəfdə)
export const ensureProfileReminder = () =>
  apiClient.post<{ created: boolean; complete?: boolean; pct?: number }>('/user/teacher/profile-reminder').then((r) => r.data);

// ─── Favorit müəllimlər (server tərəfli) ───
// Qeyd: burada xətanı UDMURUQ — çağıran (store) 401/şəbəkə xətasında lokal keşi
// boş siyahı ilə əvəz etməsin deyə uğursuzluğu ayırd etməlidir.
export const getFavoriteTeacherIds = () =>
  apiClient.get<string[]>('/user/teachers/favorites').then((r) => r.data);

export const toggleFavoriteTeacher = (teacherId: string) =>
  apiClient.post<{ favorited: boolean }>(`/user/teachers/${teacherId}/favorite`, {}).then((r) => r.data);

// ─── Müəllim səviyyəsi (level) irəliləyişi (müəllimin öz paneli) ───
export interface TeacherLevelProgress {
  level: number;
  levelKey: string;
  overridden: boolean;
  enabled: boolean;
  current: { completedLessons: number; rating: number; reviews: number; favorites: number; complete: boolean };
  next: {
    level: number;
    levelKey: string;
    need: { lessons: number; rating: number; reviews: number; favorites: number; requireComplete: boolean };
    remaining: { lessons: number; reviews: number; favorites: number; ratingOk: boolean; completeOk: boolean };
  } | null;
}
export const getTeacherLevelProgress = () =>
  apiClient.get<TeacherLevelProgress>('/teacher-level/progress').then((r) => r.data).catch(() => null);
