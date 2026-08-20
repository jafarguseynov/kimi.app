import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { useReturnTab } from '../../hooks/useReturnTab';
import { PAYMENTS_ENABLED } from '../../config/iap';
import { getPremiumPlans, PlanCard, trackMonetizationEvent } from '../../api/monetization.api';
import { useMonetizationConfig } from '../../hooks/useEntitlements';
import { getTeacherPlanState } from '../../api/teacherPlan.api';
import { getTeacherAnalytics } from '../../api/user.api';
import Skeleton from '../../components/common/Skeleton';

/**
 * MÜƏLLİM PREMIUM SƏHİFƏSİ — funksiya siyahısı deyil, satış axını.
 *
 * Məntiq: PROBLEM (şagird tapmaq çətindir) → HƏLL (paketlə şagird sorğularına
 * çıxış) → NƏTİCƏ (daha çox dərs) → CTA (paketi seç).
 *
 * ⚠️ BURADA GÖSTƏRİLƏN HƏR ŞEY REALDIR:
 *  • Paketlər/qiymətlər  → GET /monetization/plans?audience=teacher
 *  • Paketin vəziyyəti   → GET /teacher-plan/me (rol-əsaslı premium DEYİL)
 *  • Statistika          → GET /user/teacher/analytics
 *  • Müqayisə cədvəli    → backend-də HƏQİQƏTƏN qapıda olan 3 imkan:
 *      1. lesson-request `expressInterest` → TeacherPlanService.assertActive
 *      2. booking təsdiqi → eyni yoxlama
 *      3. müəllim kartındakı Premium nişanı (user.service `isPremium`)
 *    AI/imtahan/analitika capability-ləri BURADA SATILMIR, çünki backend-də
 *    müəllim ROLU onsuz da onları açır (entitlement.service `roleGrants`) —
 *    onları "premium üstünlüyü" kimi göstərmək saxta olardı.
 *
 * iOS (App Store 3.1.1): `PAYMENTS_ENABLED=false` olduqda qiymət, paket kartı
 * və satınalma CTA-sı ÜMUMİYYƏTLƏ render olunmur — yalnız dəyər izahı qalır.
 */

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const DATE_LOCALE: Record<string, string> = { az: 'az-AZ', ru: 'ru-RU', en: 'en-US' };

/** Paketlə açılan REAL imkanlar (hər biri backend qapısına bağlıdır). */
const GATED: { key: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'rowRequests', icon: 'people' },
  { key: 'rowBooking', icon: 'calendar' },
  { key: 'rowBadge', icon: 'star' },
];

export default function TeacherPremiumScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t, language } = useTranslation();
  // Başqa tabdan (Sorğular, Rezervasiya, Profil) açılıbsa geri həmin taba qayıt.
  useReturnTab();

  const scrollRef = useRef<ScrollView>(null);
  const plansY = useRef(0);

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ['teacher-plan'],
    queryFn: getTeacherPlanState,
    staleTime: 60 * 1000,
    retry: false,
  });

  // Paket siyahısı PlansScreen ilə eyni keş açarını işlədir → təkrar sorğu yoxdur.
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['premium-plans', 'teacher'],
    queryFn: () => getPremiumPlans('teacher'),
    enabled: PAYMENTS_ENABLED,
    retry: false,
  });

  const { data: config } = useMonetizationConfig();

  // Real göstəricilər — "sənin vəziyyətin" bölməsi üçün.
  const { data: stats } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: getTeacherAnalytics,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    trackMonetizationEvent('premium_view', { paywallSource: 'profile' });
  }, []);

  const active = plan?.active === true;

  const untilLabel = useMemo(() => {
    if (!plan?.until) return null;
    return new Date(plan.until).toLocaleDateString(DATE_LOCALE[language] ?? 'az-AZ', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }, [plan?.until, language]);

  const goPlans = () => {
    scrollRef.current?.scrollTo({ y: Math.max(0, plansY.current - 12), animated: true });
  };

  const selectPlan = (p: PlanCard) => {
    trackMonetizationEvent('premium_cta_click', { planKey: p.key, paywallSource: 'profile' });
    navigation.navigate(Routes.PaymentMethod, {
      planId: p.id,
      planKey: p.key,
      planName: p.name,
      amount: Number(p.price),
      months: Math.max(1, Math.round(p.durationDays / 30)),
      isTeacherSub: true,
    });
  };

  const showPlans = PAYMENTS_ENABLED;
  const showSales = !active;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('teacherPlan.header')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, showSales && showPlans && { paddingBottom: 150 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Vəziyyət / Hero ─────────────────────────────────────────── */}
        {planLoading ? (
          <View style={styles.card}>
            <Skeleton width="55%" height={14} />
            <Skeleton width="90%" height={26} style={{ marginTop: 12 }} />
            <Skeleton width="75%" height={16} style={{ marginTop: 10 }} />
          </View>
        ) : active ? (
          <View style={styles.activeCard}>
            <View style={styles.activeTop}>
              <View style={styles.activeIcon}>
                <Ionicons name="star" size={18} color="#fff" />
              </View>
              <Text style={styles.activeTitle}>{t('teacherPlan.activeTitle')}</Text>
            </View>
            <Text style={styles.activePlan}>
              {plan?.planName ?? t('teacherPlan.activePlanFallback')}
            </Text>
            <Text style={styles.activeMeta}>
              {plan?.unlimited || !untilLabel
                ? t('teacherPlan.activeUnlimited')
                : t('teacherPlan.activeUntil', { date: untilLabel })}
            </Text>

            <View style={styles.activeList}>
              {GATED.map((g) => (
                <View key={g.key} style={styles.activeRow}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.tertiary} />
                  <Text style={styles.activeRowText}>{t(`teacherPlan.${g.key}`)}</Text>
                </View>
              ))}
            </View>

            {showPlans && (
              <TouchableOpacity style={styles.activeBtn} activeOpacity={0.85} onPress={goPlans}>
                <Ionicons name="refresh" size={16} color={Colors.primary} />
                <Text style={styles.activeBtnText}>{t('teacherPlan.renewCta')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.hero}>
            <View style={styles.kicker}>
              <Text style={styles.kickerText}>{t('teacherPlan.kicker')}</Text>
            </View>
            <Text style={styles.heroTitle}>{t('teacherPlan.heroTitle')}</Text>
            <Text style={styles.heroSub}>{t('teacherPlan.heroSub')}</Text>
            {showPlans && (
              <TouchableOpacity activeOpacity={0.9} onPress={goPlans} style={{ marginTop: 18 }}>
                <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroBtn}>
                  <Text style={styles.heroBtnText}>{t('teacherPlan.heroCta')}</Text>
                  <Ionicons name="arrow-forward" size={17} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ─── 3 əsas fayda (yalnız satış rejimində) ──────────────────── */}
        {showSales && (
          <View style={styles.block}>
            {GATED.map((g) => (
              <View key={g.key} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={g.icon} size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.benefitTitle}>{t(`teacherPlan.${g.key}`)}</Text>
                  <Text style={styles.benefitDesc}>{t(`teacherPlan.${g.key}Desc`)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ─── Paketlər ───────────────────────────────────────────────── */}
        {showPlans && (
          <View style={styles.block} onLayout={(e) => { plansY.current = e.nativeEvent.layout.y; }}>
            <Text style={styles.sectionTitle}>
              {active ? t('teacherPlan.plansTitleRenew') : t('teacherPlan.plansTitle')}
            </Text>
            <Text style={styles.sectionSub}>{t('teacherPlan.plansSub')}</Text>

            {plansLoading ? (
              <>
                <View style={styles.planCard}><Skeleton width="45%" height={18} /><Skeleton width="60%" height={30} style={{ marginTop: 14 }} /><Skeleton width="100%" height={44} style={{ marginTop: 18, borderRadius: 999 }} /></View>
                <View style={styles.planCard}><Skeleton width="45%" height={18} /><Skeleton width="60%" height={30} style={{ marginTop: 14 }} /><Skeleton width="100%" height={44} style={{ marginTop: 18, borderRadius: 999 }} /></View>
              </>
            ) : plans.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="pricetags-outline" size={28} color={Colors.textMuted} />
                <Text style={styles.emptyText}>{t('teacherPlan.plansEmpty')}</Text>
              </View>
            ) : (
              plans.map((p) => {
                const highlight = p.highlighted || !!p.badge;
                const months = Math.max(1, Math.round(p.durationDays / 30));
                return (
                  <View key={p.id} style={[styles.planCard, highlight && styles.planCardHi]}>
                    <View style={styles.planTop}>
                      <Text style={styles.planName}>{p.name}</Text>
                      {!!p.badge && (
                        <View style={styles.planBadge}>
                          <Text style={styles.planBadgeText}>{p.badge}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.priceRow}>
                      {p.oldPrice != null && <Text style={styles.priceOld}>{Number(p.oldPrice)}</Text>}
                      <Text style={styles.priceNum}>{Number(p.price)}</Text>
                      <Text style={styles.priceCur}>{p.currency}</Text>
                      <Text style={styles.priceDur}>
                        {t('teacherPlan.perMonths', { n: months })}
                      </Text>
                    </View>

                    {/* Aylıq ekvivalent və qənaət SERVERDƏ hesablanır. */}
                    {p.durationDays > 45 && (
                      <Text style={styles.planMeta}>
                        {t('teacherPlan.monthlyEq', { price: p.pricePerMonth.toFixed(2), currency: p.currency })}
                      </Text>
                    )}
                    {p.savingsPercent != null && p.savingsPercent > 0 && (
                      <View style={styles.saveChip}>
                        <Text style={styles.saveChipText}>{t('teacherPlan.save', { percent: p.savingsPercent })}</Text>
                      </View>
                    )}

                    {/* Paketin öz üstünlükləri — admin paneldən gəlir. */}
                    {(p.features ?? []).length > 0 && (
                      <View style={styles.featureList}>
                        {(p.features ?? []).map((f) => (
                          <View key={f} style={styles.featureRow}>
                            <Ionicons name="checkmark" size={15} color={Colors.tertiary} />
                            <Text style={styles.featureText}>{f}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity activeOpacity={0.9} onPress={() => selectPlan(p)} style={{ marginTop: 16 }}>
                      {highlight ? (
                        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.planBtn}>
                          <Text style={styles.planBtnText}>{config?.ctaPrimary ?? t('teacherPlan.selectPlan')}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.planBtnOutline}>
                          <Text style={styles.planBtnOutlineText}>{t('teacherPlan.selectPlan')}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ─── Paketlə nə dəyişir? (real qapılar) ─────────────────────── */}
        {showSales && (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>{t('teacherPlan.compareTitle')}</Text>

            <View style={styles.table}>
              <View style={styles.tableHead}>
                <Text style={[styles.thFeature]}>{t('teacherPlan.colFeature')}</Text>
                <Text style={styles.thCol}>{t('teacherPlan.colFree')}</Text>
                <Text style={[styles.thCol, { color: Colors.primary }]}>{t('teacherPlan.colPaid')}</Text>
              </View>
              {GATED.map((g, i) => (
                <View key={g.key} style={[styles.tableRow, i > 0 && styles.tableRowBorder]}>
                  <Text style={styles.tdFeature}>{t(`teacherPlan.${g.key}`)}</Text>
                  <View style={styles.tdCol}>
                    <Ionicons name="close" size={18} color={Colors.outlineVariant} />
                  </View>
                  <View style={styles.tdCol}>
                    <Ionicons name="checkmark-circle" size={19} color={Colors.primary} />
                  </View>
                </View>
              ))}
            </View>

            {/* Dürüstlük qeydi: AI/imtahan imkanları müəllim hesabına onsuz da
                daxildir — paketin fərqi şagird axınıdır. */}
            <View style={styles.note}>
              <Ionicons name="information-circle-outline" size={17} color={Colors.primary} />
              <Text style={styles.noteText}>{t('teacherPlan.compareNote')}</Text>
            </View>
          </View>
        )}

        {/* ─── Sən nə qazanırsan? ─────────────────────────────────────── */}
        {showSales && (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>{t('teacherPlan.outcomesTitle')}</Text>
            {(['reach', 'requests', 'booking', 'brand'] as const).map((k) => (
              <View key={k} style={styles.outcomeRow}>
                <Text style={styles.outcomeEmoji}>{t(`teacherPlan.outcome${cap(k)}Emoji`)}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.outcomeTitle}>{t(`teacherPlan.outcome${cap(k)}Title`)}</Text>
                  <Text style={styles.outcomeDesc}>{t(`teacherPlan.outcome${cap(k)}Desc`)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ─── Sənin cari göstəricilərin (REAL) ───────────────────────── */}
        {!!stats && (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>{t('teacherPlan.statsTitle')}</Text>
            <Text style={styles.sectionSub}>{t('teacherPlan.statsSub')}</Text>
            <View style={styles.statsGrid}>
              <Stat icon="eye" value={stats.profileViews ?? 0} label={t('teacherPlan.statViews')} />
              <Stat icon="chatbubbles" value={stats.activeQueries ?? 0} label={t('teacherPlan.statRequests')} />
              <Stat icon="people" value={stats.totalStudents ?? 0} label={t('teacherPlan.statStudents')} />
              <Stat
                icon="star"
                value={stats.rating ? Number(stats.rating).toFixed(1) : '—'}
                label={t('teacherPlan.statRating')}
              />
            </View>
          </View>
        )}

        {/* ─── Kimi AI (müəllim hesabına daxildir) ────────────────────── */}
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>{t('teacherPlan.aiTitle')}</Text>
          <View style={styles.aiCard}>
            <View style={styles.aiChip}>
              <Text style={styles.aiChipText}>{t('teacherPlan.aiIncluded')}</Text>
            </View>
            {(['test', 'analysis', 'mentor'] as const).map((k) => (
              <View key={k} style={styles.aiRow}>
                <Ionicons name="sparkles" size={15} color={Colors.primary} />
                <Text style={styles.aiRowText}>{t(`teacherPlan.ai${cap(k)}`)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Yekun CTA ──────────────────────────────────────────────── */}
        {showSales && showPlans && (
          <View style={styles.finalCard}>
            <Text style={styles.finalTitle}>{t('teacherPlan.finalTitle')}</Text>
            <Text style={styles.finalSub}>{t('teacherPlan.finalSub')}</Text>
            <TouchableOpacity style={styles.finalBtn} activeOpacity={0.85} onPress={goPlans}>
              <Text style={styles.finalBtnText}>{t('teacherPlan.heroCta')}</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* iOS — satınalma yoxdur (App Store 3.1.1) */}
        {!showPlans && (
          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.noteText}>{t('pay.iosInfoNote')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sabit CTA — yalnız paketi olmayan müəllimə və ödəniş açıq platformada */}
      {showSales && showPlans && (
        <View style={styles.bottomBar}>
          <TouchableOpacity activeOpacity={0.9} onPress={goPlans}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bottomBtn}>
              <Text style={styles.bottomBtnText}>{t('teacherPlan.heroCta')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Stat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: number | string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={17} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>{label}</Text>
    </View>
  );
}

const CARD: any = {
  backgroundColor: Colors.surfaceLowest,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: Colors.borderLight,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(248,250,252,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },

  scroll: { padding: 20, paddingBottom: 40, gap: 24 },
  block: { gap: 12 },
  card: { ...CARD, padding: 20 },

  /* Hero */
  hero: { ...CARD, padding: 24, gap: 8 },
  kicker: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    marginBottom: 4,
  },
  kickerText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { fontSize: 27, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.7, lineHeight: 33 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, fontWeight: '500' },
  heroBtn: {
    height: 52, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 4,
  },
  heroBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  /* Aktiv paket */
  activeCard: {
    ...CARD,
    padding: 22, gap: 6,
    borderColor: Colors.tertiary + '55',
    backgroundColor: Colors.tertiary + '0A',
  },
  activeTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.tertiary,
    alignItems: 'center', justifyContent: 'center',
  },
  activeTitle: { fontSize: 15, fontWeight: '800', color: Colors.tertiary, letterSpacing: -0.2 },
  activePlan: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5, marginTop: 6 },
  activeMeta: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  activeList: { gap: 8, marginTop: 12 },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeRowText: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  activeBtn: {
    marginTop: 16, height: 46, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  activeBtnText: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  /* Faydalar */
  benefitCard: { ...CARD, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  benefitIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  benefitTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  benefitDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  /* Bölmə başlıqları */
  sectionTitle: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  sectionSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginTop: -6 },

  /* Paket kartı */
  planCard: { ...CARD, padding: 20 },
  planCardHi: { borderWidth: 2, borderColor: Colors.primary },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  planName: { flex: 1, fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  planBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  planBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase' },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 5, marginTop: 12 },
  priceOld: { fontSize: 15, fontWeight: '600', color: Colors.textMuted, textDecorationLine: 'line-through' },
  priceNum: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -1 },
  priceCur: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  priceDur: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  planMeta: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginTop: 4 },
  saveChip: {
    alignSelf: 'flex-start', marginTop: 8,
    backgroundColor: Colors.tertiary + '18',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  saveChipText: { fontSize: 11, fontWeight: '800', color: Colors.tertiary },

  featureList: { gap: 8, marginTop: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureText: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontWeight: '500', lineHeight: 18 },

  planBtn: {
    height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 3,
  },
  planBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  planBtnOutline: {
    height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  planBtnOutlineText: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  emptyBox: { ...CARD, padding: 28, alignItems: 'center', gap: 10 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  /* Müqayisə cədvəli */
  table: { ...CARD, paddingHorizontal: 16 },
  tableHead: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  thFeature: { flex: 1.5, fontSize: 10, fontWeight: '800', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.8 },
  thCol: { width: 72, textAlign: 'center', fontSize: 10, fontWeight: '800', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.8 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  tableRowBorder: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  tdFeature: { flex: 1.5, fontSize: 13, color: Colors.textPrimary, fontWeight: '600', paddingRight: 8 },
  tdCol: { width: 72, alignItems: 'center', justifyContent: 'center' },

  note: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 9,
    backgroundColor: Colors.primary + '0D', borderRadius: 14, padding: 14,
  },
  noteText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18, fontWeight: '500' },

  /* Nəticələr */
  outcomeRow: { ...CARD, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  outcomeEmoji: { fontSize: 20, lineHeight: 26 },
  outcomeTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  outcomeDesc: { fontSize: 12.5, color: Colors.textSecondary, lineHeight: 18 },

  /* Statistika */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    ...CARD,
    flexGrow: 1, flexBasis: '46%',
    padding: 14, gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  statLabel: { fontSize: 11.5, color: Colors.textSecondary, fontWeight: '600' },

  /* AI */
  aiCard: { ...CARD, padding: 18, gap: 10 },
  aiChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.tertiary + '18',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    marginBottom: 2,
  },
  aiChipText: { fontSize: 10, fontWeight: '800', color: Colors.tertiary, letterSpacing: 0.5 },
  aiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  aiRowText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19, fontWeight: '500' },

  /* Yekun */
  finalCard: { ...CARD, padding: 22, gap: 6, backgroundColor: Colors.primary + '0D', borderColor: Colors.primary + '22' },
  finalTitle: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.4 },
  finalSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, fontWeight: '500' },
  finalBtn: {
    marginTop: 14, height: 48, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  finalBtnText: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  /* Sabit CTA */
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  bottomBtn: {
    height: 54, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 18, elevation: 5,
  },
  bottomBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
