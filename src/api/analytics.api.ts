import client from './client';

// ─── Proqres (son 7 gün fəaliyyəti) ──────────────────────────────────
export interface ProgressDay {
  date: string;      // YYYY-MM-DD
  weekday: number;   // 0=Bazar ... 6=Şənbə
  examCount: number;
  avgPct: number;
}
export interface ProgressData {
  days: ProgressDay[];
  overallPct: number;
  totalExams: number;
  activeDays: number;
}
export const getProgress = (): Promise<ProgressData> =>
  client.get('/analytics/progress').then((r) => r.data);

// ─── Həftəlik hesabat ────────────────────────────────────────────────
export interface WeeklySubject {
  subject: string;
  avgPct: number;
  count: number;
}
export interface WeeklyReportData {
  spark: number[];        // 7 günlük günlük orta faiz
  examCount: number;
  avgPct: number;
  activeDays: number;
  subjects: WeeklySubject[];
  best: string | null;
  worst: string | null;
}
export const getWeeklyReport = (): Promise<WeeklyReportData> =>
  client.get('/analytics/weekly').then((r) => r.data);

// ─── Təkrar test planı (spaced-repetition-lite) ──────────────────────
export interface ReviewItem {
  subject: string;
  avgPct: number;
  attempts: number;
  lastAttemptDays: number;
  status: 'due' | 'soon' | 'ok';
}
export const getReviewPlan = (): Promise<ReviewItem[]> =>
  client.get('/analytics/review-plan').then((r) => r.data);

// ─── Mövzu inkişaf yolu ──────────────────────────────────────────────
export interface RoadmapStep {
  label: string;
  detail: string;
  status: 'done' | 'current' | 'locked';
}
export interface RoadmapData {
  subject: string | null;
  avgPct: number;
  attempts: number;
  bestPct: number;
  steps: RoadmapStep[];
}
export const getRoadmap = (subject?: string): Promise<RoadmapData> =>
  client
    .get('/analytics/roadmap', { params: subject ? { subject } : undefined })
    .then((r) => r.data);

// ─── AI tövsiyələri ──────────────────────────────────────────────────
export interface Tip {
  title: string;
  body: string;
}
export const getTips = (): Promise<Tip[]> =>
  client.get('/analytics/tips').then((r) => r.data);
