import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const FIRE: [string, string] = ['#ff7b00', '#ff4500'];

const NODES = [
  { id: 'g1', label: 'G1', icon: 'checkmark' as const, done: true },
  { id: 'g2', label: 'G2', icon: 'checkmark' as const, done: true },
  { id: 'g3', label: 'G3', icon: 'checkmark' as const, done: true },
  { id: 'gx', label: '...', icon: 'ellipsis-horizontal' as const, done: true },
  { id: 'g7', label: 'Bugün', icon: 'checkmark' as const, done: true, today: true },
];

export default function StreakDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<HomeStackParamList, typeof Routes.StreakDetail>>();
  const days = route.params?.days ?? 7;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero flame */}
        <View style={styles.heroWrap}>
          <View style={styles.heroGlow} pointerEvents="none" />
          <View style={styles.heroInner}>
            <Text style={{ fontSize: 56 }}>🔥</Text>
          </View>
        </View>

        <View style={styles.heroText}>
          <LinearGradient colors={FIRE} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.daysBgWrap}>
            <Text style={styles.daysText}>{days} gün</Text>
          </LinearGradient>
          <Text style={styles.streakLabel}>streak</Text>
          <Text style={styles.heroSub}>Ardıcıl {days} gündür aktivsən!</Text>
        </View>

        {/* Target card */}
        <View style={styles.targetCard}>
          <View>
            <Text style={styles.targetKicker}>NÖVBƏTI HƏDƏF</Text>
            <Text style={styles.targetValue}>10 gün</Text>
          </View>
          <View style={styles.ringWrap}>
            <View style={styles.ringTrack} />
            <View style={styles.ringFill} />
            <Text style={styles.ringText}>{days}/10</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={styles.timelineLineBg} />
          <LinearGradient colors={FIRE} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.timelineLineActive, { width: '85%' }]} />
          {NODES.map((n) => (
            <View key={n.id} style={[styles.node, n.today && { transform: [{ translateY: -2 }] }]}>
              <LinearGradient
                colors={FIRE} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.nodeCircle, n.today && styles.nodeCircleToday]}
              >
                <Ionicons name={n.icon} size={n.today ? 22 : 16} color="#fff" />
              </LinearGradient>
              <Text style={[styles.nodeLabel, n.today && { color: Colors.primary, fontWeight: '800', fontSize: 12 }]}>
                {n.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.9} style={{ width: '100%' }}>
          <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBtn}>
            <Text style={styles.ctaText}>Bu gün də davam et</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: 24, paddingVertical: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
  },

  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 140, alignItems: 'center', gap: 28 },

  heroWrap: { width: 192, height: 192, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroGlow: { position: 'absolute', width: 192, height: 192, borderRadius: 96, backgroundColor: '#ff4500', opacity: 0.18 },
  heroInner: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#ff4500', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 6,
  },

  heroText: { alignItems: 'center', gap: 10 },
  daysBgWrap: { paddingHorizontal: 28, paddingVertical: 10, borderRadius: 999 },
  daysText: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  streakLabel: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  heroSub: { fontSize: 15, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' },

  targetCard: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2,
  },
  targetKicker: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1.2, marginBottom: 4 },
  targetValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },

  ringWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  ringTrack: { position: 'absolute', width: 56, height: 56, borderRadius: 28, borderWidth: 5, borderColor: Colors.surfaceHighest },
  ringFill: {
    position: 'absolute', width: 56, height: 56, borderRadius: 28, borderWidth: 5,
    borderColor: 'transparent',
    borderTopColor: Colors.primary, borderRightColor: Colors.primary, borderBottomColor: Colors.primary,
    transform: [{ rotate: '-45deg' }],
  },
  ringText: { fontSize: 11, fontWeight: '800', color: Colors.primary },

  timeline: {
    width: '100%',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    position: 'relative', paddingHorizontal: 4,
  },
  timelineLineBg: {
    position: 'absolute', left: 20, right: 20, top: '50%', height: 4,
    backgroundColor: Colors.surfaceHigh, borderRadius: 999, marginTop: -10,
  },
  timelineLineActive: {
    position: 'absolute', left: 20, top: '50%', height: 4, borderRadius: 999, marginTop: -10,
  },
  node: { alignItems: 'center', gap: 6, zIndex: 2 },
  nodeCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  nodeCircleToday: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 4, borderColor: '#fff',
    shadowColor: '#ff4500', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
  },
  nodeLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32,
    backgroundColor: Colors.background,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 18, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 6,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
