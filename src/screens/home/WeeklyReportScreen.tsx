import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

interface DayPoint { label: string; value: number; }
const POINTS: DayPoint[] = [
  { label: 'B.e', value: 25 },
  { label: 'Ç.a', value: 35 },
  { label: 'Ç',   value: 28 },
  { label: 'C.a', value: 60 },
  { label: 'C',   value: 50 },
  { label: 'Ş',   value: 75 },
  { label: 'B',   value: 70 },
];

interface Topic {
  id: string;
  name: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  pct: number;
  tone: 'success' | 'danger';
}

const TOPICS: Topic[] = [
  { id: 't1', name: 'Riyaziyyat', sub: 'Mükəmməl qavrama', icon: 'calculator', pct: 92, tone: 'success' },
  { id: 't2', name: 'İngilis dili', sub: 'Daha çox məşq lazımdır', icon: 'language', pct: 45, tone: 'danger' },
];

const CHART_H = 128;
const TODAY_INDEX = POINTS.length - 1;

export default function WeeklyReportScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Həftəlik Hesabat</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Main chart card */}
        <View style={styles.chartCard}>
          <View style={styles.chartBlob} pointerEvents="none" />
          <View style={{ gap: 4 }}>
            <Text style={styles.chartKicker}>Ümumi irəliləyiş</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={styles.chartBig}>78%</Text>
              <Text style={styles.chartSub}>Bu həftə</Text>
            </View>
            <View style={styles.deltaPill}>
              <Ionicons name="trending-up" size={14} color={Colors.tertiary} />
              <Text style={styles.deltaText}>+12% inkişaf</Text>
            </View>
          </View>

          {/* Chart area */}
          <View style={styles.chartArea}>
            <View style={[styles.gridLine, { top: 0 }]} />
            <View style={[styles.gridLine, { top: '33%' }]} />
            <View style={[styles.gridLine, { top: '66%' }]} />

            <View style={styles.barsRow}>
              {POINTS.map((p, i) => {
                const isToday = i === TODAY_INDEX;
                const h = Math.max(8, (p.value / 100) * CHART_H);
                return (
                  <View key={p.label} style={styles.barCol}>
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
            {POINTS.map((p) => (
              <Text key={p.label} style={styles.dayLabel}>{p.label}</Text>
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
              <Text style={styles.statKicker}>Ümumi Bal</Text>
              <Text style={styles.statBig}>78%</Text>
            </View>
          </View>
          <View style={styles.highBadge}>
            <Text style={styles.highBadgeText}>Yüksək</Text>
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
                <Text style={styles.miniBig}>45</Text>
                <Text style={styles.miniUnit}>sual</Text>
              </View>
              <Text style={styles.miniLabel}>DÜZGÜN CAVABLAR</Text>
            </View>
          </View>
          <View style={styles.miniCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.secondary + '1A' }]}>
              <Ionicons name="time" size={20} color={Colors.secondary} />
            </View>
            <View>
              <Text style={styles.miniBig}>2s 30d</Text>
              <Text style={styles.miniLabel}>SƏRF OLUNAN VAXT</Text>
            </View>
          </View>
        </View>

        {/* Topic analysis */}
        <View style={{ gap: 14 }}>
          <Text style={styles.sectionTitle}>Güclü və Zəif Mövzular</Text>
          {TOPICS.map((t) => {
            const color = t.tone === 'success' ? Colors.tertiary : Colors.danger;
            return (
              <View key={t.id} style={styles.topicCard}>
                <View style={[styles.topicStripe, { backgroundColor: color }]} />
                <View style={[styles.topicIcon]}>
                  <Ionicons name={t.icon} size={20} color={Colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topicName}>{t.name}</Text>
                  <Text style={styles.topicSub}>{t.sub}</Text>
                </View>
                <Text style={[styles.topicPct, { color }]}>{t.pct}%</Text>
              </View>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity activeOpacity={0.9} style={styles.cta}>
          <Text style={styles.ctaText}>Məşqə başla</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
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
