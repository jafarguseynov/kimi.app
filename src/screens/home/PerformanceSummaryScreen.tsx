import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { getExamResults, type ExamResultRow } from '../../api/certificate.api';
import EmptyState from '../../components/common/EmptyState';

const MS_30D = 30 * 24 * 60 * 60 * 1000;

type Aggregate = {
  count: number;
  correct: number;
  wrong: number;
  unanswered: number;
  answered: number;
  avgPct: number;
  correctPct: number;
  strong?: { subject: string; pct: number };
  weak?: { subject: string; pct: number };
};

function aggregate(rows: ExamResultRow[]): Aggregate {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  let pctSum = 0;

  // Fənn üzrə dəqiqlik (düzgün/cavablandırılmış) — güclü/zəif mövzunu tapmaq üçün.
  const bySubject = new Map<string, { correct: number; answered: number }>();

  for (const r of rows) {
    const c = r.correct ?? r.score ?? 0;
    const ans = r.answered ?? (r.correct ?? 0) + (r.wrong ?? 0);
    const w = r.wrong ?? Math.max(0, ans - c);
    const un = r.unanswered ?? Math.max(0, r.total - ans);
    correct += c;
    wrong += w;
    unanswered += un;
    pctSum += r.percentage ?? (r.total > 0 ? Math.round((r.score / r.total) * 100) : 0);

    const subj = (r.subject ?? '').trim();
    if (subj && ans > 0) {
      const cur = bySubject.get(subj) ?? { correct: 0, answered: 0 };
      cur.correct += c;
      cur.answered += ans;
      bySubject.set(subj, cur);
    }
  }

  const answered = correct + wrong;
  const correctPct = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const avgPct = rows.length > 0 ? Math.round(pctSum / rows.length) : 0;

  // Ən azı 5 cavab olan fənləri sırala (kiçik nümunə statistikasından qaç).
  const ranked = [...bySubject.entries()]
    .filter(([, v]) => v.answered >= 5)
    .map(([subject, v]) => ({ subject, pct: Math.round((v.correct / v.answered) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const strong = ranked[0];
  const weak = ranked.length > 1 ? ranked[ranked.length - 1] : undefined;

  return { count: rows.length, correct, wrong, unanswered, answered, avgPct, correctPct, strong, weak };
}

function ringTone(pct: number): string {
  if (pct >= 70) return Colors.primary;
  if (pct >= 50) return Colors.warning;
  return Colors.danger;
}

export default function PerformanceSummaryScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: allRows = [], isLoading, refetch } = useQuery({
    queryKey: ['examResults'],
    queryFn: getExamResults,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Əvvəlcə son 30 gün; bu müddətdə nəticə yoxdursa bütün dövr.
  const { rows, isRecent } = useMemo(() => {
    const now = Date.now();
    const recent = allRows.filter((r) => now - new Date(r.completedAt).getTime() <= MS_30D);
    if (recent.length > 0) return { rows: recent, isRecent: true };
    return { rows: allRows, isRecent: false };
  }, [allRows]);

  const agg = useMemo(() => aggregate(rows), [rows]);
  const tone = ringTone(agg.correctPct);
  const totalAll = agg.correct + agg.wrong + agg.unanswered || 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('perfSummary.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : allRows.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="stats-chart-outline"
            title={t('perfSummary.emptyTitle')}
            subtitle={t('perfSummary.emptySub')}
            ctaLabel={t('getStarted.emptyExamsCta')}
            onPress={() => navigation.navigate(Routes.ExamCategories)}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {/* Title */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.title}>{t('perfSummary.title')}</Text>
            <Text style={styles.titleSub}>
              {isRecent ? t('perfSummary.titleSub') : t('perfSummary.titleSubAll')}
            </Text>
          </View>

          {/* Ring + split card */}
          <View style={styles.donutCard}>
            <View style={[styles.ring, { borderColor: tone + '26' }]}>
              <View style={[styles.ringInner, { borderColor: tone }]}>
                <Text style={[styles.donutPct, { color: tone }]}>{agg.correctPct}%</Text>
                <Text style={styles.donutLabel}>{t('perfSummary.correct')}</Text>
              </View>
            </View>

            {/* Correct / wrong / unanswered stacked bar */}
            <View style={styles.splitBar}>
              {agg.correct > 0 && (
                <View style={[styles.splitSeg, { flex: agg.correct / totalAll, backgroundColor: Colors.primary }]} />
              )}
              {agg.wrong > 0 && (
                <View style={[styles.splitSeg, { flex: agg.wrong / totalAll, backgroundColor: Colors.danger }]} />
              )}
              {agg.unanswered > 0 && (
                <View style={[styles.splitSeg, { flex: agg.unanswered / totalAll, backgroundColor: Colors.outlineVariant }]} />
              )}
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.legendText}>{t('perfSummary.correctCount', { n: agg.correct })}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
                <Text style={styles.legendText}>{t('perfSummary.wrongCount', { n: agg.wrong })}</Text>
              </View>
              {agg.unanswered > 0 && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.outlineVariant }]} />
                  <Text style={styles.legendText}>{t('perfSummary.unansweredCount', { n: agg.unanswered })}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Secondary stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHead}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                <Text style={styles.statLabel}>{t('perfSummary.correctPctLabel')}</Text>
              </View>
              <Text style={styles.statValue}>{agg.correctPct}%</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHead}>
                <Ionicons name="trending-up" size={20} color={Colors.tertiary} />
                <Text style={styles.statLabel}>{t('perfSummary.avgResult')}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={styles.statValue}>{agg.avgPct}</Text>
                <Text style={styles.statUnit}>%</Text>
              </View>
            </View>
          </View>

          {/* Insight: strong */}
          {agg.strong && (
            <View style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: Colors.tertiaryContainer + '4D' }]}>
                <Ionicons name="trophy" size={22} color={Colors.tertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightLabel}>{t('perfSummary.strongTopic')}</Text>
                <Text style={styles.insightTitle}>{agg.strong.subject}</Text>
                <View style={styles.insightHintRow}>
                  <Text style={[styles.insightHint, { color: Colors.tertiary }]}>
                    {t('perfSummary.accuracyN', { n: agg.strong.pct })}
                  </Text>
                  <Ionicons name="checkbox" size={14} color={Colors.tertiary} />
                </View>
              </View>
            </View>
          )}

          {/* Insight: weak */}
          {agg.weak && (
            <View style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: Colors.dangerLight }]}>
                <Ionicons name="warning" size={22} color={Colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightLabel}>{t('perfSummary.weakTopic')}</Text>
                <Text style={styles.insightTitle}>{agg.weak.subject}</Text>
                <View style={styles.insightHintRow}>
                  <Text style={[styles.insightHint, { color: Colors.danger }]}>
                    {t('perfSummary.accuracyN', { n: agg.weak.pct })} · {t('perfSummary.weakHint')}
                  </Text>
                  <Ionicons name="warning" size={14} color={Colors.danger} />
                </View>
              </View>
            </View>
          )}

          {/* Footer status pill */}
          <View style={styles.footerPillWrap}>
            <View style={styles.footerPill}>
              <Ionicons name="information-circle" size={14} color={Colors.primary} />
              <Text style={styles.footerPillText}>
                {agg.correctPct >= 50 ? t('perfSummary.footerStable') : t('perfSummary.footerImprove')}
              </Text>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

  scroll: { paddingHorizontal: 24, paddingTop: 16, gap: 24 },

  title: { fontSize: 22, fontWeight: '700', color: Colors.primary, letterSpacing: -0.4 },
  titleSub: { fontSize: 13, color: Colors.textSecondary },

  donutCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 40, padding: 32,
    alignItems: 'center', gap: 28,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 2,
  },
  ring: {
    width: 192, height: 192, borderRadius: 96, borderWidth: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  ringInner: {
    width: 150, height: 150, borderRadius: 75, borderWidth: 6,
    alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: Colors.surfaceLowest,
  },
  donutPct: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  donutLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  splitBar: {
    flexDirection: 'row', width: '100%', height: 12, borderRadius: 999, overflow: 'hidden',
    backgroundColor: Colors.surfaceHigh,
  },
  splitSeg: { height: '100%' },

  legendRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 13, color: Colors.textPrimary },

  statsGrid: { flexDirection: 'row', gap: 16 },
  statCard: {
    flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 24, padding: 20, gap: 12,
  },
  statHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  statLabel: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, lineHeight: 16 },
  statValue: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6 },
  statUnit: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },

  insightCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
  },
  insightIcon: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  insightLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  insightTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  insightHintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  insightHint: { fontSize: 13, flexShrink: 1 },

  footerPillWrap: { alignItems: 'center', paddingVertical: 16 },
  footerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceLow, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
  },
  footerPillText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
});
