import client from './client';

export interface DailyMission {
  id: string;
  type: 'exam' | 'flashcard' | 'question';
  title: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: number;
  /** Geriyə uyğunluq — reward ilə eyni. */
  xpReward: number;
}

export interface ClaimResult {
  claimed: boolean;
  missionId: string;
  reward: number;
  balance: number;
}

export interface StreakDay {
  date: string;
  active: boolean;
}

export interface StreakInfo {
  current: number;
  best: number;
  todayActive: boolean;
  activeDays: number;
  week: StreakDay[];
}

export const getMissions = (): Promise<DailyMission[]> =>
  client.get('/engagement/missions').then((r) => r.data);

export const claimMission = (id: string): Promise<ClaimResult> =>
  client.post(`/engagement/missions/${id}/claim`).then((r) => r.data);

export const getStreak = (): Promise<StreakInfo> =>
  client.get('/engagement/streak').then((r) => r.data);
