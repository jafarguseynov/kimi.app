import client from './client';

// Oxunmamış-göstərici (qırmızı nöqtə) sayları — backend hesablayır.
export interface BadgeCounts {
  messages: number;
  requests: number;
  certificates: number;
  students: number;
}

export type BadgeSection = 'requests' | 'certificates' | 'students';

export const getBadges = async (): Promise<BadgeCounts> => {
  const res = await client.get('/badges');
  return res.data;
};

// Bölmə açılanda "görüldü" — həmin nöqtəni təmizlə (server lastSeen-i now edir).
export const markBadgeSeen = async (section: BadgeSection): Promise<void> => {
  await client.post(`/badges/seen/${section}`).catch(() => {});
};
