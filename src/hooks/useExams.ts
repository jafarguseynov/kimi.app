import { useQuery, useMutation } from '@tanstack/react-query';
import { getExams, startExam, submitExam } from '../api/exam.api';
import { useExamStore } from '../store/exam.store';

export const useExamList = () =>
  useQuery({ queryKey: ['exams'], queryFn: getExams });

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

  return useMutation({
    mutationFn: ({ examId, answers, timeSpent }: { examId: string; answers: Record<string, string>; timeSpent: number }) =>
      submitExam(examId, answers, timeSpent),
    onSuccess: (data) => setResult(data),
  });
};
