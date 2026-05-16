import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { getGlobalLeaderboard, getLeague, type LeaderboardEntry, type LeagueEntry } from '../../api/leaderboard.api';
import { useUserStore } from '../../store/user.store';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const BAR_HEIGHTS: Record<1 | 2 | 3, number> = { 1: 128, 2: 96, 3: 80 };
const AVATAR_SIZES: Record<1 | 2 | 3, number> = { 1: 88, 2: 64, 3: 56 };
const MEDALS: Record<1 | 2 | 3, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function AvatarCircle({ initial, size }: { initial: string; size: number }) {
  return (
    <LinearGradient
      colors={GRADIENT}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={{ fontSize: size * 0.32, fontWeight: '800', color: '#fff' }}>
        {initial}
      </Text>
    </LinearGradient>
  );
}

export default function LeaderboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [globalData, setGlobalData] = useState<LeaderboardEntry[]>([]);
  const [leagueData, setLeagueData] = useState<LeagueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useUserStore((s) => s.user);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      if (activeTab === 0) {
        const data = await getGlobalLeaderboard();
        setGlobalData(data);
      } else {
        const data = await getLeague();
        setLeagueData(data);
      }
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeTab]);

  const podiumOrder = (entries: LeaderboardEntry[]) => {
    const top3 = entries.slice(0, 3);
    if (top3.length < 3) return top3;
    // Display order: 2nd, 1st, 3rd
    return [top3[1], top3[0], top3[2]];
  };

  const initial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <AvatarCircle initial={initial(user?.name ?? 'S')} size={40} />
          </View>
          <Text style={styles.headerTitle}>Liderlik Cədvəli</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />
        }
      >
        {/* Filter tabs */}
        <View style={styles.tabsWrap}>
          {(['Global', 'Liqa'] as const).map((label, i) => (
            <TouchableOpacity
              key={label}
              style={[styles.tab, activeTab === i && styles.tabActive]}
              onPress={() => setActiveTab(i as 0 | 1)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : activeTab === 0 ? (
          /* ─── Global leaderboard ─── */
          <>
            {globalData.length >= 3 && (
              <View style={styles.podium}>
                {podiumOrder(globalData).map((entry) => {
                  const rank = entry.rank as 1 | 2 | 3;
                  const isFirst = rank === 1;
                  const avatarSize = AVATAR_SIZES[rank] ?? 56;
                  const barHeight = BAR_HEIGHTS[rank] ?? 80;
                  return (
                    <View key={entry.userId} style={styles.podiumCol}>
                      {isFirst && <View style={styles.podiumAura} pointerEvents="none" />}
                      <View style={[styles.podiumAvatarWrap, { borderColor: isFirst ? Colors.primaryFixed : Colors.surfaceContainer }]}>
                        <AvatarCircle initial={initial(entry.name)} size={avatarSize} />
                      </View>
                      {isFirst ? (
                        <LinearGradient colors={GRADIENT} style={styles.medalBadgeGold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                          <Text style={styles.medalText}>{MEDALS[rank]}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.medalBadge}>
                          <Text style={styles.medalText}>{MEDALS[rank]}</Text>
                        </View>
                      )}
                      <Text style={[styles.podiumName, isFirst && styles.podiumNameFirst]} numberOfLines={1}>
                        {entry.name.split(' ')[0]}
                      </Text>
                      <Text style={[styles.podiumBal, isFirst && styles.podiumBalFirst]}>
                        {entry.totalScore} bal
                      </Text>
                      {isFirst ? (
                        <LinearGradient colors={GRADIENT} style={[styles.podiumBar, { height: barHeight }]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                          <Text style={styles.podiumBarRank}>1</Text>
                        </LinearGradient>
                      ) : (
                        <View style={[styles.podiumBar, { height: barHeight, backgroundColor: rank === 2 ? Colors.surfaceLow : Colors.surfaceContainer }]} />
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.list}>
              {globalData.slice(3).map((entry) => {
                const isMe = entry.userId === user?.id;
                return (
                  <View key={entry.userId} style={[styles.listRow, isMe && styles.listRowMe]}>
                    {isMe && <View style={styles.listRowAccent} />}
                    <Text style={[styles.listRank, isMe && styles.listRankMe]}>{entry.rank}</Text>
                    <View style={[styles.listAvatar, isMe && styles.listAvatarMe]}>
                      <AvatarCircle initial={initial(entry.name)} size={48} />
                    </View>
                    <View style={styles.listInfo}>
                      <Text style={[styles.listName, isMe && styles.listNameMe]}>
                        {isMe ? 'Sən' : entry.name}
                      </Text>
                      <Text style={styles.listSub}>{entry.examCount} imtahan · %{entry.avgPercentage}</Text>
                    </View>
                    <Text style={[styles.listBal, isMe && styles.listBalMe]}>
                      {entry.totalScore} <Text style={styles.listBalUnit}>bal</Text>
                    </Text>
                  </View>
                );
              })}
              {globalData.length === 0 && (
                <Text style={styles.empty}>Hələ heç kim imtahan verməyib.</Text>
              )}
            </View>
          </>
        ) : (
          /* ─── League ─── */
          <View style={styles.list}>
            {leagueData.map((entry) => (
              <View key={entry.userId} style={[styles.listRow, entry.isCurrentUser && styles.listRowMe]}>
                {entry.isCurrentUser && <View style={styles.listRowAccent} />}
                <Text style={[styles.listRank, entry.isCurrentUser && styles.listRankMe]}>{entry.rank}</Text>
                <View style={[styles.listAvatar, entry.isCurrentUser && styles.listAvatarMe]}>
                  <AvatarCircle initial={initial(entry.name)} size={48} />
                </View>
                <View style={styles.listInfo}>
                  <Text style={[styles.listName, entry.isCurrentUser && styles.listNameMe]}>
                    {entry.isCurrentUser ? 'Sən' : entry.name}
                  </Text>
                  {entry.isCurrentUser && (
                    <View style={styles.trendChip}>
                      <Ionicons name="trending-up" size={12} color={Colors.tertiary} />
                      <Text style={styles.trendChipText}>Bu həftə</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.listBal, entry.isCurrentUser && styles.listBalMe]}>
                  {entry.weeklyScore} <Text style={styles.listBalUnit}>bal</Text>
                </Text>
              </View>
            ))}
            {leagueData.length === 0 && (
              <Text style={styles.empty}>Bu həftə hələ heç kim imtahan verməyib.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { borderRadius: 20, overflow: 'hidden' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { paddingBottom: 48, gap: 28 },

  tabsWrap: {
    flexDirection: 'row', marginHorizontal: 24, marginTop: 20,
    backgroundColor: Colors.surfaceLow, borderRadius: 999, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  tabActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1,
  },
  tabText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { fontWeight: '700', color: Colors.primary },

  center: { paddingTop: 60, alignItems: 'center' },
  empty: { textAlign: 'center', color: Colors.textSecondary, paddingVertical: 40, fontSize: 14 },

  podium: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    paddingHorizontal: 16, gap: 6,
  },
  podiumCol: { flex: 1, alignItems: 'center', gap: 6, position: 'relative' },
  podiumAura: {
    position: 'absolute', top: -8, left: '10%', right: '10%',
    height: 80, backgroundColor: Colors.primaryFixed, opacity: 0.35, borderRadius: 999,
  },
  podiumAvatarWrap: { borderWidth: 3, borderRadius: 999, overflow: 'hidden' },
  medalBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  medalBadgeGold: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  medalText: { fontSize: 16 },
  podiumName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  podiumNameFirst: { fontSize: 15, fontWeight: '800' },
  podiumBal: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  podiumBalFirst: { fontSize: 13, fontWeight: '800' },
  podiumBar: {
    width: '100%', borderRadius: 8,
    alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8,
  },
  podiumBarRank: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.5)' },

  list: { paddingHorizontal: 24, gap: 10 },
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
    overflow: 'hidden',
  },
  listRowMe: { backgroundColor: Colors.surfaceLow, borderWidth: 1, borderColor: Colors.primary + '33' },
  listRowAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: Colors.primary },
  listRank: { width: 22, textAlign: 'center', fontSize: 14, fontWeight: '700', color: Colors.outlineVariant },
  listRankMe: { color: Colors.textPrimary, fontWeight: '800' },
  listAvatar: { borderRadius: 24, overflow: 'hidden' },
  listAvatarMe: { borderWidth: 2, borderColor: Colors.primary, borderRadius: 26 },
  listInfo: { flex: 1 },
  listName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  listNameMe: { fontWeight: '800', color: Colors.textPrimary },
  listSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  trendChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4,
    backgroundColor: Colors.tertiaryContainer + '4D',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  trendChipText: { fontSize: 10, fontWeight: '700', color: Colors.tertiary },
  listBal: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  listBalMe: { color: Colors.primary },
  listBalUnit: { fontSize: 10, fontWeight: '500', color: Colors.textSecondary },
});
