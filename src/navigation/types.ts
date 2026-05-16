import { Routes } from '../constants/routes';

export type AuthStackParamList = {
  [Routes.Welcome]: undefined;
  [Routes.Login]: undefined;
  [Routes.Register]: undefined;
  [Routes.OTP]: { phone: string };
  [Routes.RoleSelect]: undefined;
  [Routes.ProfileSetup]: undefined;
  [Routes.AIOnboarding]: undefined;
};

export type ExamStackParamList = {
  [Routes.ExamList]: undefined;
  [Routes.ExamDetail]: { examId: string; title: string };
  [Routes.ExamSession]: undefined;
  [Routes.ExamResult]: undefined;
  [Routes.MonthlyExamDetail]: { examId: string; title: string };
  [Routes.LiveExamWaiting]: { examId: string; title: string };
  [Routes.LiveExamSession]: undefined;
  [Routes.ExamRanking]: { examId?: string } | undefined;
  [Routes.LiveLeaderboard]: undefined;
  [Routes.CertificatePreview]: { examId: string };
  [Routes.CertificateList]: undefined;
  [Routes.ExamHistory]: undefined;
  [Routes.ExamFilter]: undefined;
};

export type MarketplaceStackParamList = {
  [Routes.MarketplaceHome]: undefined;
  [Routes.AskQuestion]: undefined;
  [Routes.QuestionDetail]: { questionId: string };
  [Routes.AIAnswer]: undefined;
  [Routes.AIAnswerFallback]: undefined;
  [Routes.LessonRequest]: undefined;
  [Routes.InterestedTeachers]: { requestId?: string; requestTitle?: string };
};

export type ProfileStackParamList = {
  [Routes.ProfileHome]: undefined;
  [Routes.EditProfile]: { role?: 'teacher' | 'student' | 'parent' } | undefined;
  [Routes.Dashboard]: undefined;
  [Routes.Wallet]: undefined;
  [Routes.Settings]: undefined;
  [Routes.NotificationSettings]: undefined;
  [Routes.TermsOfService]: undefined;
  [Routes.Support]: undefined;
  [Routes.HelpCenter]: undefined;
  [Routes.ReportProblem]: undefined;
  [Routes.AboutApp]: undefined;
  [Routes.ChangePassword]: undefined;
  [Routes.PasswordChanged]: undefined;
  [Routes.AccountManagement]: undefined;
  [Routes.DeactivateReason]: undefined;
  [Routes.AccountDeactivated]: undefined;
  [Routes.DeleteAccountConfirm]: undefined;
  [Routes.LogoutConfirm]: undefined;
};

export type LearningStackParamList = {
  [Routes.LearningHome]: undefined;
  [Routes.FlashcardSession]: undefined;
  [Routes.MemoryAI]: undefined;
  [Routes.LearningGroups]: undefined;
};

export type HomeStackParamList = {
  [Routes.HomeMain]: undefined;
  [Routes.DailyMissions]: undefined;
  [Routes.AIStudyPath]: undefined;
  [Routes.SpinWheel]: undefined;
  [Routes.Achievements]: undefined;
  [Routes.Leaderboard]: undefined;
  [Routes.League]: undefined;
  [Routes.SchoolRanking]: undefined;
  [Routes.SchoolSearch]: undefined;
  [Routes.SchoolDetail]: { schoolName?: string };
  [Routes.Settings]: undefined;
  [Routes.PaymentMethod]: undefined;
  [Routes.CardPayment]: undefined;
  [Routes.PaymentSuccess]: undefined;
  [Routes.PaymentFailed]: undefined;
  [Routes.Subscription]: undefined;
  [Routes.Plans]: undefined;
  [Routes.Friends]: undefined;
};

export type AppTabParamList = {
  [Routes.Home]: undefined;
  Exams: undefined;
  Learn: undefined;
  [Routes.AIMentor]: undefined;
  Marketplace: undefined;
  [Routes.Bookmarks]: undefined;
  Chat: undefined;
  Booking: undefined;
  [Routes.Profile]: undefined;
  Calculators: undefined;
};

export type CalcStackParamList = {
  [Routes.Calculators]: undefined;
  [Routes.SemesterCalc]: undefined;
  [Routes.AnnualCalc]: undefined;
  [Routes.ScoreCalc]: undefined;
  [Routes.QualityCalc]: undefined;
  [Routes.DIMCalc]: undefined;
  [Routes.CalcHistory]: undefined;
  [Routes.CalcSaved]: undefined;
};
