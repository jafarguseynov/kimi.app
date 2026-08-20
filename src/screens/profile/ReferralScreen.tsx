import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Clipboard,
  Alert,
  Modal,
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
import { useUserStore } from '../../store/user.store';

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
  const me = useUserStore((s) => s.user);
  const [listOpen, setListOpen] = useState(false);
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

  const displayLink = data?.link ?? '';
  const displayCode = data?.code ?? '';

  const firstName = ((me?.name ?? '') as string).trim().split(/\s+/)[0] ?? '';

  const handleShare = async () => {
    if (!displayLink) return;
    // Göndərənin adından şəxsi mesaj; ad yoxdursa neytral variant.
    const message = firstName
      ? t('referral.shareMessage', { name: firstName, code: displayCode, link: displayLink })
      : t('referral.shareMessageNoName', { code: displayCode, link: displayLink });
    await Share.share({ message, url: displayLink });
  };

  const handleCopy = () => {
    if (!displayLink) return;
    Clipboard.setString(displayLink);
    Alert.alert(t('referral.copiedTitle'), t('referral.copiedMsg'));
  };

  const handleCopyCode = () => {
    if (!displayCode) return;
    Clipboard.setString(displayCode);
    Alert.alert(t('referral.copiedTitle'), t('referral.codeCopiedMsg'));
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
          <LinearGradient colors={['#00476b', '#0077b6', '#4cc9f0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
            <View style={styles.balanceOrbTopRight} pointerEvents="none" />
            <View style={styles.balanceOrbBottomLeft} pointerEvents="none" />
            <View style={styles.balanceGiftChip} pointerEvents="none">
              <Ionicons name="gift" size={22} color="#fff" />
            </View>
            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>{t('referral.balanceLabel')}</Text>
              <View style={styles.balanceAmountRow}>
                <Text style={styles.balanceAmount}>{totalEarned.toFixed(2)}</Text>
                <Text style={styles.balanceCurrency}>AZN</Text>
              </View>
              <View style={styles.balanceBtnRow}>
                <TouchableOpacity
                  style={styles.balanceBtnGhost}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate(Routes.ReferralBalance)}
                >
                  <Text style={styles.balanceBtnGhostText}>{t('referral.details')}</Text>
                  <Ionicons name="chevron-forward" size={15} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Referral code */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('referral.codeLabel')}</Text>
            <View style={styles.codePill}>
              <View style={[styles.pillIconChip, { backgroundColor: '#EAF4FF' }]}>
                <Ionicons name="pricetag" size={16} color="#0077b6" />
              </View>
              <Text style={styles.codeText} numberOfLines={1}>{displayCode || '—'}</Text>
              <TouchableOpacity style={styles.copyChip} onPress={handleCopyCode} activeOpacity={0.85}>
                <Ionicons name="copy-outline" size={14} color={Colors.primary} />
                <Text style={styles.copyChipText}>{t('referral.copy')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Referral link */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('referral.linkLabel')}</Text>
            <View style={styles.linkPill}>
              <View style={[styles.pillIconChip, { backgroundColor: '#E7F8F0' }]}>
                <Ionicons name="link" size={16} color="#0a8f5f" />
              </View>
              <Text style={styles.linkText} numberOfLines={1}>{displayLink}</Text>
              <TouchableOpacity style={styles.copyChip} onPress={handleCopy} activeOpacity={0.85}>
                <Ionicons name="copy-outline" size={14} color={Colors.primary} />
                <Text style={styles.copyChipText}>{t('referral.copy')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.9} onPress={handleShare}>
              <LinearGradient colors={['#00476b', '#0077b6', '#4cc9f0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shareCta}>
                <Ionicons name="share-social" size={20} color="#fff" />
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
              <StatCard icon="people" accent="#0077b6" tint="#EAF4FF" value={invitedCount} label={t('referral.statInvited')} onPress={() => setListOpen(true)} />
              <StatCard icon="person-add" accent="#4F46E5" tint="#EEF2FF" value={registeredCount} label={t('referral.statRegistered')} />
              <StatCard icon="flash" accent="#0a8f5f" tint="#E7F8F0" value={activeCount} label={t('referral.statActive')} />
              <StatCard icon="card" accent="#D97706" tint="#FFF7E6" value={payingCount} label={t('referral.statPaying')} />
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Dəvət olunanların siyahısı + status */}
      <Modal visible={listOpen} transparent animationType="slide" onRequestClose={() => setListOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setListOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('referral.invitedListTitle')}</Text>
            {friends.length === 0 ? (
              <View style={styles.modalEmptyWrap}>
                <Ionicons name="people-outline" size={40} color={Colors.outlineVariant} />
                <Text style={styles.modalEmpty}>{t('referral.invitedEmpty')}</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {friends.map((f) => {
                  const paid = f.rewardPaid;
                  let dateLabel = '';
                  try { dateLabel = new Date(f.joinedAt).toLocaleDateString(); } catch { /* ignore */ }
                  return (
                    <View key={f.id} style={styles.friendRow}>
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendInitial}>{f.name?.[0]?.toUpperCase() ?? '?'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.friendName} numberOfLines={1}>{f.name || '—'}</Text>
                        {!!dateLabel && <Text style={styles.friendMeta}>{dateLabel}</Text>}
                      </View>
                      <View style={[styles.friendBadge, { backgroundColor: paid ? '#E7F8F0' : '#FFF7E6' }]}>
                        <View style={[styles.friendDot, { backgroundColor: paid ? '#0a8f5f' : '#D97706' }]} />
                        <Text style={[styles.friendBadgeText, { color: paid ? '#0a8f5f' : '#D97706' }]}>
                          {paid ? t('referral.statusPaid') : t('referral.statusRegistered')}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.modalClose} onPress={() => setListOpen(false)} activeOpacity={0.85}>
              <Text style={styles.modalCloseText}>{t('referral.close')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({ icon, accent, tint, value, label, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  tint: string;
  value: number;
  label: string;
  onPress?: () => void;
}) {
  const inner = (
    <LinearGradient
      colors={[tint, '#ffffff']}
      start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      style={[styles.statCard, { borderColor: accent + '22', shadowColor: accent }]}
    >
      <View style={styles.statTopRow}>
        <View style={[styles.statIconBox, { backgroundColor: accent }]}>
          <Ionicons name={icon} size={20} color="#fff" />
        </View>
        {onPress && <Ionicons name="chevron-forward-circle" size={22} color={accent} style={{ opacity: 0.9 }} />}
      </View>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );
  return onPress ? (
    <TouchableOpacity style={styles.statCardWrap} activeOpacity={0.85} onPress={onPress}>{inner}</TouchableOpacity>
  ) : (
    <View style={styles.statCardWrap}>{inner}</View>
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
  balanceGiftChip: {
    position: 'absolute', top: 22, right: 22,
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    zIndex: 2,
  },
  balanceBtnRow: { flexDirection: 'row', gap: 10 },
  balanceBtnSolid: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2,
  },
  balanceBtnSolidText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  balanceBtnGhost: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 999,
  },
  balanceBtnGhostText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  /* Section / Link */
  section: { gap: 18 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: Colors.textPrimary,
    textTransform: 'uppercase', letterSpacing: 1.5,
    paddingHorizontal: 4,
  },
  pillIconChip: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  linkPill: {
    backgroundColor: '#fff',
    paddingLeft: 8, paddingRight: 6, paddingVertical: 6,
    borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  linkText: { flex: 1, fontSize: 13, fontWeight: '800', color: Colors.primary },
  codePill: {
    backgroundColor: '#fff',
    paddingLeft: 8, paddingRight: 6, paddingVertical: 6,
    borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  codeText: { flex: 1, fontSize: 18, fontWeight: '900', color: Colors.primary, letterSpacing: 3, textTransform: 'uppercase' },
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
  statCardWrap: { width: '47%' },
  statCard: {
    borderRadius: 20, padding: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 14, elevation: 3,
  },
  statTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  statIconBox: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 30, fontWeight: '900', marginBottom: 4, letterSpacing: -0.5 },
  statLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2 },

  /* Invited list modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 30 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.surfaceHigh, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary, marginBottom: 16 },
  modalEmptyWrap: { alignItems: 'center', gap: 10, paddingVertical: 30 },
  modalEmpty: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  friendAvatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  friendInitial: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  friendName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  friendMeta: { fontSize: 11, fontWeight: '500', color: Colors.textMuted, marginTop: 2 },
  friendBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  friendDot: { width: 6, height: 6, borderRadius: 3 },
  friendBadgeText: { fontSize: 11, fontWeight: '800' },
  modalClose: { marginTop: 18, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 999, backgroundColor: Colors.surfaceLow },
  modalCloseText: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
});
