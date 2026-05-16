import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '../api/dashboard.api';

export const useUserStats = () =>
  useQuery({ queryKey: ['userStats'], queryFn: getUserStats });
