import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type RewardKind = 'xp' | 'premium';

interface RewardEntry {
  id: string;
  kind: RewardKind;
  title: string;
  source: string;
  amount: string;
  when: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}

const TOTAL_XP = 2450;
const PREMIUM_DAYS = 15;
const LEVEL = 12;

const HISTORY: RewardEntry[] = [
  { id: '1', kind: 'xp', title: 'XP qazandın', source: 'Gündəlik tapşırıq tamamlandı', amount: '+50 XP', when: 'Bu gün', icon: 'star', iconBg: Colors.primaryLight, iconColor: Colors.primary },
  { id: '2', kind: 'premium', title: 'Premium qazandın', source: 'Hədiyyə çarxı uduşu', amount: '+3 gün', when: 'Dünən', icon: 'ribbon', iconBg: Colors.warningLight, iconColor: Colors.warning },
  { id: '3', kind: 'xp', title: 'XP qazandın', source: 'İmtahan nəticəsi: Əla', amount: '+100 XP', when: '15.05.2026', icon: 'sparkles', iconBg: Colors.primaryLight, iconColor: Colors.primary },
  { id: '4', kind: 'xp', title: 'XP qazandın', source: 'Duel qələbəsi vs Nicat', amount: '+50 XP', when: '12.05.2026', icon: 'flash', iconBg: Colors.primaryLight, iconColor: Colors.primary },
  { id: '5', kind: 'premium', title: 'Premium qazandın', source: 'Həftəlik missiya', amount: '+1 gün', when: '10.05.2026', icon: 'ribbon', iconBg: Colors.warningLight, iconColor: Colors.warning },
];

export default function RewardHistoryScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('rewardHistory.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.heroLabel}>{t('rewardHistory.heroLabel')}</Text>

          <View style={styles.heroBlock}>
            <View style={styles.heroRow}>
              <Text style={styles.heroValue}>{TOTAL_XP.toLocaleString('az-AZ')}<Text style={styles.heroUnit}>{t('rewardHistory.unitXp')}</Text></Text>
              <View style={styles.levelBadge}>
                <Ionicons name="medal" size={14} color="#fff" />
                <Text style={styles.levelText}>{t('rewardHistory.level', { n: LEVEL })}</Text>
              </View>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroRow}>
              <Text style={styles.heroValue}>{PREMIUM_DAYS}<Text style={styles.heroUnit}>{t('rewardHistory.unitDays')}</Text></Text>
              <Text style={styles.heroSub}>{t('rewardHistory.premiumStatus')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* List header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t('rewardHistory.listTitle')}</Text>
          <Ionicons name="filter" size={20} color={Colors.outline} />
        </View>

        {/* Transactions */}
        <View style={{ gap: 12 }}>
          {HISTORY.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: r.iconBg }]}>
                <Ionicons name={r.icon} size={20} color={r.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{r.title}</Text>
                <Text style={styles.cardSub}>{r.source}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.amount, { color: r.kind === 'xp' ? Colors.primary : Colors.warning }]}>
                  {r.amount}
                </Text>
                <Text style={styles.when}>{r.when}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Empty state helper */}
        <View style={styles.helper}>
          <Text style={styles.helperText}>{t('rewardHistory.helperText')}</Text>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.DailyMissions)}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.helperBtn}>
              <Text style={styles.helperBtnText}>{t('rewardHistory.helperBtn')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 20, paddingBottom: 40, gap: 24 },

  hero: {
    borderRadius: 24, padding: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6,
  },
  heroLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, textTransform: 'uppercase' },
  heroBlock: { marginTop: 20, gap: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  heroValue: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.8 },
  heroUnit: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  heroSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  levelText: { fontSize: 11, fontWeight: '800', color: '#fff' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 18, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  iconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  cardSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '900' },
  when: { fontSize: 9, color: Colors.textMuted, marginTop: 2, letterSpacing: 0.8, textTransform: 'uppercase' },

  helper: {
    backgroundColor: Colors.surfaceLow, borderRadius: 18, padding: 24,
    alignItems: 'center', gap: 16,
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.borderLight,
  },
  helperText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  helperBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 999 },
  helperBtnText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 1.2 },
});
