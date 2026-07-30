import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { PREMIUM_ENTRY_ROUTE } from '../../config/iap';
import { getUserStats } from '../../api/dashboard.api';
import { getTeachers, getTeacherAnalytics, ensureProfileReminder, getMe } from '../../api/user.api';
import { getGlobalLeaderboard } from '../../api/leaderboard.api';
import { getPendingDuelInvite } from '../../api/duel.api';
import { getTeacherBookings } from '../../api/booking.api';
import { listOpenRequests, expressInterest, type PublicLessonRequest } from '../../api/lessonRequest.api';
import { getQuestions } from '../../api/marketplace.api';
import { getMissions, type DailyMission } from '../../api/engagement.api';
import { getTopicStats } from '../../api/topicStats.api';
import { useOnboardingStore } from '../../store/onboarding.store';
import { useGetStartedStore } from '../../store/getStarted.store';
import GetStartedCard, { type GetStartedStep } from './GetStartedCard';
import HomeTourOverlay from './HomeTourOverlay';
import { usePushStore } from '../../store/push.store';
import { getPermissionStatus } from '../../utils/push';
import { useTeacherProfileCompletion } from '../../hooks/useTeacherProfileCompletion';
import UpdateBanner from '../../components/UpdateBanner';
import BannerSlider from '../../components/BannerSlider';
import PartnersSection from '../../components/PartnersSection';
import { LanguageFlagButton } from '../../components/LanguageSwitch';
import { useTranslation } from '../../i18n';
import { rs } from '../../utils/responsive';
import { useBadges } from '../../hooks/useBadges';
import UnreadDot from '../../components/common/UnreadDot';
import SuccessOverlay from '../../components/common/SuccessOverlay';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.HomeMain>;
};

const TEACHER_QUICK_ACTIONS = [
  { icon: 'create-outline', labelKey: 'home.qa.editProfile', target: 'editProfile' as const },
  { icon: 'help-circle-outline', labelKey: 'home.qa.requests', target: 'requests' as const },
  { icon: 'document-text-outline', labelKey: 'home.qa.lessonRequest', target: 'lessonRequest' as const },
  { icon: 'megaphone-outline', labelKey: 'home.qa.openRequests', target: 'openRequests' as const },
  { icon: 'chatbubble-outline', labelKey: 'home.qa.chat', target: 'chat' as const },
  { icon: 'stats-chart-outline', labelKey: 'home.qa.stats', target: 'dashboard' as const },
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
      <Text style={tcStyles.title} numberOfLines={2}>{title}</Text>
      <Text style={tcStyles.sub} numberOfLines={2}>{sub}</Text>
    </TouchableOpacity>
  );
}

const tcStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
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
  const { t } = useTranslation();
  const { user, setUser } = useUserStore();
  const avatarUrl = (user as any)?.avatarUrl as string | undefined;
  const firstName = user?.name?.split(' ')[0] || t('home.fallbackName');
  const isTeacher = user?.role === 'teacher';
  const isParent = user?.role === 'parent';

  const { pendingTeacherSetup, setPendingTeacherSetup } = useOnboardingStore();
  const { complete: profileComplete } = useTeacherProfileCompletion();

  // Bildiriş icazəsi (priming) — bir dəfə soruşmaq üçün
  const { primingSeen, hydrated: pushHydrated, setPrimingSeen } = usePushStore();
  const pushAskedRef = useRef(false);
  // Müəllim profil-setup açılan sessiyada push priming-i göstərmə (toqquşmasın)
  const skipPushThisSessionRef = useRef(isTeacher && pendingTeacherSetup);

  // Müəllim profil tamamlama: (1) ilk açılışda setup ekranı, (2) xatırlatma bildirişi
  useEffect(() => {
    if (!isTeacher) return;
    // Backend-də yarımçıq profil üçün xatırlatma bildirişi yaradılsın (72h idempotent)
    ensureProfileReminder().catch(() => {});
    // Qeydiyyatdan sonra bir dəfə profil tamamlama addımını göstər
    if (pendingTeacherSetup && !profileComplete) {
      setPendingTeacherSetup(false);
      navigation.navigate(Routes.TeacherProfileSetup);
    } else if (pendingTeacherSetup) {
      setPendingTeacherSetup(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher]);

  // Şagird üçün profil tamamlama xatırlatması (backend interval-idempotent).
  useEffect(() => {
    if (isTeacher || isParent) return;
    ensureProfileReminder().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher, isParent]);

  // Bildiriş icazəsi: ilk açılışda bir dəfə, yalnız OS statusu hələ soruşulmayıbsa,
  // rola uyğun priming ekranını göstər (OS dialoqunu birbaşa açmadan).
  useEffect(() => {
    if (!pushHydrated || primingSeen || pushAskedRef.current) return;
    if (skipPushThisSessionRef.current) return;
    pushAskedRef.current = true;
    (async () => {
      const status = await getPermissionStatus();
      setPrimingSeen(true);
      if (status === 'undetermined') {
        navigation.navigate(Routes.NotificationPriming);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushHydrated, primingSeen]);

  // Profil məlumatını (avatarUrl daxil) serverdən təzələ — header avatarı üçün.
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const badges = useBadges();
  useEffect(() => {
    if (me) setUser({ ...(user as any), ...(me as any) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);
  const { data: stats } = useQuery({ queryKey: ['user-stats'], queryFn: getUserStats, enabled: !isTeacher });

  // ── Başlanğıc yol xəritəsi (yalnız şagird) ──
  const getStarted = useGetStartedStore();
  const isStudent = !isTeacher && !isParent;
  // Onboarding köməkçiləri yalnız yeni istifadəçilərə (hesab 14 gündən yeni,
  // və ya createdAt bilinmirsə) — köhnə aktiv şagirdləri narahat etməmək üçün.
  const createdAtMs = (user as any)?.createdAt ? new Date((user as any).createdAt).getTime() : 0;
  const isNewUser = !createdAtMs || Date.now() - createdAtMs < 14 * 24 * 60 * 60 * 1000;
  const profileHasGrade = !!((user as any)?.profile?.grade || (user as any)?.grade);
  const examDone = (stats?.totalExams ?? 0) > 0;
  const getStartedSteps: GetStartedStep[] = useMemo(() => {
    const goExams = () => (navigation.getParent() as any)?.navigate('Exams');
    return [
      {
        key: 'profile',
        icon: 'person-outline',
        label: t('getStarted.stepProfile'),
        done: profileHasGrade,
        onPress: () => navigation.navigate(Routes.EditProfile),
      },
      {
        key: 'exam',
        icon: 'document-text-outline',
        label: t('getStarted.stepExam'),
        done: examDone,
        onPress: goExams,
      },
      {
        key: 'ai',
        icon: 'sparkles-outline',
        label: t('getStarted.stepAi'),
        done: getStarted.aiVisited,
        onPress: () => {
          getStarted.markAiVisited();
          (navigation.getParent() as any)?.navigate(Routes.AIMentor);
        },
      },
      {
        key: 'teacher',
        icon: 'school-outline',
        label: t('getStarted.stepTeacher'),
        done: getStarted.teacherVisited,
        onPress: () => {
          getStarted.markTeacherVisited();
          (navigation.getParent() as any)?.navigate('Booking', { screen: Routes.TeacherList });
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileHasGrade, examDone, getStarted.aiVisited, getStarted.teacherVisited, t]);
  const showGetStarted =
    isStudent &&
    isNewUser &&
    getStarted.hydrated &&
    !getStarted.dismissed &&
    getStartedSteps.some((s) => !s.done);
  // İlk açılış turu — bildiriş priming addımı həll olunandan sonra bir dəfə.
  const showTour =
    isStudent && isNewUser && getStarted.hydrated && !getStarted.hasSeenHomeTour && primingSeen;
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers-home'], queryFn: () => getTeachers({ limit: 3 }), enabled: !isTeacher && !isParent });
  const { data: leaderboard = [] } = useQuery({ queryKey: ['leaderboard-home'], queryFn: getGlobalLeaderboard, enabled: !isTeacher && !isParent });
  // Bugünkü tapşırıqlar — real günlük missiyalar
  const { data: homeMissions = [] } = useQuery<DailyMission[]>({
    queryKey: ['missions'],
    queryFn: () => getMissions().catch(() => []),
    enabled: !isTeacher && !isParent,
  });
  // AI Tədris Planı preview — real zəif/güclü fənlər
  const { data: homeTopicStats } = useQuery({
    queryKey: ['topicStats'],
    queryFn: () => getTopicStats(),
    enabled: !isTeacher && !isParent,
  });
  // Yalnız REAL, gözləyən duel dəvəti olduqda banner göstərilir (saxta banner yoxdur).
  const { data: pendingDuel } = useQuery({
    queryKey: ['pending-duel-invite'],
    queryFn: getPendingDuelInvite,
    enabled: !isTeacher && !isParent,
    retry: false,
    refetchInterval: 60000,
  });
  const { data: analytics } = useQuery({ queryKey: ['teacher-analytics'], queryFn: getTeacherAnalytics, enabled: isTeacher });
  const { data: teacherBookings = [] } = useQuery({ queryKey: ['teacher-bookings-home'], queryFn: getTeacherBookings, enabled: isTeacher });
  const { data: marketQuestions = [] } = useQuery({
    queryKey: ['market-questions-home'],
    queryFn: () => getQuestions().catch(() => []),
    enabled: isTeacher,
  });
  const openQuestionCount = marketQuestions.filter((q) => !q.isResolved).length;
  const { data: openRequestsData } = useQuery<PublicLessonRequest[]>({
    queryKey: ['openLessonRequests'],
    queryFn: () => listOpenRequests().catch(() => [] as PublicLessonRequest[]),
  });
  const openRequests: PublicLessonRequest[] = Array.isArray(openRequestsData) ? openRequestsData.slice(0, 5) : [];

  // AI Tədris Planı preview — real zəif/güclü fənn + faiz
  const aiWeakName = homeTopicStats?.weak?.[0];
  const aiStrongName = homeTopicStats?.strong?.[0];
  const aiAllStats = homeTopicStats?.all ?? [];
  const aiPctOf = (name?: string) => {
    const f = aiAllStats.find((a) => a.subject === name);
    return f ? Math.max(4, Math.min(100, Math.round(f.avg))) : undefined;
  };

  // Pull-to-refresh: bütün ana səhifə sorğularını yenidən çək.
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [interestSuccessVisible, setInterestSuccessVisible] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries();
    } finally {
      setRefreshing(false);
    }
  };

  const pendingBookings = teacherBookings.filter((b) => b.status === 'pending').slice(0, 3);
  const confirmedBookings = teacherBookings.filter((b) => b.status === 'confirmed').slice(0, 3);
  const topStudents = leaderboard.slice(0, 3);

  const renderOpenRequests = () => {
    if (openRequests.length === 0) return null;
    return (
      <View style={openReqStyles.section}>
        <View style={openReqStyles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={openReqStyles.sectionTitle}>{t('home.openReq.title')}</Text>
            <Text style={openReqStyles.sectionSub}>{t('home.openReq.sub')}</Text>
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
            <Text style={openReqStyles.seeAllBtnText}>{t('home.openReq.seeAll')}</Text>
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
                <Text style={openReqStyles.cardMetaText}>{t('home.openReq.interested', { n: r.interestedCount })}</Text>
              </View>
              <TouchableOpacity
                style={openReqStyles.interestBtn}
                activeOpacity={0.85}
                onPress={() => handleInterest(r.id)}
              >
                <Ionicons name={isTeacher ? 'hand-right-outline' : 'eye-outline'} size={14} color="#fff" />
                <Text style={openReqStyles.interestBtnText}>
                  {isTeacher ? t('home.openReq.actTeacher') : t('home.openReq.actStudent')}
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
        t('home.interest.needTeacherTitle'),
        t('home.interest.needTeacherMsg'),
      );
      return;
    }
    try {
      await expressInterest(id);
      setInterestSuccessVisible(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (msg === 'SUBSCRIPTION_REQUIRED' || e?.response?.status === 403) {
        Alert.alert(
          t('home.interest.premiumTitle'),
          t('home.interest.premiumMsg'),
          [
            { text: t('home.interest.decline'), style: 'cancel' },
            { text: t('home.interest.buyPlan'), onPress: () => navigation.navigate(PREMIUM_ENTRY_ROUTE) },
          ],
        );
      } else {
        Alert.alert(t('home.interest.errorTitle'), msg || t('home.interest.errorMsg'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Shared Top Bar ── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.topBarRight}>
          <LanguageFlagButton />
          {!isTeacher && !isParent && (
            <TouchableOpacity
              style={styles.streakBadge}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(Routes.StreakDashboard)}
            >
              <Ionicons name="flame" size={15} color="#f97316" />
              <Text style={styles.streakText} numberOfLines={1}>{stats?.streak ?? 0}</Text>
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        {/* Yeni versiya / OTA güncəlləmə banneri */}
        <UpdateBanner />
        {/* Reklam bannerləri (admin idarəli slayder) */}
        <BannerSlider placement="home" />
        {isTeacher ? (
          // ════════════════ TEACHER VIEW ════════════════
          <>
            {/* Greeting */}
            <View style={styles.greetSection}>
              <Text style={styles.greetSmall}>{t('home.greetTeacherSmall')}</Text>
              <Text style={styles.greetTitle}>{t('home.greetTeacher', { name: firstName })}</Text>
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
                  <Text style={styles.earningsLabel}>{t('home.teacher.monthlyEarnings')}</Text>
                  <Text style={styles.earningsAmount}>{analytics?.monthlyEarnings ?? 0} AZN</Text>
                </View>
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={11} color="#fff" />
                  <Text style={styles.premiumText}>{t('home.teacher.premium')}</Text>
                </View>
              </View>
              <View style={styles.earningsTrend}>
                <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.earningsTrendText}>{t('home.teacher.trend')}</Text>
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
                        // Home stack-in ÖZ EditProfile ekranını aç (HomeNavigator-da qeydiyyatdadır)
                        // ki, geri düyməsi Home-a qayıtsın. Cross-tab (Profile) keçid EditProfile-i
                        // Profile tabında "initial route" edir → geri Profil səhifəsinə atırdı.
                        navigation.navigate(Routes.EditProfile);
                        break;
                      case 'requests':
                        parent?.navigate('Booking', { screen: Routes.BookingHistory });
                        break;
                      case 'lessonRequest':
                        // "Tələblər" → açıq dərs sorğuları siyahısı (Home stack daxilində)
                        navigation.navigate(Routes.AllOpenRequests);
                        break;
                      case 'openRequests':
                        // "Açıq sorğular" → şagirdlərin yaratdığı ümumi dərs sorğuları
                        navigation.navigate(Routes.AllOpenRequests);
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
                    {((a.target === 'chat' && badges.messages > 0) ||
                      ((a.target === 'requests' || a.target === 'lessonRequest') && badges.requests > 0)) && (
                      <UnreadDot count={1} style={{ position: 'absolute', top: -2, right: -2 }} />
                    )}
                  </View>
                  <Text style={styles.quickActionLabel}>{t(a.labelKey)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics?.totalStudents ?? 0}</Text>
                <Text style={styles.statLabel}>{t('home.teacher.activeStudents')}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics?.profileViews ?? 0}</Text>
                <Text style={styles.statLabel}>{t('home.teacher.profileViews')}</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.ratingWrap}>
                  <Text style={styles.statValue}>{analytics?.rating?.toFixed(1) ?? '—'}</Text>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                </View>
                <Text style={styles.statLabel}>{t('home.teacher.rating')}</Text>
              </View>
            </View>

            {/* AI Insight */}
            <View style={styles.aiCard}>
              <View style={styles.aiIconWrap}>
                <Ionicons name="hardware-chip-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>{t('home.teacher.aiTitle')}</Text>
                <Text style={styles.aiText}>{t('home.teacher.aiText')}</Text>
              </View>
            </View>

            {/* Sinif Qiymət Kalkulyatoru */}
            <TouchableOpacity
              style={styles.calcCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(Routes.ClassGradeCalc)}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.calcIconWrap}
              >
                <Ionicons name="calculator" size={24} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.calcTitle}>{t('home.teacher.calcTitle')}</Text>
                <Text style={styles.calcSub}>{t('home.teacher.calcSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Sual Bazarı */}
            <TouchableOpacity
              style={styles.calcCard}
              activeOpacity={0.9}
              onPress={() => (navigation.getParent() as any)?.navigate('Marketplace' as never)}
            >
              <View style={[styles.calcIconWrap, styles.questionsIconWrap]}>
                <Ionicons name="chatbubbles" size={24} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.calcTitle}>{t('home.teacher.questionsTitle')}</Text>
                <Text style={styles.calcSub}>{t('home.teacher.questionsSub')}</Text>
                {openQuestionCount > 0 && (
                  <View style={styles.questionsCountPill}>
                    <Text style={styles.questionsCountText}>{t('home.teacher.questionsOpen', { n: openQuestionCount })}</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* New Requests */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('home.teacher.newRequests')}</Text>
              <TouchableOpacity onPress={() => (navigation.getParent() as any)?.navigate('Booking', { screen: Routes.BookingHistory })}>
                <Text style={styles.seeAll}>{t('home.teacher.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.requestList}>
              {pendingBookings.length === 0 ? (
                <View style={styles.requestCard}>
                  <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>{t('home.teacher.noRequests')}</Text>
                </View>
              ) : (
                pendingBookings.map((b) => {
                  const name = b.student?.name ?? t('home.teacher.student');
                  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <View key={b.id} style={styles.requestCard}>
                      <View style={styles.requestLeft}>
                        <View style={styles.requestAvatar}>
                          <Text style={styles.requestInitials}>{initials}</Text>
                        </View>
                        <View>
                          <Text style={styles.requestName}>{name}</Text>
                          <Text style={styles.requestDetail}>{b.subject ?? t('home.teacher.generalLesson')}</Text>
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
              <Text style={styles.sectionTitle}>{t('home.teacher.upcoming')}</Text>
              <TouchableOpacity onPress={() => (navigation.getParent() as any)?.navigate('Booking', { screen: Routes.BookingHistory })}>
                <Text style={styles.seeAll}>{t('home.teacher.calendar')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.lessonList}>
              {confirmedBookings.length === 0 ? (
                <View style={styles.lessonItem}>
                  <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>{t('home.teacher.noPlanned')}</Text>
                </View>
              ) : (
                confirmedBookings.map((b, i) => {
                  const d = new Date(b.scheduledAt);
                  const dayNum = d.getDate().toString();
                  const dayLabel = d.toLocaleDateString('az-AZ', { weekday: 'short' });
                  const timeStr = d.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
                  const studentName = b.student?.name ?? t('home.teacher.student');
                  return (
                    <View key={b.id} style={[styles.lessonItem, i < confirmedBookings.length - 1 && styles.lessonItemBorder]}>
                      <View style={styles.lessonLeft}>
                        <View style={styles.lessonDateBox}>
                          <Text style={styles.lessonDayLabel}>{dayLabel}</Text>
                          <Text style={styles.lessonDayNum}>{dayNum}</Text>
                        </View>
                        <View>
                          <Text style={styles.lessonTitle}>{t('home.teacher.lessonWith', { name: studentName })}</Text>
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
              <Text style={styles.greetTitle}>{t('home.greetParent', { name: firstName })}</Text>
              <Text style={styles.greetSub}>{t('home.greetParentSub')}</Text>
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
                  <Text style={styles.childGrade}>{(user as any)?.profile?.grade ? `${(user as any).profile.grade} • ${t('home.parent.yourChild')}` : t('home.parent.childAccount')}</Text>
                </View>
                <View style={styles.streakPill}>
                  <Text style={styles.streakPillText}>{t('home.parent.days', { n: stats?.streak ?? 0 })}</Text>
                </View>
                <View style={styles.childBadgeRow}>
                  <Ionicons name="star" size={12} color="#fde68a" />
                  <Text style={styles.childBadgeText}>{t('home.parent.examCount', { n: stats?.totalExams ?? 0 })}</Text>
                </View>
              </LinearGradient>

              {/* Weak Subjects Card */}
              <View style={styles.weakCard}>
                <Text style={styles.weakLabel}>{t('home.parent.weakTopics')}</Text>
                <Text style={styles.weakChipText}>{t('home.parent.comingSoon')}</Text>
              </View>
            </View>

            {/* AI Tips */}
            <View style={styles.parentAiCard}>
              <View style={styles.parentAiHeader}>
                <Ionicons name="hardware-chip-outline" size={20} color={Colors.primary} />
                <Text style={styles.parentAiTitle}>{t('home.parent.aiTips')}</Text>
              </View>
              <Text style={styles.parentAiText}>{t('home.parent.aiQuote')}</Text>
            </View>

            {/* Today's Activity */}
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>{t('home.parent.todayActivity')}</Text>
              <Text style={styles.activityLabel}>{t('home.parent.comingSoon')}</Text>
            </View>

            {/* Recent Results */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('home.parent.recentResults')}</Text>
              <TouchableOpacity onPress={() => Alert.alert(t('home.parent.results'), t('home.openReq.seeAll'))}>
                <Text style={styles.seeAll}>{t('home.parent.all')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.resultList}>
              <Text style={styles.resultSubject}>{t('home.parent.comingSoon')}</Text>
            </View>

            {/* Future Exams */}
            <View style={styles.examsCard}>
              <Text style={styles.examsTitle}>{t('home.parent.futureExams')}</Text>
              <Text style={styles.examItemTime}>{t('home.parent.comingSoon')}</Text>
            </View>

            {/* Recommended Teachers */}
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>{t('home.parent.recommendedTeachers')}</Text>
            <Text style={styles.examItemTime}>{t('home.parent.comingSoon')}</Text>

            {/* Açıq dərs sorğuları (Parent) */}
            {renderOpenRequests()}
          </>
        ) : (
          // ════════════════ STUDENT VIEW ════════════════
          <>
            {/* Greeting */}
            <View style={styles.greetSection}>
              <Text style={styles.greetTitle}>{t('home.greetStudent', { name: firstName })}</Text>
              <Text style={styles.greetSub}>{t('home.greetStudentSub')}</Text>
            </View>

            {/* Başlanğıc yol xəritəsi — yeni istifadəçini ilk addımlara yönləndirir */}
            {showGetStarted && (
              <GetStartedCard steps={getStartedSteps} onDismiss={getStarted.dismiss} />
            )}

            {/* Hero Card */}
            <LinearGradient
              colors={['#00476b', '#0077b6', '#4cc9f0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroOrb1} pointerEvents="none" />
              <View style={styles.heroOrb2} pointerEvents="none" />
              <Ionicons name="rocket" size={128} color="rgba(255,255,255,0.10)" style={styles.heroWatermark} />
              <View style={styles.heroContentZ}>
                <View style={styles.heroBadge}>
                  <Ionicons name="flash" size={12} color="#fff" />
                  <Text style={styles.heroBadgeText}>{t('home.student.heroBadge')}</Text>
                </View>
                <Text style={styles.heroTitle}>{t('home.student.heroTitle')}</Text>
                <Text style={styles.heroSub}>{t('home.student.heroSub')}</Text>
                <TouchableOpacity
                  style={styles.heroBtn}
                  activeOpacity={0.85}
                  onPress={() => (navigation.getParent() as any)?.navigate('Exams' as never)}
                >
                  <Ionicons name="play-circle" size={20} color={Colors.primary} />
                  <Text style={styles.heroBtnText}>{t('home.student.startExam')}</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Quick Actions */}
            <View style={styles.quickSectionHeader}>
              <Ionicons name="flash-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t('home.student.quickLinks')}</Text>
              <TouchableOpacity
                style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 }}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(Routes.SmartFeed as never)}
              >
                <Ionicons name="sparkles" size={14} color={Colors.primary} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>{t('home.student.forYou')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Exams' as never)}
              >
                <LinearGradient colors={['#0077b6', '#47b4fa']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickItemIcon, { shadowColor: '#0077b6' }]}>
                  <Ionicons name="document-text" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickItemLabel}>{t('home.student.qStartExam')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate(Routes.AIMentor as never)}
              >
                <LinearGradient colors={['#7c3aed', '#a855f7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickItemIcon, { shadowColor: '#7c3aed' }]}>
                  <Ionicons name="hardware-chip" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickItemLabel}>{t('home.student.qAiAsk')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Booking' as never, { screen: Routes.TeacherList } as never)}
              >
                <LinearGradient colors={['#059669', '#34d399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickItemIcon, { shadowColor: '#059669' }]}>
                  <Ionicons name="school" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickItemLabel}>{t('home.student.qFindTeacher')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Calculators' as never)}
              >
                <LinearGradient colors={['#d97706', '#fbbf24']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickItemIcon, { shadowColor: '#d97706' }]}>
                  <Ionicons name="calculator" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickItemLabel}>{t('home.student.qCalc')}</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions — second row */}
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Learn' as never)}
              >
                <LinearGradient colors={['#2563eb', '#60a5fa']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickItemIcon, { shadowColor: '#2563eb' }]}>
                  <Ionicons name="book" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickItemLabel}>{t('home.student.qLearn')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Marketplace' as never)}
              >
                <LinearGradient colors={['#ea580c', '#fb923c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickItemIcon, { shadowColor: '#ea580c' }]}>
                  <Ionicons name="help-circle" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickItemLabel}>{t('home.student.qMarket')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Bookmarks' as never)}
              >
                <LinearGradient colors={['#db2777', '#f472b6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickItemIcon, { shadowColor: '#db2777' }]}>
                  <Ionicons name="bookmark" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickItemLabel}>{t('home.student.qSaved')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => (navigation.getParent() as any)?.navigate('Chat' as never)}
              >
                <LinearGradient colors={['#4f46e5', '#818cf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickItemIcon, { shadowColor: '#4f46e5' }]}>
                  <Ionicons name="chatbubbles" size={24} color="#fff" />
                  {badges.messages > 0 && (
                    <UnreadDot count={1} style={{ position: 'absolute', top: -2, right: -2 }} />
                  )}
                </LinearGradient>
                <Text style={styles.quickItemLabel}>{t('home.student.qMessage')}</Text>
              </TouchableOpacity>
            </View>

            {/* Yeni ekranlar (test) */}
            {!isTeacher && !isParent && (
              <View style={{ marginBottom: 28, gap: 10 }}>
                <View style={styles.quickSectionHeader}>
                  <Ionicons name="sparkles-outline" size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>{t('home.student.newScreens')}</Text>
                </View>

                {/* Duel dəvəti — YALNIZ real, gözləyən dəvət olduqda göstərilir */}
                {pendingDuel && (
                  <TouchableOpacity
                    style={{ backgroundColor: '#FEE2E2', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#FECACA' }}
                    activeOpacity={0.85}
                    onPress={() =>
                      (navigation.getParent() as any)?.navigate('Exams', {
                        screen: Routes.DuelInvite,
                        params: {
                          inviteId: pendingDuel.id,
                          challengerName: pendingDuel.challengerName,
                          challengerLevel: pendingDuel.challengerLevel,
                          challengerSchool: pendingDuel.challengerSchool,
                          challengerXp: pendingDuel.challengerXp,
                          challengerWinRate: pendingDuel.challengerWinRate,
                          subject: pendingDuel.subject,
                          questionCount: pendingDuel.questionCount,
                          stake: pendingDuel.stake,
                        },
                      })
                    }
                  >
                    <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="notifications" size={20} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#991B1B' }}>{t('home.student.duelTitle')}</Text>
                      <Text style={{ fontSize: 11, color: '#7F1D1D' }}>
                        {t('home.student.duelSub', { name: pendingDuel.challengerName })}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#991B1B" />
                  </TouchableOpacity>
                )}

                {/* 👥 Sosial & İcma */}
                <TestCategoryAccordion title={t('home.student.accSocial')} count={4} defaultOpen>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title={t('home.student.cardFindFriend')} sub={t('home.student.cardFindFriendSub')} icon="person-add" onPress={() => navigation.navigate(Routes.FindFriend)} />
                    <TestCard title={t('home.student.cardMyFriends')} sub={t('home.student.cardMyFriendsSub')} icon="people-circle" onPress={() => navigation.navigate(Routes.MyFriends)} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title={t('home.student.cardLeaders')} sub={t('home.student.cardLeadersSub')} icon="podium" onPress={() => navigation.navigate(Routes.LeaderboardDetail)} />
                    <TestCard title={t('home.student.cardFeed')} sub={t('home.student.cardFeedSub')} icon="pulse" iconColor={Colors.tertiary} onPress={() => navigation.navigate(Routes.LiveActivity)} />
                  </View>
                </TestCategoryAccordion>

                {/* 📊 Performans & Analitika */}
                <TestCategoryAccordion title={t('home.student.accPerf')} count={6}>
                  <Text style={perfStyles.groupLabel}>{t('home.student.grpStats')}</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title={t('home.student.cardPerf')} sub={t('home.student.cardPerfSub')} icon="pie-chart" onPress={() => navigation.navigate(Routes.PerformanceSummary)} />
                    <TestCard title={t('home.student.cardWeekly')} sub={t('home.student.cardWeeklySub')} icon="bar-chart" onPress={() => navigation.navigate(Routes.WeeklyReport)} />
                  </View>

                  <Text style={perfStyles.groupLabel}>{t('home.student.grpAiDev')}</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title={t('home.student.cardWeak')} sub={t('home.student.cardWeakSub')} icon="alert-circle" iconColor={Colors.danger} onPress={() => navigation.navigate(Routes.WeakTopics)} />
                    <TestCard title={t('home.student.cardReview')} sub={t('home.student.cardReviewSub')} icon="refresh-circle" onPress={() => navigation.navigate(Routes.ReviewTopics)} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title={t('home.student.cardTips')} sub={t('home.student.cardTipsSub')} icon="bulb" onPress={() => navigation.navigate(Routes.ImprovementTips)} />
                    <TestCard title={t('home.student.cardTopic')} sub={t('home.student.cardTopicSub')} icon="git-network" onPress={() => navigation.navigate(Routes.TopicProgress)} />
                  </View>
                </TestCategoryAccordion>

                {/* 🤖 AI & Tapşırıq */}
                <TestCategoryAccordion title={t('home.student.accAi')} count={2}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TestCard title={t('home.student.cardBuilder')} sub={t('home.student.cardBuilderSub')} icon="construct" onPress={() => navigation.navigate(Routes.AIPracticeBuilder)} />
                    <TestCard title={t('home.student.cardMissions')} sub={t('home.student.cardMissionsSub')} icon="flame" onPress={() => navigation.navigate(Routes.MissionStart)} />
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
                  <Text style={styles.spinBannerTitle}>{t('home.student.spinTitle')}</Text>
                  <Text style={styles.spinBannerSub}>{t('home.student.spinSub')}</Text>
                </View>
                <View style={styles.spinBannerPill}>
                  <Text style={styles.spinBannerPillText}>{t('home.student.new')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Daily Missions shortcut */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('home.student.todayTasks')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate(Routes.DailyMissions)}>
                <Text style={styles.seeAll}>{t('home.student.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.todayTaskList}>
              {homeMissions.length === 0 ? (
                <View style={styles.todayTaskCard}>
                  <View style={styles.todayTaskLeft}>
                    <View style={[styles.todayTaskIconWrap, { backgroundColor: Colors.primaryLight }]}>
                      <Ionicons name="checkmark-done-outline" size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.todayTaskInfo}>
                      <Text style={styles.todayTaskTitle}>{t('missions.empty')}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                homeMissions.slice(0, 3).map((m) => {
                  const icon = m.type === 'question' ? 'chatbubble-ellipses-outline' : 'document-text-outline';
                  const dest = m.type === 'question' ? 'Marketplace' : 'Exams';
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.todayTaskCard, m.completed && styles.todayTaskDone]}
                      activeOpacity={0.85}
                      onPress={() => (navigation.getParent() as any)?.navigate(dest)}
                    >
                      <View style={styles.todayTaskLeft}>
                        <View style={[styles.todayTaskIconWrap, { backgroundColor: m.completed ? Colors.tertiaryContainer + '33' : Colors.primaryLight }]}>
                          <Ionicons name={(m.completed ? 'checkmark' : icon) as any} size={20} color={m.completed ? Colors.tertiary : Colors.primary} />
                        </View>
                        <View style={styles.todayTaskInfo}>
                          <Text style={styles.todayTaskTitle}>{m.title}</Text>
                          <Text style={styles.todayTaskSub}>{m.progress}/{m.target} · {t('missions.rewardCoins', { n: m.reward })}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={22} color={m.completed ? Colors.primary : Colors.outlineVariant} />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* AI Teaching Plan */}
            <TouchableOpacity
              style={styles.aiPlanCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(Routes.AIStudyPath)}
            >
              <View style={styles.aiPlanHeader}>
                <Ionicons name="sparkles" size={18} color={Colors.primary} />
                <Text style={styles.aiPlanTitle}>{t('home.student.aiPlanTitle')}</Text>
                <View style={{ flex: 1 }} />
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </View>
              {aiWeakName || aiStrongName ? (
                <View style={styles.aiPlanGrid}>
                  <View style={[styles.aiTopicCard, { borderBottomColor: aiWeakName ? '#fca5a5' : Colors.border }]}>
                    <Text style={styles.aiTopicBadgeWeak}>{t('home.student.weakTopic')}</Text>
                    <Text style={styles.aiTopicName} numberOfLines={1}>{aiWeakName ?? '—'}</Text>
                    <View style={styles.aiProgressTrack}>
                      <View style={[styles.aiProgressFill, { width: `${aiWeakName ? (aiPctOf(aiWeakName) ?? 0) : 0}%` as any, backgroundColor: aiWeakName ? '#f87171' : Colors.border }]} />
                    </View>
                  </View>
                  <View style={[styles.aiTopicCard, { borderBottomColor: aiStrongName ? '#6ee7b7' : Colors.border }]}>
                    <Text style={styles.aiTopicBadgeStrong}>{t('home.student.strongTopic')}</Text>
                    <Text style={styles.aiTopicName} numberOfLines={1}>{aiStrongName ?? '—'}</Text>
                    <View style={styles.aiProgressTrack}>
                      <View style={[styles.aiProgressFill, { width: `${aiStrongName ? (aiPctOf(aiStrongName) ?? 0) : 0}%` as any, backgroundColor: aiStrongName ? Colors.tertiary : Colors.border }]} />
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={styles.aiPlanEmpty}>{t('home.student.aiPlanEmpty')}</Text>
              )}
            </TouchableOpacity>

            {/* Recommended Teachers */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('home.student.recommendedTeachers')}</Text>
              <TouchableOpacity
                onPress={() => (navigation.getParent() as any)?.navigate('Booking' as never, { screen: Routes.TeacherList } as never)}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>{t('home.student.all')}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teachersRow}
              style={{ marginHorizontal: -24 }}
            >
              {teachers.map((tch) => {
                const initials = tch.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
                const hasRating = typeof tch.rating === 'number' && tch.rating > 0;
                const subject = tch.subjects?.[0] || t('home.student.variousSubjects');
                const experience = (tch as any).experienceYears;
                const avatarUrl = (tch as any).avatarUrl as string | undefined;
                const goToTeacher = () => (navigation.getParent() as any)?.navigate('Booking' as never, { screen: Routes.TeacherProfile, params: { teacher: tch } } as never);
                return (
                  <TouchableOpacity
                    key={tch.id}
                    style={styles.teacherCardRich}
                    activeOpacity={0.9}
                    onPress={goToTeacher}
                  >
                    {/* Premium başlıq zolağı */}
                    <LinearGradient
                      colors={[Colors.gradientStart, Colors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.teacherCardBanner}
                    >
                      {hasRating && (
                        <View style={styles.teacherRatingChip}>
                          <Ionicons name="star" size={11} color="#f59e0b" />
                          <Text style={styles.teacherRatingChipText}>{tch.rating!.toFixed(1)}</Text>
                        </View>
                      )}
                    </LinearGradient>

                    {/* Avatar (zolağın üstünə düşür) */}
                    <View style={styles.teacherAvatarWrap}>
                      {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.teacherAvatarRichImg} />
                      ) : (
                        <LinearGradient
                          colors={[Colors.gradientStart, Colors.gradientEnd]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.teacherAvatarRichImg}
                        >
                          <Text style={styles.teacherAvatarInitial}>{initials}</Text>
                        </LinearGradient>
                      )}
                      <View style={styles.teacherVerifiedBadge}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    </View>

                    <View style={styles.teacherCardBody}>
                      <Text style={styles.teacherNameRich} numberOfLines={1}>{tch.name}</Text>
                      <Text style={styles.teacherSubjectRich} numberOfLines={1}>
                        {subject}{experience ? ` • ${t('home.student.expYears', { n: experience })}` : ''}
                      </Text>
                      <View style={styles.teacherStatsRow}>
                        <Ionicons name="star" size={12} color="#f59e0b" />
                        <Text style={styles.teacherStatsText}>
                          {hasRating ? tch.rating!.toFixed(1) : t('home.student.newTeacher')}
                        </Text>
                      </View>
                    </View>

                    {/* Diqqətçəkən müraciət düyməsi */}
                    <LinearGradient
                      colors={[Colors.gradientStart, Colors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.teacherApplyBtn}
                    >
                      <Text style={styles.teacherApplyBtnText}>{t('home.student.applyTeacher')}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Açıq dərs sorğuları — visible after teachers */}
            {renderOpenRequests()}

            {/* Competitions */}
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>{t('home.student.competitions')}</Text>
            <View style={styles.competitionCard}>
              <View style={styles.compLeft}>
                <View style={styles.compIcon}>
                  <Ionicons name="trophy-outline" size={20} color="#d97706" />
                </View>
                <View>
                  <Text style={styles.compTitle}>{t('home.student.olympiad')}</Text>
                  <Text style={styles.compSub}>{t('home.student.lastReg')}</Text>
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
                <Text style={styles.joinBtnText}>{t('home.student.join')}</Text>
              </TouchableOpacity>
            </View>

            {/* Leaderboard */}
            <View style={styles.leaderRow}>
              <TouchableOpacity
                style={styles.leaderCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(Routes.Leaderboard)}
              >
                <Text style={styles.leaderTitle}>{t('home.student.topStudents')}</Text>
                {topStudents.length === 0 ? (
                  <Text style={[styles.leaderName, { color: Colors.textMuted }]}>{t('home.student.noData')}</Text>
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
                <Text style={styles.leaderTitle}>{t('home.student.topSchools')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <Ionicons name="school-outline" size={16} color={Colors.primary} />
                  <Text style={[styles.leaderName, { color: Colors.primary, fontWeight: '600' }]}>{t('home.student.viewRanking')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Tərəfdaşlarımız (admin idarəli) */}
        <PartnersSection />
      </ScrollView>

      <SuccessOverlay
        visible={interestSuccessVisible}
        title={t('home.interest.successTitle')}
        message={t('home.interest.successMsg')}
        onClose={() => setInterestSuccessVisible(false)}
      />

      <HomeTourOverlay visible={showTour} onFinish={getStarted.markTourSeen} />
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
    paddingLeft: 0,
    paddingRight: rs(16),
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.surface + 'b3',
  },
  // flex:1 + minWidth:0 → loqo qrupu sağdakı sabit düymələrə yer buraxmaq üçün
  // istənilən ekran enində kiçilə bilir (dar ekranlarda sağdan daşmanın qarşısını alır).
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  topAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    flexShrink: 1,
    width: rs(170),
    height: rs(62),
    marginLeft: -36,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: rs(8), flexShrink: 0 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 8,
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
    paddingHorizontal: rs(20),
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
    width: 48,
    height: 48,
    borderRadius: 13,
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

  // ── Teacher: Sinif Qiymət Kalkulyatoru kartı ───────────────────────────
  calcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  calcIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  calcTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  calcSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 17 },

  // ── Teacher: Sual Bazarı kartı ─────────────────────────────────────────
  questionsIconWrap: { backgroundColor: '#d1fae5' },
  questionsCountPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  questionsCountText: { fontSize: 11, fontWeight: '700', color: '#059669' },

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
    borderRadius: 24,
    padding: 26,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 8,
  },
  heroContentZ: { zIndex: 2 },
  heroOrb1: {
    position: 'absolute', top: -50, right: -40,
    width: 170, height: 170, borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroOrb2: {
    position: 'absolute', bottom: -60, left: -30,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  heroWatermark: { position: 'absolute', right: -14, bottom: -18, transform: [{ rotate: '-12deg' }] },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginBottom: 14,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 22,
    marginBottom: 22,
    maxWidth: '92%',
  },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 4,
  },
  heroBtnText: { fontSize: 15, fontWeight: '800', color: Colors.primary },

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

  // Rich teacher card (premium redesign — used on home)
  teacherCardRich: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  teacherCardBanner: {
    height: 56,
    paddingHorizontal: 12,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  teacherRatingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
  },
  teacherRatingChipText: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary },
  teacherAvatarWrap: {
    marginTop: -32, marginLeft: 16, marginBottom: 4,
    width: 64, height: 64,
  },
  teacherAvatarRichImg: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.surface,
  },
  teacherVerifiedBadge: {
    position: 'absolute', right: -2, bottom: 2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#22c55e',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surface,
  },
  teacherAvatarInitial: { fontSize: 22, fontWeight: '800', color: '#fff' },
  teacherCardBody: { paddingHorizontal: 16, gap: 2 },
  teacherNameRich: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  teacherSubjectRich: { fontSize: 12, color: Colors.textMuted },
  teacherStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  teacherStatsText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  teacherApplyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, paddingVertical: 10,
  },
  teacherApplyBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

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
  quickItemIcon: {
    width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 4,
  },
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
  aiPlanEmpty: { fontSize: 13, color: Colors.textSecondary, paddingVertical: 8 },
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
