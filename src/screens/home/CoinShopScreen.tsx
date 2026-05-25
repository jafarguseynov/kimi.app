import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { useSpinWheelStore } from '../../store/spinWheel.store';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type ShopItem = {
  id: string;
  icon: keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap;
  iconColor: string;
  bg: string;
  title: string;
  description: string;
  price: number;
  tag?: string;
};

const ITEMS: ShopItem[] = [
  { id: 's1', icon: 'snow', iconColor: '#0EA5E9', bg: '#E0F2FE', title: 'Streak qoruyucusu', description: '1 günlük streak müdafiəsi', price: 100 },
  { id: 's2', icon: 'add-circle', iconColor: '#16A34A', bg: '#DCFCE7', title: '+1 Fırlatma', description: 'Bu gün üçün əlavə şans', price: 50, tag: 'Populyar' },
  { id: 's3', icon: 'happy', iconColor: '#A855F7', bg: '#F3E8FF', title: 'Avatar dəsti', description: '3 fərqli avatar', price: 150 },
  { id: 's4', icon: 'sparkles', iconColor: '#F59E0B', bg: '#FEF9C3', title: 'Premium 24 saat', description: 'Bütün xüsusiyyətlər', price: 300, tag: 'Ən yaxşı' },
  { id: 's5', icon: 'rocket', iconColor: '#DC2626', bg: '#FEE2E2', title: 'XP Booster (1 saat)', description: '2x XP qazan', price: 120 },
  { id: 's6', icon: 'pricetag', iconColor: '#EC4899', bg: '#FCE7F3', title: 'Stiker paketi', description: '12 yeni stiker', price: 80 },
];

export default function CoinShopScreen() {
  const navigation = useNavigation<any>();
  const { coins, spendCoins, grantExtraSpin } = useSpinWheelStore();
  const [owned, setOwned] = useState<Set<string>>(new Set());

  const buy = (item: ShopItem) => {
    if (owned.has(item.id)) return;
    if (coins < item.price) {
      Alert.alert('Sikkə çatmır', `Bu məhsul üçün ${item.price - coins} sikkə əskikdir. Çarxı fırladaraq daha çox qazana bilərsən.`);
      return;
    }
    Alert.alert(
      'Alışı təsdiqlə',
      `"${item.title}" üçün ${item.price} sikkə xərclənəcək. Davam edək?`,
      [
        { text: 'Ləğv et', style: 'cancel' },
        {
          text: 'Bəli, al',
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
            Alert.alert('Alındı 🎉', `"${item.title}" hesabına əlavə olundu.`);
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
        <Text style={styles.headerTitle}>Sikkə dükanı</Text>
        <View style={styles.coinPill}>
          <Ionicons name="cash" size={14} color="#CA8A04" />
          <Text style={styles.coinPillText}>{coins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 14 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={GRADIENT} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="cash" size={26} color="#fff" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>Sikkə ilə bonusları aç</Text>
            <Text style={styles.bannerSub}>Çarxda qazandığın sikkələri buraya xərclə</Text>
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
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.tag && (
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>{item.tag}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemDesc}>{item.description}</Text>
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
                    <Text style={styles.buyBtnOwnedText}>Sahibsən</Text>
                  </>
                ) : (
                  <Text style={[styles.buyBtnText, !canAfford && { color: Colors.textSecondary }]}>Al</Text>
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
