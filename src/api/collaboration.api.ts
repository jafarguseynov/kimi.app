import apiClient from './client';

export interface TeacherClassInfo {
  id: string;
  name: string;
  joinCode: string;
  link: string;
  memberCount: number;
}

export interface ClassMember {
  id: string;
  name: string;
  joinedAt: string;
}

export interface JoinResult {
  joined: boolean;
  alreadyMember?: boolean;
  teacherName: string;
  premiumDays?: number;
}

export const getMyClass = () =>
  apiClient.get<TeacherClassInfo>('/collab/class').then((r) => r.data);

export const getClassMembers = () =>
  apiClient.get<ClassMember[]>('/collab/students').then((r) => r.data);

export const joinTeacher = (code: string) =>
  apiClient.post<JoinResult>('/collab/join', { code }).then((r) => r.data);
