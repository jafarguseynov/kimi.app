import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import Skeleton from '../common/Skeleton';
import { rs } from '../../utils/responsive';
import { useBadges } from '../../hooks/useBadges';
import { useTeacherProfileCompletion } from '../../hooks/useTeacherProfileCompletion';
import { getTeacherBookings, type Booking } from '../../api/booking.api';
import UnreadDot from '../common/UnreadDot';

/**
 * ═══════════════════════════════════════════════════════════════════
 *  MÜƏLLİM İŞ PANELİ (Teacher Workspace) — ana səhifənin müəllim görünüşü
 * ═══════════════════════════════════════════════════════════════════
 *
 * Panelin yeganə məqsədi bir suala cavab verməkdir:
 *   «Bu gün mənə kim müraciət edib və nə edim?»
 *
 * Struktur (yuxarıdan aşağı):
 *   1. Sürətli keçidlər
 *   2. «Müəllimlər» zolağı (`afterQuickActions` propu ilə ötürülür)
 *   3. «Yeni sorğular» — gözləyən dərs müraciətləri (kompakt sətirlər;
 *      sətrə/oxa toxunmaq «Dərs müraciətləri» ekranını açır, qəbul/imtina
 *      orada edilir)
 *   4. «Sizin üçün» — aşağı prioritetli tövsiyələr
 *
 * ⚠️ «Sizə uyğun şagirdlər» (matched lesson requests) BURADAN ÇIXARILIB —
 * ana səhifənin aşağısında onsuz da «Açıq dərs sorğuları» bölməsi var idi,
 * iki eyni məzmunlu sorğu siyahısı təkrar idi. Bununla birlikdə
 * `matched-lesson-requests` sorğusu da getmir (bir şəbəkə çağırışı az).
 *
 * ⚠️ Salamlama, qazanc və statistika (profil baxışı daxil) BURADA
 * GÖSTƏRİLMİR — onlar Profil → Qazanc / Statistika bölmələrindədir.
 */

interface Props {
  navigation: any;
  /**
   * Sürətli keçidlərdən DƏRHAL sonra göstərilən əlavə blok.
   * Hazırda ana səhifə buraya "Müəllimlər" zolağını verir — həmin zolaq
   * `HomeScreen`-də qurulur (şagird görünüşü ilə eyni kod), burada isə
   * yalnız yerləşdiyi mövqe təyin olunur.
   */
  afterQuickActions?: React.ReactNode;
}

/** Backend `student` əlaqəsini tam obyekt kimi qaytarır (avatar + createdAt). */
type TeacherBooking = Booking & {
  createdAt?: string;
  student?: Booking['student'] & { avatarUrl?: string | null };
};

// ── «Yeni sorğular» siyahısı ──────────────────────────────────────────
/** Ana səhifədə göstərilən maksimum sətir (qalanı «Hamısına bax»-dadır). */
const MAX_ROWS = 2;
/** Avatar halqasının rəngi — bütün sətirlərdə eyni (siyahı sakit görünsün). */
const AVATAR_GRAD: [string, string] = ['#8B5CF6', '#A855F7'];

// ── Sürətli keçidlər ──────────────────────────────────────────────────
type QuickTarget = 'requests' | 'lessonRequest' | 'openRequests' | 'chat' | 'marketplace' | 'calculators';

const QUICK_ACTIONS: {
  target: QuickTarget;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  grad: [string, string];
  shadow: string;
}[] = [
  { target: 'requests', icon: 'help-circle', labelKey: 'home.qa.requests', grad: ['#0EA5E9', '#2563EB'], shadow: '#0EA5E9' },
  { target: 'lessonRequest', icon: 'document-text', labelKey: 'home.qa.lessonRequest', grad: ['#F59E0B', '#F97316'], shadow: '#F59E0B' },
  { target: 'openRequests', icon: 'megaphone', labelKey: 'home.qa.openRequests', grad: ['#EC4899', '#DB2777'], shadow: '#EC4899' },
  { target: 'chat', icon: 'chatbubble-ellipses', labelKey: 'home.qa.chat', grad: ['#10B981', '#059669'], shadow: '#10B981' },
  { target: 'marketplace', icon: 'chatbubbles', labelKey: 'home.qa.marketplace', grad: ['#8B5CF6', '#6D28D9'], shadow: '#8B5CF6' },
  { target: 'calculators', icon: 'apps', labelKey: 'home.qa.calculators', grad: ['#14B8A6', '#0D9488'], shadow: '#14B8A6' },
];

export default function TeacherWorkspace({ navigation, afterQuickActions }: Props) {
  const { t } = useTranslation();
  const badges = useBadges();

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['teacher-bookings-home'],
    queryFn: getTeacherBookings,
    staleTime: 60_000,
  });
  // ⚠️ `teacher-analytics` sorğusu bu ekrandan ÇIXARILIB — profil baxışı
  // statistikası artıq burada göstərilmir (Profil → Statistika-dadır).

  const { missing, complete, isLoading: completionLoading } = useTeacherProfileCompletion();

  const pending = useMemo(
    () => (bookings as TeacherBooking[]).filter((b) => b.status === 'pending'),
    [bookings],
  );
  const visible = pending.slice(0, MAX_ROWS);

  // ── Naviqasiya köməkçiləri ──
  const parent = () => navigation.getParent() as any;
  const goRequestsTab = (target: 'open' | 'applications') =>
    parent()?.navigate(Routes.TeacherRequests, {
      screen: Routes.TeacherRequests,
      params: { tab: target },
    });
  const goRequests = () => goRequestsTab('open');
  const goApplications = () => goRequestsTab('applications');
  const goMessages = () => parent()?.navigate('Chat');
  const goEditProfile = () => navigation.navigate(Routes.EditProfile);

  const openQuick = (target: QuickTarget) => {
    switch (target) {
      case 'requests': return goApplications();
      case 'lessonRequest':
      case 'openRequests': return goRequests();
      case 'chat': return goMessages();
      case 'marketplace': return parent()?.navigate('Marketplace');
      case 'calculators': return parent()?.navigate('Calculators');
    }
  };

  // ── «Sizin üçün» — REAL məlumatdan qurulan tövsiyələr ───────────────
  // ⚠️ Sübutsuz statistika (məs. «20% daha çox şagird») İSTİFADƏ EDİLMİR.
  // Hər tövsiyə yalnız sistemin FAKTİKİ olaraq bildiyi bir şeyi deyir.
  const suggestions = useMemo(() => {
    const list: {
      key: string;
      icon: keyof typeof Ionicons.glyphMap;
      tint: string;
      bg: string;
      title: string;
      body: string;
      cta: string;
      onPress: () => void;
    }[] = [];

    if (!completionLoading && !complete && missing.length > 0) {
      list.push({
        key: 'profile',
        icon: 'person-circle', tint: '#2563EB', bg: '#EFF6FF',
        title: t('teacherWorkspace.sugProfileTitle'),
        body: t('teacherWorkspace.sugProfileBody', { n: missing.length }),
        cta: t('teacherWorkspace.sugProfileCta'),
        onPress: goEditProfile,
      });
    }

    if (badges.messages > 0) {
      list.push({
        key: 'messages',
        icon: 'chatbubble-ellipses', tint: '#059669', bg: '#ECFDF5',
        title: t('teacherWorkspace.sugMessagesTitle'),
        body: t('teacherWorkspace.sugMessagesBody', { n: badges.messages }),
        cta: t('teacherWorkspace.sugMessagesCta'),
        onPress: goMessages,
      });
    }

    return list.slice(0, 2);
  }, [complete, completionLoading, missing.length, badges.messages, t]);

  return (
    <>
      {/* ══════════════ 1. SÜRƏTLİ KEÇİDLƏR ══════════════ */}
      <View style={s.quickActions}>
        {QUICK_ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.target}
            style={s.quickActionItem}
            activeOpacity={0.7}
            onPress={() => openQuick(a.target)}
          >
            <LinearGradient
              colors={a.grad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.quickActionIcon, { shadowColor: a.shadow }]}
            >
              <Ionicons name={a.icon} size={22} color="#fff" />
              {((a.target === 'chat' && badges.messages > 0) ||
                (a.target === 'requests' && badges.requests > 0)) && (
                <UnreadDot count={1} style={{ position: 'absolute', top: -2, right: -2 }} />
              )}
            </LinearGradient>
            <Text style={s.quickActionLabel}>{t(a.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sürətli keçidlərin altındakı blok (Müəllimlər zolağı) */}
      {afterQuickActions}

      {/* ══════════════ 2. YENİ SORĞULAR ══════════════ */}
      <View style={s.sectionHead}>
        <LinearGradient
          colors={['#47b4fa', '#0b84d6']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.headIcon}
        >
          <Ionicons name="mail" size={19} color="#fff" />
        </LinearGradient>
        <Text style={s.headTitle} numberOfLines={1}>{t('teacherWorkspace.appsTitle')}</Text>
        <TouchableOpacity onPress={goApplications} hitSlop={8} activeOpacity={0.7}>
          <Text style={s.seeAll}>{t('teacherWorkspace.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      {bookingsError ? (
        <View style={s.stateCard}>
          <View style={[s.stateIcon, { backgroundColor: Colors.dangerLight }]}>
            <Ionicons name="cloud-offline-outline" size={20} color={Colors.danger} />
          </View>
          <Text style={s.stateTitle}>{t('teacherWorkspace.loadErrorTitle')}</Text>
          <TouchableOpacity style={s.stateBtn} activeOpacity={0.85} onPress={() => refetchBookings()}>
            <Ionicons name="refresh" size={14} color={Colors.primary} />
            <Text style={s.stateBtnText}>{t('teacherWorkspace.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : bookingsLoading ? (
        <>
          {[0, 1].map((i) => (
            <View key={i} style={s.skeletonRow}>
              <Skeleton width={44} height={44} radius={14} />
              <View style={s.skeletonLines}>
                <Skeleton width={'60%'} height={13} />
                <Skeleton width={'40%'} height={11} />
              </View>
            </View>
          ))}
        </>
      ) : pending.length === 0 ? (
        <View style={s.stateCard}>
          <View style={[s.stateIcon, { backgroundColor: '#FDF2F8' }]}>
            <Ionicons name="person-add-outline" size={20} color="#DB2777" />
          </View>
          <Text style={s.stateTitle}>{t('teacherWorkspace.appsEmptyTitle')}</Text>
          <Text style={s.stateSub}>{t('teacherWorkspace.appsEmptySub')}</Text>
        </View>
      ) : (
        visible.map((b) => {
          const name = b.student?.name ?? t('teacherWorkspace.student');
          const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
          const avatar = b.student?.avatarUrl;

          return (
            <TouchableOpacity key={b.id} style={s.reqCard} activeOpacity={0.85} onPress={goApplications}>
              {/* Sol kənardakı rəngli zolaq — kartın hündürlüyü boyu uzanır. */}
              <View style={s.reqAccent} />

              <View style={s.reqBody}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={s.reqAvatar} />
                ) : (
                  <LinearGradient
                    colors={AVATAR_GRAD}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[s.reqAvatar, s.reqAvatarCenter]}
                  >
                    <Text style={s.reqInitials}>{initials}</Text>
                  </LinearGradient>
                )}

                <View style={s.reqInfo}>
                  <Text style={s.reqName} numberOfLines={1}>{name}</Text>
                  <View style={s.subjectChip}>
                    <Ionicons name="book-outline" size={12} color={Colors.primary} />
                    <Text style={s.subjectChipText} numberOfLines={1}>
                      {b.subject ?? t('teacherWorkspace.generalLesson')}
                    </Text>
                  </View>
                </View>

                <View style={s.reqArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* ══════════════ 3. SİZİN ÜÇÜN (aşağı prioritet) ══════════════ */}
      {/* Tövsiyə yoxdursa bölmə ÜMUMİYYƏTLƏ göstərilmir — boş kart yer tutmasın. */}
      {suggestions.length > 0 && (
        <>
          <Text style={[s.blockTitle, { marginTop: 26, marginBottom: 12 }]}>
            {t('teacherWorkspace.forYouTitle')}
          </Text>
          {suggestions.map((sg) => (
            <TouchableOpacity key={sg.key} style={s.sugCard} activeOpacity={0.9} onPress={sg.onPress}>
              <View style={[s.sugIcon, { backgroundColor: sg.bg }]}>
                <Ionicons name={sg.icon} size={17} color={sg.tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sugTitle} numberOfLines={1}>{sg.title}</Text>
                <Text style={s.sugBody} numberOfLines={2}>{sg.body}</Text>
                <View style={s.sugCtaRow}>
                  <Text style={[s.sugCta, { color: sg.tint }]}>{sg.cta}</Text>
                  <Ionicons name="chevron-forward" size={12} color={sg.tint} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </>
  );
}

const CARD = {
  backgroundColor: Colors.surface,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: Colors.borderLight,
  shadowColor: '#0f172a',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
} as const;

const s = StyleSheet.create({
  // ── Sürətli keçidlər ──
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 26 },
  quickActionItem: { flex: 1, alignItems: 'center', gap: 8 },
  // 6 ikon var — dar Android ekranlarında (≈320dp) sabit 48dp sığmır,
  // ona görə ölçü ekran eninə görə miqyaslanır.
  quickActionIcon: {
    width: rs(48), height: rs(48), borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  quickActionLabel: {
    fontSize: 9, fontWeight: '600', color: Colors.textPrimary,
    textAlign: 'center', lineHeight: 13,
  },

  // ── Bölmə başlığı ──
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  headIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  blockTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  seeAll: { fontSize: 13.5, fontWeight: '700', color: Colors.primary },

  // ── Boş / xəta vəziyyəti ──
  stateCard: { ...CARD, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 18, gap: 8 },
  stateIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  stateSub: { fontSize: 12.5, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  stateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  stateBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  skeletonRow: {
    ...CARD, height: 78, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14,
  },
  skeletonLines: { flex: 1, gap: 8 },

  // ── Sorğu sətri ──
  // `overflow: hidden` — sol zolağın kənarları kartın radiusuna kəsilsin.
  reqCard: { ...CARD, borderRadius: 18, flexDirection: 'row', overflow: 'hidden', marginBottom: 12 },
  reqAccent: { width: 5, backgroundColor: Colors.primary },
  reqBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  reqAvatar: { width: 52, height: 52, borderRadius: 17, backgroundColor: Colors.surfaceLow },
  reqAvatarCenter: { alignItems: 'center', justifyContent: 'center' },
  reqInitials: { fontSize: 18, fontWeight: '800', color: '#fff' },
  reqInfo: { flex: 1, gap: 6 },
  reqName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  subjectChip: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
    maxWidth: '100%', backgroundColor: Colors.primaryLight,
    borderRadius: 9, paddingHorizontal: 9, paddingVertical: 4,
  },
  subjectChipText: { fontSize: 12.5, fontWeight: '700', color: Colors.primary, flexShrink: 1 },
  reqArrow: {
    width: 44, height: 44, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary,
  },

  // ── Sizin üçün ──
  sugCard: { ...CARD, flexDirection: 'row', gap: 12, padding: 12, marginBottom: 10 },
  sugIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  sugTitle: { fontSize: 13.5, fontWeight: '800', color: Colors.textPrimary },
  sugBody: { fontSize: 12, color: Colors.textMuted, marginTop: 2, lineHeight: 17 },
  sugCtaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  sugCta: { fontSize: 12, fontWeight: '800' },
});
