import { Question, ExamResult, LocalReviewItem } from '../../types/exam.types';
import { storage } from './storage';

/**
 * Offline yerli qiymətləndirmə — imtahan bitəndə balı DƏRHAL cihazda hesablayır
 * (internetə ehtiyac olmadan). Server `correctOptionId`-ni start cavabında göndərir.
 * Rəsmi nəticə yenə də serverdə hesablanıb yazılır (submitExam) — bu yalnız anlıq
 * göstərmə + offline baxış üçündür.
 */
export interface GradeMeta {
  examTitle?: string;
  subject?: string;
  timeSpent: number;
}

export function gradeLocally(
  questions: Question[],
  answers: Record<string, string>,
  meta: GradeMeta,
): { result: ExamResult; review: LocalReviewItem[] } {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  const review: LocalReviewItem[] = questions.map((q) => {
    const your = answers[q.id] ?? null;
    const corr = q.correctOptionId ?? null;
    const isUnanswered = your == null;
    const isCorrect = !isUnanswered && your === corr;
    if (isUnanswered) unanswered += 1;
    else if (isCorrect) correct += 1;
    else wrong += 1;
    return {
      questionId: q.id,
      text: q.text,
      options: q.options,
      correctOptionId: corr,
      yourOptionId: your,
      isCorrect,
      section: q.section,
    };
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const result: ExamResult = {
    score: correct,
    total,
    correct,
    wrong,
    unanswered,
    answered: correct + wrong,
    percentage,
    timeSpent: meta.timeSpent,
    examTitle: meta.examTitle,
    subject: meta.subject,
  };

  return { result, review };
}

// ─── Yerli baxış (review) yaddaşı — examId üzrə ─────────────────────────────
// SecureStore açarı yalnız [A-Za-z0-9._-] ola bilər → examId-ni təmizlə.
function reviewKey(examId: string): string {
  return `offline_review_${examId.replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

export async function saveLocalReview(examId: string, review: LocalReviewItem[]): Promise<void> {
  await storage.set(reviewKey(examId), review);
}

export async function getLocalReview(examId: string): Promise<LocalReviewItem[] | null> {
  return storage.get<LocalReviewItem[]>(reviewKey(examId));
}
