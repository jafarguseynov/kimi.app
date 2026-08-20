import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { getWallet, getTransactions, TransactionItem } from '../../api/payment.api';
import client from '../../api/client';
import { Colors } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { PAYMENTS_ENABLED } from '../../config/iap';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const TX_STATUS: Record<string, { labelKey: string; color: string }> = {
  topup: { labelKey: 'pay.txSuccess', color: Colors.tertiary },
  earn: { labelKey: 'pay.txSuccess', color: Colors.tertiary },
  spend: { labelKey: 'pay.txSpent', color: Colors.danger },
  refund: { labelKey: 'pay.txRefunded', color: Colors.warning },
};

function getInitial(str: string): string {
  return (str ?? '?').charAt(0).toUpperCase();
}

function TxItem({ item, t }: { item: TransactionItem; t: TFn }) {
  const isIncome = item.type === 'topup' || item.type === 'earn';
  const status = TX_STATUS[item.type] ?? { labelKey: 'pay.txPending', color: Colors.warning };
  const name = item.description ?? item.type;
  const initial = getInitial(name);
  const amountColor = isIncome ? Colors.tertiary : Colors.textPrimary;

  return (
    <View style={styles.txItem}>
      <LinearGradient colors={GRADIENT} style={styles.txAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.txAvatarInitial}>{initial}</Text>
      </LinearGradient>
      <View style={styles.txInfo}>
        <Text style={styles.txName} numberOfLines={1}>{name}</Text>
        <View style={styles.txStatusRow}>
          <View style={[styles.txDot, { backgroundColor: status.color }]} />
          <Text style={styles.txStatusText}>{t(status.labelKey)} • {formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={[styles.txAmount, { color: amountColor }]}>
        {isIncome ? '+' : ''}{formatCurrency(item.amount)}
      </Text>
    </View>
  );
}

export default function WalletScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const { data: wallet, isLoading: walletLoading, refetch, isRefetching } = useQuery({
    queryKey: ['wallet'],
    queryFn: getWallet,
  });
  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });

  // Real referal məlumatı (kod + dəvət olunanların sayı) — placeholder əvəzinə.
  const { data: referral } = useQuery<{ code?: string; link?: string }>({
    queryKey: ['referral'],
    queryFn: () => client.get('/referral/link').then((r) => r.data).catch(() => ({})),
  });
  const { data: friends = [] } = useQuery<any[]>({
    queryKey: ['referral-friends'],
    queryFn: () => client.get('/referral/friends').then((r) => r.data).catch(() => []),
  });

  const isLoading = walletLoading || txLoading;
  const balance = wallet?.balance ?? 0;
  const totalEarnings = transactions
    .filter((t) => t.type === 'earn' || t.type === 'topup')
    .reduce((sum, t) => sum + t.amount, 0);
  const invitedCount = Array.isArray(friends) ? friends.length : 0;
  const referralCode = referral?.code ?? '';

  const handleShare = () => {
    const target = referral?.link || referralCode;
    const msg = target
      ? `Kimi.az-a mənim dəvət kodumla qoşul: ${target}`
      : t('pay.walletShareMessage');
    Share.share({ message: msg });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.referralBalance')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(t) => t.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={
            <>
              {/* Hero balance */}
              <LinearGradient colors={GRADIENT} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.heroBlob} />
                <View style={styles.heroInner}>
                  <Text style={styles.heroLabel}>{t('pay.currentBalance')}</Text>
                  <View style={styles.heroAmountRow}>
                    <Text style={styles.heroAmount}>{balance.toFixed(2)}</Text>
                    <Text style={styles.heroCurrency}>AZN</Text>
                  </View>
                  {/* App Store 3.1.1: iOS-da real-pul balans artırımı düyməsi göstərilmir. */}
                  {PAYMENTS_ENABLED && (
                    <TouchableOpacity
                      style={styles.withdrawBtn}
                      onPress={() => navigation.navigate(Routes.TopUp)}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.withdrawBtnText}>{t('pay.withdrawFunds')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>

              {/* Stats bento */}
              <View style={styles.bentoGrid}>
                <View style={styles.bentoCard}>
                  <View style={[styles.bentoIconBox, { backgroundColor: Colors.tertiaryContainer + '40' }]}>
                    <Ionicons name="ribbon-outline" size={22} color={Colors.tertiary} />
                  </View>
                  <View style={styles.bentoInfo}>
                    <Text style={styles.bentoLabel}>{t('pay.totalEarnings')}</Text>
                    <Text style={styles.bentoValue}>{formatCurrency(totalEarnings)}</Text>
                  </View>
                </View>
                <View style={styles.bentoCard}>
                  <View style={[styles.bentoIconBox, { backgroundColor: Colors.primary + '1A' }]}>
                    <Ionicons name="people-outline" size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.bentoInfo}>
                    <Text style={styles.bentoLabel}>{t('pay.invited')}</Text>
                    <Text style={styles.bentoValue}>{invitedCount} {t('pay.peopleUnit')}</Text>
                  </View>
                </View>
              </View>

              {/* Kimi hint */}
              <View style={styles.hintCard}>
                <View style={styles.hintMascotWrap}>
                  <LinearGradient colors={GRADIENT} style={styles.hintMascot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.hintMascotK}>K.</Text>
                  </LinearGradient>
                  <View style={styles.hintOnline} />
                </View>
                <View style={styles.hintContent}>
                  <Text style={styles.hintTitle}>{t('pay.kimiHint')}</Text>
                  <Text style={styles.hintText}>
                    {t('pay.kimiHintPre')}
                    <Text style={styles.hintBold}>5.00 AZN</Text>{t('pay.kimiHintPost')}
                  </Text>
                </View>
              </View>

              {/* History header */}
              <View style={styles.histHeader}>
                <Text style={styles.histTitle}>{t('pay.earningsHistory')}</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.histSeeAll}>{t('pay.seeAll')}</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          renderItem={({ item }) => <TxItem item={item} t={t} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="wallet-outline" size={44} color={Colors.outline} />
              <Text style={styles.emptyText}>{t('pay.noTransactions')}</Text>
            </View>
          }
          ListFooterComponent={
            <>
              {/* Share section */}
              <View style={styles.shareCard}>
                <Text style={styles.shareCardTitle}>{t('pay.yourReferralCode')}</Text>
                <View style={styles.codeRow}>
                  <Text style={styles.codeText}>{referralCode || '—'}</Text>
                  <TouchableOpacity onPress={handleShare} activeOpacity={0.7}>
                    <Ionicons name="copy-outline" size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.shareIcons}>
                  <TouchableOpacity style={styles.shareIconBtn} onPress={handleShare} activeOpacity={0.8}>
                    <Ionicons name="share-social-outline" size={22} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.shareIconBtn} activeOpacity={0.8}>
                    <Ionicons name="qr-code-outline" size={22} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },

  list: { padding: 20, gap: 16, paddingBottom: 40 },

  heroCard: {
    borderRadius: 20, padding: 28, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15, shadowRadius: 28, elevation: 5,
  },
  heroBlob: {
    position: 'absolute', top: -48, right: -48,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroInner: { alignItems: 'center', gap: 0 },
  heroLabel: {
    fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8,
  },
  heroAmountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 24 },
  heroAmount: { fontSize: 52, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  heroCurrency: { fontSize: 22, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: 6 },
  withdrawBtn: {
    backgroundColor: '#fff', borderRadius: 999,
    paddingHorizontal: 40, paddingVertical: 16,
    width: '100%', maxWidth: 280, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  withdrawBtnText: { fontSize: 16, fontWeight: '800', color: Colors.primary },

  bentoGrid: { flexDirection: 'row', gap: 12 },
  bentoCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
  },
  bentoIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bentoInfo: { flex: 1 },
  bentoLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginBottom: 4 },
  bentoValue: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },

  hintCard: {
    backgroundColor: Colors.primaryLight, borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  hintMascotWrap: { position: 'relative', flexShrink: 0 },
  hintMascot: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  hintMascotK: { fontSize: 20, fontWeight: '900', color: '#fff', fontStyle: 'italic' },
  hintOnline: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.tertiary, borderWidth: 2, borderColor: '#fff',
  },
  hintContent: { flex: 1, gap: 6 },
  hintTitle: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  hintText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  hintBold: { fontWeight: '700', color: Colors.textPrimary },

  histHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  histTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  histSeeAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  txItem: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  txAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txAvatarInitial: { fontSize: 18, fontWeight: '800', color: '#fff', fontStyle: 'italic' },
  txInfo: { flex: 1 },
  txName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  txStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  txDot: { width: 8, height: 8, borderRadius: 4 },
  txStatusText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  txAmount: { fontSize: 16, fontWeight: '800' },

  empty: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  emptyText: { fontSize: 14, color: Colors.textMuted },

  shareCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 24,
    alignItems: 'center', gap: 16,
    borderWidth: 2, borderColor: Colors.borderLight, borderStyle: 'dashed',
    marginTop: 4,
  },
  shareCardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  codeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLow, borderRadius: 16,
    paddingHorizontal: 24, paddingVertical: 14,
    width: '100%', justifyContent: 'center',
  },
  codeText: { fontSize: 18, fontWeight: '900', color: Colors.primary, letterSpacing: 4, textTransform: 'uppercase' },
  shareIcons: { flexDirection: 'row', gap: 16 },
  shareIconBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceLow, alignItems: 'center', justifyContent: 'center',
  },
});
