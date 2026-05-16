import apiClient from './client';
import { Exam, ExamSession, ExamResult } from '../types/exam.types';

export const getExams = () =>
  apiClient.get<Exam[]>('/exam').then((r) => r.data);

export const startExam = (examId: string) =>
  apiClient.post<ExamSession>('/exam/start', { examId }).then((r) => r.data);

export const submitExam = (examId: string, answers: Record<string, string>, timeSpent: number) =>
  apiClient.post<ExamResult>('/exam/submit', { examId, answers, timeSpent }).then((r) => r.data);
