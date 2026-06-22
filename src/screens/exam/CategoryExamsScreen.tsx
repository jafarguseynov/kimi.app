import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExamListForUser } from '../../hooks/useExams';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.CategoryExams>;
type Mode = 'all' | 'live';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const DIFFICULTY_META: Record<string, { tKey: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  easy:   { tKey: 'examList.diff.easy',   icon: 'happy-outline',     color: Colors.tertiary },
  medium: { tKey: 'examList.diff.medium', icon: 'bar-chart-outline', color: Colors.textSecondary },
  hard:   { tKey: 'examList.diff.hard',   icon: 'trending-up',       color: Colors.danger },
};

type BadgeKind = 'new' | 'popular' | 'live';
const BADGE_META: Record<BadgeKind, { bg: string; fg: string; tKey: string }> = {
  new:     { bg: '#DCFCE7', fg: Colors.tertiary,        tKey: 'catExams.badgeToday' },
  popular: { bg: Colors.surfaceLow ?? '#E5E9EB', fg: Colors.textSecondary, tKey: 'catExams.badgePopular' },
  live:    { bg: '#DC2626', fg: '#fff',                 tKey: 'catExams.badgeLive' },
};

export default function CategoryExamsScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { categoryTitle, categoryKey, subKey, subject } = route.params;
  const [mode, setMode] = useState<Mode>('all');
  const { data: exams = [], isLoading, error, refetch } = useExamListForUser({ categoryKey, subKey, subject, limit: 6 });

  const filtered = useMemo(() => exams, [exams]);

  // Fənn çatışmırsa, subKey və ya categoryTitle-dan istifadə et
  const effectiveSubject = subject ?? subKey ?? categoryTitle.split('·').pop()?.trim() ?? categoryTitle;

  // Bugünkü paylaşılan imtahan — yalnız "bugünkü" nişanı (saxta "canlı" nişanı götürüldü;
  // canlı imtahanlar ayrıca "Canlı" tabından açılır).
  const badgesFor = (idx: number): BadgeKind[] => (idx === 0 ? ['new'] : []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{t('catExams.examsSuffix', { title: categoryTitle })}</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome hero */}
        <View>
          <Text style={styles.welcomeTitle}>{t('catExams.welcome')}</Text>
          <Text style={styles.welcomeSub}>{t('catExams.welcomeSub')}</Text>
        </View>

        {/* Mode tabs (4 options) */}
        <View style={styles.segmented}>
          {([
            { id: 'all',  label: t('catExams.all') },
            { id: 'live', label: t('catExams.live') },
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

        {/* Canlı tab → əsl canlı imtahanlar siyahısına keç */}
        {mode === 'live' ? (
          <View style={styles.liveCta}>
            <View style={styles.liveIconCircle}>
              <View style={styles.livePulseWhite} />
              <Ionicons name="radio" size={26} color="#fff" />
            </View>
            <Text style={styles.liveCtaTitle}>{t('catExams.liveTitle')}</Text>
            <Text style={styles.liveCtaSub}>{t('catExams.liveSub')}</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.liveCtaBtnWrap}
              onPress={() => navigation.navigate(Routes.LiveExamsList)}
            >
              <LinearGradient colors={['#DC2626', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.liveCtaBtn}>
                <Text style={styles.liveCtaBtnText}>{t('catExams.liveBtn')}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          error ? (
            <View style={styles.empty}>
              <Ionicons name="cloud-offline-outline" size={42} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>{t('catExams.connErr')}</Text>
              <Text style={styles.emptySub}>{t('catExams.connErrSub')}</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => refetch()} style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '700', textDecorationLine: 'underline' }}>{t('catExams.recheck')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Hovuz boşdur — backend fonda hazırlayır, ekran avtomatik yenilənir
            <View style={styles.empty}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={[styles.emptyTitle, { marginTop: 12 }]}>{t('catExams.preparing')}</Text>
              <Text style={styles.emptySub}>
                {t('catExams.preparingSub', { subject: effectiveSubject })}
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate(Routes.NewExam, undefined)}
                style={{ marginTop: 16 }}
              >
                <Text style={{ fontSize: 13, color: Colors.textSecondary, textDecorationLine: 'underline' }}>
                  {t('catExams.createCustom')}
                </Text>
              </TouchableOpacity>
            </View>
          )
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
                            <Text style={[styles.badgeText, { color: meta.fg }]}>{t(meta.tKey)}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  <Text style={styles.cardTitle} numberOfLines={2}>{ex.title}</Text>
                  {!!ex.servedDate && (
                    <View style={styles.variantRow}>
                      <Ionicons name="sparkles-outline" size={13} color={Colors.primary} />
                      <Text style={styles.variantText}>
                        {ex.variantTotal > 1
                          ? t('catExams.variantDailyN', { date: ex.servedDate, v: ex.variant, total: ex.variantTotal })
                          : t('catExams.variantDaily', { date: ex.servedDate })}
                      </Text>
                    </View>
                  )}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="help-circle-outline" size={18} color={Colors.primary} />
                      <Text style={styles.metaText}>{t('catExams.questions', { n: ex.questionCount ?? ex.totalQuestions ?? 30 })}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={18} color={Colors.primary} />
                      <Text style={styles.metaText}>{t('catExams.minutes', { n: ex.duration ?? 45 })}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name={diff.icon} size={18} color={diff.color} />
                      <Text style={[styles.metaText, { color: diff.color }]}>{t(diff.tKey)}</Text>
                    </View>
                  </View>
                  <View style={styles.ctaRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.startBtnWrap}
                      onPress={() => navigation.navigate(Routes.ExamInfo, {
                        examId: ex.id,
                        title: ex.title,
                        questionCount: ex.questionCount ?? ex.totalQuestions,
                        duration: ex.duration,
                        difficulty: ex.difficulty,
                        categoryKey: ex.categoryKey ?? categoryKey,
                        subject: ex.subject ?? subject,
                      })}
                    >
                      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
                        <Text style={styles.startBtnText}>{isLive ? t('catExams.join') : t('catExams.start')}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.detailsBtn}
                      onPress={() => navigation.navigate(Routes.ExamDetail, { examId: ex.id, title: ex.title })}
                    >
                      <Text style={styles.detailsBtnText}>{t('catExams.details')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Gündəlik yenilənmə qeydi */}
            <View style={styles.dashedCard}>
              <Ionicons name="refresh-outline" size={28} color={Colors.textMuted + '99'} />
              <Text style={styles.dashedText}>{t('catExams.dailyRefresh')}</Text>
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
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, paddingRight: 96, letterSpacing: -0.2 },
  variantRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  variantText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
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
  dashedText: { fontSize: 13, fontWeight: '500', color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 16 },

  liveCta: {
    alignItems: 'center', gap: 10, paddingVertical: 32, paddingHorizontal: 20,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20,
    shadowColor: '#DC2626', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 2,
  },
  liveIconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#DC2626',
    alignItems: 'center', justifyContent: 'center',
  },
  liveCtaTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  liveCtaSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 19 },
  liveCtaBtnWrap: { marginTop: 8, width: '100%' },
  liveCtaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 999,
  },
  liveCtaBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

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
