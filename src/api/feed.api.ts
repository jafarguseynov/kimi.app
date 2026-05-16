import client from './client';

export interface FeedItem {
  id: string;
  type: 'exam_result' | 'tip' | 'announcement';
  title: string;
  body: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export const getFeed = async (): Promise<{ items: FeedItem[] }> => {
  const res = await client.get('/feed');
  return res.data;
};
