import React from 'react';
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
import { getGlobalLeaderboard, type LeaderboardEntry } from '../../api/leaderboard.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function LiveActivityScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);

  const { data: board = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard-detail'],
    queryFn: getGlobalLeaderboard,
  });

  const leaders = board.slice(0, 8);
  const totalStudents = board.length;
  const totalExams = board.reduce((s, e) => s + (e.examCount || 0), 0);
  const initial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="star" size={18} color={Colors.primary} />
          <Text style={styles.headerTitle}>{t('liveActivity.headerTitle')}</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pair-tab switcher: Fəaliyyət / Xəbərlər */}
        <View style={pairTab.row}>
          <View style={[pairTab.btn, pairTab.btnActive]}>
            <Text style={[pairTab.text, pairTab.textActive]}>{t('liveActivity.tabActivity')}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.replace(Routes.News)}
            style={pairTab.btn}
          >
            <Text style={pairTab.text}>{t('liveActivity.tabNews')}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero — real community aggregate */}
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Ionicons name="people" size={28} color="#fff" style={{ marginBottom: 12 }} />
          <Text style={styles.heroTitle}>{t('liveActivity.heroTitle')}</Text>
          <Text style={styles.heroSub}>
            {t('liveActivity.heroSub', { students: totalStudents.toLocaleString('az-AZ'), exams: totalExams.toLocaleString('az-AZ') })}
          </Text>
        </LinearGradient>

        {/* Bento stats — real */}
        <View style={styles.bentoRow}>
          <View style={styles.bentoCard}>
            <Ionicons name="people" size={22} color={Colors.primary} style={{ marginBottom: 10 }} />
            <Text style={styles.bentoNum}>{totalStudents.toLocaleString('az-AZ')}</Text>
            <Text style={styles.bentoLabel}>{t('liveActivity.activeStudents')}</Text>
          </View>
          <View style={styles.bentoCard}>
            <Ionicons name="checkmark-done-circle" size={22} color={Colors.tertiary} style={{ marginBottom: 10 }} />
            <Text style={styles.bentoNum}>{totalExams.toLocaleString('az-AZ')}</Text>
            <Text style={styles.bentoLabel}>{t('liveActivity.newSuccess')}</Text>
          </View>
        </View>

        {/* Section header */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t('liveActivity.recentTitle')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate(Routes.LeaderboardDetail)}>
            <Text style={styles.linkText}>{t('socialHub.all')}</Text>
          </TouchableOpacity>
        </View>

        {/* Community leaders — real leaderboard */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 8 }} />
        ) : leaders.length === 0 ? (
          <Text style={styles.emptyLine}>{t('liveActivity.emptyLeaders')}</Text>
        ) : (
          <View style={{ gap: 14 }}>
            {leaders.map((e) => {
              const me = e.userId === user?.id;
              return (
                <TouchableOpacity
                  key={e.userId}
                  style={[styles.card, me && styles.cardMe]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate(Routes.LeaderboardDetail)}
                >
                  <Text style={styles.rank}>{e.rank}</Text>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial(e.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName} numberOfLines={1}>{me ? t('leaderboardDetail.youLabel') : e.name}</Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {t('leaderboardDetail.examMeta', { count: e.examCount, pct: e.avgPercentage })}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.xp}>{e.totalScore.toLocaleString('az-AZ')}</Text>
                    <Text style={styles.xpUnit}>XP</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 24, gap: 28, paddingBottom: 48 },

  /* Hero */
  hero: {
    borderRadius: 20, padding: 28, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 40, elevation: 6,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -0.5, marginBottom: 8 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 19 },

  /* Bento */
  bentoRow: { flexDirection: 'row', gap: 14 },
  bentoCard: {
    flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 22,
  },
  bentoNum: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  bentoLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },

  /* Section head */
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  linkText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  emptyLine: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 16 },

  /* Card */
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },
  cardMe: { borderWidth: 1.5, borderColor: Colors.primary },
  rank: { width: 22, fontSize: 14, fontWeight: '800', color: Colors.textSecondary, textAlign: 'center' },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  cardName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  meta: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  xp: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  xpUnit: { fontSize: 10, fontWeight: '500', color: Colors.textSecondary, marginTop: 1 },
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
