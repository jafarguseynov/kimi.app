import apiClient from './client';
import type { Question } from '../types/exam.types';

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  subject: string | null;
  questionCount: number;
  durationMinutes: number;
  rewardXp: number;
}

export interface DailyChallengeResult {
  score: number;
  total: number;
  xpAwarded: number;
  completedAt: string;
}

export interface DailyChallengeToday {
  challenge: DailyChallenge | null;
  result: DailyChallengeResult | null;
}

/** Bugünkü çağırış + istifadəçinin nəticəsi (tamamlayıbsa). */
export const getDailyChallenge = () =>
  apiClient.get<DailyChallengeToday>('/daily-challenge/today').then((r) => r.data);

/** "Başla" — adi imtahanla eyni formatda sessiya qaytarır. */
export const startDailyChallenge = () =>
  apiClient
    .post<{
      sessionId: string;
      exam: { id: string; duration: number; subject: string; difficulty: string; title: string };
      questions: Question[];
      endsAt: string;
      challengeId: string;
    }>('/daily-challenge/start')
    .then((r) => r.data);

/** Nəticəni qeyd et + xal ver. Server gündə yalnız bir dəfə xal verir. */
export const completeDailyChallenge = (score: number, total: number) =>
  apiClient
    .post<{ alreadyCompleted: boolean; score: number; total: number; xpAwarded: number }>(
      '/daily-challenge/complete',
      { score, total },
    )
    .then((r) => r.data);
