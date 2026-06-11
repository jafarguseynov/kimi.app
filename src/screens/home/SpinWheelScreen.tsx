import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import Confetti from '../../components/effects/Confetti';
import { playSpin, stopSpin, playReward } from '../../utils/sound';
import { hapticMedium, hapticHeavy, hapticSuccess, hapticLight } from '../../utils/haptics';
import { useSpinStreakStore, STREAK_BONUS_THRESHOLD } from '../../store/spinStreak.store';
import { useSpinWheelStore } from '../../store/spinWheel.store';
import { logSpin } from '../../api/spin.api';

type Props = { navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.SpinWheel> };

const WHEEL_SIZE = 280;
const CENTER = WHEEL_SIZE / 2;
const ICON_RADIUS = 88;
const SEG_WIDTH = 60;

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type Segment = {
  icon: IoniconsName;
  iconColor: string;
  label: string;
  angle: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: { type: 'xp' | 'coin' | 'premium' | 'book' | 'tablet' | 'surprise'; amount?: number };
};

const SEGMENTS: Segment[] = [
  { icon: 'flash',           iconColor: '#10B981', label: '100 XP',     angle: 22.5,  rarity: 'common',    reward: { type: 'xp', amount: 100 } },
  { icon: 'star',            iconColor: '#F59E0B', label: 'Premium',    angle: 67.5,  rarity: 'rare',      reward: { type: 'premium' } },
  { icon: 'cash',            iconColor: '#EAB308', label: '250 Sikkə',  angle: 112.5, rarity: 'common',    reward: { type: 'coin', amount: 250 } },
  { icon: 'flash',           iconColor: '#34D399', label: '50 XP',      angle: 157.5, rarity: 'common',    reward: { type: 'xp', amount: 50 } },
  { icon: 'tablet-portrait', iconColor: '#6366F1', label: 'Tablet',     angle: 202.5, rarity: 'legendary', reward: { type: 'tablet' } },
  { icon: 'flash',           iconColor: '#0EA5E9', label: '200 XP',     angle: 247.5, rarity: 'common',    reward: { type: 'xp', amount: 200 } },
  { icon: 'book',            iconColor: '#A855F7', label: 'Dərslik',    angle: 292.5, rarity: 'epic',      reward: { type: 'book' } },
  { icon: 'gift',            iconColor: '#F43F5E', label: 'Sürpriz',    angle: 337.5, rarity: 'rare',      reward: { type: 'surprise' } },
];

// drop weights — common appears more, legendary much less
const WEIGHTS: Record<Segment['rarity'], number> = {
  common: 50,
  rare: 18,
  epic: 6,
  legendary: 1,
};

const pickSegment = (): number => {
  const totals = SEGMENTS.map((s) => WEIGHTS[s.rarity]);
  const total = totals.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SEGMENTS.length; i++) {
    r -= totals[i];
    if (r <= 0) return i;
  }
  return 0;
};

const RARITY_META: Record<Segment['rarity'], { label: string; color: string }> = {
  common:    { label: 'ADİ',       color: '#16A34A' },
  rare:      { label: 'NADİR',     color: Colors.primary },
  epic:      { label: 'EPİK',      color: '#A855F7' },
  legendary: { label: 'EFSANƏVİ',  color: '#DC2626' },
};

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
    icon: 'tablet-portrait' as IoniconsName,
    iconColor: '#6366F1',
    bg: '#EEF2FF',
    title: 'Samsung Tab A9',
    sub: 'Fiziki hədiyyə · kuryer ilə çatdırılır',
    badge: 'EFSANƏVİ',
    badgeColor: '#DC2626',
  },
  {
    icon: 'book' as IoniconsName,
    iconColor: '#A855F7',
    bg: '#F3E8FF',
    title: 'Buraxılış imtahanı dərsliyi',
    sub: 'PDF + fiziki nüsxə',
    badge: 'EPİK',
    badgeColor: '#A855F7',
  },
  {
    icon: 'cash' as IoniconsName,
    iconColor: '#EAB308',
    bg: '#FEF9C3',
    title: '250 Sikkə',
    sub: 'Tətbiq daxilində alış-veriş üçün',
    badge: 'ADİ',
    badgeColor: '#16A34A',
  },
];

const getItemPos = (angle: number) => {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    left: CENTER + ICON_RADIUS * Math.cos(rad) - SEG_WIDTH / 2,
    top: CENTER + ICON_RADIUS * Math.sin(rad) - 22,
  };
};

export default function SpinWheelScreen({ navigation }: Props) {
  const {
    spinsLeft, coins, stars, history,
    ensureDailyReset, decrementSpin, addCoins, addStars, grantExtraSpin, addHistoryEntry,
  } = useSpinWheelStore();

  const [spinning, setSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<string>('—');
  const [confettiOn, setConfettiOn] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const totalRotation = useRef(0);

  useEffect(() => {
    ensureDailyReset();
  }, [ensureDailyReset]);

  // Ekrandan çıxarkən fırlanma səsini dayandır
  useEffect(() => () => { stopSpin(); }, []);

  // restore latest reward label from persistent history
  useEffect(() => {
    if (history.length > 0 && lastReward === '—') setLastReward(history[0].label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const { streak, spinsSinceRarePlus, registerSpin, shouldGuaranteeRarePlus, resetPity } = useSpinStreakStore();
  const isBonusDay = streak > 0 && streak % STREAK_BONUS_THRESHOLD === 0;

  const spin = () => {
    if (spinning || spinsLeft <= 0) {
      if (spinsLeft <= 0) {
        Alert.alert(
          'Şans yoxdur',
          'Növbəti fırlatmanız üçün 24 saat gözləyin.\n\nReklam baxaraq əlavə şans qazana bilərsən (demo).',
          [
            { text: 'Bağla', style: 'cancel' },
            {
              text: 'Reklam bax (+1 şans)',
              onPress: () => grantExtraSpin(),
            },
          ],
        );
      }
      return;
    }
    setSpinning(true);
    hapticMedium();
    playSpin(); // çarx fırlanma səsi (yavaşlayan tıqqıltı)

    // Pity timer: after 10 spins without rare+, guarantee rare+
    const guaranteeRare = shouldGuaranteeRarePlus();
    let segIndex = pickSegment();
    if (guaranteeRare && SEGMENTS[segIndex].rarity === 'common') {
      const rarePool = SEGMENTS
        .map((s, i) => ({ s, i }))
        .filter((x) => x.s.rarity !== 'common');
      segIndex = rarePool[Math.floor(Math.random() * rarePool.length)].i;
    }
    // Bonus day (every 7-day streak): re-roll once if common
    if (isBonusDay && SEGMENTS[segIndex].rarity === 'common') {
      const reroll = pickSegment();
      if (SEGMENTS[reroll].rarity !== 'common') segIndex = reroll;
    }
    const targetSeg = SEGMENTS[segIndex];
    const fullSpins = 6;
    const finalAngle = 360 - targetSeg.angle;
    const target = totalRotation.current + fullSpins * 360 + finalAngle;
    totalRotation.current = target;

    Animated.timing(rotation, {
      toValue: target,
      duration: 4500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      stopSpin(); // tıqqıltını dayandır
      // Mükafat səsi + titrəyiş (nadirliyə uyğun)
      playReward(targetSeg.rarity);
      if (targetSeg.rarity === 'legendary') hapticHeavy();
      else if (targetSeg.rarity === 'common') hapticLight();
      else hapticSuccess();
      decrementSpin();
      setLastReward(targetSeg.label);
      addHistoryEntry({
        id: `h-${Date.now()}`,
        label: targetSeg.label,
        rarity: targetSeg.rarity,
        at: Date.now(),
      });

      const r = targetSeg.reward;
      if (r.type === 'xp' && r.amount) addStars(r.amount);
      if (r.type === 'coin' && r.amount) addCoins(r.amount);

      const meta = RARITY_META[targetSeg.rarity];
      const detail =
        r.type === 'xp' ? `+${r.amount} XP hesabına əlavə olundu` :
        r.type === 'coin' ? `+${r.amount} sikkə hesabına əlavə olundu` :
        r.type === 'premium' ? '7 günlük Premium aktivləşdi' :
        r.type === 'book' ? 'Dərslik kuryer ilə çatdırılacaq' :
        r.type === 'tablet' ? 'Hədiyyə ünvanın üçün admin sizinlə əlaqə saxlayacaq' :
        'Sürpriz qutusunu profil → bildirişlərdən aç';

      const isRarePlus = targetSeg.rarity !== 'common';
      const { newStreak, isBonusDay: hitBonus } = registerSpin(isRarePlus);
      if (isRarePlus) resetPity();

      logSpin({
        label: targetSeg.label,
        rarity: targetSeg.rarity,
        rewardType: r.type,
        amount: r.amount,
        streak: newStreak,
        isBonusDay: hitBonus,
        pityTriggered: guaranteeRare && isRarePlus,
      });

      // Confetti for epic+ wins
      if (targetSeg.rarity === 'epic' || targetSeg.rarity === 'legendary') {
        setConfettiOn(true);
        setTimeout(() => setConfettiOn(false), 3000);
      }

      const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'default' }[] = [
        { text: 'Möhtəşəm!', style: 'default' },
      ];
      if (targetSeg.rarity === 'legendary') {
        buttons.unshift({
          text: 'Paylaş',
          onPress: () =>
            Share.share({
              message: `🎉 Kimi.az çarxından "${targetSeg.label}" qazandım! Sən də bəxtini sına: kimi.az`,
            }).catch(() => {}),
        });
      }

      Alert.alert(
        `🎉 ${meta.label} mükafat!${guaranteeRare && isRarePlus ? ' (Pity bonus)' : ''}`,
        `"${targetSeg.label}"\n\n${detail}${hitBonus ? `\n\n🔥 ${newStreak} günlük streak bonusu!` : ''}`,
        buttons,
      );
    });
  };

  const showAllRewards = () => {
    const lines = SEGMENTS.map((s) => `${RARITY_META[s.rarity].label.padEnd(10, ' ')} · ${s.label}`).join('\n');
    Alert.alert('Bütün mümkün mükafatlar', lines);
  };

  const wheelRotateStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Confetti active={confettiOn} onDone={() => setConfettiOn(false)} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hədiyyə Çarxı</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={styles.starsRow}>
            <Ionicons name="flash" size={14} color={Colors.primary} />
            <Text style={styles.starsValue}>{stars.toLocaleString('az-AZ')}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.CoinShop)}
          >
            <View style={[styles.starsRow, { backgroundColor: '#FEF9C3' }]}>
              <Ionicons name="cash" size={14} color="#CA8A04" />
              <Text style={[styles.starsValue, { color: '#92400E' }]}>{coins}</Text>
              <Ionicons name="chevron-forward" size={12} color="#92400E" />
            </View>
          </TouchableOpacity>
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

        {/* Streak + Pity bar */}
        <View style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={[styles.streakFlame, isBonusDay && { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flame" size={20} color={isBonusDay ? '#F59E0B' : '#DC2626'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakValue}>{streak} gün ardıcıl</Text>
              <Text style={styles.streakHint}>
                {isBonusDay
                  ? '🔥 Bonus gün — adi mükafat avtomatik təkrar atılır'
                  : `${STREAK_BONUS_THRESHOLD - (streak % STREAK_BONUS_THRESHOLD)} gün sonra bonus`}
              </Text>
            </View>
          </View>
          <View style={styles.pityRow}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
            <View style={styles.pityBarBg}>
              <View style={[styles.pityBarFill, { width: `${Math.min(spinsSinceRarePlus * 10, 100)}%` }]} />
            </View>
            <Text style={styles.pityText}>
              {spinsSinceRarePlus >= 10 ? 'Zəmanətli nadir+' : `${10 - spinsSinceRarePlus} spin qaldı`}
            </Text>
          </View>
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
          <Animated.View style={[styles.wheel, wheelRotateStyle]}>
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
          </Animated.View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.85} onPress={spin} disabled={spinning || spinsLeft <= 0}>
            <LinearGradient
              colors={
                spinning || spinsLeft <= 0
                  ? [Colors.surfaceHigh, Colors.surfaceHigh]
                  : [Colors.gradientStart, Colors.gradientEnd]
              }
              style={styles.spinBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name={spinning ? 'sync' : spinsLeft <= 0 ? 'time' : 'flash'}
                size={18}
                color={spinning || spinsLeft <= 0 ? Colors.textSecondary : '#fff'}
              />
              <Text style={[styles.spinBtnText, (spinning || spinsLeft <= 0) && { color: Colors.textSecondary }]}>
                {spinning ? 'Fırlanır...' : spinsLeft <= 0 ? '24 saat sonra' : 'Fırlat'}
              </Text>
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
            <Text style={styles.infoCardValue}>{lastReward}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.infoIconBox, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="timer-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.infoCardMeta}>NÖVBƏTİ ŞANS</Text>
            <Text style={styles.infoCardValue}>{spinsLeft > 0 ? 'Hazır!' : '24 Saat Sonra'}</Text>
          </View>
        </View>

        {/* Recent history */}
        {history.length > 0 && (
          <View style={styles.historyCard}>
            <View style={styles.historyHead}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.historyTitle}>Son uduşların</Text>
            </View>
            {history.map((h) => {
              const meta = RARITY_META[h.rarity];
              return (
                <View key={h.id} style={styles.historyRow}>
                  <View style={[styles.historyDot, { backgroundColor: meta.color }]} />
                  <Text style={styles.historyLabel}>{h.label}</Text>
                  <View style={[styles.historyTag, { backgroundColor: meta.color + '1F' }]}>
                    <Text style={[styles.historyTagText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Rewards List */}
        <View style={styles.rewardsList}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.rewardsTitle}>Mümkün Mükafatlar</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={showAllRewards}>
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
  starsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  starsValue: { fontSize: 13, fontWeight: '800', color: Colors.primary },

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

  streakCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18, padding: 14, gap: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakFlame: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center',
  },
  streakValue: { fontSize: 14, fontWeight: '900', color: Colors.textPrimary },
  streakHint: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },

  pityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pityBarBg: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: Colors.surfaceLow,
    overflow: 'hidden',
  },
  pityBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  pityText: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary },

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
    width: SEG_WIDTH,
    alignItems: 'center',
  },
  segLabel: {
    fontSize: 9, fontWeight: '800', color: Colors.textPrimary,
    marginTop: 3, textAlign: 'center',
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
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

  historyCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18, padding: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  historyHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  historyTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  historyTag: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  historyTagText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
});
