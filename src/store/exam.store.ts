import { create } from 'zustand';
import { Question, ExamResult } from '../types/exam.types';

interface ExamState {
  sessionId: string | null;
  examId: string | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  timeRemaining: number;
  result: ExamResult | null;

  setSession: (sessionId: string, examId: string, questions: Question[], durationSeconds: number) => void;
  setAnswer: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  decrementTimer: () => void;
  setResult: (result: ExamResult) => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  sessionId: null,
  examId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  timeRemaining: 0,
  result: null,

  setSession: (sessionId, examId, questions, durationSeconds) =>
    set({ sessionId, examId, questions, timeRemaining: durationSeconds, currentIndex: 0, answers: {} }),

  setAnswer: (questionId, optionId) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: optionId } })),

  nextQuestion: () =>
    set((state) => ({ currentIndex: state.currentIndex + 1 })),

  previousQuestion: () =>
    set((state) => ({ currentIndex: Math.max(0, state.currentIndex - 1) })),

  decrementTimer: () =>
    set((state) => ({ timeRemaining: Math.max(0, state.timeRemaining - 1) })),

  setResult: (result) => set({ result }),

  resetExam: () => set({ sessionId: null, examId: null, questions: [], currentIndex: 0, answers: {}, timeRemaining: 0, result: null }),
}));
