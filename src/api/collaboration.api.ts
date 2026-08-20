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
  subject?: string | null;
  premiumDays?: number;
  // Müəllimin bir neçə fənni varsa: şagird fənn seçməlidir (üzvlük hələ yaradılmayıb)
  needsSubject?: boolean;
  subjects?: string[];
}

// Şagirdin qoşulduğu müəllim — fənni ilə
export interface MyTeacher {
  teacherId: string;
  teacherName: string;
  subject: string | null;
  joinedAt: string;
  rating: number | null;
  level: number | null;
  isVerified: boolean;
}

export const getMyClass = () =>
  apiClient.get<TeacherClassInfo>('/collab/class').then((r) => r.data);

export const getClassMembers = () =>
  apiClient.get<ClassMember[]>('/collab/students').then((r) => r.data);

// Şagirdin qoşulduğu müəllim(lər)
export const getMyTeachers = () =>
  apiClient.get<MyTeacher[]>('/collab/my-teachers').then((r) => r.data);

// subject: müəllimin bir neçə fənni varsa seçilən fənn (əks halda boş)
export const joinTeacher = (code: string, subject?: string) =>
  apiClient.post<JoinResult>('/collab/join', { code, subject }).then((r) => r.data);
