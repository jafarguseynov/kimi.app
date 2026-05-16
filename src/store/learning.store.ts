import { create } from 'zustand';
import { Flashcard } from '../api/learning.api';

interface LearningState {
  cards: Flashcard[];
  currentIndex: number;
  subject: string | null;
  setCards: (cards: Flashcard[], subject: string) => void;
  nextCard: () => void;
  resetSession: () => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  cards: [],
  currentIndex: 0,
  subject: null,
  setCards: (cards, subject) => set({ cards, currentIndex: 0, subject }),
  nextCard: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
  resetSession: () => set({ cards: [], currentIndex: 0, subject: null }),
}));
