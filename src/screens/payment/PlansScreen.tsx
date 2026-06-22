import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type RoleTab = 'teacher' | 'student';

type Plan = {
  id: string;
  badgeKey: string;
  badgeTone: 'primary' | 'tertiary';
  titleKey: string;
  price: number;
  perMonthKey: string;
  featuresKey: string;
  highlight?: boolean;
  ribbonKey?: string;
};

const TEACHER_PLANS: Plan[] = [
  {
    id: 't-3',
    badgeKey: 'pay.badgeStandard',
    badgeTone: 'primary',
    titleKey: 'pay.planT3Title',
    price: 75,
    perMonthKey: 'pay.planT3PerMonth',
    featuresKey: 'pay.planT3Features',
  },
  {
    id: 't-6',
    badgeKey: 'pay.badgeMostSelected',
    badgeTone: 'primary',
    titleKey: 'pay.planT6Title',
    price: 99,
    perMonthKey: 'pay.planT6PerMonth',
    featuresKey: 'pay.planT6Features',
    highlight: true,
    ribbonKey: 'pay.ribbonRecommended',
  },
  {
    id: 't-12',
    badgeKey: 'pay.badgeBestValue',
    badgeTone: 'tertiary',
    titleKey: 'pay.planT12Title',
    price: 145,
    perMonthKey: 'pay.planT12PerMonth',
    featuresKey: 'pay.planT12Features',
  },
];

const STUDENT_PLANS: Plan[] = [
  {
    id: 's-1',
    badgeKey: 'pay.badgeStarter',
    badgeTone: 'primary',
    titleKey: 'pay.planS1Title',
    price: 9,
    perMonthKey: 'pay.planS1PerMonth',
    featuresKey: 'pay.planS1Features',
  },
  {
    id: 's-3',
    badgeKey: 'pay.badgeMostSelected',
    badgeTone: 'primary',
    titleKey: 'pay.planS3Title',
    price: 22,
    perMonthKey: 'pay.planS3PerMonth',
    featuresKey: 'pay.planS3Features',
    highlight: true,
    ribbonKey: 'pay.ribbonRecommended',
  },
  {
    id: 's-12',
    badgeKey: 'pay.badgeBestValue',
    badgeTone: 'tertiary',
    titleKey: 'pay.planS12Title',
    price: 65,
    perMonthKey: 'pay.planS12PerMonth',
    featuresKey: 'pay.planS12Features',
  },
];

export default function PlansScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  // Plans are locked to the current user's role — teachers only see teacher
  // plans, students/parents only see student plans (no cross-role browsing).
  const tab: RoleTab = user?.role === 'teacher' ? 'teacher' : 'student';

  const plans = tab === 'teacher' ? TEACHER_PLANS : STUDENT_PLANS;

  const selectPlan = (plan: Plan) => {
    // Plan id formatı "t-6" / "s-12" → ay sayını verir
    const months = Number(plan.id.split('-')[1]) || 1;
    navigation.navigate(Routes.PaymentMethod, {
      planId: plan.id,
      planName: t(plan.titleKey),
      amount: plan.price,
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
        <View style={{ gap: 18 }}>
          {plans.map((p) => (
            <View
              key={p.id}
              style={[styles.planCard, p.highlight && styles.planCardHighlight]}
            >
              {p.ribbonKey && (
                <View style={styles.ribbon}>
                  <Text style={styles.ribbonText}>{t(p.ribbonKey)}</Text>
                </View>
              )}

              <View style={[
                styles.planBadge,
                p.badgeTone === 'tertiary' && styles.planBadgeTertiary,
              ]}>
                <Text style={[
                  styles.planBadgeText,
                  p.badgeTone === 'tertiary' && styles.planBadgeTextTertiary,
                ]}>{t(p.badgeKey)}</Text>
              </View>

              <Text style={styles.planTitle}>{t(p.titleKey)}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceNum}>{p.price}</Text>
                <Text style={styles.priceCurrency}>AZN</Text>
              </View>
              <Text style={styles.pricePerMonth}>{t(p.perMonthKey)}</Text>

              <View style={styles.featuresList}>
                {t(p.featuresKey).split('|').map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    <Text style={[styles.featureText, p.highlight && styles.featureTextHighlight]}>{f}</Text>
                  </View>
                ))}
              </View>

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
          ))}
        </View>

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
