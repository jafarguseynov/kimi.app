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
  percentage: number;
  timeSpent: number;
}
