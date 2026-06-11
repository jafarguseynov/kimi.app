import apiClient from './client';
import { ExamSession, ExamResult } from '../types/exam.types';

export interface ExamCollectionCard {
  id: string;
  title: string;
  subject?: string;
  grade?: string;
  description?: string;
  coverUrl?: string;
  access: 'free' | 'premium';
  questionsPerTest: number;
  duration: number;
  questionCount: number;
  locked: boolean;
  bestScore: number | null;
}

// Aktiv bank kartları (şagird üçün, premium kilid statusu ilə)
export const getExamCollections = () =>
  apiClient.get<ExamCollectionCard[]>('/exam/collections').then((r) => r.data);

// Karta toxunanda: hovuzdan random N sual ilə test başlat
export const startCollectionTest = (id: string) =>
  apiClient
    .post<ExamSession>(`/exam/collections/${id}/start`, {}, { timeout: 45000 })
    .then((r) => r.data);

// Testi təqdim et: cavablar + verilən sualların id-ləri
export const submitCollectionTest = (
  id: string,
  questionIds: string[],
  answers: Record<string, string>,
  timeSpent: number,
) =>
  apiClient
    .post<ExamResult>(`/exam/collections/${id}/submit`, { questionIds, answers, timeSpent }, { timeout: 45000 })
    .then((r) => r.data);
