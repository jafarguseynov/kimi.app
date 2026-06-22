import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type RenewOption = {
  id: '3mo' | '6mo' | '1yr';
  titleKey: string;
  price: number;
  featuresKey: string;
  saveBadgeKey?: string;
  popular?: boolean;
};

const OPTIONS: RenewOption[] = [
  { id: '3mo', titleKey: 'pay.opt3mo', price: 75,  featuresKey: 'pay.renewFeat3mo' },
  { id: '6mo', titleKey: 'pay.opt6mo', price: 99,  featuresKey: 'pay.renewFeat6mo', popular: true },
  { id: '1yr', titleKey: 'pay.opt1yr', price: 145, featuresKey: 'pay.renewFeat1yr', saveBadgeKey: 'pay.save40' },
];

export default function SubscriptionRenewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<RenewOption['id']>('6mo');

  const onRenew = () => {
    const plan = OPTIONS.find((o) => o.id === selected);
    if (!plan) return;
    navigation.navigate(Routes.PaymentMethod, { planId: plan.id, planName: t(plan.titleKey), amount: plan.price });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.renewHeader')}</Text>
        <View style={styles.walletBtn}>
          <Ionicons name="wallet" size={20} color={Colors.primary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mascot speech */}
        <View style={styles.mascotRow}>
          <View style={styles.mascotWrap}>
            <View style={styles.mascotAura} pointerEvents="none" />
            <LinearGradient colors={GRADIENT} style={styles.mascotCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="school" size={36} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{t('pay.renewMascot')}</Text>
          </View>
        </View>

        {/* Current plan */}
        <View style={styles.currentCard}>
          <View style={styles.currentOrb} pointerEvents="none" />
          <View style={styles.currentTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.currentLabel}>{t('pay.currentPackage')}</Text>
              <Text style={styles.currentName}>PREMIUM</Text>
            </View>
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>{t('pay.activeUpper')}</Text>
            </View>
          </View>
          <View style={styles.currentDateRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.currentDateText}>
              {t('pay.expiryPre')}<Text style={styles.currentDateBold}>15.01.2024</Text>
            </Text>
          </View>
        </View>

        {/* Options header */}
        <View style={{ gap: 4 }}>
          <Text style={styles.sectionTitle}>{t('pay.choosePackage')}</Text>
          <Text style={styles.sectionSub}>{t('pay.chooseSub')}</Text>
        </View>

        {/* Options */}
        <View style={{ gap: 14 }}>
          {OPTIONS.map((opt) => {
            const isSel = selected === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.9}
                style={[
                  styles.optionCard,
                  isSel && styles.optionCardSelected,
                  opt.popular && !isSel && styles.optionCardPopularIdle,
                ]}
                onPress={() => setSelected(opt.id)}
              >
                {opt.popular && (
                  <View style={styles.popularRibbon}>
                    <Text style={styles.popularRibbonText}>{t('pay.mostPopular')}</Text>
                  </View>
                )}
                <View style={styles.optionTop}>
                  <View style={styles.optionTitleRow}>
                    <View style={[styles.radioOuter, isSel && styles.radioOuterSel]}>
                      {isSel && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.optionTitle}>{t(opt.titleKey)}</Text>
                    {opt.saveBadgeKey && (
                      <View style={styles.saveBadge}>
                        <Text style={styles.saveBadgeText}>{t(opt.saveBadgeKey)}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionPrice}>{opt.price} AZN</Text>
                </View>
                <View style={styles.optionFeatures}>
                  {t(opt.featuresKey).split('|').map((f) => (
                    <View key={f} style={styles.optionFeatureRow}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                      <Text style={styles.optionFeatureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 8 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity activeOpacity={0.9} onPress={onRenew}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>{t('pay.renewNow')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  walletBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '14',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 24, gap: 24, paddingBottom: 140 },

  /* Mascot */
  mascotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  mascotWrap: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  mascotAura: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.primary + '14',
  },
  mascotCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 4,
  },
  bubble: {
    flex: 1,
    backgroundColor: Colors.surfaceLowest,
    padding: 16, borderRadius: 18, borderBottomLeftRadius: 4,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 1,
  },
  bubbleText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, lineHeight: 19 },

  /* Current plan */
  currentCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 22,
    overflow: 'hidden', position: 'relative', gap: 12,
  },
  currentOrb: {
    position: 'absolute', top: -32, right: -32,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primary + '12',
  },
  currentTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  currentLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4 },
  currentName: { fontSize: 24, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
  activeChip: {
    backgroundColor: Colors.tertiaryContainer + 'AA',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
  },
  activeChipText: { fontSize: 10, fontWeight: '800', color: Colors.tertiary, letterSpacing: 1.4 },
  currentDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  currentDateText: { fontSize: 13, color: Colors.textSecondary },
  currentDateBold: { fontWeight: '800', color: Colors.textPrimary },

  /* Section */
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  sectionSub: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  /* Option cards */
  optionCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1,
    position: 'relative', overflow: 'hidden',
  },
  optionCardPopularIdle: { borderColor: Colors.primary + '40' },
  optionCardSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 4,
  },
  popularRibbon: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12, paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  popularRibbonText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1, textTransform: 'uppercase' },

  optionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 },
  optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.outlineVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterSel: { borderColor: Colors.primary },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.primary },
  optionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  optionPrice: { fontSize: 18, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  saveBadge: { backgroundColor: Colors.tertiary + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  saveBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.tertiary, letterSpacing: 0.6 },

  optionFeatures: { gap: 6, marginLeft: 32 },
  optionFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  optionFeatureText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  /* Bottom CTA */
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 24, paddingTop: 14, paddingBottom: 24,
    backgroundColor: 'rgba(245,247,249,0.88)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  ctaBtn: {
    height: 56, borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
});
