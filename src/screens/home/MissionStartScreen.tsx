import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface Task {
  id: string;
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}

const TASKS: Task[] = [
  { id: 't1', title: '1 test et', sub: 'Biliklərini yoxla', icon: 'document-text', iconBg: Colors.secondaryContainer + '80', iconColor: Colors.primary },
  { id: 't2', title: '5 sual cavabla', sub: 'Söhbətə qoşul', icon: 'chatbubble-ellipses', iconBg: Colors.tertiaryContainer + '4D', iconColor: Colors.tertiary },
  { id: 't3', title: '3 flashcard öyrən', sub: 'Yeni sözlər kəşf et', icon: 'albums', iconBg: Colors.surfaceHighest, iconColor: Colors.primaryDim },
];

interface Mission {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  reward: string;
  done: boolean;
}

const MISSIONS: Mission[] = [
  { id: 'm1', icon: 'checkmark-circle', title: '10 sual həll et', reward: 'Mükafat: +50 XP', done: true },
  { id: 'm2', icon: 'checkmark-circle', title: '1 İmtahan ver', reward: 'Mükafat: +100 XP', done: true },
  { id: 'm3', icon: 'book', title: '3 Mövzu oxu', reward: 'Mükafat: +75 XP', done: false },
];

interface Reward { id: string; title: string; sub: string; icon: keyof typeof Ionicons.glyphMap; color: string; locked?: boolean; }
const REWARDS: Reward[] = [
  { id: 'r1', title: '150 Coin', sub: 'Bütün missiyaları bitir', icon: 'logo-bitcoin', color: '#FFB020' },
  { id: 'r2', title: 'Gümüş Sandıq', sub: 'Həftəlik hədəf', icon: 'lock-closed', color: Colors.textLight, locked: true },
  { id: 'r3', title: 'Qızıl Sandıq', sub: 'Aylıq hədəf', icon: 'lock-closed', color: Colors.textLight, locked: true },
];

const DONE_COUNT = MISSIONS.filter((m) => m.done).length;
const PROGRESS = DONE_COUNT / MISSIONS.length;

type Tab = 'today' | 'progress';

export default function MissionStartScreen() {
  const navigation = useNavigation<any>();
  const [view, setView] = useState<Tab>('today');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Missiyalar</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={pairTab.row}>
          <TouchableOpacity onPress={() => setView('today')} style={[pairTab.btn, view === 'today' && pairTab.btnActive]}>
            <Text style={[pairTab.text, view === 'today' && pairTab.textActive]}>Bugünkü</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setView('progress')} style={[pairTab.btn, view === 'progress' && pairTab.btnActive]}>
            <Text style={[pairTab.text, view === 'progress' && pairTab.textActive]}>Tərəqqi</Text>
          </TouchableOpacity>
        </View>

        {view === 'today' ? <TodayView /> : <ProgressView />}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TodayView() {
  return (
    <>
      <View style={{ gap: 6 }}>
        <Text style={styles.h2}>Bugünkü missiyalar</Text>
        <Text style={styles.h2Sub}>Tapşırıqları tamamla və irəlilə</Text>
      </View>

      <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={[styles.heroBlob, { right: -24, bottom: -24, width: 128, height: 128 }]} />
        <View style={[styles.heroBlob, { left: -24, top: -24, width: 96, height: 96 }]} />
        <View style={styles.heroIcon}>
          <Ionicons name="flame" size={26} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>Bu gün 3 tapşırıq səni gözləyir 🔥</Text>
        <View style={styles.heroBarTrack}>
          <View style={styles.heroBarFill} />
        </View>
        <Text style={styles.heroBarLabel}>0/3 Tamamlandı</Text>
      </LinearGradient>

      <View style={{ gap: 14 }}>
        {TASKS.map((t) => (
          <TouchableOpacity key={t.id} activeOpacity={0.85} style={styles.taskCard}>
            <View style={styles.checkbox} />
            <View style={[styles.taskIcon, { backgroundColor: t.iconBg }]}>
              <Ionicons name={t.icon} size={20} color={t.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{t.title}</Text>
              <Text style={styles.taskSub}>{t.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rewardChipWrap}>
        <View style={styles.rewardChip}>
          <Ionicons name="gift" size={18} color={Colors.primaryFixedDim} />
          <Text style={styles.rewardChipText}>Tamamla və mükafat qazan 🎁</Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.9}>
        <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBtn}>
          <Text style={styles.ctaText}>Başla</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
}

function ProgressView() {
  return (
    <>
      <View style={styles.progressCard}>
        <View style={[styles.blob, { top: -40, left: -40 }]} />
        <View style={[styles.blob, { bottom: -40, right: -40 }]} />
        <Text style={styles.progressLabel}>{DONE_COUNT}/{MISSIONS.length} Missiya tamamlandı</Text>

        <View style={styles.ringWrap}>
          <View style={styles.ringTrack} />
          <View style={[styles.ringFill, { transform: [{ rotate: PROGRESS >= 0.5 ? '45deg' : '-45deg' }] }]} />
          <View style={styles.ringInner}>
            <Ionicons name="ribbon" size={40} color={Colors.primary} />
          </View>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        {MISSIONS.map((m) => (
          <View key={m.id} style={[styles.missionCard, m.done && styles.missionCardDone, !m.done && styles.missionCardActive]}>
            <View style={[styles.missionIcon, !m.done && { backgroundColor: Colors.primaryFixed + '33' }]}>
              <Ionicons name={m.icon} size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.missionTitle, m.done && styles.missionTitleDone]}>{m.title}</Text>
              <Text style={styles.missionReward}>{m.reward}</Text>
            </View>
            {m.done ? (
              <View style={styles.donePill}><Text style={styles.donePillText}>Tamamlandı</Text></View>
            ) : (
              <TouchableOpacity activeOpacity={0.9} style={styles.startBtn}>
                <Text style={styles.startBtnText}>Başla</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <View style={{ gap: 16, marginTop: 8 }}>
        <Text style={styles.sectionTitle}>Gündəlik Mükafatlar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 16 }}>
          {REWARDS.map((r) => (
            <View key={r.id} style={[styles.rewardCard, r.locked && { opacity: 0.55 }]}>
              <View style={styles.rewardIcon}>
                <Ionicons name={r.icon} size={28} color={r.color} />
              </View>
              <Text style={styles.rewardTitle}>{r.title}</Text>
              <Text style={styles.rewardSub}>{r.sub}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 56,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainer,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 24 },

  h2: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4 },
  h2Sub: { fontSize: 15, color: Colors.textSecondary },

  hero: {
    borderRadius: 28, padding: 24, gap: 14, overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 28, elevation: 6,
  },
  heroBlob: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff', opacity: 0.1 },
  heroIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#fff', lineHeight: 26, letterSpacing: -0.3 },
  heroBarTrack: { width: '100%', height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  heroBarFill: { width: '33%', height: '100%', borderRadius: 999, backgroundColor: '#fff' },
  heroBarLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  taskCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 18,
  },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.outlineVariant + '4D' },
  taskIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  taskSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  rewardChipWrap: { alignItems: 'center' },
  rewardChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceLow, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999,
  },
  rewardChipText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 18, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 6,
  },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  progressCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 32, padding: 24,
    alignItems: 'center', overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 28, elevation: 3,
  },
  blob: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.primaryFixed, opacity: 0.15 },
  progressLabel: { fontSize: 17, fontWeight: '600', color: Colors.textSecondary, marginBottom: 16 },
  ringWrap: { width: 128, height: 128, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringTrack: { position: 'absolute', width: 128, height: 128, borderRadius: 64, borderWidth: 8, borderColor: Colors.surfaceContainer },
  ringFill: {
    position: 'absolute', width: 128, height: 128, borderRadius: 64, borderWidth: 8,
    borderColor: 'transparent', borderTopColor: Colors.primary, borderRightColor: Colors.primary, borderBottomColor: Colors.primary,
  },
  ringInner: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
  },

  missionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainer,
  },
  missionCardDone: { opacity: 0.65 },
  missionCardActive: {
    borderColor: Colors.primaryFixed + '55',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 2,
  },
  missionIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  missionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  missionTitleDone: { textDecorationLine: 'line-through', textDecorationColor: Colors.textLight, color: Colors.textSecondary },
  missionReward: { fontSize: 13, fontWeight: '600', color: Colors.primary, marginTop: 2 },

  donePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.surfaceHigh },
  donePillText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },

  startBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  startBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  rewardCard: {
    width: 140, backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.surfaceContainer,
  },
  rewardIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  rewardTitle: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  rewardSub: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
});

const pairTab = StyleSheet.create({
  row: {
    flexDirection: 'row', gap: 4,
    backgroundColor: Colors.surfaceLow,
    padding: 4, borderRadius: 999,
  },
  btn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999 },
  btnActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  text: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  textActive: { fontWeight: '800', color: Colors.primary },
});
