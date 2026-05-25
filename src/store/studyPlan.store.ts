import { create } from 'zustand';

const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

interface StudyPlanState {
  completed: string[];
  lastResetDate: string | null;
  rewardedFor: string | null; // date key for which the 4/4 reward was already granted
  // weekly history: 7 most recent day -> count of completed tasks
  weeklyHistory: Record<string, number>;

  ensureDailyReset: () => void;
  isComplete: (id: string) => boolean;
  toggleComplete: (id: string) => void;
  completedCount: () => number;
  markRewarded: () => void;
  wasRewardedToday: () => boolean;
  getWeekCounts: () => Array<{ dateKey: string; count: number }>;
}

export const useStudyPlanStore = create<StudyPlanState>((set, get) => ({
  completed: [],
  lastResetDate: null,
  rewardedFor: null,
  weeklyHistory: {},

  ensureDailyReset: () => {
    const today = todayKey();
    const { lastResetDate, completed, weeklyHistory } = get();
    if (lastResetDate !== today) {
      const updatedWeekly = { ...weeklyHistory };
      if (lastResetDate) updatedWeekly[lastResetDate] = completed.length;
      // keep only last 14 days
      const keepKeys = Object.keys(updatedWeekly)
        .sort()
        .slice(-14);
      const trimmed: Record<string, number> = {};
      for (const k of keepKeys) trimmed[k] = updatedWeekly[k];

      set({
        completed: [],
        lastResetDate: today,
        rewardedFor: null,
        weeklyHistory: trimmed,
      });
    }
  },

  isComplete: (id) => get().completed.includes(id),
  toggleComplete: (id) =>
    set((s) => ({
      completed: s.completed.includes(id) ? s.completed.filter((x) => x !== id) : [...s.completed, id],
    })),

  completedCount: () => get().completed.length,
  markRewarded: () => set({ rewardedFor: todayKey() }),
  wasRewardedToday: () => get().rewardedFor === todayKey(),

  getWeekCounts: () => {
    const { weeklyHistory, completed, lastResetDate } = get();
    const today = todayKey();
    const days: Array<{ dateKey: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = todayKey(d);
      let count = weeklyHistory[key] ?? 0;
      if (key === today && lastResetDate === today) count = completed.length;
      days.push({ dateKey: key, count });
    }
    return days;
  },
}));
