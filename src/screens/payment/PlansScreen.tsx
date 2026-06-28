import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';
import { getPlans, SubscriptionPlan } from '../../api/subscription.api';
import { PAYMENTS_ENABLED } from '../../config/iap';
import PaymentUnavailable from '../../components/PaymentUnavailable';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type RoleTab = 'teacher' | 'student';

export default function PlansScreen() {
  // App Store 3.1.1: iOS-da qiymətli paket siyahısı / satınalma açılmır
  // (giriş nöqtələri onsuz da PremiumBenefits-ə yönəlir — bu defense-in-depth).
  if (!PAYMENTS_ENABLED) return <PaymentUnavailable />;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  // Plans are locked to the current user's role — teachers only see teacher
  // plans, students/parents only see student plans (no cross-role browsing).
  const tab: RoleTab = user?.role === 'teacher' ? 'teacher' : 'student';

  // Paketlər admin paneldən idarə olunur (backend-driven). Audience-ə görə süzülür.
  const { data: allPlans = [], isLoading } = useQuery({ queryKey: ['subscription-plans'], queryFn: getPlans });
  const plans = React.useMemo(
    () =>
      allPlans
        .filter((p) => p.isActive && (p.audience === 'all' || p.audience === tab))
        .sort((a, b) => a.sortOrder - b.sortOrder || a.price - b.price),
    [allPlans, tab],
  );

  const selectPlan = (plan: SubscriptionPlan) => {
    const months = Math.max(1, Math.round(plan.durationDays / 30));
    navigation.navigate(Routes.PaymentMethod, {
      planId: plan.id,
      planKey: plan.key,
      planName: plan.name,
      amount: Number(plan.price),
      months,
      isTeacherSub: tab === 'teacher',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.plansHeader')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>
            {t('pay.plansHeroPre')}
            <Text style={styles.heroAccent}>{t('pay.plansHeroAccent')}</Text>
          </Text>
          <Text style={styles.heroSub}>
            {t('pay.plansHeroSub')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => navigation.navigate(Routes.PlanCompare)}
            style={styles.compareLink}
          >
            <Ionicons name="git-compare-outline" size={14} color={Colors.primary} />
            <Text style={styles.compareLinkText}>{t('pay.comparePlans')}</Text>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        {isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.stateText}>{t('common.loading')}</Text>
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons name="pricetags-outline" size={36} color={Colors.textSecondary} />
            <Text style={styles.stateText}>{t('common.empty')}</Text>
          </View>
        ) : (
          <View style={{ gap: 18 }}>
            {plans.map((p) => {
              const highlight = !!p.badge;
              return (
                <View
                  key={p.id}
                  style={[styles.planCard, highlight && styles.planCardHighlight]}
                >
                  {!!p.badge && (
                    <View style={styles.ribbon}>
                      <Text style={styles.ribbonText}>{p.badge}</Text>
                    </View>
                  )}

                  <Text style={styles.planTitle}>{p.name}</Text>

                  <View style={styles.priceRow}>
                    {p.oldPrice != null && (
                      <Text style={styles.priceOld}>{Number(p.oldPrice)}</Text>
                    )}
                    <Text style={styles.priceNum}>{Number(p.price)}</Text>
                    <Text style={styles.priceCurrency}>AZN</Text>
                  </View>
                  {!!p.description && <Text style={styles.pricePerMonth}>{p.description}</Text>}

                  {(p.features ?? []).length > 0 && (
                    <View style={styles.featuresList}>
                      {(p.features ?? []).map((f) => (
                        <View key={f} style={styles.featureRow}>
                          <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                          <Text style={[styles.featureText, highlight && styles.featureTextHighlight]}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={{ gap: 8, marginTop: 18 }}>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => selectPlan(p)}>
                      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
                        <Text style={styles.primaryBtnText}>{t('pay.selectPackage')}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.7} onPress={() => navigation.navigate(Routes.PremiumBenefits)}>
                      <Text style={styles.ghostBtnText}>{t('pay.moreDetails')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 16 }} />
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 24, paddingTop: 24, gap: 32, paddingBottom: 40 },

  /* Hero */
  heroBlock: { alignItems: 'center', gap: 12, paddingTop: 8, paddingHorizontal: 8 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.6, lineHeight: 34 },
  heroAccent: { color: Colors.primary },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 320, fontWeight: '500' },
  compareLink: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: Colors.primary + '12',
    marginTop: 6,
  },
  compareLinkText: { fontSize: 12, fontWeight: '800', color: Colors.primary, letterSpacing: -0.1 },

  /* Tab */
  tabBar: {
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLow,
    padding: 6, borderRadius: 999, gap: 4,
  },
  tabItem: {
    paddingHorizontal: 30, paddingVertical: 10, borderRadius: 999,
  },
  tabItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },

  /* Plan card */
  planCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 22, padding: 26,
    overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 22, elevation: 2,
  },
  planCardHighlight: {
    borderWidth: 2, borderColor: Colors.primary,
    shadowOpacity: 0.12, shadowRadius: 28,
  },
  ribbon: {
    position: 'absolute', top: 12, right: -36,
    backgroundColor: Colors.primary,
    paddingHorizontal: 44, paddingVertical: 4,
    transform: [{ rotate: '45deg' }],
  },
  ribbonText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1, textTransform: 'uppercase' },

  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
    marginBottom: 10,
  },
  planBadgeTertiary: { backgroundColor: Colors.tertiary + '18' },
  planBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  planBadgeTextTertiary: { color: Colors.tertiary },

  planTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 14 },
  priceOld: { fontSize: 18, fontWeight: '600', color: Colors.textSecondary, textDecorationLine: 'line-through' },
  priceNum: { fontSize: 40, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 },
  priceCurrency: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  pricePerMonth: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },

  featuresList: { gap: 12, marginTop: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureText: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.textSecondary, lineHeight: 18 },
  featureTextHighlight: { color: Colors.textPrimary, fontWeight: '700' },

  primaryBtn: {
    height: 50, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 4,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  /* Loading / empty */
  stateBox: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 48 },
  stateText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },

  ghostBtn: { height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  /* Cross-role preview */
  crossCard: {
    backgroundColor: Colors.primary + '0D',
    borderRadius: 22, padding: 24,
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
  },
  crossChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  crossChipText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1, textTransform: 'uppercase' },
  crossTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  crossSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, fontWeight: '500' },
  crossPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 },
  crossPriceNum: { fontSize: 28, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  crossPriceUnit: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  crossBtn: {
    height: 48, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 4,
  },
  crossBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
