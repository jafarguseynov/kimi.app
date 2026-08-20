import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { getGlobalLeaderboard, type LeaderboardEntry } from '../../api/leaderboard.api';
import { useUserStore } from '../../store/user.store';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { useReturnTab } from '../../hooks/useReturnTab';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
type Scope = 'students' | 'schools' | 'friends' | 'me';

const TOP_SCHOOLS = [
  { name: 'Modern Lisey', city: 'Bakı, Azərbaycan', rank: 1, icon: 'school' as const, bg: '#EFF6FF', tint: '#3B82F6' },
  { name: 'Akademik Lisey', city: 'Gəncə, Azərbaycan', rank: 2, icon: 'business' as const, bg: '#ECFDF5', tint: '#10B981' },
  { name: '160 saylı tam orta', city: 'Bakı, Azərbaycan', rank: 3, icon: 'school-outline' as const, bg: '#FEF3C7', tint: '#D97706' },
];

const TAB_OPTIONS: { key: Scope; labelKey: string }[] = [
  { key: 'students', labelKey: 'leaderboard.tabStudents' },
  { key: 'schools', labelKey: 'leaderboard.tabSchools' },
  { key: 'friends', labelKey: 'leaderboard.tabFriends' },
  { key: 'me', labelKey: 'leaderboard.tabMe' },
];

function Avatar({ initial, size, gradient = false, border, borderColor, avatarUrl }: { initial: string; size: number; gradient?: boolean; border?: number; borderColor?: string; avatarUrl?: string | null }) {
  // Profil şəkli varsa onu göstər; yoxdursa gradient + ad baş hərfi (köhnə davranış).
  const inner = avatarUrl ? (
    <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} resizeMode="cover" />
  ) : (
    <LinearGradient
      colors={GRADIENT}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={{ fontSize: size * 0.34, fontWeight: '800', color: '#fff' }}>{initial}</Text>
    </LinearGradient>
  );
  if (gradient) {
    return (
      <LinearGradient
        colors={GRADIENT}
        style={{ width: size + 12, height: size + 12, borderRadius: (size + 12) / 2, padding: 6, alignItems: 'center', justifyContent: 'center' }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: '#fff', padding: 3 }}>
          <View style={{ flex: 1, borderRadius: size / 2, overflow: 'hidden' }}>{inner}</View>
        </View>
      </LinearGradient>
    );
  }
  if (border) {
    return (
      <View style={{ width: size + border * 2, height: size + border * 2, borderRadius: (size + border * 2) / 2, padding: border, backgroundColor: borderColor ?? Colors.surfaceHighest }}>
        <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>{inner}</View>
      </View>
    );
  }
  return <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>{inner}</View>;
}

export default function LeaderboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  // Profil/İmtahanlar tabından açılıbsa geri həmin taba qayıt.
  useReturnTab();
  const [scope, setScope] = useState<Scope>('students');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useUserStore((s) => s.user);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const board = await getGlobalLeaderboard();
      setData(Array.isArray(board) ? board : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const initial = (name: string) => name.charAt(0).toUpperCase();
  const top3 = data.slice(0, 3);
  const list = data.slice(3, 9);
  const me = data.find((e) => e.userId === user?.id);
  const nextTarget = me ? Math.max(1, Math.ceil(me.rank / 10) * 10 - 10) : null;
  const targetGain = me && nextTarget !== null && data[nextTarget - 1]
    ? Math.max(0, data[nextTarget - 1].totalScore - me.totalScore + 50)
    : 450;
  const progressToTarget = me && nextTarget !== null && me.rank > nextTarget
    ? Math.min(0.95, (data.length - me.rank) / Math.max(1, data.length - nextTarget))
    : 0.66;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8} style={styles.bellBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('home.student.topStudents')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity
            activeOpacity={0.7} hitSlop={8} style={styles.bellBtn}
            onPress={() => navigation.navigate(Routes.LeaderboardDetail)}
          >
            <Ionicons name="podium-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} hitSlop={8} style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
      >
        {/* Headline */}
        <View>
          <Text style={styles.pageTitle}>{t('leaderboard.pageTitle')}</Text>
          <Text style={styles.pageSub}>{t('leaderboard.pageSub')}</Text>
        </View>

        {/* Segmented tabs (scrollable) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsListInner}>
          <View style={styles.tabsWrap}>
            {TAB_OPTIONS.map(({ key, labelKey }) => (
              <TouchableOpacity
                key={key}
                style={[styles.tab, scope === key && styles.tabActive]}
                onPress={() => setScope(key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, scope === key && styles.tabTextActive]}>{t(labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : scope === 'schools' ? (
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>{t('leaderboard.topSchools')}</Text>
            {TOP_SCHOOLS.map((s) => (
              <TouchableOpacity
                key={s.name}
                style={styles.schoolRow}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(Routes.SchoolRanking)}
              >
                <Text style={styles.studentRank}>{s.rank}</Text>
                <View style={[styles.schoolIcon, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={20} color={s.tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.schoolName}>{s.name}</Text>
                  <Text style={styles.schoolCity}>{s.city}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ) : scope === 'friends' ? (
          <View style={styles.placeholder}>
            <Ionicons name="people-outline" size={42} color={Colors.textMuted} />
            <Text style={styles.placeholderTitle}>{t('leaderboard.friendsTitle')}</Text>
            <Text style={styles.placeholderSub}>{t('leaderboard.friendsSub')}</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate(Routes.Friends)}
              style={{ marginTop: 12 }}
            >
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.placeholderCta}>
                <Ionicons name="person-add-outline" size={18} color="#fff" />
                <Text style={styles.placeholderCtaText}>{t('leaderboard.seeFriends')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : scope === 'me' ? (
          <View style={{ gap: 16 }}>
            {me ? (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDim ?? '#00547e']}
                style={styles.myCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.myCardGlow} />
                <View style={styles.myCardTop}>
                  <View>
                    <Text style={styles.myCardLabel}>{t('leaderboard.myPlace')}</Text>
                    <Text style={styles.myCardRank}>{t('leaderboard.rankOrdinal', { n: me.rank })}</Text>
                  </View>
                  <View style={styles.myCardIconWrap}>
                    <Ionicons name="trending-up" size={22} color="#fff" />
                  </View>
                </View>
                <View style={{ gap: 8 }}>
                  <View style={styles.myCardRowBetween}>
                    <Text style={styles.myCardHint}>{t('leaderboard.nextTarget', { n: nextTarget ?? 0 })}</Text>
                    <Text style={styles.myCardHint}>{t('leaderboard.pointsGain', { n: targetGain })}</Text>
                  </View>
                  <View style={styles.myCardTrack}>
                    <View style={[styles.myCardFill, { width: `${Math.round(progressToTarget * 100)}%` as any }]} />
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="rocket-outline" size={42} color={Colors.textMuted} />
                <Text style={styles.placeholderTitle}>{t('leaderboard.noPlaceTitle')}</Text>
                <Text style={styles.placeholderSub}>{t('leaderboard.noPlaceSub')}</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length >= 3 && (
              <View style={styles.podium}>
                {/* Rank 2 */}
                <View style={styles.podiumCol}>
                  <View>
                    <Avatar initial={initial(top3[1].name)} size={56} border={4} borderColor={Colors.surfaceHighest} avatarUrl={top3[1].avatarUrl} />
                    <View style={[styles.podiumPill, { backgroundColor: '#CBD5E1' }]}>
                      <Text style={[styles.podiumPillText, { color: '#1E293B' }]}>2</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{top3[1].name.split(' ')[0]}</Text>
                  <Text style={[styles.podiumScore, { color: Colors.primary }]}>{t('leaderboard.pointsAbbr', { n: top3[1].totalScore })}</Text>
                </View>

                {/* Rank 1 (raised, crown) */}
                <View style={[styles.podiumCol, styles.podiumColFirst]}>
                  <View>
                    <View style={styles.crown}>
                      <Ionicons name="ribbon" size={28} color="#F59E0B" />
                    </View>
                    <Avatar initial={initial(top3[0].name)} size={84} gradient avatarUrl={top3[0].avatarUrl} />
                    <View style={styles.podiumPillFirst}>
                      <Text style={styles.podiumPillFirstText}>1</Text>
                    </View>
                  </View>
                  <Text style={[styles.podiumName, styles.podiumNameFirst]} numberOfLines={1}>{top3[0].name.split(' ')[0]}</Text>
                  <Text style={[styles.podiumScore, styles.podiumScoreFirst]}>{t('leaderboard.pointsAbbr', { n: top3[0].totalScore })}</Text>
                </View>

                {/* Rank 3 */}
                <View style={styles.podiumCol}>
                  <View>
                    <Avatar initial={initial(top3[2].name)} size={56} border={4} borderColor={Colors.surfaceHighest} avatarUrl={top3[2].avatarUrl} />
                    <View style={[styles.podiumPill, { backgroundColor: '#FED7AA' }]}>
                      <Text style={[styles.podiumPillText, { color: '#9A3412' }]}>3</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{top3[2].name.split(' ')[0]}</Text>
                  <Text style={[styles.podiumScore, { color: Colors.primary }]}>{t('leaderboard.pointsAbbr', { n: top3[2].totalScore })}</Text>
                </View>
              </View>
            )}

            {/* User rank card */}
            {me && (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDim ?? '#00547e']}
                style={styles.myCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.myCardGlow} />
                <View style={styles.myCardTop}>
                  <View>
                    <Text style={styles.myCardLabel}>{t('leaderboard.myPlace')}</Text>
                    <Text style={styles.myCardRank}>{t('leaderboard.rankOrdinal', { n: me.rank })}</Text>
                  </View>
                  <View style={styles.myCardIconWrap}>
                    <Ionicons name="trending-up" size={22} color="#fff" />
                  </View>
                </View>
                <View style={{ gap: 8 }}>
                  <View style={styles.myCardRowBetween}>
                    <Text style={styles.myCardHint}>{t('leaderboard.nextTarget', { n: nextTarget ?? 0 })}</Text>
                    <Text style={styles.myCardHint}>{t('leaderboard.pointsGain', { n: targetGain })}</Text>
                  </View>
                  <View style={styles.myCardTrack}>
                    <View style={[styles.myCardFill, { width: `${Math.round(progressToTarget * 100)}%` as any }]} />
                  </View>
                </View>
              </LinearGradient>
            )}

            {/* Top students list */}
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('leaderboard.topStudents')}</Text>
                <TouchableOpacity activeOpacity={0.7} hitSlop={8}>
                  <Text style={styles.sectionMore}>{t('leaderboard.all')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.studentList}>
                {list.map((s, i) => (
                  <React.Fragment key={s.userId}>
                    <View style={[styles.studentRow, i < list.length - 1 && styles.studentRowBorder]}>
                      <Text style={styles.studentRank}>{s.rank}</Text>
                      <Avatar initial={initial(s.name)} size={40} avatarUrl={s.avatarUrl} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentName} numberOfLines={1}>{s.userId === user?.id ? t('leaderboard.you') : s.name}</Text>
                        <Text style={styles.studentSub} numberOfLines={1}>{t('leaderboard.examMeta', { count: s.examCount, pct: s.avgPercentage })}</Text>
                      </View>
                      <View style={styles.scoreCol}>
                        <Text style={styles.studentScore}>{s.totalScore}</Text>
                        <Text style={styles.studentUnit}>{t('leaderboard.scoreUnit')}</Text>
                      </View>
                    </View>
                    {i === 2 && (
                      <LinearGradient
                        colors={GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.seasonCard}
                      >
                        <View style={{ flex: 1, gap: 8 }}>
                          <Text style={styles.seasonKicker}>{t('leaderboard.seasonKicker')}</Text>
                          <Text style={styles.seasonTitle}>{t('leaderboard.seasonTitle')}</Text>
                          <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate(Routes.SpinWheel)}
                            style={styles.seasonBtn}
                          >
                            <Text style={styles.seasonBtnText}>{t('leaderboard.seasonBtn')}</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.seasonIconWrap} pointerEvents="none">
                          <Ionicons name="rocket" size={96} color="rgba(255,255,255,0.2)" />
                        </View>
                      </LinearGradient>
                    )}
                  </React.Fragment>
                ))}
                {list.length === 0 && top3.length === 0 && (
                  <Text style={styles.empty}>{t('leaderboard.emptyNoone')}</Text>
                )}
              </View>
            </View>
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
    paddingHorizontal: 20, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { padding: 20, paddingBottom: 32, gap: 24 },

  pageTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, lineHeight: 34 },
  pageSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 6 },

  tabsListInner: { paddingVertical: 2 },
  tabsWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, padding: 6,
    gap: 4,
  },
  tab: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  tabActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1,
  },
  tabText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { fontWeight: '700', color: Colors.primary },

  center: { paddingTop: 60, alignItems: 'center' },
  placeholder: { alignItems: 'center', gap: 8, padding: 40 },
  placeholderTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  placeholderSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 14, paddingTop: 32, paddingBottom: 8 },
  podiumCol: { alignItems: 'center', gap: 10, flex: 1 },
  podiumColFirst: { marginBottom: 18 },
  crown: { position: 'absolute', top: -22, right: -4, zIndex: 2 },
  podiumPill: {
    position: 'absolute', bottom: -8, left: '50%', marginLeft: -16,
    width: 32, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  podiumPillText: { fontSize: 11, fontWeight: '800' },
  podiumPillFirst: {
    position: 'absolute', bottom: -12, left: '50%', marginLeft: -24,
    width: 48, height: 24, borderRadius: 12,
    backgroundColor: '#FBBF24',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  podiumPillFirstText: { fontSize: 13, fontWeight: '900', color: '#78350F' },
  podiumName: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, maxWidth: 96 },
  podiumNameFirst: { fontSize: 14, fontWeight: '800' },
  podiumScore: { fontSize: 11, fontWeight: '700' },
  podiumScoreFirst: { fontSize: 13, fontWeight: '800', color: Colors.primary },

  myCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 6,
  },
  myCardGlow: {
    position: 'absolute', right: -40, bottom: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  myCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  myCardLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1.5 },
  myCardRank: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 4 },
  myCardIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  myCardRowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  myCardHint: { fontSize: 11, fontWeight: '600', color: '#fff' },
  myCardTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' },
  myCardFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  sectionMore: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  studentList: { backgroundColor: Colors.surfaceLowest, borderRadius: 20, overflow: 'hidden' },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  studentRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceLow },
  studentRank: { width: 22, fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
  studentName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  studentSub: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  scoreCol: { alignItems: 'flex-end' },
  studentScore: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  studentUnit: { fontSize: 9, color: Colors.textSecondary, marginTop: 2 },

  schoolsGrid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  schoolCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  schoolIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  schoolName: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  schoolCity: { fontSize: 10, color: Colors.textSecondary },
  schoolRankRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  schoolRankNum: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  schoolRankUnit: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },

  empty: { textAlign: 'center', color: Colors.textSecondary, paddingVertical: 30, fontSize: 13 },

  schoolRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },

  placeholderCta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 3,
  },
  placeholderCtaText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  seasonCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 20, padding: 20, marginVertical: 10,
    overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 6,
  },
  seasonKicker: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5 },
  seasonTitle: { fontSize: 17, fontWeight: '800', color: '#fff', lineHeight: 22, maxWidth: '90%' },
  seasonBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff', borderRadius: 999,
    paddingHorizontal: 18, paddingVertical: 8,
    marginTop: 4,
  },
  seasonBtnText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  seasonIconWrap: {
    position: 'absolute', right: -16, bottom: -16,
    transform: [{ rotate: '12deg' }],
  },
});
