export const Routes = {
  // Auth stack
  Welcome: 'Welcome',
  Login: 'Login',
  Register: 'Register',
  OTP: 'OTP',
  RoleSelect: 'RoleSelect',
  ProfileSetup: 'ProfileSetup',

  // App tabs
  Home: 'Home',
  Exams: 'Exams',
  AIMentor: 'AIMentor',
  Marketplace: 'Marketplace',
  Bookmarks: 'Bookmarks',
  Profile: 'Profile',

  // Exam stack
  ExamList: 'ExamList',
  ExamDetail: 'ExamDetail',
  ExamSession: 'ExamSession',
  ExamResult: 'ExamResult',

  // Learning stack
  LearningHome: 'LearningHome',
  FlashcardSession: 'FlashcardSession',
  MemoryAI: 'MemoryAI',
  LearningGroups: 'LearningGroups',

  // Marketplace stack
  MarketplaceHome: 'MarketplaceHome',
  AskQuestion: 'AskQuestion',
  QuestionDetail: 'QuestionDetail',

  // Profile stack
  ProfileHome: 'ProfileHome',
  EditProfile: 'EditProfile',
  Dashboard: 'Dashboard',
  Wallet: 'Wallet',
  Settings: 'Settings',
  Referral: 'Referral',
  School: 'School',

  // Chat stack (Faz 11)
  ChatList: 'ChatList',
  ChatRoom: 'ChatRoom',

  // Booking stack (Faz 12)
  TeacherList: 'TeacherList',
  TeacherProfile: 'TeacherProfile',
  BookingConfirm: 'BookingConfirm',
  BookingHistory: 'BookingHistory',

  // Payment stack (Faz 8)
  WalletHome: 'WalletHome',
  TopUp: 'TopUp',

  // Search (Faz 9)
  Search: 'Search',

  // Home stack
  HomeMain: 'HomeMain',
  DailyMissions: 'DailyMissions',
  AIStudyPath: 'AIStudyPath',

  // AI
  AIRecommendations: 'AIRecommendations',
  AIOnboarding: 'AIOnboarding',

  // Live Exam flow
  LiveExamWaiting: 'LiveExamWaiting',
  LiveExamSession: 'LiveExamSession',
  ExamRanking: 'ExamRanking',
  MonthlyExamDetail: 'MonthlyExamDetail',
  LiveLeaderboard: 'LiveLeaderboard',

  // Certificate & Rewards
  CertificatePreview: 'CertificatePreview',
  CertificateList: 'CertificateList',

  // Exam extras
  ExamHistory: 'ExamHistory',
  ExamFilter: 'ExamFilter',
  SpinWheel: 'SpinWheel',

  // Achievements
  Achievements: 'Achievements',
  Friends: 'Friends',

  // Gamification screens
  Leaderboard: 'Leaderboard',
  League: 'League',
  SchoolRanking: 'SchoolRanking',

  // AI Q&A
  AIAnswer: 'AIAnswer',
  AIAnswerFallback: 'AIAnswerFallback',

  // Reviews
  LeaveReview: 'LeaveReview',
  ReviewSuccess: 'ReviewSuccess',
  AllReviews: 'AllReviews',
  ReviewDetail: 'ReviewDetail',

  // Booking status screens
  BookingRejected: 'BookingRejected',
  BookingConfirmed: 'BookingConfirmed',
  BookingRequestSent: 'BookingRequestSent',

  // Lesson Request marketplace
  LessonRequest: 'LessonRequest',
  InterestedTeachers: 'InterestedTeachers',

  // School screens
  SchoolSearch: 'SchoolSearch',
  SchoolDetail: 'SchoolDetail',

  // Payment screens
  PaymentMethod: 'PaymentMethod',
  CardPayment: 'CardPayment',
  PaymentSuccess: 'PaymentSuccess',
  PaymentFailed: 'PaymentFailed',
  Subscription: 'Subscription',
  Plans: 'Plans',

  // Teacher verification
  VerificationStart: 'VerificationStart',
  VerificationDocuments: 'VerificationDocuments',
  VerificationPending: 'VerificationPending',
  VerificationRejected: 'VerificationRejected',
  VerificationSuccess: 'VerificationSuccess',

  // Settings screens
  NotificationSettings: 'NotificationSettings',
  TermsOfService: 'TermsOfService',
  Support: 'Support',
  HelpCenter: 'HelpCenter',
  ReportProblem: 'ReportProblem',
  AboutApp: 'AboutApp',
  ChangePassword: 'ChangePassword',
  PasswordChanged: 'PasswordChanged',
  AccountManagement: 'AccountManagement',
  DeactivateReason: 'DeactivateReason',
  AccountDeactivated: 'AccountDeactivated',
  DeleteAccountConfirm: 'DeleteAccountConfirm',
  LogoutConfirm: 'LogoutConfirm',

  // Earnings withdrawal (teacher)
  Withdrawal: 'Withdrawal',
  WithdrawalSuccess: 'WithdrawalSuccess',
  PayoutHistory: 'PayoutHistory',

  // Parent flow
  ParentChildren: 'ParentChildren',
  ConnectChild: 'ConnectChild',
  EnterChildCode: 'EnterChildCode',
  ConnectionPending: 'ConnectionPending',
  ConnectionSuccess: 'ConnectionSuccess',

  // Calculator stack
  Calculators: 'Calculators',
  SemesterCalc: 'SemesterCalc',
  AnnualCalc: 'AnnualCalc',
  ScoreCalc: 'ScoreCalc',
  QualityCalc: 'QualityCalc',
  DIMCalc: 'DIMCalc',
  CalcHistory: 'CalcHistory',
  CalcSaved: 'CalcSaved',
} as const;
