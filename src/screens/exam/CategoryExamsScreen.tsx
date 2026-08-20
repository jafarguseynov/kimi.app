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
import { useEntitlements } from '../../hooks/useEntitlements';
import { getCategoryTitle } from '../../constants/educationTaxonomy';
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

/**
 * Kartın 1 cümləlik faydası — «bu imtahanı niyə həll etməliyəm?».
 * Mətn imtahanın REAL xüsusiyyətindən seçilir (gündəlik variant / çətinlik),
 * uydurma statistika göstərilmir.
 */
function benefitKey(ex: any, idx: number): string {
  if (ex.servedDate) return 'catExams.benefitDaily';
  if (ex.difficulty === 'hard') return 'catExams.benefitHard';
  if (ex.difficulty === 'easy') return 'catExams.benefitEasy';
  const rotating = ['catExams.benefitLevel', 'catExams.benefitDim', 'catExams.benefitWeak'];
  return rotating[idx % rotating.length];
}

export default function CategoryExamsScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { categoryTitle, categoryKey, subKey, subject } = route.params;
  const [mode, setMode] = useState<Mode>('all');
  const { data: exams = [], isLoading, error, refetch } = useExamListForUser({ categoryKey, subKey, subject, limit: 6 });

  // Pulsuz / Premium statusu — REAL entitlement məlumatı (uydurma nişan yoxdur).
  // Limit dolubsa kartda «Premium» göstərilir; başlatmaq istəyəndə serverin
  // 403-ü ilə paywall açılır (§4 — düymə gizlətmək tək müdafiə deyil).
  const { isPremium, limitOf } = useEntitlements();
  const examLimit = limitOf('exam');
  const limited = !isPremium && !!examLimit && !examLimit.unlimited;
  const locked = limited && (examLimit as any).remaining <= 0;

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
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
          <View style={{ gap: 16 }}>
            {filtered.map((ex: any, idx: number) => {
              const badges = badgesFor(idx);
              const isLive = badges.includes('live');
              const diff = DIFFICULTY_META[ex.difficulty] ?? DIFFICULTY_META.medium;
              const qCount = ex.questionCount ?? ex.totalQuestions ?? 25;
              const minutes = ex.duration ?? 45;
              const catLabel = getCategoryTitle(ex.categoryKey ?? categoryKey);
              // Fənn başlıqda onsuz da varsa təkrar göstərmirik
              const subj: string | null =
                ex.subject && !String(ex.title ?? '').toLowerCase().includes(String(ex.subject).toLowerCase())
                  ? ex.subject
                  : null;
              const params = {
                examId: ex.id,
                title: ex.title,
                questionCount: qCount,
                duration: minutes,
                difficulty: ex.difficulty,
                categoryKey: ex.categoryKey ?? categoryKey,
                subject: ex.subject ?? subject,
              };
              return (
                <TouchableOpacity
                  key={ex.id}
                  style={styles.card}
                  activeOpacity={0.92}
                  // Karta toxunmaq = detal ekranı (ikinci dərəcəli hərəkət)
                  onPress={() => navigation.navigate(Routes.ExamInfo, params)}
                >
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

                  {(!!catLabel || !!subj) && (
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {[catLabel, subj].filter(Boolean).join(' · ')}
                    </Text>
                  )}

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
                      <Ionicons name="help-circle-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>{t('catExams.questions', { n: qCount })}</Text>
                    </View>
                    <Text style={styles.metaDot}>·</Text>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>{t('catExams.minutes', { n: minutes })}</Text>
                    </View>
                    <Text style={styles.metaDot}>·</Text>
                    <View style={styles.metaItem}>
                      <Ionicons name={diff.icon} size={16} color={diff.color} />
                      <Text style={[styles.metaText, { color: diff.color }]}>{t(diff.tKey)}</Text>
                    </View>
                  </View>

                  <Text style={styles.benefitText}>{t(benefitKey(ex, idx))}</Text>

                  {/* Pulsuz / Premium statusu — premium istifadəçidə göstərilmir (hər şey açıqdır) */}
                  {!isPremium && (
                  <View style={styles.accessRow}>
                    {locked ? (
                      <View style={[styles.accessChip, styles.accessChipPremium]}>
                        <Ionicons name="lock-closed" size={12} color="#B45309" />
                        <Text style={[styles.accessChipText, { color: '#B45309' }]}>{t('catExams.premium')}</Text>
                      </View>
                    ) : (
                      <View style={[styles.accessChip, styles.accessChipFree]}>
                        <Ionicons name="checkmark-circle" size={12} color={Colors.tertiary} />
                        <Text style={[styles.accessChipText, { color: Colors.tertiary }]}>{t('catExams.free')}</Text>
                      </View>
                    )}
                    {limited && !locked && (
                      <Text style={styles.accessNote}>
                        {t('catExams.freeLeft', { n: (examLimit as any).remaining })}
                      </Text>
                    )}
                  </View>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.startBtnWrap}
                    // Əsas CTA → qısa hazırlıq ekranı → Exam Runner
                    onPress={() => navigation.navigate(Routes.ExamDetail, params)}
                  >
                    <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
                      <Text style={styles.startBtnText}>
                        {isLive ? t('catExams.join') : locked ? t('catExams.premiumCta') : t('catExams.startCta')}
                      </Text>
                      <Ionicons name="arrow-forward" size={17} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.detailsHintRow}>
                    <Text style={styles.detailsHintText}>{t('catExams.tapDetails')}</Text>
                    <Ionicons name="chevron-forward" size={13} color={Colors.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Gündəlik yenilənmə qeydi */}
            <View style={styles.dashedCard}>
              <Ionicons name="refresh-outline" size={28} color={Colors.textMuted + '99'} />
              <Text style={styles.dashedText}>{t('catExams.dailyRefresh')}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
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
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20,
    position: 'relative',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 28, elevation: 2,
  },
  badgeRow: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', gap: 6, zIndex: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  livePulseWhite: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  cardTitle: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, paddingRight: 92, letterSpacing: -0.3, lineHeight: 25 },
  cardSubtitle: { fontSize: 13, fontWeight: '600', color: Colors.primary, marginTop: 4 },
  variantRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  variantText: { fontSize: 12, fontWeight: '600', color: Colors.primary, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  metaDot: { fontSize: 13, color: Colors.textMuted },
  benefitText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginTop: 10 },

  accessRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  accessChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  accessChipFree: { backgroundColor: '#DCFCE7' },
  accessChipPremium: { backgroundColor: '#FEF3C7' },
  accessChipText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  accessNote: { fontSize: 11, color: Colors.textMuted, flexShrink: 1 },

  startBtnWrap: { marginTop: 16 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 4,
  },
  startBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  detailsHintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 10 },
  detailsHintText: { fontSize: 12, color: Colors.textMuted },

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
});
