import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { getUserStats } from '../../api/dashboard.api';
import { getTeachers, getTeacherAnalytics } from '../../api/user.api';
import { getGlobalLeaderboard } from '../../api/leaderboard.api';
import { getTeacherBookings } from '../../api/booking.api';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.HomeMain>;
};

const TEACHER_QUICK_ACTIONS = [
  { icon: 'create-outline', label: 'Profili\nredaktə et' },
  { icon: 'help-circle-outline', label: 'Sorğular' },
  { icon: 'document-text-outline', label: 'Tələblər' },
  { icon: 'chatbubble-outline', label: 'Mesajlar' },
  { icon: 'stats-chart-outline', label: 'Statistikalar' },
] as const;

// ── Component ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }: Props) {
  const { user } = useUserStore();
  const firstName = user?.name?.split(' ')[0] || 'İstifadəçi';
  const isTeacher = user?.role === 'teacher';
  const isParent = user?.role === 'parent';

  const { data: stats } = useQuery({ queryKey: ['user-stats'], queryFn: getUserStats, enabled: !isTeacher });
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers-home'], queryFn: () => getTeachers({ limit: 3 }), enabled: !isTeacher && !isParent });
  const { data: leaderboard = [] } = useQuery({ queryKey: ['leaderboard-home'], queryFn: getGlobalLeaderboard, enabled: !isTeacher && !isParent });
  const { data: analytics } = useQuery({ queryKey: ['teacher-analytics'], queryFn: getTeacherAnalytics, enabled: isTeacher });
  const { data: teacherBookings = [] } = useQuery({ queryKey: ['teacher-bookings-home'], queryFn: getTeacherBookings, enabled: isTeacher });

  const pendingBookings = teacherBookings.filter((b) => b.status === 'pending').slice(0, 3);
  const confirmedBookings = teacherBookings.filter((b) => b.status === 'confirmed').slice(0, 3);
  const topStudents = leaderboard.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Shared Top Bar ── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.topAvatar}
          >
            <Ionicons name="person" size={16} color="#fff" />
          </LinearGradient>
          <Text style={styles.logoText}>Kimi.az</Text>
        </View>
        <View style={styles.topBarRight}>
          {!isTeacher && !isParent && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={15} color="#f97316" />
              <Text style={styles.streakText}>{stats?.activeDays ?? 0} gün streak</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.notifBtn}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Bildirişlər', 'Yeni bildiriş yoxdur')}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
            {(isTeacher || isParent) && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isTeacher ? (
          // ════════════════ TEACHER VIEW ════════════════
          <>
            {/* Greeting */}
            <View style={styles.greetSection}>
              <Text style={styles.greetSmall}>Xoş gəldiniz,</Text>
              <Text style={styles.greetTitle}>Salam, {firstName} müəllimə 👋</Text>
            </View>

            {/* Earnings Card */}
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.earningsCard}
            >
              <View style={styles.earningsTop}>
                <View>
                  <Text style={styles.earningsLabel}>Aylıq qazanc</Text>
                  <Text style={styles.earningsAmount}>{analytics?.monthlyEarnings ?? 0} AZN</Text>
                </View>
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={11} color="#fff" />
                  <Text style={styles.premiumText}>PREMİUM</Text>
                </View>
              </View>
              <View style={styles.earningsTrend}>
                <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.earningsTrendText}>Ötən aya nisbətən +12% artım</Text>
              </View>
              <View style={styles.earningsGlow} />
            </LinearGradient>

            {/* Quick Actions — 5 icon buttons */}
            <View style={styles.quickActions}>
              {TEACHER_QUICK_ACTIONS.map((a, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickActionItem}
                  activeOpacity={0.7}
                  onPress={() => Alert.alert(a.label.replace('\n', ' '), 'Tezliklə')}
                >
                  <View style={styles.quickActionIcon}>
                    <Ionicons name={a.icon} size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.quickActionLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics?.totalStudents ?? 0}</Text>
                <Text style={styles.statLabel}>Aktiv şagird</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics?.profileViews ?? 0}</Text>
                <Text style={styles.statLabel}>Profil baxışı</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.ratingWrap}>
                  <Text style={styles.statValue}>{analytics?.rating?.toFixed(1) ?? '—'}</Text>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                </View>
                <Text style={styles.statLabel}>Reytinq</Text>
              </View>
            </View>

            {/* AI Insight */}
            <View style={styles.aiCard}>
              <View style={styles.aiIconWrap}>
                <Ionicons name="hardware-chip-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>AI Tövsiyəsi</Text>
                <Text style={styles.aiText}>
                  Profilinizi tamamlayaraq 20% daha çox şagird cəlb edə bilərsiniz.
                </Text>
              </View>
            </View>

            {/* New Requests */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Yeni sorğular</Text>
              <TouchableOpacity onPress={() => Alert.alert('Sorğular', 'Hamısına bax')}>
                <Text style={styles.seeAll}>Hamısına bax</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.requestList}>
              {pendingBookings.length === 0 ? (
                <View style={styles.requestCard}>
                  <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Yeni sorğu yoxdur</Text>
                </View>
              ) : (
                pendingBookings.map((b) => {
                  const name = b.student?.name ?? 'Şagird';
                  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <View key={b.id} style={styles.requestCard}>
                      <View style={styles.requestLeft}>
                        <View style={styles.requestAvatar}>
                          <Text style={styles.requestInitials}>{initials}</Text>
                        </View>
                        <View>
                          <Text style={styles.requestName}>{name}</Text>
                          <Text style={styles.requestDetail}>{b.subject ?? 'Ümumi dərs'}</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.requestChevron} onPress={() => Alert.alert('Sorğu', name)}>
                        <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>

            {/* Upcoming Lessons */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Gələn dərs tələbləri</Text>
              <TouchableOpacity onPress={() => Alert.alert('Təqvim', 'Tezliklə')}>
                <Text style={styles.seeAll}>Təqvim</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.lessonList}>
              {confirmedBookings.length === 0 ? (
                <View style={styles.lessonItem}>
                  <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Planlanmış dərs yoxdur</Text>
                </View>
              ) : (
                confirmedBookings.map((b, i) => {
                  const d = new Date(b.scheduledAt);
                  const dayNum = d.getDate().toString();
                  const dayLabel = d.toLocaleDateString('az-AZ', { weekday: 'short' });
                  const timeStr = d.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
                  const studentName = b.student?.name ?? 'Şagird';
                  return (
                    <View key={b.id} style={[styles.lessonItem, i < confirmedBookings.length - 1 && styles.lessonItemBorder]}>
                      <View style={styles.lessonLeft}>
                        <View style={styles.lessonDateBox}>
                          <Text style={styles.lessonDayLabel}>{dayLabel}</Text>
                          <Text style={styles.lessonDayNum}>{dayNum}</Text>
                        </View>
                        <View>
                          <Text style={styles.lessonTitle}>{studentName} ilə dərs</Text>
                          <View style={styles.lessonTimeRow}>
                            <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
                            <Text style={styles.lessonTime}>{timeStr}</Text>
                          </View>
                        </View>
                      </View>
                      <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
                    </View>
                  );
                })
              )}
            </View>
          </>
        ) : isParent ? (
          // ════════════════ PARENT VIEW ════════════════
          <>
            {/* Greeting */}
            <View style={styles.greetSection}>
              <Text style={styles.greetTitle}>Salam, {firstName} xanım 👋</Text>
              <Text style={styles.greetSub}>Övladınızın təhsil yoluna nəzər salın.</Text>
            </View>

            {/* Child Summary + Weak Subjects row */}
            <View style={styles.parentBentoRow}>
              {/* Child Card */}
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.childCard}
              >
                <View>
                  <Text style={styles.childName}>{firstName}</Text>
                  <Text style={styles.childGrade}>Övladınızın hesabı</Text>
                </View>
                <View style={styles.streakPill}>
                  <Text style={styles.streakPillText}>🔥 {stats?.activeDays ?? 0} gün</Text>
                </View>
                <View style={styles.childBadgeRow}>
                  <Ionicons name="star" size={12} color="#fde68a" />
                  <Text style={styles.childBadgeText}>İmtahan sayı: {stats?.totalExams ?? 0}</Text>
                </View>
              </LinearGradient>

              {/* Weak Subjects Card */}
              <View style={styles.weakCard}>
                <Text style={styles.weakLabel}>ZƏİF MÖVZULAR</Text>
                <Text style={styles.weakChipText}>Tezliklə əlavə olunacaq</Text>
              </View>
            </View>

            {/* AI Tips */}
            <View style={styles.parentAiCard}>
              <View style={styles.parentAiHeader}>
                <Ionicons name="hardware-chip-outline" size={20} color={Colors.primary} />
                <Text style={styles.parentAiTitle}>AI Tövsiyələri</Text>
              </View>
              <Text style={styles.parentAiText}>
                "Cəfər kəsrlər mövzusunda çətinlik çəkir, bir az təkrar etməsi məsləhətdir. Bu gün 15 dəqiqəlik əlavə məşq onun nəticəsini 20% artıra bilər."
              </Text>
            </View>

            {/* Today's Activity */}
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>Bugünkü aktivlik</Text>
              <Text style={styles.activityLabel}>Tezliklə əlavə olunacaq</Text>
            </View>

            {/* Recent Results */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Övladın son nəticələri</Text>
              <TouchableOpacity onPress={() => Alert.alert('Nəticələr', 'Hamısına bax')}>
                <Text style={styles.seeAll}>Hamısı</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.resultList}>
              <Text style={styles.resultSubject}>Tezliklə əlavə olunacaq</Text>
            </View>

            {/* Future Exams */}
            <View style={styles.examsCard}>
              <Text style={styles.examsTitle}>Gələcək imtahanlar</Text>
              <Text style={styles.examItemTime}>Tezliklə əlavə olunacaq</Text>
            </View>

            {/* Recommended Teachers */}
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Tövsiyə olunan müəllimlər</Text>
            <Text style={styles.examItemTime}>Tezliklə əlavə olunacaq</Text>
          </>
        ) : (
          // ════════════════ STUDENT VIEW ════════════════
          <>
            {/* Greeting */}
            <View style={styles.greetSection}>
              <Text style={styles.greetTitle}>Salam {firstName} 👋</Text>
              <Text style={styles.greetSub}>Bu gün öyrənmək üçün əla gündür.</Text>
            </View>

            {/* Hero Card */}
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <Text style={styles.heroTitle}>Biliklərini yoxlamağa hazırsan?</Text>
              <Text style={styles.heroSub}>
                Yeni imtahan sessiyası səni gözləyir. İndi başla və rəqibləri geridə qoy.
              </Text>
              <TouchableOpacity
                style={styles.heroBtn}
                activeOpacity={0.85}
                onPress={() => Alert.alert('İmtahan', 'İmtahan sessiyası tezliklə!')}
              >
                <Text style={styles.heroBtnText}>İmtahan başlat</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Quick Actions */}
            <View style={styles.quickSectionHeader}>
              <Ionicons name="flash-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Sürətli keçidlər</Text>
            </View>
            <View style={styles.quickRow}>
              <TouchableOpacity style={styles.quickItem} activeOpacity={0.8}>
                <View style={[styles.quickItemIcon, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.quickItemLabel}>{'İmtahan\nbaşlat'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickItem} activeOpacity={0.8}>
                <View style={[styles.quickItemIcon, { backgroundColor: '#f3e8ff' }]}>
                  <Ionicons name="hardware-chip-outline" size={24} color="#7c3aed" />
                </View>
                <Text style={styles.quickItemLabel}>{'AI sual\nsoruş'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickItem} activeOpacity={0.8}>
                <View style={[styles.quickItemIcon, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="school-outline" size={24} color="#059669" />
                </View>
                <Text style={styles.quickItemLabel}>{'Müəllim\ntap'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickItem} activeOpacity={0.8}>
                <View style={[styles.quickItemIcon, { backgroundColor: Colors.warningLight }]}>
                  <Ionicons name="calculator-outline" size={24} color={Colors.warning} />
                </View>
                <Text style={styles.quickItemLabel}>Kalkulyator</Text>
              </TouchableOpacity>
            </View>

            {/* Daily Missions shortcut */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Gündəlik missiyalar</Text>
              <TouchableOpacity onPress={() => navigation.navigate(Routes.DailyMissions)}>
                <Text style={styles.seeAll}>Hamısına bax</Text>
              </TouchableOpacity>
            </View>

            {/* AI Teaching Plan */}
            <View style={styles.aiPlanCard}>
              <View style={styles.aiPlanHeader}>
                <Ionicons name="sparkles" size={18} color={Colors.primary} />
                <Text style={styles.aiPlanTitle}>AI Tədris Planı</Text>
              </View>
              <View style={styles.aiPlanGrid}>
                <View style={[styles.aiTopicCard, { borderBottomColor: '#fca5a5' }]}>
                  <Text style={styles.aiTopicBadgeWeak}>Zəif mövzu</Text>
                  <Text style={styles.aiTopicName}>Kəsrlər</Text>
                  <View style={styles.aiProgressTrack}>
                    <View style={[styles.aiProgressFill, { width: '33%', backgroundColor: '#f87171' }]} />
                  </View>
                </View>
                <View style={[styles.aiTopicCard, { borderBottomColor: '#6ee7b7' }]}>
                  <Text style={styles.aiTopicBadgeStrong}>Güclü mövzu</Text>
                  <Text style={styles.aiTopicName}>Sinonimlər</Text>
                  <View style={styles.aiProgressTrack}>
                    <View style={[styles.aiProgressFill, { width: '80%', backgroundColor: Colors.tertiary }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* Recommended Teachers */}
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Tövsiyə olunan müəllimlər</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teachersRow}
              style={{ marginHorizontal: -24 }}
            >
              {teachers.map((t) => (
                <TouchableOpacity key={t.id} style={styles.teacherCard} activeOpacity={0.8}>
                  <View style={styles.teacherAvatar}>
                    <Ionicons name="person" size={28} color={Colors.outlineVariant} />
                  </View>
                  <Text style={styles.teacherName} numberOfLines={1}>{t.name}</Text>
                  <Text style={styles.teacherSubject}>{t.subjects?.[0] ?? '—'}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={11} color="#f59e0b" />
                    <Text style={styles.ratingText}>{t.rating?.toFixed(1) ?? '—'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Competitions */}
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Yarışlar</Text>
            <View style={styles.competitionCard}>
              <View style={styles.compLeft}>
                <View style={styles.compIcon}>
                  <Ionicons name="trophy-outline" size={20} color="#d97706" />
                </View>
                <View>
                  <Text style={styles.compTitle}>Respublika Olimpiadası</Text>
                  <Text style={styles.compSub}>Son qeydiyyat: 3 gün qaldı</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.joinBtn}
                activeOpacity={0.85}
                onPress={() => Alert.alert('Yarış', 'Tezliklə!')}
              >
                <Text style={styles.joinBtnText}>Qoşul</Text>
              </TouchableOpacity>
            </View>

            {/* Leaderboard */}
            <View style={styles.leaderRow}>
              <View style={styles.leaderCard}>
                <Text style={styles.leaderTitle}>Top şagirdlər</Text>
                {topStudents.map((s) => (
                  <View key={s.userId} style={styles.leaderItem}>
                    <Text
                      style={[
                        styles.leaderRank,
                        s.rank === 1 && { color: '#f59e0b' },
                        s.rank === 3 && { color: '#f97316' },
                      ]}
                    >
                      {s.rank}
                    </Text>
                    <View style={styles.leaderAvatar} />
                    <Text style={styles.leaderName} numberOfLines={1}>{s.name.split(' ')[0]}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.leaderCard}>
                <Text style={styles.leaderTitle}>Top məktəblər</Text>
                <Text style={styles.leaderName}>Tezliklə</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // ── Top Bar ────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.surface + 'b3',
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  streakText: { fontSize: 11, fontWeight: '700', color: '#9a3412' },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surfaceLow,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },

  // ── Shared Section Header ──────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  seeAll: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  // ── Greeting ───────────────────────────────────────────────────────────
  greetSection: { marginBottom: 20 },
  greetSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  greetTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  greetSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  // ── Teacher: Earnings Card ─────────────────────────────────────────────
  earningsCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
  },
  earningsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  earningsLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  earningsTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningsTrendText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  earningsGlow: {
    position: 'absolute',
    right: -48,
    bottom: -48,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // ── Teacher: Quick Actions ─────────────────────────────────────────────
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
  },

  // ── Teacher: Stats ─────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  // ── Teacher: AI Insight ────────────────────────────────────────────────
  aiCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primaryFixed + '33',
  },
  aiIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryFixed + '33',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  aiText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // ── Teacher: Requests ──────────────────────────────────────────────────
  requestList: { gap: 10, marginBottom: 24 },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  requestLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  requestName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  requestDetail: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  requestChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Teacher: Lessons ───────────────────────────────────────────────────
  lessonList: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  lessonItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  lessonDateBox: {
    minWidth: 50,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  lessonDayLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonDayNum: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 1,
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  lessonTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  lessonTime: { fontSize: 10, color: Colors.textMuted },

  // ── Student: Hero Card ─────────────────────────────────────────────────
  heroCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: 20,
  },
  heroBtn: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  heroBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  // ── Student: Quick Grid ────────────────────────────────────────────────
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  quickCard: {
    width: '47%',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  quickCardWide: {
    width: '100%',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  quickChevron: { marginLeft: 'auto' as any },

  // ── Student: Tasks ─────────────────────────────────────────────────────
  taskList: { gap: 8, marginBottom: 24 },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 14,
    padding: 14,
  },
  taskItemDone: { opacity: 0.6 },
  taskCheckEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.primaryFixed,
  },
  taskCheckFilled: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: { flex: 1 },
  taskTitle: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  taskTitleDone: { textDecorationLine: 'line-through' },
  taskSub: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },

  // ── Student: Plan ──────────────────────────────────────────────────────
  planCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  timeline: { paddingLeft: 8 },
  timelineRow: { flexDirection: 'row', gap: 16 },
  timelineDotCol: { alignItems: 'center', width: 14 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, marginTop: 2 },
  timelineDotActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineDotIdle: { backgroundColor: Colors.surfaceHigh },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.surfaceHigh,
    marginTop: 4,
    marginBottom: 4,
    minHeight: 24,
  },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineTime: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, marginBottom: 2 },
  timelineTimeActive: { color: Colors.primary },
  timelineItem: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  // ── Student: Teachers carousel ─────────────────────────────────────────
  teachersRow: {
    paddingHorizontal: 24,
    paddingBottom: 4,
    gap: 12,
    marginBottom: 28,
  },
  teacherCard: {
    width: 136,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  teacherAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  teacherSubject: { fontSize: 10, color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },

  // ── Student: Competition ───────────────────────────────────────────────
  competitionCard: {
    backgroundColor: Colors.surfaceHighest,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
    marginBottom: 24,
  },
  compLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  compIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  compSub: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  joinBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  joinBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // ── Parent: Bento Row ──────────────────────────────────────────────────
  parentBentoRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  childCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    minHeight: 160,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  childName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 2 },
  childGrade: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  streakPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakPillText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  childBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  childBadgeText: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  weakCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  weakLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  weakChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  weakChip: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  weakChipText: { fontSize: 10, fontWeight: '700', color: Colors.danger },

  // ── Parent: AI Tips ────────────────────────────────────────────────────
  parentAiCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryFixed + '33',
  },
  parentAiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  parentAiTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  parentAiText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // ── Parent: Activity ───────────────────────────────────────────────────
  activityCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 16,
  },
  activityTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  activityItem: { gap: 8 },
  activityLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  activityLabel: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  activityPct: { fontSize: 13, fontWeight: '700' },
  activityTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainer,
    overflow: 'hidden',
  },
  activityFill: { height: '100%', borderRadius: 999 },

  // ── Parent: Results ────────────────────────────────────────────────────
  resultList: { gap: 10, marginBottom: 24 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  resultIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBody: { flex: 1 },
  resultSubject: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  resultTime: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  resultRight: { alignItems: 'flex-end', gap: 4 },
  resultScore: { fontSize: 16, fontWeight: '800' },
  resultGradeBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  resultGradeText: { fontSize: 9, fontWeight: '700' },

  // ── Parent: Exams ──────────────────────────────────────────────────────
  examsCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  examsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  examItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  examDateBox: {
    minWidth: 52,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  examMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  examDay: { fontSize: 18, fontWeight: '800', color: Colors.primary, marginTop: 1 },
  examItemTitle: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  examItemTime: { fontSize: 10, color: Colors.textMuted },

  // ── Parent: Recommended Teachers ───────────────────────────────────────
  parentTeachersRow: {
    paddingHorizontal: 24,
    paddingBottom: 4,
    gap: 12,
    marginBottom: 28,
  },
  parentTeacherCard: {
    width: 240,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 16,
  },
  parentTeacherTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  parentTeacherAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentTeacherInitials: { fontSize: 15, fontWeight: '700', color: Colors.secondary },
  parentTeacherName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  parentTeacherSubject: { fontSize: 11, color: Colors.primary, fontWeight: '500', marginTop: 2 },
  parentTeacherBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  parentTeacherRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  parentTeacherRatingText: { fontSize: 11, color: Colors.textSecondary },
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  applyBtnText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // ── Student: Quick Actions row ─────────────────────────────────────────
  quickSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  quickItem: { flex: 1, alignItems: 'center', gap: 8 },
  quickItemIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickItemLabel: { fontSize: 9, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', lineHeight: 13 },

  // ── Student: AI Teaching Plan ──────────────────────────────────────────
  aiPlanCard: { backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 18, marginBottom: 28 },
  aiPlanHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  aiPlanTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  aiPlanGrid: { flexDirection: 'row', gap: 12 },
  aiTopicCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 14, padding: 14, gap: 8,
    borderBottomWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  aiTopicBadgeWeak: { fontSize: 9, fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1 },
  aiTopicBadgeStrong: { fontSize: 9, fontWeight: '700', color: Colors.tertiary, textTransform: 'uppercase', letterSpacing: 1 },
  aiTopicName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  aiProgressTrack: { height: 6, backgroundColor: Colors.surfaceHigh, borderRadius: 999, overflow: 'hidden' },
  aiProgressFill: { height: '100%', borderRadius: 999 },

  // ── Student: Leaderboard ───────────────────────────────────────────────
  leaderRow: { flexDirection: 'row', gap: 12 },
  leaderCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  leaderTitle: { fontSize: 12, fontWeight: '800', color: Colors.textPrimary },
  leaderItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leaderRank: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, width: 14 },
  leaderAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceHigh,
  },
  leaderName: { fontSize: 10, fontWeight: '500', color: Colors.textPrimary, flex: 1 },
});
