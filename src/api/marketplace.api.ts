import client from './client';

export interface MarketQuestion {
  id: string;
  title: string;
  body: string;
  subject: string;
  price: number;
  isResolved: boolean;
  author: { id: string; name: string };
  createdAt: string;
}

export interface MarketAnswer {
  id: string;
  body: string;
  isAccepted: boolean;
  author: { id: string; name: string };
  createdAt: string;
}

export const getQuestions = async (subject?: string): Promise<MarketQuestion[]> => {
  const res = await client.get('/marketplace/questions', { params: subject ? { subject } : {} });
  return res.data.map((q: any) => ({ ...q, price: parseFloat(q.price) || 0 }));
};

export const getQuestion = async (
  id: string,
): Promise<{ question: MarketQuestion; answers: MarketAnswer[] }> => {
  const res = await client.get(`/marketplace/questions/${id}`);
  return res.data;
};

export const createQuestion = async (data: {
  title: string;
  body: string;
  subject: string;
  price: number;
}): Promise<MarketQuestion> => {
  const res = await client.post('/marketplace/question', data);
  return { ...res.data, price: parseFloat(res.data.price) || 0 };
};

export const createAnswer = async (questionId: string, body: string): Promise<MarketAnswer> => {
  const res = await client.post('/marketplace/answer', { questionId, body });
  return res.data;
};

export const acceptAnswer = async (answerId: string): Promise<void> => {
  await client.post('/marketplace/accept', { answerId });
};
