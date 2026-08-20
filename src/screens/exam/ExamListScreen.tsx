import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Modal, Share, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { PREMIUM_ENTRY_ROUTE, PAYMENTS_ENABLED } from '../../config/iap';
import { Colors } from '../../constants/colors';
import { useExamList, useExamCollections } from '../../hooks/useExams';
import { useExamCategories } from '../../hooks/useExamCategories';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getExamResults, ExamResultRow } from '../../api/certificate.api';
import { getTopicStats } from '../../api/topicStats.api';
import { getEntitlements } from '../../api/shop.api';
import { getUpcomingExamEvents, getPopularExams } from '../../api/exam.api';
import { getMe } from '../../api/user.api';
import { useExamStore } from '../../store/exam.store';
import { useExamGoalStore } from '../../store/examGoal.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const INACTIVITY_DAYS = 3;
const GOAL_OPTIONS = [1, 2, 3, 4, 5];
/** Ana axında göstərilən kateqoriya sayı — qalanı "Hamısına bax" səhifəsində. */
const CATEGORY_PREVIEW = 6;

const DIFFICULTY_META = {
  easy: { label: 'Asan', color: '#16A34A' },
  medium: { label: 'Orta', color: '#F59E0B' },
  hard: { label: 'Çətin', color: '#DC2626' },
} as const;

const AZ_MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];
const DAY_LABELS = ['B.E', 'Ç.A', 'Ç', 'C.A', 'C', 'Ş', 'B']; // Mon..Sun

/**
 * Kateqoriya kartlarının FALLBACK paleti. Başlıq, ikon, fon və vurğu rəngi
 * admin paneldən (backend taksonomiyası) gəlir — bu siyahı yalnız backend
 * cavab vermədikdə və ya sahə boş qaldıqda işə düşür.
 */
const CATEGORY_STYLE: Record<string, { emoji: string; bg: string; accent: string }> = {
  mock:          { emoji: '📊',     bg: '#FCE7F3', accent: '#EC4899' },
  middle:        { emoji: '📘',     bg: '#EFF6FF', accent: '#3B82F6' },
  russian:       { emoji: '🇷🇺',     bg: '#EEF2FF', accent: '#6366F1' },
  abituriyent:   { emoji: '🎓',     bg: '#FFFBEB', accent: '#F59E0B' },
  magistr:       { emoji: '📚',     bg: '#F5F3FF', accent: '#8B5CF6' },
  miq:           { emoji: '👨‍🏫', bg: '#ECFDF5', accent: '#10B981' },
  preschool:     { emoji: '🧒',     bg: '#FFF7ED', accent: '#F97316' },
  rezidentura:   { emoji: '🩺',     bg: '#FEE2E2', accent: '#EF4444' },
  doctorate:     { emoji: '🎓',     bg: '#E0E7FF', accent: '#6366F1' },
  govservice:    { emoji: '🏛️',     bg: '#F3F4F6', accent: '#64748B' },
  ability:       { emoji: '🎨',     bg: '#FDF4FF', accent: '#A855F7' },
  college:       { emoji: '🏫',     bg: '#FEF3C7', accent: '#D97706' },
  international: { emoji: '🌐',     bg: '#DBEAFE', accent: '#0EA5E9' },
  professional:  { emoji: '🏅',     bg: '#FEF9C3', accent: '#CA8A04' },
};

/** Backend əlçatan deyilsə istifadə olunan minimum taksonomiya. */
const FALLBACK_CATEGORY_KEYS = ['mock', 'middle', 'abituriyent', 'russian', 'magistr', 'miq', 'preschool'];

const FALLBACK_CATEGORY_TITLES: Record<string, string> = {
  mock: 'Sınaqlar', middle: 'Orta Məktəb', abituriyent: 'Abituriyent',
  russian: 'Rus bölməsi', magistr: 'Magistratura', miq: 'MIQ', preschool: 'Məktəbəqədər',
};

type TabKey = 'exams' | 'compete';
type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamList> };

const dateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const computeNextMonthlyLabel = () => {
  const now = new Date();
  const target = now.getDate() > 25
    ? new Date(now.getFullYear(), now.getMonth() + 2, 0)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${target.getDate()} ${AZ_MONTHS[target.getMonth()]}`;
};

const computeWeekBars = (results: { completedAt: string }[]) => {
  const buckets: Record<string, number> = {};
  const days: { dateKey: string; weekdayIndex: number }[] = [];
  const today = startOfDay(new Date());
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    buckets[key] = 0;
    const wd = (d.getDay() + 6) % 7;
    days.push({ dateKey: key, weekdayIndex: wd });
  }
  for (const r of results) {
    const k = dateKey(new Date(r.completedAt));
    if (k in buckets) buckets[k] += 1;
  }
  const max = Math.max(1, ...Object.values(buckets));
  const todayKey = dateKey(today);
  return days.map((d) => ({
    label: DAY_LABELS[d.weekdayIndex],
    height: buckets[d.dateKey] / max,
    count: buckets[d.dateKey],
    isToday: d.dateKey === todayKey,
  }));
};

const computeHeatmap = (results: { completedAt: string }[]) => {
  const buckets: Record<string, number> = {};
  for (const r of results) {
    const k = dateKey(new Date(r.completedAt));
    buckets[k] = (buckets[k] ?? 0) + 1;
  }
  const today = startOfDay(new Date());
  const cells: { key: string; count: number; isToday: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    cells.push({ key, count: buckets[key] ?? 0, isToday: i === 0 });
  }
  return cells;
};

const heatmapColor = (count: number) => {
  if (count === 0) return Colors.surfaceLow;
  if (count === 1) return Colors.primaryLight;
  if (count === 2) return Colors.primary + '88';
  return Colors.primary;
};

const computeStats = (results: ExamResultRow[]) => {
  if (results.length === 0) return { best: 0, avg: 0, count: 0 };
  const best = Math.max(...results.map((r) => r.percentage));
  const avg = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
  return { best, avg, count: results.length };
};

const computeBestHour = (results: ExamResultRow[]): { range: string; count: number } | null => {
  if (results.length < 2) return null;
  const buckets: Record<number, number> = {};
  for (const r of results) {
    const h = new Date(r.completedAt).getHours();
    buckets[h] = (buckets[h] ?? 0) + 1;
  }
  let peakHour = -1;
  let peakCount = 0;
  for (const k of Object.keys(buckets)) {
    const h = Number(k);
    if (buckets[h] > peakCount) { peakHour = h; peakCount = buckets[h]; }
  }
  if (peakHour < 0) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return { range: `${pad(peakHour)}:00–${pad((peakHour + 2) % 24)}:00`, count: peakCount };
};

const computeDifficultyMix = (exams: { difficulty: 'easy' | 'medium' | 'hard' }[]) => {
  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const e of exams) counts[e.difficulty] = (counts[e.difficulty] ?? 0) + 1;
  const total = counts.easy + counts.medium + counts.hard;
  if (total === 0) return null;
  return {
    easy: { count: counts.easy, pct: Math.round((counts.easy / total) * 100) },
    medium: { count: counts.medium, pct: Math.round((counts.medium / total) * 100) },
    hard: { count: counts.hard, pct: Math.round((counts.hard / total) * 100) },
    total,
  };
};

const computeExamStreak = (results: { completedAt: string }[]) => {
  if (results.length === 0) return 0;
  const dateSet = new Set(results.map((r) => dateKey(new Date(r.completedAt))));
  const today = startOfDay(new Date());
  const todayK = dateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayK = dateKey(yesterday);

  // Start from today if active, else from yesterday (grace day — streak not yet broken until day ends)
  let cursor: Date;
  if (dateSet.has(todayK)) cursor = new Date(today);
  else if (dateSet.has(yesterdayK)) cursor = new Date(yesterday);
  else return 0;

  let count = 0;
  while (dateSet.has(dateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
};

const daysSinceLastExam = (results: ExamResultRow[]) => {
  if (results.length === 0) return null;
  const latest = results.reduce((max, r) =>
    new Date(r.completedAt).getTime() > new Date(max.completedAt).getTime() ? r : max,
  );
  const diff = Date.now() - new Date(latest.completedAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/** "9-cu sinif" / "11-ci" / "9" → 9. Rəqəm yoxdursa null. */
const gradeDigits = (g?: string | null): number | null => {
  if (!g) return null;
  const m = String(g).match(/\d+/);
  return m ? Number(m[0]) : null;
};

/** 1240 → "1.2K" (iştirak sayı çipi üçün). */
const compactCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}K` : String(n));

export default function ExamListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const rootNav = useNavigation<any>();

  // Açar üzrə tərcümə varsa onu götür, yoxsa backend başlığına düş.
  const tOr = (key: string, fallback: string) => {
    const hit = t(key);
    return hit === key ? fallback : hit;
  };

  const [tab, setTab] = useState<TabKey>('exams');

  const { data: exams = [], refetch: refetchExams } = useExamList();
  const { data: bankCollections = [] } = useExamCollections();
  const { data: results = [], refetch: refetchResults } = useQuery({ queryKey: ['examResults'], queryFn: getExamResults });
  const { data: topicStats } = useQuery({ queryKey: ['topicStats'], queryFn: getTopicStats });
  const { data: entitlements } = useQuery({ queryKey: ['entitlements'], queryFn: getEntitlements });
  const premiumActive = !!entitlements?.premiumActive;

  // Fərdiləşdirmə mənbəyi: şagirdin sinfi və məqsədi (profil, real backend sahələri).
  const { data: me } = useQuery({ queryKey: ['user', 'me'], queryFn: getMe, staleTime: 10 * 60 * 1000, retry: false });
  const myGrade: string | undefined = (me as any)?.grade;
  const myGoal: string | undefined = (me as any)?.goal;
  const myGradeNum = useMemo(() => gradeDigits(myGrade), [myGrade]);

  // Populyar imtahanlar — iştirak sayı və ortalama nəticə serverdə real hesablanır.
  const { data: popular = [], refetch: refetchPopular } = useQuery({
    queryKey: ['popular-exams', myGrade ?? ''],
    queryFn: () => getPopularExams({ limit: 8, grade: myGrade }),
    retry: false,
  });

  const remoteCats = useExamCategories();

  // Rəsmi imtahan sessiyaları (admin-idarəli, cədvəlli) — yoxdursa köhnə statik davranış.
  const { data: examEvents } = useQuery({ queryKey: ['upcomingExamEvents'], queryFn: getUpcomingExamEvents });
  const monthlyEvent = examEvents?.monthly ?? null;
  const nationalEvent = examEvents?.national ?? null;

  const setSubmissionType = useExamStore((s) => s.setSubmissionType);
  const sessionId = useExamStore((s) => s.sessionId);
  const sessionQuestionsLen = useExamStore((s) => s.questions.length);
  const sessionAnswers = useExamStore((s) => s.answers);
  const sessionMeta = useExamStore((s) => s.examMeta);
  const sessionResult = useExamStore((s) => s.result);

  const streak = useMemo(() => computeExamStreak(results), [results]);
  const dailyGoal = useExamGoalStore((s) => s.dailyGoal);
  const setDailyGoal = useExamGoalStore((s) => s.setDailyGoal);
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const todayCount = useMemo(() => {
    const today = dateKey(startOfDay(new Date()));
    return results.filter((r) => dateKey(new Date(r.completedAt)) === today).length;
  }, [results]);
  const goalReached = todayCount >= dailyGoal;

  const weekBars = useMemo(() => computeWeekBars(results), [results]);
  const heatmap = useMemo(() => computeHeatmap(results), [results]);
  const stats = useMemo(() => computeStats(results), [results]);
  const bestHour = useMemo(() => computeBestHour(results), [results]);
  const difficultyMix = useMemo(() => computeDifficultyMix(exams), [exams]);
  const nextMonthlyLabel = useMemo(() => computeNextMonthlyLabel(), []);
  // Aylıq kartın altyazısı: admin cədvəlli event varsa onun REAL tarixi, yoxsa hesablanmış.
  const monthlyDateLabel = useMemo(() => {
    if (monthlyEvent) {
      const d = new Date(monthlyEvent.startAt);
      return `${d.getDate()} ${AZ_MONTHS[d.getMonth()]}`;
    }
    return nextMonthlyLabel;
  }, [monthlyEvent, nextMonthlyLabel]);
  const lastResult = results[0];
  const idleDays = daysSinceLastExam(results);

  // Has a paused/unsubmitted session?
  const hasResumableSession = !!sessionId && sessionQuestionsLen > 0 && !sessionResult;
  const answeredCount = useMemo(() => Object.keys(sessionAnswers ?? {}).length, [sessionAnswers]);
  const resumePct = sessionQuestionsLen > 0 ? Math.round((answeredCount / sessionQuestionsLen) * 100) : 0;

  // Has live activity right now? Demo: weekday + business hours 9-22 OR last live result < 1h
  const hasLiveNow = useMemo(() => {
    const h = new Date().getHours();
    return h >= 9 && h <= 22;
  }, []);

  // AI recommended subject from weak topics
  const recommendedSubject = topicStats?.weak?.[0];
  const recommendedExam = useMemo(() => {
    if (!recommendedSubject) return null;
    const needle = recommendedSubject.trim().toLowerCase();
    // Çoxfənnli "Günün Sınağı" imtahanlarının `subject` sahəsi vergüllə ayrılmış
    // siyahıdır ("Azərbaycan dili, Riyaziyyat, ...") və sadə `includes` axtarışına
    // düşür. Zəif mövzu üçün 200 suallıq qarışıq sınaq tövsiyə etmək səhvdir —
    // ona görə əvvəlcə TƏK fənnli imtahanlar arasında dəqiq uyğunluq axtarılır.
    const single = exams.filter((e) => !e.subject.includes(','));
    return (
      single.find((e) => e.subject.trim().toLowerCase() === needle) ??
      single.find((e) => e.subject.toLowerCase().includes(needle)) ??
      single.find((e) => e.title.toLowerCase().includes(needle)) ??
      null
    );
  }, [exams, recommendedSubject]);

  /**
   * Fərdiləşdirmə: şagirdin sinfi/məqsədi kateqoriya sırasını dəyişir.
   * 11-ci sinif şagirdi "Abituriyent"i birinci görür, 3-cü sinif "Orta məktəb"i.
   * Məlumat yoxdursa sıra backend-dəki sortOrder-də qalır.
   */
  const categoryPriority = useMemo<string[]>(() => {
    const goal = (myGoal ?? '').toLowerCase();
    if (goal.includes('magistr')) return ['magistr', 'mock', 'abituriyent'];
    if (goal.includes('miq') || goal.includes('müəllim')) return ['miq', 'mock'];
    if (/abituriyent/i.test(myGrade ?? '') || (myGradeNum != null && myGradeNum >= 10)) {
      return ['abituriyent', 'mock', 'middle'];
    }
    if (myGradeNum != null && myGradeNum <= 4) return ['preschool', 'middle', 'mock'];
    if (myGradeNum != null) return ['middle', 'mock', 'russian'];
    return [];
  }, [myGoal, myGrade, myGradeNum]);

  const categories = useMemo(() => {
    const base = remoteCats
      ? remoteCats.map((c) => ({
          key: c.key,
          title: tOr(`examCat.${c.key}.title`, c.title),
          emoji: c.emoji ?? CATEGORY_STYLE[c.key]?.emoji ?? '📂',
          bg: c.bg ?? CATEGORY_STYLE[c.key]?.bg ?? '#EFF6FF',
          accent: c.accent ?? CATEGORY_STYLE[c.key]?.accent ?? Colors.primary,
        }))
      : FALLBACK_CATEGORY_KEYS.map((k) => ({
          key: k,
          title: tOr(`examCat.${k}.title`, FALLBACK_CATEGORY_TITLES[k] ?? k),
          emoji: CATEGORY_STYLE[k]?.emoji ?? '📂',
          bg: CATEGORY_STYLE[k]?.bg ?? '#EFF6FF',
          accent: CATEGORY_STYLE[k]?.accent ?? Colors.primary,
        }));
    const rank = (k: string) => {
      const i = categoryPriority.indexOf(k);
      return i === -1 ? 99 : i;
    };
    return base.slice().sort((a, b) => rank(a.key) - rank(b.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteCats, categoryPriority, t]);

  const myWeeklyCount = weekBars.reduce((s, b) => s + b.count, 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchExams(), refetchResults(), refetchPopular()]);
    qc.invalidateQueries({ queryKey: ['certificates'] });
    qc.invalidateQueries({ queryKey: ['topicStats'] });
    setRefreshing(false);
  }, [refetchExams, refetchResults, refetchPopular, qc]);

  const openBrowse = (subject?: string) => {
    setSubmissionType('practice');
    navigation.navigate(Routes.ExamBrowse, subject && subject !== 'Hamısı' ? { subject } : undefined);
  };
  const openExam = (examId: string, title: string) => {
    setSubmissionType('practice');
    navigation.navigate(Routes.ExamDetail, { examId, title });
  };
  const openLive = () => {
    if (!hasLiveNow) {
      Alert.alert(t('examList.alertLiveTitle'), t('examList.alertNoLive'));
      return;
    }
    const first = exams[0];
    if (!first?.id) {
      Alert.alert(t('examList.alertLiveTitle'), t('examList.alertNoExam'));
      return;
    }
    setSubmissionType('live');
    navigation.navigate(Routes.LiveExamWaiting, { examId: first.id, title: first.title });
  };
  const openMonthly = () => {
    setSubmissionType('monthly');
    // Admin cədvəlli aylıq sessiya varsa — real event detalına.
    if (monthlyEvent) {
      navigation.navigate(Routes.MonthlyExamDetail, { eventId: monthlyEvent.id, title: monthlyEvent.title });
      return;
    }
    const first = exams[0];
    if (!first?.id) {
      Alert.alert(t('examList.alertMonthlyTitle'), t('examList.alertNoExam'));
      return;
    }
    navigation.navigate(Routes.MonthlyExamDetail, { examId: first.id, title: first.title });
  };
  const openNational = () => {
    // Premium gate — event premiumOnly deyilsə açıq; event yoxdursa köhnə davranış (premium tələb).
    const requiresPremium = nationalEvent ? nationalEvent.premiumOnly : true;
    if (requiresPremium && !premiumActive) {
      Alert.alert(
        t('examList.alertNationalTitle'),
        t('examList.alertNationalMsg'),
        [
          { text: t('examList.later'), style: 'cancel' },
          { text: t('examList.openPremium'), onPress: openPremium },
        ],
      );
      return;
    }
    setSubmissionType('national');
    // Admin cədvəlli Milli Reyting imtahanı varsa — real event detalına (tarix/iştirak/sıralama).
    if (nationalEvent) {
      navigation.navigate(Routes.MonthlyExamDetail, { eventId: nationalEvent.id, title: nationalEvent.title });
      return;
    }
    // Fallback: real qlobal reytinq ekranı.
    rootNav.navigate(Routes.Home, { screen: Routes.Leaderboard });
  };
  // iOS-da (App Store 3.1.1) qiymət/satınalma göstərilmir — yalnız-məlumat səhifəsi açılır.
  // `returnTab` — Premium ekranı Home stack-indədir; geri basanda Ana səhifəyə
  // yox, İmtahanlar tabına qayıtsın deyə (bax: useReturnTab).
  const openPremium = () =>
    rootNav.navigate(Routes.Home, { screen: PREMIUM_ENTRY_ROUTE, params: { returnTab: 'Exams' }, initial: false });
  const openHistory = () => navigation.navigate(Routes.ExamHistory);
  const openLiveLeaderboard = () => navigation.navigate(Routes.LiveLeaderboard);
  const openCertificates = () => navigation.navigate(Routes.CertificateList);
  const openProfile = () => rootNav.navigate('Profile');
  const openReport = () => rootNav.navigate('Profile', { screen: Routes.ReportProblem });
  const openLeaderboard = () => rootNav.navigate(Routes.Home, { screen: Routes.Leaderboard });
  const resumeSession = () => navigation.navigate(Routes.ExamSession);
  const openRecommended = () => {
    if (recommendedExam) openExam(recommendedExam.id, recommendedExam.title);
    else if (recommendedSubject) openBrowse(recommendedSubject);
    else openBrowse();
  };

  const shareProgress = async () => {
    const top = stats.count > 0 ? t('examList.shareTop', { best: stats.best, avg: stats.avg }) : '';
    const week = t('examList.shareWeek', { n: myWeeklyCount });
    const streakLine = streak > 0 ? t('examList.shareStreak', { n: streak }) : '';
    const message = [
      t('examList.shareLearning'),
      week,
      top,
      streakLine,
    ].filter(Boolean).join('\n');
    try {
      await Share.share({ message });
    } catch {
      // user cancelled
    }
  };
  const chooseGoal = (n: number) => {
    setDailyGoal(n);
    setGoalModalOpen(false);
  };

  /** Yarışlar tabındakı sətir kartı — eyni vizual dil, təkrar kod yox. */
  const renderCompeteRow = (
    icon: React.ComponentProps<typeof Ionicons>['name'],
    tint: string,
    bg: string,
    title: string,
    sub: string,
    onPress: () => void,
    badge?: React.ReactNode,
  ) => (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[compStyles.row, styles.cardSurface]}>
      <View style={[compStyles.iconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={compStyles.titleRow}>
          <Text style={compStyles.title}>{title}</Text>
          {badge}
        </View>
        <Text style={compStyles.sub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => (navigation.getParent() as any)?.navigate(Routes.Home, { screen: Routes.HomeMain })}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAvatar} onPress={openProfile} hitSlop={6} activeOpacity={0.85}>
            <Ionicons name="person" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('examList.title')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {streak > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => (navigation.getParent() as any)?.navigate(Routes.Home, { screen: Routes.StreakDashboard })}
              hitSlop={8}
              style={styles.streakChip}
            >
              <Ionicons name="flame" size={12} color="#F97316" />
              <Text style={styles.streakChipText}>{streak}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Əsas naviqasiya: İmtahanlar | Yarışlar ─────────────────────────── */}
      <View style={tabStyles.bar}>
        {([
          { key: 'exams' as TabKey, icon: 'document-text' as const, label: t('examList.tabExams') },
          { key: 'compete' as TabKey, icon: 'trophy' as const, label: t('examList.tabCompete') },
        ]).map((item) => {
          const active = tab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.85}
              onPress={() => setTab(item.key)}
              style={[tabStyles.btn, active && tabStyles.btnActive]}
            >
              <Ionicons name={item.icon} size={15} color={active ? '#fff' : Colors.textSecondary} />
              <Text style={[tabStyles.text, active && tabStyles.textActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        key={tab}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {tab === 'exams' ? (
          <>
            {/* ▶️ İmtahanına davam et — ən yuxarı prioritet. Yarımçıq sessiya yoxdursa
                bu blok ÜMUMİYYƏTLƏ render olunmur (boş yer qalmır). */}
            {hasResumableSession && (
              <TouchableOpacity onPress={resumeSession} activeOpacity={0.9} style={styles.resumeBanner}>
                <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.resumeGradient}>
                  <View style={styles.resumeTop}>
                    <View style={styles.resumeIcon}>
                      <Ionicons name="play" size={20} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resumeTitle}>{t('examList.resumeTitle')}</Text>
                      <Text style={styles.resumeSub} numberOfLines={1}>
                        {sessionMeta?.title || t('examList.resumeSub', { n: sessionQuestionsLen })}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                  </View>
                  <View style={styles.resumeBarBg}>
                    <View style={[styles.resumeBarFill, { width: `${Math.max(4, resumePct)}%` }]} />
                  </View>
                  <View style={styles.resumeFooter}>
                    <Text style={styles.resumeMeta}>
                      {t('examList.resumeProgress', { a: answeredCount, b: sessionQuestionsLen })}
                    </Text>
                    <Text style={styles.resumeMeta}>{resumePct}%</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Inactivity reminder — only when no resume banner */}
            {!hasResumableSession && idleDays !== null && idleDays >= INACTIVITY_DAYS && (
              <TouchableOpacity onPress={() => openBrowse()} activeOpacity={0.9} style={styles.inactiveCard}>
                <View style={styles.inactiveIcon}>
                  <Ionicons name="time-outline" size={20} color="#9A3412" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inactiveTitle}>{t('examList.idleTitle', { n: idleDays })}</Text>
                  <Text style={styles.inactiveSub}>{t('examList.idleSub')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9A3412" />
              </TouchableOpacity>
            )}

            {/* 📚 İmtahan kateqoriyaları — sıra şagirdin sinfinə görə fərdiləşir */}
            <View style={catStyles.section}>
              <View style={catStyles.sectionHeader}>
                <View style={catStyles.titleWrap}>
                  <View style={catStyles.accentBar} />
                  <View style={{ flex: 1 }}>
                    <Text style={catStyles.title}>{t('examList.catTitle')}</Text>
                    <Text style={catStyles.sectionSub}>{t('examList.catSub')}</Text>
                  </View>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate(Routes.ExamCategories)} hitSlop={8} style={catStyles.seeAllBtn}>
                  <Text style={catStyles.seeAll}>{t('examList.seeAll')}</Text>
                  <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={catStyles.row}>
                {categories.slice(0, CATEGORY_PREVIEW).map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate(Routes.CategorySubcategories, { categoryKey: c.key, categoryTitle: c.title })}
                    style={[catStyles.card, { borderBottomColor: c.accent }]}
                  >
                    <View style={[catStyles.iconBox, { backgroundColor: c.bg }]}>
                      <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
                    </View>
                    <Text style={catStyles.cardTitle} numberOfLines={1}>{c.title}</Text>
                    <View style={catStyles.cardCta}>
                      <Text style={[catStyles.cardCtaText, { color: c.accent }]}>{t('examList.view')}</Text>
                      <Ionicons name="arrow-forward" size={11} color={c.accent} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ✨ Sənin üçün — AI fərdiləşdirmə (zəif mövzu → konkret imtahan) */}
            <View style={secStyles.section}>
              <View style={secStyles.head}>
                <Text style={secStyles.title}>{t('examList.forYouTitle')}</Text>
                <TouchableOpacity activeOpacity={0.7} hitSlop={8} onPress={() => navigation.navigate(Routes.AIExamRecommendations)}>
                  <Text style={catStyles.seeAll}>{t('examList.allArrow')}</Text>
                </TouchableOpacity>
              </View>

              {recommendedSubject ? (
                <TouchableOpacity activeOpacity={0.9} onPress={openRecommended} style={styles.aiRecCard}>
                  <View style={styles.aiRecIcon}>
                    <Ionicons name="sparkles" size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aiRecLabel}>{t('examList.aiRecLabel')}</Text>
                    <Text style={styles.aiRecTitle}>{t('examList.aiRecTitle', { subject: recommendedSubject })}</Text>
                    <Text style={styles.aiRecSub}>{t('examList.aiRecSub')}</Text>
                    {!!recommendedExam && (
                      <Text style={styles.aiRecMeta}>
                        {t('examList.forYouMeta', { q: (recommendedExam as any).questionCount ?? 0, m: recommendedExam.duration })}
                      </Text>
                    )}
                  </View>
                  <View style={styles.aiRecArrow}>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
              ) : (
                // Hələ kifayət qədər nəticə yoxdur — uydurma tövsiyə göstərmirik.
                <TouchableOpacity activeOpacity={0.9} onPress={() => openBrowse()} style={styles.forYouEmpty}>
                  <View style={styles.aiRecIcon}>
                    <Ionicons name="sparkles-outline" size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.forYouEmptyTitle}>{t('examList.forYouEmptyTitle')}</Text>
                    <Text style={styles.forYouEmptySub}>{t('examList.forYouEmptySub')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {/* 🔥 Populyar imtahanlar — iştirak/ortalama rəqəmləri realdır */}
            {popular.length > 0 && (
              <View style={secStyles.section}>
                <View style={secStyles.head}>
                  <View style={{ flex: 1 }}>
                    <Text style={secStyles.title}>{t('examList.popularTitle')}</Text>
                    <Text style={secStyles.sub}>{t('examList.popularSub')}</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.7} hitSlop={8} onPress={() => openBrowse()}>
                    <Text style={catStyles.seeAll}>{t('examList.allArrow')}</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={popStyles.row}>
                  {popular.map((e) => {
                    const diff = DIFFICULTY_META[e.difficulty as keyof typeof DIFFICULTY_META];
                    return (
                      <TouchableOpacity
                        key={e.id}
                        activeOpacity={0.85}
                        onPress={() => openExam(e.id, e.title)}
                        style={[popStyles.card, styles.cardSurface]}
                      >
                        <View style={popStyles.topRow}>
                          <View style={[popStyles.subjectPill, { backgroundColor: Colors.primaryLight }]}>
                            <Text style={popStyles.subjectPillText} numberOfLines={1}>{e.subject}</Text>
                          </View>
                          {!!diff && (
                            <View style={[popStyles.diffDot, { backgroundColor: diff.color }]} />
                          )}
                        </View>
                        <Text style={popStyles.title} numberOfLines={2}>{e.title}</Text>
                        <Text style={popStyles.meta}>
                          {t('examList.forYouMeta', { q: e.questionCount, m: e.duration })}
                        </Text>
                        <View style={popStyles.proofRow}>
                          {e.participants > 0 && (
                            <View style={popStyles.proofItem}>
                              <Ionicons name="people" size={12} color={Colors.textSecondary} />
                              <Text style={popStyles.proofText}>{compactCount(e.participants)}</Text>
                            </View>
                          )}
                          {e.participants > 0 && (
                            <View style={popStyles.proofItem}>
                              <Ionicons name="stats-chart" size={12} color={Colors.textSecondary} />
                              <Text style={popStyles.proofText}>{t('examList.popularAvg', { n: e.avgPct })}</Text>
                            </View>
                          )}
                          {e.participants === 0 && (
                            <View style={popStyles.proofItem}>
                              <Ionicons name="sparkles" size={12} color={Colors.primary} />
                              <Text style={[popStyles.proofText, { color: Colors.primary }]}>{t('examList.popularNew')}</Text>
                            </View>
                          )}
                        </View>
                        <View style={popStyles.cta}>
                          <Text style={popStyles.ctaText}>{t('examList.start')}</Text>
                          <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* İmtahan Bankları — admin yüklədiyi PDF banklarından random test */}
            {bankCollections.length > 0 && (
              <View style={secStyles.section}>
                <View style={secStyles.head}>
                  <Text style={secStyles.title}>{t('examList.banks')}</Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate(Routes.ExamCollections)} hitSlop={8}>
                    <Text style={catStyles.seeAll}>{t('examList.allArrow')}</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={catStyles.row}>
                  {bankCollections.slice(0, 8).map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate(Routes.ExamCollections)}
                      style={catStyles.card}
                    >
                      <View style={[catStyles.iconBox, { backgroundColor: Colors.primaryLight }]}>
                        <Ionicons name={c.locked ? 'lock-closed' : 'library'} size={20} color={Colors.primary} />
                      </View>
                      <Text style={catStyles.cardTitle} numberOfLines={1}>{c.title}</Text>
                      <Text style={catStyles.cardSub} numberOfLines={1}>{t('examList.questions', { n: c.questionCount })}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Kompakt stat sırası — gündəlik hədəf + son nəticə */}
            <View style={styles.pillRow}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setGoalModalOpen(true)} style={styles.welcomePill}>
                <Ionicons name={goalReached ? 'checkmark-circle' : 'flash'} size={14} color={Colors.primary} />
                <Text style={styles.welcomePillText}>
                  {goalReached ? t('examList.goalDone', { a: todayCount, b: dailyGoal }) : t('examList.goalProgress', { a: todayCount, b: dailyGoal })}
                </Text>
                <Ionicons name="chevron-down" size={11} color={Colors.primary} />
              </TouchableOpacity>
              {lastResult && (
                <View style={styles.welcomePill}>
                  <Ionicons name="checkmark-done" size={12} color={Colors.textSecondary} />
                  <Text style={styles.welcomePillText}>{t('examList.last', { p: lastResult.percentage })}</Text>
                </View>
              )}
            </View>

            {/* Mənim — şəxsi imtahan tarixi */}
            <View style={secStyles.section}>
              <Text style={secStyles.title}>{t('examList.mine')}</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate(Routes.MyExams)} style={[styles.bentoLine, styles.cardSurface]}>
                <View style={styles.lineLeft}>
                  <View style={[styles.iconChipSoft, { backgroundColor: Colors.primaryLight }]}>
                    <Ionicons name="bookmarks" size={20} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.lineTitle}>{t('examList.myExams')}</Text>
                    <Text style={styles.lineSub}>{t('examList.activePacks')}</Text>
                  </View>
                </View>
                <View style={styles.lineAction}>
                  <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                </View>
              </TouchableOpacity>

              <View style={styles.row}>
                <TouchableOpacity activeOpacity={0.85} onPress={openHistory} style={[styles.bentoLine, styles.cardSurface]}>
                  <View style={styles.lineLeft}>
                    <View style={[styles.iconChipSoft, { backgroundColor: '#E0F2FE' }]}>
                      <Ionicons name="analytics" size={20} color="#0284C7" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lineTitle} numberOfLines={1}>{t('examList.results')}</Text>
                      <Text style={styles.lineSub} numberOfLines={1}>{results.length > 0 ? t('examList.resultsCount', { n: results.length }) : t('examList.allExams')}</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.85} onPress={openCertificates} style={[styles.bentoLine, styles.cardSurface]}>
                  <View style={styles.lineLeft}>
                    <View style={[styles.iconChipSoft, { backgroundColor: Colors.tertiaryContainer + '4D' }]}>
                      <Ionicons name="ribbon" size={20} color={Colors.tertiary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lineTitle} numberOfLines={1}>{t('examList.certificates')}</Text>
                      <Text style={styles.lineSub} numberOfLines={1}>{t('examList.certsSub')}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* ⚡ Digər imkanlar — rəqabət funksiyaları əsas imtahan axınından ayrıdır */}
            <View style={secStyles.section}>
              <View style={secStyles.head}>
                <Text style={secStyles.title}>{t('examList.moreTitle')}</Text>
                <TouchableOpacity activeOpacity={0.7} hitSlop={8} onPress={() => setTab('compete')}>
                  <Text style={catStyles.seeAll}>{t('examList.tabCompete')} →</Text>
                </TouchableOpacity>
              </View>
              <View style={miniStyles.grid}>
                {([
                  { key: 'live', icon: 'flash' as const, tint: '#DC2626', bg: '#FEE2E2', label: t('examList.liveExam'), onPress: openLive },
                  { key: 'duel', icon: 'git-compare' as const, tint: '#7C3AED', bg: '#EDE9FE', label: t('examList.duel'), onPress: () => navigation.navigate(Routes.DuelMode) },
                  { key: 'national', icon: 'podium' as const, tint: '#D97706', bg: '#FEF3C7', label: t('examList.nationalRating'), onPress: openNational },
                  { key: 'monthly', icon: 'calendar' as const, tint: Colors.secondary, bg: Colors.secondaryContainer, label: t('examList.monthlySession'), onPress: openMonthly },
                ]).map((m) => (
                  <TouchableOpacity key={m.key} activeOpacity={0.85} onPress={m.onPress} style={[miniStyles.tile, styles.cardSurface]}>
                    <View style={[miniStyles.icon, { backgroundColor: m.bg }]}>
                      <Ionicons name={m.icon} size={18} color={m.tint} />
                    </View>
                    <Text style={miniStyles.label} numberOfLines={2}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 👑 Premium — real dəyər göstərildikdən SONRA, səhifənin aşağısında */}
            {premiumActive ? (
              <View style={premStyles.activeCard}>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                <View style={{ flex: 1 }}>
                  <Text style={premStyles.activeTitle}>{t('examList.premiumActiveTitle')}</Text>
                  <Text style={premStyles.activeSub}>{t('examList.premiumActiveSub')}</Text>
                </View>
              </View>
            ) : (
              <View style={premStyles.card}>
                <View style={premStyles.glow} pointerEvents="none" />
                <View style={premStyles.head}>
                  <View style={premStyles.crown}>
                    <Ionicons name="diamond" size={18} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={premStyles.title}>{t('examList.premiumTitle')}</Text>
                    <Text style={premStyles.sub}>{t('examList.premiumSub')}</Text>
                  </View>
                </View>
                <View style={premStyles.list}>
                  {['premiumB1', 'premiumB2', 'premiumB3', 'premiumB4', 'premiumB5'].map((k) => (
                    <View key={k} style={premStyles.item}>
                      <Ionicons name="checkmark-circle" size={15} color="#D97706" />
                      <Text style={premStyles.itemText}>{t(`examList.${k}`)}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity activeOpacity={0.85} onPress={openPremium} style={premStyles.cta}>
                  <Text style={premStyles.ctaText}>
                    {PAYMENTS_ENABLED ? t('examList.premiumCta') : t('examList.premiumCtaInfo')}
                  </Text>
                  <Ionicons name="arrow-forward" size={15} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* 📊 Statistika accordion */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setStatsOpen((p) => !p)}
              style={accStyles.header}
            >
              <Text style={accStyles.title}>{t('examList.statsAcc')}</Text>
              <View style={accStyles.headerRight}>
                <Text style={accStyles.headerHint}>{statsOpen ? t('examList.closeShort') : t('examList.open')}</Text>
                <Ionicons name={statsOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {statsOpen && (
            <>
            {/* Weekly progress + stats */}
            <View style={[styles.cardSurface, styles.weeklyCard]}>
              <View style={styles.weeklyHeader}>
                <Text style={styles.weeklyTitle}>{t('examList.weeklyProgress')}</Text>
                <TouchableOpacity onPress={shareProgress} hitSlop={8} style={styles.shareBtn} activeOpacity={0.7}>
                  <Ionicons name="share-social-outline" size={16} color={Colors.primary} />
                  <Text style={styles.shareBtnText}>{t('examList.share')}</Text>
                </TouchableOpacity>
              </View>

              {stats.count > 0 && (
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.best}%</Text>
                    <Text style={styles.statLabel}>{t('examList.best')}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.avg}%</Text>
                    <Text style={styles.statLabel}>{t('examList.average')}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.count}</Text>
                    <Text style={styles.statLabel}>{t('examList.total')}</Text>
                  </View>
                </View>
              )}

              {bestHour && (
                <View style={styles.bestHourBox}>
                  <View style={styles.bestHourIcon}>
                    <Ionicons name="time" size={16} color="#0284C7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bestHourLabel}>{t('examList.bestHour')}</Text>
                    <Text style={styles.bestHourValue}>{t('examList.bestHourValue', { range: bestHour.range, n: bestHour.count })}</Text>
                  </View>
                </View>
              )}

              {difficultyMix && (
                <View style={styles.diffBox}>
                  <Text style={styles.diffTitle}>{t('examList.diffMix')}</Text>
                  <View style={styles.diffBar}>
                    {difficultyMix.easy.pct > 0 && (
                      <View style={[styles.diffSeg, { flex: difficultyMix.easy.pct, backgroundColor: DIFFICULTY_META.easy.color }]} />
                    )}
                    {difficultyMix.medium.pct > 0 && (
                      <View style={[styles.diffSeg, { flex: difficultyMix.medium.pct, backgroundColor: DIFFICULTY_META.medium.color }]} />
                    )}
                    {difficultyMix.hard.pct > 0 && (
                      <View style={[styles.diffSeg, { flex: difficultyMix.hard.pct, backgroundColor: DIFFICULTY_META.hard.color }]} />
                    )}
                  </View>
                  <View style={styles.diffLegend}>
                    <View style={styles.diffLegendItem}>
                      <View style={[styles.diffDot, { backgroundColor: DIFFICULTY_META.easy.color }]} />
                      <Text style={styles.diffLegendText}>{t('examList.diff.easy')} {difficultyMix.easy.pct}%</Text>
                    </View>
                    <View style={styles.diffLegendItem}>
                      <View style={[styles.diffDot, { backgroundColor: DIFFICULTY_META.medium.color }]} />
                      <Text style={styles.diffLegendText}>{t('examList.diff.medium')} {difficultyMix.medium.pct}%</Text>
                    </View>
                    <View style={styles.diffLegendItem}>
                      <View style={[styles.diffDot, { backgroundColor: DIFFICULTY_META.hard.color }]} />
                      <Text style={styles.diffLegendText}>{t('examList.diff.hard')} {difficultyMix.hard.pct}%</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.weeklyChart}>
                {weekBars.map((b, idx) => {
                  const heightPct = Math.max(8, b.height * 100);
                  if (b.isToday) {
                    return (
                      <View key={`${b.label}-${idx}`} style={styles.weekBarWrap}>
                        <LinearGradient
                          colors={GRADIENT}
                          style={[styles.weekBar, { height: `${heightPct}%` }]}
                          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        >
                          <Text style={styles.weekBarLabelLight}>{b.label}</Text>
                        </LinearGradient>
                      </View>
                    );
                  }
                  if (b.count > 0) {
                    return (
                      <View key={`${b.label}-${idx}`} style={styles.weekBarWrap}>
                        <View style={[styles.weekBar, { height: `${heightPct}%`, backgroundColor: Colors.primaryLight }]}>
                          <Text style={[styles.weekBarLabel, { color: Colors.primary }]}>{b.label}</Text>
                        </View>
                      </View>
                    );
                  }
                  return (
                    <View key={`${b.label}-${idx}`} style={styles.weekBarWrap}>
                      <View style={[styles.weekBar, { height: `${heightPct}%`, backgroundColor: Colors.surfaceLow }]}>
                        <Text style={styles.weekBarLabel}>{b.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
              <View style={styles.weeklyFooter}>
                <Text style={styles.weeklyFooterText}>{t('examList.todayDone', { n: todayCount })}</Text>
                <TouchableOpacity onPress={openHistory}>
                  <Text style={styles.weeklyMore}>{t('examList.more')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 30-day Heatmap */}
            <View style={[styles.cardSurface, styles.heatmapCard]}>
              <View style={styles.weeklyHeader}>
                <Text style={styles.weeklyTitle}>{t('examList.activity30')}</Text>
                <Text style={styles.weeklySubtitle}>{t('examList.consistency')}</Text>
              </View>
              <View style={styles.heatmapGrid}>
                {heatmap.map((cell) => (
                  <View
                    key={cell.key}
                    style={[
                      styles.heatCell,
                      { backgroundColor: heatmapColor(cell.count) },
                      cell.isToday && styles.heatCellToday,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.heatmapLegend}>
                <Text style={styles.heatmapLegendText}>{t('examList.less')}</Text>
                <View style={[styles.heatLegendCell, { backgroundColor: Colors.surfaceLow }]} />
                <View style={[styles.heatLegendCell, { backgroundColor: Colors.primaryLight }]} />
                <View style={[styles.heatLegendCell, { backgroundColor: Colors.primary + '88' }]} />
                <View style={[styles.heatLegendCell, { backgroundColor: Colors.primary }]} />
                <Text style={styles.heatmapLegendText}>{t('examList.much')}</Text>
              </View>
            </View>
            </>
            )}

            {/* Feedback link */}
            <TouchableOpacity onPress={openReport} activeOpacity={0.7} style={styles.feedbackRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.feedbackText}>{t('examList.sendFeedback')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* ── 🏆 YARIŞLAR TABI ────────────────────────────────────────────── */
          <>
            <View style={compStyles.intro}>
              <Text style={compStyles.introTitle}>{t('examList.competeIntroTitle')}</Text>
              <Text style={compStyles.introSub}>{t('examList.competeIntroSub')}</Text>
            </View>

            {renderCompeteRow(
              'flash', '#DC2626', '#FEE2E2',
              t('examList.liveExam'), t('examList.liveExamDesc'), openLive,
              hasLiveNow ? (
                <View style={intentStyles.liveBadgeMini}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>{t('examList.live')}</Text>
                </View>
              ) : undefined,
            )}

            {renderCompeteRow(
              'git-compare', '#7C3AED', '#EDE9FE',
              t('examList.duel'), t('examList.duelDesc'), () => navigation.navigate(Routes.DuelMode),
            )}

            {renderCompeteRow(
              'podium', '#D97706', '#FEF3C7',
              t('examList.nationalRating'), t('examList.nationalDesc'), openNational,
              <View style={[styles.premiumPill, premiumActive && styles.premiumPillActive, { marginTop: 0 }]}>
                <Text style={[styles.premiumPillText, premiumActive && styles.premiumPillTextActive]}>
                  {premiumActive ? t('examList.premiumUnlocked') : t('examList.premium')}
                </Text>
              </View>,
            )}

            {renderCompeteRow(
              'calendar', Colors.secondary, Colors.secondaryContainer,
              t('examList.monthlySession'), t('examList.next', { label: monthlyDateLabel }), openMonthly,
            )}

            {renderCompeteRow(
              'people', '#0284C7', '#E0F2FE',
              t('examList.liveLeaders'), t('examList.liveLeadersSub'), openLiveLeaderboard,
            )}

            {renderCompeteRow(
              'trophy', '#16A34A', '#DCFCE7',
              t('examList.rankingTitle'), t('examList.rankingDesc'), openLeaderboard,
            )}

            {renderCompeteRow(
              'time', Colors.textSecondary, Colors.surfaceLow,
              t('examList.history'), t('examList.historySub'), () => navigation.navigate(Routes.DuelHistory),
            )}

            {streak > 0 && (
              <View style={compStyles.streakNote}>
                <Ionicons name="flame" size={16} color="#F97316" />
                <Text style={compStyles.streakNoteText}>{t('examList.competeStreak', { n: streak })}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Goal change modal */}
      <Modal visible={goalModalOpen} transparent animationType="fade" onRequestClose={() => setGoalModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setGoalModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('examList.goalModalTitle')}</Text>
            <Text style={styles.modalSub}>{t('examList.goalModalSub')}</Text>
            <View style={styles.goalOptionsRow}>
              {GOAL_OPTIONS.map((n) => {
                const active = n === dailyGoal;
                return (
                  <TouchableOpacity
                    key={n}
                    activeOpacity={0.85}
                    onPress={() => chooseGoal(n)}
                    style={[styles.goalOption, active && styles.goalOptionActive]}
                  >
                    <Text style={[styles.goalOptionText, active && { color: '#fff' }]}>{n}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={() => setGoalModalOpen(false)} style={styles.modalClose} activeOpacity={0.7}>
              <Text style={styles.modalCloseText}>{t('examList.close')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceLow,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  streakChipText: { fontSize: 12, fontWeight: '800', color: '#9A3412' },

  // Alt naviqasiya ilə üst-üstə düşməmək üçün geniş alt boşluq.
  scroll: { padding: 16, paddingBottom: 56, gap: 16 },

  cardSurface: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },

  /* ▶️ Davam et bloku */
  resumeBanner: { borderRadius: 18, overflow: 'hidden' },
  resumeGradient: { padding: 14, gap: 10 },
  resumeTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resumeIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  resumeTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  resumeSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  resumeBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  resumeBarFill: { height: '100%', borderRadius: 3, backgroundColor: '#fff' },
  resumeFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resumeMeta: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },

  /* Inactivity card */
  inactiveCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 18,
    backgroundColor: '#FFEDD5',
    borderWidth: 1, borderColor: '#FED7AA',
  },
  inactiveIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FED7AA',
    alignItems: 'center', justifyContent: 'center',
  },
  inactiveTitle: { fontSize: 14, fontWeight: '800', color: '#9A3412' },
  inactiveSub: { fontSize: 11, color: '#C2410C', marginTop: 2 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  welcomePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    backgroundColor: Colors.primaryLight,
  },
  welcomePillText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  /* ✨ Sənin üçün */
  aiRecCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  aiRecIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  aiRecLabel: { fontSize: 9, fontWeight: '900', color: Colors.primary, letterSpacing: 1.5 },
  aiRecTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },
  aiRecSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  aiRecMeta: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginTop: 4 },
  aiRecArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  forYouEmpty: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  forYouEmptyTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  forYouEmptySub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },

  /* Bento rows */
  row: { flexDirection: 'row', gap: 12 },
  iconChipPrimary: {
    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' },
  liveBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  iconChipSecondary: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.secondaryContainer,
  },
  premiumPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  premiumPillText: { fontSize: 9, fontWeight: '800', color: '#D97706', letterSpacing: 1 },
  premiumPillActive: { backgroundColor: '#DCFCE7' },
  premiumPillTextActive: { color: '#16A34A' },

  /* Line cards */
  bentoLine: {
    flex: 1, borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  lineLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconChipSoft: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  lineTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  lineSub: { fontSize: 10, color: Colors.textSecondary, marginTop: 1 },
  lineAction: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceLow, alignItems: 'center', justifyContent: 'center',
  },

  /* Weekly */
  weeklyCard: { borderRadius: 22, padding: 18, gap: 12 },
  weeklyHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  weeklySubtitle: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLow, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 6,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.borderLight },

  weeklyTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  weeklyChart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6 },
  weekBarWrap: { flex: 1, alignItems: 'stretch', height: '100%', justifyContent: 'flex-end' },
  weekBar: { borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 },
  weekBarLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary },
  weekBarLabelLight: { fontSize: 9, fontWeight: '800', color: '#fff' },
  weeklyFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weeklyFooterText: { fontSize: 13, color: Colors.textSecondary },
  weeklyMore: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  /* Heatmap */
  heatmapCard: { borderRadius: 22, padding: 18, gap: 12 },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  heatCell: { width: '12.3%', aspectRatio: 1, borderRadius: 4 },
  heatCellToday: { borderWidth: 2, borderColor: Colors.primary },
  heatmapLegend: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  heatmapLegendText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' },
  heatLegendCell: { width: 12, height: 12, borderRadius: 3 },

  /* Feedback */
  feedbackRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16,
  },
  feedbackText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700' },

  /* Share button */
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    backgroundColor: Colors.primaryLight,
  },
  shareBtnText: { fontSize: 11, fontWeight: '800', color: Colors.primary },

  /* Best hour */
  bestHourBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#E0F2FE', borderRadius: 12, padding: 10,
  },
  bestHourIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#BAE6FD',
    alignItems: 'center', justifyContent: 'center',
  },
  bestHourLabel: { fontSize: 10, fontWeight: '700', color: '#0369A1', letterSpacing: 0.5 },
  bestHourValue: { fontSize: 13, fontWeight: '800', color: '#0C4A6E', marginTop: 1 },

  /* Difficulty mix */
  diffBox: { gap: 8 },
  diffTitle: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.5 },
  diffBar: {
    flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden',
    backgroundColor: Colors.surfaceLow,
  },
  diffSeg: { height: '100%' },
  diffLegend: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  diffLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  diffDot: { width: 8, height: 8, borderRadius: 4 },
  diffLegendText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },

  /* Modal */
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    width: '100%', maxWidth: 360,
    backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  modalSub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: -6 },
  goalOptionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  goalOption: {
    flex: 1, aspectRatio: 1, borderRadius: 14,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  goalOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  goalOptionText: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  modalClose: {
    alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 20,
  },
  modalCloseText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
});

/* ── Tab bar ─────────────────────────────────────────────────────────────── */
const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row', gap: 6,
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, padding: 4,
  },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, borderRadius: 999,
  },
  btnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10, elevation: 3,
  },
  text: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary },
  textActive: { color: '#fff' },
});

/* ── Ümumi bölmə başlığı ─────────────────────────────────────────────────── */
const secStyles = StyleSheet.create({
  section: { gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, paddingHorizontal: 2 },
  sub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, paddingHorizontal: 2 },
});

/* ── 🔥 Populyar imtahan kartı ───────────────────────────────────────────── */
const popStyles = StyleSheet.create({
  row: { gap: 12, paddingRight: 12, paddingVertical: 4 },
  card: {
    width: 190, borderRadius: 18, padding: 14, gap: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  subjectPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, maxWidth: '85%' },
  subjectPillText: { fontSize: 10, fontWeight: '800', color: Colors.primary },
  diffDot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary, lineHeight: 18, minHeight: 36 },
  meta: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  proofItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  proofText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 2, alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  ctaText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
});

/* ── ⚡ Digər imkanlar (kompakt kafel) ───────────────────────────────────── */
const miniStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '48%', flexGrow: 1,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  icon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 12, fontWeight: '800', color: Colors.textPrimary, lineHeight: 16 },
});

/* ── 🏆 Yarışlar tabı ────────────────────────────────────────────────────── */
const compStyles = StyleSheet.create({
  intro: { gap: 4, marginBottom: -4 },
  introTitle: { fontSize: 21, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.4 },
  introSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  iconBox: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  title: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  streakNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFEDD5', borderRadius: 14, padding: 12,
  },
  streakNoteText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#9A3412' },
});

/* ── 👑 Premium ──────────────────────────────────────────────────────────── */
const premStyles = StyleSheet.create({
  card: {
    borderRadius: 22, padding: 18, gap: 14, overflow: 'hidden',
    backgroundColor: '#FFFBEB',
    borderWidth: 1, borderColor: '#FDE68A',
  },
  glow: {
    position: 'absolute', right: -60, top: -60,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#FDE68A', opacity: 0.45,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  crown: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '900', color: '#78350F', letterSpacing: -0.2 },
  sub: { fontSize: 11, color: '#92400E', marginTop: 2, lineHeight: 16 },
  list: { gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#78350F' },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#D97706', borderRadius: 999, paddingVertical: 12,
    shadowColor: '#D97706', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 3,
  },
  ctaText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  activeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#DCFCE7', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  activeTitle: { fontSize: 13, fontWeight: '800', color: '#166534' },
  activeSub: { fontSize: 11, color: '#15803D', marginTop: 1 },
});

const accStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  title: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerHint: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
});

const intentStyles = StyleSheet.create({
  liveBadgeMini: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999,
    backgroundColor: '#EF4444',
  },
});

const catStyles = StyleSheet.create({
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  accentBar: { width: 4, height: 34, borderRadius: 2, backgroundColor: Colors.primary },
  // 18 → "İmtahan kateqoriyaları" + "Hamısına bax" düyməsi kiçik ekranlarda da
  // bir sətirdə qalır (21-də iki sətrə qırılırdı).
  title: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.3 },
  sectionSub: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, marginTop: 1 },
  seeAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: Colors.primaryLight,
  },
  seeAll: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  row: { gap: 12, paddingRight: 12, paddingVertical: 4 },
  card: {
    width: 128, padding: 14, borderRadius: 18, gap: 10,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
    borderBottomWidth: 3,
    alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 3,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  cardSub: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardCtaText: { fontSize: 11, fontWeight: '800' },
});
