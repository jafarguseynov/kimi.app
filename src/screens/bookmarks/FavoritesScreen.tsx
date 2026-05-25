import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { getBookmarks, removeBookmark, type Bookmark } from '../../api/bookmark.api';

type Tab = 'teachers' | 'lessons';
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface TeacherMeta {
  name: string;
  subject: string;
  rating: number;
  hourlyRate: number;
  experience?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  tags?: string[];
  reviewCount?: number;
}

function parseTeacher(bm: Bookmark): TeacherMeta {
  let meta: Partial<TeacherMeta> = {};
  try { meta = bm.title ? JSON.parse(bm.title) : {}; } catch { meta = { name: bm.title ?? 'Müəllim' }; }
  return {
    name: meta.name ?? 'Müəllim',
    subject: meta.subject ?? 'Müxtəlif fənlər',
    rating: meta.rating ?? 0,
    hourlyRate: meta.hourlyRate ?? 0,
    experience: meta.experience,
    avatarUrl: meta.avatarUrl,
    isVerified: meta.isVerified,
    tags: meta.tags,
    reviewCount: meta.reviewCount,
  };
}

const initials = (n: string) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const DEFAULT_TAGS: Record<string, string[]> = {
  Riyaziyyat: ['Cəbr', 'Həndəsə', 'SAT Math'],
  'İngilis dili': ['IELTS', 'Danışıq', 'Grammatika'],
  Fizika: ['Mexanika', 'Elektrik', 'Optika'],
};

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<Tab>('teachers');
  const [items, setItems] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBookmarks('teacher')
      .then((d) => { if (!cancelled) setItems(d); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const remove = (bm: Bookmark) => {
    Alert.alert('Sevimlilərdən sil?', '', [
      { text: 'Ləğv et', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          try {
            await removeBookmark(bm.id);
            setItems((p) => p.filter((b) => b.id !== bm.id));
          } catch { /* ignore */ }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Təhsil</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Editorial header */}
        <View style={styles.editorial}>
          <Text style={styles.kicker}>SİZİN KOLLEKSİYANIZ</Text>
          <Text style={styles.heroTitle}>Sevimlilər</Text>
          <Text style={styles.heroSub}>Yadda saxladığınız ən yaxşı mütəxəssislər və dərslər.</Text>
        </View>

        {/* Segmented */}
        <View style={styles.segmented}>
          {(['teachers', 'lessons'] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <TouchableOpacity
                key={t} activeOpacity={0.85}
                style={[styles.segItem, active && styles.segItemActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>
                  {t === 'teachers' ? 'Müəllimlər' : 'Dərslər'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
        ) : tab === 'lessons' ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={42} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Hələ sevimli dərs yoxdur</Text>
            <Text style={styles.emptySub}>Bəyəndiyiniz dərsləri ürək ikonu ilə yadda saxlayın</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={42} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Sevimli müəllim yoxdur</Text>
            <Text style={styles.emptySub}>Müəllim profillərində ürək ikonuna basaraq əlavə edin</Text>
          </View>
        ) : (
          <View style={{ gap: 18 }}>
            {items.map((bm) => {
              const t = parseTeacher(bm);
              const tags = t.tags?.length ? t.tags : (DEFAULT_TAGS[t.subject] ?? []);
              return (
                <View key={bm.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View style={{ flexDirection: 'row', gap: 14, flex: 1 }}>
                      <View style={styles.photoWrap}>
                        {t.avatarUrl ? (
                          <Image source={{ uri: t.avatarUrl }} style={styles.photo} />
                        ) : (
                          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.photo}>
                            <Text style={styles.photoInitial}>{initials(t.name)}</Text>
                          </LinearGradient>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name} numberOfLines={1}>{t.name}</Text>
                          {t.isVerified && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
                        </View>
                        <Text style={styles.expertise}>{t.subject} {t.experience ? `· ${t.experience}` : ''}</Text>
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={14} color="#FBBF24" />
                          <Text style={styles.ratingValue}>{t.rating > 0 ? t.rating.toFixed(1) : 'Yeni'}</Text>
                          {typeof t.reviewCount === 'number' && (
                            <Text style={styles.reviewCount}>({t.reviewCount} rəy)</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.favBtn} activeOpacity={0.85} onPress={() => remove(bm)}>
                      <Ionicons name="heart" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>

                  {tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {tags.map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.priceLabel}>QİYMƏT</Text>
                      <Text style={styles.priceValue}>
                        {t.hourlyRate > 0 ? `${t.hourlyRate} AZN` : '—'}
                        <Text style={styles.priceUnit}>/saat</Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => navigation.getParent()?.navigate('Booking', { screen: Routes.TeacherList })}
                    >
                      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.reserveBtn}>
                        <Text style={styles.reserveBtnText}>Rezerv et</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Kimi suggestion */}
        <View style={styles.suggestion}>
          <Text style={styles.sgTitle}>Daha çoxunu tap!</Text>
          <Text style={styles.sgDesc}>Sizin maraqlarınıza uyğun daha 15 müəllim tapıldı.</Text>
          <TouchableOpacity
            style={styles.sgCta} activeOpacity={0.7}
            onPress={() => navigation.getParent()?.navigate('Booking', { screen: Routes.TeacherList })}
          >
            <Text style={styles.sgCtaText}>Kəşf et</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 96 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.fab}
        onPress={() => navigation.getParent()?.navigate('Booking', { screen: Routes.TeacherList })}
      >
        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabInner}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 24, paddingBottom: 48 },

  editorial: { marginBottom: 32 },
  kicker: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1.5, marginBottom: 8 },
  heroTitle: { fontSize: 40, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.8, lineHeight: 44 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 10, maxWidth: 280, lineHeight: 20 },

  segmented: {
    flexDirection: 'row', backgroundColor: Colors.surfaceLow,
    padding: 6, borderRadius: 999, marginBottom: 32,
  },
  segItem: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center' },
  segItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  segText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  segTextActive: { fontWeight: '700', color: Colors.primary },

  center: { paddingVertical: 60, alignItems: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', maxWidth: 240, lineHeight: 18 },

  /* Card */
  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24, gap: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 3,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  photoWrap: { },
  photo: {
    width: 80, height: 80, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  photoInitial: { color: '#fff', fontSize: 26, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  expertise: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingValue: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  reviewCount: { fontSize: 11, color: Colors.textMuted, marginLeft: 4 },
  favBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '14',
    alignItems: 'center', justifyContent: 'center',
  },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 999, backgroundColor: Colors.surfaceLow,
  },
  tagText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  priceLabel: { fontSize: 10, color: Colors.textMuted, letterSpacing: 1.2, fontWeight: '700' },
  priceValue: { fontSize: 18, fontWeight: '800', color: Colors.primary, marginTop: 2 },
  priceUnit: { fontSize: 12, fontWeight: '400', color: Colors.textSecondary },
  reserveBtn: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3,
  },
  reserveBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  /* Suggestion */
  suggestion: {
    backgroundColor: Colors.primary + '0D', borderRadius: 16, padding: 32, marginTop: 32,
  },
  sgTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, marginBottom: 8 },
  sgDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  sgCta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 14 },
  sgCtaText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  /* FAB */
  fab: {
    position: 'absolute', right: 24, bottom: 32,
    width: 56, height: 56, borderRadius: 28,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  fabInner: { flex: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
