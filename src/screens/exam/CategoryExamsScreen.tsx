import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExamListForUser, useGenerateExam } from '../../hooks/useExams';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.CategoryExams>;
type Mode = 'all' | 'practice' | 'monthly' | 'live';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const DIFFICULTY_META: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  easy:   { label: 'Asan', icon: 'happy-outline',     color: Colors.tertiary },
  medium: { label: 'Orta', icon: 'bar-chart-outline', color: Colors.textSecondary },
  hard:   { label: 'Çətin', icon: 'trending-up',      color: Colors.danger },
};

type BadgeKind = 'new' | 'popular' | 'live';
const BADGE_META: Record<BadgeKind, { bg: string; fg: string; label: string }> = {
  new:     { bg: '#DCFCE7', fg: Colors.tertiary,        label: 'Yeni' },
  popular: { bg: Colors.surfaceLow ?? '#E5E9EB', fg: Colors.textSecondary, label: 'Populyar' },
  live:    { bg: '#DC2626', fg: '#fff',                 label: 'Canlı' },
};

export default function CategoryExamsScreen({ route, navigation }: Props) {
  const { categoryTitle, categoryKey, subKey, subject } = route.params;
  const [mode, setMode] = useState<Mode>('all');
  const { data: exams = [], isLoading, error, refetch } = useExamListForUser({ categoryKey, subKey, subject, limit: 6 });
  const generate = useGenerateExam();

  const filtered = useMemo(() => exams, [exams]);

  // Generasiya üçün subject çatışmırsa, subKey və ya categoryTitle-dan istifadə et
  const effectiveSubject = subject ?? subKey ?? categoryTitle.split('·').pop()?.trim() ?? categoryTitle;

  const onGenerate = () => {
    generate.mutate(
      { categoryKey, subKey, subject: effectiveSubject, difficulty: 'medium', questionCount: 25 },
      { onSuccess: () => refetch() },
    );
  };

  const badgesFor = (idx: number): BadgeKind[] => {
    if (idx === 0) return ['new', 'popular'];
    if (idx === 1) return ['live'];
    return [];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{categoryTitle} imtahanları</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome hero */}
        <View>
          <Text style={styles.welcomeTitle}>Xoş gəldiniz</Text>
          <Text style={styles.welcomeSub}>Uyğun imtahanı seç və başla</Text>
        </View>

        {/* Mode tabs (4 options) */}
        <View style={styles.segmented}>
          {([
            { id: 'all',      label: 'Hamısı' },
            { id: 'practice', label: 'Practice' },
            { id: 'monthly',  label: 'Aylıq sınaq' },
            { id: 'live',     label: 'Canlı' },
          ] as { id: Mode; label: string }[]).map((opt) => {
            const active = mode === opt.id;
            if (active) {
              return (
                <TouchableOpacity key={opt.id} activeOpacity={0.85} style={styles.segItemWrap} onPress={() => setMode(opt.id)}>
                  <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.segItemActive}>
                    <Text style={styles.segTextActive}>{opt.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={opt.id} activeOpacity={0.85}
                style={[styles.segItemWrap, styles.segItem]}
                onPress={() => setMode(opt.id)}
              >
                <Text style={styles.segText}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, styles.filterChipPrimary]} activeOpacity={0.85}>
            <Ionicons name="filter-outline" size={16} color={Colors.primary} />
            <Text style={[styles.filterChipText, { color: Colors.textPrimary }]}>Fənn</Text>
          </TouchableOpacity>
          {[
            { label: 'Çətinlik', icon: 'chevron-down' as const },
            { label: 'Tarix', icon: 'calendar-outline' as const },
            { label: 'İmtahan növü', icon: 'apps-outline' as const },
          ].map((f) => (
            <TouchableOpacity key={f.label} style={styles.filterChip} activeOpacity={0.85}>
              <Text style={styles.filterChipText}>{f.label}</Text>
              <Ionicons name={f.icon} size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cards */}
        {isLoading || generate.isPending ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
            {generate.isPending && (
              <Text style={[styles.emptySub, { marginTop: 12 }]}>AI yeni imtahan hazırlayır… (5-10 san)</Text>
            )}
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={42} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{categoryTitle} üçün imtahan hazır deyil</Text>
            <Text style={styles.emptySub}>
              {error
                ? 'Server bağlantısında problem var. Yenidən cəhd et və ya AI ilə yeni imtahan yarat.'
                : `Sənin üçün AI dərhal yeni imtahan hazırlaya bilər.\nFənn: ${effectiveSubject}`}
            </Text>
            <TouchableOpacity activeOpacity={0.85} onPress={onGenerate} style={{ marginTop: 16 }}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
                <Text style={styles.startBtnText}>AI ilə yeni imtahan yarat</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} onPress={() => refetch()} style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, textDecorationLine: 'underline' }}>Yenidən yoxla</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 24 }}>
            {filtered.map((ex: any, idx: number) => {
              const badges = badgesFor(idx);
              const isLive = badges.includes('live');
              const diff = DIFFICULTY_META[ex.difficulty] ?? DIFFICULTY_META.medium;
              return (
                <View key={ex.id} style={styles.card}>
                  {badges.length > 0 && (
                    <View style={styles.badgeRow}>
                      {badges.map((b) => {
                        const meta = BADGE_META[b];
                        return (
                          <View key={b} style={[styles.badge, { backgroundColor: meta.bg }]}>
                            {b === 'live' && <View style={styles.livePulseWhite} />}
                            <Text style={[styles.badgeText, { color: meta.fg }]}>{meta.label}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  <Text style={styles.cardTitle} numberOfLines={2}>{ex.title}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="help-circle-outline" size={18} color={Colors.primary} />
                      <Text style={styles.metaText}>{ex.questionCount ?? ex.totalQuestions ?? 30} sual</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={18} color={Colors.primary} />
                      <Text style={styles.metaText}>{ex.duration ?? 45} dəqiqə</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name={diff.icon} size={18} color={diff.color} />
                      <Text style={[styles.metaText, { color: diff.color }]}>{diff.label}</Text>
                    </View>
                  </View>
                  <View style={styles.ctaRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.startBtnWrap}
                      onPress={() => navigation.navigate(Routes.ExamInfo, { examId: ex.id, title: ex.title })}
                    >
                      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
                        <Text style={styles.startBtnText}>{isLive ? 'Qoşul' : 'Başla'}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.detailsBtn}
                      onPress={() => navigation.navigate(Routes.ExamDetail, { examId: ex.id, title: ex.title })}
                    >
                      <Text style={styles.detailsBtnText}>Detallara bax</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Decorative empty card */}
            <View style={styles.dashedCard}>
              <Ionicons name="ellipsis-horizontal" size={32} color={Colors.textMuted + '66'} />
              <Text style={styles.dashedText}>Daha çox imtahan yolda...</Text>
            </View>
          </View>
        )}

        {/* Kimi mascot */}
        <View style={styles.mascotWrap}>
          <View style={styles.mascotCircle}>
            <Ionicons name="hardware-chip" size={32} color={Colors.primary} />
          </View>
          <View style={styles.mascotPill}>
            <Text style={styles.mascotPillText}>Kimi AI</Text>
          </View>
        </View>

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
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.primary, marginHorizontal: 12, letterSpacing: -0.3 },

  scroll: { padding: 24, gap: 24, paddingBottom: 48 },

  welcomeTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', opacity: 0.85 },

  filterRow: { gap: 12, paddingRight: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 999,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  filterChipPrimary: { borderColor: Colors.primary + '33' },
  filterChipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  segmented: {
    flexDirection: 'row', padding: 6,
    backgroundColor: Colors.surfaceLow, borderRadius: 999, gap: 4,
  },
  segItemWrap: { flex: 1 },
  segItem: { paddingVertical: 10, alignItems: 'center', borderRadius: 999 },
  segItemActive: {
    paddingVertical: 10, alignItems: 'center', borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2,
  },
  segText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  segTextActive: { fontSize: 13, fontWeight: '700', color: '#fff' },

  center: { paddingVertical: 60, alignItems: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 60 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 18 },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24,
    position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  badgeRow: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', gap: 6, zIndex: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
  },
  livePulseWhite: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16, paddingRight: 96, letterSpacing: -0.2 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  ctaRow: { flexDirection: 'row', gap: 12, paddingTop: 8 },
  startBtnWrap: { flex: 2 },
  startBtn: {
    paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 18, elevation: 4,
  },
  startBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  detailsBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  detailsBtnText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  dashedCard: {
    minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.surfaceHigh,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLow + '66',
  },
  dashedText: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },

  mascotWrap: { alignItems: 'center', marginTop: 32, opacity: 0.7 },
  mascotCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  mascotPill: {
    position: 'absolute', top: -6, right: '30%',
    backgroundColor: '#fff', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  mascotPillText: { fontSize: 10, fontWeight: '800', color: Colors.primary },
});
