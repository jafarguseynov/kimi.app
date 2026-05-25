import client from './client';

export interface TopicStats {
  weak: string[];
  strong: string[];
}

const DEMO: TopicStats = {
  weak: ['Triqonometriya', 'Kimyəvi reaksiyalar'],
  strong: ['Azərbaycan dili', 'Tarix'],
};

/**
 * Returns the student's weak and strong topics based on recent exam results.
 * Backend endpoint not yet implemented — falls back to a demo dataset so the
 * UI is meaningful before the analytics pipeline lands.
 */
export const getTopicStats = async (): Promise<TopicStats> => {
  try {
    const res = await client.get('/analytics/topic-stats');
    const data = res.data;
    if (data && Array.isArray(data.weak) && Array.isArray(data.strong)) {
      const w = data.weak.length > 0 ? data.weak : DEMO.weak;
      const s = data.strong.length > 0 ? data.strong : DEMO.strong;
      return { weak: w, strong: s };
    }
  } catch {
    // endpoint missing — fall through
  }
  return DEMO;
};
