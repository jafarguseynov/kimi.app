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

// Tək imtahan — detal/hazırlıq ekranı siyahıdan asılı qalmasın deyə.
// (Əvvəl ekranlar `useExamList()` içindən `find()` edirdi; imtahan həmin
// səhifələnmiş siyahıda yoxdursa sual sayı/müddət «?» görünürdü.)
// Kateqoriya hub-ında «N imtahan» nişanı — server hazır imtahanları sayır
// (eyni başlığın hovuzdakı variantları bir sayılır).
export interface ExamCounts {
  categories: Record<string, number>;
  /** açar formatı: `${categoryKey}:${subKey}` */
  subs: Record<string, number>;
}

export const getExamCounts = () =>
  apiClient.get<ExamCounts>('/exam/counts').then((r) => r.data);

export const getExam = (id: string) =>
  apiClient.get<Exam & { categoryKey?: string; subKey?: string; grade?: string }>(`/exam/${id}`).then((r) => r.data);

// ─── 🔥 Populyar imtahanlar ─────────────────────────────────────────────────
// Sosial sübut rəqəmləri REALDIR: `participants` = imtahanı həqiqətən həll etmiş
// unikal istifadəçi sayı, `avgPct` = onların ortalama nəticəsi (exam_results
// aqreqasiyası). İmtahanlar üçün ulduz reytinqi bazada saxlanmır, ona görə
// ⭐ göstərilmir — uydurma reytinq əvəzinə ortalama nəticə verilir.
export interface PopularExam {
  id: string;
  title: string;
  subject: string;
  grade: string | null;
  difficulty: string;
  duration: number;
  categoryKey: string | null;
  questionCount: number;
  participants: number;
  avgPct: number;
  matchesGrade: boolean;
}

export const getPopularExams = (params?: { limit?: number; grade?: string }) =>
  apiClient.get<PopularExam[]>('/exam/popular', { params }).then((r) => r.data);

// ─── 🏠 Ana səhifə imtahan lenti ────────────────────────────────────────────
// Bütün imtahanlar YÜKLƏNMİR: server yalnız `limit` (default 3) sayda kart
// qaytarır və uyğunluq balını özü hesablayır (sinif · zəif fənn · hədəf ·
// populyarlıq · yenilik). Bütün rəqəmlər realdır — `participants` unikal
// iştirakçı sayı, `maxXp` isə XP qaydalarının eyni düsturudur.
export interface HomeFeedExam {
  id: string;
  title: string;
  subject: string;
  grade: string | null;
  difficulty: string;
  duration: number;
  categoryKey: string | null;
  questionCount: number;
  participants: number;
  /** İştirakçıların ortalama nəticəsi (%). İmtahanların ulduz reytinqi bazada YOXDUR. */
  avgPct: number;
  /** Bu imtahandan qazanıla biləcək maksimum XP (tamamlama + düzgün cavablar + bonus). */
  maxXp: number;
  isNew: boolean;
  matchesGrade: boolean;
  matchesWeak: boolean;
  /** İstifadəçi bu imtahanı əvvəl həll edibmi (§14 — CTA dəyişir). */
  completed: boolean;
  lastPct: number | null;
}

export interface ExamHomeFeed {
  forYou: HomeFeedExam[];
  popular: HomeFeedExam[];
}

export const getExamHomeFeed = (params?: {
  grade?: string;
  weak?: string;
  goal?: string;
  limit?: number;
  mode?: 'student' | 'teacher';
  /** Tətbiq dili — rus bölməsi imtahanları yalnız `ru`-da önə çıxır. */
  lang?: string;
}) => apiClient.get<ExamHomeFeed>('/exam/home-feed', { params }).then((r) => r.data);

// ─── Admin paneldən idarə olunan imtahan kateqoriyaları ─────────────────────
export interface RemoteCategory {
  id: string;
  key: string;
  title: string;
  description: string | null;
  emoji: string | null;
  bg: string | null;
  /** kartın alt xətti / "Bax →" rəngi — admin paneldən idarə olunur */
  accent: string | null;
  /** hansı başlıq altında göstərilsin: 'level' | 'type' | 'lang' (boşdursa "Digər") */
  groupKey: string | null;
  subjects: string[] | null;
  sortOrder: number;
  isActive: boolean;
  children: RemoteCategory[];
}

export const getExamCategories = () =>
  apiClient.get<RemoteCategory[]>('/exam-categories').then((r) => r.data);

// ─── Admin paneldən idarə olunan imtahan parametrləri ───────────────────────
export interface ExamConfigSubject { key: string; label: string; icon?: string; topics?: string[] }

export interface ResolvedExamConfig {
  minQuestions: number;
  maxQuestions: number;
  defaultQuestions: number;
  defaultDuration: number;
  durationOptions: number[];
  difficulties: string[];
  defaultDifficulty: string;
  subjects: ExamConfigSubject[];
  grades: string[];
  examsPerCategory: number;
  examTypes: string[];
}

export interface ExamConfigBundle {
  global: ResolvedExamConfig;
  types: Record<string, ResolvedExamConfig>;
  categories: Record<string, ResolvedExamConfig>;
}

export const getExamConfig = () =>
  apiClient.get<ExamConfigBundle>('/exam-config').then((r) => r.data);

// ─── Rəsmi imtahan sessiyaları (admin-idarəli, cədvəlli) ────────────────────
export type ExamEventStatus = 'upcoming' | 'live' | 'ended';
export interface ExamEvent {
  id: string;
  kind: 'monthly' | 'national';
  title: string;
  description: string | null;
  startAt: string;
  durationMin: number;
  examId: string | null;
  premiumOnly: boolean;
  status: ExamEventStatus;
  participantCount: number;
}
export interface ExamEventLeaderRow {
  rank: number;
  userId: string;
  name: string;
  score: number;
  total: number;
  percentage: number;
  timeSpent: number;
}

export const getUpcomingExamEvents = () =>
  apiClient.get<{ monthly: ExamEvent | null; national: ExamEvent | null }>('/exam-events/upcoming').then((r) => r.data);

export const getExamEvent = (id: string) =>
  apiClient.get<ExamEvent>(`/exam-events/${id}`).then((r) => r.data);

export const getExamEventLeaderboard = (id: string) =>
  apiClient.get<ExamEventLeaderRow[]>(`/exam-events/${id}/leaderboard`).then((r) => r.data);

export const startExam = (examId: string) =>
  // Longer timeout: the backend may be cold-starting (Render free tier),
  // which can exceed the default 15s client timeout.
  apiClient.post<ExamSession>('/exam/start', { examId }, { timeout: 45000 }).then((r) => r.data);

/**
 * İmtahanı göndər.
 *
 * `clientSubmissionId` — bu cəhdin təkrarsız açarı. Şəbəkə kəsilib sorğu
 * yenidən göndərilsə (offline→online), server eyni açarı görüb İKİNCİ nəticə
 * yaratmır və təkrar XP vermir. Verilmədikdə avtomatik yaradılır.
 */
export const submitExam = (
  examId: string,
  answers: Record<string, string>,
  timeSpent: number,
  type?: 'practice' | 'monthly' | 'national' | 'live',
  clientSubmissionId?: string,
) =>
  apiClient
    .post<ExamResult>(
      '/exam/submit',
      {
        examId,
        answers,
        timeSpent,
        type,
        clientSubmissionId: clientSubmissionId ?? newSubmissionId(),
      },
      { timeout: 45000 },
    )
    .then((r) => r.data);

/** Sadə təkrarsız açar (crypto.randomUUID hər mühitdə mövcud deyil). */
export const newSubmissionId = () =>
  `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

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

// ─── Çoxfənnli günlük sınaq ─────────────────────────────────────────────────
export interface MockPayload {
  categoryKey?: string;
  subKey?: string;
  grade?: string;
  subjects: string[];
}
export interface MockResult {
  id: string | null;
  title: string | null;
  questionCount: number;
  preparing: boolean;
}

// Bütün fənlər üzrə günün sınağı — server fənn-fənn 25 sual birləşdirir (hamıya eyni, gündəlik).
export const serveMock = (payload: MockPayload) =>
  apiClient.post<MockResult>('/exam/mock', payload, { timeout: 45000 }).then((r) => r.data);
