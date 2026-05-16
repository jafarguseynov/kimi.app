import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeed } from '../api/feed.api';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notification.api';

export const useFeed = () =>
  useQuery({ queryKey: ['feed'], queryFn: getFeed });

export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: getNotifications });

export const useUnreadCount = () =>
  useQuery({ queryKey: ['notifCount'], queryFn: getUnreadCount });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifCount'] });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifCount'] });
    },
  });
};
