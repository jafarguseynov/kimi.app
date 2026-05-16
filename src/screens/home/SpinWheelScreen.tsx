import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = { navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.SpinWheel> };

const WHEEL_SIZE = 280;
const CENTER = WHEEL_SIZE / 2;
const ICON_RADIUS = 82;

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const SEGMENTS: Array<{ icon: IoniconsName; iconColor: string; label: string; angle: number }> = [
  { icon: 'star',              iconColor: '#F59E0B', label: 'Premium',   angle: 22.5  },
  { icon: 'flash',             iconColor: '#10B981', label: '100 XP',    angle: 67.5  },
  { icon: 'bluetooth',         iconColor: '#0EA5E9', label: 'Bluetooth', angle: 112.5 },
  { icon: 'add-circle',        iconColor: '#34D399', label: '50 XP',     angle: 157.5 },
  { icon: 'tablet-portrait',   iconColor: '#6366F1', label: 'Tablet',    angle: 202.5 },
  { icon: 'cash',              iconColor: '#EAB308', label: '200 Co',    angle: 247.5 },
  { icon: 'book',              iconColor: '#A855F7', label: 'Dərslik',   angle: 292.5 },
  { icon: 'gift',              iconColor: '#F43F5E', label: 'Sürpriz',   angle: 337.5 },
];

const REWARDS = [
  {
    icon: 'star' as IoniconsName,
    iconColor: '#F59E0B',
    bg: '#FEF9C3',
    title: '7 Günlük Premium',
    sub: 'Bütün dərslərə məhdudiyyətsiz giriş',
    badge: 'NADİR',
    badgeColor: Colors.primary,
  },
  {
    icon: 'headset' as IoniconsName,
    iconColor: '#0EA5E9',
    bg: '#E0F2FE',
    title: 'Bluetooth Qulaqlıq',
    sub: 'Real hədiyyə kuryer ilə çatdırılır',
    badge: 'EFSANƏVİ',
    badgeColor: '#EF4444',
  },
];

const getItemPos = (angle: number) => {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    left: CENTER + ICON_RADIUS * Math.cos(rad) - 20,
    top: CENTER + ICON_RADIUS * Math.sin(rad) - 24,
  };
};

export default function SpinWheelScreen({ navigation }: Props) {
  const [spinsLeft] = useState(1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hədiyyə Çarxı</Text>
        <View style={styles.starsRow}>
          <Ionicons name="star" size={18} color={Colors.primary} />
          <Text style={styles.starsValue}>1,250</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>GÜNLÜK ŞANS</Text>
          </View>
          <Text style={styles.heroTitle}>
            Bəxtini <Text style={{ color: Colors.primary }}>Sına</Text>,{'\n'}Mükafatını Qazan!
          </Text>
        </View>

        {/* Wheel */}
        <View style={styles.wheelWrapper}>
          {/* Selector Pin */}
          <View style={styles.pinContainer}>
            <View style={styles.pin}>
              <View style={styles.pinDot} />
            </View>
          </View>

          {/* Wheel Circle */}
          <View style={styles.wheel}>
            {/* Light aura tint */}
            <View style={styles.wheelTint} />

            {/* Divider Lines — 4 lines × 2 directions = 8 segments */}
            {([0, 45, 90, 135] as const).map((angle) => (
              <View
                key={angle}
                style={[styles.dividerLine, { transform: [{ rotate: `${angle}deg` }] }]}
              />
            ))}

            {/* Segment Icon + Label */}
            {SEGMENTS.map((seg) => {
              const pos = getItemPos(seg.angle);
              return (
                <View key={seg.angle} style={[styles.segItem, { left: pos.left, top: pos.top }]}>
                  <Ionicons name={seg.icon} size={22} color={seg.iconColor} />
                  <Text style={styles.segLabel}>{seg.label}</Text>
                </View>
              );
            })}

            {/* Center Hub */}
            <View style={styles.centerHub}>
              <Text style={styles.centerHubText}>K.</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.spinBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.spinBtnText}>Fırlat</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.spinsLeftRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.spinsLeftText}>{spinsLeft} fırlatma şansınız qalıb</Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={[styles.infoIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="time" size={20} color="#10B981" />
            </View>
            <Text style={styles.infoCardMeta}>SON UDUŞ</Text>
            <Text style={styles.infoCardValue}>50 XP Bonus</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.infoIconBox, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="timer-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.infoCardMeta}>NÖVBƏTİ ŞANS</Text>
            <Text style={styles.infoCardValue}>24 Saat Sonra</Text>
          </View>
        </View>

        {/* Rewards List */}
        <View style={styles.rewardsList}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.rewardsTitle}>Mümkün Mükafatlar</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.rewardsAll}>Hamısı</Text>
            </TouchableOpacity>
          </View>

          {REWARDS.map((r) => (
            <View key={r.title} style={styles.rewardRow}>
              <View style={[styles.rewardIconBox, { backgroundColor: r.bg }]}>
                <Ionicons name={r.icon} size={22} color={r.iconColor} />
              </View>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>{r.title}</Text>
                <Text style={styles.rewardSub}>{r.sub}</Text>
              </View>
              <View style={[styles.rewardBadge, { backgroundColor: r.badgeColor + '18' }]}>
                <Text style={[styles.rewardBadgeText, { color: r.badgeColor }]}>{r.badge}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  starsValue: { fontSize: 16, fontWeight: '700', color: Colors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 24, alignItems: 'center' },

  heroSection: { alignItems: 'center', gap: 12 },
  heroBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  heroBadgeText: {
    fontSize: 10, fontWeight: '800', color: Colors.primary,
    letterSpacing: 2.5, textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 28, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', lineHeight: 36, letterSpacing: -0.5,
  },

  wheelWrapper: {
    width: WHEEL_SIZE + 20,
    height: WHEEL_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  pinContainer: { position: 'absolute', top: 0, alignSelf: 'center', zIndex: 10 },
  pin: {
    width: 32, height: 40,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: 'center',
    paddingTop: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  pinDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },

  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 10,
    borderColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
  },
  wheelTint: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.primaryLight,
    opacity: 0.25,
  },
  dividerLine: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.09)',
    top: CENTER - StyleSheet.hairlineWidth / 2,
    left: 0,
  },
  segItem: {
    position: 'absolute',
    width: 40,
    alignItems: 'center',
  },
  segLabel: {
    fontSize: 8, fontWeight: '700', color: Colors.textPrimary,
    marginTop: 2, textAlign: 'center',
  },
  centerHub: {
    position: 'absolute',
    left: CENTER - 32,
    top: CENTER - 32,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.surfaceLow,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  centerHubText: {
    fontSize: 20, fontWeight: '900', color: Colors.primary, fontStyle: 'italic',
  },

  ctaSection: { width: '100%', gap: 14, alignItems: 'center' },
  spinBtn: {
    borderRadius: 999, paddingVertical: 20,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  spinBtnText: {
    fontSize: 18, fontWeight: '800', color: '#fff',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  spinsLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  spinsLeftText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  infoGrid: { flexDirection: 'row', gap: 12, width: '100%' },
  infoCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 20, padding: 20, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  infoIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  infoCardMeta: {
    fontSize: 8, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  infoCardValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },

  rewardsList: { width: '100%', gap: 12 },
  rewardsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rewardsTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  rewardsAll: { fontSize: 12, fontWeight: '700', color: Colors.primary, textDecorationLine: 'underline' },

  rewardRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  rewardIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rewardInfo: { flex: 1 },
  rewardTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  rewardSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  rewardBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  rewardBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
});
