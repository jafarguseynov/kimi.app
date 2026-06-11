import apiClient from './client';
import { Exam, ExamSession, ExamResult } from '../types/exam.types';

export interface ExamFilters {
  categoryKey?: string;
  subKey?: string;
  subject?: string;
  grade?: string;
  limit?: number;
}

function buildQuery(filters?: ExamFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.categoryKey) params.set('categoryKey', filters.categoryKey);
  if (filters.subKey)      params.set('subKey', filters.subKey);
  if (filters.subject)     params.set('subject', filters.subject);
  if (filters.grade)       params.set('grade', filters.grade);
  if (filters.limit)       params.set('limit', String(filters.limit));
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const getExams = (filters?: ExamFilters) =>
  apiClient.get<Exam[]>(`/exam${buildQuery(filters)}`).then((r) => r.data);

export const getExamsForUser = (filters?: ExamFilters) =>
  apiClient.get<Exam[]>(`/exam/for-me${buildQuery(filters)}`).then((r) => r.data);

// ─── Admin paneldən idarə olunan imtahan kateqoriyaları ─────────────────────
export interface RemoteCategory {
  id: string;
  key: string;
  title: string;
  description: string | null;
  emoji: string | null;
  bg: string | null;
  subjects: string[] | null;
  sortOrder: number;
  isActive: boolean;
  children: RemoteCategory[];
}

export const getExamCategories = () =>
  apiClient.get<RemoteCategory[]>('/exam-categories').then((r) => r.data);

export const startExam = (examId: string) =>
  // Longer timeout: the backend may be cold-starting (Render free tier),
  // which can exceed the default 15s client timeout.
  apiClient.post<ExamSession>('/exam/start', { examId }, { timeout: 45000 }).then((r) => r.data);

export const submitExam = (
  examId: string,
  answers: Record<string, string>,
  timeSpent: number,
  type?: 'practice' | 'monthly' | 'national' | 'live',
) =>
  apiClient.post<ExamResult>('/exam/submit', { examId, answers, timeSpent, type }, { timeout: 45000 }).then((r) => r.data);

export interface GenerateExamPayload {
  categoryKey?: string;
  subKey?: string;
  subject: string;
  topics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  questionCount?: number;
  duration?: number;
  grade?: string;
  type?: 'practice' | 'monthly' | 'national' | 'live';
}

export interface GeneratedExam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  difficulty: string;
  questionCount: number;
  categoryKey?: string;
  subKey?: string;
  grade?: string;
}

export const generateExam = (payload: GenerateExamPayload) =>
  apiClient.post<GeneratedExam>('/exam/generate', payload, { timeout: 45000 }).then((r) => r.data);
