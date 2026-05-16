import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { getLeague, type LeagueEntry } from '../../api/leaderboard.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <View style={styles.rankBadgeWrap}><Ionicons name="trophy" size={28} color="#FFD700" /></View>;
  if (rank === 2) return <View style={styles.rankBadgeWrap}><Ionicons name="ribbon" size={24} color="#C0C0C0" /></View>;
  if (rank === 3) return <View style={styles.rankBadgeWrap}><Ionicons name="ribbon" size={22} color="#CD7F32" /></View>;
  return <Text style={styles.rankNum}>{rank}</Text>;
}

export default function LeagueScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [leaders, setLeaders] = useState<LeagueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      const data = await getLeague();
      setLeaders(data);
    } catch {
      setLeaders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const me = leaders.find((l) => l.isCurrentUser);
  const maxScore = leaders.length > 0 ? leaders[0].weeklyScore : 1;
  const myScore = me?.weeklyScore ?? 0;
  const progress = maxScore > 0 ? Math.min(myScore / maxScore, 1) : 0;
  const toNext = maxScore - myScore;

  const initial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liqa Təfərrüatları</Text>
        <Ionicons name="trophy" size={22} color={Colors.primary} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
      >
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardWatermark} pointerEvents="none">
            <Ionicons name="sparkles" size={120} color={Colors.primary} style={{ opacity: 0.08 }} />
          </View>
          <View style={styles.shieldsRow}>
            <View style={styles.shieldItem}>
              <View style={[styles.shieldCircle, { backgroundColor: '#FFD70019' }]}>
                <Ionicons name="shield" size={32} color="#D4AF37" />
              </View>
              <Text style={styles.shieldLabel}>Qızıl</Text>
            </View>
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={GRADIENT}
                  style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
            <View style={[styles.shieldItem, { opacity: 0.4 }]}>
              <View style={[styles.shieldCircle, { backgroundColor: Colors.surfaceContainer }]}>
                <Ionicons name="shield" size={32} color={Colors.textSecondary} />
              </View>
              <Text style={styles.shieldLabel}>Platin</Text>
            </View>
          </View>

          <View style={styles.progressTextWrap}>
            <Text style={styles.progressTitle}>
              Platin liqasına{' '}
              <Text style={{ color: Colors.primary }}>{toNext > 0 ? `${toNext} XP` : '0 XP'}</Text>
              {' '}qalıb
            </Text>
            <Text style={styles.progressSub}>Zirvəyə gedən yolda daha bir addım!</Text>
          </View>
        </View>

        {/* Leaderboard Header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Liqa Liderləri</Text>
          <Text style={styles.listSubLabel}>Həftəlik Sıralama</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.leaderList}>
            {leaders.map((leader) => (
              <View
                key={leader.userId}
                style={[
                  styles.leaderRow,
                  leader.isCurrentUser && styles.leaderRowCurrent,
                  !leader.isCurrentUser && leader.rank > 3 && styles.leaderRowDimmed,
                ]}
              >
                <View style={styles.rankWrap}>
                  <RankBadge rank={leader.rank} />
                </View>

                {leader.isCurrentUser ? (
                  <LinearGradient colors={GRADIENT} style={styles.avatarGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.avatarLetter}>{initial(leader.name)}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={22} color={Colors.textSecondary} />
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={[styles.leaderName, leader.isCurrentUser && { color: Colors.textPrimary, fontWeight: '700' }]}>
                    {leader.isCurrentUser ? 'Sən' : leader.name}
                  </Text>
                  {leader.isCurrentUser && (
                    <View style={styles.risingBadge}>
                      <View style={styles.risingDot} />
                      <Text style={styles.risingText}>Yüksəlir</Text>
                    </View>
                  )}
                  {leader.rank === 1 && (
                    <Text style={styles.leaderSub}>Liderlik zirvəsində</Text>
                  )}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.leaderXP, leader.isCurrentUser && { color: Colors.primary, fontWeight: '800' }]}>
                    {leader.weeklyScore.toLocaleString()}
                  </Text>
                  <Text style={styles.xpLabel}>XP</Text>
                </View>
              </View>
            ))}
            {leaders.length === 0 && (
              <Text style={styles.empty}>Bu həftə hələ heç kim imtahan verməyib.</Text>
            )}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 56,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 20 },

  progressCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 32,
    gap: 24, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  progressCardWatermark: { position: 'absolute', top: -16, right: -16 },
  shieldsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shieldItem: { alignItems: 'center', gap: 8 },
  shieldCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  shieldLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  progressWrap: { flex: 1, paddingHorizontal: 16 },
  progressTrack: { height: 12, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressTextWrap: { alignItems: 'center', gap: 6 },
  progressTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  progressSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  listSubLabel: { fontSize: 10, fontWeight: '700', color: Colors.outlineVariant, textTransform: 'uppercase', letterSpacing: 1 },

  leaderList: { gap: 10 },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: 'transparent',
  },
  leaderRowCurrent: { backgroundColor: Colors.primary + '0D', borderWidth: 2, borderColor: Colors.primary + '33' },
  leaderRowDimmed: { opacity: 0.8 },

  rankWrap: { width: 40, alignItems: 'center', justifyContent: 'center' },
  rankBadgeWrap: { width: 40, alignItems: 'center' },
  rankNum: { fontSize: 18, fontWeight: '800', color: Colors.outlineVariant, textAlign: 'center' },

  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  avatarGrad: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 20, fontWeight: '700', color: '#fff' },

  leaderName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  leaderSub: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },

  risingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  risingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  risingText: { fontSize: 10, fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5 },

  leaderXP: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  xpLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },

  empty: { textAlign: 'center', color: Colors.textSecondary, paddingVertical: 40, fontSize: 14 },
});
