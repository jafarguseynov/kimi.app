import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const CORRECT_PCT = 82;

export default function PerformanceSummaryScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.avatar} activeOpacity={0.8}>
          <Text style={styles.avatarText}>TP</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nəticələr</Text>
        <TouchableOpacity style={styles.bellBtn} hitSlop={8}>
          <Ionicons name="notifications" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={styles.title}>Sənin performansın</Text>
          <Text style={styles.titleSub}>Son 30 günün statistikası</Text>
        </View>

        {/* Donut card */}
        <View style={styles.donutCard}>
          <View style={styles.donutOuter}>
            {/* Approximated donut using border arcs */}
            <View style={styles.donutTrack} />
            <View style={[styles.donutFill, { transform: [{ rotate: '115deg' }] }]} />
            <View style={styles.donutInner}>
              <Text style={styles.donutPct}>{CORRECT_PCT}%</Text>
              <Text style={styles.donutLabel}>Düzgün</Text>
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Düzgün ({CORRECT_PCT}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.errorContainer }]} />
              <Text style={styles.legendText}>Səhv ({100 - CORRECT_PCT}%)</Text>
            </View>
          </View>
        </View>

        {/* Secondary stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHead}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Text style={styles.statLabel}>Düzgün{'\n'}cavab faizi</Text>
            </View>
            <Text style={styles.statValue}>{CORRECT_PCT}%</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHead}>
              <Ionicons name="trending-up" size={20} color={Colors.tertiary} />
              <Text style={styles.statLabel}>Orta nəticə</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={styles.statValue}>420</Text>
              <Text style={styles.statUnit}>bal</Text>
            </View>
          </View>
        </View>

        {/* Insight: strong */}
        <View style={styles.insightCard}>
          <View style={[styles.insightIcon, { backgroundColor: Colors.tertiaryContainer + '4D' }]}>
            <Ionicons name="trophy" size={22} color={Colors.tertiary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightLabel}>Ən güclü mövzu</Text>
            <Text style={styles.insightTitle}>Riyaziyyat</Text>
            <View style={styles.insightHintRow}>
              <Text style={[styles.insightHint, { color: Colors.tertiary }]}>Mükəmməl irəliləyiş!</Text>
              <Ionicons name="checkbox" size={14} color={Colors.tertiary} />
            </View>
          </View>
        </View>

        {/* Insight: weak */}
        <View style={styles.insightCard}>
          <View style={[styles.insightIcon, { backgroundColor: Colors.dangerLight }]}>
            <Ionicons name="warning" size={22} color={Colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightLabel}>Zəif mövzu</Text>
            <Text style={styles.insightTitle}>Faizlər</Text>
            <View style={styles.insightHintRow}>
              <Text style={[styles.insightHint, { color: Colors.danger }]}>Daha çox məşq etməlisən</Text>
              <Ionicons name="warning" size={14} color={Colors.danger} />
            </View>
          </View>
        </View>

        {/* Footer status pill */}
        <View style={styles.footerPillWrap}>
          <View style={styles.footerPill}>
            <Ionicons name="information-circle" size={14} color={Colors.primary} />
            <Text style={styles.footerPillText}>Ümumi nəticən sabitdir</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 64,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },
  bellBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingHorizontal: 24, paddingTop: 16, gap: 24 },

  title: { fontSize: 22, fontWeight: '700', color: Colors.primary, letterSpacing: -0.4 },
  titleSub: { fontSize: 13, color: Colors.textSecondary },

  donutCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 40, padding: 32,
    alignItems: 'center', gap: 32,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 2,
  },
  donutOuter: { width: 192, height: 192, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  donutTrack: {
    position: 'absolute', width: 192, height: 192, borderRadius: 96, borderWidth: 14, borderColor: Colors.surfaceHigh,
  },
  donutFill: {
    position: 'absolute', width: 192, height: 192, borderRadius: 96, borderWidth: 14,
    borderColor: 'transparent',
    borderTopColor: Colors.primary, borderRightColor: Colors.primary, borderBottomColor: Colors.primary, borderLeftColor: Colors.primary,
  },
  donutInner: {
    width: 144, height: 144, borderRadius: 72, backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  donutPct: { fontSize: 40, fontWeight: '800', color: Colors.primary, letterSpacing: -1 },
  donutLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
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
  insightHint: { fontSize: 13 },

  footerPillWrap: { alignItems: 'center', paddingVertical: 16 },
  footerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceLow, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
  },
  footerPillText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
});
