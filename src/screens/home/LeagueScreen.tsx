import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { getExamResults, getCertificates } from '../../api/certificate.api';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Tier = {
  key: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  nameKey: string;
  min: number;
  max: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
};

const TIERS: Tier[] = [
  { key: 'bronze',   nameKey: 'league.tierBronze',   min: 0,    max: 500,        icon: 'medal',    iconBg: '#FFEDD5', iconColor: '#C2410C' },
  { key: 'silver',   nameKey: 'league.tierSilver',   min: 500,  max: 1000,       icon: 'medal',    iconBg: '#E2E8F0', iconColor: '#475569' },
  { key: 'gold',     nameKey: 'league.tierGold',     min: 1000, max: 2000,       icon: 'trophy',   iconBg: '#FEF3C7', iconColor: '#D97706' },
  { key: 'platinum', nameKey: 'league.tierPlatinum', min: 2000, max: 5000,       icon: 'diamond',  iconBg: '#E0E7FF', iconColor: '#6366F1' },
  { key: 'diamond',  nameKey: 'league.tierDiamond',  min: 5000, max: Infinity,   icon: 'sparkles', iconBg: '#CFFAFE', iconColor: '#0891B2' },
];

function tierFor(xp: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

export default function LeagueScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);

  const { data: results = [] } = useQuery({ queryKey: ['examResults'], queryFn: getExamResults });
  const { data: certs = [] } = useQuery({ queryKey: ['certificates'], queryFn: getCertificates });

  const totalXp = useMemo(() => {
    const examXp = results.reduce((s, r) => s + r.score * 10, 0);
    const certXp = certs.length * 100;
    return examXp + certXp;
  }, [results, certs]);

  const totalScore = useMemo(() => results.reduce((s, r) => s + r.score, 0), [results]);

  const current = tierFor(totalXp);
  const nextIdx = TIERS.findIndex((t) => t.key === current.key) + 1;
  const next = nextIdx < TIERS.length ? TIERS[nextIdx] : null;
  const tierProgress = next
    ? Math.min(100, Math.round(((totalXp - current.min) / (current.max - current.min)) * 100))
    : 100;
  const xpToNext = next ? Math.max(0, next.min - totalXp) : 0;

  const goToExams = () => {
    navigation.getParent()?.navigate('Exams');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="trophy" size={20} color={Colors.primary} />
            <Text style={styles.headerTitle}>{t('league.headerTitle')}</Text>
          </View>
        </View>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero: current league */}
        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <View style={styles.heroAura} pointerEvents="none" />
          <View style={styles.heroIconCircle}>
            <Ionicons name={current.icon} size={68} color="#FCD34D" />
          </View>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <Text style={styles.heroKicker}>{t('league.heroKicker')}</Text>
            <Text style={styles.heroTier}>{t('league.heroTier', { name: t(current.nameKey) })}</Text>
          </View>
          <View style={{ width: '100%', gap: 10, marginTop: 24 }}>
            <View style={styles.heroXpRow}>
              <Text style={styles.heroXpValue}>{totalXp.toLocaleString()} XP</Text>
              {next && (
                <Text style={styles.heroXpNext}>{t('league.nextLeagueXp', { name: t(next.nameKey), xp: next.min.toLocaleString() })}</Text>
              )}
            </View>
            <View style={styles.heroTrack}>
              <View style={[styles.heroFill, { width: `${tierProgress}%` }]} />
            </View>
            <View style={styles.heroHintPill}>
              <Text style={styles.heroHintText}>
                {next
                  ? t('league.hintToNext', { xp: xpToNext.toLocaleString() })
                  : t('league.hintMax')}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats bento */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderBottomColor: Colors.primaryFixed + '33' }]}>
            <Ionicons name="star" size={22} color={Colors.primary} />
            <Text style={styles.statLabel}>{t('league.statTotalXp')}</Text>
            <Text style={styles.statValue}>{totalXp.toLocaleString()}</Text>
          </View>
          <View style={[styles.statCard, { borderBottomColor: Colors.tertiary + '33' }]}>
            <Ionicons name="podium" size={22} color={Colors.tertiary} />
            <Text style={styles.statLabel}>{t('league.statTotalScore')}</Text>
            <Text style={styles.statValue}>{totalScore}</Text>
          </View>
        </View>

        {/* Tier progression */}
        <View style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>{t('league.sectionTitle')}</Text>
          {TIERS.map((tier) => {
            const passed = totalXp >= tier.max;
            const active = tier.key === current.key;
            const locked = totalXp < tier.min;
            return (
              <View
                key={tier.key}
                style={[
                  styles.tierRow,
                  active && styles.tierRowActive,
                  locked && styles.tierRowLocked,
                ]}
              >
                <View style={[styles.tierIconCircle, { backgroundColor: tier.iconBg }]}>
                  <Ionicons name={tier.icon} size={22} color={tier.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tierName, active && { color: Colors.primary }]}>{t(tier.nameKey)}</Text>
                  <Text style={[styles.tierRange, active && { color: Colors.primary }]}>
                    {t('league.tierRange', { min: tier.min.toLocaleString(), max: tier.max === Infinity ? '∞' : tier.max.toLocaleString() })}
                    {active && ` • ${t('league.nowHere')}`}
                  </Text>
                </View>
                {active ? (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{t('league.activeBadge')}</Text>
                  </View>
                ) : passed ? (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.tertiary} />
                ) : (
                  <Ionicons name="lock-closed" size={20} color={Colors.outlineVariant} />
                )}
              </View>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={goToExams} style={{ marginTop: 4 }}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
            <Ionicons name="flash" size={22} color="#fff" />
            <Text style={styles.ctaText}>{t('league.ctaText')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  avatarSmall: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarSmallText: { fontSize: 13, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 20, paddingBottom: 32, gap: 24 },

  /* Hero */
  heroCard: {
    borderRadius: 28, padding: 28, alignItems: 'center', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32, elevation: 6,
  },
  heroAura: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroIconCircle: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroKicker: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 2 },
  heroTier: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginTop: 6 },
  heroXpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  heroXpValue: { fontSize: 16, fontWeight: '800', color: '#fff' },
  heroXpNext: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  heroTrack: { width: '100%', height: 10, backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 999, overflow: 'hidden' },
  heroFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },
  heroHintPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  heroHintText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 18,
    padding: 18, alignItems: 'center', gap: 4,
    borderBottomWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.03, shadowRadius: 14, elevation: 2,
  },
  statLabel: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.8 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },

  /* Tier list */
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, paddingHorizontal: 4 },
  tierRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  tierRowActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryFixed + '66',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4,
  },
  tierRowLocked: { opacity: 0.55 },
  tierIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  tierName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  tierRange: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  activeBadge: {
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1.2 },

  /* CTA */
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 18, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  demoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 999,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.primary + '33',
    borderStyle: 'dashed',
  },
  demoBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
