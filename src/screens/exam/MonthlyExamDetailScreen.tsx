import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { rf, rs } from '../../utils/responsive';
import { getExamEvent, getExamEventLeaderboard } from '../../api/exam.api';

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.MonthlyExamDetail>;
  route: RouteProp<ExamStackParamList, typeof Routes.MonthlyExamDetail>;
};

const RULES = [
  { icon: 'shield-checkmark-outline' as const, color: Colors.primary, bg: Colors.primaryLight, titleKey: 'monthlyExam.rule1Title', bodyKey: 'monthlyExam.rule1Body' },
  { icon: 'wifi-outline' as const, color: Colors.secondary, bg: Colors.secondaryLight + '55', titleKey: 'monthlyExam.rule2Title', bodyKey: 'monthlyExam.rule2Body' },
  { icon: 'analytics-outline' as const, color: Colors.tertiary, bg: Colors.tertiaryContainer + '40', titleKey: 'monthlyExam.rule3Title', bodyKey: 'monthlyExam.rule3Body' },
];

const STATIC_STATS = [
  { icon: 'calendar-outline' as const, labelKey: 'monthlyExam.statDate', valueKey: 'monthlyExam.statDateVal' },
  { icon: 'time-outline' as const, labelKey: 'monthlyExam.statTime', valueKey: 'monthlyExam.statTimeVal' },
  { icon: 'help-circle-outline' as const, labelKey: 'monthlyExam.statQuestions', valueKey: 'monthlyExam.statQuestionsVal' },
  { icon: 'timer-outline' as const, labelKey: 'monthlyExam.statDuration', valueKey: 'monthlyExam.statDurationVal' },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  upcoming: { label: 'Gələcək', color: '#1D4ED8', bg: 'rgba(255,255,255,0.2)' },
  live: { label: 'CANLI', color: '#16A34A', bg: 'rgba(255,255,255,0.28)' },
  ended: { label: 'Bitib', color: '#6B7280', bg: 'rgba(255,255,255,0.18)' },
};

function fmtDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function MonthlyExamDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { title, examId: paramExamId, eventId } = route.params;

  // Admin cədvəlli event — real data. eventId yoxdursa köhnə statik axın.
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['examEvent', eventId],
    queryFn: () => getExamEvent(eventId as string),
    enabled: !!eventId,
  });
  const { data: leaders = [] } = useQuery({
    queryKey: ['examEventLeaderboard', eventId],
    queryFn: () => getExamEventLeaderboard(eventId as string),
    enabled: !!eventId,
  });

  const heroTitle = event?.title ?? title ?? t('monthlyExam.title');
  const effectiveExamId = event?.examId ?? paramExamId ?? null;
  const status = event?.status;
  const statusMeta = status ? STATUS_META[status] : null;

  const handleJoin = () => {
    if (event && status === 'upcoming') {
      const { date, time } = fmtDate(event.startAt);
      Alert.alert(heroTitle, `İmtahan ${date}, saat ${time}-da başlayacaq. O vaxt yenidən qoşul.`);
      return;
    }
    if (!effectiveExamId) {
      // Bağlı imtahan yoxdur — köhnə davranış (praktika mövcud deyilsə xəbərdarlıq).
      Alert.alert(heroTitle, 'Bu sessiya üçün imtahan hələ hazır deyil.');
      return;
    }
    if (event) {
      // Real imtahan — normal axınla başlanır, nəticə reytinqi qidalandırır.
      navigation.navigate(Routes.ExamDetail, { examId: effectiveExamId, title: heroTitle });
    } else {
      navigation.navigate(Routes.LiveExamWaiting, { examId: effectiveExamId, title: heroTitle });
    }
  };

  const joinLabel =
    event && status === 'upcoming' ? 'Tezliklə başlayır'
    : event && status === 'ended' ? 'Nəticələrə bax / təkrar həll et'
    : t('monthlyExam.join');

  // Real event üçün dinamik statlar.
  const dynamicStats = event
    ? (() => {
        const { date, time } = fmtDate(event.startAt);
        return [
          { icon: 'calendar-outline' as const, label: t('monthlyExam.statDate'), value: date },
          { icon: 'time-outline' as const, label: t('monthlyExam.statTime'), value: time },
          { icon: 'people-outline' as const, label: 'İştirakçı', value: String(event.participantCount) },
          { icon: 'timer-outline' as const, label: t('monthlyExam.statDuration'), value: event.durationMin > 0 ? `${event.durationMin} dəq` : 'Açıq' },
        ];
      })()
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{heroTitle}</Text>
        <View style={styles.headerBtn} />
      </View>

      {eventLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero Card */}
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroGlow1} />
            <View style={styles.heroGlow2} />
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.heroBadgeText}>{t('monthlyExam.badge')}</Text>
              </View>
              {statusMeta && (
                <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                  {status === 'live' && <View style={styles.liveDot} />}
                  <Text style={styles.statusBadgeText}>{statusMeta.label}</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroTitle}>{event ? heroTitle : t('monthlyExam.heroTitle')}</Text>
            {event?.description ? <Text style={styles.heroDesc}>{event.description}</Text> : null}
            <View style={styles.statsGrid}>
              {(dynamicStats ?? null)
                ? dynamicStats!.map((s) => (
                    <View key={s.label} style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>{s.label}</Text>
                      <View style={styles.statBoxRow}>
                        <Ionicons name={s.icon} size={18} color={Colors.primaryFixed} />
                        <Text style={styles.statBoxValue}>{s.value}</Text>
                      </View>
                    </View>
                  ))
                : STATIC_STATS.map((s) => (
                    <View key={s.labelKey} style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>{t(s.labelKey)}</Text>
                      <View style={styles.statBoxRow}>
                        <Ionicons name={s.icon} size={18} color={Colors.primaryFixed} />
                        <Text style={styles.statBoxValue}>{t(s.valueKey)}</Text>
                      </View>
                    </View>
                  ))}
            </View>
          </LinearGradient>

          {/* Leaderboard — real event üçün */}
          {event && effectiveExamId && (
            <View style={styles.rulesSection}>
              <View style={styles.rulesTitleRow}>
                <View style={styles.rulesAccent} />
                <Text style={styles.rulesTitle}>Reytinq</Text>
              </View>
              <View style={styles.rulesCard}>
                {leaders.length === 0 ? (
                  <Text style={styles.emptyLeader}>Hələ nəticə yoxdur — ilk sən ol!</Text>
                ) : (
                  leaders.slice(0, 10).map((r, i) => (
                    <View key={r.userId} style={[styles.leaderRow, i < Math.min(leaders.length, 10) - 1 && styles.ruleRowBorder]}>
                      <Text style={[styles.leaderRank, r.rank <= 3 && styles.leaderRankTop]}>{r.rank}</Text>
                      <Text style={styles.leaderName} numberOfLines={1}>{r.name}</Text>
                      <Text style={styles.leaderScore}>{r.percentage}%</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {/* Rules */}
          <View style={styles.rulesSection}>
            <View style={styles.rulesTitleRow}>
              <View style={styles.rulesAccent} />
              <Text style={styles.rulesTitle}>{t('monthlyExam.rulesTitle')}</Text>
            </View>
            <View style={styles.rulesCard}>
              {RULES.map((r, i) => (
                <View key={r.titleKey} style={[styles.ruleRow, i < RULES.length - 1 && styles.ruleRowBorder]}>
                  <View style={[styles.ruleIcon, { backgroundColor: r.bg }]}>
                    <Ionicons name={r.icon} size={22} color={r.color} />
                  </View>
                  <View style={styles.ruleBody}>
                    <Text style={styles.ruleTitle}>{t(r.titleKey)}</Text>
                    <Text style={styles.ruleText}>{t(r.bodyKey)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Warning */}
          <View style={styles.warningCard}>
            <View style={styles.warningIcon}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.warningTitle}>{t('monthlyExam.warningTitle')}</Text>
            <Text style={styles.warningText}>
              {t('monthlyExam.warningText')}
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Fixed Bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleJoin} activeOpacity={0.85} disabled={event ? status === 'upcoming' : false}>
          <LinearGradient
            colors={event && status === 'upcoming' ? ['#9CA3AF', '#9CA3AF'] : [Colors.gradientStart, Colors.gradientEnd]}
            style={styles.joinBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.joinBtnText}>{joinLabel}</Text>
            <Ionicons name={event && status === 'upcoming' ? 'time-outline' : 'arrow-forward'} size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.bottomFooter}>{t('monthlyExam.providedBy')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingVertical: rs(10),
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: rf(17), fontWeight: '600', color: Colors.primary, marginHorizontal: rs(8) },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingHorizontal: rs(20), paddingTop: rs(24), gap: rs(20) },

  heroCard: {
    borderRadius: rs(24),
    padding: rs(24),
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  heroGlow1: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroGlow2: {
    position: 'absolute',
    bottom: -16,
    left: -16,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: rs(14) },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: rs(12),
    paddingVertical: rs(5),
  },
  heroBadgeText: { fontSize: rf(10), fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 1.5 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: rs(10),
    paddingVertical: rs(5),
  },
  statusBadgeText: { fontSize: rf(10), fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  heroTitle: { fontSize: rf(22), fontWeight: '800', color: '#fff', lineHeight: rf(29), letterSpacing: -0.4, marginBottom: rs(6) },
  heroDesc: { fontSize: rf(13), color: 'rgba(255,255,255,0.85)', lineHeight: rf(19), marginBottom: rs(14) },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(10), marginTop: rs(12) },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: rs(16),
    padding: rs(14),
    gap: rs(6),
  },
  statBoxLabel: { fontSize: rf(9), fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1.2 },
  statBoxRow: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  statBoxValue: { fontSize: rf(16), fontWeight: '700', color: '#fff' },

  rulesSection: { gap: rs(14) },
  rulesTitleRow: { flexDirection: 'row', alignItems: 'center', gap: rs(12) },
  rulesAccent: { width: 4, height: rs(22), backgroundColor: Colors.primary, borderRadius: 2 },
  rulesTitle: { fontSize: rf(18), fontWeight: '700', color: Colors.textPrimary },
  rulesCard: {
    backgroundColor: Colors.surface,
    borderRadius: rs(20),
    padding: rs(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: rs(14),
    padding: rs(16),
  },
  ruleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  ruleIcon: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ruleBody: { flex: 1 },
  ruleTitle: { fontSize: rf(14), fontWeight: '700', color: Colors.textPrimary, marginBottom: rs(4) },
  ruleText: { fontSize: rf(12), color: Colors.textSecondary, lineHeight: rf(18) },

  // Leaderboard
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: rs(12), paddingHorizontal: rs(16), paddingVertical: rs(12) },
  leaderRank: { width: rs(24), textAlign: 'center', fontSize: rf(14), fontWeight: '700', color: Colors.textSecondary },
  leaderRankTop: { color: Colors.primary, fontWeight: '800' },
  leaderName: { flex: 1, fontSize: rf(14), fontWeight: '600', color: Colors.textPrimary },
  leaderScore: { fontSize: rf(14), fontWeight: '800', color: Colors.primary },
  emptyLeader: { padding: rs(18), textAlign: 'center', fontSize: rf(13), color: Colors.textSecondary },

  warningCard: {
    backgroundColor: Colors.warningLight,
    borderRadius: rs(20),
    padding: rs(20),
    alignItems: 'center',
    gap: rs(8),
  },
  warningIcon: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(24),
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(4),
  },
  warningTitle: { fontSize: rf(17), fontWeight: '700', color: '#92400E' },
  warningText: {
    fontSize: rf(13),
    color: '#78350F',
    lineHeight: rf(20),
    textAlign: 'center',
    fontWeight: '500',
  },

  bottomBar: {
    paddingHorizontal: rs(20),
    paddingTop: rs(12),
    paddingBottom: rs(16),
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: rs(8),
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    borderRadius: 999,
    paddingVertical: rs(16),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  joinBtnText: { fontSize: rf(17), fontWeight: '800', color: '#fff' },
  bottomFooter: {
    textAlign: 'center',
    fontSize: rf(10),
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
