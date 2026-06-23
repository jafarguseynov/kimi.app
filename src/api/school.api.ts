import client from './client';

export interface SchoolRankEntry {
  rank: number;
  id: string;
  name: string;
  members: number;
  examCount: number;
  avgScore: number; // 0–100 orta faiz
  rating: number;   // 0–5 ulduz
}

export const getSchoolRanking = (limit = 50): Promise<SchoolRankEntry[]> =>
  client.get('/school/ranking', { params: { limit } }).then((r) => r.data);
