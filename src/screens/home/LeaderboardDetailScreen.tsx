import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { getGlobalLeaderboard, type LeaderboardEntry } from '../../api/leaderboard.api';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

function Avatar({ initial, size, ringColor, ringWidth = 4 }: { initial: string; size: number; ringColor: string; ringWidth?: number }) {
  return (
    <View
      style={{
        width: size + ringWidth * 2, height: size + ringWidth * 2, borderRadius: (size + ringWidth * 2) / 2,
        padding: ringWidth, backgroundColor: ringColor, alignItems: 'center', justifyContent: 'center',
      }}
    >
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: size * 0.32, fontWeight: '800', color: '#fff' }}>{initial}</Text>
      </LinearGradient>
    </View>
  );
}

export default function LeaderboardDetailScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const user = useUserStore((s) => s.user);

  const { data: board = [], isLoading } = useQuery({
    queryKey: ['leaderboard-detail'],
    queryFn: getGlobalLeaderboard,
  });

  const initial = (name: string) => name.charAt(0).toUpperCase();
  const top3 = board.slice(0, 3);
  const rest = showAll ? board.slice(3) : board.slice(3, 9);
  const hasMore = board.length > 9 && !showAll;
  const me = useMemo(() => board.find((e) => e.userId === user?.id), [board, user?.id]);
  const myRank = me?.rank ?? null;
  const myXP = me?.totalScore ?? 0;
  const totalUsers = board.length;
  // Bir üst pillə üçün lazım olan real XP fərqi (varsa).
  const above = myRank && myRank > 1 ? board.find((e) => e.rank === myRank - 1) : undefined;
  const nextNeeded = above ? Math.max(0, above.totalScore - myXP) : 0;
  const progressPct = above && above.totalScore > 0 ? Math.min(100, Math.round((myXP / above.totalScore) * 100)) : 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('leaderboardDetail.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pair-tab switcher: Hamı / Dostlar */}
        <View style={pairTab.row}>
          <View style={[pairTab.btn, pairTab.btnActive]}>
            <Text style={[pairTab.text, pairTab.textActive]}>{t('leaderboardDetail.tabAll')}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.replace(Routes.FriendsLeaderboard)}
            style={pairTab.btn}
          >
            <Text style={pairTab.text}>{t('leaderboardDetail.tabFriends')}</Text>
          </TouchableOpacity>
        </View>

        {/* My rank hero */}
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroKicker}>{t('leaderboardDetail.myRank')}</Text>
              <View style={styles.heroRankRow}>
                <Text style={styles.heroRankNum}>{myRank ? `#${myRank}` : '—'}</Text>
                <Text style={styles.heroRankTotal}>/ {totalUsers.toLocaleString('az-AZ')}</Text>
              </View>
            </View>
            <View style={styles.xpPill}>
              <Ionicons name="star" size={14} color="#fff" />
              <Text style={styles.xpPillText}>{myXP.toLocaleString('az-AZ')} XP</Text>
            </View>
          </View>

          <View style={styles.heroBottom}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{initial(user?.name ?? 'C')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroNameLine}>{t('leaderboardDetail.heroNameLine', { name: user?.name?.split(' ')[0] ?? t('leaderboardDetail.defaultName') })}</Text>
              <View style={styles.heroTrack}>
                <View style={[styles.heroFill, { width: `${progressPct}%` as any }]} />
              </View>
              {above ? (
                <Text style={styles.heroHint}>{t('leaderboardDetail.heroHint', { n: nextNeeded })}</Text>
              ) : (
                <Text style={styles.heroHint}>{myRank === 1 ? t('leaderboardDetail.heroTop') : t('leaderboardDetail.heroUnranked')}</Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 3 && (
              <View style={styles.podium}>
                {/* 2nd */}
                <View style={styles.podiumCol}>
                  <View style={styles.podiumAvatarWrap}>
                    <Avatar initial={initial(top3[1].name)} size={56} ringColor="#CBD5E1" />
                    <View style={[styles.podiumMedal, { backgroundColor: '#CBD5E1' }]}>
                      <Ionicons name="medal" size={14} color="#fff" />
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{top3[1].name.split(' ')[0]}</Text>
                  <Text style={styles.podiumXp}>{top3[1].totalScore.toLocaleString('az-AZ')} XP</Text>
                </View>

                {/* 1st */}
                <View style={[styles.podiumCol, styles.podiumColFirst]}>
                  <View style={styles.podiumAvatarWrap}>
                    <View style={styles.crown}>
                      <Ionicons name="trophy" size={22} color="#F59E0B" />
                    </View>
                    <Avatar initial={initial(top3[0].name)} size={72} ringColor="#FBBF24" />
                    <View style={[styles.podiumMedalFirst]}>
                      <Ionicons name="trophy" size={16} color="#fff" />
                    </View>
                  </View>
                  <Text style={[styles.podiumName, styles.podiumNameFirst]} numberOfLines={1}>{top3[0].name.split(' ')[0]}</Text>
                  <Text style={[styles.podiumXp, styles.podiumXpFirst]}>{top3[0].totalScore.toLocaleString('az-AZ')} XP</Text>
                </View>

                {/* 3rd */}
                <View style={styles.podiumCol}>
                  <View style={styles.podiumAvatarWrap}>
                    <Avatar initial={initial(top3[2].name)} size={56} ringColor="#FB923C" />
                    <View style={[styles.podiumMedal, { backgroundColor: '#FB923C' }]}>
                      <Ionicons name="medal" size={14} color="#fff" />
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{top3[2].name.split(' ')[0]}</Text>
                  <Text style={styles.podiumXp}>{top3[2].totalScore.toLocaleString('az-AZ')} XP</Text>
                </View>
              </View>
            )}

            {/* Ranking list (real data) */}
            <View style={{ gap: 12 }}>
              {rest.map((s) => (
                <View key={s.userId} style={[styles.row, s.userId === user?.id && styles.rowMe]}>
                  <Text style={styles.rowRank}>{s.rank}</Text>
                  <View style={styles.rowAvatar}>
                    <Text style={styles.rowAvatarText}>{initial(s.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName} numberOfLines={1}>{s.userId === user?.id ? t('leaderboardDetail.youLabel') : s.name}</Text>
                    <Text style={styles.rowSub} numberOfLines={1}>{t('leaderboardDetail.examMeta', { count: s.examCount, pct: s.avgPercentage })}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.rowXp}>{s.totalScore.toLocaleString('az-AZ')}</Text>
                    <Text style={styles.rowXpUnit}>XP</Text>
                  </View>
                </View>
              ))}
            </View>

            {hasMore && (
              <TouchableOpacity style={styles.moreBtn} activeOpacity={0.85} onPress={() => setShowAll(true)}>
                <Text style={styles.moreBtnText}>{t('leaderboardDetail.moreBtn')}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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

  /* Segmented */
  segmented: {
    flexDirection: 'row', gap: 4,
    backgroundColor: Colors.surfaceLow,
    padding: 6, borderRadius: 999,
  },
  segItemWrap: { flex: 1 },
  segItem: { paddingVertical: 10, alignItems: 'center', borderRadius: 999 },
  segItemActive: {
    paddingVertical: 10, alignItems: 'center', borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  segText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  segTextActive: { fontSize: 13, fontWeight: '700', color: '#fff' },

  /* Hero */
  heroCard: {
    borderRadius: 20, padding: 24, gap: 24, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 6,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroKicker: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  heroRankRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  heroRankNum: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroRankTotal: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  xpPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  xpPillText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  heroBottom: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroAvatar: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  heroNameLine: { fontSize: 15, fontWeight: '700', color: '#fff' },
  heroTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 999, marginTop: 8, overflow: 'hidden' },
  heroFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },
  heroHint: { fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 6 },

  /* Podium */
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  podiumCol: { flex: 1, alignItems: 'center', gap: 4 },
  podiumColFirst: { transform: [{ translateY: -8 }] },
  podiumAvatarWrap: { position: 'relative', marginBottom: 14 },
  crown: { position: 'absolute', top: -22, left: 0, right: 0, alignItems: 'center', zIndex: 3, backgroundColor: '#fff', borderRadius: 999, padding: 2, alignSelf: 'center' },
  podiumMedal: {
    position: 'absolute', bottom: -4, right: -4,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff', zIndex: 2,
  },
  podiumMedalFirst: {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FBBF24',
    borderWidth: 2, borderColor: '#fff', zIndex: 2,
  },
  podiumName: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, marginTop: 4, maxWidth: 96, textAlign: 'center' },
  podiumNameFirst: { fontSize: 14, fontWeight: '800' },
  podiumXp: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  podiumXpFirst: { fontSize: 12, fontWeight: '800' },

  center: { paddingVertical: 32, alignItems: 'center' },

  /* Row */
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
  },
  rowMe: { borderWidth: 1.5, borderColor: Colors.primary },
  rowRank: { width: 22, fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  rowAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  rowAvatarText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  rowName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  rowSub: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  rowXp: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  rowXpUnit: { fontSize: 10, fontWeight: '500', color: Colors.textSecondary, marginTop: 1 },

  moreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 16,
  },
  moreBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
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
