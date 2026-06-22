import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { getWallet, getTransactions, type TransactionItem } from '../../api/payment.api';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const DATE_LOCALE: Record<string, string> = { az: 'az-AZ', ru: 'ru-RU', en: 'en-US' };

type TxIcon = 'wallet-outline' | 'time-outline' | 'alert-circle-outline';

interface StatusConfig {
  labelKey: string;
  badgeBg: string;
  badgeColor: string;
  iconBg: string;
  icon: TxIcon;
}

const STATUS_CFG: Record<string, StatusConfig> = {
  completed: {
    labelKey: 'pay.statusCompleted',
    badgeBg: '#d1fae5',
    badgeColor: '#059669',
    iconBg: '#d1fae5',
    icon: 'wallet-outline',
  },
  pending: {
    labelKey: 'pay.statusPending',
    badgeBg: '#fef9c3',
    badgeColor: '#ca8a04',
    iconBg: '#fef9c3',
    icon: 'time-outline',
  },
  rejected: {
    labelKey: 'pay.statusRejected',
    badgeBg: '#fee2e2',
    badgeColor: '#dc2626',
    iconBg: '#fee2e2',
    icon: 'alert-circle-outline',
  },
};

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(DATE_LOCALE[lang] ?? 'az-AZ', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function PayoutHistoryScreen() {
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const [balance, setBalance] = useState<number>(0);
  const [withdrawals, setWithdrawals] = useState<TransactionItem[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [monthEarned, setMonthEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      const [wallet, txs] = await Promise.all([getWallet(), getTransactions()]);
      setBalance(wallet.balance);

      const earnTxs = txs.filter((t) => t.type === 'earn');
      setTotalEarned(earnTxs.reduce((sum, t) => sum + t.amount, 0));

      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      setMonthEarned(earnTxs.filter((t) => new Date(t.createdAt).getTime() > monthAgo).reduce((sum, t) => sum + t.amount, 0));

      setWithdrawals(txs.filter((t) => t.type === 'withdraw'));
    } catch {
      // keep state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.payoutHeader')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
      >
        {/* Summary banner */}
        <View style={styles.bannerWrap}>
          <LinearGradient colors={GRADIENT} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.bannerLabel}>{t('pay.totalEarningsBig')}</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginVertical: 8 }} />
            ) : (
              <Text style={styles.bannerTotal}>{totalEarned.toFixed(2)} AZN</Text>
            )}
            <View style={styles.bannerStats}>
              <View style={styles.bannerStatBox}>
                <Text style={styles.bannerStatKey}>{t('pay.thisMonth')}</Text>
                <Text style={styles.bannerStatVal}>+{monthEarned.toFixed(2)} AZN</Text>
              </View>
              <View style={styles.bannerStatBox}>
                <Text style={styles.bannerStatKey}>{t('pay.balanceLabel')}</Text>
                <Text style={styles.bannerStatVal}>{balance.toFixed(2)} AZN</Text>
              </View>
            </View>
          </LinearGradient>
          <View style={styles.insightPill}>
            <Ionicons name="sparkles-outline" size={14} color={Colors.primaryFixed} />
            <Text style={styles.insightPillText}>{t('pay.yourWithdrawHistory')}</Text>
          </View>
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('pay.withdrawalsTitle')}</Text>
          <View style={styles.sectionChip}>
            <Text style={styles.sectionChipText}>{t('pay.txCount', { n: withdrawals.length })}</Text>
          </View>
        </View>

        {/* Transaction list */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : withdrawals.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color={Colors.primaryFixed} />
            <Text style={styles.emptyTitle}>{t('pay.noWithdrawTitle')}</Text>
            <Text style={styles.emptySub}>{t('pay.noWithdrawSub')}</Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {withdrawals.map((tx) => {
              const cfg = STATUS_CFG['completed'];
              return (
                <View key={tx.id} style={styles.txCard}>
                  <View style={styles.txTop}>
                    <View style={styles.txLeft}>
                      <View style={[styles.txIconWrap, { backgroundColor: cfg.iconBg }]}>
                        <Ionicons name={cfg.icon} size={24} color={cfg.badgeColor} />
                      </View>
                      <View>
                        <Text style={styles.txAmount}>{tx.amount.toFixed(2)} AZN</Text>
                        <Text style={styles.txDate}>{formatDate(tx.createdAt, language)}</Text>
                      </View>
                    </View>
                    <View style={[styles.txBadge, { backgroundColor: cfg.badgeBg }]}>
                      <Text style={[styles.txBadgeText, { color: cfg.badgeColor }]}>{t(cfg.labelKey)}</Text>
                    </View>
                  </View>

                  {tx.description ? (
                    <View style={styles.txBottom}>
                      <View style={styles.txDetailRow}>
                        <Ionicons name="card-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.txDetail}>{tx.description}</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 24, gap: 24, paddingBottom: 40 },

  bannerWrap: { position: 'relative', marginBottom: 12 },
  banner: { borderRadius: 20, padding: 28, gap: 12 },
  bannerLabel: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  bannerTotal: { fontSize: 36, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -1 },
  bannerStats: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  bannerStatBox: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  bannerStatKey: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  bannerStatVal: { fontSize: 15, fontWeight: '600', color: '#fff' },
  insightPill: {
    position: 'absolute', bottom: -18, alignSelf: 'center',
    backgroundColor: Colors.surfaceLowest, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  insightPillText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  sectionChip: { backgroundColor: Colors.primaryLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  sectionChipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 240 },

  txList: { gap: 12 },
  txCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 1,
  },
  txTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  txIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  txAmount: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  txDate: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  txBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  txBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

  txBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.surfaceLow,
  },
  txDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  txDetail: { fontSize: 12, fontWeight: '500', color: Colors.textMuted },
});
