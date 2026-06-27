import { create } from 'zustand';
import { Question, ExamResult } from '../types/exam.types';

export type ExamSubmissionType = 'practice' | 'monthly' | 'national' | 'live';

export interface ExamMeta {
  subject: string;
  difficulty: string; // 'easy' | 'medium' | 'hard' | digər
  title: string;
}

interface ExamState {
  sessionId: string | null;
  examId: string | null;
  // İmtahan Bankı testidirsə kolleksiya id-si (submit-i bank endpoint-inə yönəltmək üçün)
  collectionId: string | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  timeRemaining: number;
  durationSeconds: number;
  result: ExamResult | null;
  submissionType: ExamSubmissionType | null;
  examMeta: ExamMeta | null;

  setSession: (sessionId: string, examId: string, questions: Question[], durationSeconds: number, meta?: ExamMeta | null) => void;
  setCollectionId: (collectionId: string | null) => void;
  setSubmissionType: (type: ExamSubmissionType | null) => void;
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
  collectionId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  timeRemaining: 0,
  durationSeconds: 0,
  result: null,
  submissionType: null,
  examMeta: null,

  // Yeni sessiya başlayanda collectionId-ni təmizlə (adi imtahan bank endpoint-inə getməsin)
  setSession: (sessionId, examId, questions, durationSeconds, meta = null) =>
    set({ sessionId, examId, collectionId: null, questions, timeRemaining: durationSeconds, durationSeconds, currentIndex: 0, answers: {}, examMeta: meta }),

  setCollectionId: (collectionId) => set({ collectionId }),

  setSubmissionType: (type) => set({ submissionType: type }),

  setAnswer: (questionId, optionId) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: optionId } })),

  nextQuestion: () =>
    set((state) => ({ currentIndex: state.currentIndex + 1 })),

  previousQuestion: () =>
    set((state) => ({ currentIndex: Math.max(0, state.currentIndex - 1) })),

  decrementTimer: () =>
    set((state) => ({ timeRemaining: Math.max(0, state.timeRemaining - 1) })),

  setResult: (result) => set({ result }),

  resetExam: () => set({ sessionId: null, examId: null, collectionId: null, questions: [], currentIndex: 0, answers: {}, timeRemaining: 0, durationSeconds: 0, result: null, submissionType: null, examMeta: null }),
}));
