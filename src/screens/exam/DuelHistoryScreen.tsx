import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { getDuelHistory, getDuelStats, DuelHistoryItem } from '../../api/duel.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

// Addan baş hərflər (maks 2).
function initialsOf(name?: string | null): string {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?';
}

export default function DuelHistoryScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const { data: historyData, isLoading, refetch, isRefetching } = useQuery<DuelHistoryItem[]>({
    queryKey: ['duelHistory'],
    queryFn: () => getDuelHistory(50).catch(() => [] as DuelHistoryItem[]),
  });
  const { data: statsData } = useQuery({
    queryKey: ['duelStats'],
    queryFn: () => getDuelStats().catch(() => null),
  });

  const history: DuelHistoryItem[] = Array.isArray(historyData) ? historyData : [];

  const stats = useMemo(() => {
    if (statsData) {
      const wins = statsData.wins ?? 0;
      const total = statsData.total ?? 0;
      return { wins, losses: Math.max(total - wins, 0), winRate: statsData.winRate ?? 0 };
    }
    const wins = history.filter((h) => h.result === 'win').length;
    const total = history.length;
    return { wins, losses: total - wins, winRate: total > 0 ? Math.round((wins / total) * 100) : 0 };
  }, [statsData, history]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('duel.histTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        {/* Hero stats */}
        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>{t('duel.overallPerf')}</Text>
              <Text style={styles.heroTitle}>{t('duel.yourRating')}</Text>
            </View>
            <View style={styles.ratingCircle}>
              <Text style={styles.ratingValue}>{stats.winRate}<Text style={styles.ratingPct}>%</Text></Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{t('duel.totalWins')}</Text>
              <Text style={styles.heroStatValue}>{stats.wins}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{t('duel.totalLosses')}</Text>
              <Text style={styles.heroStatValue}>{stats.losses}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* List header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t('duel.recentDuels')}</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{t('duel.allHistory')}</Text>
          </View>
        </View>

        {/* History */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 12 }} />
        ) : history.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="flash-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('duel.emptyHistTitle')}</Text>
            <Text style={styles.emptySub}>{t('duel.emptyHistSub')}</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {history.map((d) => {
              const isWin = d.result === 'win';
              const isDraw = d.result === 'draw';
              const dt = new Date(d.createdAt);
              const time = isNaN(dt.getTime()) ? '' : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const date = isNaN(dt.getTime()) ? '' : dt.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
              const accent = isWin ? Colors.primary : isDraw ? Colors.textSecondary : Colors.danger;
              return (
                <View key={d.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardTopLeft}>
                      <View style={[styles.avatar, isWin ? styles.avatarWin : styles.avatarLoss]}>
                        <Text style={[styles.avatarText, { color: accent }]}>
                          {initialsOf(d.opponentName)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.opponent}>{d.opponentName ?? '—'}</Text>
                        <Text style={styles.meta}>{d.subject}{time ? ` • ${time}` : ''}</Text>
                      </View>
                    </View>
                    <View style={[styles.badge, isWin ? styles.badgeWin : styles.badgeLoss]}>
                      <Text style={[styles.badgeText, { color: isWin ? Colors.success : isDraw ? Colors.textSecondary : Colors.danger }]}>
                        {isWin ? t('duel.win') : isDraw ? t('duel.drawShort') : t('duel.loss')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBottom}>
                    <View style={styles.scoreRow}>
                      <Text style={[styles.scoreMain, { color: isWin ? Colors.primary : Colors.textMuted }]}>
                        {d.myScore}
                      </Text>
                      <Text style={styles.scoreDash}>—</Text>
                      <Text style={[styles.scoreSecond, { color: isWin ? Colors.textMuted : Colors.danger }]}>
                        {d.opponentScore}
                      </Text>
                    </View>
                    {!!date && <Text style={styles.date}>{date}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          style={{ marginTop: 8 }}
          onPress={() => navigation.navigate(Routes.DuelMode)}
        >
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
            <Ionicons name="flash" size={18} color="#fff" />
            <Text style={styles.ctaText}>{t('duel.newDuel')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 20, paddingBottom: 40, gap: 20 },

  hero: {
    borderRadius: 24, padding: 24, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 4, letterSpacing: -0.4 },
  ratingCircle: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  ratingValue: { fontSize: 22, fontWeight: '900', color: '#fff' },
  ratingPct: { fontSize: 12, fontWeight: '700' },
  heroStats: { flexDirection: 'row', gap: 12, marginTop: 24 },
  heroStat: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  heroStatValue: { fontSize: 24, fontWeight: '900', color: '#fff' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  listTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  chip: { backgroundColor: Colors.primaryFixed + '22', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 18, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
    gap: 14,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  avatarWin: { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryFixed + '40' },
  avatarLoss: { backgroundColor: Colors.dangerLight, borderColor: Colors.dangerLight },
  avatarText: { fontSize: 14, fontWeight: '800' },
  opponent: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  meta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  badge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  badgeWin: { backgroundColor: Colors.successLight + '50' },
  badgeLoss: { backgroundColor: Colors.dangerLight },
  badgeText: { fontSize: 10, fontWeight: '800' },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  scoreMain: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  scoreDash: { fontSize: 16, color: Colors.outlineVariant },
  scoreSecond: { fontSize: 20, fontWeight: '700' },
  date: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },

  empty: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, lineHeight: 19 },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  ctaText: { fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
});
