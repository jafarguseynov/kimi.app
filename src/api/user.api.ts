import apiClient from './client';
import { UserProfile } from '../types/auth.types';

export interface Teacher {
  id: string;
  name: string;
  subjects?: string[];
  hourlyRate?: number;
  rating?: number;
  bio?: string;
  role: string;
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
