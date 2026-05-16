import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Billing = 'monthly' | 'annual';

const FEATURES: { label: string; free: boolean; premium: boolean }[] = [
  { label: 'Sınırsız imtahanlar', free: true, premium: true },
  { label: 'AI mentor dəstəyi', free: false, premium: true },
  { label: 'Flashcard sistemi', free: true, premium: true },
  { label: 'Liderlik lövhəsi', free: true, premium: true },
  { label: 'Şəxsi öyrənmə planı', free: false, premium: true },
  { label: 'Sertifikatlar', free: false, premium: true },
  { label: 'Offline rejim', free: false, premium: true },
];

export default function PlansScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [billing, setBilling] = useState<Billing>('monthly');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planları Müqayisə Et</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient colors={GRADIENT} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroBlob1} />
          <View style={styles.heroBlob2} />
          <Text style={styles.heroTitle}>Planlarımızı{'\n'}Müqayisə Edin</Text>
          <Text style={styles.heroSub}>Özünüzə uyğun planı seçin</Text>
        </LinearGradient>

        {/* Billing toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleOption, billing === 'monthly' && styles.toggleOptionActive]}
            onPress={() => setBilling('monthly')}
            activeOpacity={0.85}
          >
            <Text style={[styles.toggleText, billing === 'monthly' && styles.toggleTextActive]}>Aylıq</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, billing === 'annual' && styles.toggleOptionActive]}
            onPress={() => setBilling('annual')}
            activeOpacity={0.85}
          >
            <Text style={[styles.toggleText, billing === 'annual' && styles.toggleTextActive]}>İllik</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>15% endirim</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Plan cards */}
        <View style={styles.plansRow}>
          <View style={[styles.planCard, styles.planCardFree]}>
            <Text style={styles.planName}>Pulsuz</Text>
            <Text style={styles.planPrice}>0 <Text style={styles.planCurrency}>AZN</Text></Text>
            <Text style={styles.planPriceSub}>ayda</Text>
          </View>
          <LinearGradient colors={GRADIENT} style={[styles.planCard, styles.planCardPremium]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>POPULYAR</Text>
            </View>
            <Text style={[styles.planName, { color: '#fff' }]}>Premium</Text>
            <Text style={[styles.planPrice, { color: '#fff' }]}>
              {billing === 'monthly' ? '9.99' : '8.49'} <Text style={styles.planCurrencyWhite}>AZN</Text>
            </Text>
            <Text style={[styles.planPriceSub, { color: 'rgba(255,255,255,0.8)' }]}>ayda</Text>
          </LinearGradient>
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          <View style={styles.featuresHeader}>
            <Text style={styles.featuresTitle}>Funksiyaların Müqayisəsi</Text>
            <View style={styles.featureColHeaders}>
              <Text style={styles.featureColLabel}>Pulsuz</Text>
              <Text style={styles.featureColLabel}>Premium</Text>
            </View>
          </View>
          {FEATURES.map((f, i) => (
            <View
              key={f.label}
              style={[styles.featureRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: 12, paddingTop: 12 }]}
            >
              <Text style={styles.featureLabel}>{f.label}</Text>
              <View style={styles.featureChecks}>
                <View style={styles.featureCheck}>
                  <Ionicons
                    name={f.free ? 'checkmark-circle' : 'close-circle-outline'}
                    size={20}
                    color={f.free ? Colors.primary : Colors.outlineVariant}
                  />
                </View>
                <View style={styles.featureCheck}>
                  <Ionicons
                    name={f.premium ? 'checkmark-circle' : 'close-circle-outline'}
                    size={20}
                    color={f.premium ? Colors.tertiary : Colors.outlineVariant}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={() => navigation.navigate(Routes.PaymentMethod)} activeOpacity={0.9}>
          <LinearGradient colors={GRADIENT} style={styles.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.ctaBtnText}>Premium-a keç</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },

  scroll: { padding: 20, gap: 20, paddingBottom: 48 },

  hero: {
    borderRadius: 20, padding: 28, gap: 8, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 4,
  },
  heroBlob1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroBlob2: { position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)' },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 34 },
  heroSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },

  toggleRow: {
    flexDirection: 'row', backgroundColor: Colors.surfaceContainer,
    borderRadius: 14, padding: 4, gap: 4,
  },
  toggleOption: {
    flex: 1, borderRadius: 10, paddingVertical: 10,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  toggleOptionActive: { backgroundColor: Colors.surfaceLowest },
  toggleText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  toggleTextActive: { color: Colors.textPrimary, fontWeight: '700' },
  discountBadge: { backgroundColor: Colors.primaryLight, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  discountText: { fontSize: 10, fontWeight: '700', color: Colors.primary },

  plansRow: { flexDirection: 'row', gap: 14 },
  planCard: { flex: 1, borderRadius: 20, padding: 20, gap: 4 },
  planCardFree: {
    backgroundColor: Colors.surfaceLowest, borderWidth: 1.5, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
  },
  planCardPremium: {
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 4,
    overflow: 'hidden',
  },
  popularBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 4,
  },
  popularBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  planName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  planPrice: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  planCurrency: { fontSize: 16, fontWeight: '600' },
  planCurrencyWhite: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  planPriceSub: { fontSize: 11, color: Colors.textSecondary },

  featuresCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
  },
  featuresHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  featuresTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  featureColHeaders: { flexDirection: 'row', gap: 16 },
  featureColLabel: { width: 44, fontSize: 9, fontWeight: '700', color: Colors.outline, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  featureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  featureLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  featureChecks: { flexDirection: 'row', gap: 16 },
  featureCheck: { width: 44, alignItems: 'center' },

  ctaBtn: {
    height: 58, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
