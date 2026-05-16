import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
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

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects?: string[];
  hourlyRate?: number;
  rating?: number;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2;

const FILTER_CHIPS = ['Hamısı', 'Fənn', 'Sinif', 'Qiymət', 'Şəhər', 'Reytinq', 'Dərs formatı'];

const AVATAR_GRADIENTS: [string, string][] = [
  [Colors.gradientStart, Colors.gradientEnd],
  ['#006947', '#58e7ab'],
  ['#7C3AED', '#A78BFA'],
  ['#EA580C', '#FCA372'],
  ['#0369A1', '#38BDF8'],
  ['#9333EA', '#D946EF'],
];

export default function TeacherListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Hamısı');

  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ['teachers', search],
    queryFn: () =>
      api.get('/user/teachers', { params: { q: search } }).then((r) => r.data),
  });

  const renderCard = ({ item, index }: { item: Teacher; index: number }) => {
    const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
    const initial = item.name?.[0]?.toUpperCase() ?? '?';
    const subject = item.subjects?.[0] ?? 'Ümumi';
    const price = item.hourlyRate != null ? `${item.hourlyRate} AZN` : '15 AZN';
    const rating = item.rating?.toFixed(1) ?? '4.8';
    const isOnline = index % 3 !== 1;

    return (
      <TouchableOpacity
        style={[styles.card, { width: CARD_WIDTH }]}
        onPress={() => navigation.navigate(Routes.TeacherProfile, { teacher: item })}
        activeOpacity={0.85}
      >
        {/* Photo area */}
        <View style={styles.photoContainer}>
          <LinearGradient colors={gradient} style={styles.photoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.photoInitial}>{initial}</Text>
          </LinearGradient>
          <TouchableOpacity style={styles.heartBtn} activeOpacity={0.8} hitSlop={4}>
            <Ionicons name="heart-outline" size={15} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.modeBadge, { backgroundColor: isOnline ? Colors.primary + 'E8' : Colors.tertiary + 'E8' }]}>
            <Text style={styles.modeBadgeText}>{isOnline ? 'ONLAYN' : 'ƏYANİ'}</Text>
          </View>
        </View>

        {/* Card body */}
        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
          </View>
          <Text style={styles.cardSubject}>{subject}</Text>
          <View style={styles.ratingStatRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingStatValue}>{rating}</Text>
            <View style={styles.eyeStatRow}>
              <Ionicons name="eye-outline" size={12} color={Colors.outlineVariant} />
              <Text style={styles.viewsStatText}>1.2k</Text>
            </View>
          </View>
        </View>

        {/* Price footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.priceFooterLabel}>Başlayan qiymət</Text>
          <Text style={styles.priceFooterValue}>{price}<Text style={styles.priceFooterUnit}>/saat</Text></Text>
        </View>
      </TouchableOpacity>
    );
  };

  const PremiumCTA = (
    <View style={styles.premiumCta}>
      <View style={styles.premiumCtaContent}>
        <Text style={styles.premiumCtaTitle}>Mükəmməl müəllimi tapmaqda çətinlik çəkirsiniz?</Text>
        <Text style={styles.premiumCtaSub}>AI köməkçimiz sizin üçün ən uyğun mütəxəssisi saniyələr ərzində müəyyən edəcək.</Text>
        <TouchableOpacity style={styles.premiumCtaBtn} activeOpacity={0.85}>
          <Text style={styles.premiumCtaBtnText}>AI-DAN SORUŞ</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.premiumCtaIconBox}>
        <Ionicons name="hardware-chip-outline" size={36} color="rgba(255,255,255,0.9)" />
      </View>
      <View style={styles.premiumCtaBlob} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Müəllim Tap</Text>
        </View>
        <TouchableOpacity style={styles.filterIconBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} style={{ marginLeft: 16 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Müəllim axtar..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={FILTER_CHIPS}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        style={styles.chipScroll}
        renderItem={({ item }) => {
          const isActive = activeFilter === item;
          if (isActive) {
            return (
              <TouchableOpacity onPress={() => setActiveFilter(item)} activeOpacity={0.85}>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.chipActive}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {item === 'Hamısı' && (
                    <Ionicons name="sparkles" size={14} color="#fff" style={{ marginRight: 4 }} />
                  )}
                  <Text style={styles.chipTextActive}>{item}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              style={styles.chip}
              onPress={() => setActiveFilter(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Teacher grid */}
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(t) => t.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={teachers.length > 0 ? PremiumCTA : null}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIllustration}>
                <View style={styles.emptyAura} />
                <View style={styles.emptyCard}>
                  <View style={styles.emptyBadge}>
                    <Ionicons name="search-outline" size={22} color={Colors.primary} />
                    <Text style={styles.emptyBadgeText}>Tapılmadı</Text>
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
              <Text style={styles.emptyTitle}>Müəllim tapılmadı</Text>
              <Text style={styles.emptySub}>
                Axtarış meyarlarınıza uyğun müəllim tapılmadı. Zəhmət olmasa filtrləri dəyişin.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.emptyClearWrap}
                onPress={() => { setSearch(''); setActiveFilter('Hamısı'); }}
              >
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.emptyClearBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="funnel-outline" size={18} color="#fff" />
                  <Text style={styles.emptyClearText}>Filtrləri təmizlə</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emptyBackBtn}
                activeOpacity={0.7}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.emptyBackText}>Geri qayıt</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  },

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

  chipScroll: { flexGrow: 0 },
  chipList: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  chipActive: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  chipTextActive: { fontSize: 13, fontWeight: '700', color: '#fff' },
  chip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },

  grid: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  row: { gap: 12, marginBottom: 12 },

  card: {
    backgroundColor: Colors.surface, borderRadius: 20, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },

  photoContainer: { position: 'relative' },
  photoBox: {
    width: '100%', aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  photoInitial: { fontSize: 48, fontWeight: '900', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' },
  heartBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  modeBadge: {
    position: 'absolute', bottom: 8, left: 8,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
  },
  modeBadgeText: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  cardBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardName: { flex: 1, fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  cardSubject: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  ratingStatRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingStatValue: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },
  eyeStatRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 4 },
  viewsStatText: { fontSize: 10, fontWeight: '500', color: Colors.outlineVariant },

  cardFooter: {
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    marginTop: 4, gap: 2,
  },
  priceFooterLabel: { fontSize: 9, fontWeight: '500', color: Colors.textMuted },
  priceFooterValue: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  priceFooterUnit: { fontSize: 10, fontWeight: '400', color: Colors.textMuted },

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

  // Empty state
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
