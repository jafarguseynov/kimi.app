import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import {
  getBookmarks,
  removeBookmark,
  type Bookmark,
  type BookmarkTargetType,
} from '../../api/bookmark.api';
import { useRecentTeachersStore, type RecentTeacher } from '../../store/recentTeachers.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const DATE_LOCALE: Record<string, string> = { az: 'az-AZ', ru: 'ru-RU', en: 'en-US' };

type MainTab = 'saved' | 'recent';
type SubTab = 'teacher' | 'request';

const SUBJECT_COLORS: Record<string, { bg: string; fg: string }> = {
  Riyaziyyat: { bg: '#eaf4ff', fg: '#006190' },
  Fizika: { bg: '#dcfce7', fg: '#006947' },
  'İngilis dili': { bg: '#fef3c7', fg: '#D97706' },
  Kimya: { bg: '#f3e8ff', fg: '#7c3aed' },
  Biologiya: { bg: '#fce7f3', fg: '#be185d' },
};

interface TeacherMeta {
  name: string;
  subject: string;
  rating: number;
  experience: string;
  hourlyRate: number;
  avatarUrl?: string;
  isVerified?: boolean;
}

interface RequestMeta {
  title: string;
  subject: string;
  status: 'active' | 'finished';
  grade?: string;
  priceRange?: string;
  dateLabel?: string;
}

export default function BookmarksScreen() {
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const [mainTab, setMainTab] = useState<MainTab>('saved');
  const [subTab, setSubTab] = useState<SubTab>('teacher');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const recentTeachers = useRecentTeachersStore((s) => s.list);
  const clearRecentTeachers = useRecentTeachersStore((s) => s.clear);

  const fetchBookmarks = useCallback(async (type: BookmarkTargetType) => {
    try {
      const data = await getBookmarks(type);
      setBookmarks(data);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab === 'saved') {
      setLoading(true);
      fetchBookmarks(subTab);
    } else {
      setLoading(false);
    }
  }, [subTab, mainTab, fetchBookmarks]);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  const handleRefresh = () => {
    if (mainTab === 'saved') {
      setRefreshing(true);
      fetchBookmarks(subTab);
    }
  };

  const handleRemove = (bm: Bookmark) => {
    Alert.alert(t('bookmarks.removeTitle'), t('bookmarks.removeMsg', { title: bm.title ?? t('bookmarks.defaultBookmark') }), [
      { text: t('bookmarks.cancel'), style: 'cancel' },
      {
        text: t('bookmarks.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removeBookmark(bm.id);
            setBookmarks((prev) => prev.filter((b) => b.id !== bm.id));
          } catch {
            Alert.alert(t('bookmarks.errorTitle'), t('bookmarks.removeFailed'));
          }
        },
      },
    ]);
  };

  const parseTeacher = (bm: Bookmark): TeacherMeta => {
    let meta: Partial<TeacherMeta> = {};
    try { meta = bm.title ? JSON.parse(bm.title) : {}; } catch { meta = { name: bm.title ?? t('bookmarks.defaultTeacher') }; }
    return {
      name: meta.name ?? bm.title ?? t('bookmarks.defaultTeacher'),
      subject: meta.subject ?? t('bookmarks.variousSubjects'),
      rating: meta.rating ?? 0,
      experience: meta.experience ?? '—',
      hourlyRate: meta.hourlyRate ?? 0,
      avatarUrl: meta.avatarUrl,
      isVerified: meta.isVerified ?? false,
    };
  };

  const parseRequest = (bm: Bookmark): RequestMeta => {
    let meta: Partial<RequestMeta> = {};
    try { meta = bm.title ? JSON.parse(bm.title) : {}; } catch { meta = { title: bm.title ?? t('bookmarks.defaultRequest') }; }
    return {
      title: meta.title ?? bm.title ?? t('bookmarks.defaultRequest'),
      subject: meta.subject ?? t('bookmarks.generalSubject'),
      status: meta.status ?? 'active',
      grade: meta.grade,
      priceRange: meta.priceRange,
      dateLabel: meta.dateLabel ?? formatRelative(bm.createdAt),
    };
  };

  const formatRelative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return t('bookmarks.relToday');
    if (days === 1) return t('bookmarks.relYesterday');
    if (days < 7) return t('bookmarks.relDays', { n: days });
    return new Date(iso).toLocaleDateString(DATE_LOCALE[language] ?? 'az-AZ', { day: 'numeric', month: 'short' });
  };

  const initials = (name: string) =>
    name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const subjectChip = (subject: string) => {
    const c = SUBJECT_COLORS[subject] ?? { bg: Colors.primaryLight, fg: Colors.primary };
    return (
      <View style={[styles.subjectChip, { backgroundColor: c.bg }]}>
        <Text style={[styles.subjectChipText, { color: c.fg }]}>{subject.toUpperCase()}</Text>
      </View>
    );
  };

  const renderTeacherCard = (bm: Bookmark) => {
    const teacher = parseTeacher(bm);
    return (
      <View key={bm.id} style={styles.teacherCard}>
        <View style={styles.teacherPhotoWrap}>
          {teacher.avatarUrl ? (
            <Image source={{ uri: teacher.avatarUrl }} style={styles.teacherPhoto} />
          ) : (
            <LinearGradient colors={GRADIENT} style={styles.teacherPhoto} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.teacherPhotoInitial}>{initials(teacher.name)}</Text>
            </LinearGradient>
          )}
          {teacher.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.teacherBody}>
          <View style={styles.teacherTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.teacherName} numberOfLines={1}>{teacher.name}</Text>
              <Text style={styles.teacherSubject}>{teacher.subject.toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(bm)} hitSlop={8}>
              <Ionicons name="bookmark" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.teacherMetaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.metaTextBold}>{teacher.rating > 0 ? teacher.rating.toFixed(1) : t('bookmarks.ratingNew')}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.metaText}>{teacher.experience}</Text>
            </View>
          </View>
          <View style={styles.teacherFooter}>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{teacher.hourlyRate > 0 ? `${teacher.hourlyRate} AZN` : '—'}</Text>
              <Text style={styles.priceUnit}>{t('bookmarks.perHour')}</Text>
            </View>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() =>
                navigation.navigate('Booking', {
                  screen: Routes.TeacherProfile,
                  params: {
                    teacher: {
                      id: bm.targetId,
                      name: teacher.name,
                      avatarUrl: teacher.avatarUrl,
                      subjects: teacher.subject ? [teacher.subject] : [],
                      hourlyRate: teacher.hourlyRate,
                      rating: teacher.rating,
                      experience: teacher.experience,
                      isVerified: teacher.isVerified,
                    },
                  },
                })
              }
            >
              <Text style={styles.viewBtnText}>{t('bookmarks.viewProfile')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderRequestCard = (bm: Bookmark) => {
    const r = parseRequest(bm);
    const c = SUBJECT_COLORS[r.subject] ?? { bg: Colors.primaryLight, fg: Colors.primary };
    return (
      <View key={bm.id} style={styles.requestCard}>
        <TouchableOpacity onPress={() => handleRemove(bm)} hitSlop={8} style={styles.bookmarkAbs}>
          <Ionicons name="bookmark" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.requestTopRow}>
          <View style={[styles.requestIcon, { backgroundColor: c.bg }]}>
            <Ionicons name={subjectIcon(r.subject)} size={22} color={c.fg} />
          </View>
          <View style={{ flex: 1, paddingRight: 28 }}>
            <View style={styles.badgeRow}>
              {subjectChip(r.subject)}
              <View style={[styles.statusBadge, r.status === 'active' ? styles.statusActive : styles.statusFinished]}>
                <Text style={[styles.statusText, r.status === 'active' ? styles.statusActiveText : styles.statusFinishedText]}>
                  {r.status === 'active' ? t('bookmarks.statusActive') : t('bookmarks.statusFinished')}
                </Text>
              </View>
            </View>
            <Text style={styles.requestTitle} numberOfLines={2}>{r.title}</Text>
          </View>
        </View>
        <View style={styles.requestChipsRow}>
          {r.grade && (
            <View style={styles.requestChip}>
              <Ionicons name="school-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.requestChipText}>{r.grade}</Text>
            </View>
          )}
          {r.priceRange && (
            <View style={styles.requestChip}>
              <Ionicons name="cash-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.requestChipText}>{r.priceRange}</Text>
            </View>
          )}
          <View style={[styles.requestChip, { marginLeft: 'auto' }]}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.requestChipText}>{r.dateLabel}</Text>
          </View>
        </View>
      </View>
    );
  };

  const subjectIcon = (subj: string): keyof typeof Ionicons.glyphMap => {
    if (subj.includes('Riyaz')) return 'calculator-outline';
    if (subj.includes('Fizika')) return 'flash-outline';
    if (subj.includes('İngilis') || subj.includes('dili')) return 'language-outline';
    if (subj.includes('Kimya')) return 'flask-outline';
    if (subj.includes('Biologiya')) return 'leaf-outline';
    return 'book-outline';
  };

  const isSavedEmpty = !loading && bookmarks.length === 0;
  const isRecentTeacherEmpty = recentTeachers.length === 0;

  const dayBucket = (ts: number): 'today' | 'yesterday' | 'week' | 'older' => {
    const now = new Date();
    const d = new Date(ts);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const sevenDays = startOfToday - 6 * 86400000;
    if (ts >= startOfToday) return 'today';
    if (ts >= startOfYesterday) return 'yesterday';
    if (ts >= sevenDays) return 'week';
    return 'older';
  };

  const bucketLabel = (b: 'today' | 'yesterday' | 'week' | 'older') =>
    b === 'today' ? t('bookmarks.bucketToday') : b === 'yesterday' ? t('bookmarks.bucketYesterday') : b === 'week' ? t('bookmarks.bucketWeek') : t('bookmarks.bucketOlder');

  const groupedRecent = (() => {
    const groups: Record<string, RecentTeacher[]> = { today: [], yesterday: [], week: [], older: [] };
    recentTeachers.forEach((t) => {
      groups[dayBucket(t.viewedAt)].push(t);
    });
    return (['today', 'yesterday', 'week', 'older'] as const)
      .map((k) => ({ key: k, label: bucketLabel(k), items: groups[k] }))
      .filter((g) => g.items.length > 0);
  })();

  const relativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('bookmarks.relNow');
    if (mins < 60) return t('bookmarks.relMin', { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('bookmarks.relHour', { n: hours });
    const days = Math.floor(hours / 24);
    if (days === 1) return t('bookmarks.relYesterday');
    if (days < 7) return t('bookmarks.relDays', { n: days });
    return new Date(ts).toLocaleDateString(DATE_LOCALE[language] ?? 'az-AZ', { day: 'numeric', month: 'short' });
  };

  const renderRecentTeacher = (teacher: RecentTeacher) => {
    const subj = teacher.subject ?? t('bookmarks.variousSubjects');
    const c = SUBJECT_COLORS[subj] ?? { bg: Colors.primaryLight, fg: Colors.primary };
    return (
      <TouchableOpacity
        key={teacher.id + teacher.viewedAt}
        style={styles.recentCard}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('Booking', {
            screen: Routes.TeacherProfile,
            params: { teacher },
          })
        }
      >
        <View style={styles.recentPhotoWrap}>
          {teacher.avatarUrl ? (
            <Image source={{ uri: teacher.avatarUrl }} style={styles.recentPhoto} />
          ) : (
            <LinearGradient colors={GRADIENT} style={styles.recentPhoto} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.recentInitial}>{initials(teacher.name)}</Text>
            </LinearGradient>
          )}
        </View>
        <View style={styles.recentBody}>
          <View style={styles.recentTopRow}>
            <View style={[styles.subjectChip, { backgroundColor: c.bg }]}>
              <Text style={[styles.subjectChipText, { color: c.fg }]}>{subj.toUpperCase()}</Text>
            </View>
            <Text style={styles.recentTime}>{relativeTime(teacher.viewedAt)}</Text>
          </View>
          <Text style={styles.recentName} numberOfLines={1}>{teacher.name}</Text>
          <Text style={styles.recentExp} numberOfLines={1}>{teacher.experience ?? t('bookmarks.defaultExpert')}</Text>
          <View style={styles.recentMetaRow}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.metaTextBold}>{teacher.rating && teacher.rating > 0 ? teacher.rating.toFixed(1) : '—'}</Text>
            {typeof teacher.hourlyRate === 'number' && teacher.hourlyRate > 0 && (
              <Text style={styles.recentPrice}>{teacher.hourlyRate} AZN<Text style={styles.priceUnit}>{t('bookmarks.perHour')}</Text></Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Ionicons name="bookmark" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>{t('bookmarks.header')}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      >
        {/* Main segmented tabs */}
        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segBtn, mainTab === 'saved' && styles.segBtnActive]}
            onPress={() => setMainTab('saved')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segText, mainTab === 'saved' && styles.segTextActive]}>{t('bookmarks.tabSaved')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, mainTab === 'recent' && styles.segBtnActive]}
            onPress={() => setMainTab('recent')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segText, mainTab === 'recent' && styles.segTextActive]}>{t('bookmarks.tabRecent')}</Text>
          </TouchableOpacity>
        </View>

        {/* Sub tab chips */}
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, subTab === 'teacher' && styles.chipActive]}
            onPress={() => setSubTab('teacher')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, subTab === 'teacher' && styles.chipTextActive]}>{t('bookmarks.teachers')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, subTab === 'request' && styles.chipActive]}
            onPress={() => setSubTab('request')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, subTab === 'request' && styles.chipTextActive]}>{t('bookmarks.subRequests')}</Text>
          </TouchableOpacity>
        </View>

        {mainTab === 'saved' ? (
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : isSavedEmpty ? (
            <View style={styles.emptyWrap}>
              <LinearGradient colors={GRADIENT} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="bookmark-outline" size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>{t('bookmarks.noBookmarksTitle')}</Text>
              <Text style={styles.emptySub}>
                {subTab === 'teacher'
                  ? t('bookmarks.saveTeachersSub')
                  : t('bookmarks.saveRequestsSub')}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {bookmarks.map((bm) =>
                subTab === 'teacher' ? renderTeacherCard(bm) : renderRequestCard(bm),
              )}
            </View>
          )
        ) : subTab === 'teacher' ? (
          isRecentTeacherEmpty ? (
            <View style={styles.emptyWrap}>
              <LinearGradient colors={GRADIENT} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="time-outline" size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>{t('bookmarks.noRecentTitle')}</Text>
              <Text style={styles.emptySub}>{t('bookmarks.noRecentSub')}</Text>
            </View>
          ) : (
            <View>
              <View style={styles.recentToolbar}>
                <Text style={styles.recentToolbarTitle}>{t('bookmarks.teachers')}</Text>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() =>
                    Alert.alert(t('bookmarks.clearHistoryTitle'), t('bookmarks.clearHistoryMsg'), [
                      { text: t('bookmarks.cancel'), style: 'cancel' },
                      { text: t('bookmarks.clear'), style: 'destructive', onPress: () => clearRecentTeachers() },
                    ])
                  }
                >
                  <Text style={styles.recentClearText}>{t('bookmarks.clear')}</Text>
                </TouchableOpacity>
              </View>
              {groupedRecent.map((g) => (
                <View key={g.key} style={{ marginBottom: 18 }}>
                  <Text style={styles.recentGroupLabel}>{g.label}</Text>
                  <View style={styles.list}>{g.items.map(renderRecentTeacher)}</View>
                </View>
              ))}
            </View>
          )
        ) : (
          <View style={styles.emptyWrap}>
            <LinearGradient colors={GRADIENT} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="time-outline" size={32} color="#fff" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>{t('bookmarks.noRecentRequestTitle')}</Text>
            <Text style={styles.emptySub}>{t('bookmarks.noRecentRequestSub')}</Text>
          </View>
        )}

        {/* Daha çox */}
        <View style={bmExtraStyles.section}>
          <Text style={bmExtraStyles.title}>{t('bookmarks.more')}</Text>
          <View style={bmExtraStyles.row}>
            <TouchableOpacity
              style={bmExtraStyles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Home', { screen: Routes.Favorites })}
            >
              <View style={[bmExtraStyles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="heart" size={20} color="#DC2626" />
              </View>
              <Text style={bmExtraStyles.cardTitle}>{t('bookmarks.favHeroTitle')}</Text>
              <Text style={bmExtraStyles.cardSub}>{t('bookmarks.myCollection')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={bmExtraStyles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Home', { screen: Routes.RecentlyViewed })}
            >
              <View style={[bmExtraStyles.iconWrap, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="time" size={20} color={Colors.primary} />
              </View>
              <Text style={bmExtraStyles.cardTitle}>{t('bookmarks.rvTitle')}</Text>
              <Text style={bmExtraStyles.cardSub}>{t('bookmarks.timelineHistory')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Hero */}
        <LinearGradient
          colors={GRADIENT}
          style={styles.aiHero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.aiHeroIcon}>
            <Ionicons name="sparkles" size={22} color="#fff" />
          </View>
          <Text style={styles.aiHeroTitle}>
            {subTab === 'teacher' ? t('bookmarks.aiHeroTitleTeacher') : t('bookmarks.aiHeroTitleRequest')}
          </Text>
          <Text style={styles.aiHeroSub}>
            {t('bookmarks.aiHeroSub')}
          </Text>
          <TouchableOpacity
            style={styles.aiHeroBtn}
            onPress={() => navigation.navigate(Routes.AIMentor)}
            activeOpacity={0.85}
          >
            <Text style={styles.aiHeroBtnText}>{t('bookmarks.askKimi')}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const bmExtraStyles = StyleSheet.create({
  section: { marginTop: 24, marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1, padding: 14, borderRadius: 16, gap: 6,
    backgroundColor: Colors.surfaceLowest, borderWidth: 1, borderColor: Colors.borderLight,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 11, color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },

  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16, padding: 5,
    marginBottom: 16,
  },
  segBtn: {
    flex: 1, paddingVertical: 11,
    borderRadius: 12, alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  segText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  segTextActive: { color: Colors.primary, fontWeight: '700' },

  chipsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip: {
    paddingHorizontal: 20, paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },

  emptyWrap: { alignItems: 'center', paddingTop: 40, paddingBottom: 20, gap: 14 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 20 },

  list: { gap: 14 },

  // Teacher card
  teacherCard: {
    flexDirection: 'row', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 2,
  },
  teacherPhotoWrap: { position: 'relative' },
  teacherPhoto: {
    width: 92, height: 92, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  teacherPhotoInitial: { color: '#fff', fontSize: 28, fontWeight: '800' },
  verifiedBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.surfaceLowest,
  },
  teacherBody: { flex: 1, justifyContent: 'space-between' },
  teacherTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  teacherName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  teacherSubject: { fontSize: 10, fontWeight: '700', color: Colors.primary, marginTop: 2, letterSpacing: 0.6 },
  teacherMetaRow: { flexDirection: 'row', gap: 14, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTextBold: { fontSize: 12, fontWeight: '800', color: Colors.textPrimary },
  metaText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  teacherFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  priceValue: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  priceUnit: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  viewBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  viewBtnText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  // Request card
  requestCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 2,
    position: 'relative',
  },
  bookmarkAbs: { position: 'absolute', top: 14, right: 14, zIndex: 2 },
  requestTopRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  requestIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  subjectChip: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  subjectChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusActive: { backgroundColor: '#dcfce7' },
  statusFinished: { backgroundColor: Colors.surfaceHigh },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  statusActiveText: { color: '#006947' },
  statusFinishedText: { color: Colors.textMuted },
  requestTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, lineHeight: 20 },
  requestChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  requestChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.surfaceLow,
  },
  requestChipText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },

  // Recent (Son baxılanlar) — teachers
  recentToolbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  recentToolbarTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  recentClearText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  recentGroupLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.textMuted,
    letterSpacing: 1.4, marginTop: 14, marginBottom: 8,
  },
  recentCard: {
    flexDirection: 'row', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  recentPhotoWrap: { position: 'relative' },
  recentPhoto: {
    width: 80, height: 80, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  recentInitial: { color: '#fff', fontSize: 26, fontWeight: '800' },
  recentBody: { flex: 1, justifyContent: 'space-between' },
  recentTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentTime: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  recentName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 6 },
  recentExp: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  recentMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  recentPrice: { fontSize: 12, fontWeight: '800', color: Colors.textPrimary, marginLeft: 'auto' },

  // AI hero
  aiHero: {
    marginTop: 28, borderRadius: 24, padding: 28,
    alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
  },
  aiHeroIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  aiHeroTitle: { fontSize: 17, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -0.2 },
  aiHeroSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 18, marginTop: 8, marginBottom: 20, maxWidth: 280 },
  aiHeroBtn: {
    paddingHorizontal: 36, paddingVertical: 12,
    borderRadius: 999, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  aiHeroBtnText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
});
