import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateUser } from '../api/user.api';
import { useUserStore } from '../store/user.store';
import { UserProfile } from '../types/auth.types';

export const useMe = () => {
  const { setUser } = useUserStore();

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
    onSuccess: (data: UserProfile) => setUser(data),
  } as any);
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => updateUser(data),
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};
