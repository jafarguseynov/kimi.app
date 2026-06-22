import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Params = {
  mode?: 'bot' | 'live';
  opponentName?: string;
  opponentLevel?: number;
  subject?: string;
  questionCount?: number;
  prize?: number;
  stake?: number;
};

const LIVE_OPPONENTS = [
  { name: 'Leyla', level: 14 },
  { name: 'Aytən', level: 12 },
  { name: 'Murad', level: 13 },
  { name: 'Səbinə', level: 11 },
  { name: 'Cavid', level: 15 },
];

export default function DuelMatchScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useUserStore();
  const { t } = useTranslation();
  const p: Params = (route.params ?? {}) as Params;

  const mode: 'bot' | 'live' = p.mode ?? 'live';
  const subject = p.subject ?? 'Azərbaycan Dili';
  const questionCount = p.questionCount ?? 10;
  const stake = p.stake ?? 25;
  const prize = p.prize ?? stake * 2;
  const myName = user?.name?.split(' ')[0] ?? t('duel.me');
  const myLevel = 12;

  const [phase, setPhase] = useState<'matching' | 'ready'>(mode === 'bot' ? 'ready' : 'matching');
  const [opponent, setOpponent] = useState<{ name: string; level: number }>(() => {
    if (mode === 'bot') {
      return { name: p.opponentName ?? 'Robo-Kimi', level: p.opponentLevel ?? myLevel };
    }
    return { name: p.opponentName ?? '...', level: p.opponentLevel ?? 0 };
  });

  const pulse = useRef(new Animated.Value(0.4)).current;
  const searchSpin = useRef(new Animated.Value(0)).current;
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(searchSpin, { toValue: 1, duration: 1600, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    if (mode !== 'live' || phase !== 'matching') return;
    const timer = setTimeout(() => {
      const pick = LIVE_OPPONENTS[Math.floor(Math.random() * LIVE_OPPONENTS.length)];
      setOpponent(pick);
      setPhase('ready');
    }, 2800);
    return () => clearTimeout(timer);
  }, [mode, phase]);

  const opponentName = opponent.name;
  const opponentLevel = opponent.level;
  const isBot = mode === 'bot';
  const searchRotate = searchSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  useEffect(() => {
    if (countdown === null) return;
    countdownScale.setValue(0.6);
    Animated.spring(countdownScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (countdown === 0) {
      const timer = setTimeout(() => {
        navigation.replace(Routes.DuelSession, {
          mode,
          opponentName,
          opponentLevel,
          subject,
          questionCount,
          stake,
        });
      }, 700);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 900);
    return () => clearTimeout(timer);
  }, [countdown]);

  const startDuel = () => setCountdown(3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('duel.matchTitle')}</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          hitSlop={8}
          onPress={() =>
            Alert.alert(
              t('duel.whatTitle'),
              t('duel.whatBody'),
              [{ text: t('duel.gotIt') }],
            )
          }
        >
          <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            {phase === 'matching'
              ? t('duel.searching')
              : isBot
              ? t('duel.botReady')
              : t('duel.opponentFound')}
          </Text>
          <Text style={styles.heroSub}>
            {phase === 'matching'
              ? t('duel.searchingSub')
              : t('duel.readySub')}
          </Text>
        </View>

        {/* Duel canvas */}
        <View style={styles.duelCanvas}>
          <View style={styles.duelGlow} pointerEvents="none" />

          {/* Me */}
          <View style={styles.player}>
            <LinearGradient
              colors={GRADIENT}
              style={styles.playerRing}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <View style={styles.playerInner}>
                <Ionicons name="person" size={36} color={Colors.primary} />
              </View>
            </LinearGradient>
            <View style={[styles.levelBadge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.levelBadgeText}>{t('duel.level')} {myLevel}</Text>
            </View>
            <Text style={styles.playerName}>{myName}</Text>
          </View>

          {/* VS */}
          <View style={styles.vsWrap}>
            <View style={styles.vsRingOuter} />
            <View style={styles.vsRingMid} />
            <LinearGradient
              colors={GRADIENT}
              style={styles.vsCircle}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Text style={styles.vsText}>VS</Text>
            </LinearGradient>
          </View>

          {/* Opponent */}
          <View style={styles.player}>
            <LinearGradient
              colors={isBot ? [Colors.primaryFixed, Colors.primary] : [Colors.error, '#fb5151']}
              style={styles.playerRing}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <View style={styles.playerInner}>
                {phase === 'matching' ? (
                  <Animated.View style={{ transform: [{ rotate: searchRotate }] }}>
                    <Ionicons name="search" size={32} color={Colors.textSecondary} />
                  </Animated.View>
                ) : (
                  <Ionicons
                    name={isBot ? 'hardware-chip' : 'person'}
                    size={36}
                    color={isBot ? Colors.primary : Colors.error}
                  />
                )}
              </View>
            </LinearGradient>
            <View style={[
              styles.levelBadge,
              { backgroundColor: isBot ? Colors.primary : Colors.error },
              phase === 'matching' && { backgroundColor: Colors.textSecondary },
            ]}>
              <Text style={styles.levelBadgeText}>
                {phase === 'matching' ? '...' : isBot ? t('duel.bot') : `${t('duel.level')} ${opponentLevel}`}
              </Text>
            </View>
            <Text style={styles.playerName}>
              {phase === 'matching' ? t('duel.searchingShort') : opponentName}
            </Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.prizeRow}>
            <View style={styles.prizeIcon}>
              <Ionicons name="trophy" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.prizeTitle}>{t('duel.prizeAmount', { n: prize })}</Text>
              <Text style={styles.prizeSub}>
                {t('duel.stakeWinnerTakes', { n: stake })}
              </Text>
            </View>
          </View>
          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>{t('duel.topicUpper')}</Text>
              <Text style={styles.metaValue}>{subject}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>{t('duel.questionsUpper')}</Text>
              <Text style={styles.metaValue}>{questionCount} {t('duel.qShort')}</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={{ width: '100%' }}
          activeOpacity={0.9}
          onPress={startDuel}
          disabled={countdown !== null || phase === 'matching'}
        >
          <LinearGradient
            colors={phase === 'matching' ? [Colors.borderLight, Colors.borderLight] : GRADIENT}
            style={styles.startBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.startBtnText, phase === 'matching' && { color: Colors.textSecondary }]}>
              {phase === 'matching' ? t('duel.waitDots') : t('duel.start')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.waitingRow}>
          <Animated.View style={[styles.waitingDot, { opacity: pulse }]} />
          <Text style={styles.waitingText}>
            {phase === 'matching'
              ? t('duel.searching')
              : isBot
              ? t('duel.botTuned')
              : t('duel.opponentReady')}
          </Text>
        </View>
      </View>

      {/* Countdown overlay */}
      <Modal visible={countdown !== null} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.overlay}>
          <Text style={styles.overlayHint}>{t('duel.duelStarting')}</Text>
          <Animated.View style={[styles.countdownWrap, { transform: [{ scale: countdownScale }] }]}>
            <LinearGradient
              colors={GRADIENT}
              style={styles.countdownCircle}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Text style={styles.countdownText}>
                {countdown === 0 ? t('duel.go') : countdown}
              </Text>
            </LinearGradient>
          </Animated.View>
          <Text style={styles.overlaySub}>{myName} vs {opponentName}</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  headerAccent: { fontSize: 16, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  main: { flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: 'center' },

  hero: { alignItems: 'center', marginBottom: 32 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6, marginBottom: 6 },
  heroSub: { fontSize: 13, color: Colors.textSecondary },

  duelCanvas: {
    width: '100%',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 24, marginBottom: 24,
    position: 'relative',
  },
  duelGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.primaryFixed + '22',
    borderRadius: 999,
    transform: [{ scaleX: 1.2 }],
  },
  player: { alignItems: 'center', position: 'relative', zIndex: 2 },
  playerRing: {
    width: 96, height: 96, borderRadius: 48, padding: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4,
  },
  playerInner: {
    flex: 1, borderRadius: 44,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.surface,
  },
  levelBadge: {
    position: 'absolute', top: 84, left: '50%',
    transform: [{ translateX: -38 }],
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3,
    minWidth: 76, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  levelBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  playerName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginTop: 24 },

  vsWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 },
  vsRingOuter: {
    position: 'absolute', width: 96, height: 96, borderRadius: 48,
    borderWidth: 1, borderColor: Colors.primaryFixed, opacity: 0.2,
  },
  vsRingMid: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: Colors.primaryFixed, opacity: 0.5,
  },
  vsCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  vsText: { fontSize: 22, fontWeight: '900', color: '#fff', fontStyle: 'italic', letterSpacing: -1 },

  infoCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 20, gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.06, shadowRadius: 28, elevation: 2,
    marginBottom: 24,
  },
  prizeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prizeIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  prizeTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  prizeSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  metaGrid: { flexDirection: 'row', gap: 10 },
  metaCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: Colors.surfaceLow,
    borderRadius: 14, paddingVertical: 12,
  },
  metaLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2, marginBottom: 4 },
  metaValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  startBtn: {
    width: '100%', borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  startBtnText: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },

  waitingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24 },
  waitingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  waitingText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },

  overlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.85)',
    alignItems: 'center', justifyContent: 'center', gap: 28,
  },
  overlayHint: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  countdownWrap: { alignItems: 'center', justifyContent: 'center' },
  countdownCircle: {
    width: 180, height: 180, borderRadius: 90,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 40, elevation: 12,
  },
  countdownText: { fontSize: 72, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  overlaySub: { fontSize: 16, fontWeight: '700', color: '#fff', opacity: 0.85 },
});
