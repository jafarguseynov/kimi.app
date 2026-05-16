import client from './client';
import { UserStats } from '../types/dashboard.types';

export const getUserStats = async (): Promise<UserStats> => {
  const res = await client.get('/user/stats');
  return res.data;
};
