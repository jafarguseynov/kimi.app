import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { useUserStore } from '../../store/user.store';
import { getFriends, type FriendItem } from '../../api/friend.api';
import { getGlobalLeaderboard, type LeaderboardEntry } from '../../api/leaderboard.api';

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

export default function FriendsLeaderboardScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);

  const { data: friends = [] } = useQuery<FriendItem[]>({
    queryKey: ['friends'],
    queryFn: () => getFriends().catch(() => [] as FriendItem[]),
  });
  const { data: board = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard-detail'],
    queryFn: getGlobalLeaderboard,
  });

  // Dostların + özümün qlobal reytinqdəki real balları → aramızda yenidən sıralanır.
  const ranked = useMemo(() => {
    const ids = new Set(friends.map((f) => f.id));
    if (user?.id) ids.add(user.id);
    return board
      .filter((e) => ids.has(e.userId))
      .map((e, i) => ({ ...e, place: i + 1 }));
  }, [friends, board, user?.id]);

  const initial = (name: string) => name.charAt(0).toUpperCase();
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('social.friendsTop')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pair-tab switcher: Hamı / Dostlar */}
        <View style={pairTab.row}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.replace(Routes.LeaderboardDetail)}
            style={pairTab.btn}
          >
            <Text style={pairTab.text}>{t('social.all')}</Text>
          </TouchableOpacity>
          <View style={[pairTab.btn, pairTab.btnActive]}>
            <Text style={[pairTab.text, pairTab.textActive]}>{t('social.friends')}</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
        ) : ranked.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{t('social.friendsBoardEmpty')}</Text>
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.FindFriend)}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyCta}>
                <Ionicons name="person-add" size={18} color="#fff" />
                <Text style={styles.emptyCtaText}>{t('socialHub.findCta')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Podium (top 3) */}
            {top3.length >= 3 && (
              <View style={styles.podium}>
                {/* 2nd */}
                <View style={styles.podiumCol}>
                  <View style={styles.podiumAvatarWrap}>
                    <Avatar initial={initial(top3[1].name)} size={56} ringColor="#CBD5E1" />
                    <View style={[styles.podiumMedal, { backgroundColor: '#CBD5E1' }]}><Ionicons name="medal" size={14} color="#fff" /></View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{top3[1].userId === user?.id ? t('social.you') : top3[1].name.split(' ')[0]}</Text>
                  <Text style={styles.podiumXp}>{top3[1].totalScore.toLocaleString('az-AZ')} XP</Text>
                </View>
                {/* 1st */}
                <View style={[styles.podiumCol, styles.podiumColFirst]}>
                  <View style={styles.podiumAvatarWrap}>
                    <View style={styles.crown}><Ionicons name="trophy" size={22} color="#F59E0B" /></View>
                    <Avatar initial={initial(top3[0].name)} size={72} ringColor="#FBBF24" />
                    <View style={styles.podiumMedalFirst}><Ionicons name="trophy" size={16} color="#fff" /></View>
                  </View>
                  <Text style={[styles.podiumName, styles.podiumNameFirst]} numberOfLines={1}>{top3[0].userId === user?.id ? t('social.you') : top3[0].name.split(' ')[0]}</Text>
                  <Text style={[styles.podiumXp, styles.podiumXpFirst]}>{top3[0].totalScore.toLocaleString('az-AZ')} XP</Text>
                </View>
                {/* 3rd */}
                <View style={styles.podiumCol}>
                  <View style={styles.podiumAvatarWrap}>
                    <Avatar initial={initial(top3[2].name)} size={56} ringColor="#FB923C" />
                    <View style={[styles.podiumMedal, { backgroundColor: '#FB923C' }]}><Ionicons name="medal" size={14} color="#fff" /></View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{top3[2].userId === user?.id ? t('social.you') : top3[2].name.split(' ')[0]}</Text>
                  <Text style={styles.podiumXp}>{top3[2].totalScore.toLocaleString('az-AZ')} XP</Text>
                </View>
              </View>
            )}

            {/* When fewer than 3 — simple leading row(s) */}
            {top3.length < 3 && top3.map((e) => (
              <View key={e.userId} style={[styles.row, e.userId === user?.id && styles.rowMe]}>
                <Text style={styles.rowRank}>{e.place}</Text>
                <View style={styles.rowAvatar}><Text style={styles.rowAvatarText}>{initial(e.name)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName} numberOfLines={1}>{e.userId === user?.id ? t('social.you') : e.name}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{t('leaderboardDetail.examMeta', { count: e.examCount, pct: e.avgPercentage })}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.rowXp}>{e.totalScore.toLocaleString('az-AZ')}</Text>
                  <Text style={styles.rowXpUnit}>XP</Text>
                </View>
              </View>
            ))}

            {/* Rest of the ranking */}
            {rest.length > 0 && (
              <View style={{ gap: 12 }}>
                {rest.map((e) => (
                  <View key={e.userId} style={[styles.row, e.userId === user?.id && styles.rowMe]}>
                    <Text style={styles.rowRank}>{e.place}</Text>
                    <View style={styles.rowAvatar}><Text style={styles.rowAvatarText}>{initial(e.name)}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName} numberOfLines={1}>{e.userId === user?.id ? t('social.you') : e.name}</Text>
                      <Text style={styles.rowSub} numberOfLines={1}>{t('leaderboardDetail.examMeta', { count: e.examCount, pct: e.avgPercentage })}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.rowXp}>{e.totalScore.toLocaleString('az-AZ')}</Text>
                      <Text style={styles.rowXpUnit}>XP</Text>
                    </View>
                  </View>
                ))}
              </View>
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

  center: { paddingVertical: 48, alignItems: 'center' },

  empty: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 },
  emptyCta: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, marginTop: 4 },
  emptyCtaText: { fontSize: 14, fontWeight: '800', color: '#fff' },

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
