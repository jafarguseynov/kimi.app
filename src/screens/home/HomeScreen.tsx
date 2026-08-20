import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { shortName } from '../../utils/name';
import { useUserStore } from '../../store/user.store';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { premiumRouteFor } from '../../config/iap';
import { getUserStats } from '../../api/dashboard.api';
import { getTeachers, ensureProfileReminder, getMe } from '../../api/user.api';
import { getGlobalLeaderboard } from '../../api/leaderboard.api';
import { getPendingDuelInvite } from '../../api/duel.api';
import { listOpenRequests, expressInterest, type PublicLessonRequest } from '../../api/lessonRequest.api';
import { getTopicStats } from '../../api/topicStats.api';
import { getSpecializations } from '../../api/specialization.api';
import { getDailyChallenge, startDailyChallenge } from '../../api/dailyChallenge.api';
import DailyChallengeCard from '../../components/home/DailyChallengeCard';
import { useExamStore } from '../../store/exam.store';
import { useOnboardingStore } from '../../store/onboarding.store';
import { useGetStartedStore } from '../../store/getStarted.store';
import GetStartedCard, { type GetStartedStep } from './GetStartedCard';
import HomeTourOverlay from './HomeTourOverlay';
import { usePushStore } from '../../store/push.store';
import { getPermissionStatus } from '../../utils/push';
import { useTeacherProfileCompletion } from '../../hooks/useTeacherProfileCompletion';
import UpdateBanner from '../../components/UpdateBanner';
import BannerSlider from '../../components/BannerSlider';
import Skeleton from '../../components/common/Skeleton';
import TeacherWorkspace from '../../components/home/TeacherWorkspace';
import ExamHighlights from '../../components/home/ExamHighlights';
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

// ── İxtisaslar (müəllim fənləri) ───────────────────────────────────────────
// Kartlardan gələn REAL fənlərlə doldurulur; siyahını doldurmaq üçün aşağıdakı
// standart fənlər əlavə olunur.
//
// İkonlar: dizayn maketindəki təmiz xətt üslubuna uyğun olaraq MaterialCommunityIcons
// (`@expo/vector-icons` — layihədə onsuz da var, ƏLAVƏ ASSET FAYLI TƏLƏB ETMİR).
// İstisna: DİL fənləri — maketdə də bayraq göstərilir, bayrağı vektor ikonla əvəz
// etmək mənanı itirir, ona görə onlar emoji olaraq qalır.
type SubjectIcon = { mci: string } | { emoji: string };

const SUBJECT_ICONS: Record<string, SubjectIcon> = {
  // Dillər — bayraq (emoji)
  'azərbaycan dili': { emoji: '🇦🇿' },
  'ingilis dili': { emoji: '🇬🇧' },
  'rus dili': { emoji: '🇷🇺' },
  'alman dili': { emoji: '🇩🇪' },
  'fransız dili': { emoji: '🇫🇷' },
  // Digər fənlər — vektor ikon. Bütün dairələr eyni görünsün deyə
  // mümkün olan yerdə `-outline` (xətt) variantı seçilib.
  'ədəbiyyat': { mci: 'book-open-page-variant-outline' },
  'tarix': { mci: 'bank-outline' },
  'coğrafiya': { mci: 'earth' },
  'kimya': { mci: 'flask-outline' },
  'riyaziyyat': { mci: 'calculator-variant-outline' },
  'cəbr': { mci: 'math-integral' },
  'həndəsə': { mci: 'math-compass' },
  'fizika': { mci: 'atom' },
  'biologiya': { mci: 'dna' },
  'informatika': { mci: 'laptop' },
  'musiqi': { mci: 'music-clef-treble' },
  'rəsm': { mci: 'palette-outline' },
};

// ⚠️ Azərbaycan əlifbası: JS-də 'İ'.toLowerCase() sadə 'i' vermir — 'i' + U+0307
// (combining dot above) qaytarır. Ona görə 'İngilis dili' → 'i̇ngilis dili' olurdu və
// yuxarıdakı 'ingilis dili' açarı ilə HEÇ VAXT uyğunlaşmırdı → hamısı 📚 fallback alırdı.
// Həmin birləşən nöqtəni silirik ki, bütün İ-li fənlər düzgün ikon alsın.
const normSubject = (s: string) => s.trim().toLowerCase().replace(/̇/g, '');

// Fənn adları sərbəst mətndir (müəllim/admin yazır: "İbtidai sinif (1-4)"), ona görə
// dəqiq açar uyğunluğu kifayət etmir — sonra bu substring qaydaları yoxlanılır.
const SUBJECT_ICONS_FUZZY: [RegExp, SubjectIcon][] = [
  [/məktəbəqədər/, { mci: 'baby-face-outline' }],
  [/ibtidai/, { mci: 'pencil-ruler' }],
  // "hazırlıq" / "hazırlığı" — Azərbaycan dilində sonluq q↔ğ dəyişir.
  [/hazırlı[qğ]/, { mci: 'target' }],
  // Tanımadığımız "... dili" fənləri (yapon, yunan, ərəb...) — ümumi tərcümə ikonu.
  [/\bdili\b/, { mci: 'translate' }],
];

const subjectIcon = (s: string): SubjectIcon => {
  const key = normSubject(s);
  const exact = SUBJECT_ICONS[key];
  if (exact) return exact;
  const fuzzy = SUBJECT_ICONS_FUZZY.find(([re]) => re.test(key));
  return fuzzy ? fuzzy[1] : { mci: 'book-open-variant' };
};

/**
 * Fənn dairəsinin içi. Prioritet:
 *   1. Admin paneldən yüklənmiş ikon şəkli (`iconUrl`) — tam idarə səndədir.
 *   2. Şəkil yoxdursa/yüklənməsə → daxili vektor ikon (dillərdə bayraq emojisi).
 * Şəkil xətası (silinmiş fayl, internet yoxdur) dairəni BOŞ qoymur — fallback işə düşür.
 */
function SubjectIconView({ subject, iconUrl }: { subject: string; iconUrl?: string | null }) {
  const [failed, setFailed] = useState(false);

  if (iconUrl && !failed) {
    return (
      <Image
        source={{ uri: iconUrl }}
        style={styles.specImage}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    );
  }

  const icon = subjectIcon(subject);
  if ('emoji' in icon) return <Text style={styles.specEmoji}>{icon.emoji}</Text>;
  return <MaterialCommunityIcons name={icon.mci as any} size={30} color={Colors.primary} />;
}

/**
 * Toxumla idarə olunan qarışdırma (Fisher–Yates + mulberry32).
 * `Math.random()` işlətsək hər render-də sıra dəyişərdi (siyahı gözün qarşısında
 * titrəyərdi); toxum sabit qaldıqca nəticə də sabitdir — sıra YALNIZ toxum
 * dəyişəndə (ekrana qayıdış / yeniləmə) yenilənir.
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  let a = seed * 1664525 + 1013904223;
  const rand = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const FALLBACK_SUBJECTS = [
  'Azərbaycan dili', 'Ədəbiyyat', 'Tarix', 'Coğrafiya', 'Kimya',
  'Riyaziyyat', 'Fizika', 'Biologiya', 'İngilis dili', 'İnformatika',
];

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
  // İmtahan kartlarının fərdiləşdirilməsi üçün profil məlumatı (əlavə sorğu yoxdur).
  const myGrade: string | undefined =
    (me as any)?.profile?.grade ?? (me as any)?.grade ?? (user as any)?.profile?.grade;
  const myGoal: string | undefined = (me as any)?.profile?.goal ?? (me as any)?.goal;
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
  // Backend `limit` parametrini nəzərə almır — bütün müəllim siyahısını qaytarır.
  // Onu HOVUZ kimi saxlayıb kartların sırasını özümüz qarışdırırıq.
  // Müəllim ana səhifəsində də "Müəllimlər" zolağı göstərilir (istifadəçi istəyi),
  // ona görə bu sorğu artıq müəllim üçün də açıqdır.
  const { data: teacherPool = [], isLoading: teachersLoading } = useQuery({ queryKey: ['teachers-home'], queryFn: () => getTeachers(), enabled: !isParent });

  // Hər dəfə ekrana qayıdanda / pull-to-refresh-də toxum artır → yeni sıra.
  const [teacherShuffleSeed, setTeacherShuffleSeed] = useState(() => Date.now());
  useFocusEffect(
    useCallback(() => {
      setTeacherShuffleSeed(Date.now());
    }, []),
  );

  // Sıra təsadüfidir, LAKİN keyfiyyət pillələri qorunur (istifadəçi qərarı) —
  // əks halda şəkli/qiyməti olmayan yarımçıq profillər ana səhifədə birinci çıxır:
  //   1) ödənişli "featured" (yerini pulla alıb — aşağı düşməməlidir)
  //   2) tam doldurulmuş profillər (`isComplete`)
  //   3) yarımçıq profillər
  // Hər pillənin İÇİNDƏ tam qarışdırma var, ona görə sıra yenə dəyişir.
  //
  // ⚠️ Nəzərə al: ana səhifədə görünən müxtəliflik 2-ci pillənin ölçüsündən asılıdır.
  // Nə qədər çox müəllim profilini TAM doldursa, bir o qədər çox fərqli müəllim
  // birinci kartda görünəcək (yarımçıq profillər siyahının sonunda qalır).
  const teachers = useMemo(() => {
    const featured = teacherPool.filter((t: any) => t.isFeatured);
    const complete = teacherPool.filter((t: any) => !t.isFeatured && t.isComplete);
    const partial = teacherPool.filter((t: any) => !t.isFeatured && !t.isComplete);
    return [
      ...seededShuffle(featured, teacherShuffleSeed),
      ...seededShuffle(complete, teacherShuffleSeed + 1),
      ...seededShuffle(partial, teacherShuffleSeed + 2),
    ];
  }, [teacherPool, teacherShuffleSeed]);
  // İxtisaslar zolağı — əvvəlcə müəllimlərin REAL fənləri (tez-tez rast gəlinən öndə),
  // sonra siyahını doldurmaq üçün standart fənlər.
  const specializations = useMemo(() => {
    const freq = new Map<string, number>();
    // Qarışdırılmış `teachers` deyil, sabit `teacherPool` — fənn dairələrinin
    // sırası hər ekrana qayıdışda dəyişməsin.
    teacherPool.forEach((tch) => {
      (tch.subjects ?? []).forEach((s) => {
        const name = (s ?? '').trim();
        if (!name) return;
        freq.set(name, (freq.get(name) ?? 0) + 1);
      });
    });
    const real = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
    const seen = new Set(real.map(normSubject));
    const filler = FALLBACK_SUBJECTS.filter((s) => !seen.has(normSubject(s)));
    return [...real, ...filler].slice(0, 12);
  }, [teacherPool]);

  // Admin paneldə ixtisaslara yüklənmiş ikonlar. Sorğu uğursuz olsa belə ekran
  // pozulmur — sadəcə daxili vektor ikonlar göstərilir.
  // ── ⚡ Günün çağırışı ──────────────────────────────────────────────────
  // Məzmun tam serverdən gəlir (daily_challenges cədvəli) — kartda sabit yazılmış
  // sual sayı/müddət/xal YOXDUR.
  // Yalnız şagird funksiyasıdır — müəllim/valideyn üçün sorğu göndərilmir.
  const { data: dailyChallenge, isLoading: dcLoading } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: getDailyChallenge,
    enabled: !isTeacher && !isParent,
    staleTime: 5 * 60 * 1000,
  });
  const [dcStarting, setDcStarting] = useState(false);
  const { setSession, setSubmissionType, setCollectionId, setDailyChallenge } = useExamStore();

  const goToExams = () => (navigation.getParent() as any)?.navigate('Exams' as never);

  const startChallenge = async () => {
    if (dcStarting) return;
    setDcStarting(true);
    try {
      const data = await startDailyChallenge();
      // Adi imtahanla EYNİ sessiya formatıdır — mövcud ExamSession ekranı
      // dəyişmədən işləyir (ayrıca test mühərriki yazılmadı).
      setCollectionId(null);
      setSubmissionType('practice');
      setSession(data.sessionId, data.exam.id, data.questions, data.exam.duration * 60, {
        subject: data.exam.subject,
        difficulty: data.exam.difficulty,
        title: data.exam.title,
      });
      setDailyChallenge(true);
      (navigation.getParent() as any)?.navigate('Exams', { screen: Routes.ExamSession });
    } catch (e: any) {
      Alert.alert(
        t('marketplace.errorTitle'),
        e?.response?.data?.message || t('home.student.dcStartFail'),
      );
    } finally {
      setDcStarting(false);
    }
  };

  const { data: adminSpecs = [] } = useQuery({
    queryKey: ['specialization-icons'],
    queryFn: getSpecializations,
    enabled: !isTeacher && !isParent,
    staleTime: 30 * 60 * 1000,
  });
  const specIconMap = useMemo(() => {
    const m = new Map<string, string>();
    adminSpecs.forEach((sp) => {
      if (sp.iconUrl) m.set(normSubject(sp.name), sp.iconUrl);
    });
    return m;
  }, [adminSpecs]);
  const { data: leaderboard = [] } = useQuery({ queryKey: ['leaderboard-home'], queryFn: getGlobalLeaderboard, enabled: !isTeacher && !isParent });
  // Bugünkü tapşırıqlar — real günlük missiyalar
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
  // ⚠️ §24 — müəllim üçün `teacher-analytics`, `teacher-bookings-home` və
  // `market-questions-home` sorğuları BURADAN ÇIXARILIB. Qazanc/statistika
  // dashboard-da göstərilmir; lazım olan yeganə sorğuları `TeacherWorkspace`
  // özü (yalnız müəllim görünüşü qurulduqda) çəkir.
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
  // Sürətli keçidlər: ilkin halda yalnız ilk 4 qısayol görünür.
  const [quickExpanded, setQuickExpanded] = useState(false);
  const [interestSuccessVisible, setInterestSuccessVisible] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    // Yeni müəllim sırası — məlumat eyni qalsa belə istifadəçi dəyişiklik görsün.
    setTeacherShuffleSeed(Date.now());
    try {
      await queryClient.invalidateQueries();
    } finally {
      setRefreshing(false);
    }
  };

  const topStudents = leaderboard.slice(0, 3);

  const renderOpenRequests = () => {
    if (openRequests.length === 0) return null;
    return (
      <View style={openReqStyles.section}>
        <View style={openReqStyles.sectionHeader}>
          <LinearGradient colors={['#EC4899', '#DB2777']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={openReqStyles.headIconChip}>
            <Ionicons name="megaphone" size={14} color="#fff" />
          </LinearGradient>
          {/* PRO nişanı ALT sətirdədir: başlıq sətrində 4 element olanda
              (müəllim görünüşü) başlıq kəsilirdi. */}
          <View style={{ flex: 1 }}>
            <Text style={openReqStyles.sectionTitle} numberOfLines={1}>{t('home.openReq.title')}</Text>
            <View style={openReqStyles.titleRow}>
              <Text style={openReqStyles.sectionSub} numberOfLines={1}>{t('home.openReq.sub')}</Text>
              {isTeacher && (
                <LinearGradient colors={['#FBBF24', '#F59E0B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={openReqStyles.proPill}>
                  <Ionicons name="star" size={11} color="#fff" />
                  <Text style={openReqStyles.proPillText}>PRO</Text>
                </LinearGradient>
              )}
            </View>
          </View>
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
              <LinearGradient colors={['#0EA5E9', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={openReqStyles.cardAccent} />
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
                <Ionicons name="people" size={12} color="#10B981" />
                <Text style={[openReqStyles.cardMetaText, { color: '#059669', fontWeight: '700' }]}>{t('home.openReq.interested', { n: r.interestedCount })}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => handleInterest(r.id)}
              >
                <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={openReqStyles.interestBtn}>
                  <Ionicons name={isTeacher ? 'hand-right' : 'eye'} size={14} color="#fff" />
                  <Text style={openReqStyles.interestBtnText}>
                    {isTeacher ? t('home.openReq.actTeacher') : t('home.openReq.actStudent')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  /**
   * "Müəllimlər" zolağı — həm şagird, həm müəllim ana səhifəsində göstərilir.
   * JSX student budağından OLDUĞU KİMİ çıxarılıb (kart dizaynı, naviqasiya və
   * qarışdırma məntiqi dəyişməyib), sadəcə iki yerdən çağırıla bilsin deyə
   * funksiyaya alınıb.
   */
  const renderTeachersSection = () => {
    // Yüklənərkən başlıq + kart skeletonları göstərilir: əvvəl bölmə tamam
    // görünmürdü və data gələndə səhifə aşağı "tullanırdı".
    if (teachers.length === 0 && teachersLoading) {
      return (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>{t('home.student.recommendedTeachers')}</Text>
          </View>
          <View style={styles.teachersSkeletonRow}>
            {[0, 1].map((i) => (
              <View key={i} style={styles.teacherCardRich}>
                <Skeleton width={'100%'} height={104} radius={0} />
                <View style={styles.teacherCardBody}>
                  <Skeleton width={'70%'} height={14} />
                  <Skeleton width={'50%'} height={11} />
                  <Skeleton width={'40%'} height={13} />
                </View>
              </View>
            ))}
          </View>
        </>
      );
    }
    if (teachers.length === 0) return null;
    return (
      <>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t('home.student.recommendedTeachers')}</Text>
          <TouchableOpacity
            onPress={() => (navigation.getParent() as any)?.navigate('Booking' as never, { screen: Routes.TeacherList } as never)}
            activeOpacity={0.7}
            style={styles.seeAllRow}
          >
            <Text style={styles.seeAll}>{t('home.student.seeAll')}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teachersRow}
          style={{ marginHorizontal: -24 }}
        >
          {teachers.map((tch) => {
            const hasRating = typeof tch.rating === 'number' && tch.rating > 0;
            // Fənlər — kartın alt sətrində (nümunədəki kimi vergüllə).
            const subjectLabel = tch.subjects?.length
              ? tch.subjects.slice(0, 2).join(', ')
              : t('home.student.variousSubjects');
            const reviewCount = (tch as any).ratingCount ?? (tch as any).reviewCount ?? 0;
            const rate = typeof tch.hourlyRate === 'number' && tch.hourlyRate > 0 ? tch.hourlyRate : null;
            const avatarUrl = (tch as any).avatarUrl as string | undefined;
            const gnd = ((tch as any).gender ?? '').toLowerCase();
            const genderIcon = gnd === 'female' ? 'woman' : gnd === 'male' ? 'man' : 'person';
            const genderGrad: [string, string] = gnd === 'female' ? ['#F472B6', '#DB2777'] : gnd === 'male' ? ['#38BDF8', '#0077b6'] : [Colors.gradientStart, Colors.gradientEnd];
            const goToTeacher = () => (navigation.getParent() as any)?.navigate('Booking' as never, { screen: Routes.TeacherProfile, params: { teacher: tch } } as never);
            return (
              <TouchableOpacity
                key={tch.id}
                style={styles.teacherCardRich}
                activeOpacity={0.9}
                onPress={goToTeacher}
              >
                {/* Şəkil — kartın yuxarı hissəsi. Şəkil TAM görünür (contain),
                    yanlarda ağ boşluq qalmasın deyə arxada həmin şəklin bulanıq
                    surəti fon kimi çəkilir. */}
                {avatarUrl ? (
                  <View style={styles.teacherPhoto}>
                    <Image
                      source={{ uri: avatarUrl }}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                      blurRadius={14}
                    />
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.teacherPhotoImg}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <LinearGradient
                    colors={genderGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.teacherPhoto}
                  >
                    <Ionicons name={genderIcon as any} size={44} color="rgba(255,255,255,0.95)" />
                  </LinearGradient>
                )}

                <View style={styles.teacherCardBody}>
                  {/* Ad + təsdiq nişanı, sağda reytinq və rəy sayı */}
                  <View style={styles.teacherTopRow}>
                    <Text style={styles.teacherNameRich} numberOfLines={1}>{shortName(tch.name)}</Text>
                    {(tch as any).verified && (
                      <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                    )}
                    <View style={{ flex: 1 }} />
                    <View style={styles.teacherMetric}>
                      <Ionicons name="star" size={12} color={Colors.primary} />
                      <Text style={styles.teacherMetricText}>
                        {hasRating ? tch.rating!.toFixed(1) : ((tch as any).isNew ? t('home.student.newTeacher') : '—')}
                      </Text>
                    </View>
                    <View style={styles.teacherMetric}>
                      <Ionicons name="chatbubble" size={11} color={Colors.primary} />
                      <Text style={styles.teacherMetricText}>{reviewCount}</Text>
                    </View>
                  </View>

                  {/* Fənlər + saatlıq qiymət */}
                  <View style={styles.teacherBottomRow}>
                    <Text style={styles.teacherSubjectRich} numberOfLines={1}>{subjectLabel}</Text>
                    {rate != null && (
                      <Text style={styles.teacherPrice}>{rate.toFixed(2)} ₼</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </>
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
            { text: t('home.interest.buyPlan'), onPress: () => navigation.navigate(premiumRouteFor('teacher')) },
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
          // ════════════════ MÜƏLLİM İŞ PANELİ ════════════════
          // Bütün məzmun `TeacherWorkspace` komponentindədir (§26 FAZA 2-6).
          // Salamlama, qazanc kartı, statistik KPI kartları və sabit AI mətni
          // BURADAN ÇIXARILIB — qazanc/statistika Profil bölməsindədir.
          <>
            {/* "Müəllimlər" zolağı sürətli keçidlərin DƏRHAL altındadır —
                ona görə iş panelinin içinə prop kimi ötürülür. */}
            <TeacherWorkspace
              navigation={navigation}
              afterQuickActions={renderTeachersSection()}
            />

            {/* 🔥 Şagirdlərin sevdiyi imtahanlar — müəllim üçün CTA
                «İmtahana bax» (başlatma yoxdur). */}
            <ExamHighlights navigation={navigation} role="teacher" />

            {/* ⚠️ "Günün çağırışı" kartı burada GÖSTƏRİLMİR — o, şagird
                funksiyasıdır (gündəlik imtahan + xal). Yalnız şagird
                görünüşündə qalır. */}
            <View style={styles.sharedSections}>
              {renderOpenRequests()}
            </View>
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
            {/* Başlanğıc yol xəritəsi — yeni istifadəçini ilk addımlara yönləndirir */}
            {showGetStarted && (
              <GetStartedCard steps={getStartedSteps} onDismiss={getStarted.dismiss} />
            )}

            {/* İxtisaslar — fənn üzrə müəllim filtri (öz başlığı ilə ayrıca bölmə) */}
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>{t('home.student.specializations')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.specRow}
              style={{ marginHorizontal: -24 }}
            >
              {specializations.map((subj) => (
                <TouchableOpacity
                  key={subj}
                  style={styles.specItem}
                  activeOpacity={0.7}
                  onPress={() =>
                    (navigation.getParent() as any)?.navigate('Booking' as never, {
                      screen: Routes.TeacherList,
                      params: { subject: subj },
                    } as never)
                  }
                >
                  <View style={styles.specCircle}>
                    <SubjectIconView subject={subj} iconUrl={specIconMap.get(normSubject(subj))} />
                  </View>
                  <Text
                    style={styles.specLabel}
                    numberOfLines={2}
                    // Uzun fənn adları ("Məktəbəqədər hazırlıq") dar sütunda
                    // sözün ORTASINDAN qırılmasın deyə yalnız həmin etiketlər
                    // bir az kiçilir; qısa adlar 11px ölçüsündə qalır.
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {subj}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {renderTeachersSection()}

            {/* ⚡ Günün çağırışı — köhnə böyük "Biliklərini yoxlamağa hazırsan?"
                bannerinin yerinə. Kompaktdır, məzmunu serverdən gəlir. */}
            <DailyChallengeCard
              loading={dcLoading}
              challenge={dailyChallenge?.challenge ?? null}
              result={dailyChallenge?.result ?? null}
              starting={dcStarting}
              onStart={startChallenge}
              onSeeExams={goToExams}
            />

            {/* 🎯 Sənin üçün + 🔥 Populyar imtahanlar + 🏆 Reytinqini yüksəlt.
                Seçim serverdə edilir (sinif · zəif fənn · hədəf · populyarlıq),
                ana səhifə bütün imtahanları YÜKLƏMİR. */}
            <ExamHighlights
              navigation={navigation}
              role="student"
              grade={myGrade}
              goal={myGoal}
            />

            {/* Quick Actions */}
            <View style={styles.quickSectionHeader}>
              <Ionicons name="flash-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t('home.student.quickLinks')}</Text>
              {/* İkinci sıranı aç/bağla — qapalı halda o sıra ümumiyyətlə render olunmur */}
              <TouchableOpacity
                style={styles.quickToggle}
                activeOpacity={0.7}
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.create(180, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity),
                  );
                  setQuickExpanded((v) => !v);
                }}
              >
                <Text style={styles.quickToggleText}>
                  {quickExpanded ? t('home.student.showLess') : t('home.student.seeAll')}
                </Text>
                <Ionicons name={quickExpanded ? 'chevron-up' : 'arrow-forward'} size={13} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {/* Əsas 4 qısayol — imtahan/AI/müəllim onsuz da banner və alt naviqasiyada var */}
            <View style={styles.quickRow}>
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
                onPress={() => (navigation.getParent() as any)?.navigate('Calculators' as never)}
              >
                <LinearGradient colors={['#d97706', '#fbbf24']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickItemIcon, { shadowColor: '#d97706' }]}>
                  <Ionicons name="calculator" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickItemLabel}>{t('home.student.qCalc')}</Text>
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

            {/* İkinci dərəcəli qısayollar — yalnız "Hamısına bax" açılanda render olunur */}
            {quickExpanded && (
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
                onPress={() => (navigation.getParent() as any)?.navigate('Bookmarks' as never)}
              >
                <LinearGradient colors={['#db2777', '#f472b6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickItemIcon, { shadowColor: '#db2777' }]}>
                  <Ionicons name="bookmark" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickItemLabel}>{t('home.student.qSaved')}</Text>
              </TouchableOpacity>
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

            {/* Açıq dərs sorğuları — AI tədris planından sonra */}
            {renderOpenRequests()}

            {/* ⚠️ Köhnə "Yarışlar" kartı (sabit "Riyaziyyat Olimpiadası ·
                son qeydiyyat 25 iyun" mətni) BURADAN ÇIXARILDI — bazada belə
                bir yarış yox idi, uydurma məzmun idi. Onun yerini yuxarıdakı
                «🏆 Reytinqini yüksəlt» bölməsi tutur: o, yalnız REAL, aktiv
                imtahan sessiyası (aylıq / respublika) olduqda görünür. */}

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
                      {s.avatarUrl ? (
                        <Image source={{ uri: s.avatarUrl }} style={styles.leaderAvatar} />
                      ) : (
                        <View style={styles.leaderAvatar} />
                      )}
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

  // İş panelindən sonra gələn ortaq bölmələr (Müəllimlər / Günün çağırışı /
  // Açıq sorğular) — panelin son kartı ilə arasında aydın ayırıcı boşluq.
  sharedSections: { marginTop: 28 },

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
  seeAllRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  // ── Teacher: Empty states ──────────────────────────────────────────────

  // ── Greeting ───────────────────────────────────────────────────────────
  greetSection: { marginBottom: 20 },
  greetTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  greetSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  // ── Teacher: Earnings Card ─────────────────────────────────────────────

  // ── Teacher: Quick Actions ─────────────────────────────────────────────

  // ── Teacher: Stats ─────────────────────────────────────────────────────
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  // ── Teacher: AI Insight ────────────────────────────────────────────────

  // ── Teacher: Sinif Qiymət Kalkulyatoru kartı ───────────────────────────

  // ── Teacher: Sual Bazarı kartı ─────────────────────────────────────────

  // ── Teacher: Requests ──────────────────────────────────────────────────

  // ── Teacher: Lessons ───────────────────────────────────────────────────

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

  // ── İxtisaslar zolağı ──────────────────────────────────────────────────
  // marginBottom 28 → aşağıdakı "Müəllimlər" bölməsi ilə bitişik görünməsin.
  // Dairələr arası REAL məsafə = (specItem.width - specCircle 64) + specRow.gap.
  // Əvvəl (84-64)+14 = 34dp idi — dairənin yarısı qədər boşluq. İndi gap 0 → 20dp.
  // `width: 84` saxlanılır, çünki daraltsaq "Məktəbəqədər" etiketi sözün ORTASINDAN
  // qırılır; boşluğu eni deyil, gap-ı azaltmaqla yığırıq.
  specRow: { paddingHorizontal: 24, paddingBottom: 4, gap: 0, marginBottom: 28 },
  specItem: { width: 84, alignItems: 'center', gap: 6 },
  specCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  specEmoji: { fontSize: 30 },
  // Admin ikonu — dairənin içində, kəsilmədən (contain) yerləşir.
  specImage: { width: 36, height: 36 },
  specLabel: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },

  // ── Müəllim kartı (böyük şəkil + ad/reytinq + fənn/qiymət) ─────────────
  teachersSkeletonRow: { flexDirection: 'row', gap: 12, overflow: 'hidden' },
  teacherCardRich: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  teacherPhoto: {
    width: '100%', height: 104,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  teacherPhotoImg: { width: '100%', height: '100%' },
  teacherCardBody: { paddingHorizontal: 12, paddingTop: 10, gap: 6 },
  teacherTopRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  teacherNameRich: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, flexShrink: 1 },
  teacherMetric: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  teacherMetricText: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },
  teacherBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  teacherSubjectRich: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  teacherPrice: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },

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

  // ⚠️ «Yarışlar» kartının stilləri silindi — kartın özü (uydurma olimpiada
  // mətni) çıxarıldı, yerini `ExamHighlights`-dakı real yarış bölməsi tutdu.

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
  quickToggle: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' },
  quickToggleText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  quickItem: { flex: 1, alignItems: 'center', gap: 8 },
  quickItemIcon: {
    width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 4,
  },
  quickItemLabel: { fontSize: 9, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', lineHeight: 13 },

  // ── Student: Today's Tasks ─────────────────────────────────────────────

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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 20 },
  headIconChip: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#EC4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 7, elevation: 3,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  sectionSub: { fontSize: 11, color: Colors.textSecondary, flexShrink: 1 },
  proPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 3,
  },
  proPillText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.6 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  card: {
    width: 240, backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 14, paddingTop: 18, gap: 8,
    overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 18, elevation: 3,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 5 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subjectChip: { backgroundColor: Colors.primaryLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  subjectChipText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 0.4 },
  gradeText: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  cardTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, lineHeight: 20, minHeight: 40 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardMetaText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary, flex: 1 },
  interestBtn: {
    marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 12, paddingVertical: 11,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.28, shadowRadius: 9, elevation: 3,
  },
  interestBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
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
