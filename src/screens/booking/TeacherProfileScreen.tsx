import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getTeacherSlots, TeacherSlot } from '../../api/booking.api';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = Math.min(width - 40, 320);

const DAY_LABELS: Record<number, string> = {
  0: 'B.E', 1: 'Ç.Ə', 2: 'ÇƏR', 3: 'CÜM.Ə', 4: 'CÜM', 5: 'ŞƏN', 6: 'BAZ',
};

const MOCK_REVIEWS = [
  { initial: 'F', color: Colors.primaryLight, textColor: Colors.primary, name: 'Fərid Əliyev', time: '2 gün əvvəl', stars: 5, text: '"Mükəmməl müəllimdir! Çətin mövzuları çox asan başa salır. Təşəkkür edirəm!"' },
  { initial: 'L', color: '#D1FAE5', textColor: '#059669', name: 'Leyla Qasımova', time: '1 həftə əvvəl', stars: 5, text: '"Dərslər çox maraqlı keçir, müəllim çox səbrlidir və hər kəsə uyğun proqram hazırlayır."' },
];

const RATING_BARS = [
  { star: 5, pct: 85 },
  { star: 4, pct: 10 },
  { star: 3, pct: 3 },
  { star: 2, pct: 2 },
  { star: 1, pct: 0 },
];

export default function TeacherProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const teacher = route.params?.teacher;

  const { data: slots = [], isLoading } = useQuery<TeacherSlot[]>({
    queryKey: ['teacherSlots', teacher?.id],
    queryFn: () => getTeacherSlots(teacher.id),
    enabled: !!teacher?.id,
  });

  const displaySlots = slots.slice(0, 4);
  const initial = teacher?.name?.[0]?.toUpperCase() ?? '?';
  const subject = teacher?.subjects?.[0] ?? 'Riyaziyyat';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Müəllim Profili</Text>
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
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.photoInitial}>{initial}</Text>
          </View>

          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{teacher?.name ?? 'Müəllim'}</Text>
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            </View>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingVal}>{teacher?.rating?.toFixed(1) ?? '4.9'}</Text>
              <Text style={styles.ratingCount}>(120 rəy)</Text>
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statMeta}>TƏCRÜBƏ</Text>
            <Text style={styles.statVal}>8 il təcrübə</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statMeta}>QİYMƏT</Text>
            <Text style={styles.statVal}>{teacher?.hourlyRate ?? 15} AZN / dərs</Text>
          </View>
          <View style={[styles.statCard, styles.statCardWide]}>
            <View style={styles.statIconBox}>
              <Ionicons name="laptop-outline" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.statMeta}>DƏRS FORMATI</Text>
              <Text style={styles.statVal}>Online, Evdə</Text>
            </View>
          </View>
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FƏNLƏR</Text>
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
          <Text style={styles.sectionLabel}>BİOQRAFİYA</Text>
          <Text style={styles.bioText}>
            Riyaziyyat üzrə mütəxəssis, 500+ şagirdə qəbul hazırlığında kömək etmişəm. Dərslərimdə hər bir tələbəyə fərdi yanaşma tətbiq edirəm və mürəkkəb mövzuları ən sadə dillə izah edirəm.
          </Text>
          <View style={styles.bioWatermark} pointerEvents="none">
            <Ionicons name="school-outline" size={80} color={Colors.textPrimary} style={{ opacity: 0.03 }} />
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionLabel}>MÖVCUD SAATLAR</Text>
            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>Cari həftə</Text>
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
                      {DAY_LABELS[slot.dayOfWeek] ?? 'GÜN'}
                    </Text>
                    <Text style={[styles.slotTime, !avail && styles.slotTextDisabled]}>
                      {avail ? slot.startTime : 'Dolu'}
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
            <Text style={styles.sectionLabel}>ŞAGİRD RƏYLƏRİ</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.writeReview}>Rəy yaz</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewsCard}>
            {/* Summary */}
            <View style={styles.reviewSummary}>
              <Text style={styles.reviewBigRating}>{teacher?.rating?.toFixed(1) ?? '4.9'}</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map((i) => (
                  <Ionicons key={i} name={i <= 4 ? 'star' : 'star-half'} size={22} color="#F59E0B" />
                ))}
              </View>
              <Text style={styles.reviewCount}>120 rəy əsasında</Text>
            </View>

            {/* Progress bars */}
            <View style={styles.ratingBars}>
              {RATING_BARS.map((b) => (
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
              {MOCK_REVIEWS.map((r, i) => (
                <View key={r.name}>
                  {i > 0 && <View style={styles.reviewDivider} />}
                  <View style={styles.reviewItem}>
                    <View style={styles.reviewTop}>
                      <View style={styles.reviewerInfo}>
                        <View style={[styles.reviewerAvatar, { backgroundColor: r.color }]}>
                          <Text style={[styles.reviewerInitial, { color: r.textColor }]}>{r.initial}</Text>
                        </View>
                        <View>
                          <Text style={styles.reviewerName}>{r.name}</Text>
                          <Text style={styles.reviewerTime}>{r.time}</Text>
                        </View>
                      </View>
                      <View style={styles.reviewStars}>
                        {[1,2,3,4,5].map((i2) => (
                          <Ionicons key={i2} name="star" size={14} color="#F59E0B" />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewText}>{r.text}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.reviewActions}>
              <TouchableOpacity style={styles.writeReviewBtn} activeOpacity={0.7}>
                <Text style={styles.writeReviewBtnText}>Rəy yaz</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.allReviewsBtn} activeOpacity={0.7}>
                <Text style={styles.allReviewsBtnText}>Bütün rəylərə bax</Text>
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
          onPress={() => Alert.alert('Dərs tələbi', 'Tezliklə əlavə olunacaq')}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.bookBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bookBtnText}>Dərs tələbi göndər</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          activeOpacity={0.7}
          onPress={() => Alert.alert('Mesaj', 'Chat funksiyası tezliklə əlavə olunacaq')}
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
