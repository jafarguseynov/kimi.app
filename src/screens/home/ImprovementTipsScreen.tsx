import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface Tip {
  id: string;
  titleKey: string;
  subKey?: string;
  badgeKey?: string;
  badgeIcon?: keyof typeof Ionicons.glyphMap;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  ctaKey: string;
  primary?: boolean;
}

const TIPS: Tip[] = [
  {
    id: 't1',
    titleKey: 'improvementTips.t1Title',
    badgeKey: 'improvementTips.t1Badge',
    badgeIcon: 'trending-up',
    icon: 'flash',
    iconBg: '#DCFCE7',
    iconColor: '#16a34a',
    ctaKey: 'improvementTips.t1Cta',
    primary: true,
  },
  {
    id: 't2',
    titleKey: 'improvementTips.t2Title',
    subKey: 'improvementTips.t2Sub',
    icon: 'albums',
    iconBg: '#DBEAFE',
    iconColor: '#2563eb',
    ctaKey: 'improvementTips.t2Cta',
  },
  {
    id: 't3',
    titleKey: 'improvementTips.t3Title',
    subKey: 'improvementTips.t3Sub',
    icon: 'time',
    iconBg: '#FFEDD5',
    iconColor: '#ea580c',
    ctaKey: 'improvementTips.t3Cta',
  },
];

export default function ImprovementTipsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('improvementTips.headerTitle')}</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} hitSlop={8}>
          <Ionicons name="notifications" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero text */}
        <View style={{ gap: 8 }}>
          <Text style={styles.h1}>{t('improvementTips.h1')}</Text>
          <Text style={styles.h1Sub}>{t('improvementTips.h1Sub')}</Text>
        </View>

        {/* Main AI card */}
        <View style={styles.aiCard}>
          <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.aiStripe} />
          <View style={styles.aiIcon}>
            <Ionicons name="hardware-chip" size={28} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>{t('improvementTips.aiTitle')}</Text>
            <Text style={styles.aiSub}>{t('improvementTips.aiSub')}</Text>
          </View>
        </View>

        {/* Tip cards */}
        <View style={{ gap: 16 }}>
          {TIPS.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: tip.iconBg }]}>
                <Ionicons name={tip.icon} size={22} color={tip.iconColor} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.tipTitle}>{t(tip.titleKey)}</Text>
                {tip.subKey && <Text style={styles.tipSub}>{t(tip.subKey)}</Text>}
                {tip.badgeKey && (
                  <View style={styles.badgeRow}>
                    {tip.badgeIcon && <Ionicons name={tip.badgeIcon} size={12} color="#15803d" />}
                    <Text style={styles.badgeText}>{t(tip.badgeKey)}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.tipBtn, tip.primary && styles.tipBtnPrimary]}
              >
                <Text style={[styles.tipBtnText, tip.primary && styles.tipBtnTextPrimary]}>{t(tip.ctaKey)}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant + '80',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary, letterSpacing: -0.3 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 16, paddingTop: 24, gap: 28 },

  h1: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  h1Sub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  aiCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 20,
    flexDirection: 'row', gap: 16,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '4D',
    position: 'relative', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
  },
  aiStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  aiIcon: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  aiTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  aiSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '4D',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12,
  },
  tipIcon: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  tipTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  tipSub: { fontSize: 13, color: Colors.textSecondary },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#15803d' },

  tipBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
  },
  tipBtnPrimary: { backgroundColor: Colors.primary },
  tipBtnText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  tipBtnTextPrimary: { color: '#fff' },
});
