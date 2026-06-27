import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { useSpinWheelStore } from '../../store/spinWheel.store';
import { getWallet } from '../../api/payment.api';
import { buyExtraSpin } from '../../api/spin.api';
import { redeemPerk, getEntitlements, Entitlements } from '../../api/shop.api';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type ShopItem = {
  id: string;
  icon: keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap;
  iconColor: string;
  bg: string;
  titleKey: string;
  descKey: string;
  price: number;
  tagKey?: string;
  consumable?: boolean; // təkrar alına bilər (vaxtlı/birdəfəlik) — "Sahibsən" qalmır
  infoKey: string;      // info (i) modalı üçün açar prefiksi: coinShop.info.<key>
};

const ITEMS: ShopItem[] = [
  { id: 's1', icon: 'snow', iconColor: '#0EA5E9', bg: '#E0F2FE', titleKey: 'coinShop.s1Title', descKey: 'coinShop.s1Desc', price: 100, consumable: true, infoKey: 's1' },
  { id: 's2', icon: 'add-circle', iconColor: '#16A34A', bg: '#DCFCE7', titleKey: 'coinShop.s2Title', descKey: 'coinShop.s2Desc', price: 50, tagKey: 'coinShop.tagPopular', consumable: true, infoKey: 's2' },
  { id: 's3', icon: 'happy', iconColor: '#A855F7', bg: '#F3E8FF', titleKey: 'coinShop.s3Title', descKey: 'coinShop.s3Desc', price: 150, infoKey: 's3' },
  { id: 's4', icon: 'sparkles', iconColor: '#F59E0B', bg: '#FEF9C3', titleKey: 'coinShop.s4Title', descKey: 'coinShop.s4Desc', price: 300, tagKey: 'coinShop.tagBest', consumable: true, infoKey: 's4' },
  { id: 's5', icon: 'rocket', iconColor: '#DC2626', bg: '#FEE2E2', titleKey: 'coinShop.s5Title', descKey: 'coinShop.s5Desc', price: 120, consumable: true, infoKey: 's5' },
  { id: 's6', icon: 'pricetag', iconColor: '#EC4899', bg: '#FCE7F3', titleKey: 'coinShop.s6Title', descKey: 'coinShop.s6Desc', price: 80, infoKey: 's6' },
];

function PerkRow({ icon, color, label, status, on, last }: {
  icon: keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap;
  color: string; label: string; status: string; on: boolean; last?: boolean;
}) {
  return (
    <View style={[styles.perkRow, !last && styles.perkRowBorder]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.perkLabel} numberOfLines={1}>{label}</Text>
      <View style={[styles.perkStatusPill, { backgroundColor: on ? '#DCFCE7' : Colors.surfaceLow }]}>
        <Ionicons name={on ? 'checkmark-circle' : 'remove-circle-outline'} size={13} color={on ? '#16A34A' : Colors.textMuted} />
        <Text style={[styles.perkStatusText, { color: on ? '#16A34A' : Colors.textSecondary }]}>{status}</Text>
      </View>
    </View>
  );
}

export default function CoinShopScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { coins, setCoins, grantExtraSpin, ownedShopItems, markShopItemOwned } = useSpinWheelStore();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [infoItem, setInfoItem] = useState<ShopItem | null>(null);
  const [ent, setEnt] = useState<Entitlements | null>(null);

  // Açılışda real cüzdan balansını + entitlement-ləri serverdən sinxronlaşdır
  useEffect(() => {
    getWallet().then((w) => setCoins(w.balance)).catch(() => {});
    getEntitlements().then(setEnt).catch(() => {});
  }, []);

  const doPurchase = async (item: ShopItem) => {
    const itemTitle = t(item.titleKey);
    setBusyId(item.id);
    try {
      if (item.id === 's2') {
        // +1 Fırlatma — serverdə real bonus spin + cüzdandan xərc
        const res = await buyExtraSpin();
        setCoins(res.balance);
        grantExtraSpin(); // anlıq lokal əks (server statusu növbəti yüklənmədə təsdiqləyir)
      } else {
        // s1/s3/s4/s5/s6 — serverdə perk redeem (xərc + premium/xpboost/kosmetik effekt)
        const res = await redeemPerk(item.id);
        setCoins(res.balance);
        setEnt(res);
        if (!item.consumable) markShopItemOwned(item.id); // yalnız kalıcı (avatar/stiker) "Sahibsən"
      }
      Alert.alert(t('coinShop.purchasedTitle'), t('coinShop.purchasedBody', { title: itemTitle }));
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      // Server balans yoxlaması: "Balans kifayət deyil"
      if (e?.response?.status === 400) {
        Alert.alert(t('coinShop.notEnoughTitle'), msg || t('coinShop.notEnoughBody', { n: Math.max(0, item.price - coins) }));
      } else {
        Alert.alert(t('coinShop.errorTitle'), msg || t('coinShop.errorBody'));
      }
    } finally {
      setBusyId(null);
    }
  };

  const buy = (item: ShopItem) => {
    if (busyId) return;
    if (!item.consumable && ownedShopItems.includes(item.id)) return;
    const itemTitle = t(item.titleKey);
    if (coins < item.price) {
      Alert.alert(t('coinShop.notEnoughTitle'), t('coinShop.notEnoughBody', { n: item.price - coins }));
      return;
    }
    Alert.alert(
      t('coinShop.confirmTitle'),
      t('coinShop.confirmBody', { title: itemTitle, price: item.price }),
      [
        { text: t('coinShop.cancel'), style: 'cancel' },
        { text: t('coinShop.yesBuy'), onPress: () => { void doPurchase(item); } },
      ],
    );
  };

  // Aktiv perk statusunu (qalan vaxt) göstər
  const remainLabel = (iso: string | null): string => {
    if (!iso) return '';
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return '';
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return h > 0 ? `${h}s ${m}d` : `${m}d`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} hitSlop={8} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('coinShop.header')}</Text>
        <View style={styles.coinPill}>
          <Ionicons name="cash" size={14} color="#CA8A04" />
          <Text style={styles.coinPillText}>{coins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 14 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={GRADIENT} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="cash" size={26} color="#fff" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>{t('coinShop.bannerTitle')}</Text>
            <Text style={styles.bannerSub}>{t('coinShop.bannerSub')}</Text>
          </View>
        </LinearGradient>

        {/* Mənim imtiyazlarım — aldıqların və aktiv vəziyyət burada görünür */}
        <View style={styles.perksCard}>
          <View style={styles.perksHeader}>
            <Ionicons name="ribbon" size={16} color={Colors.primary} />
            <Text style={styles.perksTitle}>{t('coinShop.myPerks')}</Text>
          </View>
          <PerkRow
            icon="sparkles" color="#B45309"
            label={t('coinShop.s4Title')}
            status={ent?.premiumActive ? t('coinShop.activeFor', { time: remainLabel(ent.premiumUntil) }) : t('coinShop.notActive')}
            on={!!ent?.premiumActive}
          />
          <PerkRow
            icon="rocket" color="#B91C1C"
            label={t('coinShop.s5Title')}
            status={ent?.xpBoostActive ? t('coinShop.activeFor', { time: remainLabel(ent.xpBoostUntil) }) : t('coinShop.notActive')}
            on={!!ent?.xpBoostActive}
          />
          <PerkRow
            icon="snow" color="#0EA5E9"
            label={t('coinShop.s1Title')}
            status={t('coinShop.freezeCount', { n: ent?.streakFreezes ?? 0 })}
            on={(ent?.streakFreezes ?? 0) > 0}
          />
          <PerkRow
            icon="happy" color="#A855F7"
            label={t('coinShop.s3Title')}
            status={ent?.ownedPacks?.includes('avatar') ? t('coinShop.owned') : t('coinShop.notOwned')}
            on={!!ent?.ownedPacks?.includes('avatar')}
          />
          <PerkRow
            icon="pricetag" color="#EC4899"
            label={t('coinShop.s6Title')}
            status={ent?.ownedPacks?.includes('sticker') ? t('coinShop.owned') : t('coinShop.notOwned')}
            on={!!ent?.ownedPacks?.includes('sticker')}
            last
          />
        </View>

        {ITEMS.map((item) => {
          const isOwned = !item.consumable && ownedShopItems.includes(item.id);
          const isBusy = busyId === item.id;
          const canAfford = coins >= item.price;
          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={[styles.itemIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={26} color={item.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle}>{t(item.titleKey)}</Text>
                  {item.tagKey && (
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>{t(item.tagKey)}</Text>
                    </View>
                  )}
                  {/* Info (i) düyməsi */}
                  <TouchableOpacity onPress={() => setInfoItem(item)} hitSlop={8} style={styles.infoBtn} activeOpacity={0.7}>
                    <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemDesc}>{t(item.descKey)}</Text>
                <View style={styles.priceRow}>
                  <Ionicons name="cash" size={14} color="#CA8A04" />
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.buyBtn,
                  isOwned && styles.buyBtnOwned,
                  !canAfford && !isOwned && styles.buyBtnDisabled,
                ]}
                activeOpacity={0.85}
                onPress={() => buy(item)}
                disabled={isOwned || isBusy}
              >
                {isBusy ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : isOwned ? (
                  <>
                    <Ionicons name="checkmark" size={14} color={Colors.primary} />
                    <Text style={styles.buyBtnOwnedText}>{t('coinShop.owned')}</Text>
                  </>
                ) : (
                  <Text style={[styles.buyBtnText, !canAfford && { color: Colors.textSecondary }]}>{t('coinShop.buy')}</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Info (i) modalı — məhsulun nə olduğu, necə/harada istifadə */}
      <Modal visible={!!infoItem} transparent animationType="fade" onRequestClose={() => setInfoItem(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setInfoItem(null)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            {infoItem && (
              <>
                <View style={[styles.modalIcon, { backgroundColor: infoItem.bg }]}>
                  <Ionicons name={infoItem.icon} size={28} color={infoItem.iconColor} />
                </View>
                <Text style={styles.modalTitle}>{t(infoItem.titleKey)}</Text>
                <Text style={styles.modalWhat}>{t(`coinShop.info.${infoItem.infoKey}What`)}</Text>
                <View style={styles.modalDivider} />
                <View style={styles.modalRow}>
                  <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
                  <Text style={styles.modalRowText}>{t(`coinShop.info.${infoItem.infoKey}Where`)}</Text>
                </View>
                <TouchableOpacity style={styles.modalClose} onPress={() => setInfoItem(null)} activeOpacity={0.85}>
                  <Text style={styles.modalCloseText}>{t('coinShop.infoClose')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  coinPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FEF9C3',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  coinPillText: { fontSize: 13, fontWeight: '800', color: '#92400E' },

  banner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 18, padding: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5,
  },
  bannerTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  perksCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: Colors.borderLight, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
  perksHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  perksTitle: { fontSize: 13, fontWeight: '900', color: Colors.textPrimary },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  perkRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  perkLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  perkStatusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  perkStatusText: { fontSize: 11, fontWeight: '800' },

  infoBtn: { padding: 2, marginLeft: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 22, padding: 22, alignItems: 'center' },
  modalIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
  modalWhat: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  modalDivider: { height: 1, backgroundColor: Colors.borderLight, alignSelf: 'stretch', marginVertical: 14 },
  modalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, alignSelf: 'stretch' },
  modalRowText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 19, fontWeight: '600' },
  modalClose: { marginTop: 18, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28, alignSelf: 'stretch', alignItems: 'center' },
  modalCloseText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  itemCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  itemIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  itemDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  priceText: { fontSize: 14, fontWeight: '900', color: '#92400E' },
  tagBadge: { backgroundColor: Colors.primaryLight, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  tagBadgeText: { fontSize: 9, fontWeight: '900', color: Colors.primary, letterSpacing: 0.5 },

  buyBtn: {
    minWidth: 64, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4,
    paddingHorizontal: 12,
  },
  buyBtnDisabled: { backgroundColor: Colors.surfaceHigh },
  buyBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  buyBtnOwned: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1, borderColor: Colors.primary + '55',
  },
  buyBtnOwnedText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
});
