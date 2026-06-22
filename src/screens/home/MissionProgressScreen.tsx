import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

interface Mission {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  rewardKey: string;
  done: boolean;
}

const MISSIONS: Mission[] = [
  { id: 'm1', icon: 'checkmark-circle', titleKey: 'missions.m1Title', rewardKey: 'missions.m1Reward', done: true },
  { id: 'm2', icon: 'checkmark-circle', titleKey: 'missions.m2Title', rewardKey: 'missions.m2Reward', done: true },
  { id: 'm3', icon: 'book', titleKey: 'missions.m3Title', rewardKey: 'missions.m3Reward', done: false },
];

interface Reward { id: string; titleKey: string; subKey: string; icon: keyof typeof Ionicons.glyphMap; color: string; locked?: boolean; }
const REWARDS: Reward[] = [
  { id: 'r1', titleKey: 'missions.r1Title', subKey: 'missions.r1Sub', icon: 'logo-bitcoin', color: '#FFB020' },
  { id: 'r2', titleKey: 'missions.r2Title', subKey: 'missions.r2Sub', icon: 'lock-closed', color: Colors.textLight, locked: true },
  { id: 'r3', titleKey: 'missions.r3Title', subKey: 'missions.r3Sub', icon: 'lock-closed', color: Colors.textLight, locked: true },
];

const DONE_COUNT = MISSIONS.filter((m) => m.done).length;
const PROGRESS = DONE_COUNT / MISSIONS.length;

export default function MissionProgressScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('missions.progressHeaderTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={pairTab.row}>
          <TouchableOpacity onPress={() => navigation.replace(Routes.MissionStart)} style={pairTab.btn}>
            <Text style={pairTab.text}>{t('missions.tabToday')}</Text>
          </TouchableOpacity>
          <View style={[pairTab.btn, pairTab.btnActive]}>
            <Text style={[pairTab.text, pairTab.textActive]}>{t('missions.tabProgress')}</Text>
          </View>
        </View>

        {/* Overall progress card */}
        <View style={styles.progressCard}>
          <View style={[styles.blob, { top: -40, left: -40 }]} />
          <View style={[styles.blob, { bottom: -40, right: -40 }]} />
          <Text style={styles.progressLabel}>{t('missions.completedOf', { done: DONE_COUNT, total: MISSIONS.length })}</Text>

          {/* Ring */}
          <View style={styles.ringWrap}>
            <View style={styles.ringTrack} />
            <View style={[styles.ringFill, { transform: [{ rotate: PROGRESS >= 0.5 ? '45deg' : '-45deg' }] }]} />
            <View style={styles.ringInner}>
              <Ionicons name="ribbon" size={40} color={Colors.primary} />
            </View>
          </View>
        </View>

        {/* Missions list */}
        <View style={{ gap: 12 }}>
          {MISSIONS.map((m) => (
            <View key={m.id} style={[styles.missionCard, m.done && styles.missionCardDone, !m.done && styles.missionCardActive]}>
              <View style={[styles.missionIcon, !m.done && { backgroundColor: Colors.primaryFixed + '33' }]}>
                <Ionicons name={m.icon} size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.missionTitle, m.done && styles.missionTitleDone]}>{t(m.titleKey)}</Text>
                <Text style={styles.missionReward}>{t(m.rewardKey)}</Text>
              </View>
              {m.done ? (
                <View style={styles.donePill}><Text style={styles.donePillText}>{t('missions.done')}</Text></View>
              ) : (
                <TouchableOpacity activeOpacity={0.9} style={styles.startBtn}>
                  <Text style={styles.startBtnText}>{t('missions.start')}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Rewards */}
        <View style={{ gap: 16, marginTop: 8 }}>
          <Text style={styles.sectionTitle}>{t('missions.rewardsTitle')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 16 }}>
            {REWARDS.map((r) => (
              <View key={r.id} style={[styles.rewardCard, r.locked && { opacity: 0.55 }]}>
                <View style={styles.rewardIcon}>
                  <Ionicons name={r.icon} size={28} color={r.color} />
                </View>
                <Text style={styles.rewardTitle}>{t(r.titleKey)}</Text>
                <Text style={styles.rewardSub}>{t(r.subKey)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 56,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainer,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 16, gap: 24 },

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
