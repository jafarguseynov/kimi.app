import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const DAYS = [
  { label: 'B.e', active: true },
  { label: 'Ç.a', active: true },
  { label: 'Ç.',  active: true },
  { label: 'C.a', active: true },
  { label: 'C.',  active: true },
  { label: 'Ş.',  active: true },
  { label: 'B.',  active: true, today: true },
];

export default function StreakDashboardScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Streak</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8} onPress={() => navigation.navigate(Routes.Notifications)}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Streak Widget */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.StreakDetail, { days: 7 })} style={styles.widgetCard}>
          <View style={styles.widgetGlow} pointerEvents="none" />
          <View style={styles.widgetTopRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.widgetTitle}>7 günlük streak</Text>
                <Ionicons name="flame" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.widgetSub}>Bu gün də daxil ol və streak-ini qoru!</Text>
            </View>
          </View>

          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <View style={styles.progRow}>
              <Text style={styles.progLabel}>Həftəlik hədəf</Text>
              <Text style={styles.progValue}>7/7 gün</Text>
            </View>
            <View style={styles.progTrack}>
              <View style={[styles.progFill, { width: '100%' }]} />
            </View>
          </View>

          <View style={styles.widgetCta}>
            <Text style={styles.widgetCtaText}>Davam et</Text>
          </View>
        </TouchableOpacity>

        {/* Weekly Activity */}
        <View style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>Həftəlik fəaliyyət</Text>
          <View style={styles.daysRow}>
            {DAYS.map((d, i) => (
              <View key={i} style={styles.dayCol}>
                <Text style={[styles.dayLabel, d.today && { color: Colors.primary, fontWeight: '800' }]}>{d.label}</Text>
                <View style={[styles.dayBubble, d.today && styles.dayBubbleToday]}>
                  <Ionicons name="flame" size={18} color={d.today ? '#fff' : Colors.primary} />
                </View>
                {d.today && <View style={styles.todayDot} />}
              </View>
            ))}
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="trophy" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statLabel}>Ən uzun streak</Text>
            <Text style={styles.statValue}>14 gün</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statLabel}>Ümumi aktiv</Text>
            <Text style={styles.statValue}>42 gün</Text>
          </View>
          <View style={[styles.statCard, styles.statCardWide]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Ionicons name="flag" size={14} color={Colors.primary} />
                <Text style={styles.statLabel}>Növbəti hədəf</Text>
              </View>
              <Text style={styles.statValueSmall}>10 günlük streak</Text>
            </View>
            <View style={styles.ringWrap}>
              <View style={styles.ringTrack} />
              <View style={styles.ringFill} />
              <Text style={styles.ringText}>70%</Text>
            </View>
          </View>
        </View>

        {/* Streak alt-actions */}
        <View style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>Daha çox</Text>

          <TouchableOpacity
            style={styles.protectCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate(Routes.StreakDetail, { days: 7 })}
          >
            <View style={[styles.protectIcon, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="trending-up" size={22} color="#ff4500" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.protectTitle}>Streak Detal</Text>
              <Text style={styles.protectSub}>Tam timeline və tarix</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.protectCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate(Routes.StreakProtection, { currentStreak: 12 })}
          >
            <View style={styles.protectIcon}>
              <Ionicons name="snow" size={22} color={Colors.primaryFixed} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.protectTitle}>Streak qoru</Text>
              <Text style={styles.protectSub}>Dondurma ilə bir günü atla</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.protectCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate(Routes.StreakRecovery)}
          >
            <View style={[styles.protectIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="refresh-circle" size={22} color={Colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.protectTitle}>Streak Bərpası</Text>
              <Text style={styles.protectSub}>Yanan streak-i geri qaytar</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* AI Motivation */}
        <View style={styles.motivCard}>
          <View style={styles.motivIcon}>
            <Ionicons name="sparkles" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.motivTitle}>Kimi deyir:</Text>
            <Text style={styles.motivText}>
              Möhtəşəm davam edirsən! Daha <Text style={{ color: Colors.primary, fontWeight: '700' }}>2 gün</Text> aktiv olsan yeni medal qazanacaqsan.
            </Text>
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
    paddingHorizontal: 16, height: 60, backgroundColor: Colors.surfaceLowest,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.danger,
    borderWidth: 2, borderColor: Colors.surfaceLowest,
  },

  scroll: { padding: 16, gap: 28, paddingBottom: 24 },

  widgetCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: Colors.borderLight,
    overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
  },
  widgetGlow: {
    position: 'absolute', top: -64, right: -64,
    width: 192, height: 192, borderRadius: 96, backgroundColor: Colors.primary + '1A',
  },
  widgetTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  widgetTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  widgetSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 6, lineHeight: 20 },

  progRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  progValue: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  progTrack: { height: 10, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },

  widgetCta: {
    backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center',
  },
  widgetCtaText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, paddingHorizontal: 4 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  dayCol: { alignItems: 'center', gap: 8, flex: 1, position: 'relative' },
  dayLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  dayBubble: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  dayBubbleToday: {
    backgroundColor: Colors.primary,
    borderWidth: 2, borderColor: Colors.surfaceLowest,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  todayDot: { position: 'absolute', bottom: -8, width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flex: 1, minWidth: '47%',
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  statCardWide: { minWidth: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  statValueSmall: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },

  ringWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  ringTrack: {
    position: 'absolute', width: 56, height: 56, borderRadius: 28,
    borderWidth: 5, borderColor: Colors.surfaceHighest,
  },
  ringFill: {
    position: 'absolute', width: 56, height: 56, borderRadius: 28,
    borderWidth: 5, borderColor: 'transparent',
    borderTopColor: Colors.primary, borderRightColor: Colors.primary, borderBottomColor: Colors.primary,
    transform: [{ rotate: '-45deg' }],
  },
  ringText: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary },

  motivCard: {
    flexDirection: 'row', gap: 16, alignItems: 'flex-start',
    backgroundColor: Colors.primary + '0D', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: Colors.primary + '1A',
  },
  motivIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 3,
  },
  motivTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  motivText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  protectCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: Colors.primaryFixed + '33',
  },
  protectIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  protectTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  protectSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
