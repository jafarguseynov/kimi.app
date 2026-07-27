import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { getWeeklyReport } from '../../api/analytics.api';

const CHART_H = 128;
// AZ qısa həftə günləri (getDay 0=Bazar ... 6=Şənbə).
const WD_SHORT = ['B', 'B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş'];

export default function WeeklyReportScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['weekly-report'],
    queryFn: getWeeklyReport,
  });

  const spark = data?.spark ?? [];
  const avgPct = data?.avgPct ?? 0;
  const examCount = data?.examCount ?? 0;
  const activeDays = data?.activeDays ?? 0;
  const subjects = data?.subjects ?? [];
  const todayIndex = spark.length - 1;

  // Son 7 günün həftə-günü etiketləri (bu günlə bitir).
  const dayLabels = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      return WD_SHORT[d.getDay()];
    });
  }, []);

  const band = avgPct >= 80 ? t('weeklyReport.high') : avgPct >= 60 ? t('weeklyReport.mid') : t('weeklyReport.low');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('weeklyReport.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Main chart card */}
        <View style={styles.chartCard}>
          <View style={styles.chartBlob} pointerEvents="none" />
          <View style={{ gap: 4 }}>
            <Text style={styles.chartKicker}>{t('weeklyReport.chartKicker')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={styles.chartBig}>{avgPct}%</Text>
              <Text style={styles.chartSub}>{t('weeklyReport.thisWeek')}</Text>
            </View>
            <View style={styles.deltaPill}>
              <Ionicons name="flame" size={14} color={Colors.tertiary} />
              <Text style={styles.deltaText}>{t('weeklyReport.activeDays', { n: activeDays })}</Text>
            </View>
          </View>

          {/* Chart area */}
          <View style={styles.chartArea}>
            <View style={[styles.gridLine, { top: 0 }]} />
            <View style={[styles.gridLine, { top: '33%' }]} />
            <View style={[styles.gridLine, { top: '66%' }]} />

            <View style={styles.barsRow}>
              {spark.map((v, i) => {
                const isToday = i === todayIndex;
                const h = Math.max(8, (v / 100) * CHART_H);
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <View
                        style={[
                          styles.bar,
                          { height: h, backgroundColor: isToday ? Colors.primary : Colors.primaryFixed + '55' },
                        ]}
                      />
                      {isToday && <View style={styles.todayDot} />}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          <View style={styles.daysRow}>
            {dayLabels.map((label, i) => (
              <Text key={i} style={styles.dayLabel}>{label}</Text>
            ))}
          </View>
        </View>

        {/* Stats — full-width score card */}
        <View style={styles.scoreCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary + '1A' }]}>
              <Ionicons name="medal" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.statKicker}>{t('weeklyReport.scoreKicker')}</Text>
              <Text style={styles.statBig}>{avgPct}%</Text>
            </View>
          </View>
          <View style={styles.highBadge}>
            <Text style={styles.highBadgeText}>{band}</Text>
          </View>
        </View>

        {/* Stats grid 2x */}
        <View style={styles.statsGrid}>
          <View style={styles.miniCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.tertiary + '1A' }]}>
              <Ionicons name="checkmark-done" size={20} color={Colors.tertiary} />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={styles.miniBig}>{examCount}</Text>
                <Text style={styles.miniUnit}>{t('weeklyReport.examUnit')}</Text>
              </View>
              <Text style={styles.miniLabel}>{t('weeklyReport.examLabel')}</Text>
            </View>
          </View>
          <View style={styles.miniCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.secondary + '1A' }]}>
              <Ionicons name="flame" size={20} color={Colors.secondary} />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={styles.miniBig}>{activeDays}</Text>
                <Text style={styles.miniUnit}>/7</Text>
              </View>
              <Text style={styles.miniLabel}>{t('weeklyReport.activeLabel')}</Text>
            </View>
          </View>
        </View>

        {/* Topic analysis */}
        <View style={{ gap: 14 }}>
          <Text style={styles.sectionTitle}>{t('weeklyReport.sectionTitle')}</Text>
          {subjects.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="bar-chart-outline" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{t('weeklyReport.empty')}</Text>
            </View>
          ) : subjects.map((topic, i) => {
            const strong = topic.avgPct >= 60;
            const color = strong ? Colors.tertiary : Colors.danger;
            return (
              <View key={i} style={styles.topicCard}>
                <View style={[styles.topicStripe, { backgroundColor: color }]} />
                <View style={[styles.topicIcon]}>
                  <Ionicons name="book" size={20} color={Colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topicName} numberOfLines={1}>{topic.subject}</Text>
                  <Text style={styles.topicSub}>
                    {strong ? t('weeklyReport.topicStrong') : t('weeklyReport.topicWeak')} · {t('weeklyReport.topicCount', { n: topic.count })}
                  </Text>
                </View>
                <Text style={[styles.topicPct, { color }]}>{topic.avgPct}%</Text>
              </View>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.cta}
          onPress={() => (navigation.getParent() as any)?.navigate('Exams')}
        >
          <Text style={styles.ctaText}>{t('weeklyReport.ctaText')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

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
    paddingHorizontal: 16, height: 56,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceHighest + '33',
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, letterSpacing: -0.3 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 },
  scroll: { padding: 16, gap: 32 },

  chartCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24, gap: 16,
    overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 28, elevation: 3,
  },
  chartBlob: {
    position: 'absolute', top: -40, right: -40, width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primaryFixed, opacity: 0.1,
  },
  chartKicker: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chartBig: { fontSize: 36, fontWeight: '800', color: Colors.primary, letterSpacing: -1 },
  chartSub: { fontSize: 13, color: Colors.textSecondary },
  deltaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.tertiaryContainer + '4D',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 6,
  },
  deltaText: { fontSize: 12, fontWeight: '700', color: Colors.tertiary },

  chartArea: { width: '100%', height: CHART_H, position: 'relative', marginTop: 4 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: Colors.outlineVariant, opacity: 0.3 },
  barsRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 4, paddingHorizontal: 2 },
  barCol: { flex: 1, height: '100%', alignItems: 'center' },
  bar: { width: 16, borderRadius: 8 },
  todayDot: {
    position: 'absolute', top: -2, width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.primary,
  },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  dayLabel: { flex: 1, fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },

  scoreCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: Colors.surfaceHighest + '4D',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.05, shadowRadius: 22, elevation: 2,
  },
  statIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  statKicker: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 2 },
  statBig: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  highBadge: { backgroundColor: Colors.tertiary + '1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  highBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.tertiary },

  statsGrid: { flexDirection: 'row', gap: 14 },
  miniCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 18, gap: 12,
    borderWidth: 1, borderColor: Colors.surfaceHighest + '4D',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 18, elevation: 2,
  },
  miniBig: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  miniUnit: { fontSize: 12, color: Colors.textSecondary },
  miniLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.6, marginTop: 2 },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3, paddingHorizontal: 4 },
  topicCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 16, paddingLeft: 18,
    borderWidth: 1, borderColor: Colors.surfaceHighest + '4D',
    overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
  },
  topicStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  topicIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  topicName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  topicSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  topicPct: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, paddingHorizontal: 4 },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, paddingVertical: 18, borderRadius: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 6,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
