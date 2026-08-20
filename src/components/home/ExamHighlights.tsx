import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import Skeleton from '../common/Skeleton';
import { rs } from '../../utils/responsive';
import { getExamHomeFeed, getUpcomingExamEvents, type HomeFeedExam } from '../../api/exam.api';
import { getTopicStats } from '../../api/topicStats.api';

/**
 * ═══════════════════════════════════════════════════════════════════
 *  ANA SƏHİFƏ — İMTAHAN KARTLARI
 * ═══════════════════════════════════════════════════════════════════
 *
 * Şagird görünüşü:
 *   🎯 Sənin üçün        — fərdiləşdirilmiş seçim (maks. 3 kart)
 *   🔥 Populyar imtahanlar — real iştirak sayına görə (maks. 3 kart)
 *   🏆 Reytinqini yüksəlt  — YALNIZ real, aktiv imtahan sessiyası varsa
 *
 * Müəllim görünüşü:
 *   🔥 Şagirdlərin sevdiyi imtahanlar — CTA «İmtahana bax» (başlatma yoxdur)
 *
 * ⚠️ Yeni imtahan sistemi YARADILMIR. Kart mövcud `ExamDetail` ekranına
 * aparır; başlatma, abunəlik/limit yoxlaması və XP hesablaması olduğu kimi
 * mövcud axında qalır.
 *
 * ⚠️ Bütün rəqəmlər REALDIR. İştirakçı sayı `exam_results` aqreqasiyasıdır,
 * `maxXp` isə serverdəki XP qaydalarının eyni düsturu ilə hesablanır.
 * İmtahanlar üçün ulduz reytinqi bazada SAXLANMIR — ona görə ⭐ yerinə
 * iştirakçıların ortalama nəticəsi göstərilir.
 */

interface Props {
  navigation: any;
  role: 'student' | 'teacher';
  /** Şagirdin profilindəki sinif — fərdiləşdirmə üçün (varsa). */
  grade?: string;
  /** Şagirdin hədəfi ('abituriyent' | 'MIQ' | ...) — kateqoriya uyğunluğu üçün. */
  goal?: string;
}

const PAGE_PAD = rs(20);
const GAP = 12;
/** Bir kart tam, növbətinin kənarı görünsün (§1 — 1–1.2 kart). */
const CARD_W = Math.min(
  330,
  Math.round(Dimensions.get('window').width - PAGE_PAD * 2 - 34),
);

const GRADE_ORDINAL: Record<number, string> = {
  1: '1-ci', 2: '2-ci', 3: '3-cü', 4: '4-cü', 5: '5-ci', 6: '6-cı',
  7: '7-ci', 8: '8-ci', 9: '9-cu', 10: '10-cu', 11: '11-ci',
};

/** Fənn çipinin rəngi — fənn adına görə sabit (hər açılışda eyni). */
const SUBJECT_TONES: { soft: string; tint: string }[] = [
  { soft: '#EEF2FF', tint: '#4F46E5' },
  { soft: '#ECFEFF', tint: '#0E7490' },
  { soft: '#FFF7ED', tint: '#C2410C' },
  { soft: '#ECFDF5', tint: '#047857' },
  { soft: '#FDF2F8', tint: '#BE185D' },
];
const toneFor = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return SUBJECT_TONES[h % SUBJECT_TONES.length];
};

export default function ExamHighlights({ navigation, role, grade, goal }: Props) {
  const { t, language } = useTranslation();
  const isTeacher = role === 'teacher';

  // Zəif fənlər — ana səhifədə onsuz da çəkilən sorğu (eyni açar → əlavə
  // şəbəkə çağırışı yaranmır). Müəllimdə istifadə olunmur.
  const { data: topicStats } = useQuery({
    queryKey: ['topicStats'],
    queryFn: getTopicStats,
    enabled: !isTeacher,
    staleTime: 10 * 60_000,
  });
  const weak = (topicStats?.weak ?? []).slice(0, 3).join(',');

  const {
    data: feed,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['exam-home-feed', role, grade ?? '', weak, language],
    queryFn: () =>
      getExamHomeFeed({
        grade,
        goal,
        weak: weak || undefined,
        limit: 3,
        mode: role,
        lang: language,
      }),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  // 🏆 Yarış — mövcud, admin-idarəli imtahan sessiyaları (aylıq / respublika).
  // Eyni sorğu açarı imtahan siyahısı ekranında da işlənir (keş paylaşılır).
  const { data: events } = useQuery({
    queryKey: ['upcomingExamEvents'],
    queryFn: getUpcomingExamEvents,
    enabled: !isTeacher,
    staleTime: 5 * 60_000,
    retry: false,
  });
  const liveEvent = useMemo(() => {
    const list = [events?.monthly, events?.national].filter(Boolean) as NonNullable<
      typeof events
    >['monthly'][];
    return (
      list.filter((e) => e && e.status !== 'ended').sort(
        (a, b) => new Date(a!.startAt).getTime() - new Date(b!.startAt).getTime(),
      )[0] ?? null
    );
  }, [events]);

  // ── Naviqasiya (mövcud route-lar; yeni axın yaradılmır) ──
  const goExamsTab = (screen?: string, params?: any) =>
    (navigation.getParent() as any)?.navigate(
      'Exams',
      screen ? { screen, params } : undefined,
    );
  const openExam = (e: HomeFeedExam) =>
    goExamsTab(Routes.ExamDetail, { examId: e.id, title: e.title });
  const openAll = () => goExamsTab();
  const openEvent = () =>
    liveEvent &&
    goExamsTab(Routes.MonthlyExamDetail, { eventId: liveEvent.id, title: liveEvent.title });

  // ── Etiket köməkçiləri ──
  const gradeLabel = (g: string | null) => {
    const n = Number(String(g ?? '').match(/\d+/)?.[0]);
    if (!Number.isFinite(n) || n < 1) return null;
    return language === 'az'
      ? t('home.exams.gradeAz', { g: GRADE_ORDINAL[n] ?? String(n) })
      : t('home.exams.grade', { n });
  };
  const countLabel = (n: number) =>
    n.toLocaleString(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'az-AZ');

  /** Karta maksimum 2 nişan (§5) — prioritet: uyğunluq → populyar → yeni. */
  const badgesFor = (e: HomeFeedExam, section: 'forYou' | 'popular') => {
    const out: { text: string; bg: string; fg: string }[] = [];
    if (section === 'forYou' && (e.matchesGrade || e.matchesWeak)) {
      out.push({ text: t('home.exams.badgeForYou'), bg: '#EEF2FF', fg: '#4338CA' });
    }
    if (e.participants >= 10) {
      out.push({ text: t('home.exams.badgePopular'), bg: '#FFF1F2', fg: '#BE123C' });
    }
    if (out.length < 2 && e.isNew) {
      out.push({ text: t('home.exams.badgeNew'), bg: '#ECFDF5', fg: '#047857' });
    }
    return out.slice(0, 2);
  };

  // ── Tək kart ──
  const renderCard = (e: HomeFeedExam, section: 'forYou' | 'popular') => {
    const tone = toneFor(e.subject);
    const gl = gradeLabel(e.grade);
    const badges = badgesFor(e, section);
    const cta = isTeacher
      ? t('home.exams.ctaTeacher')
      : e.completed
        ? t('home.exams.ctaRetry')
        : t('home.exams.ctaStart');

    return (
      <TouchableOpacity
        key={e.id}
        style={s.card}
        activeOpacity={0.9}
        onPress={() => openExam(e)}
      >
        {/* Məzmun bloku — `flex: 1` ilə artıq boşluğu udur, beləcə CTA
            HƏMİŞƏ məzmunun ALTINDA qalır. (Əvvəl CTA-da `marginTop: 'auto'`
            vardı; kart yan-yana sıralanıb ən hündürünə bərabərləşəndə
            auto-marja mənfi hesablanıb düyməni statistika sətrinin üstünə
            çəkirdi.) */}
        <View style={s.cardBody}>
        {/* Üst hissə — fənn çipi + status nişanı */}
        <View style={s.cardTop}>
          <View style={[s.subjectChip, { backgroundColor: tone.soft }]}>
            <Text style={[s.subjectChipText, { color: tone.tint }]} numberOfLines={1}>
              {e.subject}
            </Text>
          </View>
          {badges.map((b) => (
            <View key={b.text} style={[s.badge, { backgroundColor: b.bg }]}>
              <Text style={[s.badgeText, { color: b.fg }]}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Orta hissə — ad + əsas məlumatlar */}
        <Text style={s.cardTitle} numberOfLines={2}>{e.title}</Text>
        <Text style={s.cardMeta} numberOfLines={1}>
          {[gl, t('home.exams.questions', { n: e.questionCount }), t('home.exams.minutes', { n: e.duration })]
            .filter(Boolean)
            .join(' · ')}
        </Text>

        {/* Aşağı hissə — sosial sübut + XP */}
        <View style={s.statRow}>
          {e.participants > 0 && (
            <View style={s.stat}>
              <Ionicons name="people" size={13} color={Colors.textSecondary} />
              <Text style={s.statText} numberOfLines={1}>
                {t('home.exams.participants', { n: countLabel(e.participants) })}
              </Text>
            </View>
          )}
          {/* Müəllimə XP yox, imtahanın çətinliyi (ortalama nəticə) daha faydalıdır. */}
          {isTeacher
            ? e.avgPct > 0 && (
                <View style={s.stat}>
                  <Ionicons name="stats-chart" size={13} color={Colors.textSecondary} />
                  <Text style={s.statText}>{t('home.exams.avgPct', { n: e.avgPct })}</Text>
                </View>
              )
            : e.maxXp > 0 && (
                <View style={s.stat}>
                  <Ionicons name="trophy" size={13} color="#D97706" />
                  <Text style={[s.statText, { color: '#B45309', fontWeight: '800' }]}>
                    {t('home.exams.maxXp', { n: e.maxXp })}
                  </Text>
                </View>
              )}
        </View>

          {/* Əvvəl həll edilibsə real nəticəni göstər (§14) */}
          {!isTeacher && e.completed && e.lastPct != null && (
            <Text style={s.doneNote}>{t('home.exams.yourResult', { n: e.lastPct })}</Text>
          )}
        </View>

        {/* CTA — kartın ən diqqətçəkən elementi */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.cta}
        >
          <Text style={s.ctaText} numberOfLines={1}>{cta}</Text>
          <Ionicons name="arrow-forward" size={15} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // ── Bölmə başlığı ──
  const renderHead = (
    icon: keyof typeof Ionicons.glyphMap,
    grad: [string, string],
    title: string,
    sub: string,
    onSeeAll?: () => void,
  ) => (
    <View style={s.head}>
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.headIcon}>
        <Ionicons name={icon} size={18} color="#fff" />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        {/* Uzun başlıqlar («Şagirdlərin sevdiyi imtahanlar») kəsilməsin. */}
        <Text style={s.headTitle} numberOfLines={2}>{title}</Text>
        <Text style={s.headSub} numberOfLines={1}>{sub}</Text>
      </View>
      {!!onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={8} activeOpacity={0.7}>
          <Text style={s.seeAll}>{t('home.exams.seeAll')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ── Yan-yana sürüşən sıra ──
  const renderRail = (items: HomeFeedExam[], section: 'forYou' | 'popular') => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      /* `snapToOffsets` — 0 mövqeyi də etibarlı dayanacaqdır, birinci kart
         ilk render-də kənarda qalmır. */
      snapToOffsets={items.map((_, i) => i * (CARD_W + GAP))}
      decelerationRate="fast"
      disableIntervalMomentum
      style={s.railBleed}
      contentContainerStyle={s.rail}
    >
      {items.map((e) => renderCard(e, section))}
    </ScrollView>
  );

  if (isError) {
    return (
      <View style={s.stateCard}>
        <Ionicons name="cloud-offline-outline" size={20} color={Colors.danger} />
        <Text style={s.stateTitle}>{t('home.exams.errorTitle')}</Text>
        <TouchableOpacity style={s.stateBtn} activeOpacity={0.85} onPress={() => refetch()}>
          <Ionicons name="refresh" size={14} color={Colors.primary} />
          <Text style={s.stateBtnText}>{t('home.exams.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <>
        {renderHead(
          isTeacher ? 'flame' : 'sparkles',
          isTeacher ? ['#F97316', '#EF4444'] : ['#6366F1', '#8B5CF6'],
          isTeacher ? t('home.exams.teacherTitle') : t('home.exams.forYouTitle'),
          isTeacher ? t('home.exams.teacherSub') : t('home.exams.forYouSub'),
        )}
        <View style={s.skeletonRow}>
          {[0, 1].map((i) => (
            <View key={i} style={s.skeletonCard}>
              <Skeleton width={'55%'} height={12} />
              <Skeleton width={'88%'} height={18} style={{ marginTop: 10 }} />
              <Skeleton width={'70%'} height={12} style={{ marginTop: 8 }} />
              <View style={s.skeletonChips}>
                <Skeleton width={64} height={22} radius={999} />
                <Skeleton width={78} height={22} radius={999} />
              </View>
              <Skeleton width={'100%'} height={38} radius={999} style={{ marginTop: 14 }} />
            </View>
          ))}
        </View>
      </>
    );
  }

  const forYou = feed?.forYou ?? [];
  const popular = feed?.popular ?? [];

  // Sistemdə ümumiyyətlə uyğun imtahan yoxdursa boş sahə buraxma — heç nə çəkilmir.
  if (forYou.length === 0 && popular.length === 0) return null;

  return (
    <>
      {/* ══════════ ŞAGİRD: 🎯 Sənin üçün ══════════ */}
      {!isTeacher && forYou.length > 0 && (
        <>
          {renderHead(
            'sparkles',
            ['#6366F1', '#8B5CF6'],
            t('home.exams.forYouTitle'),
            t('home.exams.forYouSub'),
            openAll,
          )}
          {renderRail(forYou, 'forYou')}
        </>
      )}

      {/* ══════════ 🔥 Populyar / Şagirdlərin sevdiyi ══════════ */}
      {popular.length > 0 && (
        <>
          {renderHead(
            'flame',
            ['#F97316', '#EF4444'],
            isTeacher ? t('home.exams.teacherTitle') : t('home.exams.popularTitle'),
            isTeacher ? t('home.exams.teacherSub') : t('home.exams.popularSub'),
            openAll,
          )}
          {renderRail(popular, 'popular')}
        </>
      )}

      {/* ══════════ 🏆 Reytinqini yüksəlt — YALNIZ real yarış varsa ══════════ */}
      {!isTeacher && liveEvent && (
        <>
          {renderHead(
            'trophy',
            ['#F59E0B', '#D97706'],
            t('home.exams.competitionTitle'),
            t('home.exams.competitionSub'),
          )}
          <TouchableOpacity style={s.eventCard} activeOpacity={0.9} onPress={openEvent}>
            <View style={s.eventIcon}>
              <Ionicons name="trophy" size={20} color="#B45309" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.eventTitle} numberOfLines={1}>{liveEvent.title}</Text>
              <Text style={s.eventSub} numberOfLines={1}>
                {liveEvent.status === 'live'
                  ? t('home.exams.eventLive')
                  : t('home.exams.eventStarts', {
                      d: new Date(liveEvent.startAt).toLocaleDateString(
                        language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'az-AZ',
                        { day: 'numeric', month: 'long' },
                      ),
                    })}
                {liveEvent.participantCount > 0
                  ? ` · ${t('home.exams.participants', { n: countLabel(liveEvent.participantCount) })}`
                  : ''}
              </Text>
            </View>
            <View style={s.eventBtn}>
              <Text style={s.eventBtnText}>{t('home.exams.ctaEvent')}</Text>
              <Ionicons name="arrow-forward" size={13} color="#fff" />
            </View>
          </TouchableOpacity>
        </>
      )}
    </>
  );
}

const CARD = {
  backgroundColor: Colors.surface,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: Colors.borderLight,
  shadowColor: '#0f172a',
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
} as const;

const s = StyleSheet.create({
  // ── Bölmə başlığı ──
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22, marginBottom: 12 },
  headIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headTitle: { fontSize: 16.5, fontWeight: '800', color: Colors.textPrimary, lineHeight: 21 },
  headSub: { fontSize: 11.5, color: Colors.textMuted, marginTop: 1 },
  seeAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // ── Sürüşən sıra ──
  railBleed: { marginHorizontal: -PAGE_PAD },
  rail: { paddingHorizontal: PAGE_PAD, gap: GAP, paddingBottom: 4 },

  // ── İmtahan kartı ──
  // Hündürlük verilmir: sıradakı kartlar avtomatik bərabərləşir (stretch),
  // CTA isə `marginTop: auto` ilə dibə yapışır.
  card: { ...CARD, width: CARD_W, padding: 14 },
  // `flexGrow` (flex:1 deyil) — ölçmə mərhələsində məzmun hündürlüyü qorunur,
  // yalnız ARTIQ boşluq bura verilir; kart sıxılıb məzmunu kəsmir.
  cardBody: { flexGrow: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  subjectChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, flexShrink: 1 },
  subjectChipText: { fontSize: 11.5, fontWeight: '800' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 9.5, fontWeight: '900', letterSpacing: 0.3 },

  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginTop: 10, lineHeight: 21 },
  cardMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 5 },

  statRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 },
  statText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, flexShrink: 1 },
  doneNote: { fontSize: 11.5, fontWeight: '700', color: Colors.tertiary, marginTop: 8 },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 42, borderRadius: 12, marginTop: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 7, elevation: 3,
  },
  ctaText: { fontSize: 13.5, fontWeight: '800', color: '#fff', flexShrink: 1 },

  // ── Yarış kartı ──
  eventCard: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  eventIcon: {
    width: 40, height: 40, borderRadius: 13, backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center',
  },
  eventTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  eventSub: { fontSize: 11.5, color: Colors.textMuted, marginTop: 2 },
  eventBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: 11,
    paddingHorizontal: 12, paddingVertical: 9,
  },
  eventBtnText: { fontSize: 12.5, fontWeight: '800', color: '#fff' },

  // ── Yüklənmə / xəta ──
  skeletonRow: { flexDirection: 'row', gap: GAP, overflow: 'hidden' },
  // Kartın SON formasını təkrarlayır → məzmun gələndə səhifə tullanmır.
  skeletonCard: { ...CARD, width: CARD_W, padding: 14, shadowOpacity: 0, elevation: 0 },
  skeletonChips: { flexDirection: 'row', gap: 8, marginTop: 12 },
  stateCard: { ...CARD, alignItems: 'center', gap: 8, paddingVertical: 22, marginTop: 22 },
  stateTitle: { fontSize: 13.5, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  stateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stateBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
