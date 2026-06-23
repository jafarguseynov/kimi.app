export interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number; // dəqiqə
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount?: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  order: number;
  section?: string; // çoxfənnli sınaqda sualın fənni (blok başlığı)
}

export interface ExamSession {
  sessionId: string;
  exam: Exam;
  questions: Question[];
  endsAt: string;
}

export interface ExamResult {
  score: number;
  total: number;
  correct?: number;
  wrong?: number;
  unanswered?: number;
  answered?: number;
  percentage: number;
  timeSpent: number;
  examTitle?: string;
  subject?: string;
  categoryKey?: string;
  subKey?: string;
  grade?: string;
}
