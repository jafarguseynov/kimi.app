import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getGlobalLeaderboard, type LeaderboardEntry } from '../../api/leaderboard.api';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.LiveLeaderboard> };

interface Participant {
  rank: number;
  name: string;
  short: string;
  score: number;
  trend: number;
  isUser: boolean;
}

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

function Avatar({ initial, size, gradient = false, border, borderColor }: { initial: string; size: number; gradient?: boolean; border?: number; borderColor?: string }) {
  const inner = (
    <LinearGradient
      colors={GRADIENT}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={{ fontSize: size * 0.36, fontWeight: '800', color: '#fff' }}>{initial}</Text>
    </LinearGradient>
  );
  if (gradient) {
    return (
      <LinearGradient
        colors={GRADIENT}
        style={{ width: size + 8, height: size + 8, borderRadius: (size + 8) / 2, padding: 4, alignItems: 'center', justifyContent: 'center' }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: '#fff', padding: 2 }}>
          <View style={{ flex: 1, borderRadius: size / 2, overflow: 'hidden' }}>{inner}</View>
        </View>
      </LinearGradient>
    );
  }
  if (border) {
    return (
      <View style={{ width: size + border * 2, height: size + border * 2, borderRadius: (size + border * 2) / 2, borderWidth: border, borderColor: borderColor ?? Colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>{inner}</View>
      </View>
    );
  }
  return <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>{inner}</View>;
}

export default function LiveLeaderboardScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUserStore((s) => s.user);
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      const data = await getGlobalLeaderboard();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const refresh = setInterval(fetchData, 5000);
    return () => clearInterval(refresh);
  }, []);

  const participants: Participant[] = useMemo(() => {
    return entries.map((e) => ({
      rank: e.rank,
      name: e.name,
      short: e.name.split(' ').map((p, i) => i === 0 ? p : p[0] + '.').slice(0, 2).join(' '),
      score: Math.round(e.totalScore),
      trend: 0,
      isUser: e.userId === user?.id,
    }));
  }, [entries, user?.id]);

  const top3 = participants.slice(0, 3);
  const rest = participants.slice(3, 9);
  const me = participants.find((p) => p.isUser);
  const initialOf = (name: string) => name.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('liveExams.detailHeader')}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{t('liveExams.liveBadge')}</Text>
          </View>
          <TouchableOpacity style={styles.helpBtn} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="help-circle-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{t('liveLb.leaderboardTitle')}</Text>
            <Text style={styles.heroSub}>{t('liveLb.heroSub')}</Text>
          </View>

          {/* Podium */}
          {top3.length >= 3 && (
            <View style={styles.podium}>
              {/* Rank 2 */}
              <View style={styles.podiumCol}>
                <View>
                  <Avatar initial={initialOf(top3[1].name)} size={56} border={4} borderColor={Colors.surfaceHighest} />
                  <View style={[styles.rankPill, { backgroundColor: Colors.surfaceHighest }]}>
                    <Text style={[styles.rankPillText, { color: Colors.textPrimary }]}>2</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{top3[1].short}</Text>
                <Text style={[styles.podiumScore, { color: Colors.primary }]}>{top3[1].score} XP</Text>
              </View>

              {/* Rank 1 (raised) */}
              <View style={[styles.podiumCol, styles.podiumColFirst]}>
                <View>
                  <Avatar initial={initialOf(top3[0].name)} size={84} gradient />
                  <View style={styles.rankPillFirst}>
                    <LinearGradient colors={GRADIENT} style={styles.rankPillFirstGrad}>
                      <Text style={styles.rankPillFirstText}>1</Text>
                    </LinearGradient>
                  </View>
                </View>
                <Text style={[styles.podiumName, styles.podiumNameFirst]} numberOfLines={1}>{top3[0].short}</Text>
                <Text style={[styles.podiumScore, styles.podiumScoreFirst]}>{top3[0].score} XP</Text>
              </View>

              {/* Rank 3 */}
              <View style={styles.podiumCol}>
                <View>
                  <Avatar initial={initialOf(top3[2].name)} size={56} border={4} borderColor={Colors.tertiaryContainer} />
                  <View style={[styles.rankPill, { backgroundColor: Colors.tertiaryContainer }]}>
                    <Text style={[styles.rankPillText, { color: Colors.tertiary }]}>3</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{top3[2].short}</Text>
                <Text style={[styles.podiumScore, { color: Colors.tertiary }]}>{top3[2].score} XP</Text>
              </View>
            </View>
          )}

          {/* List */}
          <View style={styles.list}>
            {rest.map((p) => (
              <View key={p.rank} style={styles.listRow}>
                <Text style={styles.listRank}>{p.rank}</Text>
                <Avatar initial={initialOf(p.name)} size={40} />
                <View style={styles.listInfo}>
                  <Text style={styles.listName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.listUnit}>{p.score} {t('liveLb.xpUnit')}</Text>
                </View>
                {p.trend > 0 && (
                  <View style={styles.trendUp}>
                    <Ionicons name="caret-up" size={14} color={Colors.tertiary} />
                    <Text style={styles.trendUpText}>{p.trend}</Text>
                  </View>
                )}
                {p.trend < 0 && (
                  <View style={styles.trendDown}>
                    <Ionicons name="caret-down" size={14} color={Colors.danger} />
                    <Text style={styles.trendDownText}>{Math.abs(p.trend)}</Text>
                  </View>
                )}
                {p.trend === 0 && <Ionicons name="remove" size={16} color={Colors.textLight} />}
              </View>
            ))}

            {/* Ellipsis */}
            {me && me.rank > 9 && (
              <View style={styles.ellipsis}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            )}

            {/* Me highlighted */}
            {me && me.rank > 9 && (
              <LinearGradient
                colors={GRADIENT}
                style={styles.meRow}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.meRank}>{me.rank}</Text>
                <View style={styles.meAvatarWrap}>
                  <View style={styles.meAvatarInner}>
                    <Avatar initial={initialOf(me.name)} size={44} />
                  </View>
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>{t('liveLb.you')}</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.meName}>{me.name}</Text>
                  <Text style={styles.meUnit}>{me.score} {t('liveLb.xpUnit')}</Text>
                </View>
                <View style={styles.meTrend}>
                  <Ionicons name="trending-up" size={14} color="#fff" />
                  <Text style={styles.meTrendText}>+{me.trend || 5}</Text>
                </View>
              </LinearGradient>
            )}
          </View>

          {/* Summary chip */}
          <View style={styles.summary}>
            <View style={styles.summaryChip}>
              <Ionicons name="people" size={18} color={Colors.primary} />
              <Text style={styles.summaryText}>
                {t('liveLb.summaryPre')}<Text style={styles.summaryBold}>{entries.length.toLocaleString('az-AZ')}</Text>{t('liveLb.summaryPost')}
              </Text>
            </View>
          </View>

          {participants.length === 0 && (
            <View style={styles.emptyBlock}>
              <Ionicons name="podium-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>{t('liveLb.emptyTitle')}</Text>
              <Text style={styles.emptySub}>{t('liveLb.emptySub')}</Text>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.tertiaryContainer + '4D',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.tertiary },
  liveText: { fontSize: 10, fontWeight: '700', color: Colors.tertiary, letterSpacing: 1 },
  helpBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24, gap: 28 },

  hero: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19, maxWidth: 320 },

  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 14, paddingTop: 20 },
  podiumCol: { alignItems: 'center', gap: 10, flex: 1 },
  podiumColFirst: { marginBottom: 18 },
  rankPill: {
    position: 'absolute', bottom: -6, right: -4,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  rankPillText: { fontSize: 11, fontWeight: '800' },
  rankPillFirst: { position: 'absolute', bottom: -10, left: '50%', marginLeft: -16 },
  rankPillFirstGrad: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  rankPillFirstText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  podiumName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, maxWidth: 96 },
  podiumNameFirst: { fontSize: 15, fontWeight: '800' },
  podiumScore: { fontSize: 12, fontWeight: '700' },
  podiumScoreFirst: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  list: { gap: 12 },
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
  },
  listRank: { width: 22, fontSize: 14, fontWeight: '800', color: Colors.textSecondary, textAlign: 'center' },
  listInfo: { flex: 1 },
  listName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  listUnit: { fontSize: 9, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
  trendUp: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trendUpText: { fontSize: 12, fontWeight: '700', color: Colors.tertiary },
  trendDown: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trendDownText: { fontSize: 12, fontWeight: '700', color: Colors.danger },

  ellipsis: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.surfaceHighest },

  meRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, padding: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 4,
  },
  meRank: { width: 22, fontSize: 14, fontWeight: '800', color: '#fff', textAlign: 'center' },
  meAvatarWrap: { position: 'relative' },
  meAvatarInner: { borderWidth: 2, borderColor: '#fff', borderRadius: 999, overflow: 'hidden' },
  youBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#fff', borderRadius: 999,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  youBadgeText: { fontSize: 8, fontWeight: '800', color: Colors.primary, letterSpacing: 0.8 },
  meName: { fontSize: 13, fontWeight: '800', color: '#fff' },
  meUnit: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  meTrend: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
  },
  meTrendText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  summary: { alignItems: 'center' },
  summaryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 999, paddingHorizontal: 22, paddingVertical: 12,
  },
  summaryText: { fontSize: 13, color: Colors.textPrimary },
  summaryBold: { fontWeight: '800' },

  emptyBlock: { alignItems: 'center', padding: 32, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
});
