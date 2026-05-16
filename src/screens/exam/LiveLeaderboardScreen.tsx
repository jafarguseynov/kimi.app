import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.LiveLeaderboard> };

const PARTICIPANTS = [
  { rank: 1, name: 'Aysel Məmmədova', score: 85, answered: 17, isUser: false },
  { rank: 2, name: 'Ömər Rəsulov', score: 80, answered: 16, isUser: false },
  { rank: 3, name: 'Leyla Əliyeva', score: 75, answered: 15, isUser: false },
  { rank: 4, name: 'Sən', score: 70, answered: 14, isUser: true },
  { rank: 5, name: 'Nihad Quliyev', score: 65, answered: 13, isUser: false },
  { rank: 6, name: 'Fidan Hüseynova', score: 60, answered: 12, isUser: false },
  { rank: 7, name: 'Kamran Babayev', score: 55, answered: 11, isUser: false },
  { rank: 8, name: 'Türkan Əhmədova', score: 50, answered: 10, isUser: false },
];

const MEDAL_COLORS: Record<number, string> = {
  1: '#F59E0B',
  2: '#94A3B8',
  3: '#D97706',
};

export default function LiveLeaderboardScreen({ navigation }: Props) {
  const [seconds, setSeconds] = useState(892);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Canlı Liderlər Lövhəsi</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CANLI</Text>
          </View>
        </View>
        <View style={styles.headerTimer}>
          <Text style={styles.headerTimerLabel}>Qalan</Text>
          <Text style={styles.headerTimerValue}>{mins}:{secs}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Position Card */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.userCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.userCardGlow} />
          <Text style={styles.userCardLabel}>Sizin mövqeyiniz</Text>
          <View style={styles.userRankRow}>
            <Text style={styles.userRankValue}>4-cü</Text>
            <Text style={styles.userRankTotal}>/ {PARTICIPANTS.length} iştirakçı</Text>
          </View>
          <View style={styles.userCardStats}>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatValue}>70</Text>
              <Text style={styles.userStatLabel}>BAL</Text>
            </View>
            <View style={styles.userStatDivider} />
            <View style={styles.userStatItem}>
              <Text style={styles.userStatValue}>14/20</Text>
              <Text style={styles.userStatLabel}>CAVAB</Text>
            </View>
            <View style={styles.userStatDivider} />
            <View style={styles.userStatItem}>
              <Text style={styles.userStatValue}>Top 50%</Text>
              <Text style={styles.userStatLabel}>MÖVQE</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Participants Count */}
        <View style={styles.countRow}>
          <View style={styles.countBadge}>
            <View style={styles.countDot} />
            <Text style={styles.countText}>1,248 aktiv iştirakçı</Text>
          </View>
          <Text style={styles.countSub}>Real vaxt rejimindədir</Text>
        </View>

        {/* Top 3 Podium */}
        <View style={styles.podiumSection}>
          <View style={styles.podiumTitleRow}>
            <View style={styles.accentBar} />
            <Text style={styles.podiumTitle}>Top 3</Text>
            <Ionicons name="trophy" size={18} color="#F59E0B" style={{ marginLeft: 8 }} />
          </View>

          <View style={styles.podiumRow}>
            {/* 2nd place */}
            <View style={[styles.podiumItem, styles.podiumSecond]}>
              <View style={[styles.podiumCircle, { backgroundColor: '#E2E8F0' }]}>
                <Text style={[styles.podiumRankNum, { color: '#64748B' }]}>2</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{PARTICIPANTS[1].name.split(' ')[0]}</Text>
              <Text style={[styles.podiumScore, { color: '#64748B' }]}>{PARTICIPANTS[1].score} bal</Text>
              <View style={[styles.podiumBar, { height: 64, backgroundColor: '#CBD5E1' }]} />
            </View>

            {/* 1st place */}
            <View style={[styles.podiumItem, styles.podiumFirst]}>
              <Ionicons name="trophy" size={20} color="#F59E0B" style={{ marginBottom: 4 }} />
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={styles.podiumCircle}
              >
                <Text style={[styles.podiumRankNum, { color: '#fff' }]}>1</Text>
              </LinearGradient>
              <Text style={styles.podiumName} numberOfLines={1}>{PARTICIPANTS[0].name.split(' ')[0]}</Text>
              <Text style={[styles.podiumScore, { color: Colors.primary }]}>{PARTICIPANTS[0].score} bal</Text>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={[styles.podiumBar, { height: 88 }]}
              />
            </View>

            {/* 3rd place */}
            <View style={[styles.podiumItem, styles.podiumThird]}>
              <View style={[styles.podiumCircle, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.podiumRankNum, { color: '#D97706' }]}>3</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{PARTICIPANTS[2].name.split(' ')[0]}</Text>
              <Text style={[styles.podiumScore, { color: '#D97706' }]}>{PARTICIPANTS[2].score} bal</Text>
              <View style={[styles.podiumBar, { height: 48, backgroundColor: '#FDE68A' }]} />
            </View>
          </View>
        </View>

        {/* Full Ranking List */}
        <View style={styles.rankList}>
          <Text style={styles.rankListTitle}>Tam Sıralama</Text>
          {PARTICIPANTS.map((p) => (
            <View
              key={p.rank}
              style={[
                styles.rankRow,
                p.isUser && styles.rankRowUser,
              ]}
            >
              <View style={[styles.rankNumBox, p.rank <= 3 && { backgroundColor: MEDAL_COLORS[p.rank] + '22' }]}>
                {p.rank <= 3 ? (
                  <Ionicons
                    name="trophy"
                    size={14}
                    color={MEDAL_COLORS[p.rank]}
                  />
                ) : (
                  <Text style={[styles.rankNum, p.isUser && { color: Colors.primary }]}>{p.rank}</Text>
                )}
              </View>
              <View style={styles.rankInfo}>
                <Text style={[styles.rankName, p.isUser && styles.rankNameUser]}>{p.name}</Text>
                <Text style={styles.rankAnswered}>{p.answered}/20 cavab</Text>
              </View>
              <View style={styles.rankScoreCol}>
                <Text style={[styles.rankScore, p.isUser && { color: Colors.primary }]}>{p.score}</Text>
                <Text style={styles.rankScoreUnit}>BAL</Text>
              </View>
              {p.isUser && (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>SƏN</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Back to Exam */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.backBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backBtnText}>İmtahana qayıt</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: { fontSize: 9, fontWeight: '800', color: '#DC2626', letterSpacing: 1 },
  headerTimer: { alignItems: 'flex-end' },
  headerTimerLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  headerTimerValue: { fontSize: 16, fontWeight: '800', color: Colors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },

  userCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 5,
  },
  userCardGlow: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  userCardLabel: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  userRankRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  userRankValue: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  userRankTotal: { fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  userCardStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  userStatItem: { flex: 1, alignItems: 'center', gap: 2 },
  userStatValue: { fontSize: 15, fontWeight: '700', color: '#fff' },
  userStatLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.65)', letterSpacing: 1, textTransform: 'uppercase' },
  userStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  countBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  countText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  countSub: { fontSize: 11, color: Colors.textSecondary, fontStyle: 'italic' },

  podiumSection: { gap: 16 },
  podiumTitleRow: { flexDirection: 'row', alignItems: 'center' },
  accentBar: { width: 4, height: 20, backgroundColor: Colors.primary, borderRadius: 2, marginRight: 10 },
  podiumTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 8,
  },
  podiumItem: { alignItems: 'center', flex: 1, gap: 6 },
  podiumFirst: { paddingBottom: 0 },
  podiumSecond: { paddingBottom: 0 },
  podiumThird: { paddingBottom: 0 },
  podiumCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRankNum: { fontSize: 18, fontWeight: '800' },
  podiumName: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  podiumScore: { fontSize: 12, fontWeight: '700' },
  podiumBar: { width: '100%', borderRadius: 8 },

  rankList: { gap: 8 },
  rankListTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },

  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  rankRowUser: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primaryFixed,
  },
  rankNumBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  rankNameUser: { color: Colors.primary, fontWeight: '700' },
  rankAnswered: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  rankScoreCol: { alignItems: 'flex-end' },
  rankScore: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  rankScoreUnit: { fontSize: 8, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  youBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  youBadgeText: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 999,
    paddingVertical: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  backBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
