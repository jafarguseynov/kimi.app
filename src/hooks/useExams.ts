import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExams, getExamsForUser, startExam, submitExam, generateExam, ExamFilters } from '../api/exam.api';
import { getExamCollections, startCollectionTest, submitCollectionTest } from '../api/examCollection.api';
import { useExamStore } from '../store/exam.store';

export const useExamList = (filters?: ExamFilters) =>
  useQuery({ queryKey: ['exams', filters ?? {}], queryFn: () => getExams(filters), retry: false });

export const useExamListForUser = (filters?: ExamFilters, enabled = true) =>
  useQuery({
    queryKey: ['exams-for-me', filters ?? {}],
    queryFn: () => getExamsForUser(filters),
    enabled,
    retry: false,
  });

export const useGenerateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: generateExam,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      qc.invalidateQueries({ queryKey: ['exams-for-me'] });
    },
  });
};

export const useStartExam = () => {
  const { setSession } = useExamStore();

  return useMutation({
    mutationFn: (examId: string) => startExam(examId),
    onSuccess: (data) => {
      const durationSeconds = data.exam.duration * 60;
      setSession(data.sessionId, data.exam.id, data.questions, durationSeconds);
    },
  });
};

export const useSubmitExam = () => {
  const { setResult } = useExamStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, answers, timeSpent, type }: { examId: string; answers: Record<string, string>; timeSpent: number; type?: 'practice' | 'monthly' | 'national' | 'live' }) =>
      submitExam(examId, answers, timeSpent, type),
    onSuccess: (data) => {
      setResult(data);
      qc.invalidateQueries({ queryKey: ['examResults'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

// ─── İmtahan Bankı (kolleksiya) ──────────────────────────────────────────────

export const useExamCollections = (enabled = true) =>
  useQuery({ queryKey: ['exam-collections'], queryFn: getExamCollections, enabled, retry: false });

export const useStartCollectionTest = () => {
  const { setSession, setCollectionId } = useExamStore();

  return useMutation({
    mutationFn: (id: string) => startCollectionTest(id),
    onSuccess: (data, id) => {
      setSession(data.sessionId, data.exam.id, data.questions, data.exam.duration * 60);
      setCollectionId(id);
    },
  });
};

export const useSubmitCollectionTest = () => {
  const { setResult } = useExamStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, questionIds, answers, timeSpent }: { id: string; questionIds: string[]; answers: Record<string, string>; timeSpent: number }) =>
      submitCollectionTest(id, questionIds, answers, timeSpent),
    onSuccess: (data) => {
      setResult(data);
      qc.invalidateQueries({ queryKey: ['exam-collections'] });
    },
  });
};
