import client from './client';

export const sendAiMessage = async (
  message: string,
  conversationId?: string | null,
): Promise<{ reply: string; conversationId: string }> => {
  const res = await client.post('/ai/chat', { message, conversationId: conversationId ?? undefined });
  return res.data;
};

// ─── Söhbət tarixçəsi ─────────────────────────────────────────────────
export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  createdAt: string;
}

export interface ConversationDetail {
  id: string;
  title: string;
  messages: ConversationMessage[];
}

export const getConversations = async (): Promise<ConversationSummary[]> => {
  const res = await client.get('/ai/conversations');
  return res.data;
};

export const getConversation = async (id: string): Promise<ConversationDetail> => {
  const res = await client.get(`/ai/conversations/${id}`);
  return res.data;
};

export const deleteConversation = async (id: string): Promise<void> => {
  await client.delete(`/ai/conversations/${id}`);
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

export const analyzeTeacher = async (): Promise<{
  metrics: { monthlyEarnings: number; totalStudents: number; activeQueries: number; rating: number };
  studentWeakTopics: { subject: string; avg: number }[];
  recommendations: string[];
}> => {
  const res = await client.post('/ai/teacher/insights');
  return res.data;
};
