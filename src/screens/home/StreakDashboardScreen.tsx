import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

/* Canlı "od" alov rəngi — streak enerjisi üçün */
const FLAME = '#FF6B2C';

const DAYS = [
  { labelKey: 'streak.wdMon', active: true },
  { labelKey: 'streak.wdTue', active: true },
  { labelKey: 'streak.wdWed', active: true },
  { labelKey: 'streak.wdThu', active: true },
  { labelKey: 'streak.wdFri', active: true },
  { labelKey: 'streak.wdSat', active: true },
  { labelKey: 'streak.wdSun', active: true, today: true },
];

/* ── Looping pulse flame ─────────────────────────────────────── */
function PulseFlame({ size, color, delay = 0 }: { size: number; color: string; delay?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.18, duration: 620, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(rot, { toValue: 1, duration: 620, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 620, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(rot, { toValue: 0, duration: 620, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ]),
    );
    const id = setTimeout(() => loop.start(), delay);
    return () => { clearTimeout(id); loop.stop(); };
  }, [scale, rot, delay]);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] });
  return (
    <Animated.View style={{ transform: [{ scale }, { rotate }] }}>
      <Ionicons name="flame" size={size} color={color} />
    </Animated.View>
  );
}

/* ── Mount entrance (fade + slide up) ────────────────────────── */
function Reveal({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 520, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/* ── Animated fill bar with moving shine ─────────────────────── */
function ProgressBar({ progress, delay = 300 }: { progress: number; delay?: number }) {
  const w = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(w, { toValue: progress, duration: 1100, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(600),
      ]),
    );
    const id = setTimeout(() => loop.start(), delay + 400);
    return () => { clearTimeout(id); loop.stop(); };
  }, [w, shine, progress, delay]);
  const width = w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const shineX = shine.interpolate({ inputRange: [0, 1], outputRange: [-40, 220] });
  return (
    <View style={styles.progTrack}>
      <Animated.View style={[styles.progFill, { width }]}>
        <Animated.View style={[styles.progShine, { transform: [{ translateX: shineX }, { skewX: '-20deg' }] }]} />
      </Animated.View>
    </View>
  );
}

/* ── Accurate animated ring (no SVG, two-cover mask) ─────────── */
function ProgressRing({
  size, stroke, progress, color, bg, delay = 400,
}: { size: number; stroke: number; progress: number; color: string; bg: string; delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const id = anim.addListener(({ value }) => setPct(Math.round(value * 100)));
    Animated.timing(anim, { toValue: progress, duration: 1300, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    return () => anim.removeListener(id);
  }, [anim, progress, delay]);
  const half = size / 2;
  const rightRot = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '180deg', '180deg'] });
  const leftRot = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '0deg', '180deg'] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* colored full ring underneath */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: half, borderWidth: stroke, borderColor: color }} />
      {/* right cover: hides first 50% remainder */}
      <View style={{ position: 'absolute', width: half, height: size, right: 0, top: 0, overflow: 'hidden' }}>
        <Animated.View
          style={{
            width: half, height: size, backgroundColor: bg,
            borderTopRightRadius: half, borderBottomRightRadius: half,
            transformOrigin: 'left center', transform: [{ rotate: rightRot }],
          }}
        />
      </View>
      {/* left cover: hides second 50% remainder */}
      <View style={{ position: 'absolute', width: half, height: size, left: 0, top: 0, overflow: 'hidden' }}>
        <Animated.View
          style={{
            width: half, height: size, backgroundColor: bg,
            borderTopLeftRadius: half, borderBottomLeftRadius: half,
            transformOrigin: 'right center', transform: [{ rotate: leftRot }],
          }}
        />
      </View>
      <Text style={styles.ringText}>{pct}%</Text>
    </View>
  );
}

/* ── Day bubble with entrance + today pulse ──────────────────── */
function DayBubble({ labelKey, today, index, t }: { labelKey: string; today?: boolean; index: number; t: (k: string) => string }) {
  const pop = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, delay: 200 + index * 70, friction: 5, tension: 90, useNativeDriver: true }).start();
    if (today) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      );
      const id = setTimeout(() => loop.start(), 700);
      return () => { clearTimeout(id); loop.stop(); };
    }
  }, [pop, pulse, index, today]);
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  return (
    <View style={styles.dayCol}>
      <Text style={[styles.dayLabel, today && { color: Colors.primary, fontWeight: '800' }]}>{t(labelKey)}</Text>
      <Animated.View style={{ transform: [{ scale: pop }] }}>
        {today && (
          <Animated.View
            pointerEvents="none"
            style={[styles.todayPulse, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]}
          />
        )}
        <View style={[styles.dayBubble, today && styles.dayBubbleToday]}>
          {today ? (
            <PulseFlame size={18} color={FLAME} />
          ) : (
            <Ionicons name="flame" size={18} color={FLAME} />
          )}
        </View>
      </Animated.View>
      {today && <View style={styles.todayDot} />}
    </View>
  );
}

export default function StreakDashboardScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  // Breathing CTA
  const cta = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cta, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(cta, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [cta]);
  const ctaScale = cta.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  // Glow breathing
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('streak.dashTitle')}</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8} onPress={() => navigation.navigate(Routes.Notifications)}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Streak Widget */}
        <Reveal delay={0}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.StreakDetail, { days: 7 })} style={styles.widgetCard}>
            <Animated.View style={[styles.widgetGlow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} pointerEvents="none" />
            <View style={styles.widgetTopRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.widgetTitle}>{t('streak.dashWeekStreak')}</Text>
                  <PulseFlame size={28} color={FLAME} />
                </View>
                <Text style={styles.widgetSub}>{t('streak.dashWidgetSub')}</Text>
              </View>
            </View>

            <View style={{ marginTop: 20, marginBottom: 20 }}>
              <View style={styles.progRow}>
                <Text style={styles.progLabel}>{t('streak.dashWeeklyGoal')}</Text>
                <Text style={styles.progValue}>{t('streak.dashSevenOfSeven')}</Text>
              </View>
              <ProgressBar progress={1} delay={350} />
            </View>

            <Animated.View style={[styles.widgetCta, { transform: [{ scale: ctaScale }] }]}>
              <Text style={styles.widgetCtaText}>{t('streak.dashContinue')}</Text>
            </Animated.View>
          </TouchableOpacity>
        </Reveal>

        {/* Weekly Activity */}
        <Reveal delay={90}>
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>{t('streak.dashWeeklyActivity')}</Text>
            <View style={styles.daysRow}>
              {DAYS.map((d, i) => (
                <DayBubble key={i} labelKey={d.labelKey} today={d.today} index={i} t={t} />
              ))}
            </View>
          </View>
        </Reveal>

        {/* Stats grid */}
        <Reveal delay={160}>
          <View style={styles.grid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="trophy" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statLabel}>{t('streak.dashLongest')}</Text>
              <Text style={styles.statValue}>{t('streak.dashFourteenDays')}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statLabel}>{t('streak.dashTotalActive')}</Text>
              <Text style={styles.statValue}>{t('streak.dashFortyTwoDays')}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardWide]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Ionicons name="flag" size={14} color={Colors.primary} />
                  <Text style={styles.statLabel}>{t('streak.dashNextTarget')}</Text>
                </View>
                <Text style={styles.statValueSmall}>{t('streak.dashTenDayStreak')}</Text>
              </View>
              <ProgressRing size={56} stroke={5} progress={0.7} color={Colors.primary} bg={Colors.surfaceLowest} delay={600} />
            </View>
          </View>
        </Reveal>

        {/* Streak alt-actions */}
        <Reveal delay={230}>
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>{t('streak.dashMore')}</Text>

            <TouchableOpacity
              style={styles.protectCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(Routes.StreakDetail, { days: 7 })}
            >
              <View style={[styles.protectIcon, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="trending-up" size={22} color="#ff4500" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.protectTitle}>{t('streak.dashDetailTitle')}</Text>
                <Text style={styles.protectSub}>{t('streak.dashDetailSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.protectCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(Routes.StreakProtection, { currentStreak: 12 })}
            >
              <View style={styles.protectIcon}>
                <Ionicons name="snow" size={22} color={Colors.primaryFixed} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.protectTitle}>{t('streak.dashProtectTitle')}</Text>
                <Text style={styles.protectSub}>{t('streak.dashProtectSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.protectCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(Routes.StreakRecovery)}
            >
              <View style={[styles.protectIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="refresh-circle" size={22} color={Colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.protectTitle}>{t('streak.dashRecoverTitle')}</Text>
                <Text style={styles.protectSub}>{t('streak.dashRecoverSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Reveal>

        {/* AI Motivation */}
        <Reveal delay={300}>
          <View style={styles.motivCard}>
            <View style={styles.motivIcon}>
              <Ionicons name="sparkles" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.motivTitle}>{t('streak.dashKimiSays')}</Text>
              <Text style={styles.motivText}>
                {t('streak.dashMotivPre')}<Text style={{ color: Colors.primary, fontWeight: '700' }}>{t('streak.dashMotivBold')}</Text>{t('streak.dashMotivPost')}
              </Text>
            </View>
          </View>
        </Reveal>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60, backgroundColor: Colors.surfaceLowest,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.danger,
    borderWidth: 2, borderColor: Colors.surfaceLowest,
  },

  scroll: { padding: 16, gap: 28, paddingBottom: 24 },

  widgetCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: Colors.borderLight,
    overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
  },
  widgetGlow: {
    position: 'absolute', top: -64, right: -64,
    width: 192, height: 192, borderRadius: 96, backgroundColor: Colors.primary + '1A',
  },
  widgetTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  widgetTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  widgetSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 6, lineHeight: 20 },

  progRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  progValue: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  progTrack: { height: 10, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999, overflow: 'hidden' },
  progShine: {
    position: 'absolute', top: 0, bottom: 0, width: 30,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  widgetCta: {
    backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
  },
  widgetCtaText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, paddingHorizontal: 4 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  dayCol: { alignItems: 'center', gap: 8, flex: 1, position: 'relative' },
  dayLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  dayBubble: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: FLAME + '1F',
    alignItems: 'center', justifyContent: 'center',
  },
  dayBubbleToday: {
    backgroundColor: Colors.primary,
    borderWidth: 2, borderColor: Colors.surfaceLowest,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  todayPulse: {
    position: 'absolute', top: 0, left: 0, width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
  },
  todayDot: { position: 'absolute', bottom: -8, width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flex: 1, minWidth: '47%',
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  statCardWide: { minWidth: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  statValueSmall: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },

  ringText: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary },

  motivCard: {
    flexDirection: 'row', gap: 16, alignItems: 'flex-start',
    backgroundColor: Colors.primary + '0D', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: Colors.primary + '1A',
  },
  motivIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 3,
  },
  motivTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  motivText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  protectCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: Colors.primaryFixed + '33',
  },
  protectIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  protectTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  protectSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
