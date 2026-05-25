import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
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
import { listOpenRequests, expressInterest, type PublicLessonRequest } from '../../api/lessonRequest.api';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.HomeMain>;
};

const TEACHER_QUICK_ACTIONS = [
  { icon: 'create-outline', label: 'Profili\nredaktə et', target: 'editProfile' as const },
  { icon: 'help-circle-outline', label: 'Sorğular', target: 'requests' as const },
  { icon: 'document-text-outline', label: 'Tələblər', target: 'lessonRequest' as const },
  { icon: 'chatbubble-outline', label: 'Mesajlar', target: 'chat' as const },
  { icon: 'stats-chart-outline', label: 'Statistikalar', target: 'dashboard' as const },
] as const;

// ── Test Category Accordion ────────────────────────────────────────────────
type TestCategoryProps = {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

function TestCategoryAccordion({ title, count, defaultOpen = false, children }: TestCategoryProps) {
  const [expanded, setExpanded] = useState(defaultOpen);
  return (
    <View style={accStyles.wrapper}>
      <TouchableOpacity
        style={accStyles.header}
        activeOpacity={0.7}
        onPress={() => setExpanded((v) => !v)}
      >
        <Text style={accStyles.title}>{title}</Text>
        <View style={accStyles.countPill}>
          <Text style={accStyles.countText}>{count}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Ionicons
          name="chevron-down"
          size={18}
          color={Colors.textSecondary}
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>
      {expanded && <View style={accStyles.body}>{children}</View>}
    </View>
  );
}

const accStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  title: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  countPill: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  body: { padding: 12, paddingTop: 0, gap: 10 },
});

// ── Test Card ──────────────────────────────────────────────────────────────
type TestCardProps = {
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress: () => void;
};

function TestCard({ title, sub, icon, iconColor = Colors.primary, onPress }: TestCardProps) {
  return (
    <TouchableOpacity
      style={tcStyles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text style={tcStyles.title}>{title}</Text>
      <Text style={tcStyles.sub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const tcStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  title: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: 10, color: Colors.textSecondary },
});

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
  const { data: openRequestsData } = useQuery<PublicLessonRequest[]>({
    queryKey: ['openLessonRequests'],
    queryFn: () => listOpenRequests().catch(() => [] as PublicLessonRequest[]),
  });
  const openRequests: PublicLessonRequest[] = Array.isArray(openRequestsData) ? openRequestsData.slice(0, 5) : [];

  const pendingBookings = teacherBookings.filter((b) => b.status === 'pending').slice(0, 3);
  const confirmedBookings = teacherBookings.filter((b) => b.status === 'confirmed').slice(0, 3);
  const topStudents = leaderboard.slice(0, 3);

  const renderOpenRequests = () => {
    if (openRequests.length === 0) return null;
    return (
      <View style={openReqStyles.section}>
        <View style={openReqStyles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={openReqStyles.sectionTitle}>Açıq dərs sorğuları</Text>
            <Text style={openReqStyles.sectionSub}>Şagirdlərin yaratdığı ümumi sorğular</Text>
          </View>
          {isTeacher && (
            <View style={openReqStyles.proPill}>
              <Ionicons name="star" size={11} color="#fff" />
              <Text style={openReqStyles.proPillText}>PRO</Text>
            </View>
          )}
          <TouchableOpacity
            style={openReqStyles.seeAllBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(Routes.AllOpenRequests)}
          >
            <Text style={openReqStyles.seeAllBtnText}>Hamısına bax</Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
          {openRequests.map((r) => (
            <View key={r.id} style={openReqStyles.card}>
              <View style={openReqStyles.cardTopRow}>
                <View style={openReqStyles.subjectChip}>
                  <Text style={openReqStyles.subjectChipText}>{r.subject}</Text>
                </View>
                {r.grade && <Text style={openReqStyles.gradeText}>{r.grade}</Text>}
              </View>
              <Text style={openReqStyles.cardTitle} numberOfLines={2}>{r.topic || r.subject}</Text>
              <View style={openReqStyles.cardMeta}>
                <Ionicons name="person-outline" size={12} color={Colors.textMuted} />
                <Text style={openReqStyles.cardMetaText} numberOfLines={1}>{r.studentName}</Text>
              </View>
              <View style={openReqStyles.cardMeta}>
                <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
                <Text style={openReqStyles.cardMetaText}>{r.interestedCount} müəllim maraqlanıb</Text>
              </View>
              <TouchableOpacity
                style={openReqStyles.interestBtn}
                activeOpacity={0.85}
                onPress={() => handleInterest(r.id)}
              >
                <Ionicons name={isTeacher ? 'hand-right-outline' : 'eye-outline'} size={14} color="#fff" />
                <Text style={openReqStyles.interestBtnText}>
                  {isTeacher ? 'Maraqlan' : 'Bax'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleInterest = async (id: string) => {
    if (!isTeacher) {
      Alert.alert(
        'Müəllim hesabı tələb olunur',
        'Yalnız müəllimlər sorğularla maraqlana bilər.',
      );
      return;
    }
    try {
      await expressInterest(id);
      Alert.alert('Uğurlu', 'Maraq bildirildi. Şagird sizinlə əlaqə saxlaya bilər.');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (msg === 'SUBSCRIPTION_REQUIRED' || e?.response?.status === 403) {
        Alert.alert(
          'Premium paket lazımdır',
          'Açıq dərs sorğularıyla maraqlanmaq üçün abonə paketi alın.',
          [
            { text: 'İmtina', style: 'cancel' },
            { text: 'Paketi al', onPress: () => navigation.navigate(Routes.Plans) },
          ],
        );
      } else {
        Alert.alert('Xəta', msg || 'Əməliyyat alınmadı');
      }
    }
  };

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
            <TouchableOpacity
              style={styles.streakBadge}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(Routes.StreakDashboard)}
            >
              <Ionicons name="flame" size={15} color="#f97316" />
              <Text style={styles.streakText}>{stats?.streak ?? 0} gün streak</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.notifBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(Routes.Search)}
          >
            <Ionicons name="search-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notifBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(Routes.Notifications)}
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
                  onPress={() => {
                    const parent = navigation.getParent() as any;
                    switch (a.target) {
                      case 'editProfile':
                        parent?.navigate(Routes.Profile, { screen: Routes.EditProfile });
                        break;
                      case 'requests':
                      case 'lessonRequest':
                        parent?.navigate('Booking', { screen: Routes.BookingHistory });
                        break;
                      case 'chat':
                        parent?.navigate('Chat');
                        break;
                      case 'dashboard':
                        parent?.navigate(Routes.Profile, { screen: Routes.Dashboard });
                        break;
                    }
                  }}
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
              <TouchableOpacity onPress={() => (navigation.getParent() as any)?.navigate('Booking', { screen: Routes.BookingHistory })}>
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
                      <TouchableOpacity style={styles.requestChevron} onPress={() => (navigation.getParent() as any)?.navigate('Booking', { screen: Routes.BookingHistory })}>
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
              <TouchableOpacity onPress={() => (navigation.getParent() as any)?.navigate('Booking', { screen: Routes.BookingHistory })}>
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

            {/* Açıq dərs sorğuları (Teacher) */}
            {renderOpenRequests()}
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
                  <Text style={styles.childName}>{(user as any)?.profile?.childName || (user as any)?.childName || firstName}</Text>
                  <Text style={styles.childGrade}>{(user as any)?.profile?.grade ? `${(user as any).profile.grade} • Övladınız` : 'Övladınızın hesabı'}</Text>
                </View>
                <View style={styles.streakPill}>
                  <Text style={styles.streakPillText}>🔥 {stats?.streak ?? 0} gün</Text>
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

            {/* Açıq dərs sorğuları (Parent) */}
            {renderOpenRequests()}
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
                onPress={() => (navigation.getParent() as any)?.navigate('Exams' as never)}
              >
                <Text style={styles.heroBtnText}>İmtahan başlat</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Quick Actions */}
            <View style={styles.quickSectionHeader}>
              <Ionicons name="flash-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Sürətli keçidlər</Text>
              <TouchableOpacity
                style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 }}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(Routes.SmartFeed as never)}
              >
                <Ionicons name="sparkles" size={14} color={Colors.primary} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Sənin üçün</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Exams' as never)}
              >
                <View style={[styles.quickItemIcon, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.quickItemLabel}>{'İmtahan\nbaşlat'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate(Routes.AIMentor as never)}
              >
                <View style={[styles.quickItemIcon, { backgroundColor: '#f3e8ff' }]}>
                  <Ionicons name="hardware-chip-outline" size={24} color="#7c3aed" />
                </View>
                <Text style={styles.quickItemLabel}>{'AI sual\nsoruş'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Booking' as never, { screen: Routes.TeacherList } as never)}
              >
                <View style={[styles.quickItemIcon, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="school-outline" size={24} color="#059669" />
                </View>
                <Text style={styles.quickItemLabel}>{'Müəllim\ntap'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Calculators' as never)}
              >
                <View style={[styles.quickItemIcon, { backgroundColor: Colors.warningLight }]}>
                  <Ionicons name="calculator-outline" size={24} color={Colors.warning} />
                </View>
                <Text style={styles.quickItemLabel}>Kalkulyator</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions — second row */}
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Learn' as never)}
              >
                <View style={[styles.quickItemIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="book-outline" size={24} color="#2563eb" />
                </View>
                <Text style={styles.quickItemLabel}>Öyrən</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Marketplace' as never)}
              >
                <View style={[styles.quickItemIcon, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="storefront-outline" size={24} color="#d97706" />
                </View>
                <Text style={styles.quickItemLabel}>Market</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Bookmarks' as never)}
              >
                <View style={[styles.quickItemIcon, { backgroundColor: '#fce7f3' }]}>
                  <Ionicons name="bookmark-outline" size={24} color="#db2777" />
                </View>
                <Text style={styles.quickItemLabel}>Yaddaş</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Chat' as never)}
              >
                <View style={[styles.quickItemIcon, { backgroundColor: '#e0e7ff' }]}>
                  <Ionicons name="chatbubbles-outline" size={24} color="#4f46e5" />
                </View>
                <Text style={styles.quickItemLabel}>Mesaj</Text>
              </TouchableOpacity>
            </View>

            {/* Yeni ekranlar (test) */}
            {!isTeacher && !isParent && (
              <View style={{ marginBottom: 28, gap: 10 }}>
                <View style={styles.quickSectionHeader}>
                  <Ionicons name="sparkles-outline" size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Yeni ekranlar</Text>
                </View>

                {/* Duel dəvəti — notification banner */}
                <TouchableOpacity
                  style={{ backgroundColor: '#FEE2E2', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#FECACA' }}
                  activeOpacity={0.85}
                  onPress={() =>
                    (navigation.getParent() as any)?.navigate('Exams', {
                      screen: Routes.DuelInvite,
                    })
                  }
                >
                  <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="notifications" size={20} color="#DC2626" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#991B1B' }}>Duel dəvəti!</Text>
                    <Text style={{ fontSize: 11, color: '#7F1D1D' }}>Leyla səni yarışa çağırır — qəbul/imtina</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#991B1B" />
                </TouchableOpacity>

                {/* 👥 Sosial & İcma */}
                <TestCategoryAccordion title="👥 Sosial & İcma" count={5} defaultOpen>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title="Sosial Mərkəz" sub="Hub: reyting + feed" icon="people" onPress={() => navigation.navigate(Routes.SocialHub)} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title="Dost tap" sub="Axtarış + statuslar" icon="person-add" onPress={() => navigation.navigate(Routes.FindFriend)} />
                    <TestCard title="Dostlarım" sub="Challenge düymələri" icon="people-circle" onPress={() => navigation.navigate(Routes.MyFriends)} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title="Liderlər" sub="Dostlar / Hamı" icon="podium" onPress={() => navigation.navigate(Routes.LeaderboardDetail)} />
                    <TestCard title="Lent" sub="Fəaliyyət + xəbərlər" icon="pulse" iconColor={Colors.tertiary} onPress={() => navigation.navigate(Routes.LiveActivity)} />
                  </View>
                </TestCategoryAccordion>

                {/* 📊 Performans & Analitika */}
                <TestCategoryAccordion title="📊 Performans & Analitika" count={7}>
                  <Text style={perfStyles.groupLabel}>📈 Statistika</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title="Proqres" sub="7 günlük grafik" icon="trending-up" iconColor={Colors.tertiary} onPress={() => navigation.navigate(Routes.LearningProgress)} />
                    <TestCard title="Performans" sub="Donut + insight" icon="pie-chart" onPress={() => navigation.navigate(Routes.PerformanceSummary)} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title="Həftəlik Hesabat" sub="Sparkline + mövzular" icon="bar-chart" onPress={() => navigation.navigate(Routes.WeeklyReport)} />
                    <View style={{ flex: 1 }} />
                  </View>

                  <Text style={perfStyles.groupLabel}>🤖 AI ilə inkişaf</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title="Zəif Mövzu" sub="AI analiz" icon="alert-circle" iconColor={Colors.danger} onPress={() => navigation.navigate(Routes.WeakTopics)} />
                    <TestCard title="Təkrar Test" sub="AI planı" icon="refresh-circle" onPress={() => navigation.navigate(Routes.ReviewTopics)} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title="AI Tövsiyə" sub="İnkişaf planı" icon="bulb" onPress={() => navigation.navigate(Routes.ImprovementTips)} />
                    <TestCard title="Mövzu" sub="İnkişaf yolu" icon="git-network" onPress={() => navigation.navigate(Routes.TopicProgress, { topic: 'Faizlər' })} />
                  </View>
                </TestCategoryAccordion>

                {/* 🤖 AI & Tapşırıq */}
                <TestCategoryAccordion title="🤖 AI & Tapşırıq" count={4}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title="AI Plan" sub="Tədris yolu" icon="hardware-chip" onPress={() => navigation.navigate(Routes.AIStudyPlan)} />
                    <TestCard title="Məşq Yarat" sub="AI generator" icon="construct" onPress={() => navigation.navigate(Routes.AIPracticeBuilder)} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title="Bugün" sub="Tapşırıq + xatırlatma" icon="checkmark-done-circle" onPress={() => navigation.navigate(Routes.TodaysTasks)} />
                    <TestCard title="Missiyalar" sub="Tərəqqi + mükafat" icon="flame" onPress={() => navigation.navigate(Routes.MissionStart)} />
                  </View>
                </TestCategoryAccordion>

              </View>
            )}
            {/* Spin Wheel - Hədiyyə Çarxı */}
            <TouchableOpacity
              style={styles.spinBanner}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(Routes.SpinWheel)}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={styles.spinBannerGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.spinBannerIcon}>
                  <Ionicons name="gift" size={26} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.spinBannerTitle}>Hədiyyə Çarxı</Text>
                  <Text style={styles.spinBannerSub}>Günlük şansını sına, mükafatını qazan!</Text>
                </View>
                <View style={styles.spinBannerPill}>
                  <Text style={styles.spinBannerPillText}>YENİ</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Daily Missions shortcut */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Bugünkü tapşırıqlar</Text>
              <TouchableOpacity onPress={() => navigation.navigate(Routes.DailyMissions)}>
                <Text style={styles.seeAll}>Hamısına bax</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.todayTaskList}>
              <TouchableOpacity
                style={styles.todayTaskCard}
                activeOpacity={0.85}
                onPress={() =>
                  (navigation.getParent() as any)?.navigate('Exams', {
                    screen: Routes.NewExam,
                    params: { questionCount: 10, duration: 15, difficulty: 'medium', questionType: 'test', examType: 'practice' },
                  })
                }
              >
                <View style={styles.todayTaskLeft}>
                  <View style={[styles.todayTaskIconWrap, { backgroundColor: Colors.primaryLight }]}>
                    <Ionicons name="calculator-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.todayTaskInfo}>
                    <Text style={styles.todayTaskTitle}>Riyaziyyat testi</Text>
                    <Text style={styles.todayTaskSub}>Kvadrat tənliklər • 15 dəq</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color={Colors.outlineVariant} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.todayTaskCard, styles.todayTaskDone]}
                activeOpacity={0.85}
                onPress={() =>
                  (navigation.getParent() as any)?.navigate('Learn', {
                    screen: Routes.LearningHome,
                  })
                }
              >
                <View style={styles.todayTaskLeft}>
                  <View style={[styles.todayTaskIconWrap, { backgroundColor: Colors.tertiaryContainer + '33' }]}>
                    <Ionicons name="language-outline" size={20} color={Colors.tertiary} />
                  </View>
                  <View style={styles.todayTaskInfo}>
                    <Text style={styles.todayTaskTitle}>5 yeni söz öyrən</Text>
                    <Text style={styles.todayTaskSub}>İngilis dili • Orta səviyyə</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* AI Teaching Plan */}
            <TouchableOpacity
              style={styles.aiPlanCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(Routes.AIStudyPath)}
            >
              <View style={styles.aiPlanHeader}>
                <Ionicons name="sparkles" size={18} color={Colors.primary} />
                <Text style={styles.aiPlanTitle}>AI Tədris Planı</Text>
                <View style={{ flex: 1 }} />
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
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
            </TouchableOpacity>

            {/* Recommended Teachers */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Tövsiyə olunan müəllimlər</Text>
              <TouchableOpacity
                onPress={() => (navigation.getParent() as any)?.navigate('Booking' as never, { screen: Routes.TeacherList } as never)}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>Hamısı</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teachersRow}
              style={{ marginHorizontal: -24 }}
            >
              {teachers.map((t) => {
                const initials = t.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
                const hasRating = typeof t.rating === 'number' && t.rating > 0;
                const subject = t.subjects?.[0] || 'Müxtəlif fənlər';
                const experience = (t as any).experienceYears;
                const avatarUrl = (t as any).avatarUrl as string | undefined;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.teacherCardRich}
                    activeOpacity={0.85}
                    onPress={() => (navigation.getParent() as any)?.navigate('Booking' as never, { screen: Routes.TeacherProfile, params: { teacher: t } } as never)}
                  >
                    <View style={styles.teacherCardTop}>
                      {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.teacherAvatarImg} />
                      ) : (
                        <LinearGradient
                          colors={[Colors.gradientStart, Colors.gradientEnd]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.teacherAvatarImg}
                        >
                          <Text style={styles.teacherAvatarInitial}>{initials}</Text>
                        </LinearGradient>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.teacherNameRich} numberOfLines={1}>{t.name}</Text>
                        <Text style={styles.teacherSubjectRich} numberOfLines={1}>
                          {subject}{experience ? ` • ${experience} il təcrübə` : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.teacherCardBottom}>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={13} color="#f59e0b" />
                        <Text style={styles.ratingText}>{hasRating ? t.rating!.toFixed(1) : 'Yeni'}</Text>
                      </View>
                      <View style={styles.teacherViewBtn}>
                        <Text style={styles.teacherViewBtnText}>Profilə bax</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Açıq dərs sorğuları — visible after teachers */}
            {renderOpenRequests()}

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
                onPress={() => {
                  const parent = navigation.getParent() as any;
                  if (parent?.navigate) parent.navigate('Exams');
                  else navigation.navigate(Routes.Leaderboard);
                }}
              >
                <Text style={styles.joinBtnText}>Qoşul</Text>
              </TouchableOpacity>
            </View>

            {/* Leaderboard */}
            <View style={styles.leaderRow}>
              <TouchableOpacity
                style={styles.leaderCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(Routes.Leaderboard)}
              >
                <Text style={styles.leaderTitle}>Top şagirdlər</Text>
                {topStudents.length === 0 ? (
                  <Text style={[styles.leaderName, { color: Colors.textMuted }]}>Hələ data yoxdur</Text>
                ) : (
                  topStudents.map((s) => (
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
                  ))
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.leaderCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(Routes.SchoolRanking)}
              >
                <Text style={styles.leaderTitle}>Top məktəblər</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <Ionicons name="school-outline" size={16} color={Colors.primary} />
                  <Text style={[styles.leaderName, { color: Colors.primary, fontWeight: '600' }]}>Reytinqə bax →</Text>
                </View>
              </TouchableOpacity>
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

  // Rich teacher card (used on home)
  teacherCardRich: {
    width: 240,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  teacherCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  teacherAvatarImg: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  teacherAvatarRich: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  teacherAvatarInitial: { fontSize: 18, fontWeight: '800', color: '#fff' },
  teacherNameRich: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  teacherSubjectRich: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  teacherCardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teacherViewBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  teacherViewBtnText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  // Empty state for teachers
  teachersEmpty: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    padding: 16, marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  teachersEmptyIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  teachersEmptyTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  teachersEmptySub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

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

  // ── Student: Today's Tasks ─────────────────────────────────────────────
  todayTaskList: { gap: 12, marginBottom: 24 },
  todayTaskCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  todayTaskDone: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  todayTaskLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  todayTaskIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  todayTaskInfo: { flex: 1, gap: 2 },
  todayTaskTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  todayTaskSub: { fontSize: 12, color: Colors.textMuted },

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

  spinBanner: {
    marginHorizontal: 20, marginTop: 16,
    borderRadius: 20, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  spinBannerGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 18, paddingHorizontal: 18,
  },
  spinBannerIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  spinBannerTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  spinBannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  spinBannerPill: {
    backgroundColor: '#10b981',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  spinBannerPillText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1 },
});

const openReqStyles = StyleSheet.create({
  section: { paddingLeft: 20, paddingTop: 20, paddingBottom: 4, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingRight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  sectionSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  proPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#f59e0b', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    marginRight: 8,
  },
  proPillText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.6 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  card: {
    width: 240, backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 14, gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subjectChip: { backgroundColor: Colors.primaryLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  subjectChipText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 0.4 },
  gradeText: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, lineHeight: 20, minHeight: 40 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardMetaText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary, flex: 1 },
  interestBtn: {
    marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 10,
  },
  interestBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});

const perfStyles = StyleSheet.create({
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 4,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
});
