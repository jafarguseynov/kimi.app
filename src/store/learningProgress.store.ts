import { create } from 'zustand';
import { Flashcard } from '../api/learning.api';

const DUE_THRESHOLD_HOURS = 12;

interface CardEntry {
  seenAt: number;
  ratings: number[]; // SM-2-lite: keep history of quality ratings
}

interface LearningProgressState {
  entries: Record<string, CardEntry>;
  markRated: (id: string, quality: number) => void;

  isLearned: (id: string) => boolean;
  progressForSubject: (cards: Flashcard[]) => { learned: number; total: number; pct: number };
  dueCards: (cards: Flashcard[]) => Flashcard[];
  weeklyLearnedCount: () => number;
  totalLearnedCount: () => number;
  perSubjectStats: (allCards: Flashcard[]) => Array<{ subject: string; learned: number; total: number }>;
}

export const useLearningProgressStore = create<LearningProgressState>((set, get) => ({
  entries: {},

  markRated: (id, quality) =>
    set((s) => {
      const prev = s.entries[id];
      return {
        entries: {
          ...s.entries,
          [id]: {
            seenAt: Date.now(),
            ratings: prev ? [...prev.ratings, quality] : [quality],
          },
        },
      };
    }),

  isLearned: (id) => {
    const e = get().entries[id];
    if (!e) return false;
    // considered "learned" if last 2 ratings >= 3 (out of 5)
    const last = e.ratings.slice(-2);
    return last.length >= 1 && last.every((q) => q >= 3);
  },

  progressForSubject: (cards) => {
    const isLearned = get().isLearned;
    const learned = cards.reduce((n, c) => n + (isLearned(c.id) ? 1 : 0), 0);
    const total = cards.length;
    return { learned, total, pct: total ? Math.round((learned / total) * 100) : 0 };
  },

  dueCards: (cards) => {
    const { entries } = get();
    const cutoff = Date.now() - DUE_THRESHOLD_HOURS * 60 * 60 * 1000;
    return cards.filter((c) => {
      const e = entries[c.id];
      if (!e) return true; // never seen → due
      return e.seenAt < cutoff;
    });
  },

  weeklyLearnedCount: () => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return Object.values(get().entries).filter((e) => e.seenAt >= cutoff && e.ratings.some((q) => q >= 3)).length;
  },

  totalLearnedCount: () => {
    const isLearned = get().isLearned;
    return Object.keys(get().entries).filter((id) => isLearned(id)).length;
  },

  perSubjectStats: (allCards) => {
    const isLearned = get().isLearned;
    const bySubject = new Map<string, { learned: number; total: number }>();
    for (const c of allCards) {
      const acc = bySubject.get(c.subject) ?? { learned: 0, total: 0 };
      acc.total += 1;
      if (isLearned(c.id)) acc.learned += 1;
      bySubject.set(c.subject, acc);
    }
    return Array.from(bySubject.entries()).map(([subject, v]) => ({ subject, ...v }));
  },
}));
