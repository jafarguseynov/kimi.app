import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const DAYS = [
  { label: 'B.E', height: 0.3 },
  { label: 'Ç.A', height: 0.55 },
  { label: 'Ç',   height: 0.42 },
  { label: 'C.A', height: 0.85 },
  { label: 'C',   height: 0.62 },
  { label: 'Ş',   height: 0.25 },
  { label: 'B',   height: 0.72, today: true },
];

function CircularProgress({ pct, size = 192 }: { pct: number; size?: number }) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: Colors.surfaceHigh,
      }} />
      {/* simple gradient ring approximation using overlapping borders */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderTopColor: Colors.primary,
        borderRightColor: pct > 25 ? Colors.primary : 'transparent',
        borderBottomColor: pct > 50 ? Colors.primary : 'transparent',
        borderLeftColor: pct > 75 ? Colors.primary : 'transparent',
        transform: [{ rotate: '-45deg' }],
      }} />
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.circleValue}>{pct}%</Text>
        <Text style={styles.circleLabel}>TAMAMLANDI</Text>
      </View>
    </View>
  );
}

export default function LearningProgressScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Öyrənmə Tərəqqisi</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Page header */}
        <View>
          <Text style={styles.pageTitle}>Proqresin</Text>
          <Text style={styles.pageSub}>Böyük nəticələr kiçik addımlarla başlayır. Davam et!</Text>
        </View>

        {/* Hero progress card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBlob} pointerEvents="none" />
          <View style={{ flex: 1, zIndex: 1 }}>
            <Text style={styles.heroTitle}>Ümumi irəliləyiş</Text>
            <Text style={styles.heroSub}>Bu modul üzrə hədəflərinizin böyük hissəsini tamamlamısınız.</Text>
          </View>
          <CircularProgress pct={75} />
        </View>

        {/* Stats bento */}
        <View style={{ gap: 16 }}>
          <View style={styles.statCard}>
            <View>
              <Text style={styles.statKicker}>BU GÜN</Text>
              <Text style={styles.statValue}>3/5 tapşırıq</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary + '22' }]}>
              <Ionicons name="checkmark-done" size={22} color={Colors.primary} />
            </View>
          </View>
          <View style={styles.statCard}>
            <View>
              <Text style={styles.statKicker}>BU HƏFTƏ</Text>
              <Text style={styles.statValue}>20/30 tapşırıq</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: Colors.secondary + '22' }]}>
              <Ionicons name="calendar" size={22} color={Colors.textPrimary} />
            </View>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHead}>
            <Text style={styles.chartTitle}>Fəaliyyət (Son 7 gün)</Text>
            <View style={styles.legend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Tapşırıqlar</Text>
            </View>
          </View>
          <View style={styles.chart}>
            {DAYS.map((d) => (
              <View key={d.label} style={styles.chartCol}>
                <View style={styles.chartBarTrack}>
                  <View
                    style={[
                      styles.chartBarFill,
                      { height: `${d.height * 100}%` as any },
                      d.today && styles.chartBarToday,
                    ]}
                  />
                </View>
                <Text style={[styles.chartLabel, d.today && styles.chartLabelToday]}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dərinə bax — 2×3 grid */}
        <View style={lpGridStyles.section}>
          <Text style={lpGridStyles.title}>Dərinə bax</Text>
          <View style={lpGridStyles.grid}>
            {[
              { icon: 'pie-chart' as const, title: 'Performans', sub: 'Donut + insight', route: Routes.PerformanceSummary },
              { icon: 'bar-chart' as const, title: 'Həftəlik Hesabat', sub: 'Sparkline', route: Routes.WeeklyReport },
              { icon: 'git-network' as const, title: 'Mövzu', sub: 'İnkişaf yolu', route: Routes.TopicProgress },
              { icon: 'alert-circle' as const, title: 'Zəif Mövzu', sub: 'AI analiz', route: Routes.WeakTopics },
              { icon: 'refresh-circle' as const, title: 'Təkrar Test', sub: 'AI planı', route: Routes.ReviewTopics },
              { icon: 'bulb' as const, title: 'AI Tövsiyə', sub: 'İnkişaf planı', route: Routes.ImprovementTips },
            ].map((it) => (
              <TouchableOpacity
                key={it.title}
                style={lpGridStyles.card}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(it.route as any)}
              >
                <View style={lpGridStyles.iconWrap}>
                  <Ionicons name={it.icon} size={20} color={Colors.primary} />
                </View>
                <Text style={lpGridStyles.cardTitle}>{it.title}</Text>
                <Text style={lpGridStyles.cardSub}>{it.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const lpGridStyles = StyleSheet.create({
  section: { marginTop: 24 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48%', backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14, gap: 6,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 11, color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  pageTitle: { fontSize: 48, fontWeight: '800', color: Colors.primary, letterSpacing: -1, lineHeight: 56 },
  pageSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 8 },

  heroCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 28,
    flexDirection: 'row', alignItems: 'center', gap: 20,
    overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  heroBlob: {
    position: 'absolute', right: -64, top: -64,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: Colors.primary + '33',
  },
  heroTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, letterSpacing: -0.2 },
  heroSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  circleValue: { fontSize: 32, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  circleLabel: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1.2, marginTop: 4 },

  statCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 2,
  },
  statKicker: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1.2, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
  statIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

  chartCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 28,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 2,
  },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  chartTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  legendText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },

  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 168, gap: 12 },
  chartCol: { flex: 1, alignItems: 'center', gap: 8, height: '100%' },
  chartBarTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  chartBarFill: {
    width: '100%', backgroundColor: Colors.primary + '88',
    borderTopLeftRadius: 999, borderTopRightRadius: 999,
  },
  chartBarToday: { backgroundColor: Colors.primary },
  chartLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  chartLabelToday: { color: Colors.primary, fontWeight: '800' },
});
