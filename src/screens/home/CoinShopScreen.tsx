import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { useSpinWheelStore } from '../../store/spinWheel.store';
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
};

const ITEMS: ShopItem[] = [
  { id: 's1', icon: 'snow', iconColor: '#0EA5E9', bg: '#E0F2FE', titleKey: 'coinShop.s1Title', descKey: 'coinShop.s1Desc', price: 100 },
  { id: 's2', icon: 'add-circle', iconColor: '#16A34A', bg: '#DCFCE7', titleKey: 'coinShop.s2Title', descKey: 'coinShop.s2Desc', price: 50, tagKey: 'coinShop.tagPopular' },
  { id: 's3', icon: 'happy', iconColor: '#A855F7', bg: '#F3E8FF', titleKey: 'coinShop.s3Title', descKey: 'coinShop.s3Desc', price: 150 },
  { id: 's4', icon: 'sparkles', iconColor: '#F59E0B', bg: '#FEF9C3', titleKey: 'coinShop.s4Title', descKey: 'coinShop.s4Desc', price: 300, tagKey: 'coinShop.tagBest' },
  { id: 's5', icon: 'rocket', iconColor: '#DC2626', bg: '#FEE2E2', titleKey: 'coinShop.s5Title', descKey: 'coinShop.s5Desc', price: 120 },
  { id: 's6', icon: 'pricetag', iconColor: '#EC4899', bg: '#FCE7F3', titleKey: 'coinShop.s6Title', descKey: 'coinShop.s6Desc', price: 80 },
];

export default function CoinShopScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { coins, spendCoins, grantExtraSpin } = useSpinWheelStore();
  const [owned, setOwned] = useState<Set<string>>(new Set());

  const buy = (item: ShopItem) => {
    if (owned.has(item.id)) return;
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
        {
          text: t('coinShop.yesBuy'),
          onPress: () => {
            const ok = spendCoins(item.price);
            if (!ok) return;
            // s2 = +1 Fırlatma is consumable: re-buyable, doesn't go to "owned"
            if (item.id === 's2') {
              grantExtraSpin();
            } else {
              setOwned((prev) => {
                const next = new Set(prev);
                next.add(item.id);
                return next;
              });
            }
            Alert.alert(t('coinShop.purchasedTitle'), t('coinShop.purchasedBody', { title: itemTitle }));
          },
        },
      ],
    );
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

        {ITEMS.map((item) => {
          const isOwned = owned.has(item.id);
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
                disabled={isOwned}
              >
                {isOwned ? (
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
