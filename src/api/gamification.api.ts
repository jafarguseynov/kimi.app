import apiClient from './client';

/**
 * "Sənin irəliləyişin" — bütün dəyərlər SERVERDƏN gəlir.
 * Mobil tərəfdə heç bir XP/səviyyə/liqa/reytinq hesablaması APARILMIR.
 */

export interface StreakDay {
  date: string; // 'YYYY-MM-DD'
  active: boolean;
  isToday: boolean;
}

export interface GamificationStreak {
  current: number;
  best: number;
  todayActive: boolean;
  activeDays: number;
  week: StreakDay[];
  nextMilestone: { days: number; bonusXp: number } | null;
}

export interface DailyGoal {
  target: number;
  progress: number;
  answered: number;
  completed: boolean;
  /** bu sorğuda tamamlandı → qeyd animasiyası göstər */
  justCompleted: boolean;
  rewardXp: number;
  isFirstGoal: boolean;
}

export interface LeagueTier {
  key: string;
  title: string;
  emoji: string;
  minWeeklyXp: number;
}

export interface LeagueNeighbor {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  weeklyXp: number;
  isCurrentUser: boolean;
}

export interface LeagueState {
  league: LeagueTier;
  nextLeague: LeagueTier | null;
  xpToNextLeague: number | null;
  weeklyXp: number;
  rank: number | null;
  participants: number;
  xpToPassAbove: number | null;
  neighbors: LeagueNeighbor[];
  weekStart: string;
  leagues: LeagueTier[];
}

export interface RankState {
  /** null = hələ XP qazanmayıb (uydurma mövqe göstərmirik) */
  rank: number | null;
  totalStudents: number;
  totalXp: number;
  /** müsbət = bu həftə irəlilədi; null = müqayisə üçün snapshot yoxdur */
  rankDelta: number | null;
  comparedWeek: string | null;
}

export interface Achievement {
  key: string;
  title: string;
  description: string;
  emoji: string;
  bonusXp: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

/**
 * Sistemin qaydaları — "Bura nədir?" izahı üçün.
 * Serverdən gəlir ki, izahdakı rəqəmlər həmişə real qaydalarla eyni olsun.
 */
export interface GamificationRules {
  xp: {
    questionCorrect: number;
    examCompleted: number;
    examHighScore: number;
    dailyGoal: number;
  };
  xpPerLevel: number;
  streakMilestones: { days: number; bonusXp: number }[];
}

/** Səviyyə mükafatı — admin paneldən idarə olunur. */
export interface LevelReward {
  level: number;
  coins: number;
  streakFreezes: number;
  title: string | null;
}

export interface GamificationState {
  xp: number;
  level: number;
  levelFloorXp: number;
  levelCeilingXp: number;
  xpIntoLevel: number;
  xpForLevel: number;
  xpToNextLevel: number;
  streak: GamificationStreak;
  dailyGoal: DailyGoal;
  league: LeagueState;
  rank: RankState;
  achievements: Achievement[];
  /** bu sorğuda açılanlar → "Yeni nişan!" animasiyası */
  newlyUnlocked: Achievement[];
  /** növbəti səviyyədə nə açılacaq; null = həmin səviyyəyə mükafat təyin edilməyib */
  nextLevelReward: LevelReward | null;
  rules: GamificationRules;
}

export interface XpHistoryItem {
  id: string;
  type: string;
  label: string;
  amount: number;
  meta: Record<string, any> | null;
  createdAt: string;
}

/** Cihazın UTC-dən fərqi (dəqiqə) — server gün sərhədini bununla hesablayır. */
const tzOffsetMinutes = () => -new Date().getTimezoneOffset();

export const getGamification = () =>
  apiClient
    .get<GamificationState>('/gamification/me', { params: { tz: tzOffsetMinutes() } })
    .then((r) => r.data);

export const getXpHistory = (limit = 50) =>
  apiClient.get<XpHistoryItem[]>('/gamification/xp-history', { params: { limit } }).then((r) => r.data);

export const getAchievements = () =>
  apiClient.get<Achievement[]>('/gamification/achievements').then((r) => r.data);
