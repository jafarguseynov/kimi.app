import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { getMissions, getStreak, claimMission, DailyMission, StreakInfo } from '../../api/engagement.api';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

// Baku təqvimi qısa gün adları (getDay: 0=Baz..6=Şən)
const WD_LETTERS = ['B', 'B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş'];

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  exam: 'document-text',
  question: 'chatbubble-ellipses',
  flashcard: 'albums',
};
const TYPE_ROUTE: Record<string, string> = {
  exam: 'Exams',
  question: 'Marketplace',
  flashcard: 'Learn',
};

type Tab = 'today' | 'progress';

export default function MissionStartScreen() {
  const navigation = useNavigation<any>();
  const [view, setView] = useState<Tab>('today');
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: missions = [], isLoading: mLoading } = useQuery<DailyMission[]>({
    queryKey: ['missions'],
    queryFn: () => getMissions().catch(() => []),
  });
  const { data: streak, isLoading: sLoading } = useQuery<StreakInfo | undefined>({
    queryKey: ['streak'],
    queryFn: () => getStreak().catch(() => undefined),
  });

  const claim = useMutation({
    mutationFn: (id: string) => claimMission(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['missions'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      Alert.alert('🎉', t('missions.claimSuccess', { n: res.reward }));
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  const goToMission = (m: DailyMission) => {
    const route = TYPE_ROUTE[m.type];
    if (route) navigation.getParent()?.navigate(route);
  };

  const doneCount = missions.filter((m) => m.completed).length;
  const total = missions.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('missions.startHeaderTitle')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={pairTab.row}>
          <TouchableOpacity onPress={() => setView('today')} style={[pairTab.btn, view === 'today' && pairTab.btnActive]}>
            <Text style={[pairTab.text, view === 'today' && pairTab.textActive]}>{t('missions.tabToday')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setView('progress')} style={[pairTab.btn, view === 'progress' && pairTab.btnActive]}>
            <Text style={[pairTab.text, view === 'progress' && pairTab.textActive]}>{t('missions.tabProgress')}</Text>
          </TouchableOpacity>
        </View>

        {view === 'today' ? (
          mLoading ? (
            <ActivityIndicator style={{ marginTop: 48 }} color={Colors.primary} />
          ) : (
            <TodayView
              missions={missions}
              doneCount={doneCount}
              total={total}
              claiming={claim.isPending ? (claim.variables as string) : null}
              onClaim={(id) => claim.mutate(id)}
              onGo={goToMission}
            />
          )
        ) : (
          <ProgressView
            missions={missions}
            streak={streak}
            loading={sLoading}
            claiming={claim.isPending ? (claim.variables as string) : null}
            onClaim={(id) => claim.mutate(id)}
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MissionRow({
  m, claiming, onClaim, onGo,
}: {
  m: DailyMission; claiming: string | null; onClaim: (id: string) => void; onGo?: (m: DailyMission) => void;
}) {
  const { t } = useTranslation();
  const icon = TYPE_ICON[m.type] ?? 'flag';
  const pct = Math.min(100, Math.round((m.progress / Math.max(m.target, 1)) * 100));
  const isClaiming = claiming === m.id;

  return (
    <View style={[styles.taskCard, m.completed && !m.claimed && styles.taskCardReady]}>
      <View style={[styles.taskIcon, { backgroundColor: Colors.primaryFixed + '1A' }]}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{m.title}</Text>
        <View style={styles.rowMeta}>
          <Ionicons name="logo-bitcoin" size={13} color="#FFB020" />
          <Text style={styles.rewardText}>{t('missions.rewardCoins', { n: m.reward })}</Text>
          <Text style={styles.progressText}>· {m.progress}/{m.target}</Text>
        </View>
        <View style={styles.miniTrack}>
          <View style={[styles.miniFill, { width: `${pct}%` as any }]} />
        </View>
      </View>
      {m.claimed ? (
        <View style={styles.donePill}>
          <Ionicons name="checkmark" size={13} color={Colors.tertiary} />
          <Text style={styles.donePillText}>{t('missions.claimed')}</Text>
        </View>
      ) : m.completed ? (
        <TouchableOpacity style={styles.claimBtn} onPress={() => onClaim(m.id)} disabled={isClaiming} activeOpacity={0.85}>
          {isClaiming ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.claimBtnText}>{t('missions.claim')}</Text>}
        </TouchableOpacity>
      ) : onGo ? (
        <TouchableOpacity style={styles.goBtn} onPress={() => onGo(m)} activeOpacity={0.85}>
          <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function TodayView({
  missions, doneCount, total, claiming, onClaim, onGo,
}: {
  missions: DailyMission[]; doneCount: number; total: number;
  claiming: string | null; onClaim: (id: string) => void; onGo: (m: DailyMission) => void;
}) {
  const { t } = useTranslation();
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <>
      <View style={{ gap: 6 }}>
        <Text style={styles.h2}>{t('missions.todayTitle')}</Text>
        <Text style={styles.h2Sub}>{t('missions.todaySub')}</Text>
      </View>

      <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={[styles.heroBlob, { right: -24, bottom: -24, width: 128, height: 128 }]} />
        <View style={styles.heroIcon}>
          <Ionicons name="flame" size={26} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>{t('missions.heroReal', { n: total })}</Text>
        <View style={styles.heroBarTrack}>
          <View style={[styles.heroBarFill, { width: `${pct}%` as any }]} />
        </View>
        <Text style={styles.heroBarLabel}>{t('missions.completedOf', { done: doneCount, total })}</Text>
      </LinearGradient>

      {missions.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-done-circle-outline" size={52} color={Colors.primaryFixed} />
          <Text style={styles.emptyText}>{t('missions.empty')}</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {missions.map((m) => (
            <MissionRow key={m.id} m={m} claiming={claiming} onClaim={onClaim} onGo={onGo} />
          ))}
        </View>
      )}

      <View style={styles.rewardChipWrap}>
        <View style={styles.rewardChip}>
          <Ionicons name="gift" size={18} color={Colors.primaryFixedDim} />
          <Text style={styles.rewardChipText}>{t('missions.rewardChip')}</Text>
        </View>
      </View>
    </>
  );
}

function ProgressView({
  missions, streak, loading, claiming, onClaim,
}: {
  missions: DailyMission[]; streak?: StreakInfo; loading: boolean;
  claiming: string | null; onClaim: (id: string) => void;
}) {
  const { t } = useTranslation();
  if (loading) return <ActivityIndicator style={{ marginTop: 48 }} color={Colors.primary} />;

  const current = streak?.current ?? 0;
  const best = streak?.best ?? 0;
  const week = streak?.week ?? [];

  return (
    <>
      <View style={styles.progressCard}>
        <View style={[styles.blob, { top: -40, left: -40 }]} />
        <View style={[styles.blob, { bottom: -40, right: -40 }]} />
        <Text style={styles.progressLabel}>{t('missions.streakTitle')}</Text>

        <View style={styles.ringWrap}>
          <View style={styles.ringTrack} />
          <View style={styles.ringInner}>
            <Text style={styles.streakNum}>{current}</Text>
            <Text style={styles.streakUnit}>{t('missions.streakDayUnit')}</Text>
          </View>
          <View style={styles.flameBadge}>
            <Ionicons name="flame" size={18} color="#fff" />
          </View>
        </View>

        <Text style={styles.streakStatus}>
          {streak?.todayActive ? t('missions.streakActive') : t('missions.streakInactive')}
        </Text>
        <Text style={styles.bestStreak}>{t('missions.bestStreak', { n: best })}</Text>

        {week.length > 0 && (
          <View style={styles.weekRow}>
            {week.map((d) => {
              const letter = WD_LETTERS[new Date(d.date + 'T00:00:00').getDay()];
              return (
                <View key={d.date} style={styles.weekItem}>
                  <View style={[styles.weekDot, d.active && styles.weekDotActive]}>
                    {d.active && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={styles.weekLetter}>{letter}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>{t('missions.todayMissionsTitle')}</Text>
        {missions.map((m) => (
          <MissionRow key={m.id} m={m} claiming={claiming} onClaim={onClaim} />
        ))}
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
  heroBarFill: { height: '100%', borderRadius: 999, backgroundColor: '#fff' },
  heroBarLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  empty: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },

  taskCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainer,
  },
  taskCardReady: { borderColor: Colors.primaryFixed + '66' },
  taskIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  rewardText: { fontSize: 12, fontWeight: '700', color: '#B7791F' },
  progressText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  miniTrack: { height: 5, borderRadius: 999, backgroundColor: Colors.surfaceContainer, overflow: 'hidden', marginTop: 8 },
  miniFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.primary },

  donePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.tertiaryContainer + '55' },
  donePillText: { fontSize: 11, fontWeight: '700', color: Colors.tertiary },
  claimBtn: { minWidth: 72, alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  claimBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  goBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryFixed + '1A' },

  rewardChipWrap: { alignItems: 'center' },
  rewardChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceLow, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999,
  },
  rewardChipText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  progressCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 32, padding: 24,
    alignItems: 'center', overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 28, elevation: 3,
  },
  blob: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.primaryFixed, opacity: 0.15 },
  progressLabel: { fontSize: 17, fontWeight: '600', color: Colors.textSecondary, marginBottom: 16 },
  ringWrap: { width: 128, height: 128, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringTrack: { position: 'absolute', width: 128, height: 128, borderRadius: 64, borderWidth: 8, borderColor: Colors.primaryFixed + '33' },
  ringInner: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
  },
  streakNum: { fontSize: 40, fontWeight: '800', color: Colors.primary, lineHeight: 44 },
  streakUnit: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  flameBadge: {
    position: 'absolute', bottom: 4, right: 4, width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.surfaceLowest,
  },
  streakStatus: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 18 },
  bestStreak: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  weekRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  weekItem: { alignItems: 'center', gap: 6 },
  weekDot: {
    width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
  },
  weekDotActive: { backgroundColor: Colors.primary },
  weekLetter: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
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
