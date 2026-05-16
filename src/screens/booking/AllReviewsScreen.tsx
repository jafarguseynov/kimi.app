import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useQuery } from '@tanstack/react-query';
import { getTeacherReviews, Review } from '../../api/booking.api';

const FILTER_CHIPS = ['Hamısı', '5 ulduz', '4 ulduz', '3 ulduz', '2 ulduz', '1 ulduz'];

const AVATAR_GRADIENTS: [string, string][] = [
  [Colors.gradientStart, Colors.gradientEnd],
  ['#7C3AED', '#A78BFA'],
  ['#006947', '#58e7ab'],
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 86400000);
  if (diff === 0) return 'Bu gün';
  if (diff === 1) return 'Dünən';
  if (diff < 7) return `${diff} gün əvvəl`;
  if (diff < 30) return `${Math.floor(diff / 7)} həftə əvvəl`;
  return `${Math.floor(diff / 30)} ay əvvəl`;
}

export default function AllReviewsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<{ params: { teacherId?: string; teacherName?: string } }, 'params'>>();
  const { teacherId = '', teacherName = 'Müəllim' } = route.params ?? {};
  const [activeFilter, setActiveFilter] = useState('Hamısı');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['teacher-reviews', teacherId],
    queryFn: () => getTeacherReviews(teacherId),
    enabled: !!teacherId,
  });

  const filterStar = activeFilter === 'Hamısı' ? 0 : parseInt(activeFilter[0], 10);
  const displayed = filterStar ? reviews.filter((r) => r.rating === filterStar) : reviews;

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingBars = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    pct: reviews.length
      ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
      : 0,
  }));

  const isEmpty = !isLoading && reviews.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bütün rəylər</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIllustration}>
              <Ionicons name="chatbubble-ellipses-outline" size={80} color={Colors.primary + '28'} />
            </View>
            <Text style={styles.emptyTitle}>Hələ rəy yoxdur</Text>
            <Text style={styles.emptySub}>İlk rəy yazan sən ol</Text>

            <TouchableOpacity
              style={{ width: '100%' }}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(Routes.LeaveReview, { teacherId, teacherName })}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={styles.emptyBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.emptyBtnText}>Rəy yaz</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.emptyFooter}>Kimi.az Təhsil Platforması</Text>

            <View style={styles.emptyInfoCard}>
              <View style={styles.emptyInfoRow}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
                <Text style={styles.emptyInfoLabel}>Təhlükəsiz Rəylər</Text>
              </View>
              <Text style={styles.emptyInfoText}>
                Bütün rəylər platformamız tərəfindən doğrulanır və şəffaflıq qorunur.
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Rating Overview */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewLeft}>
                <Text style={styles.overviewScore}>{avgRating.toFixed(1)}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name={i <= Math.round(avgRating) ? 'star' : 'star-outline'}
                      size={18}
                      color="#F59E0B"
                    />
                  ))}
                </View>
                <Text style={styles.overviewCount}>{reviews.length} rəy</Text>
              </View>
              <View style={styles.barsSection}>
                {ratingBars.map((bar) => (
                  <View key={bar.stars} style={styles.barRow}>
                    <Text style={styles.barLabel}>{bar.stars}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${bar.pct}%` as `${number}%` }]} />
                    </View>
                    <Text style={styles.barPct}>{bar.pct}%</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsList}
            >
              {FILTER_CHIPS.map((chip) => {
                const isActive = activeFilter === chip;
                if (isActive) {
                  return (
                    <TouchableOpacity key={chip} onPress={() => setActiveFilter(chip)} activeOpacity={0.85}>
                      <LinearGradient
                        colors={[Colors.gradientStart, Colors.gradientEnd]}
                        style={styles.chipActive}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.chipActiveText}>{chip}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={chip}
                    style={styles.chip}
                    onPress={() => setActiveFilter(chip)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Reviews */}
            <View style={styles.reviewsList}>
              {displayed.map((review: Review, idx) => {
                const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                const name = review.student?.name ?? 'Şagird';
                const initial = name[0]?.toUpperCase() ?? '?';
                return (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAuthorRow}>
                        <LinearGradient
                          colors={gradient}
                          style={styles.reviewAvatar}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.reviewAvatarInitial}>{initial}</Text>
                        </LinearGradient>
                        <View>
                          <Text style={styles.reviewAuthorName}>{name}</Text>
                          <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                        </View>
                      </View>
                      <View style={styles.reviewStarsRow}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Ionicons
                            key={i}
                            name={i <= review.rating ? 'star' : 'star-outline'}
                            size={14}
                            color="#F59E0B"
                          />
                        ))}
                      </View>
                    </View>

                    {!!review.comment && (
                      <Text style={styles.reviewText} numberOfLines={4}>{review.comment}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
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
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48, gap: 20 },

  center: { paddingTop: 60, alignItems: 'center' },

  overviewCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 20,
    flexDirection: 'row', gap: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  overviewLeft: { alignItems: 'center', gap: 6, minWidth: 72 },
  overviewScore: {
    fontSize: 48, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1, lineHeight: 56,
  },
  starsRow: { flexDirection: 'row', gap: 2 },
  overviewCount: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  barsSection: { flex: 1, gap: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, width: 10 },
  barTrack: {
    flex: 1, height: 8,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 4, overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  barPct: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, width: 30, textAlign: 'right' },

  chipsList: { gap: 8 },
  chipActive: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  chipActiveText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  chip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  chipText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },

  reviewsList: { gap: 12 },
  reviewCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 20, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  reviewHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
  },
  reviewAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarInitial: { fontSize: 16, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  reviewAuthorName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  reviewDate: { fontSize: 12, color: Colors.textMuted },
  reviewStarsRow: { flexDirection: 'row', gap: 2 },
  reviewText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 23 },

  emptyContainer: { flex: 1, alignItems: 'center', gap: 20, paddingTop: 16, paddingBottom: 16 },
  emptyIllustration: {
    width: 160, height: 160, borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  emptyTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  emptySub: { fontSize: 17, color: Colors.textSecondary, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 999, paddingVertical: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25, shadowRadius: 24, elevation: 6,
  },
  emptyBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  emptyFooter: {
    fontSize: 10, fontWeight: '800', color: Colors.textLight,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  emptyInfoCard: {
    width: '100%', backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 20, gap: 8,
    marginTop: 8,
  },
  emptyInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyInfoLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  emptyInfoText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
