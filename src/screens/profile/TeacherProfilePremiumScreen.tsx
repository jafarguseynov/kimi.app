import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { getMe } from '../../api/user.api';
import { getTeacherReviews } from '../../api/booking.api';
import { getVideoThumbnail } from '../../utils/video';

export default function TeacherProfilePremiumScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const storeUser = useUserStore((s) => s.user);

  // Müəllimin ÖZ profili — real məlumatı serverdən çək (store köhnə ola bilər).
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const d: any = { ...(storeUser as any), ...((me as any) ?? {}) };
  const teacherId: string | undefined = d?.id;

  // Reytinq + rəy sayı — şagirdin gördüyü ilə eyni mənbədən.
  const { data: reviewsData } = useQuery({
    queryKey: ['teacherReviews', teacherId],
    queryFn: () => getTeacherReviews(teacherId as string).catch(() => []),
    enabled: !!teacherId,
  });
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : Number(d?.rating ?? 0);

  const name: string = d?.name ?? t('teacherPremium.defaultName');
  const avatarUrl: string | undefined = d?.avatarUrl || undefined;
  const initialsAvatar = `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(name)}&backgroundColor=eef1f3&textColor=006190`;
  const isVerified: boolean = !!d?.isVerified;

  const subjects: string[] = Array.isArray(d?.subjects) ? d.subjects.filter(Boolean) : [];
  const roleLine = subjects.length ? subjects.join(' · ') : (d?.headline || d?.areaName || '');
  const bio: string = (d?.bio ?? '').trim();

  // Dərs formatı etiketi
  const formatLabel = (f: string) =>
    f === 'online' ? t('editProfile.formatOnline') : f === 'home' ? t('editProfile.formatHome') : f === 'course' ? t('editProfile.formatCourse') : f;
  const formats: string[] = Array.isArray(d?.lessonFormats) ? d.lessonFormats.filter(Boolean) : [];
  const formatValue = formats.length ? formats.map(formatLabel).join(', ') : '—';

  const experienceYears = Number(d?.experienceYears ?? 0);
  const hourlyRate = Number(d?.hourlyRate ?? 0);
  const introVideoUrl: string | undefined = d?.introVideoUrl || undefined;
  const introThumb = getVideoThumbnail(introVideoUrl);

  const stats: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; suffix?: string }[] = [
    { icon: 'briefcase-outline', label: t('teacherPremium.statExperience'), value: experienceYears > 0 ? `${experienceYears} ${t('editProfile.yearUnit')}` : '—' },
    { icon: 'cash-outline', label: t('teacherPremium.statPrice'), value: hourlyRate > 0 ? `${hourlyRate} ₼` : '—', suffix: hourlyRate > 0 ? '/saat' : undefined },
    { icon: 'laptop-outline', label: t('teacherPremium.statFormat'), value: formatValue },
  ];

  const openIntro = () => { if (introVideoUrl) Linking.openURL(introVideoUrl).catch(() => {}); };

  const handleShare = () => {
    Share.share({
      message: t('teacherProfile.shareMsg', { name, subject: subjects[0] ?? '' }),
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cover with overlay buttons */}
        <View style={styles.cover}>
          <LinearGradient
            colors={[Colors.primaryLight, Colors.surfaceLow]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.coverBlobA} />
          <View style={styles.coverBlobB} />

          <View style={styles.coverNav}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn} hitSlop={6}>
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} hitSlop={6} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: avatarUrl ?? initialsAvatar }} style={styles.avatar} />
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {isVerified && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
          </View>
          {!!roleLine && <Text style={styles.role}>{roleLine}</Text>}

          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingValue}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.ratingSub}>{t('teacherPremium.reviews', { count: reviewCount })}</Text>
            </View>
            {isVerified && (
              <View style={styles.superBadge}>
                <Ionicons name="school" size={14} color={Colors.primary} />
                <Text style={styles.superBadgeText}>{t('teacherPremium.superTeacher')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={styles.statIconBubble}>
                <Ionicons name={s.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>
                {s.value}
                {s.suffix && <Text style={styles.statSuffix}>{s.suffix}</Text>}
              </Text>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{t('teacherPremium.aboutTitle')}</Text>
          </View>
          <Text style={styles.bioText}>
            {bio || t('teacherPremium.aboutEmpty')}
          </Text>
        </View>

        {/* Subjects */}
        {subjects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="book-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t('teacherPremium.subjectsTitle')}</Text>
            </View>
            <View style={styles.chipWrap}>
              {subjects.map((s) => (
                <View key={s} style={styles.chip}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tanıtım videosu — qapaq şəkli (şagirdin gördüyü kimi) */}
        {!!introVideoUrl && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="logo-youtube" size={20} color="#e11d48" />
              <Text style={styles.sectionTitle}>{t('teacherProfile.introVideoLabel')}</Text>
            </View>
            {introThumb ? (
              <TouchableOpacity style={styles.videoThumb} activeOpacity={0.9} onPress={openIntro}>
                <Image source={{ uri: introThumb }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.55)']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0.5, y: 0.3 }}
                  end={{ x: 0.5, y: 1 }}
                />
                <View style={styles.videoPlayBig}>
                  <Ionicons name="play" size={26} color="#fff" style={{ marginLeft: 3 }} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.videoRow} activeOpacity={0.85} onPress={openIntro}>
                <Ionicons name="play-circle" size={22} color={Colors.primary} />
                <Text style={styles.videoRowText}>{t('teacherProfile.introVideoWatch')}</Text>
                <Ionicons name="open-outline" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85} onPress={handleShare}>
          <Ionicons name="share-outline" size={18} color={Colors.textPrimary} />
          <Text style={styles.shareBtnText}>{t('teacherPremium.share')}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }} onPress={() => navigation.navigate(Routes.EditProfile)}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.editBtnText}>{t('teacherPremium.edit')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 16 },

  cover: { height: 160, position: 'relative', overflow: 'hidden' },
  coverBlobA: {
    position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '1A',
  },
  coverBlobB: {
    position: 'absolute', bottom: -24, right: -24, width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '1A',
  },
  coverNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 16,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#ffffffCC',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },

  profileHeader: {
    paddingHorizontal: 24, marginTop: -64, alignItems: 'center', gap: 0,
  },
  avatarWrap: {
    width: 128, height: 128, borderRadius: 64,
    borderWidth: 4, borderColor: Colors.surfaceLowest,
    backgroundColor: Colors.surfaceHigh,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4 },
  role: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEF3C7',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  ratingValue: { fontSize: 13, fontWeight: '700', color: '#B45309' },
  ratingSub: { fontSize: 11, color: '#B45309AA', marginLeft: 2 },
  superBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.primary + '1A',
  },
  superBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.primaryDim },

  statsGrid: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 24, marginTop: 24,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 14,
    alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  statIconBubble: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  statSuffix: { fontSize: 10, fontWeight: '400', color: Colors.textSecondary },

  section: { paddingHorizontal: 24, marginTop: 28 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
  bioText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  chipText: { fontSize: 13, color: Colors.textPrimary },

  videoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLowest, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  videoRowText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  videoThumb: {
    width: '100%', aspectRatio: 16 / 9, borderRadius: 16, overflow: 'hidden',
    backgroundColor: Colors.surfaceLow, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  videoPlayBig: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: 'rgba(225,29,72,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24,
    backgroundColor: Colors.surfaceLowest,
    borderTopWidth: 1, borderTopColor: Colors.surfaceVariant + '4D',
  },
  shareBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: 20, paddingVertical: 14,
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 20, paddingVertical: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
  },
  editBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
