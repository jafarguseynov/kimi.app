import client from './client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  totalScore: number;
  examCount: number;
  avgPercentage: number;
  isCurrentUser?: boolean;
}

export interface LeagueEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  weeklyScore: number;
  isCurrentUser: boolean;
}

export interface ExamRankEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  total: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
}

export const getGlobalLeaderboard = (): Promise<LeaderboardEntry[]> =>
  client.get('/leaderboard').then((r) => r.data);

/** Dostlar reytinqi — server dostları özü tapır (qlobal top-50 məhdudiyyəti YOX, 0 imtahanlılar da daxil). */
export const getFriendsLeaderboard = (): Promise<LeaderboardEntry[]> =>
  client.get('/leaderboard/friends').then((r) => r.data);

export const getLeague = (): Promise<LeagueEntry[]> =>
  client.get('/leaderboard/league').then((r) => r.data);

export const getExamLeaderboard = (examId: string): Promise<ExamRankEntry[]> =>
  client.get(`/leaderboard/exam/${examId}`).then((r) => r.data);
