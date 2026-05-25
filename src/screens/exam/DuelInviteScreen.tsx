import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Vibration,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Params = {
  challengerName?: string;
  challengerLevel?: number;
  challengerSchool?: string;
  challengerXp?: number;
  challengerWinRate?: number;
  subject?: string;
  questionCount?: number;
  stake?: number;
};

const AUTO_DECLINE_SECONDS = 30;

export default function DuelInviteScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const p: Params = (route.params ?? {}) as Params;

  const challengerName = p.challengerName ?? 'Leyla Hüseynova';
  const challengerLevel = p.challengerLevel ?? 14;
  const challengerSchool = p.challengerSchool ?? 'Bakı 23 №-li məktəb';
  const challengerXp = p.challengerXp ?? 4280;
  const challengerWinRate = p.challengerWinRate ?? 68;
  const subject = p.subject ?? 'Riyaziyyat';
  const questionCount = p.questionCount ?? 10;
  const stake = p.stake ?? 25;

  const [timeLeft, setTimeLeft] = useState(AUTO_DECLINE_SECONDS);
  const pulse = useRef(new Animated.Value(0)).current;
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  useEffect(() => {
    Vibration.vibrate([0, 200, 120, 200]);
    Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ).start();
  }, [pulse]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearInterval(t);
          decline();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const decline = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const accept = () => {
    navigation.replace(Routes.DuelMatch, {
      mode: 'live',
      opponentName: challengerName,
      opponentLevel: challengerLevel,
      subject,
      questionCount,
      prize: stake * 2,
      stake,
    });
  };

  const initials = challengerName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topRow}>
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTagText}>CANLI DƏVƏT</Text>
        </View>
        <View style={styles.timerPill}>
          <Ionicons name="time" size={13} color={timeLeft < 10 ? Colors.error : Colors.textSecondary} />
          <Text style={[styles.timerPillText, timeLeft < 10 && { color: Colors.error }]}>
            {timeLeft}s
          </Text>
        </View>
      </View>

      <View style={styles.heroWrap}>
        <Animated.View
          style={[
            styles.pulseRing,
            { transform: [{ scale: ringScale }], opacity: ringOpacity },
          ]}
        />
        <LinearGradient
          colors={GRADIENT}
          style={styles.avatarRing}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </LinearGradient>
        <View style={styles.levelBadge}>
          <Ionicons name="flame" size={12} color="#fff" />
          <Text style={styles.levelBadgeText}>LVL {challengerLevel}</Text>
        </View>
      </View>

      <Text style={styles.title}>{challengerName}</Text>
      <Text style={styles.subtitle}>səni 1v1 duelə dəvət edir</Text>
      <Text style={styles.school}>{challengerSchool}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Ionicons name="flash" size={16} color="#F59E0B" />
          <Text style={styles.statValue}>{challengerXp.toLocaleString()}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <Ionicons name="trophy" size={16} color={Colors.primary} />
          <Text style={styles.statValue}>{challengerWinRate}%</Text>
          <Text style={styles.statLabel}>Qalibiyyət</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <Ionicons name="medal" size={16} color="#16A34A" />
          <Text style={styles.statValue}>{Math.round(challengerXp / 200)}</Text>
          <Text style={styles.statLabel}>Medal</Text>
        </View>
      </View>

      <View style={styles.matchCard}>
        <View style={styles.matchRow}>
          <View style={styles.matchIcon}>
            <Ionicons name="book" size={16} color={Colors.primary} />
          </View>
          <Text style={styles.matchLabel}>Mövzu</Text>
          <Text style={styles.matchValue}>{subject}</Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.matchRow}>
          <View style={styles.matchIcon}>
            <Ionicons name="list" size={16} color={Colors.primary} />
          </View>
          <Text style={styles.matchLabel}>Sual sayı</Text>
          <Text style={styles.matchValue}>{questionCount} sual</Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.matchRow}>
          <View style={[styles.matchIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="flash" size={16} color="#F59E0B" />
          </View>
          <Text style={styles.matchLabel}>Mərc</Text>
          <Text style={styles.matchValue}>{stake} XP</Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.matchRow}>
          <View style={[styles.matchIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="trophy" size={16} color="#16A34A" />
          </View>
          <Text style={styles.matchLabel}>Mükafat</Text>
          <Text style={[styles.matchValue, { color: '#15803D' }]}>{stake * 2} XP</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.85} onPress={decline} style={styles.declineBtn}>
          <Ionicons name="close" size={20} color={Colors.error} />
          <Text style={styles.declineText}>İmtina et</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.9} onPress={accept} style={{ flex: 1.4 }}>
          <LinearGradient colors={GRADIENT} style={styles.acceptBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="flash" size={18} color="#fff" />
            <Text style={styles.acceptText}>Qəbul et və başla</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20, paddingBottom: 20 },

  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10,
  },
  liveTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#DC2626' },
  liveTagText: { fontSize: 10, fontWeight: '800', color: '#991B1B', letterSpacing: 0.8 },
  timerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  timerPillText: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary },

  heroWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 12, height: 160 },
  pulseRing: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary,
  },
  avatarRing: {
    width: 132, height: 132, borderRadius: 66, padding: 5,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.3, shadowRadius: 22, elevation: 8,
  },
  avatarInner: {
    flex: 1, borderRadius: 62,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 38, fontWeight: '900', color: Colors.primary, letterSpacing: -1 },
  levelBadge: {
    position: 'absolute', bottom: 6,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 4,
  },
  levelBadgeText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  title: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  school: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, fontStyle: 'italic' },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, paddingVertical: 12,
    marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 15, fontWeight: '900', color: Colors.textPrimary, marginTop: 2 },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.borderLight },

  matchCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6,
    marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  matchIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  matchLabel: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  matchValue: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  rowDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 44 },

  actions: { flexDirection: 'row', gap: 10, marginTop: 'auto' },
  declineBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 999, paddingVertical: 16,
  },
  declineText: { fontSize: 14, fontWeight: '800', color: Colors.error },
  acceptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  acceptText: { fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 0.4 },
});
