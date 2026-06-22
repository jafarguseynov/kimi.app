import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { useStudyPlanStore } from '../../store/studyPlan.store';
import { useSpinStreakStore } from '../../store/spinStreak.store';
import { useSpinWheelStore } from '../../store/spinWheel.store';
import { getTopicStats } from '../../api/topicStats.api';
import { useTranslation } from '../../i18n';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.AIStudyPath>;
};

type PlanAction = 'math-test' | 'eng-test' | 'topic-fraction' | 'review-cards';

type PlanCard = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  titleKey: string;
  subKey: string;
  action: PlanAction;
};

const PLAN_CARDS: PlanCard[] = [
  { id: 't1', icon: 'calculator-outline', iconBg: Colors.primaryLight, iconColor: Colors.primary, titleKey: 'aiStudyPath.card1Title', subKey: 'aiStudyPath.card1Sub', action: 'math-test' },
  { id: 't2', icon: 'language-outline',   iconBg: '#f0fdf4',           iconColor: '#16a34a',     titleKey: 'aiStudyPath.card2Title', subKey: 'aiStudyPath.card2Sub', action: 'eng-test' },
  { id: 't3', icon: 'school-outline',     iconBg: '#fffbeb',           iconColor: '#d97706',     titleKey: 'aiStudyPath.card3Title', subKey: 'aiStudyPath.card3Sub', action: 'topic-fraction' },
  { id: 't4', icon: 'refresh-outline',    iconBg: '#fff1f2',           iconColor: '#e11d48',     titleKey: 'aiStudyPath.card4Title', subKey: 'aiStudyPath.card4Sub', action: 'review-cards' },
];

type NextExam = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  daysFromNow: number;
  hour: string;
};

const NEXT_EXAMS: NextExam[] = [
  { id: '1', icon: 'document-text-outline', title: 'Blok İmtahanı #4',     daysFromNow: 2,  hour: '09:00' },
  { id: '2', icon: 'calculator-outline',    title: 'Riyaziyyat Maratonu',  daysFromNow: 5,  hour: '14:00' },
  { id: '3', icon: 'book-outline',          title: 'Ümumi sınaq #10',      daysFromNow: 10, hour: '10:00' },
];

type TFn = (k: string, v?: any) => string;

const formatRelativeDate = (daysFromNow: number, t: TFn) => {
  const months = t('aiStudyPath.monthNames').split('|');
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const dayStr = `${d.getDate()} ${months[d.getMonth()]}`;
  if (daysFromNow === 0) return t('aiStudyPath.relToday', { date: dayStr });
  if (daysFromNow === 1) return t('aiStudyPath.relTomorrow', { date: dayStr });
  if (daysFromNow < 7) return t('aiStudyPath.relDays', { n: daysFromNow, date: dayStr });
  return dayStr;
};

const buildIcsForExam = (e: NextExam, t: TFn) => {
  const d = new Date();
  d.setDate(d.getDate() + e.daysFromNow);
  const [hh, mm] = e.hour.split(':').map((n) => parseInt(n, 10));
  d.setHours(hh, mm, 0, 0);
  const end = new Date(d.getTime() + 90 * 60 * 1000);
  const fmt = (x: Date) => x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:kimi-${e.id}@kimi.az`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(d)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${e.title}`,
    `DESCRIPTION:${t('aiStudyPath.icsDesc')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');
};

export default function AIStudyPathScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const initials = (user?.name ?? 'İ')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const [tipIndex, setTipIndex] = useState(0);
  const [view, setView] = useState<'today' | 'week'>('today');

  const {
    ensureDailyReset, isComplete, toggleComplete, completedCount,
    markRewarded, wasRewardedToday, getWeekCounts,
  } = useStudyPlanStore();
  const { streak } = useSpinStreakStore();
  const { addStars, grantExtraSpin } = useSpinWheelStore();

  useEffect(() => {
    ensureDailyReset();
  }, [ensureDailyReset]);

  const { data: topicStats } = useQuery({
    queryKey: ['topic-stats'],
    queryFn: getTopicStats,
  });
  const weakTopics = topicStats?.weak ?? [];
  const strongTopics = topicStats?.strong ?? [];

  const visibleTips = useMemo(() => {
    const tips = t('aiStudyPath.tips').split('|');
    return [tips[tipIndex % tips.length], tips[(tipIndex + 1) % tips.length]];
  }, [tipIndex, t]);

  const done = completedCount();
  const total = PLAN_CARDS.length;
  const progressPct = Math.round((done / total) * 100);

  const weekCounts = useMemo(() => getWeekCounts(), [getWeekCounts, done]);

  const grantCompletionReward = () => {
    if (wasRewardedToday()) return;
    markRewarded();
    addStars(50);
    grantExtraSpin();
    Alert.alert(
      t('aiStudyPath.completionTitle'),
      t('aiStudyPath.completionBody'),
      [{ text: t('aiStudyPath.awesome') }],
    );
  };

  const runPlanAction = (action: PlanAction) => {
    const parent = navigation.getParent() as any;
    switch (action) {
      case 'math-test':
        parent?.navigate('Exams', {
          screen: Routes.NewExam,
          params: { questionCount: 15, duration: 25, difficulty: 'medium', questionType: 'test', examType: 'practice' },
        });
        return;
      case 'eng-test':
        parent?.navigate('Exams', {
          screen: Routes.NewExam,
          params: { questionCount: 10, duration: 15, difficulty: 'medium', questionType: 'test', examType: 'practice' },
        });
        return;
      case 'topic-fraction':
      case 'review-cards':
        parent?.navigate('Learn', { screen: Routes.LearningHome });
        return;
    }
  };

  const onCardPress = (card: PlanCard) => {
    runPlanAction(card.action);
  };

  const onCheckPress = (card: PlanCard) => {
    const wasComplete = isComplete(card.id);
    toggleComplete(card.id);
    // after toggle, check if 4/4 reached
    setTimeout(() => {
      if (!wasComplete) {
        const after = completedCount();
        if (after === total && !wasRewardedToday()) grantCompletionReward();
      }
    }, 0);
  };

  const onWeakTopicPress = (topic: string) => {
    Alert.alert(
      topic,
      t('aiStudyPath.weakAlertBody', { topic }),
      [
        { text: t('aiStudyPath.cancel'), style: 'cancel' },
        {
          text: t('aiStudyPath.aiMiniLesson'),
          onPress: () => (navigation.getParent() as any)?.navigate('Marketplace', {
            screen: Routes.AISolution,
            params: { question: t('aiStudyPath.aiMiniLessonQ', { topic }) },
          }),
        },
        {
          text: t('aiStudyPath.quickTest'),
          onPress: () => (navigation.getParent() as any)?.navigate('Exams', {
            screen: Routes.NewExam,
            params: { questionCount: 10, duration: 15, difficulty: 'hard', questionType: 'test', examType: 'practice' },
          }),
        },
        {
          text: t('aiStudyPath.flashcardSession'),
          onPress: () => (navigation.getParent() as any)?.navigate('Learn', { screen: Routes.LearningHome }),
        },
      ],
    );
  };

  const onStrongTopicPress = (topic: string) => {
    Alert.alert(
      t('aiStudyPath.strongAlertTitle', { topic }),
      t('aiStudyPath.strongAlertBody'),
      [
        { text: t('aiStudyPath.close'), style: 'cancel' },
        {
          text: t('aiStudyPath.hardTest'),
          onPress: () => (navigation.getParent() as any)?.navigate('Exams', {
            screen: Routes.NewExam,
            params: { questionCount: 20, duration: 30, difficulty: 'hard', questionType: 'test', examType: 'practice' },
          }),
        },
        {
          text: t('aiStudyPath.duel'),
          onPress: () => (navigation.getParent() as any)?.navigate('Exams', { screen: Routes.DuelMode }),
        },
      ],
    );
  };

  const onExamPress = (exam: NextExam) => {
    Alert.alert(
      exam.title,
      t('aiStudyPath.examAlertBody', { rel: formatRelativeDate(exam.daysFromNow, t), hour: exam.hour }),
      [
        { text: t('aiStudyPath.close'), style: 'cancel' },
        {
          text: t('aiStudyPath.addToCalendar'),
          onPress: () => addExamToCalendar(exam),
        },
        {
          text: t('aiStudyPath.openExams'),
          onPress: () => (navigation.getParent() as any)?.navigate('Exams' as never),
        },
      ],
    );
  };

  const addExamToCalendar = async (exam: NextExam) => {
    if (Platform.OS === 'ios') {
      // iOS: open Calendar app via URL scheme
      const supported = await Linking.canOpenURL('calshow://');
      if (supported) {
        Linking.openURL('calshow://');
        await Share.share({
          message: t('aiStudyPath.shareExam', { title: exam.title, rel: formatRelativeDate(exam.daysFromNow, t), hour: exam.hour }),
        });
        return;
      }
    }
    // Fallback: share ICS-format event details
    Share.share({
      title: exam.title,
      message: t('aiStudyPath.shareExamFallback', { title: exam.title, rel: formatRelativeDate(exam.daysFromNow, t), hour: exam.hour, ics: buildIcsForExam(exam, t) }),
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aiStudyPath.headerTitle')}</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(Routes.NotificationSettings)}
          hitSlop={6}
        >
          <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.avatarCircle}
          activeOpacity={0.7}
          onPress={() => (navigation.getParent() as any)?.navigate('Profile' as never)}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak banner */}
        {streak >= 2 && (
          <View style={styles.streakBanner}>
            <View style={styles.streakFlame}>
              <Ionicons name="flame" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakBannerTitle}>{t('aiStudyPath.streakBanner', { n: streak })}</Text>
              <Text style={styles.streakBannerSub}>{t('aiStudyPath.streakBannerSub')}</Text>
            </View>
          </View>
        )}

        {/* AI Insight */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.insightCard}
        >
          <View style={styles.insightBadge}>
            <Text style={styles.insightBadgeText}>{t('aiStudyPath.insightBadge')}</Text>
          </View>
          <Text style={styles.insightTitle}>
            {t('aiStudyPath.insightTitle')}
          </Text>
          <Text style={styles.insightSub}>
            {t('aiStudyPath.insightSub')}
          </Text>
          <TouchableOpacity
            style={styles.insightCta}
            activeOpacity={0.85}
            onPress={() => runPlanAction('math-test')}
          >
            <Ionicons name="flash" size={14} color={Colors.primary} />
            <Text style={styles.insightCtaText}>{t('aiStudyPath.startPlan')}</Text>
          </TouchableOpacity>
          <View style={styles.insightGlow} />
          <View style={styles.insightIconBg}>
            <Ionicons name="hardware-chip-outline" size={64} color="rgba(255,255,255,0.2)" />
          </View>
        </LinearGradient>

        {/* View toggle */}
        <View style={styles.viewToggle}>
          {(['today', 'week'] as const).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.toggleBtn, view === v && styles.toggleBtnActive]}
              activeOpacity={0.85}
              onPress={() => setView(v)}
            >
              <Text style={[styles.toggleText, view === v && styles.toggleTextActive]}>
                {v === 'today' ? t('aiStudyPath.toggleToday') : t('aiStudyPath.toggleWeek')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {view === 'today' ? (
          <>
            {/* Daily progress */}
            <View style={styles.progressCard}>
              <View style={styles.progressTopRow}>
                <Text style={styles.progressTitle}>{t('aiStudyPath.dailyProgress')}</Text>
                <Text style={[styles.progressValue, done === total && { color: '#16A34A' }]}>
                  {done}/{total}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPct}%`, backgroundColor: done === total ? '#16A34A' : Colors.primary },
                  ]}
                />
              </View>
              <Text style={styles.progressHint}>
                {done === total
                  ? t('aiStudyPath.progressDone')
                  : t('aiStudyPath.progressLeft', { n: total - done })}
              </Text>
            </View>

            {/* Daily Plan Grid */}
            <Text style={styles.sectionTitle}>{t('aiStudyPath.preparedForYou')}</Text>
            <View style={styles.planGrid}>
              {PLAN_CARDS.map((card) => {
                const complete = isComplete(card.id);
                return (
                  <TouchableOpacity
                    key={card.id}
                    style={[styles.planCard, complete && styles.planCardDone]}
                    activeOpacity={0.85}
                    onPress={() => onCardPress(card)}
                  >
                    <View style={[styles.planIconBox, { backgroundColor: card.iconBg }]}>
                      <Ionicons name={card.icon} size={22} color={card.iconColor} />
                    </View>
                    <Text style={[styles.planCardTitle, complete && { textDecorationLine: 'line-through', color: Colors.textSecondary }]}>
                      {t(card.titleKey)}
                    </Text>
                    <Text style={styles.planCardSub}>{t(card.subKey)}</Text>
                    <TouchableOpacity
                      style={[styles.checkBtn, complete && styles.checkBtnDone]}
                      activeOpacity={0.7}
                      onPress={() => onCheckPress(card)}
                      hitSlop={6}
                    >
                      <Ionicons
                        name={complete ? 'checkmark' : 'ellipse-outline'}
                        size={16}
                        color={complete ? '#fff' : Colors.primary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          /* Week view */
          <View style={styles.weekCard}>
            <Text style={styles.weekTitle}>{t('aiStudyPath.weekTitle')}</Text>
            <View style={styles.weekRow}>
              {weekCounts.map((d, idx) => {
                const dateObj = new Date(d.dateKey);
                const max = total;
                const pct = Math.min(d.count / max, 1);
                const isToday = idx === weekCounts.length - 1;
                return (
                  <View key={d.dateKey} style={styles.weekCol}>
                    <View style={styles.weekBarBg}>
                      <View
                        style={[
                          styles.weekBarFill,
                          { height: `${pct * 100}%`, backgroundColor: d.count === max ? '#16A34A' : Colors.primary },
                        ]}
                      />
                    </View>
                    <Text style={[styles.weekDayLabel, isToday && { color: Colors.primary, fontWeight: '900' }]}>
                      {t('aiStudyPath.weekdays').split('|')[dateObj.getDay()]}
                    </Text>
                    <Text style={styles.weekDayDate}>{dateObj.getDate()}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.weekStats}>
              <Text style={styles.weekStat}>
                {t('aiStudyPath.weekTotalLabel')} <Text style={{ fontWeight: '900', color: Colors.primary }}>{weekCounts.reduce((a, b) => a + b.count, 0)}</Text> {t('aiStudyPath.taskUnit')}
              </Text>
              <Text style={styles.weekStat}>
                {t('aiStudyPath.weekFullDays')} <Text style={{ fontWeight: '900', color: '#16A34A' }}>{weekCounts.filter((d) => d.count === total).length}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Performance Analysis */}
        <Text style={styles.sectionTitle}>{t('aiStudyPath.perfTitle')}</Text>
        <View style={styles.perfCard}>
          <View style={styles.perfSection}>
            <View style={styles.perfLabelRow}>
              <View style={[styles.perfDot, { backgroundColor: '#e11d48' }]} />
              <Text style={styles.perfLabel}>{t('aiStudyPath.weakLabel')}</Text>
              <Text style={styles.perfHint}>{t('aiStudyPath.weakHint')}</Text>
            </View>
            <View style={styles.chipRow}>
              {weakTopics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={styles.chipWeak}
                  activeOpacity={0.85}
                  onPress={() => onWeakTopicPress(topic)}
                >
                  <Text style={styles.chipWeakText}>{topic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={[styles.perfSection, styles.perfSectionTop]}>
            <View style={styles.perfLabelRow}>
              <View style={[styles.perfDot, { backgroundColor: '#16a34a' }]} />
              <Text style={styles.perfLabel}>{t('aiStudyPath.strongLabel')}</Text>
              <Text style={styles.perfHint}>{t('aiStudyPath.strongHint')}</Text>
            </View>
            <View style={styles.chipRow}>
              {strongTopics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={styles.chipStrong}
                  activeOpacity={0.85}
                  onPress={() => onStrongTopicPress(topic)}
                >
                  <Text style={styles.chipStrongText}>{topic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* AI Recommendations */}
        <View style={styles.aiRecCard}>
          <View style={styles.aiRecHeader}>
            <View style={styles.aiRecIconBox}>
              <Ionicons name="sparkles" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.aiRecTitle}>{t('aiStudyPath.aiRecTitle')}</Text>
            <TouchableOpacity
              style={styles.refreshBtn}
              activeOpacity={0.7}
              onPress={() => setTipIndex((i) => i + 2)}
              hitSlop={6}
            >
              <Ionicons name="refresh" size={14} color={Colors.primary} />
              <Text style={styles.refreshBtnText}>{t('aiStudyPath.newTip')}</Text>
            </TouchableOpacity>
          </View>
          {visibleTips.map((tip, i) => (
            <View key={`${tipIndex}-${i}`} style={styles.tipRow}>
              <View style={styles.tipBulletOuter}>
                <View style={styles.tipBulletInner} />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Next Tests */}
        <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>{t('aiStudyPath.nextTests')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nextExamRow}
          style={{ marginHorizontal: -20 }}
        >
          {NEXT_EXAMS.map((exam) => (
            <TouchableOpacity
              key={exam.id}
              style={styles.examCard}
              activeOpacity={0.85}
              onPress={() => onExamPress(exam)}
            >
              <View style={styles.examIconBox}>
                <Ionicons name={exam.icon} size={36} color={Colors.primary} />
                {exam.daysFromNow <= 2 && (
                  <View style={styles.examSoonBadge}>
                    <Text style={styles.examSoonText}>{t('aiStudyPath.soon')}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.examTitle}>{exam.title}</Text>
              <View style={styles.examDateRow}>
                <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.examDate}>{formatRelativeDate(exam.daysFromNow, t)} • {exam.hour}</Text>
              </View>
              <TouchableOpacity
                style={styles.examCalBtn}
                activeOpacity={0.85}
                onPress={() => addExamToCalendar(exam)}
              >
                <Ionicons name="calendar" size={12} color={Colors.primary} />
                <Text style={styles.examCalText}>{t('aiStudyPath.calendar')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
    marginRight: 4,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  streakBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 14, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#FCA5A5',
  },
  streakFlame: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center', justifyContent: 'center',
  },
  streakBannerTitle: { fontSize: 13, fontWeight: '900', color: '#991B1B' },
  streakBannerSub: { fontSize: 11, color: '#7F1D1D', marginTop: 2, fontWeight: '600' },

  insightCard: {
    borderRadius: 20, padding: 24, marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 6,
  },
  insightBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
  },
  insightBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 1.2 },
  insightTitle: { fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 28, marginBottom: 8, maxWidth: '80%' },
  insightSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 20, maxWidth: '80%', marginBottom: 14 },
  insightCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
  },
  insightCtaText: { fontSize: 12, fontWeight: '900', color: Colors.primary, letterSpacing: 0.4 },
  insightGlow: {
    position: 'absolute', right: -32, bottom: -32,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  insightIconBg: {
    position: 'absolute', right: 16, top: '50%', marginTop: -32, opacity: 0.8,
  },

  viewToggle: {
    flexDirection: 'row', gap: 8, marginBottom: 16,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, padding: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
  toggleText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  toggleTextActive: { color: Colors.primary },

  progressCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, padding: 16, marginBottom: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  progressTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  progressValue: { fontSize: 16, fontWeight: '900', color: Colors.primary },
  progressBarBg: {
    height: 8, borderRadius: 4,
    backgroundColor: Colors.surfaceLow, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressHint: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, marginBottom: 14 },

  planGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  planCard: {
    width: '47%',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, padding: 18, gap: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  planCardDone: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  planIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  planCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  planCardSub: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  checkBtn: {
    position: 'absolute', right: 12, top: 12,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  checkBtnDone: { backgroundColor: '#16A34A', borderColor: '#16A34A' },

  weekCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, padding: 18, marginBottom: 28, gap: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  weekTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  weekCol: { alignItems: 'center', gap: 4, flex: 1 },
  weekBarBg: {
    width: 14, height: 80,
    backgroundColor: Colors.surfaceLow, borderRadius: 7,
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  weekBarFill: { width: '100%', borderRadius: 7 },
  weekDayLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  weekDayDate: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  weekStats: { flexDirection: 'row', justifyContent: 'space-between' },
  weekStat: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },

  perfCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, overflow: 'hidden', marginBottom: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  perfSection: { padding: 18 },
  perfSectionTop: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  perfLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  perfDot: { width: 6, height: 6, borderRadius: 3 },
  perfLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.2 },
  perfHint: { marginLeft: 'auto', fontSize: 10, fontWeight: '600', color: Colors.textSecondary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipWeak: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: '#fecdd3',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
  },
  chipWeakText: { fontSize: 12, fontWeight: '700', color: '#e11d48' },
  chipStrong: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: '#bbf7d0',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
  },
  chipStrongText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },

  aiRecCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, padding: 20, marginBottom: 28,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  aiRecHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  aiRecIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  aiRecTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  refreshBtnText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  tipRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 16 },
  tipBulletOuter: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0,
  },
  tipBulletInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  tipText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  nextExamRow: { paddingHorizontal: 20, paddingBottom: 4, gap: 12 },
  examCard: {
    width: 200,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  examIconBox: {
    width: '100%', height: 100, borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    position: 'relative',
  },
  examSoonBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#DC2626',
    borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2,
  },
  examSoonText: { fontSize: 8, fontWeight: '900', color: '#fff', letterSpacing: 0.6 },
  examTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  examDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  examDate: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.3 },
  examCalBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 999, paddingVertical: 6, marginTop: 4,
  },
  examCalText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
});
