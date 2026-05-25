import client from './client';

export interface Flashcard {
  id: string;
  subject: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const DEMO_CARDS: Record<string, Flashcard[]> = {
  'İngilis dili': [
    { id: 'en-1', subject: 'İngilis dili', front: 'Achievement', back: 'Nailiyyət, uğur', difficulty: 'medium' },
    { id: 'en-2', subject: 'İngilis dili', front: 'Curiosity', back: 'Maraq, həvəs', difficulty: 'medium' },
    { id: 'en-3', subject: 'İngilis dili', front: 'Persistent', back: 'Israrlı, davamlı', difficulty: 'hard' },
    { id: 'en-4', subject: 'İngilis dili', front: 'Generous', back: 'Səxavətli', difficulty: 'easy' },
    { id: 'en-5', subject: 'İngilis dili', front: 'Knowledge', back: 'Bilik', difficulty: 'easy' },
  ],
  'Riyaziyyat': [
    { id: 'mt-1', subject: 'Riyaziyyat', front: 'Pifaqor teoremi', back: 'a² + b² = c²', difficulty: 'easy' },
    { id: 'mt-2', subject: 'Riyaziyyat', front: 'Dairənin sahəsi', back: 'π × r²', difficulty: 'easy' },
    { id: 'mt-3', subject: 'Riyaziyyat', front: 'sin²x + cos²x', back: '1', difficulty: 'medium' },
    { id: 'mt-4', subject: 'Riyaziyyat', front: 'Kvadrat tənliyin diskriminantı', back: 'D = b² - 4ac', difficulty: 'medium' },
    { id: 'mt-5', subject: 'Riyaziyyat', front: '7! (faktorial)', back: '5040', difficulty: 'hard' },
  ],
  'Fizika': [
    { id: 'ph-1', subject: 'Fizika', front: 'Nyutonun II qanunu', back: 'F = m × a', difficulty: 'easy' },
    { id: 'ph-2', subject: 'Fizika', front: 'İşıq sürəti', back: '~3 × 10⁸ m/s', difficulty: 'easy' },
    { id: 'ph-3', subject: 'Fizika', front: 'Om qanunu', back: 'U = I × R', difficulty: 'medium' },
    { id: 'ph-4', subject: 'Fizika', front: 'Suyun qaynama nöqtəsi (1 atm)', back: '100°C', difficulty: 'easy' },
  ],
  'Kimya': [
    { id: 'ch-1', subject: 'Kimya', front: 'Suyun formulu', back: 'H₂O', difficulty: 'easy' },
    { id: 'ch-2', subject: 'Kimya', front: 'NaCl', back: 'Xörək duzu', difficulty: 'easy' },
    { id: 'ch-3', subject: 'Kimya', front: 'pH = 7', back: 'Neytral məhlul', difficulty: 'medium' },
    { id: 'ch-4', subject: 'Kimya', front: 'Mendeleyevin 1-ci elementi', back: 'Hidrogen (H)', difficulty: 'easy' },
  ],
  'Tarix': [
    { id: 'hi-1', subject: 'Tarix', front: 'ADR neçənci ildə yaradılıb?', back: '1918', difficulty: 'medium' },
    { id: 'hi-2', subject: 'Tarix', front: 'Azərbaycan müstəqilliyi neçə ildə bərpa olunub?', back: '1991', difficulty: 'easy' },
    { id: 'hi-3', subject: 'Tarix', front: 'Cavad xan', back: 'Gəncə xanı (XIX əsr)', difficulty: 'hard' },
  ],
  'Biologiya': [
    { id: 'bi-1', subject: 'Biologiya', front: 'Hüceyrənin enerji stansiyası', back: 'Mitoxondri', difficulty: 'medium' },
    { id: 'bi-2', subject: 'Biologiya', front: 'DNT-ni təşkil edən elementlər', back: 'A, T, G, C', difficulty: 'medium' },
    { id: 'bi-3', subject: 'Biologiya', front: 'Fotosintez harada gedir?', back: 'Xloroplastlarda', difficulty: 'easy' },
  ],
};

const DEMO_SUBJECTS = Object.keys(DEMO_CARDS);

export const getSubjects = async (): Promise<string[]> => {
  try {
    const res = await client.get('/learning/subjects');
    const data: string[] = Array.isArray(res.data) ? res.data : [];
    return data.length > 0 ? data : DEMO_SUBJECTS;
  } catch {
    return DEMO_SUBJECTS;
  }
};

export const getFlashcards = async (subject?: string): Promise<Flashcard[]> => {
  try {
    const res = await client.get('/learning/flashcards', { params: subject ? { subject } : {} });
    const data: Flashcard[] = Array.isArray(res.data) ? res.data : [];
    if (data.length > 0) return data;
  } catch {
    // fall through to demo
  }
  if (subject && DEMO_CARDS[subject]) return DEMO_CARDS[subject];
  return Object.values(DEMO_CARDS).flat();
};

export const getDueCards = async (): Promise<Flashcard[]> => {
  try {
    const res = await client.get('/learning/due');
    const data: Flashcard[] = Array.isArray(res.data) ? res.data : [];
    if (data.length > 0) return data;
  } catch {
    // fall through to demo
  }
  return DEMO_CARDS['İngilis dili'];
};

export const recordProgress = async (flashcardId: string, quality: number): Promise<void> => {
  try {
    await client.post('/learning/progress', { flashcardId, quality });
  } catch {
    // demo mode: ignore failures
  }
};
