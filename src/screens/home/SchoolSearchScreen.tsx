import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type School = {
  id: string;
  name: string;
  category: string;
  district: string;
  rating: number;
  students: string;
  languages: string;
};

type NearbySchool = {
  id: string;
  name: string;
  distanceLabel: string;
  districtLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  highlight?: boolean;
};

const TOP_SCHOOLS: School[] = [
  { id: '1', name: 'Bakı Müasir Məktəbi',                 category: 'Dövlət Liseyi',    district: 'Nərimanov rayonu', rating: 4.9, students: '850+',  languages: 'Az/Rus/İng' },
  { id: '2', name: '21-ci Əsr Beynəlxalq Təhsil Mərkəzi', category: 'Beynəlxalq',       district: 'Səbail rayonu',    rating: 4.8, students: '720+',  languages: 'Az/İng' },
  { id: '3', name: 'İdrak Liseyi',                        category: 'Özəl Lisey',       district: 'Binəqədi rayonu',  rating: 4.7, students: '480+',  languages: 'Az/Rus' },
  { id: '4', name: 'Bakı Olimpiya Liseyi',                category: 'İxtisaslı Lisey',  district: 'Səbail rayonu',    rating: 4.8, students: '600+',  languages: 'Az/İng' },
  { id: '5', name: 'Gəncə Beynəlxalq Liseyi',             category: 'Beynəlxalq',       district: 'Gəncə şəhəri',     rating: 4.6, students: '520+',  languages: 'Az/İng' },
  { id: '6', name: 'Sumqayıt Elm Akademiyası',            category: 'Elm Akademiyası',  district: 'Sumqayıt, mərkəz', rating: 4.8, students: '1200+', languages: 'Az/İng' },
];

const NEARBY: NearbySchool[] = [
  { id: 'n1', name: '6 nömrəli Məktəb-Lisey',     distanceLabel: '850m',  districtLabel: 'Səbail r.',          icon: 'navigate',          highlight: true },
  { id: 'n2', name: '134 nömrəli Təhsil Kompleksi', distanceLabel: '1.2km', districtLabel: 'İstiqlaliyyət küç.', icon: 'location-outline' },
];

export default function SchoolSearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const user = useUserStore((s) => s.user);
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed.length >= 1
    ? TOP_SCHOOLS.filter(
        (s) =>
          s.name.toLowerCase().includes(trimmed) ||
          s.district.toLowerCase().includes(trimmed) ||
          s.category.toLowerCase().includes(trimmed),
      )
    : [];

  const openSchool = (name: string) =>
    navigation.navigate(Routes.SchoolDetail, { schoolName: name });

  const featured = TOP_SCHOOLS[0];
  const secondaryTop = TOP_SCHOOLS.slice(1, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top app bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="school" size={22} color={Colors.primary} />
          <Text style={styles.headerTitle}>{t('schoolSearch.headerTitle')}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={6}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            {user?.avatarUrl ? null : (
              <Text style={styles.headerAvatarText}>
                {(user?.name?.[0] ?? 'K').toUpperCase()}
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('schoolSearch.searchPlaceholder')}
            placeholderTextColor={Colors.outlineVariant}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.outlineVariant} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="options-outline" size={20} color={Colors.outlineVariant} />
          )}
        </View>

        {filtered.length > 0 || trimmed.length > 0 ? (
          <>
            {/* Motivation banner */}
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.motivBanner}>
              <View style={styles.motivBlob} pointerEvents="none" />
              <Text style={styles.motivTitle}>{t('schoolSearch.motivTitle')}</Text>
              <Text style={styles.motivSub}>{t('schoolSearch.motivSub')}</Text>
            </LinearGradient>

            <View style={styles.section}>
              <Text style={styles.resultsLabel}>{t('schoolSearch.resultsFound', { n: filtered.length })}</Text>
              {filtered.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="search-outline" size={36} color={Colors.outlineVariant} />
                  <Text style={styles.emptyText}>{t('schoolSearch.noResults', { q: query })}</Text>
                </View>
              ) : (
                filtered.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.bigCard}
                    activeOpacity={0.9}
                    onPress={() => openSchool(s.name)}
                  >
                    <LinearGradient colors={GRADIENT} style={styles.bigImage} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name="school" size={48} color="rgba(255,255,255,0.4)" />
                      <View style={styles.bigRatingPill}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>{s.rating}</Text>
                      </View>
                    </LinearGradient>
                    <View style={styles.bigBody}>
                      <Text style={styles.bigName} numberOfLines={2}>{s.name}</Text>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.locationText}>{s.district}</Text>
                      </View>
                      <View style={styles.bigStatsRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.statColLabel}>{t('schoolSearch.studentCount')}</Text>
                          <View style={styles.statColValueRow}>
                            <Ionicons name="people" size={14} color={Colors.primary} />
                            <Text style={styles.statColValue}>{s.students}</Text>
                          </View>
                        </View>
                        <View style={styles.statColDivider} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.statColLabel}>{t('schoolSearch.teaching')}</Text>
                          <Text style={styles.statColStandalone}>{s.languages}</Text>
                        </View>
                        <TouchableOpacity style={styles.bigArrowBtn} activeOpacity={0.7} onPress={() => openSchool(s.name)}>
                          <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            {/* Kimi mascot suggestion */}
            <View style={styles.kimiCard}>
              <View style={styles.kimiOrb} pointerEvents="none" />
              <LinearGradient colors={GRADIENT} style={styles.kimiAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="sparkles" size={26} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.kimiPrefix}>{t('schoolSearch.kimiSays')}</Text>
                <Text style={styles.kimiMsg}>{t('schoolSearch.kimiMsg')}</Text>
              </View>
            </View>

            {/* Top schools — bento */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>{t('schoolSearch.topSchools')}</Text>
                  <Text style={styles.sectionSub}>{t('schoolSearch.topSchoolsSub')}</Text>
                </View>
                <TouchableOpacity hitSlop={8} onPress={() => navigation.navigate(Routes.SchoolRanking)}>
                  <Text style={styles.sectionLink}>{t('schoolSearch.seeAll')}</Text>
                </TouchableOpacity>
              </View>

              {/* Featured card */}
              <TouchableOpacity activeOpacity={0.88} style={styles.featuredCard} onPress={() => openSchool(featured.name)}>
                <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featuredImage}>
                  <Ionicons name="school" size={56} color="rgba(255,255,255,0.45)" />
                  <View style={styles.ratingFloat}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.ratingFloatText}>{featured.rating}</Text>
                  </View>
                </LinearGradient>
                <View style={styles.featuredBody}>
                  <Text style={styles.featuredCategory}>{featured.category.toUpperCase()}</Text>
                  <Text style={styles.featuredName}>{featured.name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.locationText}>{featured.district}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Secondary cards */}
              <View style={{ gap: 12 }}>
                {secondaryTop.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.secondaryCard}
                    activeOpacity={0.85}
                    onPress={() => openSchool(s.name)}
                  >
                    <LinearGradient colors={GRADIENT} style={styles.secondaryImage} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name="school-outline" size={28} color="rgba(255,255,255,0.55)" />
                    </LinearGradient>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.secondaryRating}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>{s.rating}</Text>
                      </View>
                      <Text style={styles.secondaryName} numberOfLines={2}>{s.name}</Text>
                      <Text style={styles.secondaryMeta}>{s.district}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Nearby schools */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>{t('schoolSearch.nearbyTitle')}</Text>
                  <Text style={styles.sectionSub}>{t('schoolSearch.nearbySub')}</Text>
                </View>
              </View>
              <View style={{ gap: 12 }}>
                {NEARBY.map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    style={styles.nearbyCard}
                    activeOpacity={0.85}
                    onPress={() => openSchool(n.name)}
                  >
                    {n.highlight ? (
                      <LinearGradient colors={GRADIENT} style={styles.nearbyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Ionicons name={n.icon} size={20} color="#fff" />
                      </LinearGradient>
                    ) : (
                      <View style={[styles.nearbyIcon, styles.nearbyIconLight]}>
                        <Ionicons name={n.icon} size={20} color={Colors.primary} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nearbyName} numberOfLines={1}>{n.name}</Text>
                      <Text style={styles.nearbyMeta}>{n.distanceLabel} • {n.districtLabel}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* CTA — ask Kimi */}
            <View style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>{t('schoolSearch.ctaTitle')}</Text>
              <Text style={styles.ctaSub}>{t('schoolSearch.ctaSub')}</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => (navigation.getParent() as any)?.navigate(Routes.AIMentor)}
              >
                <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
                  <Ionicons name="sparkles" size={16} color="#fff" />
                  <Text style={styles.ctaBtnText}>{t('schoolSearch.askKimi')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Map FAB */}
      <TouchableOpacity activeOpacity={0.88} style={styles.fab} onPress={() => navigation.navigate(Routes.SchoolRanking)}>
        <LinearGradient colors={GRADIENT} style={styles.fabInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="map" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary + '55',
  },
  headerAvatarText: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 24, paddingTop: 16, gap: 24 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18,
    paddingHorizontal: 16, paddingVertical: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary, padding: 0 },

  /* Kimi suggestion */
  kimiCard: {
    backgroundColor: Colors.primary + '12', borderRadius: 18,
    padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    overflow: 'hidden', position: 'relative',
  },
  kimiOrb: {
    position: 'absolute', right: -32, bottom: -32,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: Colors.primary + '14',
  },
  kimiAvatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 4,
  },
  kimiPrefix: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  kimiMsg: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, lineHeight: 20 },

  /* Section */
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  sectionSub: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  sectionLink: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  /* Featured */
  featuredCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2,
  },
  featuredImage: {
    aspectRatio: 4 / 3,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  ratingFloat: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  ratingFloatText: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary },
  featuredBody: { padding: 18, gap: 4 },
  featuredCategory: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.2, marginBottom: 4 },
  featuredName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  /* Secondary */
  secondaryCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  secondaryImage: {
    width: 76, height: 76, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary },
  secondaryName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, lineHeight: 18 },
  secondaryMeta: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },

  /* Nearby */
  nearbyCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  nearbyIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  nearbyIconLight: { backgroundColor: '#fff' },
  nearbyName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  nearbyMeta: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },

  /* CTA dark */
  ctaCard: {
    backgroundColor: '#0B0F10', borderRadius: 20,
    padding: 28, alignItems: 'center', gap: 8,
    overflow: 'hidden',
  },
  ctaTitle: { fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -0.3 },
  ctaSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 19, marginBottom: 12, maxWidth: 280 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 28, paddingVertical: 13, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 4,
  },
  ctaBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  /* Search results */
  resultsLabel: {
    fontSize: 11, fontWeight: '800', color: Colors.outline,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  motivBanner: {
    borderRadius: 20, padding: 24, overflow: 'hidden', gap: 6,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 4,
  },
  motivBlob: {
    position: 'absolute', bottom: -40, right: -40,
    width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  motivTitle: { fontSize: 17, fontWeight: '800', color: '#fff', lineHeight: 24 },
  motivSub: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.85)', lineHeight: 18 },

  bigCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2,
  },
  bigImage: { height: 140, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bigRatingPill: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  bigBody: { padding: 18, gap: 8 },
  bigName: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, lineHeight: 22 },
  bigStatsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 14, marginTop: 6,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    gap: 8,
  },
  statColLabel: { fontSize: 9, fontWeight: '800', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 1 },
  statColValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statColValue: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  statColStandalone: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  statColDivider: { width: 1, height: 32, backgroundColor: Colors.borderLight, marginHorizontal: 4 },
  bigArrowBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },

  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  /* FAB */
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 18, elevation: 8,
  },
  fabInner: {
    flex: 1, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
});
