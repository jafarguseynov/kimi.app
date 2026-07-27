import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { getMissions, claimMission, DailyMission } from '../../api/engagement.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const TYPE_ROUTE: Record<string, string> = {
  exam: 'Exams',
  question: 'Marketplace',
  flashcard: 'Learn',
};

export default function TodaysTasksScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: missions = [], isLoading } = useQuery<DailyMission[]>({
    queryKey: ['missions'],
    queryFn: () => getMissions().catch(() => []),
  });

  const claim = useMutation({
    mutationFn: (id: string) => claimMission(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['missions'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      Alert.alert('🎉', t('missions.claimSuccess', { n: res.reward }));
    },
    onError: () => qc.invalidateQueries({ queryKey: ['missions'] }),
  });

  const completed = missions.filter((m) => m.completed).length;
  const total = missions.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = total > 0 && completed === total;

  const goToMission = (m: DailyMission) => {
    const route = TYPE_ROUTE[m.type];
    if (route) (navigation.getParent() as any)?.navigate(route);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('todaysTasks.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          <Text style={styles.hero}>
            {t('todaysTasks.heroWelcome')}{'\n'}
            <Text style={{ color: Colors.primary }}>{t('todaysTasks.heroGoals')}</Text>
          </Text>
          <Text style={styles.heroSub}>{t('todaysTasks.heroSub')}</Text>
        </View>

        <View style={styles.taskCard}>
          <View style={styles.streakBadge}>
            <Text style={{ fontSize: 22 }}>🔥</Text>
          </View>
          <Text style={styles.cardTitle}>{t('todaysTasks.cardTitle')}</Text>

          <View style={{ marginBottom: 24 }}>
            <View style={styles.progressTopRow}>
              <Text style={styles.progressLabel}>{t('todaysTasks.progressLabel')}</Text>
              <Text style={styles.progressValue}>{t('todaysTasks.completedOf', { done: completed, total })}</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.progressFill, { width: `${pct}%` as any }]}
              />
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator style={{ marginVertical: 24 }} color={Colors.primary} />
          ) : total === 0 ? (
            <Text style={styles.emptyText}>{t('missions.empty')}</Text>
          ) : (
            <View style={{ gap: 12, marginBottom: 8 }}>
              {missions.map((m) => {
                const prog = Math.min(100, Math.round((m.progress / Math.max(m.target, 1)) * 100));
                const isClaiming = claim.isPending && claim.variables === m.id;
                return (
                  <View key={m.id} style={styles.taskRow}>
                    <View style={[styles.checkbox, m.completed && styles.checkboxDone]}>
                      {m.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskTitle, m.claimed && styles.taskTitleDone]}>{m.title}</Text>
                      <View style={styles.metaRow}>
                        <Ionicons name="logo-bitcoin" size={12} color="#FFB020" />
                        <Text style={styles.metaReward}>{t('missions.rewardCoins', { n: m.reward })}</Text>
                        <Text style={styles.metaProg}>· {m.progress}/{m.target}</Text>
                      </View>
                      {!m.completed && (
                        <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${prog}%` as any }]} /></View>
                      )}
                    </View>
                    {m.claimed ? (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.tertiary} />
                    ) : m.completed ? (
                      <TouchableOpacity style={styles.claimBtn} onPress={() => claim.mutate(m.id)} disabled={isClaiming} activeOpacity={0.85}>
                        {isClaiming ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.claimBtnText}>{t('missions.claim')}</Text>}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.goBtn} onPress={() => goToMission(m)} activeOpacity={0.85}>
                        <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {allDone && (
            <View style={styles.allDoneBanner}>
              <Ionicons name="trophy" size={18} color={Colors.tertiary} />
              <Text style={styles.allDoneText}>{t('todaysTasks.allDone')}</Text>
            </View>
          )}
        </View>

        <View style={ttActStyles.section}>
          <View style={ttActStyles.row}>
            <TouchableOpacity style={ttActStyles.card} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.MissionStart)}>
              <Ionicons name="flame" size={20} color={Colors.primary} />
              <Text style={ttActStyles.cardTitle}>{t('todaysTasks.missionStart')}</Text>
              <Text style={ttActStyles.cardSub}>{t('todaysTasks.missionStartSub')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ttActStyles.card} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.DailyMissions)}>
              <Ionicons name="ribbon" size={20} color={Colors.primary} />
              <Text style={ttActStyles.cardTitle}>{t('todaysTasks.missionProgress')}</Text>
              <Text style={ttActStyles.cardSub}>{t('todaysTasks.missionProgressSub')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ttActStyles = StyleSheet.create({
  section: { marginTop: 24 },
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1, padding: 14, borderRadius: 16, gap: 6,
    backgroundColor: Colors.surfaceLowest, borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 11, color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  hero: { fontSize: 36, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.6, lineHeight: 42 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  taskCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 28,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
    position: 'relative',
  },
  streakBadge: {
    position: 'absolute', top: 24, right: 24,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFF4E5',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 28, paddingRight: 64 },

  progressTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  progressLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1.2 },
  progressValue: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  progressTrack: { height: 12, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },

  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 20 },

  taskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 12,
    backgroundColor: Colors.surfaceLow + '80',
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  taskTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  taskTitleDone: { textDecorationLine: 'line-through', opacity: 0.6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaReward: { fontSize: 12, fontWeight: '700', color: '#B7791F' },
  metaProg: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  miniTrack: { height: 4, borderRadius: 999, backgroundColor: Colors.surfaceContainer, overflow: 'hidden', marginTop: 6 },
  miniFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.primary },

  claimBtn: { minWidth: 66, alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
  claimBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  goBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryFixed + '1A' },

  allDoneBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 20, paddingVertical: 14, borderRadius: 16, backgroundColor: Colors.tertiaryContainer + '44',
  },
  allDoneText: { fontSize: 14, fontWeight: '700', color: Colors.tertiary },
});
