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
