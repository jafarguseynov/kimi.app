import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type RoleTab = 'teacher' | 'student';

type Plan = {
  id: string;
  badge: string;
  badgeTone: 'primary' | 'tertiary';
  title: string;
  price: number;
  perMonth: string;
  features: string[];
  highlight?: boolean;
  ribbon?: string;
};

const TEACHER_PLANS: Plan[] = [
  {
    id: 't-3',
    badge: 'Standart',
    badgeTone: 'primary',
    title: '3 Aylıq Paket',
    price: 75,
    perMonth: 'Hər ay üçün ~25 AZN',
    features: ['3 ay tam aktivlik', 'Məhdud tələbə sorğusu', 'Bütün dərslərə baxış'],
  },
  {
    id: 't-6',
    badge: 'Ən çox seçilən',
    badgeTone: 'primary',
    title: '6 Aylıq Paket',
    price: 99,
    perMonth: 'Hər ay üçün ~16.50 AZN',
    features: ['6 ay tam aktivlik', 'Üstün profil görünüşü', 'Prioritetli dəstək', 'Kimi Robot assistent'],
    highlight: true,
    ribbon: 'Məsləhətli',
  },
  {
    id: 't-12',
    badge: 'Ən sərfəli',
    badgeTone: 'tertiary',
    title: '1 İllik Paket',
    price: 145,
    perMonth: 'Hər ay üçün ~12 AZN',
    features: ['1 il tam aktivlik', 'Limitsiz tələbə sorğusu', 'AI əsaslı analitika', 'Eksklüziv vebinarlar'],
  },
];

const STUDENT_PLANS: Plan[] = [
  {
    id: 's-1',
    badge: 'Başlanğıc',
    badgeTone: 'primary',
    title: 'Aylıq Paket',
    price: 9,
    perMonth: 'Sınaq üçün ideal',
    features: ['Limitsiz testlər', 'Bütün imtahan materialları', 'Əsas Kimi Robot köməyi'],
  },
  {
    id: 's-3',
    badge: 'Ən çox seçilən',
    badgeTone: 'primary',
    title: '3 Aylıq Paket',
    price: 22,
    perMonth: 'Hər ay üçün ~7.30 AZN',
    features: ['Limitsiz testlər', 'AI mentor dəstəyi', 'Şəxsi öyrənmə planı', 'Sertifikatlar'],
    highlight: true,
    ribbon: 'Məsləhətli',
  },
  {
    id: 's-12',
    badge: 'Ən sərfəli',
    badgeTone: 'tertiary',
    title: '1 İllik Paket',
    price: 65,
    perMonth: 'Hər ay üçün ~5.40 AZN',
    features: ['Hər şey daxil', 'Offline rejim', 'Eksklüziv kurslar', 'Prioritetli dəstək'],
  },
];

export default function PlansScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const user = useUserStore((s) => s.user);
  const initialTab: RoleTab = user?.role === 'teacher' ? 'teacher' : 'student';
  const [tab, setTab] = useState<RoleTab>(initialTab);

  const plans = tab === 'teacher' ? TEACHER_PLANS : STUDENT_PLANS;

  const selectPlan = (plan: Plan) => {
    navigation.navigate(Routes.PaymentMethod, { planId: plan.id, planName: plan.title, amount: plan.price });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Abunəlik Planları</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>
            Sizin üçün ən uyğun{' '}
            <Text style={styles.heroAccent}>planı seçin</Text>
          </Text>
          <Text style={styles.heroSub}>
            Təhsil yolunuzda Kimi Robot və premium imkanlarla daha sürətli irəliləyin.
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => navigation.navigate(Routes.PlanCompare)}
            style={styles.compareLink}
          >
            <Ionicons name="git-compare-outline" size={14} color={Colors.primary} />
            <Text style={styles.compareLinkText}>Planları müqayisə et</Text>
          </TouchableOpacity>
        </View>

        {/* Tab segmented */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'teacher' && styles.tabItemActive]}
            onPress={() => setTab('teacher')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, tab === 'teacher' && styles.tabTextActive]}>Müəllim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'student' && styles.tabItemActive]}
            onPress={() => setTab('student')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, tab === 'student' && styles.tabTextActive]}>Şagird</Text>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        <View style={{ gap: 18 }}>
          {plans.map((p) => (
            <View
              key={p.id}
              style={[styles.planCard, p.highlight && styles.planCardHighlight]}
            >
              {p.ribbon && (
                <View style={styles.ribbon}>
                  <Text style={styles.ribbonText}>{p.ribbon}</Text>
                </View>
              )}

              <View style={[
                styles.planBadge,
                p.badgeTone === 'tertiary' && styles.planBadgeTertiary,
              ]}>
                <Text style={[
                  styles.planBadgeText,
                  p.badgeTone === 'tertiary' && styles.planBadgeTextTertiary,
                ]}>{p.badge}</Text>
              </View>

              <Text style={styles.planTitle}>{p.title}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceNum}>{p.price}</Text>
                <Text style={styles.priceCurrency}>AZN</Text>
              </View>
              <Text style={styles.pricePerMonth}>{p.perMonth}</Text>

              <View style={styles.featuresList}>
                {p.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    <Text style={[styles.featureText, p.highlight && styles.featureTextHighlight]}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={{ gap: 8, marginTop: 18 }}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => selectPlan(p)}>
                  <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Paketi seç</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.7} onPress={() => navigation.navigate(Routes.PremiumBenefits)}>
                  <Text style={styles.ghostBtnText}>Daha ətraflı</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Cross-role preview */}
        {tab === 'teacher' && (
          <View style={styles.crossCard}>
            <View style={{ flex: 1, gap: 8 }}>
              <View style={styles.crossChip}>
                <Text style={styles.crossChipText}>Şagirdlər üçün</Text>
              </View>
              <Text style={styles.crossTitle}>Aylıq Premium Giriş</Text>
              <Text style={styles.crossSub}>
                Bütün imtahan materiallarına giriş, limitsiz testlər və Kimi Robotun fərdi dərsləri ilə fərq yaradın.
              </Text>
              <View style={styles.crossPriceRow}>
                <Text style={styles.crossPriceNum}>5 - 9</Text>
                <Text style={styles.crossPriceUnit}>AZN / ay</Text>
              </View>
              <TouchableOpacity activeOpacity={0.9} onPress={() => setTab('student')} style={{ marginTop: 4 }}>
                <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.crossBtn}>
                  <Text style={styles.crossBtnText}>Şagird planlarına bax</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
