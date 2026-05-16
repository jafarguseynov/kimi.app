export interface RecentExam {
  examTitle: string;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
}

export interface UserStats {
  totalExams: number;
  averageScore: number;
  activeDays: number;
  highestScore: number;
  recentResults: RecentExam[];
}
