import client from './client';

export interface Certificate {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  total: number;
  percentage: number;
  issuedAt: string;
}

export type ExamType = 'practice' | 'monthly' | 'national' | 'live';

export interface ExamResultRow {
  id: string;
  examId: string;
  examTitle: string;
  examType?: ExamType;
  subject?: string;
  score: number;
  total: number;
  correct?: number;
  wrong?: number;
  unanswered?: number;
  answered?: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
}

export const getCertificates = (): Promise<Certificate[]> =>
  client.get('/exam/certificates').then(r => r.data);

export const getCertificate = (examId: string): Promise<Certificate> =>
  client.get(`/exam/certificate/${examId}`).then(r => r.data);

export const getExamResults = (): Promise<ExamResultRow[]> =>
  client.get('/exam/results').then(r => r.data);

export const getExamResult = (examId: string): Promise<ExamResultRow> =>
  client.get(`/exam/result/${examId}`).then(r => r.data);

export type QuestionStatus = 'correct' | 'wrong' | 'unanswered';

export interface ExamReviewQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  userOptionId: string | null;
  isCorrect: boolean;
  status: QuestionStatus;
  explanation?: string | null;
  optionExplanations?: Record<string, string> | null;
}

export interface ExamReview {
  examId: string;
  examTitle: string;
  subject: string;
  score: number;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  answered: number;
  questions: ExamReviewQuestion[];
}

export const getExamReview = (examId: string): Promise<ExamReview> =>
  client.get(`/exam/result/${examId}/review`).then(r => r.data);

// Task 15 — sualın həllini gör (AI ilə yaradılıb keşlənir, ilk dəfə bir az gözləmə ola bilər)
export interface QuestionSolution {
  questionId: string;
  explanation: string;
  optionExplanations: Record<string, string> | null;
  correctOptionId: string;
  cached?: boolean;
  fallback?: boolean;
}

export const getQuestionSolution = (questionId: string): Promise<QuestionSolution> =>
  client.get(`/exam/question/${questionId}/solution`, { timeout: 45000 }).then(r => r.data);
