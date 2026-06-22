import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { useMonetization } from '../../store/featureFlag.store';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface ReferralData {
  code: string;
  link: string;
  earnings: number;
}

interface ReferralFriend {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  rewardPaid: boolean;
  reward: number;
  joinedAt: string;
}

export default function ReferralScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const { payments: payVisible } = useMonetization();
  const { data, isLoading } = useQuery<ReferralData>({
    queryKey: ['referral'],
    queryFn: async () => {
      const res = await client.get('/referral/link');
      return res.data;
    },
  });
  const { data: friendsData } = useQuery<ReferralFriend[]>({
    queryKey: ['referral-friends'],
    queryFn: () => client.get('/referral/friends').then((r) => r.data).catch(() => [] as ReferralFriend[]),
  });
  const friends: ReferralFriend[] = Array.isArray(friendsData) ? friendsData : [];
  const totalEarned = friends.filter((f) => f.rewardPaid).reduce((s, f) => s + f.reward, 0);

  const invitedCount = friends.length;
  const registeredCount = friends.length;
  const now = Date.now();
  const activeCount = friends.filter((f) => {
    const d = new Date(f.joinedAt).getTime();
    return !isNaN(d) && now - d <= 30 * 24 * 60 * 60 * 1000;
  }).length;
  const payingCount = friends.filter((f) => f.rewardPaid).length;

  const displayLink = data?.link ?? 'kimi.az/invite/123';

  const handleShare = async () => {
    await Share.share({
      message: t('referral.shareMessage', { link: displayLink }),
      url: displayLink,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('referral.headerTitle')}</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8} onPress={handleShare}>
          <Ionicons name="ellipsis-vertical" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero card */}
          <View style={styles.heroCard}>
            <View style={styles.heroOrbTopRight} pointerEvents="none" />
            <View style={styles.heroOrbBottomLeft} pointerEvents="none" />
            <View style={styles.heroContent}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>{t('referral.heroPill')}</Text>
              </View>
              <Text style={styles.heroTitle}>{t('referral.heroTitle')}</Text>
              <Text style={styles.heroSub}>{t('referral.heroSub')}</Text>
            </View>
          </View>

          {/* Bonus balance */}
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
            <View style={styles.balanceOrbTopRight} pointerEvents="none" />
            <View style={styles.balanceOrbBottomLeft} pointerEvents="none" />
            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>{t('referral.balanceLabel')}</Text>
              <View style={styles.balanceAmountRow}>
                <Text style={styles.balanceAmount}>{totalEarned.toFixed(2)}</Text>
                <Text style={styles.balanceCurrency}>AZN</Text>
              </View>
              <View style={styles.balanceBtnRow}>
                {payVisible && (
                  <TouchableOpacity
                    style={styles.balanceBtnSolid}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate(Routes.Wallet)}
                  >
                    <Text style={styles.balanceBtnSolidText}>{t('referral.increaseBalance')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.balanceBtnGhost}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate(Routes.ReferralBalance)}
                >
                  <Text style={styles.balanceBtnGhostText}>{t('referral.details')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Referral link */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('referral.linkLabel')}</Text>
            <View style={styles.linkPill}>
              <Text style={styles.linkText} numberOfLines={1}>{displayLink}</Text>
              <TouchableOpacity style={styles.copyChip} onPress={handleShare} activeOpacity={0.85}>
                <Ionicons name="copy-outline" size={14} color={Colors.primary} />
                <Text style={styles.copyChipText}>{t('referral.copy')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.9} onPress={handleShare}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shareCta}>
                <Ionicons name="share-social-outline" size={20} color="#fff" />
                <Text style={styles.shareCtaText}>{t('referral.shareLink')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Statistics */}
          <View style={styles.section}>
            <View style={styles.statsHeader}>
              <Text style={styles.sectionLabel}>{t('referral.statistics')}</Text>
              <View style={styles.statsPill}>
                <View style={styles.statsDot} />
                <Text style={styles.statsPillText}>{t('referral.last30Days')}</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <StatCard icon="people-outline" iconColor={Colors.primary} iconBg="#EFF8FE" value={invitedCount} label={t('referral.statInvited')} />
              <StatCard icon="person-add-outline" iconColor="#4F46E5" iconBg="#EEF2FF" value={registeredCount} label={t('referral.statRegistered')} />
              <StatCard icon="flash-outline" iconColor="#059669" iconBg="#ECFDF5" value={activeCount} label={t('referral.statActive')} />
              <StatCard icon="card-outline" iconColor="#D97706" iconBg="#FFFBEB" value={payingCount} label={t('referral.statPaying')} highlight />
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function StatCard({ icon, iconColor, iconBg, value, label, highlight }: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
      <View style={[styles.statIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary, flex: 1, textAlign: 'left', marginLeft: 8 },

  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32, gap: 40 },

  /* Hero */
  heroCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 24, padding: 40,
    overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 30, elevation: 2,
    alignItems: 'center',
  },
  heroContent: { alignItems: 'center', gap: 14, zIndex: 1 },
  heroPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
    backgroundColor: Colors.primary + '1A',
  },
  heroPillText: { fontSize: 10, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.6 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', lineHeight: 32, letterSpacing: -0.6 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 260 },
  heroOrbTopRight: {
    position: 'absolute', top: -64, right: -64,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primary + '0D',
  },
  heroOrbBottomLeft: {
    position: 'absolute', bottom: -48, left: -48,
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 1, borderColor: Colors.primary + '1A',
  },

  /* Balance */
  balanceCard: {
    borderRadius: 24, padding: 32,
    overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.2, shadowRadius: 28, elevation: 6,
  },
  balanceContent: { zIndex: 1 },
  balanceOrbTopRight: {
    position: 'absolute', top: -48, right: -48,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  balanceOrbBottomLeft: {
    position: 'absolute', bottom: -32, left: -32,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  balanceLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: 8 },
  balanceAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 28 },
  balanceAmount: { fontSize: 48, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  balanceCurrency: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  balanceBtnRow: { flexDirection: 'row', gap: 10 },
  balanceBtnSolid: {
    backgroundColor: '#fff',
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2,
  },
  balanceBtnSolidText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  balanceBtnGhost: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999,
  },
  balanceBtnGhostText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  /* Section / Link */
  section: { gap: 18 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: Colors.textPrimary,
    textTransform: 'uppercase', letterSpacing: 1.5,
    paddingHorizontal: 4,
  },
  linkPill: {
    backgroundColor: Colors.surfaceLow,
    paddingLeft: 22, paddingRight: 6, paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },
  linkText: { flex: 1, fontSize: 13, fontWeight: '800', color: Colors.primary },
  copyChip: {
    backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  copyChipText: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 0.6 },
  shareCta: {
    height: 56, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  shareCtaText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  /* Stats */
  statsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
  },
  statsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  statsPillText: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  statCard: {
    width: '47%',
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 22,
    borderWidth: 1, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  statCardHighlight: { borderWidth: 2, borderColor: Colors.primary + '14' },
  statIconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.4 },
});
