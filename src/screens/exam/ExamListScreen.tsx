import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Modal, Share, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExamList, useExamCollections } from '../../hooks/useExams';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getExamResults, ExamResultRow } from '../../api/certificate.api';
import { getTopicStats } from '../../api/topicStats.api';
import { useExamStore } from '../../store/exam.store';
import { useExamGoalStore } from '../../store/examGoal.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const INACTIVITY_DAYS = 3;
const GOAL_OPTIONS = [1, 2, 3, 4, 5];

const DIFFICULTY_META = {
  easy: { label: 'Asan', color: '#16A34A' },
  medium: { label: 'Orta', color: '#F59E0B' },
  hard: { label: 'Çətin', color: '#DC2626' },
} as const;

const AZ_MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];
const DAY_LABELS = ['B.E', 'Ç.A', 'Ç', 'C.A', 'C', 'Ş', 'B']; // Mon..Sun

const SUBJECT_CHIPS: { key: string; label: string; icon: keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap; color: string }[] = [
  { key: 'Hamısı', label: 'Hamısı', icon: 'grid', color: Colors.primary },
  { key: 'Riyaziyyat', label: 'Riyaziyyat', icon: 'calculator', color: '#0EA5E9' },
  { key: 'Azərbaycan dili', label: 'Azərbaycan dili', icon: 'book', color: '#16A34A' },
  { key: 'İngilis dili', label: 'İngilis dili', icon: 'language', color: '#A855F7' },
  { key: 'Digər', label: 'Digər', icon: 'apps', color: '#F59E0B' },
];

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

export default function ExamListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const rootNav = useNavigation<any>();
  const { data: exams = [], refetch: refetchExams } = useExamList();
  const { data: bankCollections = [] } = useExamCollections();
  const { data: results = [], refetch: refetchResults } = useQuery({ queryKey: ['examResults'], queryFn: getExamResults });
  const { data: topicStats } = useQuery({ queryKey: ['topicStats'], queryFn: getTopicStats });
  const setSubmissionType = useExamStore((s) => s.setSubmissionType);
  const sessionId = useExamStore((s) => s.sessionId);
  const sessionQuestionsLen = useExamStore((s) => s.questions.length);
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
  const lastResult = results[0];
  const idleDays = daysSinceLastExam(results);

  // Has a paused/unsubmitted session?
  const hasResumableSession = !!sessionId && sessionQuestionsLen > 0 && !sessionResult;

  // Has live activity right now? Demo: weekday + business hours 9-22 OR last live result < 1h
  const hasLiveNow = useMemo(() => {
    const h = new Date().getHours();
    return h >= 9 && h <= 22;
  }, []);

  // AI recommended subject from weak topics
  const recommendedSubject = topicStats?.weak?.[0];
  const recommendedExam = useMemo(() => {
    if (!recommendedSubject) return null;
    const needle = recommendedSubject.toLowerCase();
    return exams.find((e) => e.subject.toLowerCase().includes(needle) || e.title.toLowerCase().includes(needle));
  }, [exams, recommendedSubject]);

  const myWeeklyCount = weekBars.reduce((s, b) => s + b.count, 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchExams(), refetchResults()]);
    qc.invalidateQueries({ queryKey: ['certificates'] });
    qc.invalidateQueries({ queryKey: ['topicStats'] });
    setRefreshing(false);
  }, [refetchExams, refetchResults, qc]);

  const openBrowse = (subject?: string) => {
    setSubmissionType('practice');
    navigation.navigate(Routes.ExamBrowse, subject && subject !== 'Hamısı' ? { subject } : undefined);
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
    const first = exams[0];
    if (!first?.id) {
      Alert.alert(t('examList.alertMonthlyTitle'), t('examList.alertNoExam'));
      return;
    }
    setSubmissionType('monthly');
    navigation.navigate(Routes.MonthlyExamDetail, { examId: first.id, title: first.title });
  };
  const openNational = () =>
    Alert.alert(
      t('examList.alertNationalTitle'),
      t('examList.alertNationalMsg'),
      [
        { text: t('examList.later'), style: 'cancel' },
        { text: t('examList.openPremium'), onPress: () => rootNav.navigate('Profile', { screen: Routes.Settings }) },
      ],
    );
  const openHistory = () => navigation.navigate(Routes.ExamHistory);
  const openLiveLeaderboard = () => navigation.navigate(Routes.LiveLeaderboard);
  const openCertificates = () => navigation.navigate(Routes.CertificateList);
  const openProfile = () => rootNav.navigate('Profile');
  const openReport = () => rootNav.navigate('Profile', { screen: Routes.ReportProblem });
  const resumeSession = () => navigation.navigate(Routes.ExamSession);
  const openRecommended = () => {
    if (recommendedExam) {
      navigation.navigate(Routes.ExamDetail, { examId: recommendedExam.id, title: recommendedExam.title });
    } else if (recommendedSubject) {
      openBrowse(SUBJECT_CHIPS.find((c) => recommendedSubject.toLowerCase().includes(c.key.toLowerCase()))?.key ?? 'Hamısı');
    } else {
      openBrowse();
    }
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
          <TouchableOpacity style={styles.headerPlusBtn} onPress={() => navigation.navigate(Routes.NewExam)} hitSlop={8} activeOpacity={0.85}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Resume session banner */}
        {hasResumableSession && (
          <TouchableOpacity onPress={resumeSession} activeOpacity={0.9} style={styles.resumeBanner}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.resumeGradient}>
              <View style={styles.resumeIcon}>
                <Ionicons name="play" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resumeTitle}>{t('examList.resumeTitle')}</Text>
                <Text style={styles.resumeSub}>{t('examList.resumeSub', { n: sessionQuestionsLen })}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
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

        {/* Kateqoriyalar — təhsil səviyyəsinə görə (vurğulanmış) */}
        <View style={catStyles.section}>
          <View style={catStyles.sectionHeader}>
            <View style={catStyles.titleWrap}>
              <View style={catStyles.accentBar} />
              <View>
                <Text style={catStyles.title}>{t('examList.catTitle')}</Text>
                <Text style={catStyles.sectionSub}>{t('examList.catSub')}</Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate(Routes.ExamCategories)} hitSlop={8} style={catStyles.seeAllBtn}>
              <Text style={catStyles.seeAll}>{t('examList.all')}</Text>
              <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={catStyles.row}>
            {([
              { key: 'mock',        emoji: '📊',     bg: '#FCE7F3', accent: '#EC4899' },
              { key: 'middle',      emoji: '📘',     bg: '#EFF6FF', accent: '#3B82F6' },
              { key: 'russian',     emoji: '🇷🇺',     bg: '#EEF2FF', accent: '#6366F1' },
              { key: 'abituriyent', emoji: '🎓',     bg: '#FFFBEB', accent: '#F59E0B' },
              { key: 'magistr',     emoji: '📚',     bg: '#F5F3FF', accent: '#8B5CF6' },
              { key: 'miq',         emoji: '👨‍🏫', bg: '#ECFDF5', accent: '#10B981' },
              { key: 'preschool',   emoji: '🧒',     bg: '#FFF7ED', accent: '#F97316' },
            ]).map((c) => {
              const title = t(`examCat.${c.key}.title`);
              return (
              <TouchableOpacity
                key={c.key}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(Routes.CategorySubcategories, { categoryKey: c.key, categoryTitle: title })}
                style={[catStyles.card, { borderBottomColor: c.accent }]}
              >
                <View style={[catStyles.iconBox, { backgroundColor: c.bg }]}>
                  <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
                </View>
                <Text style={catStyles.cardTitle} numberOfLines={1}>{title}</Text>
                <View style={catStyles.cardCta}>
                  <Text style={[catStyles.cardCtaText, { color: c.accent }]}>{t('examList.view')}</Text>
                  <Ionicons name="arrow-forward" size={11} color={c.accent} />
                </View>
              </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* İmtahan Bankları — admin yüklədiyi PDF banklarından random test */}
        {bankCollections.length > 0 && (
          <View style={catStyles.section}>
            <View style={catStyles.sectionHeader}>
              <Text style={moreStyles.sectionTitle}>{t('examList.banks')}</Text>
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

        {/* Kompakt stat sırası */}
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

        {/* AI Recommendation chip */}
        {recommendedSubject && (
          <TouchableOpacity activeOpacity={0.9} onPress={openRecommended} style={styles.aiRecCard}>
            <View style={styles.aiRecIcon}>
              <Ionicons name="sparkles" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiRecLabel}>{t('examList.aiRecLabel')}</Text>
              <Text style={styles.aiRecTitle}>{t('examList.aiRecTitle', { subject: recommendedSubject })}</Text>
              <Text style={styles.aiRecSub}>{t('examList.aiRecSub')}</Text>
            </View>
            <View style={styles.aiRecArrow}>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {/* İkinci niyyət sırası: Rəsmi imtahan + Yarış */}
        <View style={styles.row}>
          <View style={[intentStyles.medCard, { backgroundColor: Colors.surfaceLow }]}>
            <View style={intentStyles.medHeader}>
              <View style={styles.iconChipSecondary}>
                <Ionicons name="calendar" size={20} color={Colors.secondary} />
              </View>
              <Text style={intentStyles.medTitle}>{t('examList.official')}</Text>
              <Text style={intentStyles.medSub}>{t('examList.officialSub')}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={openMonthly} style={intentStyles.actionRow}>
              <View style={{ flex: 1 }}>
                <Text style={intentStyles.actionTitle}>{t('examList.monthlySession')}</Text>
                <Text style={intentStyles.actionSub}>{t('examList.next', { label: nextMonthlyLabel })}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} onPress={openNational} style={intentStyles.actionRow}>
              <View style={{ flex: 1 }}>
                <Text style={intentStyles.actionTitle}>{t('examList.nationalRating')}</Text>
                <View style={styles.premiumPill}>
                  <Text style={styles.premiumPillText}>{t('examList.premium')}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={[intentStyles.medCard, styles.cardSurface, { borderWidth: 1, borderColor: Colors.primaryLight }]}>
            <View style={intentStyles.medHeader}>
              <View style={[styles.iconChipPrimary, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="flash" size={20} color="#DC2626" />
              </View>
              <Text style={intentStyles.medTitle}>{t('examList.race')}</Text>
              <Text style={intentStyles.medSub}>{t('examList.raceSub')}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={openLive} style={intentStyles.actionRow}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={intentStyles.actionTitle}>{t('examList.liveExam')}</Text>
                {hasLiveNow && (
                  <View style={intentStyles.liveBadgeMini}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveBadgeText}>{t('examList.live')}</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate(Routes.DuelMode)} style={intentStyles.actionRow}>
              <View style={{ flex: 1 }}>
                <Text style={intentStyles.actionTitle}>{t('examList.duel')}</Text>
                <Text style={intentStyles.actionSub}>{t('examList.duelSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate(Routes.DuelHistory)} style={intentStyles.actionRow}>
              <View style={{ flex: 1 }}>
                <Text style={intentStyles.actionTitle}>{t('examList.history')}</Text>
                <Text style={intentStyles.actionSub}>{t('examList.historySub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mənim — şəxsi imtahan tarixi */}
        <View style={moreStyles.section}>
          <Text style={moreStyles.sectionTitle}>{t('examList.mine')}</Text>
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
                <View>
                  <Text style={styles.lineTitle}>{t('examList.results')}</Text>
                  <Text style={styles.lineSub}>{results.length > 0 ? t('examList.resultsCount', { n: results.length }) : t('examList.allExams')}</Text>
                </View>
              </View>
              <View style={styles.lineAction}>
                <Ionicons name="trending-up" size={18} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} onPress={openCertificates} style={[styles.bentoLine, styles.cardSurface]}>
              <View style={styles.lineLeft}>
                <View style={[styles.iconChipSoft, { backgroundColor: Colors.tertiaryContainer + '4D' }]}>
                  <Ionicons name="ribbon" size={20} color={Colors.tertiary} />
                </View>
                <View>
                  <Text style={styles.lineTitle}>{t('examList.certificates')}</Text>
                  <Text style={styles.lineSub}>{t('examList.certsSub')}</Text>
                </View>
              </View>
              <View style={styles.lineAction}>
                <Ionicons name="download-outline" size={18} color={Colors.tertiary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

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
        {/* Canlı Liderlər */}
        <View style={styles.row}>
          <TouchableOpacity activeOpacity={0.85} onPress={openLiveLeaderboard} style={[styles.bentoLine, styles.cardSurface, styles.liveLeaderLine]}>
            <View style={styles.lineLeft}>
              <View style={[styles.iconChipSoft, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="podium" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lineTitle} numberOfLines={1}>{t('examList.liveLeaders')}</Text>
                <Text style={styles.lineSub} numberOfLines={1}>{t('examList.liveLeadersSub')}</Text>
              </View>
            </View>
            <View style={styles.lineAction}>
              <View style={[styles.liveDotIndicator, !hasLiveNow && { backgroundColor: Colors.textMuted }]} />
            </View>
          </TouchableOpacity>
        </View>

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
  headerIconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerPlusBtn: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  streakChipText: { fontSize: 12, fontWeight: '800', color: '#9A3412' },

  scroll: { padding: 16, paddingBottom: 40, gap: 16 },

  cardSurface: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },

  /* Resume session banner */
  resumeBanner: { borderRadius: 18, overflow: 'hidden' },
  resumeGradient: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
  },
  resumeIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  resumeTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  resumeSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

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

  /* Welcome card */
  welcomeCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 20,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  welcomeBlur: {
    position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primaryFixed, opacity: 0.1,
  },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  welcomeText: { flex: 1 },
  welcomeTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  welcomeSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginTop: 4, marginBottom: 12 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  welcomePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    backgroundColor: Colors.primaryLight,
  },
  welcomePillText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  aheadPill: { backgroundColor: '#DCFCE7' },
  behindPill: { backgroundColor: '#FEE2E2' },
  goalBarBg: {
    marginTop: 8, height: 6, borderRadius: 3, backgroundColor: Colors.surfaceLow, overflow: 'hidden',
  },
  goalBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  welcomeMascot: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },

  /* AI Recommendation card */
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
  aiRecArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Subject chips */
  chipsHint: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700', marginBottom: -8 },
  chipsScroll: { marginHorizontal: -16 },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  subjectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: Colors.surfaceLow,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  subjectChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  subjectChipText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },

  /* Bento rows */
  row: { flexDirection: 'row', gap: 12 },

  bentoBig: {
    flex: 2, borderRadius: 22, padding: 18, gap: 10,
    borderBottomWidth: 3, borderBottomColor: Colors.primary,
  },
  bentoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconChipPrimary: {
    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.surfaceLow, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
  },
  metaChipText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
  bentoTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 8 },
  bentoSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  primaryCta: {
    marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3,
  },
  primaryCtaText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  bentoDark: {
    flex: 1, borderRadius: 22, padding: 16, gap: 8,
    backgroundColor: '#0b0f10', position: 'relative', minHeight: 220,
  },
  liveBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
    backgroundColor: '#EF4444',
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' },
  liveBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  soonBadge: {
    position: 'absolute', top: 12, right: 12,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  soonBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  iconChipDark: {
    width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bentoTitleDark: { fontSize: 16, fontWeight: '800', color: '#fff' },
  bentoSubDark: { fontSize: 11, color: '#94a3b8', marginTop: 2, marginBottom: 10 },
  darkCta: { backgroundColor: '#fff', borderRadius: 999, paddingVertical: 9, alignItems: 'center' },
  darkCtaText: { fontSize: 13, fontWeight: '800', color: '#0b0f10' },

  bentoMed: {
    flex: 1, borderRadius: 22, padding: 16, gap: 8, minHeight: 170,
  },
  iconChipSecondary: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.secondaryContainer,
  },
  iconChipAmber: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FEF3C7',
  },
  bentoMedTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  bentoMedSub: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16, marginBottom: 4 },
  bentoFooter: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bentoFooterPrimary: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  premiumPill: {
    alignSelf: 'flex-start', marginTop: 'auto',
    backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  premiumPillText: { fontSize: 9, fontWeight: '800', color: '#D97706', letterSpacing: 1 },

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

  liveLeaderLine: { borderWidth: 1.5, borderColor: '#FEE2E2' },
  liveDotIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#DC2626' },
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

  /* Header surprise button */
  headerSurpriseBtn: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#A855F7',
    shadowColor: '#A855F7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },

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

const moreStyles = StyleSheet.create({
  section: { gap: 12, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, paddingHorizontal: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48.5%',
    padding: 14, borderRadius: 16, gap: 6,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  cardSub: { fontSize: 11, color: Colors.textSecondary },
});

const intentStyles = StyleSheet.create({
  bigCard: {
    borderRadius: 22, padding: 18, gap: 10,
    borderBottomWidth: 3, borderBottomColor: Colors.primary,
  },
  medCard: {
    flex: 1, borderRadius: 22, padding: 14, gap: 4, minHeight: 220,
  },
  medHeader: { gap: 4, marginBottom: 6 },
  medTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 6 },
  medSub: { fontSize: 11, color: Colors.textSecondary },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  actionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  actionSub: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  liveBadgeMini: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999,
    backgroundColor: '#EF4444',
  },
  segmentRow: {
    flexDirection: 'row', gap: 6, marginTop: 4,
    backgroundColor: Colors.surfaceLow,
    padding: 4, borderRadius: 999,
  },
  segmentBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 8, borderRadius: 999,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
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

const catStyles = StyleSheet.create({
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accentBar: { width: 4, height: 34, borderRadius: 2, backgroundColor: Colors.primary },
  title: { fontSize: 21, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.4 },
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
