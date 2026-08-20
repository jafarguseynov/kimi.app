import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { premiumRouteFor } from '../../config/iap';
import {
  listOpenRequests,
  expressInterest,
  type PublicLessonRequest,
} from '../../api/lessonRequest.api';
import { useTranslation } from '../../i18n';
import { timeAgo } from '../../utils/timeAgo';
import SuccessOverlay from '../../components/common/SuccessOverlay';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.AllOpenRequests>;
  /**
   * §20 — "Sorğular" tabının içində nested tab kimi göstərildikdə true olur:
   * ekran öz SafeArea + başlıq sətrini çəkmir (kənar ekran onsuz da çəkir).
   * Siyahı, filtr və müraciət məntiqi tamamilə eyni qalır.
   */
  embedded?: boolean;
};

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const SUBJECT_FILTERS = ['Hamısı', 'Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'İngilis dili', 'Azərbaycan dili', 'Tarix', 'İbtidai'];

// `timeAgo` müəllim iş panelində də lazım oldu → `utils/timeAgo`-ya çıxarıldı.

function isNew(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 60 * 60 * 1000;
}

export default function AllOpenRequestsScreen({ navigation, embedded = false }: Props) {
  // Embedded rejimdə SafeArea kənar ekranda tətbiq olunub — ikiqat boşluq olmasın.
  const Shell: any = embedded ? View : SafeAreaView;
  const { t } = useTranslation();
  const { user } = useUserStore();
  const isTeacher = user?.role === 'teacher';
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Hamısı');
  const [successVisible, setSuccessVisible] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery<PublicLessonRequest[]>({
    queryKey: ['openLessonRequests', 'all'],
    queryFn: () => listOpenRequests().catch(() => [] as PublicLessonRequest[]),
  });

  const requests: PublicLessonRequest[] = Array.isArray(data) ? data : [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (subjectFilter !== 'Hamısı') {
        const sub = (r.subject ?? '').toLowerCase();
        if (!sub.includes(subjectFilter.toLowerCase())) return false;
      }
      if (q) {
        const hay = `${r.subject ?? ''} ${r.topic ?? ''} ${r.note ?? ''} ${r.grade ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, search, subjectFilter]);

  const handleInterest = async (id: string) => {
    if (!isTeacher) {
      Alert.alert(t('allOpenRequests.alertTeacherTitle'), t('allOpenRequests.alertTeacherMsg'));
      return;
    }
    try {
      await expressInterest(id);
      setSuccessVisible(true);
      refetch();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (msg === 'SUBSCRIPTION_REQUIRED' || e?.response?.status === 403) {
        Alert.alert(t('allOpenRequests.alertPremiumTitle'), t('allOpenRequests.alertPremiumMsg'), [
          { text: t('allOpenRequests.cancel'), style: 'cancel' },
          { text: t('allOpenRequests.buyPlan'), onPress: () => navigation.navigate(premiumRouteFor('teacher')) },
        ]);
      } else {
        Alert.alert(t('allOpenRequests.alertErrorTitle'), msg || t('allOpenRequests.alertErrorMsg'));
      }
    }
  };

  const openCreate = () => {
    navigation.getParent()?.navigate('Booking', { screen: Routes.LessonRequest });
  };

  return (
    <Shell style={styles.container} {...(embedded ? {} : { edges: ['top'] as const })}>
      {/* Header — embedded rejimdə kənar ekranın başlığı işlədilir */}
      {!embedded && (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('allOpenRequests.headerTitle')}</Text>
        {!isTeacher ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate(Routes.MyRequests)}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Ionicons name="folder-open-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>
      )}

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {/* Editorial hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{t('allOpenRequests.heroTitle')}</Text>
            <Text style={styles.heroSub}>
              {isTeacher
                ? t('allOpenRequests.heroSubTeacher')
                : t('allOpenRequests.heroSubStudent')}
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={Colors.textMuted} style={{ marginLeft: 14 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('allOpenRequests.searchPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={8} style={{ paddingRight: 12 }}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsList}>
            {SUBJECT_FILTERS.map((chip) => {
              const active = subjectFilter === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  onPress={() => setSubjectFilter(chip)}
                  activeOpacity={0.85}
                  style={active ? styles.chipActiveWrap : styles.chip}
                >
                  {active ? (
                    <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipActive}>
                      <Text style={styles.chipActiveText}>{chip === 'Hamısı' ? t('allOpenRequests.all') : chip}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.chipText}>{chip === 'Hamısı' ? t('allOpenRequests.all') : chip}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.countLabel}>
            {t('allOpenRequests.countLabel', { n: filtered.length })} {search || subjectFilter !== 'Hamısı' ? t('allOpenRequests.filtered') : ''}
          </Text>

          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={42} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>{t('allOpenRequests.emptyTitle')}</Text>
              <Text style={styles.emptySub}>
                {search || subjectFilter !== 'Hamısı'
                  ? t('allOpenRequests.emptyFiltered')
                  : t('allOpenRequests.emptyDefault')}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filtered.map((r) => {
                const fresh = isNew(r.createdAt);
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.card}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate(Routes.LessonRequestDetail, { requestId: r.id })}
                  >
                    <LinearGradient colors={['#0EA5E9', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardAccent} />
                    <View style={styles.cardTopRow}>
                      {fresh ? (
                        <View style={[styles.statusPill, styles.newPill]}>
                          <Text style={styles.newPillText}>{t('allOpenRequests.newBadge')}</Text>
                        </View>
                      ) : (
                        <View style={styles.statusDot} />
                      )}
                      <Text style={styles.timeText}>{timeAgo(r.createdAt, t)}</Text>
                    </View>

                    <View style={styles.titleRow}>
                      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.titleIconChip}>
                        <Ionicons name="book" size={18} color="#fff" />
                      </LinearGradient>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {r.topic || r.subject}
                      </Text>
                    </View>

                    <View style={styles.metaChipsWrap}>
                      <View style={[styles.metaChip, styles.metaChipPrimary]}>
                        <Ionicons name="book-outline" size={13} color={Colors.primary} />
                        <Text style={[styles.metaChipText, styles.metaChipPrimaryText]}>{r.subject}</Text>
                      </View>
                      {!!r.grade && (
                        <View style={styles.metaChip}>
                          <Ionicons name="school-outline" size={13} color="#7C3AED" />
                          <Text style={styles.metaChipText}>{r.grade}</Text>
                        </View>
                      )}
                      {!!r.format && (
                        <View style={styles.metaChip}>
                          <Ionicons name="laptop-outline" size={13} color="#0EA5E9" />
                          <Text style={styles.metaChipText}>{r.format}</Text>
                        </View>
                      )}
                      {!!r.frequency && (
                        <View style={styles.metaChip}>
                          <Ionicons name="repeat-outline" size={13} color="#F59E0B" />
                          <Text style={styles.metaChipText}>{t('allOpenRequests.freqUnit', { n: r.frequency })}</Text>
                        </View>
                      )}
                    </View>

                    {!!r.note && (
                      <View style={styles.noteBox}>
                        <Text style={styles.noteText} numberOfLines={3}>
                          <Text style={styles.noteLabel}>{t('allOpenRequests.noteLabel')}</Text>
                          "{r.note}"
                        </Text>
                      </View>
                    )}

                    <View style={styles.cardFooter}>
                      <View style={styles.cardFooterLeft}>
                        <Ionicons name="person-circle-outline" size={18} color={Colors.textMuted} />
                        <Text style={styles.studentText} numberOfLines={1}>{r.studentName}</Text>
                        <View style={styles.dotSep} />
                        <Ionicons name="people" size={13} color="#10B981" />
                        <Text style={styles.interestedText}>{r.interestedCount}</Text>
                      </View>
                      <TouchableOpacity activeOpacity={0.85} onPress={() => handleInterest(r.id)}>
                        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.interestBtn}>
                          <Ionicons name={isTeacher ? 'hand-right' : 'eye'} size={14} color="#fff" />
                          <Text style={styles.interestBtnText}>{isTeacher ? t('allOpenRequests.interested') : t('allOpenRequests.view')}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Inline "Create your own" CTA card */}
              {!isTeacher && (
                <TouchableOpacity activeOpacity={0.85} onPress={openCreate} style={styles.ctaCard}>
                  <View style={styles.ctaIconCircle}>
                    <Ionicons name="add" size={28} color={Colors.primary} />
                  </View>
                  <Text style={styles.ctaTitle}>{t('allOpenRequests.ctaTitle')}</Text>
                  <Text style={styles.ctaSub}>{t('allOpenRequests.ctaSub')}</Text>
                  <View style={styles.ctaBtn}>
                    <Text style={styles.ctaBtnText}>{t('allOpenRequests.ctaBtn')}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}

      <SuccessOverlay
        visible={successVisible}
        title={t('allOpenRequests.alertSuccessTitle')}
        message={t('allOpenRequests.alertSuccessMsg')}
        onClose={() => setSuccessVisible(false)}
      />

      {/* FAB for students */}
      {!isTeacher && (
        <TouchableOpacity style={styles.fabWrap} activeOpacity={0.9} onPress={openCreate}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </Shell>
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
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 20, paddingBottom: 120, gap: 16 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  hero: { gap: 6, marginBottom: 4 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  searchInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, fontSize: 14, color: Colors.textPrimary },

  chipsList: { gap: 8, paddingVertical: 2 },
  chipActiveWrap: { borderRadius: 999, overflow: 'hidden' },
  chipActive: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  chipActiveText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  chip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  countLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },

  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', maxWidth: 240 },

  card: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 18, padding: 18, paddingTop: 20, gap: 12,
    overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 3,
  },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleIconChip: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  newPill: { backgroundColor: '#D1FAE5' },
  newPillText: { fontSize: 9, fontWeight: '800', color: '#047857', letterSpacing: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.outlineVariant },
  timeText: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },

  cardTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, lineHeight: 23 },

  metaChipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  metaChipPrimary: { backgroundColor: Colors.primaryLight },
  metaChipText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  metaChipPrimaryText: { color: Colors.primary, fontWeight: '800' },

  noteBox: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 12, padding: 12,
  },
  noteText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, fontStyle: 'italic' },
  noteLabel: { fontWeight: '700', color: Colors.textPrimary, fontStyle: 'normal' },

  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: 8,
  },
  cardFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  studentText: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, maxWidth: 100 },
  dotSep: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.outlineVariant, marginHorizontal: 4 },
  interestedText: { fontSize: 12, fontWeight: '800', color: '#059669' },

  interestBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  interestBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },

  ctaCard: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 18, padding: 24,
    borderWidth: 2, borderColor: Colors.primaryFixed + '66',
    borderStyle: 'dashed',
    alignItems: 'center', gap: 8,
  },
  ctaIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  ctaTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  ctaSub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', maxWidth: 220, lineHeight: 17 },
  ctaBtn: {
    marginTop: 8,
    paddingHorizontal: 22, paddingVertical: 9, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.primary,
  },
  ctaBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  fabWrap: {
    position: 'absolute', right: 20, bottom: 32,
    borderRadius: 28,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
});
