import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { getOrCreateChat } from '../../api/chat.api';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function BookingConfirmedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();

  // Real sifariş məlumatı naviqasiyadan gəlir (teacher + slot/booking).
  const teacher = route.params?.teacher ?? {};
  const slot = route.params?.slot ?? {};
  const booking = route.params?.booking ?? {};

  const teacherId: string | undefined = teacher?.id;
  const teacherName: string = teacher?.name ?? t('booking.defaultTeacher');
  const initials = teacherName.split(' ').filter(Boolean).slice(0, 2).map((s: string) => s[0]?.toUpperCase()).join('') || '?';
  const avatarUrl: string | undefined = teacher?.avatarUrl || undefined;
  const subject: string = teacher?.subjects?.[0] ?? booking?.subject ?? slot?.subject ?? '';
  const rating = Number(teacher?.rating ?? 0);
  const isVerified = !!teacher?.isVerified;

  // Dərs tarixi/saatı/formatı — slot və ya booking-dən (yoxdursa gizlədilir).
  const dateLabel: string | undefined = booking?.dateLabel ?? slot?.dateLabel ?? booking?.date ?? undefined;
  const timeLabel: string | undefined = (slot?.startTime && slot?.endTime)
    ? `${slot.startTime} - ${slot.endTime}`
    : (slot?.startTime ?? booking?.time ?? undefined);
  const formatLabel: string | undefined = booking?.formatLabel ?? teacher?.lessonFormats?.[0] ?? undefined;
  const hasDetails = !!(dateLabel || timeLabel || formatLabel);

  const openChat = async () => {
    if (!teacherId) return;
    try {
      const chat = await getOrCreateChat(teacherId);
      const parent = navigation.getParent() as any;
      parent?.navigate('Chat', {
        screen: Routes.ChatRoom,
        params: { chatId: chat.id, name: teacherName, userId: teacherId },
      });
    } catch (e: any) {
      Alert.alert(t('booking.errorTitle'), e?.response?.data?.message || t('booking.chatOpenFailed'));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('booking.confirmedHeader')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroWrap}>
            <View style={styles.heroAura} />
            <LinearGradient colors={GRADIENT} style={styles.heroIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="hardware-chip-outline" size={52} color="#fff" />
            </LinearGradient>
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={22} color="#fff" />
            </View>
          </View>
          <Text style={styles.heroTitle}>{t('booking.confirmedTitle')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('booking.confirmedSub')}
          </Text>
        </View>

        {/* Teacher card */}
        <View style={styles.teacherCard}>
          <View style={styles.teacherCardDecor}>
            <Ionicons name="school" size={64} color={Colors.primary + '1A'} />
          </View>
          <View style={styles.teacherAvatarWrap}>
            <View style={styles.teacherAvatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.teacherAvatarImg} resizeMode="cover" />
              ) : (
                <Text style={styles.teacherAvatarText}>{initials}</Text>
              )}
            </View>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherName}>{teacherName}</Text>
            <View style={styles.teacherMeta}>
              {!!subject && (
                <View style={styles.subjectChip}>
                  <Text style={styles.subjectChipText}>{subject}</Text>
                </View>
              )}
              {rating > 0 && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Lesson details card — yalnız məlumat varsa göstərilir */}
        {hasDetails && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsLabel}>{t('booking.lessonInfo')}</Text>
            {!!(dateLabel || timeLabel) && (
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconRow}>
                    <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                    <Text style={styles.detailKey}>{t('booking.dateLabel')}</Text>
                  </View>
                  <Text style={styles.detailValue}>{dateLabel ?? '—'}</Text>
                </View>
                <View style={[styles.detailItem, { alignItems: 'flex-end' }]}>
                  <View style={[styles.detailIconRow, { flexDirection: 'row-reverse' }]}>
                    <Ionicons name="time-outline" size={18} color={Colors.primary} />
                    <Text style={styles.detailKey}>{t('booking.timeLabel')}</Text>
                  </View>
                  <Text style={styles.detailValue}>{timeLabel ?? '—'}</Text>
                </View>
              </View>
            )}
            {!!formatLabel && (
              <View style={styles.formatRow}>
                <View style={styles.formatIconCircle}>
                  <Ionicons name="videocam-outline" size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.formatLabel}>{t('booking.formatLabel')}</Text>
                  <Text style={styles.formatValue}>{formatLabel}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Action buttons */}
        <TouchableOpacity activeOpacity={0.9} onPress={openChat} disabled={!teacherId}>
          <LinearGradient colors={GRADIENT} style={[styles.primaryBtn, !teacherId && { opacity: 0.5 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="chatbubble" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>{t('booking.messageTeacher')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.BookingHistory)}>
          <Ionicons name="calendar" size={20} color={Colors.textPrimary} />
          <Text style={styles.secondaryBtnText}>{t('booking.viewBookings')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 20, paddingBottom: 40 },

  heroSection: { alignItems: 'center', gap: 14 },
  heroWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroAura: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '1A',
  },
  heroIconBox: {
    width: 128, height: 128, borderRadius: 64,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 4,
  },
  checkBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.tertiary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.surfaceLowest,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },

  teacherCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
    overflow: 'hidden', position: 'relative',
  },
  teacherCardDecor: { position: 'absolute', top: 0, right: 12, opacity: 0.15 },
  teacherAvatarWrap: { position: 'relative', flexShrink: 0 },
  teacherAvatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2, borderColor: Colors.primaryFixed,
    alignItems: 'center', justifyContent: 'center',
  },
  teacherAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  teacherAvatarImg: { width: '100%', height: '100%', borderRadius: 32 },
  verifiedBadge: {
    position: 'absolute', bottom: -2, right: -2,
    backgroundColor: Colors.surfaceLowest, borderRadius: 99,
  },
  teacherInfo: { flex: 1, gap: 8 },
  teacherName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  teacherMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subjectChip: {
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  subjectChipText: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },

  detailsCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 20, gap: 16,
  },
  detailsLabel: {
    fontSize: 9, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { gap: 4 },
  detailIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailKey: { fontSize: 11, fontWeight: '600', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  formatRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    paddingTop: 16,
  },
  formatIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
  },
  formatLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  formatValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },

  primaryBtn: {
    height: 60, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    height: 60, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});
