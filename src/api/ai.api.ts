import client from './client';

export const sendAiMessage = async (message: string): Promise<{ reply: string }> => {
  const res = await client.post('/ai/chat', { message });
  return res.data;
};

export const getAiRecommendations = async (): Promise<{
  recommendations: string[];
  weakTopics: { subject: string; avg: number }[];
}> => {
  const res = await client.get('/ai/recommendations');
  return res.data;
};

export const analyzePerformance = async (): Promise<{
  weakTopics: { subject: string; avg: number }[];
  recommendations: string[];
  averageScore: number;
}> => {
  const res = await client.post('/ai/analyze');
  return res.data;
};
