import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, Alert, Share, Dimensions } from 'react-native';
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
import { getSpinRewards, getSpinStatus, spinServer, SpinReward, SpinRarity } from '../../api/spin.api';
import { useTranslation } from '../../i18n';

type Props = { navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.SpinWheel> };

// Çarx ölçüsü ekran eninə uyğunlaşır — balaca telefonlarda (Samsung A5 2017 və s.)
// 280px sabit ölçü ekrandan daşırdı. Mövcud enə görə hesablanır.
const SCREEN_W = Math.min(Dimensions.get('window').width, Dimensions.get('window').height);
const WHEEL_SIZE = Math.max(220, Math.min(280, SCREEN_W - 72));
const CENTER = WHEEL_SIZE / 2;
const ICON_RADIUS = WHEEL_SIZE * 0.314; // 280→88 nisbətini saxlayır
const SEG_WIDTH = 60;

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Çarx seqmenti — admin paneldəki SpinReward-dan qurulur. Bücaq dinamik hesablanır.
type Segment = {
  id: string;
  icon: IoniconsName;
  iconColor: string;
  label: string;
  angle: number; // seqmentin mərkəz bucağı (dərəcə)
  rarity: SpinRarity;
  type: SpinReward['type'];
  value: number;
};

const RARITY_META: Record<SpinRarity, { labelKey: string; color: string }> = {
  common:    { labelKey: 'spin.rarityCommon',    color: '#16A34A' },
  rare:      { labelKey: 'spin.rarityRare',      color: Colors.primary },
  epic:      { labelKey: 'spin.rarityEpic',      color: '#A855F7' },
  legendary: { labelKey: 'spin.rarityLegendary', color: '#DC2626' },
};

// Backend mükafatlarından çarx seqmentləri qur (bərabər paylanmış bucaqlar).
const buildSegments = (rewards: SpinReward[]): Segment[] => {
  const active = rewards.filter((r) => r.isActive);
  const n = active.length;
  const step = n > 0 ? 360 / n : 360;
  return active.map((r, i) => ({
    id: r.id,
    icon: (r.icon || 'gift') as IoniconsName,
    iconColor: r.color || Colors.primary,
    label: r.label,
    angle: i * step + step / 2,
    rarity: r.rarity,
    type: r.type,
    value: Number(r.value) || 0,
  }));
};

const getItemPos = (angle: number) => {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    left: CENTER + ICON_RADIUS * Math.cos(rad) - SEG_WIDTH / 2,
    top: CENTER + ICON_RADIUS * Math.sin(rad) - 22,
  };
};

// Seqmentlər arası ayırıcı xətlərin bucaqları (diametr boyu xətt = 2 sərhəd). 180°-dən kiçik unikal sərhədlər.
const dividerAngles = (n: number): number[] => {
  if (n <= 1) return [];
  const step = 360 / n;
  const set = new Set<number>();
  for (let i = 0; i < n; i++) set.add(Math.round((i * step) % 180));
  return [...set];
};

export default function SpinWheelScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { coins, stars, history, addCoins, addStars, addHistoryEntry } = useSpinWheelStore();

  const [segments, setSegments] = useState<Segment[]>([]);
  const [spinsLeft, setSpinsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<string>('—');
  const [confettiOn, setConfettiOn] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const totalRotation = useRef(0);

  // Backenddən seqmentlər + limit yüklə
  const load = useCallback(async () => {
    try {
      const [rewards, status] = await Promise.all([getSpinRewards(), getSpinStatus()]);
      setSegments(buildSegments(rewards));
      setSpinsLeft(status.spinsLeft);
    } catch {
      // şəbəkə xətası — boş qalır, istifadəçi sonra yenidən cəhd edə bilər
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Ekrandan çıxarkən fırlanma səsini dayandır
  useEffect(() => () => { stopSpin(); }, []);

  // restore latest reward label from persistent history
  useEffect(() => {
    if (history.length > 0 && lastReward === '—') setLastReward(history[0].label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const { streak, spinsSinceRarePlus, registerSpin } = useSpinStreakStore();
  const isBonusDay = streak > 0 && streak % STREAK_BONUS_THRESHOLD === 0;

  const spin = async () => {
    if (spinning) return;
    if (spinsLeft <= 0) {
      Alert.alert(
        t('spin.noChanceTitle'),
        t('spin.noChanceBody'),
        [{ text: t('spin.close'), style: 'cancel' }],
      );
      return;
    }
    if (segments.length === 0) {
      Alert.alert(t('spin.notReadyTitle'), t('spin.notReadyBody'));
      return;
    }

    setSpinning(true);
    hapticMedium();
    playSpin(); // çarx fırlanma səsi (yavaşlayan tıqqıltı)

    // SERVER mükafatı seçir (çəkiyə görə), limiti azaldır və admin paneldə loglayır.
    let result;
    try {
      result = await spinServer();
    } catch (err: any) {
      setSpinning(false);
      stopSpin();
      const msg = err?.response?.data?.message ?? t('spin.spinFailed');
      Alert.alert(t('spin.errorTitle'), String(msg));
      load(); // limit/statusu yenilə
      return;
    }

    const segIndex = Math.max(0, segments.findIndex((s) => s.id === result.reward.id));
    const targetSeg = segments[segIndex] ?? segments[0];
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
      setSpinsLeft((n) => Math.max(0, n - 1));

      // Mükafat səsi + titrəyiş (nadirliyə uyğun)
      playReward(targetSeg.rarity);
      if (targetSeg.rarity === 'legendary') hapticHeavy();
      else if (targetSeg.rarity === 'common') hapticLight();
      else hapticSuccess();

      setLastReward(targetSeg.label);
      addHistoryEntry({
        id: `h-${Date.now()}`,
        label: targetSeg.label,
        rarity: targetSeg.rarity,
        at: Date.now(),
      });

      // Lokal balans göstəricisini yenilə (server coin-i onsuz da hesaba yazıb)
      if (targetSeg.type === 'xp' && targetSeg.value) addStars(targetSeg.value);
      if (targetSeg.type === 'coin' && targetSeg.value) addCoins(targetSeg.value);

      const meta = RARITY_META[targetSeg.rarity];
      const detail =
        targetSeg.type === 'xp' ? t('spin.detailXp', { n: targetSeg.value }) :
        targetSeg.type === 'coin' ? t('spin.detailCoin', { n: targetSeg.value }) :
        targetSeg.type === 'premium' ? t('spin.detailPremium') :
        targetSeg.type === 'spin' ? t('spin.detailSpin') :
        t('spin.detailGift');

      const isRarePlus = targetSeg.rarity !== 'common';
      const { newStreak, isBonusDay: hitBonus } = registerSpin(isRarePlus);

      // Confetti for epic+ wins
      if (targetSeg.rarity === 'epic' || targetSeg.rarity === 'legendary') {
        setConfettiOn(true);
        setTimeout(() => setConfettiOn(false), 3000);
      }

      const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'default' }[] = [
        { text: t('spin.awesome'), style: 'default' },
      ];
      if (targetSeg.rarity === 'legendary') {
        buttons.unshift({
          text: t('spin.share'),
          onPress: () =>
            Share.share({
              message: t('spin.shareMsg', { label: targetSeg.label }),
            }).catch(() => {}),
        });
      }

      Alert.alert(
        t('spin.rewardAlertTitle', { rarity: t(meta.labelKey) }),
        t('spin.rewardBody', { label: targetSeg.label, detail }) + (hitBonus ? t('spin.streakBonus', { n: newStreak }) : ''),
        buttons,
      );
    });
  };

  const showAllRewards = () => {
    if (segments.length === 0) { Alert.alert(t('spin.allRewardsTitle'), t('spin.noRewardsYet')); return; }
    const lines = segments.map((s) => `${t(RARITY_META[s.rarity].labelKey).padEnd(10, ' ')} · ${s.label}`).join('\n');
    Alert.alert(t('spin.allPossibleTitle'), lines);
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
        <Text style={styles.headerTitle}>{t('spin.headerTitle')}</Text>
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
            <Text style={styles.heroBadgeText}>{t('spin.heroBadge')}</Text>
          </View>
          <Text style={styles.heroTitle}>
            {t('spin.heroTitle1')}<Text style={{ color: Colors.primary }}>{t('spin.heroTitleAccent')}</Text>{t('spin.heroTitle2')}
          </Text>
        </View>

        {/* Streak + Pity bar */}
        <View style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={[styles.streakFlame, isBonusDay && { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flame" size={20} color={isBonusDay ? '#F59E0B' : '#DC2626'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakValue}>{t('spin.streakDays', { n: streak })}</Text>
              <Text style={styles.streakHint}>
                {isBonusDay
                  ? t('spin.bonusDayHint')
                  : t('spin.daysToBonus', { n: STREAK_BONUS_THRESHOLD - (streak % STREAK_BONUS_THRESHOLD) })}
              </Text>
            </View>
          </View>
          <View style={styles.pityRow}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
            <View style={styles.pityBarBg}>
              <View style={[styles.pityBarFill, { width: `${Math.min(spinsSinceRarePlus * 10, 100)}%` }]} />
            </View>
            <Text style={styles.pityText}>
              {spinsSinceRarePlus >= 10 ? t('spin.pityGuaranteed') : t('spin.pityLeft', { n: 10 - spinsSinceRarePlus })}
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

          {/* Statik kölgə/fon dairəsi — kölgə fırlanan view-da olduqda
              Android-də animasiya zamanı çarx itirdi. Kölgəni buraya köçürdük. */}
          <View style={styles.wheelShadow} pointerEvents="none" />

          {/* Wheel Circle */}
          <Animated.View style={[styles.wheel, wheelRotateStyle]}>
            {/* Light aura tint */}
            <View style={styles.wheelTint} />

            {/* Divider Lines — seqment sayına görə dinamik */}
            {dividerAngles(segments.length).map((angle) => (
              <View
                key={angle}
                style={[styles.dividerLine, { transform: [{ rotate: `${angle}deg` }] }]}
              />
            ))}

            {/* Segment Icon + Label */}
            {segments.map((seg) => {
              const pos = getItemPos(seg.angle);
              return (
                <View key={seg.id} style={[styles.segItem, { left: pos.left, top: pos.top }]}>
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
                {spinning ? t('spin.spinning') : spinsLeft <= 0 ? t('spin.after24h') : t('spin.spinBtn')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.spinsLeftRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.spinsLeftText}>{t('spin.spinsLeft', { n: spinsLeft })}</Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={[styles.infoIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="time" size={20} color="#10B981" />
            </View>
            <Text style={styles.infoCardMeta}>{t('spin.lastWin')}</Text>
            <Text style={styles.infoCardValue}>{lastReward}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.infoIconBox, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="timer-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.infoCardMeta}>{t('spin.nextChance')}</Text>
            <Text style={styles.infoCardValue}>{spinsLeft > 0 ? t('spin.ready') : t('spin.after24hTitle')}</Text>
          </View>
        </View>

        {/* Recent history */}
        {history.length > 0 && (
          <View style={styles.historyCard}>
            <View style={styles.historyHead}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.historyTitle}>{t('spin.recentWins')}</Text>
            </View>
            {history.map((h) => {
              const meta = RARITY_META[h.rarity];
              return (
                <View key={h.id} style={styles.historyRow}>
                  <View style={[styles.historyDot, { backgroundColor: meta.color }]} />
                  <Text style={styles.historyLabel}>{h.label}</Text>
                  <View style={[styles.historyTag, { backgroundColor: meta.color + '1F' }]}>
                    <Text style={[styles.historyTagText, { color: meta.color }]}>{t(meta.labelKey)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Rewards List */}
        <View style={styles.rewardsList}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.rewardsTitle}>{t('spin.possibleRewards')}</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={showAllRewards}>
              <Text style={styles.rewardsAll}>{t('spin.all')}</Text>
            </TouchableOpacity>
          </View>

          {segments.length === 0 && (
            <Text style={{ fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 12 }}>
              {loading ? t('spin.loading') : t('spin.noRewardsYet')}
            </Text>
          )}
          {segments.map((seg) => {
            const meta = RARITY_META[seg.rarity];
            const sub =
              seg.type === 'xp' ? t('spin.subXp', { n: seg.value }) :
              seg.type === 'coin' ? t('spin.subCoin', { n: seg.value }) :
              seg.type === 'premium' ? t('spin.subPremium') :
              seg.type === 'spin' ? t('spin.subSpin') :
              t('spin.subGift');
            return (
              <View key={seg.id} style={styles.rewardRow}>
                <View style={[styles.rewardIconBox, { backgroundColor: seg.iconColor + '1F' }]}>
                  <Ionicons name={seg.icon} size={22} color={seg.iconColor} />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>{seg.label}</Text>
                  <Text style={styles.rewardSub}>{sub}</Text>
                </View>
                <View style={[styles.rewardBadge, { backgroundColor: meta.color + '18' }]}>
                  <Text style={[styles.rewardBadgeText, { color: meta.color }]}>{t(meta.labelKey)}</Text>
                </View>
              </View>
            );
          })}
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

  // Statik kölgə dairəsi (fırlanmır) — Android elevation+rotate glitch-inin qarşısını alır.
  wheelShadow: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#fff',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 6,
  },
  // DİQQƏT: overflow:'hidden' qoymayın! Köhnə Android-də (A5 2017 = Android 7)
  // overflow:hidden + borderRadius + rotate transform birlikdə olanda fırlanan
  // view-un bütün uşaq elementləri (ikonlar, hub, xətlər) görünməz olur → çarx boş çıxır.
  // Heç bir element onsuz da dairədən kənara çıxmır, ona görə clipping lazım deyil.
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 10,
    borderColor: '#fff',
    position: 'relative',
  },
  wheelTint: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: Colors.primaryLight,
    opacity: 0.25,
  },
  // En = WHEEL_SIZE - 2*border (20) ki, clipping olmadan da xətt diskin içində qalsın.
  dividerLine: {
    position: 'absolute',
    width: WHEEL_SIZE - 20,
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
