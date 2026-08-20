import client from './client';
import { API_BASE_URL } from '../constants/config';

export interface Certificate {
  id: string;
  examId: string;
  examTitle: string;
  /** İmtahan sətrindən gəlir — köhnə backend cavabında olmaya bilər. */
  subject?: string | null;
  grade?: string | null;
  examType?: 'practice' | 'monthly' | 'national' | 'live' | null;
  categoryKey?: string | null;
  score: number;
  total: number;
  percentage: number;
  issuedAt: string;
  /** Serverdə admin astanalarına görə hesablanır (certificate_settings). */
  tier?: { key: string; label: string; min: number } | null;
  /** İnsan üçün nömrə: KIMI-2026-XXXXXX. */
  certificateNo?: string | null;
  /**
   * `false` → sertifikat mətni «uğurla başa vurdu» DEMƏMƏLİDİR.
   * (Canlıda 0/20 nəticə üçün məhz belə mətn çıxırdı.)
   */
  passed?: boolean;
}

/**
 * Paylaşılan sertifikatın ictimai yoxlama ünvanı.
 *
 * Serverdə `GET /api/sertifikat/:id` real HTML səhifə qaytarır (OG etiketləri
 * ilə — WhatsApp/Telegram-da kart kimi görünür). Beləcə paylaşım sadəcə mətn
 * deyil, yoxlana bilən link olur.
 */
export const certificateVerifyUrl = (certificateId: string) =>
  `${API_BASE_URL}/sertifikat/${certificateId}`;

/**
 * Sertifikatın QR şəkli — SERVERDƏ yaradılır, mobil sadəcə <Image> göstərir.
 * ⚠️ Yol uzantısızdır: nginx `.png` ilə bitən sorğuları /api proxy-sinə ötürmür.
 */
export const certificateQrUrl = (certificateId: string) =>
  `${API_BASE_URL}/sertifikat/${certificateId}/qr`;

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
