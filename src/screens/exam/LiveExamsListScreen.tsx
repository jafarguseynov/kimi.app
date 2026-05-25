import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.LiveExamsList>;
type DayFilter = 'all' | 'today' | 'tomorrow';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Status = 'live' | 'soon';

interface LiveExam {
  id: string;
  title: string;
  status: Status;
  whenLabel: string;
  participants: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const EXAMS: LiveExam[] = [
  { id: '1', title: 'Riyaziyyat Yarışı #14',          status: 'live', whenLabel: 'Bugün, 20:00',     participants: 1240, icon: 'calculator',  iconColor: Colors.primary },
  { id: '2', title: 'Azərbaycan Dili: Qrammatika',    status: 'soon', whenLabel: 'Sabah, 15:30',     participants: 850,  icon: 'book',        iconColor: Colors.secondary ?? Colors.textSecondary },
  { id: '3', title: 'Məntiq: Analitik Düşüncə',       status: 'live', whenLabel: 'Bugün, 21:00',     participants: 2100, icon: 'flash',       iconColor: Colors.primary },
  { id: '4', title: 'İngilis Dili: B2 Səviyyə',       status: 'soon', whenLabel: '24 Sentyabr, 10:00', participants: 450,  icon: 'language',    iconColor: Colors.secondary ?? Colors.textSecondary },
];

export default function LiveExamsListScreen({ navigation }: Props) {
  const [day, setDay] = useState<DayFilter>('all');

  const filtered = useMemo(() => {
    if (day === 'all') return EXAMS;
    if (day === 'today') return EXAMS.filter((e) => e.whenLabel.startsWith('Bugün'));
    return EXAMS.filter((e) => e.whenLabel.startsWith('Sabah'));
  }, [day]);

  const liveCount = EXAMS.filter((e) => e.status === 'live').length;

  const join = (ex: LiveExam) => {
    navigation.navigate(Routes.LiveExamWaiting, { examId: ex.id, title: ex.title });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İmtahan Mərkəzi</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroDecor} pointerEvents="none" />
          <View style={styles.heroIconWrap} pointerEvents="none">
            <Ionicons name="rocket" size={96} color="rgba(255,255,255,0.2)" />
          </View>
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>CANLI RƏQABƏT</Text>
          </View>
          <Text style={styles.heroTitle}>Biliklərinizi Real Vaxtda Sınayın</Text>
          <Text style={styles.heroSub}>
            Minlərlə tələbə ilə eyni vaxtda yarışın, liderlik lövhəsində yerinizi tutun və intellektual potensialınızı kəşf edin.
          </Text>
        </LinearGradient>

        {/* Title + counter */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Canlı İmtahanlar</Text>
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>{liveCount} Aktiv</Text>
          </View>
        </View>

        {/* Day segmented */}
        <View style={styles.segmented}>
          {([
            { id: 'all', label: 'Hamısı' },
            { id: 'today', label: 'Bu gün' },
            { id: 'tomorrow', label: 'Sabah' },
          ] as { id: DayFilter; label: string }[]).map((opt) => {
            const active = day === opt.id;
            return (
              <TouchableOpacity
                key={opt.id} activeOpacity={0.85}
                style={[styles.segItem, active && styles.segItemActive]}
                onPress={() => setDay(opt.id)}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={42} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Bu intervalda canlı imtahan yoxdur</Text>
          </View>
        ) : (
          <View style={{ gap: 24 }}>
            {filtered.map((ex) => {
              const isLive = ex.status === 'live';
              return (
                <View key={ex.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <View style={[styles.statusBadge, isLive ? styles.statusLive : styles.statusSoon]}>
                        {isLive && <View style={styles.liveDot} />}
                        <Text style={[styles.statusText, isLive ? styles.statusLiveText : styles.statusSoonText]}>
                          {isLive ? 'Canlı' : 'Tezliklə'}
                        </Text>
                      </View>
                      <Text style={styles.cardTitle}>{ex.title}</Text>
                    </View>
                    <View style={styles.iconBox}>
                      <Ionicons name={ex.icon} size={22} color={ex.iconColor} />
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>{ex.whenLabel}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>{ex.participants.toLocaleString('az-AZ')} iştirakçı</Text>
                    </View>
                  </View>

                  {isLive ? (
                    <TouchableOpacity activeOpacity={0.85} onPress={() => join(ex)}>
                      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaPrimary}>
                        <Text style={styles.ctaPrimaryText}>Qoşul</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.85} style={styles.ctaSecondary}
                      onPress={() => navigation.navigate(Routes.LiveExamDetail, { examId: ex.id, title: ex.title, participants: ex.participants })}
                    >
                      <Text style={styles.ctaSecondaryText}>Xatırlat</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  /* Hero */
  hero: {
    borderRadius: 16, padding: 32, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 6,
  },
  heroDecor: {
    position: 'absolute', right: -48, bottom: -48,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroIconWrap: { position: 'absolute', right: 8, top: '30%' },
  livePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
    marginBottom: 12,
  },
  livePillText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1.2 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 32, letterSpacing: -0.5, marginBottom: 10 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19, maxWidth: 280 },

  /* Title row */
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  counterPill: {
    backgroundColor: Colors.primary + '14',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
  },
  counterText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  /* Segmented */
  segmented: {
    flexDirection: 'row', padding: 6,
    backgroundColor: Colors.surfaceLow, borderRadius: 999, gap: 4,
  },
  segItem: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  segItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  segText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  segTextActive: { fontWeight: '700', color: Colors.primary },

  empty: { alignItems: 'center', gap: 8, paddingVertical: 60 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },

  /* Card */
  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24, gap: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    marginBottom: 8,
  },
  statusLive: { backgroundColor: '#FEE2E2' },
  statusSoon: { backgroundColor: '#E0E7FF' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DC2626' },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  statusLiveText: { color: '#DC2626' },
  statusSoonText: { color: Colors.secondary ?? '#4F46E5' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  iconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },

  ctaPrimary: {
    paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 4,
  },
  ctaPrimaryText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  ctaSecondary: {
    paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  ctaSecondaryText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 0.3 },
});
