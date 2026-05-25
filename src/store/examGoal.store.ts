import { create } from 'zustand';

interface ExamGoalState {
  dailyGoal: number;
  setDailyGoal: (n: number) => void;
}

export const useExamGoalStore = create<ExamGoalState>((set) => ({
  dailyGoal: 2,
  setDailyGoal: (n) => set({ dailyGoal: Math.max(1, Math.min(10, Math.round(n))) }),
}));
