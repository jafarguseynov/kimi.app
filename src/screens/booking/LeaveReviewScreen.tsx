import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { submitReview } from '../../api/booking.api';
import { getTeacherById } from '../../api/user.api';
import { useTranslation } from '../../i18n';

// Etiket açarları (dəyişməz identifikator) → tərcümə render zamanı
const TAG_KEYS = ['tagClear', 'tagPunctual', 'tagPatient', 'tagCommunication', 'tagExplains', 'tagRecommend'] as const;
const RATING_LABEL_KEYS: Record<number, string> = {
  1: 'booking.ratingBad',
  2: 'booking.ratingMid',
  3: 'booking.ratingGood',
  4: 'booking.ratingVeryGood',
  5: 'booking.ratingExcellent',
};

const AVATAR_GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function LeaveReviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<{ params: { teacherId?: string; teacherName?: string; teacherSubject?: string; bookingId?: string; teacherAvatarUrl?: string } }, 'params'>>();
  const { teacherName = t('booking.defaultTeacher'), teacherSubject = t('booking.defaultTeacher'), teacherId = '', bookingId = '', teacherAvatarUrl } = route.params ?? {};

  // Şəkil: çağıran ekran ötürübsə onu, yoxsa id ilə serverdən gətir.
  const { data: fetchedTeacher } = useQuery({
    queryKey: ['teacherById', teacherId],
    queryFn: () => getTeacherById(teacherId),
    enabled: !!teacherId && !teacherAvatarUrl,
  });
  const avatarUrl = teacherAvatarUrl ?? fetchedTeacher?.avatarUrl ?? null;

  const TAGS = TAG_KEYS.map((k) => t(`booking.${k}`));

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set([t('booking.tagPunctual'), t('booking.tagCommunication')])
  );

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const tagText = Array.from(selectedTags).join(', ');
      const fullComment = [tagText, comment].filter(Boolean).join('. ');
      return submitReview(bookingId, { rating, comment: fullComment || undefined });
    },
    onSuccess: () => navigation.navigate(Routes.ReviewSuccess, { teacherId, teacherName }),
    onError: (err: any) => {
      const reason = err?.response?.data?.message;
      Alert.alert(t('booking.errorTitle'), reason ? `${reason}` : t('booking.reviewFailed'));
    },
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const initial = teacherName[0]?.toUpperCase() ?? '?';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="close" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('booking.leaveReviewHeader')}</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Teacher info */}
          <View style={styles.teacherSection}>
            <View style={styles.avatarWrap}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
              ) : (
                <LinearGradient
                  colors={AVATAR_GRADIENT}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </LinearGradient>
              )}
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
              </View>
            </View>
            <Text style={styles.teacherName}>{teacherName}</Text>
            <Text style={styles.teacherSubject}>{teacherSubject}</Text>
          </View>

          {/* Stars */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>{t('booking.rateTeacher')}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity key={i} onPress={() => setRating(i)} hitSlop={8} activeOpacity={0.7}>
                  <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={40} color="#F59E0B" />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.ratingLabel}>
              <Text style={styles.ratingLabelText}>{t('booking.ratingStars', { rating, label: t(RATING_LABEL_KEYS[rating]) })}</Text>
            </View>
          </View>

          {/* Comment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('booking.impressions')}</Text>
            <View style={styles.textAreaCard}>
              <TextInput
                style={styles.textArea}
                placeholder={t('booking.reviewPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
                textAlignVertical="top"
                numberOfLines={5}
              />
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('booking.teacherTraits')}</Text>
            <View style={styles.tagsWrap}>
              {TAGS.map(tag => {
                const isSelected = selectedTags.has(tag);
                if (isSelected) {
                  return (
                    <TouchableOpacity key={tag} onPress={() => toggleTag(tag)} activeOpacity={0.85}>
                      <LinearGradient
                        colors={AVATAR_GRADIENT}
                        style={styles.tagActive}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.tagActiveText}>{tag}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={tag}
                    style={styles.tag}
                    onPress={() => toggleTag(tag)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={{ width: '100%' }}
              activeOpacity={0.85}
              onPress={() => {
                if (!bookingId) {
                  Alert.alert(t('booking.needBooking'), t('booking.needBookingMsg'));
                  return;
                }
                mutate();
              }}
              disabled={isPending}
            >
              <LinearGradient
                colors={AVATAR_GRADIENT}
                style={styles.submitBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>{t('booking.sendReview')}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>{t('booking.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },

  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, gap: 28 },

  teacherSection: { alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 96, height: 96, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  avatarInitial: { fontSize: 36, fontWeight: '900', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' },
  verifiedBadge: {
    position: 'absolute', bottom: -6, right: -6,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background,
  },
  teacherName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  teacherSubject: { fontSize: 14, color: Colors.textSecondary },

  ratingSection: { alignItems: 'center', gap: 16 },
  ratingTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  starsRow: { flexDirection: 'row', gap: 8 },
  ratingLabel: {
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  ratingLabelText: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  section: { gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginLeft: 4 },

  textAreaCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  textArea: {
    minHeight: 140, padding: 20,
    fontSize: 15, color: Colors.textPrimary, lineHeight: 22,
  },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagActive: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  tagActiveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  tag: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  tagText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },

  actions: { gap: 12 },
  submitBtn: {
    borderRadius: 999, paddingVertical: 20, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  submitBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '500', color: Colors.textSecondary },
});
