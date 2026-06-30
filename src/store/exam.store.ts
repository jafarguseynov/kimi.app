import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureChunkStorage, STORAGE_KEYS } from '../services/offline/storage';
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
  // Wall-clock timer üçün: imtahanın başlandığı an (epoch ms). Elektrik/internet
  // kəsilib açılsa belə qalan vaxt buradan dəqiq hesablanır.
  startedAt: number | null;
  result: ExamResult | null;
  // Offline-da submit edilib, nəticə (bal) internet qayıdanda hesablanacaq.
  pending: boolean;
  submissionType: ExamSubmissionType | null;
  examMeta: ExamMeta | null;

  setSession: (sessionId: string, examId: string, questions: Question[], durationSeconds: number, meta?: ExamMeta | null) => void;
  setCollectionId: (collectionId: string | null) => void;
  setSubmissionType: (type: ExamSubmissionType | null) => void;
  setAnswer: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  decrementTimer: () => void;
  recomputeTimer: () => void;
  setResult: (result: ExamResult) => void;
  setPending: (pending: boolean) => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      examId: null,
      collectionId: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      timeRemaining: 0,
      durationSeconds: 0,
      startedAt: null,
      result: null,
      pending: false,
      submissionType: null,
      examMeta: null,

      // Yeni sessiya başlayanda collectionId-ni təmizlə (adi imtahan bank endpoint-inə getməsin)
      setSession: (sessionId, examId, questions, durationSeconds, meta = null) =>
        set({
          sessionId, examId, collectionId: null, questions,
          timeRemaining: durationSeconds, durationSeconds,
          startedAt: Date.now(), currentIndex: 0, answers: {},
          result: null, pending: false, examMeta: meta,
        }),

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

      // Wall-clock: qalan vaxtı startedAt-dan yenidən hesabla (resume/açılış üçün).
      recomputeTimer: () =>
        set((state) => {
          if (!state.startedAt || !state.durationSeconds) return {};
          const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
          return { timeRemaining: Math.max(0, state.durationSeconds - elapsed) };
        }),

      setResult: (result) => set({ result, pending: false }),

      setPending: (pending) => set({ pending }),

      resetExam: () => set({
        sessionId: null, examId: null, collectionId: null, questions: [],
        currentIndex: 0, answers: {}, timeRemaining: 0, durationSeconds: 0,
        startedAt: null, result: null, pending: false, submissionType: null, examMeta: null,
      }),
    }),
    {
      name: STORAGE_KEYS.examSession,
      storage: createJSONStorage(() => secureChunkStorage),
      // Yalnız gedişatı saxla — nəticəni yox. timeRemaining startedAt-dan bərpa olunur.
      partialize: (s) => ({
        sessionId: s.sessionId,
        examId: s.examId,
        collectionId: s.collectionId,
        questions: s.questions,
        currentIndex: s.currentIndex,
        answers: s.answers,
        durationSeconds: s.durationSeconds,
        startedAt: s.startedAt,
        submissionType: s.submissionType,
        examMeta: s.examMeta,
      }),
    },
  ),
);

/** Bərpa oluna bilən (bitməmiş) imtahan varmı? */
export function hasResumableExam(): boolean {
  const s = useExamStore.getState();
  if (!s.examId || s.questions.length === 0 || !s.startedAt || !s.durationSeconds) return false;
  const elapsed = Math.floor((Date.now() - s.startedAt) / 1000);
  return s.durationSeconds - elapsed > 0;
}
