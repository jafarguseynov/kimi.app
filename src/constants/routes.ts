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
  Favorites: 'Favorites',
  RecentlyViewed: 'RecentlyViewed',
  Profile: 'Profile',

  // Exam stack
  ExamList: 'ExamList',
  ExamCategories: 'ExamCategories',
  CategorySubcategories: 'CategorySubcategories',
  GradeSubjects: 'GradeSubjects',
  CategoryExams: 'CategoryExams',
  LiveExamsList: 'LiveExamsList',
  LiveExamDetail: 'LiveExamDetail',
  MyExams: 'MyExams',
  ExamPurchaseConfirm: 'ExamPurchaseConfirm',
  ExamPurchaseSuccess: 'ExamPurchaseSuccess',
  ExamFilterSheet: 'ExamFilterSheet',
  ExamInfo: 'ExamInfo',
  SchoolExams: 'SchoolExams',
  AIExamRecommendations: 'AIExamRecommendations',
  ExamBrowse: 'ExamBrowse',
  NewExam: 'NewExam',
  ExamDetail: 'ExamDetail',
  ExamSession: 'ExamSession',
  ExamResult: 'ExamResult',
  ExamReview: 'ExamReview',
  ExamCollections: 'ExamCollections',

  // Learning stack
  LearningHome: 'LearningHome',
  FlashcardSession: 'FlashcardSession',
  MemoryAI: 'MemoryAI',
  LearningGroups: 'LearningGroups',
  LearningGroupDetail: 'LearningGroupDetail',
  LearningStats: 'LearningStats',

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
  ReferralBalance: 'ReferralBalance',
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
  TodaysTasks: 'TodaysTasks',
  AIStudyPlan: 'AIStudyPlan',
  MotivationReminder: 'MotivationReminder',
  LearningProgress: 'LearningProgress',
  TopicProgress: 'TopicProgress',
  ReviewTopics: 'ReviewTopics',
  AIPracticeBuilder: 'AIPracticeBuilder',
  WeakTopics: 'WeakTopics',

  // AI
  AIRecommendations: 'AIRecommendations',
  AIOnboarding: 'AIOnboarding',

  // Notifications onboarding
  NotificationPriming: 'NotificationPriming',

  // Live Exam flow
  LiveExamWaiting: 'LiveExamWaiting',
  LiveExamSession: 'LiveExamSession',
  ExamRanking: 'ExamRanking',
  MonthlyExamDetail: 'MonthlyExamDetail',
  LiveLeaderboard: 'LiveLeaderboard',
  CompetitionResult: 'CompetitionResult',
  DuelMatch: 'DuelMatch',
  DuelMode: 'DuelMode',
  DuelSession: 'DuelSession',
  DuelInvite: 'DuelInvite',
  DuelHistory: 'DuelHistory',
  RewardHistory: 'RewardHistory',
  SmartFeed: 'SmartFeed',
  StreakProtection: 'StreakProtection',
  StreakDashboard: 'StreakDashboard',
  StreakDetail: 'StreakDetail',
  StreakWarning: 'StreakWarning',
  StreakRecovery: 'StreakRecovery',
  MissionProgress: 'MissionProgress',
  MissionStart: 'MissionStart',
  PerformanceSummary: 'PerformanceSummary',
  ImprovementTips: 'ImprovementTips',
  WeeklyReport: 'WeeklyReport',
  SocialHub: 'SocialHub',
  FindFriend: 'FindFriend',
  MyFriends: 'MyFriends',
  TeacherProfilePremium: 'TeacherProfilePremium',
  FriendsLeaderboard: 'FriendsLeaderboard',
  InviteFriends: 'InviteFriends',

  // Certificate & Rewards
  CertificatePreview: 'CertificatePreview',
  CertificateList: 'CertificateList',

  // Exam extras
  ExamHistory: 'ExamHistory',
  ExamFilter: 'ExamFilter',
  ExamSettings: 'ExamSettings',
  SpinWheel: 'SpinWheel',
  CoinShop: 'CoinShop',

  // Achievements
  Achievements: 'Achievements',
  Friends: 'Friends',

  // Gamification screens
  Leaderboard: 'Leaderboard',
  LeaderboardDetail: 'LeaderboardDetail',
  LiveActivity: 'LiveActivity',
  News: 'News',
  League: 'League',
  SchoolRanking: 'SchoolRanking',

  // AI Q&A
  AIAnswer: 'AIAnswer',
  AISolution: 'AISolution',
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
  AllOpenRequests: 'AllOpenRequests',
  LessonRequestDetail: 'LessonRequestDetail',
  MyRequests: 'MyRequests',

  // School screens
  SchoolSearch: 'SchoolSearch',
  SchoolDetail: 'SchoolDetail',

  // Payment screens
  PaymentMethod: 'PaymentMethod',
  CardPayment: 'CardPayment',
  PaymentSuccess: 'PaymentSuccess',
  PaymentFailed: 'PaymentFailed',
  Subscription: 'Subscription',
  SubscriptionRenew: 'SubscriptionRenew',
  SubscriptionCancel: 'SubscriptionCancel',
  Plans: 'Plans',
  PlanCompare: 'PlanCompare',
  PremiumBenefits: 'PremiumBenefits',

  // Teacher progression
  TeacherBadges: 'TeacherBadges',
  TeacherLevel: 'TeacherLevel',
  VerifiedTeacher: 'VerifiedTeacher',
  TopTeachersLeaderboard: 'TopTeachersLeaderboard',
  TeacherStudents: 'TeacherStudents',
  TeacherBoost: 'TeacherBoost',
  TeacherProfileSetup: 'TeacherProfileSetup',
  TeacherClass: 'TeacherClass',
  JoinTeacher: 'JoinTeacher',

  // Teacher verification
  VerificationStart: 'VerificationStart',
  VerificationDocuments: 'VerificationDocuments',
  VerificationPending: 'VerificationPending',
  VerificationRejected: 'VerificationRejected',
  VerificationSuccess: 'VerificationSuccess',

  // Settings screens
  Notifications: 'Notifications',
  NotificationSettings: 'NotificationSettings',
  LanguageSelect: 'LanguageSelect',
  TwoFactor: 'TwoFactor',
  BlockedUsers: 'BlockedUsers',
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
  ChildAcademicReport: 'ChildAcademicReport',
  ChildActivity: 'ChildActivity',
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
  ClassGradeCalc: 'ClassGradeCalc',
} as const;
