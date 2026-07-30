import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Modal,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../../api/client';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { levelMeta } from '../../constants/teacherLevel';
import { useFavoriteTeachersStore } from '../../store/favoritesTeachers.store';
import { useRecentTeachersStore } from '../../store/recentTeachers.store';
import { useTranslation } from '../../i18n';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects?: string[];
  hourlyRate?: number;
  rating?: number;
  avatarUrl?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  format?: 'online' | 'in-person' | 'both';
  reviewCount?: number;
  city?: string;
  gender?: 'male' | 'female';
  age?: number;
  verified?: boolean; // ADMIN tərəfindən təsdiqlənmiş müəllim (yaşıl nişan)
  experienceYears?: number; // müəllimin təcrübə ili (kartda göstərilir)
  isFeatured?: boolean;
  isPremium?: boolean;   // premium abunəçi müəllim (backend)
  profileViews?: number; // real profil baxış sayı (backend)
  ratingCount?: number;  // real rəy sayı (backend)
  level?: number;        // müəllim səviyyəsi 0=Yeni,1=Yaxşı,2=Əla,3=Super (backend)
}

const CITY_SUGGESTIONS = [
  'Bakı', 'Sumqayıt', 'Gəncə', 'Mingəçevir', 'Şirvan',
  'Naxçıvan', 'Şəki', 'Lənkəran', 'Quba', 'Xırdalan',
  'Ağdam', 'Ağdaş', 'Ağsu', 'Astara', 'Balakən',
  'Bərdə', 'Beyləqan', 'Biləsuvar', 'Cəlilabad', 'Daşkəsən',
  'Füzuli', 'Gədəbəy', 'Goranboy', 'Göyçay', 'Hacıqabul',
  'İmişli', 'İsmayıllı', 'Kürdəmir', 'Qax', 'Qazax',
  'Qəbələ', 'Qobustan', 'Qusar', 'Masallı', 'Neftçala',
  'Oğuz', 'Saatlı', 'Sabirabad', 'Salyan', 'Samux',
  'Siyəzən', 'Şabran', 'Şamaxı', 'Şəmkir', 'Tərtər',
  'Tovuz', 'Ucar', 'Yardımlı', 'Yevlax', 'Zaqatala', 'Zərdab',
];

const AGE_RANGES: { key: string; label: string; min: number; max: number }[] = [
  { key: '18-25', label: '18-25', min: 18, max: 25 },
  { key: '26-35', label: '26-35', min: 26, max: 35 },
  { key: '36-50', label: '36-50', min: 36, max: 50 },
  { key: '50+', label: '50+', min: 50, max: 200 },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2;

const FILTER_CHIPS = ['Hamısı', 'Sevimlilərim', 'Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'İngilis dili', 'Azərbaycan dili', 'Tarix', 'Coğrafiya', 'İnformatika'];

const AVATAR_GRADIENTS: [string, string][] = [
  [Colors.gradientStart, Colors.gradientEnd],
  ['#006947', '#58e7ab'],
  ['#7C3AED', '#A78BFA'],
  ['#EA580C', '#FCA372'],
  ['#0369A1', '#38BDF8'],
  ['#9333EA', '#D946EF'],
];

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

const SkeletonCard = () => (
  <View style={[styles.card, styles.skeletonCard, { width: CARD_WIDTH }]}>
    <View style={styles.skelPhoto} />
    <View style={styles.skelLineLg} />
    <View style={styles.skelLineSm} />
    <View style={styles.skelMetrics} />
    <View style={styles.skelLineSm} />
  </View>
);

export default function TeacherListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const chipLabel = (item: string) =>
    item === 'Hamısı' ? t('teacherList.all') : item === 'Sevimlilərim' ? t('teacherList.favorites') : item;
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 350);
  const [activeFilter, setActiveFilter] = useState('Hamısı');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'priceAsc' | 'priceDesc' | 'reviews'>('rating');
  const [formatFilter, setFormatFilter] = useState<'all' | 'online' | 'in-person'>('all');
  const [minRating, setMinRating] = useState<0 | 4 | 4.5 | 4.8>(0);
  const [cityFilter, setCityFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const favoriteIds = useFavoriteTeachersStore((s) => s.ids);
  const toggleFavorite = useFavoriteTeachersStore((s) => s.toggle);
  const recentList = useRecentTeachersStore((s) => s.list);

  const activeFilterCount =
    (sortBy !== 'rating' ? 1 : 0) +
    (formatFilter !== 'all' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (cityFilter.trim() ? 1 : 0) +
    (genderFilter !== 'all' ? 1 : 0) +
    (ageRange ? 1 : 0);

  const resetFilters = () => {
    setSortBy('rating');
    setFormatFilter('all');
    setMinRating(0);
    setCityFilter('');
    setGenderFilter('all');
    setAgeRange(null);
  };

  const citySuggestions = useMemo(() => {
    const q = cityFilter.trim().toLowerCase();
    if (!q) return [] as string[];
    return CITY_SUGGESTIONS
      .filter((c) => c.toLowerCase().includes(q) && c.toLowerCase() !== q)
      .slice(0, 6);
  }, [cityFilter]);

  const subjectQuery = activeFilter !== 'Hamısı' && activeFilter !== 'Sevimlilərim' ? activeFilter : undefined;
  const { data: teachersData, isLoading, refetch } = useQuery<Teacher[]>({
    queryKey: ['teachers', debouncedSearch, subjectQuery],
    queryFn: () =>
      api
        .get('/user/teachers', {
          params: {
            q: debouncedSearch || undefined,
            subject: subjectQuery,
          },
        })
        .then((r) => r.data)
        .catch(() => [] as Teacher[]),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try { await refetch(); } finally { setRefreshing(false); }
  };

  const rawTeachers: Teacher[] = Array.isArray(teachersData) ? teachersData : [];

  const teachers: Teacher[] = useMemo(() => {
    let list = rawTeachers.slice();
    if (activeFilter === 'Sevimlilərim') {
      list = list.filter((t) => favoriteIds.has(t.id));
    }
    if (formatFilter !== 'all') {
      list = list.filter((t) => t.format === formatFilter || t.format === 'both');
    }
    if (minRating > 0) {
      list = list.filter((t) => (t.rating ?? 0) >= minRating);
    }
    if (cityFilter.trim()) {
      const q = cityFilter.trim().toLowerCase();
      list = list.filter((t) => t.city?.toLowerCase().includes(q));
    }
    if (genderFilter !== 'all') {
      list = list.filter((t) => t.gender === genderFilter);
    }
    if (ageRange) {
      const r = AGE_RANGES.find((a) => a.key === ageRange);
      if (r) list = list.filter((t) => t.age != null && t.age >= r.min && t.age <= r.max);
    }
    if (sortBy === 'rating') list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sortBy === 'priceAsc') list.sort((a, b) => (a.hourlyRate ?? Number.POSITIVE_INFINITY) - (b.hourlyRate ?? Number.POSITIVE_INFINITY));
    else if (sortBy === 'priceDesc') list.sort((a, b) => (b.hourlyRate ?? -1) - (a.hourlyRate ?? -1));
    else if (sortBy === 'reviews') list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    // İrəli çəkilmiş (boost) profillər həmişə öndə
    list.sort((a, b) => Number(b.isFeatured ?? false) - Number(a.isFeatured ?? false));
    return list;
  }, [rawTeachers, activeFilter, favoriteIds, formatFilter, minRating, cityFilter, genderFilter, ageRange, sortBy]);

  const activeFilterChips: { label: string; onClear: () => void }[] = [];
  if (sortBy !== 'rating') {
    const sortMap = { priceAsc: t('teacherList.chipPriceAsc'), priceDesc: t('teacherList.chipPriceDesc'), reviews: t('teacherList.chipReviews') } as const;
    activeFilterChips.push({ label: sortMap[sortBy], onClear: () => setSortBy('rating') });
  }
  if (formatFilter !== 'all') activeFilterChips.push({ label: formatFilter === 'online' ? t('teacherList.onlineOpt') : t('teacherList.inPersonOpt'), onClear: () => setFormatFilter('all') });
  if (minRating > 0) activeFilterChips.push({ label: `${minRating}+ ★`, onClear: () => setMinRating(0) });
  if (cityFilter.trim()) activeFilterChips.push({ label: cityFilter.trim(), onClear: () => setCityFilter('') });
  if (genderFilter !== 'all') activeFilterChips.push({ label: genderFilter === 'male' ? t('teacherList.male') : t('teacherList.female'), onClear: () => setGenderFilter('all') });
  if (ageRange) activeFilterChips.push({ label: t('teacherList.chipAge', { range: ageRange }), onClear: () => setAgeRange(null) });

  const renderCard = ({ item, index }: { item: Teacher; index: number }) => {
    const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
    const initial = item.name?.[0]?.toUpperCase() ?? '?';
    const subjectLabel = item.subjects?.length
      ? item.subjects.slice(0, 2).join(' • ')
      : t('teacherList.generalSpecialist');
    const price = typeof item.hourlyRate === 'number' && item.hourlyRate > 0 ? item.hourlyRate : 15;
    // Real reytinq + real rəy sayı. Rəy yoxdursa "Yeni" göstər (tire/saxta rəqəm yox).
    const hasRating = typeof item.rating === 'number' && item.rating > 0;
    const reviewCount = item.ratingCount ?? 0;
    // Real profil baxış sayı (backend). 1000+ olduqda "1.2k" kimi, az olduqda tam rəqəm.
    const views = item.profileViews ?? 0;
    const viewsLabel = views >= 1000 ? `${(views / 1000).toFixed(1)}k` : String(views);
    const cityLabel = item.city ?? 'Bakı';
    const showOnline = item.isOnline || item.format === 'online';
    const showInPerson = !showOnline && item.format === 'in-person';
    const isFavorite = favoriteIds.has(item.id);
    const isVerified = !!item.verified;

    return (
      <TouchableOpacity
        style={[styles.card, { width: CARD_WIDTH }, item.isPremium && styles.cardPremium]}
        onPress={() => navigation.navigate(Routes.TeacherProfile, { teacher: item })}
        activeOpacity={0.85}
      >
        <View style={styles.photoContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.photoBox} />
          ) : (
            <LinearGradient colors={gradient} style={styles.photoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.photoInitial}>{initial}</Text>
            </LinearGradient>
          )}

          <TouchableOpacity
            style={styles.favBtn}
            activeOpacity={0.7}
            hitSlop={6}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={14}
              color={isFavorite ? '#ef4444' : Colors.outlineVariant}
            />
          </TouchableOpacity>

          {showOnline && (
            <View style={[styles.statusBadge, styles.statusOnline]}>
              <Text style={styles.statusBadgeText}>{t('teacherList.online')}</Text>
            </View>
          )}
          {showInPerson && (
            <View style={[styles.statusBadge, styles.statusInPerson]}>
              <Text style={styles.statusBadgeText}>{t('teacherList.inPerson')}</Text>
            </View>
          )}
          {item.isFeatured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="rocket" size={10} color="#fff" />
              <Text style={styles.featuredBadgeText}>{t('teacherList.featured')}</Text>
            </View>
          )}
        </View>

        {(item.isPremium || levelMeta(item.level)) && (
          <View style={styles.badgeRow}>
            {item.isPremium && (
              <View style={styles.premiumRibbon}>
                <Ionicons name="ribbon" size={11} color="#7A4B00" />
                <Text style={styles.premiumRibbonText}>PREMIUM</Text>
              </View>
            )}
            {(() => {
              const lvl = levelMeta(item.level);
              return lvl ? (
                <View style={[styles.levelBadge, { backgroundColor: lvl.bg }]}>
                  <Ionicons name={lvl.icon} size={10} color={lvl.fg} />
                  <Text style={[styles.levelBadgeText, { color: lvl.fg }]}>{t(`teacherTier.${lvl.key}`)}</Text>
                </View>
              ) : null;
            })()}
          </View>
        )}

        <View style={styles.nameRow}>
          {item.isPremium && <Ionicons name="star" size={13} color="#D4901F" />}
          <Text style={[styles.cardName, item.isPremium && styles.cardNamePremium]} numberOfLines={1}>{item.name}</Text>
          {isVerified && <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />}
        </View>
        <Text style={styles.cardSubject} numberOfLines={1}>{subjectLabel}</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            {hasRating ? (
              <>
                <Text style={styles.metricStrong}>{item.rating!.toFixed(1)}</Text>
                <Text style={styles.metricMuted}>({reviewCount})</Text>
              </>
            ) : (
              <Text style={styles.metricMuted}>{t('teacherList.newTeacher')}</Text>
            )}
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="eye-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.metricMuted}>{viewsLabel}</Text>
          </View>
        </View>

        <View style={styles.cityRow}>
          <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.cityText} numberOfLines={1}>{cityLabel}</Text>
          {item.experienceYears != null && item.experienceYears > 0 && (
            <>
              <Text style={styles.cityDot}>·</Text>
              <Ionicons name="briefcase-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.cityText}>{t('teacherList.expYears', { n: item.experienceYears })}</Text>
            </>
          )}
        </View>

        <View style={styles.priceFooter}>
          <Text style={styles.priceLabel}>{t('teacherList.startingPrice')}</Text>
          <Text style={styles.priceValue}>
            {price} AZN<Text style={styles.priceUnit}>{t('teacherList.perHour')}</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const RecentRow = recentList.length > 0 ? (
    <View style={styles.recentWrap}>
      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>{t('teacherList.recentlyViewed')}</Text>
        <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
        {recentList.map((rt, idx) => {
          const grad = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
          const init = rt.name?.[0]?.toUpperCase() ?? '?';
          return (
            <TouchableOpacity
              key={rt.id}
              style={styles.recentItem}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(Routes.TeacherProfile, { teacher: rt })}
            >
              {rt.avatarUrl ? (
                <Image source={{ uri: rt.avatarUrl }} style={styles.recentAvatar} />
              ) : (
                <LinearGradient colors={grad} style={styles.recentAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.recentInitial}>{init}</Text>
                </LinearGradient>
              )}
              <Text style={styles.recentName} numberOfLines={1}>{rt.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  ) : null;

  const PremiumCTA = (
    <View>
      {RecentRow}
      <View style={styles.premiumCta}>
        <View style={styles.premiumCtaContent}>
          <Text style={styles.premiumCtaTitle}>{t('teacherList.ctaTitle')}</Text>
          <Text style={styles.premiumCtaSub}>{t('teacherList.ctaSub')}</Text>
          <TouchableOpacity
            style={styles.premiumCtaBtn}
            activeOpacity={0.85}
            onPress={() => {
              const parent = navigation.getParent() as any;
              if (parent?.navigate) parent.navigate(Routes.AIMentor);
            }}
          >
            <Text style={styles.premiumCtaBtnText}>{t('teacherList.askAi')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.premiumCtaIconBox}>
          <Ionicons name="hardware-chip-outline" size={36} color="rgba(255,255,255,0.9)" />
        </View>
        <View style={styles.premiumCtaBlob} />
      </View>

      <View style={styles.requestRow}>
        <TouchableOpacity
          style={styles.requestCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.LessonRequest as any)}
        >
          <View style={styles.requestIconBoxPrimary}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.requestCardTitle}>{t('teacherList.createRequest')}</Text>
          <Text style={styles.requestCardSub}>{t('teacherList.createRequestSub')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.requestCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.BookingHistory as any)}
        >
          <View style={styles.requestIconBoxSecondary}>
            <Ionicons name="list-outline" size={24} color={Colors.tertiary} />
          </View>
          <Text style={styles.requestCardTitle}>{t('teacherList.myRequests')}</Text>
          <Text style={styles.requestCardSub}>{t('teacherList.myRequestsSub')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : (navigation.getParent() as any)?.navigate(Routes.Home))}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>{t('teacherList.title')}</Text>
        </View>
        <TouchableOpacity
          style={styles.filterIconBtn}
          activeOpacity={0.7}
          hitSlop={8}
          onPress={() => setFilterOpen(true)}
        >
          <Ionicons name="options-outline" size={22} color={Colors.primary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterDot}>
              <Text style={styles.filterDotText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} style={{ marginLeft: 16 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('teacherList.searchPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={10} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.chipScroll}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
        >
          {FILTER_CHIPS.map((item) => {
            const isActive = activeFilter === item;
            const isFavChip = item === 'Sevimlilərim';
            const favCount = favoriteIds.size;
            if (isActive) {
              return (
                <TouchableOpacity key={item} onPress={() => setActiveFilter(item)} activeOpacity={0.85}>
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    style={styles.chipActive}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {item === 'Hamısı' && (
                      <Ionicons name="sparkles" size={14} color="#fff" style={{ marginRight: 4 }} />
                    )}
                    {isFavChip && (
                      <Ionicons name="heart" size={13} color="#fff" style={{ marginRight: 4 }} />
                    )}
                    <Text style={styles.chipTextActive}>{chipLabel(item)}{isFavChip && favCount > 0 ? ` (${favCount})` : ''}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={item}
                style={styles.chip}
                onPress={() => setActiveFilter(item)}
                activeOpacity={0.7}
              >
                {isFavChip && <Ionicons name="heart-outline" size={13} color={Colors.textPrimary} style={{ marginRight: 4 }} />}
                <Text style={styles.chipText}>{chipLabel(item)}{isFavChip && favCount > 0 ? ` (${favCount})` : ''}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {activeFilterChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeChipsRow}
        >
          {activeFilterChips.map((c) => (
            <TouchableOpacity key={c.label} style={styles.activeChip} activeOpacity={0.7} onPress={c.onClear}>
              <Text style={styles.activeChipText}>{c.label}</Text>
              <Ionicons name="close" size={12} color={Colors.primary} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.activeClearAll} activeOpacity={0.7} onPress={resetFilters}>
            <Text style={styles.activeClearAllText}>{t('teacherList.clearAll')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          <View style={styles.row}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
          <View style={styles.row}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(t) => t.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={PremiumCTA}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIllustration}>
                <View style={styles.emptyAura} />
                <View style={styles.emptyCard}>
                  <View style={styles.emptyBadge}>
                    <Ionicons name="search-outline" size={22} color={Colors.primary} />
                    <Text style={styles.emptyBadgeText}>{t('teacherList.notFoundBadge')}</Text>
                  </View>
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    style={styles.emptyIconCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="people-outline" size={48} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={styles.emptyStarL}>✦</Text>
                <Text style={styles.emptyStarR}>✦</Text>
              </View>
              <Text style={styles.emptyTitle}>
                {activeFilter === 'Sevimlilərim' ? t('teacherList.emptyFavTitle') : t('teacherList.emptyTitle')}
              </Text>
              <Text style={styles.emptySub}>
                {activeFilter === 'Sevimlilərim'
                  ? t('teacherList.emptyFavSub')
                  : t('teacherList.emptySub')}
              </Text>
              {activeFilter !== 'Sevimlilərim' && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.emptyClearWrap}
                  onPress={() => { setSearch(''); setActiveFilter('Hamısı'); resetFilters(); }}
                >
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    style={styles.emptyClearBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="funnel-outline" size={18} color="#fff" />
                    <Text style={styles.emptyClearText}>{t('teacherList.clearFilters')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.emptyBackBtn}
                activeOpacity={0.7}
                onPress={() => activeFilter === 'Sevimlilərim' ? setActiveFilter('Hamısı') : navigation.goBack()}
              >
                <Text style={styles.emptyBackText}>
                  {activeFilter === 'Sevimlilərim' ? t('teacherList.viewAllTeachers') : t('teacherList.goBack')}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <Modal
        visible={filterOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterOpen(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('teacherList.filterTitle')}</Text>
              <TouchableOpacity onPress={resetFilters} hitSlop={8}>
                <Text style={styles.sheetReset}>{t('teacherList.reset')}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetSection}>{t('teacherList.sorting')}</Text>
              {([
                { key: 'rating', label: t('teacherList.sortRating'), icon: 'star-outline' },
                { key: 'priceAsc', label: t('teacherList.sortPriceAsc'), icon: 'trending-up-outline' },
                { key: 'priceDesc', label: t('teacherList.sortPriceDesc'), icon: 'trending-down-outline' },
                { key: 'reviews', label: t('teacherList.sortReviews'), icon: 'chatbubbles-outline' },
              ] as const).map((opt) => {
                const active = sortBy === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.sheetRow, active && styles.sheetRowActive]}
                    onPress={() => setSortBy(opt.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={opt.icon as any} size={18} color={active ? Colors.primary : Colors.textSecondary} />
                    <Text style={[styles.sheetRowText, active && styles.sheetRowTextActive]}>{opt.label}</Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              })}

              <Text style={styles.sheetSection}>{t('teacherList.lessonType')}</Text>
              <View style={styles.pillRow}>
                {([
                  { key: 'all', label: t('teacherList.all') },
                  { key: 'online', label: t('teacherList.onlineOpt') },
                  { key: 'in-person', label: t('teacherList.inPersonOpt') },
                ] as const).map((opt) => {
                  const active = formatFilter === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setFormatFilter(opt.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sheetSection}>{t('teacherList.minRatingLabel')}</Text>
              <View style={styles.pillRow}>
                {([
                  { key: 0, label: t('teacherList.all') },
                  { key: 4, label: '4.0+' },
                  { key: 4.5, label: '4.5+' },
                  { key: 4.8, label: '4.8+' },
                ] as const).map((opt) => {
                  const active = minRating === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setMinRating(opt.key as 0 | 4 | 4.5 | 4.8)}
                      activeOpacity={0.7}
                    >
                      {opt.key !== 0 && <Ionicons name="star" size={12} color={active ? '#fff' : '#f59e0b'} style={{ marginRight: 4 }} />}
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sheetSection}>{t('teacherList.cityLabel')}</Text>
              <View style={styles.cityInputWrap}>
                <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.cityInput}
                  placeholder={t('teacherList.cityPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  value={cityFilter}
                  onChangeText={setCityFilter}
                  returnKeyType="done"
                />
                {cityFilter.length > 0 && (
                  <TouchableOpacity onPress={() => setCityFilter('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              {citySuggestions.length > 0 && (
                <View style={styles.suggestList}>
                  {citySuggestions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={styles.suggestRow}
                      onPress={() => setCityFilter(s)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.suggestText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.sheetSection}>{t('teacherList.gender')}</Text>
              <View style={styles.pillRow}>
                {([
                  { key: 'all', label: t('teacherList.all'), icon: 'people-outline' },
                  { key: 'male', label: t('teacherList.male'), icon: 'man-outline' },
                  { key: 'female', label: t('teacherList.female'), icon: 'woman-outline' },
                ] as const).map((opt) => {
                  const active = genderFilter === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setGenderFilter(opt.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={opt.icon as any} size={14} color={active ? '#fff' : Colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sheetSection}>{t('teacherList.ageRangeLabel')}</Text>
              <View style={styles.pillRow}>
                <TouchableOpacity
                  style={[styles.pill, !ageRange && styles.pillActive]}
                  onPress={() => setAgeRange(null)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, !ageRange && styles.pillTextActive]}>{t('teacherList.all')}</Text>
                </TouchableOpacity>
                {AGE_RANGES.map((r) => {
                  const active = ageRange === r.key;
                  return (
                    <TouchableOpacity
                      key={r.key}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setAgeRange(active ? null : r.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{r.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ height: 12 }} />
            </ScrollView>

            <TouchableOpacity activeOpacity={0.85} onPress={() => setFilterOpen(false)}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={styles.sheetApply}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.sheetApplyText}>
                  {t('teacherList.showResults', { count: teachers.length })}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBackBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  filterIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
    position: 'relative',
  },
  filterDot: {
    position: 'absolute', top: -2, right: -2,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primary,
    paddingHorizontal: 4,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surfaceLowest,
  },
  filterDotText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surfaceLowest,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28,
    maxHeight: '85%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.surfaceHigh,
    marginBottom: 16,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  sheetReset: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  sheetSection: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 18, marginBottom: 10 },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 14, marginBottom: 6,
    backgroundColor: Colors.surfaceLow,
  },
  sheetRowActive: { backgroundColor: Colors.primaryLight },
  sheetRowText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  sheetRowTextActive: { color: Colors.primary, fontWeight: '700' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.surfaceLow,
    borderWidth: 1, borderColor: 'transparent',
  },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  pillTextActive: { color: '#fff', fontWeight: '700' },
  cityInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 14, paddingHorizontal: 14, height: 48,
  },
  cityInput: {
    flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0,
  },
  suggestList: {
    marginTop: 6,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderLight,
  },
  suggestText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  sheetApply: {
    marginTop: 18, borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
  },
  sheetApplyText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  searchWrapper: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 20, height: 56,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 16, elevation: 2,
  },
  searchInput: {
    flex: 1, paddingHorizontal: 12, fontSize: 15, color: Colors.textPrimary,
  },

  chipScroll: { height: 64, paddingVertical: 8 },
  chipList: { paddingHorizontal: 16, gap: 10, alignItems: 'center' },
  chipActive: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, height: 44, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  chipTextActive: { fontSize: 13, fontWeight: '700', color: '#fff', lineHeight: 18 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, height: 44, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
    justifyContent: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary, lineHeight: 18 },

  activeChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16, paddingBottom: 8, paddingTop: 2,
    gap: 8, alignItems: 'center',
  },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  activeChipText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  activeClearAll: { paddingHorizontal: 10, paddingVertical: 6 },
  activeClearAllText: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },

  grid: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  row: { gap: 12, marginBottom: 12 },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, overflow: 'hidden',
    padding: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
  },

  cardPremium: {
    borderColor: '#E8B84B', borderWidth: 1.5,
    backgroundColor: '#FFFBF2',
    shadowColor: '#D4901F', shadowOpacity: 0.18, shadowRadius: 16, elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5,
    marginBottom: 6,
  },
  premiumRibbon: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7,
    backgroundColor: '#FFD75E',
    borderWidth: 1, borderColor: '#E8B84B',
  },
  premiumRibbonText: { fontSize: 9, fontWeight: '900', color: '#7A4B00', letterSpacing: 0.6 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7,
  },
  levelBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },

  photoContainer: { position: 'relative', marginBottom: 10 },
  photoBox: {
    width: '100%', aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, overflow: 'hidden',
    backgroundColor: Colors.surfaceContainer,
  },
  photoInitial: { fontSize: 48, fontWeight: '900', color: 'rgba(255,255,255,0.9)' },

  favBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  onlineDot: {
    position: 'absolute', top: 8, left: 8,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  statusBadge: {
    position: 'absolute', bottom: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  statusOnline: { backgroundColor: 'rgba(17,150,218,0.92)' },
  statusInPerson: { backgroundColor: 'rgba(16,185,129,0.92)' },
  statusBoth: { backgroundColor: 'rgba(124,58,237,0.92)' },
  statusBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },
  featuredBadge: {
    position: 'absolute', top: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
    backgroundColor: 'rgba(245,158,11,0.95)',
  },
  featuredBadgeText: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },
  newBadge: {
    position: 'absolute', bottom: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: '#F59E0B',
  },
  newBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, flexShrink: 1 },
  cardNamePremium: { color: '#9A6A12' },
  cardSubject: { fontSize: 11, fontWeight: '500', color: Colors.textMuted, marginTop: 2, marginBottom: 8 },

  metricsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 1 },
  metricStrong: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary },
  metricMuted: { fontSize: 10, fontWeight: '500', color: Colors.textMuted, flexShrink: 1 },

  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  cityText: { fontSize: 10, fontWeight: '500', color: Colors.textMuted, flexShrink: 1 },
  cityDot: { fontSize: 10, fontWeight: '700', color: Colors.textMuted },

  priceFooter: {
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    paddingTop: 10,
  },
  priceLabel: { fontSize: 9, fontWeight: '500', color: Colors.textMuted, marginBottom: 2 },
  priceValue: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  priceUnit: { fontSize: 10, fontWeight: '400', color: Colors.textMuted },

  skeletonCard: { opacity: 0.6 },
  skelPhoto: { width: '100%', aspectRatio: 1, borderRadius: 14, backgroundColor: Colors.surfaceContainer, marginBottom: 10 },
  skelLineLg: { height: 12, borderRadius: 6, backgroundColor: Colors.surfaceContainer, marginBottom: 6, width: '75%' },
  skelLineSm: { height: 8, borderRadius: 4, backgroundColor: Colors.surfaceContainer, marginBottom: 8, width: '55%' },
  skelMetrics: { height: 10, borderRadius: 5, backgroundColor: Colors.surfaceContainer, marginBottom: 10, width: '90%' },

  recentWrap: { marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  recentTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  recentRow: { gap: 12, paddingRight: 8 },
  recentItem: { alignItems: 'center', width: 64 },
  recentAvatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
  },
  recentInitial: { fontSize: 20, fontWeight: '800', color: '#fff' },
  recentName: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },

  premiumCta: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 8,
    borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.primary, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25, shadowRadius: 24, elevation: 6,
  },
  premiumCtaContent: { flex: 1, gap: 8 },
  premiumCtaTitle: { fontSize: 14, fontWeight: '700', color: '#fff', lineHeight: 20 },
  premiumCtaSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 16 },
  premiumCtaBtn: {
    alignSelf: 'flex-start', backgroundColor: '#fff',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
  },
  premiumCtaBtnText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 0.5 },
  premiumCtaIconBox: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  premiumCtaBlob: {
    position: 'absolute', bottom: -16, right: -16,
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  requestRow: {
    flexDirection: 'row', gap: 12,
    marginHorizontal: 16, marginTop: 4, marginBottom: 16,
  },
  requestCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    padding: 14, gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  requestIconBoxPrimary: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  requestIconBoxSecondary: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.tertiaryContainer + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  requestCardTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  requestCardSub: { fontSize: 11, color: Colors.textSecondary, lineHeight: 15 },

  emptyWrap: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32, gap: 16 },
  emptyIllustration: {
    width: 220, height: 220, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  emptyAura: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.primary + '08', borderRadius: 110,
  },
  emptyCard: {
    width: 180, height: 180, backgroundColor: Colors.surfaceLowest, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06, shadowRadius: 32, elevation: 3,
  },
  emptyBadge: {
    position: 'absolute', bottom: -14, right: -10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceLowest, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3,
  },
  emptyBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary },
  emptyIconCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  emptyStarL: { position: 'absolute', top: -8, left: 16, fontSize: 16, color: Colors.primary + '33' },
  emptyStarR: { position: 'absolute', top: 36, right: -8, fontSize: 12, color: Colors.primary + '1A' },

  emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },

  emptyClearWrap: { width: '100%', borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  emptyClearBtn: {
    height: 56, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 3,
  },
  emptyClearText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  emptyBackBtn: { paddingHorizontal: 24, paddingVertical: 12 },
  emptyBackText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
