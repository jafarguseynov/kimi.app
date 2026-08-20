import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
const DATE_LOCALE: Record<string, string> = { az: 'az-Latn-AZ', ru: 'ru-RU', en: 'en-US' };

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

function formatDate(iso: string, lang: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(DATE_LOCALE[lang] ?? 'az-Latn-AZ', { day: '2-digit', month: 'long' });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ReferralBalanceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t, language } = useTranslation();
  const { withdrawals: withdrawVisible } = useMonetization();

  const { data, isLoading } = useQuery<ReferralData>({
    queryKey: ['referral'],
    queryFn: () => client.get('/referral/link').then((r) => r.data),
  });

  const { data: friendsData } = useQuery<ReferralFriend[]>({
    queryKey: ['referral-friends'],
    queryFn: () =>
      client.get('/referral/friends').then((r) => r.data).catch(() => [] as ReferralFriend[]),
  });

  const friends: ReferralFriend[] = Array.isArray(friendsData) ? friendsData : [];
  const paidFriends = friends.filter((f) => f.rewardPaid);
  const availableBalance = paidFriends.reduce((s, f) => s + f.reward, 0);
  // "Toplam Qazanc" yalnız REAL ÖDƏNMİŞ komissiyadır. Gözləmədəki mükafatlar (dəvət
  // olunan hələ paket almayıb) qazanc sayılmır — yalnız qeydiyyat komissiya vermir.
  const totalEarned = availableBalance;
  const invitedCount = friends.length;

  const sortedFriends = [...friends].sort((a, b) => {
    const da = new Date(a.joinedAt).getTime();
    const db = new Date(b.joinedAt).getTime();
    return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da);
  });
  const recentFriends = sortedFriends.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('referralBalance.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero balance */}
          <LinearGradient
            colors={GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroOrb} pointerEvents="none" />
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>{t('referralBalance.availableBalance')}</Text>
              <View style={styles.heroAmountRow}>
                <Text style={styles.heroAmount}>{availableBalance.toFixed(2)}</Text>
                <Text style={styles.heroCurrency}>AZN</Text>
              </View>
              {withdrawVisible && (
                <TouchableOpacity
                  style={styles.withdrawBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate(Routes.Withdrawal)}
                >
                  <Text style={styles.withdrawBtnText}>{t('referralBalance.withdraw')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {/* Bento stats */}
          <View style={styles.bentoGrid}>
            <View style={styles.bentoCard}>
              <View style={[styles.bentoIcon, { backgroundColor: Colors.tertiaryContainer + '60' }]}>
                <Ionicons name="ribbon" size={20} color={Colors.tertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bentoLabel}>{t('referralBalance.totalEarned')}</Text>
                <Text style={styles.bentoValue}>{totalEarned.toFixed(2)} AZN</Text>
                {/* Gözləmədə "məbləğ" göstərilmir — komissiya yalnız dəvət olunan
                    paket alanda, paketə görə müəyyən olunur (qeydiyyat bonus vermir). */}
              </View>
            </View>
            <View style={styles.bentoCard}>
              <View style={[styles.bentoIcon, { backgroundColor: Colors.primary + '1A' }]}>
                <Ionicons name="people" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bentoLabel}>{t('referralBalance.invited')}</Text>
                <Text style={styles.bentoValue}>{t('referralBalance.invitedCount', { count: invitedCount })}</Text>
              </View>
            </View>
          </View>

          {/* Kimi tip */}
          <View style={styles.tipCard}>
            <View style={styles.tipAvatarWrap}>
              <View style={styles.tipAvatar}>
                <Ionicons name="sparkles" size={26} color={Colors.primary} />
              </View>
              <View style={styles.tipBadge} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.tipTitle}>{t('referralBalance.tipTitle')}</Text>
              <Text style={styles.tipText}>
                {t('referralBalance.tipPre')}
                <Text style={styles.tipBold}>{t('referralBalance.tipBold')}</Text>{t('referralBalance.tipPost')}
              </Text>
            </View>
          </View>

          {/* Earnings history */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('referralBalance.historyTitle')}</Text>
              {sortedFriends.length > 5 && (
                <TouchableOpacity hitSlop={8} onPress={() => navigation.navigate(Routes.Referral)}>
                  <Text style={styles.sectionLink}>{t('referralBalance.seeAll')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentFriends.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={36} color={Colors.outlineVariant} />
                <Text style={styles.emptyText}>{t('referralBalance.emptyText')}</Text>
                <Text style={styles.emptySub}>{t('referralBalance.emptySub')}</Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {recentFriends.map((f) => (
                  <View key={f.id} style={[styles.txRow, !f.rewardPaid && { opacity: 0.85 }]}>
                    <View style={styles.txLeft}>
                      <View style={styles.txAvatar}>
                        <Text style={styles.txAvatarText}>{initials(f.name)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.txName} numberOfLines={1}>{f.name}</Text>
                        <View style={styles.txStatusRow}>
                          <View style={[styles.txDot, { backgroundColor: f.rewardPaid ? Colors.tertiary : '#F59E0B' }]} />
                          <Text style={styles.txStatus}>
                            {f.rewardPaid ? t('referralBalance.statusSuccess') : t('referralBalance.statusPending')} • {formatDate(f.joinedAt, language)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {/* Ödəniş yalnız dəvət olunan paket alanda gəlir — o vaxta qədər
                        heç bir məbləğ göstərilmir (qeydiyyat bonus vermir). */}
                    {f.rewardPaid ? (
                      <Text style={styles.txAmount}>+{f.reward.toFixed(2)} AZN</Text>
                    ) : (
                      <Text style={[styles.txAmount, { color: Colors.textSecondary, fontWeight: '600' }]}>—</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 24, gap: 24, paddingBottom: 32 },

  /* Hero balance */
  heroCard: {
    borderRadius: 24, padding: 32, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 28, elevation: 6,
  },
  heroOrb: {
    position: 'absolute', top: -64, right: -64,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: { alignItems: 'center', zIndex: 1 },
  heroLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  heroAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 28 },
  heroAmount: { fontSize: 48, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  heroCurrency: { fontSize: 20, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  withdrawBtn: {
    backgroundColor: '#fff', borderRadius: 999,
    paddingHorizontal: 48, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2,
  },
  withdrawBtnText: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  /* Bento */
  bentoGrid: { gap: 12 },
  bentoCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  bentoIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  bentoLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 2 },
  bentoValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  bentoPending: { fontSize: 10, fontWeight: '700', color: '#F59E0B', marginTop: 2 },

  /* Tip */
  tipCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 18,
    padding: 18,
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  tipAvatarWrap: { position: 'relative' },
  tipAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  tipBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.tertiary, borderWidth: 2, borderColor: '#fff',
  },
  tipTitle: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  tipText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  tipBold: { fontWeight: '800', color: Colors.textPrimary },

  /* Section */
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  sectionLink: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  /* Empty */
  empty: {
    alignItems: 'center', gap: 6, paddingVertical: 24,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18,
    paddingHorizontal: 24,
  },
  emptyText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginTop: 6 },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },

  /* Transaction */
  txRow: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  txAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  txAvatarText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  txName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  txStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  txDot: { width: 6, height: 6, borderRadius: 3 },
  txStatus: { fontSize: 11, color: Colors.textSecondary },
  txAmount: { fontSize: 14, fontWeight: '800', color: Colors.tertiary },
});
