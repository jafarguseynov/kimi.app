import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getTeacherSlots, getTeacherReviews, getStudentBookings, TeacherSlot, Review } from '../../api/booking.api';
import { getOrCreateChat } from '../../api/chat.api';
import { recordTeacherView } from '../../api/user.api';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useRecentTeachersStore } from '../../store/recentTeachers.store';
import { useTranslation } from '../../i18n';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = Math.min(width - 40, 320);

type TFn = (key: string, vars?: Record<string, string | number>) => string;

const AVATAR_PALETTE = [
  { bg: Colors.primaryLight, text: Colors.primary },
  { bg: '#D1FAE5', text: '#059669' },
  { bg: '#FEF3C7', text: '#D97706' },
  { bg: '#FCE7F3', text: '#DB2777' },
  { bg: '#E0E7FF', text: '#4F46E5' },
];

function relativeTime(iso: string, t: TFn): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return t('booking.today');
  if (diff < 2 * day) return t('booking.yesterday');
  if (diff < 7 * day) return t('booking.daysAgo', { n: Math.floor(diff / day) });
  if (diff < 30 * day) return t('booking.weeksAgo', { n: Math.floor(diff / (7 * day)) });
  return t('booking.monthsAgo', { n: Math.floor(diff / (30 * day)) });
}

export default function TeacherProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const DAY_LABELS = t('teacherProfile.dayShort').split('|');
  const route = useRoute<any>();
  const teacher = route.params?.teacher;
  const teacherId: string | undefined = teacher?.id;
  const pushRecent = useRecentTeachersStore((s) => s.push);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (teacher?.id && teacher?.name) {
      pushRecent({
        id: teacher.id,
        name: teacher.name,
        avatarUrl: teacher.avatarUrl,
        subject: teacher.subjects?.[0],
        hourlyRate: teacher.hourlyRate,
        rating: teacher.rating,
        experience: teacher.experience,
        isVerified: teacher.isVerified,
      });
    }
    // Hər açılışda profil baxışını qeyd et (+1) → sonra siyahını yenilə ki,
    // kartdakı baxış sayı dərhal artmış görünsün.
    if (teacher?.id) {
      recordTeacherView(teacher.id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
      });
    }
  }, [teacher?.id]);

  const { data: slotsData, isLoading } = useQuery<TeacherSlot[]>({
    queryKey: ['teacherSlots', teacherId],
    queryFn: () => getTeacherSlots(teacherId as string).catch(() => [] as TeacherSlot[]),
    enabled: !!teacherId,
  });

  const { data: reviewsData } = useQuery<Review[]>({
    queryKey: ['teacherReviews', teacherId],
    queryFn: () => getTeacherReviews(teacherId as string).catch(() => [] as Review[]),
    enabled: !!teacherId,
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => getStudentBookings().catch(() => []),
  });

  const handleWriteReview = () => {
    if (!teacherId) return;
    const booking = myBookings.find((b) => b.teacher?.id === teacherId);
    if (!booking) {
      Alert.alert(
        t('booking.bookingRequired'),
        t('booking.bookingRequiredMsg'),
      );
      return;
    }
    navigation.navigate(Routes.LeaveReview, {
      bookingId: booking.id,
      teacherId,
      teacherName: teacher?.name,
      teacherSubject: booking.subject ?? teacher?.subjects?.[0],
    });
  };

  const slots: TeacherSlot[] = Array.isArray(slotsData) ? slotsData : [];
  const reviews: Review[] = Array.isArray(reviewsData) ? reviewsData : [];
  const displaySlots = slots.slice(0, 4);
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : (teacher?.rating ?? 0);
  const ratingBars = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: reviewCount > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / reviewCount) * 100) : 0,
  }));
  const topReviews = reviews.slice(0, 2);
  const initial = teacher?.name?.[0]?.toUpperCase() ?? '?';
  const subject = teacher?.subjects?.[0] ?? 'Riyaziyyat';
  const DATE_FALLBACK_DAY = t('teacherProfile.dayFallback');

  if (!teacher) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('teacherProfile.header')}</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' }}>
            {t('teacherProfile.notFound')}
          </Text>
          <Text style={{ fontSize: 13, color: Colors.textMuted, textAlign: 'center' }}>
            {t('teacherProfile.notFoundSub')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('teacherProfile.header')}</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.photoBox, { width: PHOTO_SIZE, height: PHOTO_SIZE }]}>
            {teacher?.avatarUrl ? (
              <Image source={{ uri: teacher.avatarUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.photoInitial}>{initial}</Text>
              </>
            )}
          </View>

          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{teacher?.name ?? t('booking.defaultTeacher')}</Text>
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            </View>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingVal}>{teacher?.rating?.toFixed(1) ?? '4.9'}</Text>
              <Text style={styles.ratingCount}>{t('teacherProfile.ratingCountDemo')}</Text>
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statMeta}>{t('teacherProfile.metaExperience')}</Text>
            <Text style={styles.statVal}>{t('teacherProfile.expValue')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statMeta}>{t('teacherProfile.metaPrice')}</Text>
            <Text style={styles.statVal}>{t('teacherProfile.priceValue', { rate: teacher?.hourlyRate ?? 15 })}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardWide]}>
            <View style={styles.statIconBox}>
              <Ionicons name="laptop-outline" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.statMeta}>{t('teacherProfile.metaFormat')}</Text>
              <Text style={styles.statVal}>{t('teacherProfile.formatValue')}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statMeta}>{t('teacherProfile.metaCity')}</Text>
            <Text style={styles.statVal}>{teacher?.city ?? t('teacherProfile.notSpecified')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="person-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statMeta}>{t('teacherProfile.metaAge')}</Text>
            <Text style={styles.statVal}>{teacher?.age != null ? t('teacherProfile.ageValue', { age: teacher.age }) : t('teacherProfile.notSpecified')}</Text>
          </View>
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('teacherProfile.subjectsLabel')}</Text>
          <View style={styles.subjectsRow}>
            {(teacher?.subjects?.length ? teacher.subjects : [subject, 'Cəbr', 'Həndəsə']).map((s: string) => (
              <View key={s} style={styles.subjectChip}>
                <Text style={styles.subjectChipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Biography */}
        <View style={styles.bioCard}>
          <Text style={styles.sectionLabel}>{t('teacherProfile.bioLabel')}</Text>
          <Text style={styles.bioText}>
            {t('teacherProfile.bioText')}
          </Text>
          <View style={styles.bioWatermark} pointerEvents="none">
            <Ionicons name="school-outline" size={80} color={Colors.textPrimary} style={{ opacity: 0.03 }} />
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionLabel}>{t('teacherProfile.availableHours')}</Text>
            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>{t('teacherProfile.currentWeek')}</Text>
            </View>
          </View>
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <View style={styles.slotsGrid}>
              {(displaySlots.length > 0 ? displaySlots : [
                { id: '1', dayOfWeek: 1, startTime: '14:00', endTime: '15:00', isAvailable: true },
                { id: '2', dayOfWeek: 3, startTime: '16:00', endTime: '17:00', isAvailable: true },
                { id: '3', dayOfWeek: 5, startTime: '—', endTime: '', isAvailable: false },
                { id: '4', dayOfWeek: 6, startTime: '11:00', endTime: '12:00', isAvailable: true },
              ] as (TeacherSlot & { isAvailable?: boolean })[]).map((slot) => {
                const avail = slot.isAvailable !== false;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.slotBtn, !avail && styles.slotBtnDisabled]}
                    activeOpacity={avail ? 0.7 : 1}
                    onPress={() => avail && navigation.navigate(Routes.BookingConfirm, { teacher, slot })}
                  >
                    <Text style={[styles.slotDay, !avail && styles.slotTextDisabled]}>
                      {DAY_LABELS[slot.dayOfWeek] ?? DATE_FALLBACK_DAY}
                    </Text>
                    <Text style={[styles.slotTime, !avail && styles.slotTextDisabled]}>
                      {avail ? slot.startTime : t('teacherProfile.full')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionLabel}>{t('teacherProfile.studentReviews')}</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleWriteReview}>
              <Text style={styles.writeReview}>{t('booking.writeReview')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewsCard}>
            {/* Summary */}
            <View style={styles.reviewSummary}>
              <Text style={styles.reviewBigRating}>{avgRating.toFixed(1)}</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map((i) => (
                  <Ionicons
                    key={i}
                    name={i <= Math.floor(avgRating) ? 'star' : i - 0.5 <= avgRating ? 'star-half' : 'star-outline'}
                    size={22}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text style={styles.reviewCount}>{t('teacherProfile.reviewsBasedOn', { count: reviewCount })}</Text>
            </View>

            {/* Progress bars */}
            <View style={styles.ratingBars}>
              {ratingBars.map((b) => (
                <View key={b.star} style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarNum}>{b.star}</Text>
                  <View style={styles.ratingBarBg}>
                    <View style={[styles.ratingBarFill, { width: `${b.pct}%` }]} />
                  </View>
                  <Text style={styles.ratingBarPct}>{b.pct}%</Text>
                </View>
              ))}
            </View>

            {/* Review items */}
            <View style={styles.reviewItems}>
              {topReviews.length === 0 ? (
                <Text style={{ textAlign: 'center', color: Colors.textMuted, paddingVertical: 16 }}>
                  {t('booking.noReviewsTitle')}
                </Text>
              ) : topReviews.map((r, i) => {
                const palette = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                const name = r.student?.name ?? t('teacherProfile.anonymous');
                return (
                  <View key={r.id}>
                    {i > 0 && <View style={styles.reviewDivider} />}
                    <View style={styles.reviewItem}>
                      <View style={styles.reviewTop}>
                        <View style={styles.reviewerInfo}>
                          <View style={[styles.reviewerAvatar, { backgroundColor: palette.bg }]}>
                            <Text style={[styles.reviewerInitial, { color: palette.text }]}>
                              {name[0]?.toUpperCase() ?? '?'}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.reviewerName}>{name}</Text>
                            <Text style={styles.reviewerTime}>{relativeTime(r.createdAt, t)}</Text>
                          </View>
                        </View>
                        <View style={styles.reviewStars}>
                          {[1,2,3,4,5].map((i2) => (
                            <Ionicons
                              key={i2}
                              name={i2 <= r.rating ? 'star' : 'star-outline'}
                              size={14}
                              color="#F59E0B"
                            />
                          ))}
                        </View>
                      </View>
                      {r.comment ? <Text style={styles.reviewText}>{r.comment}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={styles.allReviewsBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(Routes.AllReviews, { teacherId: teacher?.id })}
              >
                <Text style={styles.allReviewsBtnText}>{t('teacherProfile.viewAllReviews')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={{ flex: 4 }}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.BookingConfirm, { teacher })}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.bookBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bookBtnText}>{t('teacherProfile.sendRequest')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          activeOpacity={0.7}
          onPress={async () => {
            if (!teacherId) return;
            try {
              const chat = await getOrCreateChat(teacherId);
              const parent = navigation.getParent() as any;
              parent?.navigate('Chat', {
                screen: Routes.ChatRoom,
                params: { chatId: chat.id, name: teacher?.name ?? t('booking.defaultTeacher'), userId: teacherId },
              });
            } catch (e: any) {
              Alert.alert(t('booking.errorTitle'), e?.response?.data?.message || t('booking.chatOpenFailed'));
            }
          }}
        >
          <Ionicons name="chatbubble-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, gap: 24, alignItems: 'center' },

  heroSection: { alignItems: 'center', gap: 20, width: '100%' },
  photoBox: {
    borderRadius: 24, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1, shadowRadius: 32, elevation: 6,
  },
  photoInitial: { fontSize: 80, fontWeight: '900', color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' },
  heroInfo: { alignItems: 'center', gap: 10 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroName: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  ratingVal: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  ratingCount: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: Colors.surface, borderRadius: 20, padding: 16, gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  statCardWide: {
    flexBasis: '100%', flexDirection: 'row', gap: 12,
  },
  statIconBox: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  statMeta: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },
  statVal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  section: { width: '100%', gap: 12 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2, paddingHorizontal: 4 },

  subjectsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectChip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
  },
  subjectChipText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  bioCard: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: 20,
    padding: 20, gap: 10, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  bioText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 21 },
  bioWatermark: { position: 'absolute', bottom: -16, right: -16 },

  scheduleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  weekBadge: { backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  weekBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  slotsGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  slotBtn: {
    flex: 1, minWidth: '20%',
    backgroundColor: Colors.surface, borderRadius: 16,
    paddingVertical: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  slotBtnDisabled: { backgroundColor: Colors.surfaceLow, borderColor: Colors.borderLight },
  slotDay: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  slotTime: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  slotTextDisabled: { color: Colors.textMuted },

  reviewsSection: { width: '100%', gap: 12 },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  writeReview: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  reviewsCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 24, gap: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  reviewSummary: { alignItems: 'center', gap: 6 },
  reviewBigRating: { fontSize: 48, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewCount: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  ratingBars: { gap: 10 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingBarNum: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, width: 12, textAlign: 'center' },
  ratingBarBg: { flex: 1, height: 8, backgroundColor: Colors.surfaceLow, borderRadius: 4, overflow: 'hidden' },
  ratingBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  ratingBarPct: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, width: 28, textAlign: 'right' },

  reviewItems: { gap: 16 },
  reviewDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 4 },
  reviewItem: { gap: 10 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reviewerInitial: { fontSize: 14, fontWeight: '800' },
  reviewerName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  reviewerTime: { fontSize: 10, fontWeight: '500', color: Colors.textSecondary, marginTop: 1 },
  reviewStars: { flexDirection: 'row', gap: 1 },
  reviewText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },

  reviewActions: { gap: 10 },
  writeReviewBtn: {
    borderRadius: 16, paddingVertical: 14,
    borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center',
  },
  writeReviewBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  allReviewsBtn: { paddingVertical: 8, alignItems: 'center' },
  allReviewsBtnText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },

  bottomBar: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  bookBtn: {
    borderRadius: 20, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  bookBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  chatBtn: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
});
