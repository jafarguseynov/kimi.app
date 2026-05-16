import client from './client';

export interface Flashcard {
  id: string;
  subject: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const getSubjects = async (): Promise<string[]> => {
  const res = await client.get('/learning/subjects');
  return res.data;
};

export const getFlashcards = async (subject?: string): Promise<Flashcard[]> => {
  const res = await client.get('/learning/flashcards', { params: subject ? { subject } : {} });
  return res.data;
};

export const getDueCards = async (): Promise<Flashcard[]> => {
  const res = await client.get('/learning/due');
  return res.data;
};

export const recordProgress = async (flashcardId: string, quality: number): Promise<void> => {
  await client.post('/learning/progress', { flashcardId, quality });
};
