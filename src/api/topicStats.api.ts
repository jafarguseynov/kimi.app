import client from './client';

export interface TopicStats {
  weak: string[];
  strong: string[];
  all?: { subject: string; avg: number }[];
}

/**
 * Şagirdin son imtahan nəticələrinə görə zəif/güclü fənləri.
 * Backend: GET /analytics/topic-stats (real aqreqasiya). Data yoxdursa boş qaytarır.
 */
export const getTopicStats = async (): Promise<TopicStats> => {
  try {
    const res = await client.get('/analytics/topic-stats');
    const data = res.data;
    if (data && Array.isArray(data.weak) && Array.isArray(data.strong)) {
      return { weak: data.weak, strong: data.strong, all: data.all ?? [] };
    }
  } catch {
    // endpoint/şəbəkə xətası — boş qaytar
  }
  return { weak: [], strong: [], all: [] };
};
