import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Benefit = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
};

const BENEFITS: Benefit[] = [
  {
    id: 'ai-exam',
    icon: 'help-circle',
    title: 'Limitsiz AI imtahan',
    desc: 'Süni intellekt tərəfindən hazırlanan sonsuz sayda testlərdən yararlanın.',
  },
  {
    id: 'ai-analysis',
    icon: 'analytics',
    title: 'AI analiz',
    desc: 'Nəticələrinizin dərindən təhlili və zəif tərəflərinizin müəyyən edilməsi.',
  },
  {
    id: 'requests',
    icon: 'chatbubbles',
    title: 'Sorğulara çıxış',
    desc: 'Şagird və müəllim sorğularına limitsiz və sürətli çıxış imkanı.',
  },
  {
    id: 'visibility',
    icon: 'eye',
    title: 'Daha çox görünürlük',
    desc: 'Profilinizin reytinqlərdə və axtarışlarda daha yuxarıda olması.',
  },
  {
    id: 'insights',
    icon: 'stats-chart',
    title: 'İnkişaf statistikası',
    desc: 'Həftəlik və aylıq tərəqqinizi göstərən interaktiv qrafiklər.',
  },
  {
    id: 'extras',
    icon: 'extension-puzzle',
    title: 'Əlavə testlər',
    desc: 'Yalnız Premium istifadəçilər üçün nəzərdə tutulmuş eksklüziv materiallar.',
  },
];

export default function PremiumBenefitsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Premium Üstünlüklər</Text>
          <Text style={styles.heroSub}>Premium ilə təhsilində fərq yarat!</Text>
        </View>

        {/* Benefit cards */}
        <View style={styles.benefitsList}>
          {BENEFITS.map((b) => (
            <View key={b.id} style={styles.benefitCard}>
              <View style={styles.benefitIconBox}>
                <Ionicons name={b.icon} size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing summary */}
        <View style={styles.pricingCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pricingLabel}>Plan Seçimi</Text>
            <Text style={styles.pricingPlan}>İllik abunəlik</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.pricingPrice}>₼4.99</Text>
            <Text style={styles.pricingUnit}>/ ay</Text>
          </View>
        </View>

        <View style={{ height: 12 }} />
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.PaymentMethod)}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
            <Ionicons name="ribbon" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>Premium-a keç</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          Abunəlik hər ay avtomatik yenilənir. İstənilən vaxt ləğv edilə bilər.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(248,250,252,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '60',
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: Colors.outlineVariant + '60',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },

  scroll: { padding: 24, paddingBottom: 200, gap: 20 },

  /* Hero */
  heroCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: Colors.outlineVariant + '60',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
    gap: 8,
  },
  heroTitle: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.6 },
  heroSub: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },

  /* Benefits */
  benefitsList: { gap: 12 },
  benefitCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    borderWidth: 1, borderColor: Colors.outlineVariant + '60',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
  benefitIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.primary + '0D',
    alignItems: 'center', justifyContent: 'center',
  },
  benefitTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  benefitDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  /* Pricing */
  pricingCard: {
    backgroundColor: Colors.primary + '0D', borderRadius: 18,
    padding: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  pricingLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  pricingPlan: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  pricingPrice: { fontSize: 24, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
  pricingUnit: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', marginTop: 2 },

  /* Bottom CTA */
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Colors.outlineVariant + '60',
    gap: 12,
  },
  ctaBtn: {
    height: 56, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
  disclaimer: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500', lineHeight: 16 },
});
