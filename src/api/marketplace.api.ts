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
  imageUrl?: string | null;
  videoUrl?: string | null;
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
  // Backend decimal sahəni sətir kimi qaytarır — burada da normallaşdır.
  return {
    question: { ...res.data.question, price: parseFloat(res.data.question?.price) || 0 },
    answers: res.data.answers ?? [],
  };
};

export interface MarketConfig {
  questionPrice: number;
  urgentPrice: number;
  commissionPercent: number;
}

/** Sual qiymətləri — admin paneldən idarə olunur. */
export const getMarketConfig = async (): Promise<MarketConfig> => {
  const res = await client.get('/marketplace/config');
  return res.data;
};

export const createQuestion = async (data: {
  title: string;
  body: string;
  subject: string;
  price: number;
  urgent?: boolean;
}): Promise<MarketQuestion> => {
  const res = await client.post('/marketplace/question', data);
  return { ...res.data, price: parseFloat(res.data.price) || 0 };
};

export const createAnswer = async (
  questionId: string,
  body: string,
  media?: { imageUrl?: string; videoUrl?: string },
): Promise<MarketAnswer> => {
  const res = await client.post('/marketplace/answer', { questionId, body, ...media });
  return res.data;
};

export const acceptAnswer = async (answerId: string): Promise<void> => {
  await client.post('/marketplace/accept', { answerId });
};

/** AI izahı — ilk çağırışda backend generasiya edir (uzun çəkə bilər), sonra keşdən gəlir. */
export const getAiAnswer = async (questionId: string): Promise<{ answer: string | null }> => {
  const res = await client.get(`/marketplace/questions/${questionId}/ai`, { timeout: 60000 });
  return res.data;
};
