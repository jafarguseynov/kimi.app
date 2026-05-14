import client from './client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalScore: number;
  examCount: number;
  avgPercentage: number;
}

export interface LeagueEntry {
  rank: number;
  userId: string;
  name: string;
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

export const getLeague = (): Promise<LeagueEntry[]> =>
  client.get('/leaderboard/league').then((r) => r.data);

export const getExamLeaderboard = (examId: string): Promise<ExamRankEntry[]> =>
  client.get(`/leaderboard/exam/${examId}`).then((r) => r.data);
