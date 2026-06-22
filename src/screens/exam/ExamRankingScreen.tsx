import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getExamLeaderboard, type ExamRankEntry } from '../../api/leaderboard.api';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamRanking>;

const RANK_BG: Record<number, string> = {
  1: '#FEF9C3',
  2: Colors.surfaceLow,
  3: '#FFF7ED',
};

export default function ExamRankingScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const examId = (route.params as { examId?: string } | undefined)?.examId;
  const [entries, setEntries] = useState<ExamRankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useUserStore((s) => s.user);

  const load = async (refresh = false) => {
    if (!examId) { setLoading(false); return; }
    if (refresh) setRefreshing(true);
    try {
      const data = await getExamLeaderboard(examId);
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [examId]);

  const myEntry = entries.find((e) => e.userId === user?.id);
  const total = entries.length;
  const myPercentile = myEntry ? Math.round((1 - (myEntry.rank - 1) / Math.max(total, 1)) * 100) : null;
  const avgScore = total > 0 ? Math.round(entries.reduce((acc, e) => acc + e.score, 0) / total) : 0;
  const maxScore = entries.reduce((acc, e) => Math.max(acc, e.total), 0) || 100;
  const myBarPct = myEntry ? Math.min(100, Math.round((myEntry.score / maxScore) * 100)) : 0;
  const avgBarPct = Math.min(100, Math.round((avgScore / maxScore) * 100));
  const diffPct = avgScore > 0 && myEntry ? Math.round(((myEntry.score - avgScore) / avgScore) * 100) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate(Routes.ExamList)} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('examRanking.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {!examId ? (
        <View style={styles.center}>
          <Ionicons name="trophy-outline" size={56} color={Colors.primaryFixed} />
          <Text style={styles.emptyTitle}>{t('examRanking.noExamTitle')}</Text>
          <Text style={styles.emptySub}>{t('examRanking.noExamSub')}</Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        >
          {/* Top Message */}
          <View style={styles.topCard}>
            <Text style={styles.topCardSub}>{t('examRanking.nParticipants', { n: total })}</Text>
            <Text style={styles.topCardTitle}>
              {myEntry ? t('examRanking.goodResult') : t('examRanking.notParticipated')}
            </Text>
          </View>

          {/* User Rank Card */}
          {myEntry && (
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.rankCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.rankGlow} />
              <Text style={styles.rankCardLabel}>{t('examRanking.yourPosition')}</Text>
              <View style={styles.rankRow}>
                <Text style={styles.rankValue}>{t('examRanking.rankValue', { n: myEntry.rank })}</Text>
                <Text style={styles.rankTotal}>{t('examRanking.ofPeople', { n: total })}</Text>
              </View>
              {myPercentile !== null && (
                <View style={styles.topBadge}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.topBadgeText}>{t('examRanking.topPercent', { n: 100 - myPercentile + 1 })}</Text>
                </View>
              )}
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>{t('examRanking.scoreLabel')}</Text>
                <Text style={styles.scoreValue}>{myEntry.score}/{myEntry.total}</Text>
                <Text style={styles.pctValue}> ({myEntry.percentage}%)</Text>
              </View>
            </LinearGradient>
          )}

          {/* Comparative Analysis */}
          {myEntry && total > 0 && (
            <View style={styles.compareCard}>
              <Text style={styles.compareTitle}>{t('examRanking.compareTitle')}</Text>

              <View style={styles.compareRow}>
                <View style={styles.compareLabelRow}>
                  <Text style={styles.compareLabel}>{t('examRanking.yourScore')}</Text>
                  <Text style={styles.compareValueMine}>{t('examRanking.nBal', { n: myEntry.score })}</Text>
                </View>
                <View style={styles.compareTrack}>
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    style={[styles.compareFill, { width: `${myBarPct}%` as any }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>

              <View style={styles.compareRow}>
                <View style={styles.compareLabelRow}>
                  <Text style={styles.compareLabel}>{t('examRanking.countryAvg')}</Text>
                  <Text style={styles.compareValueAvg}>{t('examRanking.nBal', { n: avgScore })}</Text>
                </View>
                <View style={styles.compareTrack}>
                  <View style={[styles.compareFillAvg, { width: `${avgBarPct}%` as any }]} />
                </View>
              </View>

              {diffPct !== null && (
                <View style={styles.insightRow}>
                  <Ionicons name="analytics-outline" size={20} color={Colors.primary} />
                  <Text style={styles.insightText}>
                    {t('examRanking.insightPre')}
                    <Text style={styles.insightAccent}>{diffPct > 0 ? `${diffPct}%` : `${Math.abs(diffPct)}%`}</Text>
                    {diffPct >= 0 ? t('examRanking.insightHigher') : t('examRanking.insightLower')}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Top entries */}
          <View style={styles.top10Section}>
            <View style={styles.top10Header}>
              <Text style={styles.top10Title}>{t('examRanking.topResults')}</Text>
              <Ionicons name="trophy-outline" size={22} color={Colors.primaryFixedDim} />
            </View>

            <View style={styles.studentList}>
              {entries.slice(0, 3).map((s) => (
                <View key={s.userId} style={[styles.studentRow, { backgroundColor: RANK_BG[s.rank] ?? Colors.surface }]}>
                  <View style={[
                    styles.rankCircle,
                    s.rank === 1 && styles.rankCircleGold,
                    s.rank === 3 && styles.rankCircleOrange,
                  ]}>
                    <Text style={styles.rankCircleText}>{s.rank}</Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{s.userId === user?.id ? t('examRanking.you') : s.name}</Text>
                    <Text style={styles.studentSchool}>{s.percentage}% · {s.timeSpent}s</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    <Text style={styles.studentScore}>{s.score}</Text>
                    <Text style={styles.scoreUnit}>{t('examRanking.balUnit')}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.compactList}>
                {entries.slice(3, 10).map((s) => (
                  <View key={s.userId} style={[styles.compactRow, s.userId === user?.id && styles.compactRowMe]}>
                    <Text style={styles.compactRank}>{s.rank}</Text>
                    <Text style={styles.compactName}>{s.userId === user?.id ? t('examRanking.you') : s.name}</Text>
                    <Text style={styles.compactScore}>{s.score}</Text>
                  </View>
                ))}
              </View>

              {entries.length === 0 && (
                <Text style={styles.emptyInner}>{t('examRanking.emptyInner')}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceLow },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 16 },

  topCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2,
  },
  topCardSub: { fontSize: 13, fontWeight: '600', color: Colors.primary, marginBottom: 6 },
  topCardTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, lineHeight: 24 },

  rankCard: {
    borderRadius: 24, padding: 28, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 5,
    gap: 8,
  },
  rankGlow: { position: 'absolute', top: -32, right: -32, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.1)' },
  rankCardLabel: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  rankRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  rankValue: { fontSize: 48, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  rankTotal: { fontSize: 16, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  topBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start',
  },
  topBadgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  scoreLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  scoreValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
  pctValue: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },

  compareCard: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 20,
    padding: 22,
    gap: 16,
  },
  compareTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  compareRow: { gap: 8 },
  compareLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compareLabel: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  compareValueMine: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  compareValueAvg: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  compareTrack: { height: 10, backgroundColor: Colors.surfaceHigh, borderRadius: 999, overflow: 'hidden' },
  compareFill: { height: '100%', borderRadius: 999 },
  compareFillAvg: { height: '100%', borderRadius: 999, backgroundColor: 'rgba(89,92,94,0.4)' },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  insightText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  insightAccent: { color: Colors.primary, fontWeight: '700' },

  top10Section: { gap: 16 },
  top10Header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  top10Title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  studentList: { gap: 10 },
  studentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  rankCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  rankCircleGold: { backgroundColor: '#FEF9C3' },
  rankCircleOrange: { backgroundColor: '#FFEDD5' },
  rankCircleText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  studentSchool: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  scoreCol: { alignItems: 'flex-end' },
  studentScore: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  scoreUnit: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },

  compactList: { gap: 2, paddingTop: 8 },
  compactRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 14 },
  compactRowMe: { backgroundColor: Colors.primaryLight, borderRadius: 10 },
  compactRank: { width: 28, fontSize: 13, fontWeight: '500', color: Colors.textSecondary, textAlign: 'center' },
  compactName: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  compactScore: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  emptyInner: { textAlign: 'center', color: Colors.textSecondary, paddingVertical: 24, fontSize: 14 },
});
