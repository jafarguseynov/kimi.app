import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBadges, markBadgeSeen, BadgeCounts, BadgeSection } from '../api/badges.api';
import { useAuthStore } from '../store/auth.store';

const EMPTY: BadgeCounts = { messages: 0, requests: 0, certificates: 0, students: 0 };

/**
 * Oxunmamış-göstərici sayları (mesaj/sorğu/sertifikat/tələbə).
 * 30 saniyədə bir + ekran fokusa gələndə yenilənir.
 */
export function useBadges(): BadgeCounts {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data } = useQuery({
    queryKey: ['badges'],
    queryFn: getBadges,
    enabled: isAuthenticated,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    staleTime: 10000,
  });
  return data ?? EMPTY;
}

/** Bölmə açılanda "görüldü" — nöqtəni təmizlə və sayları yenilə. */
export function useMarkBadgeSeen() {
  const qc = useQueryClient();
  return async (section: BadgeSection) => {
    await markBadgeSeen(section);
    qc.invalidateQueries({ queryKey: ['badges'] });
  };
}
