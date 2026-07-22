import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import EmptyState from '../../components/common/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { getExamResults, type ExamResultRow } from '../../api/certificate.api';
import { useTranslation } from '../../i18n';

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamHistory> };

type DateBucket = 'month' | '3months' | 'all';

const SUBJECT_FILTERS = ['Hamısı', 'Riyaziyyat', 'Azərbaycan dili', 'İngilis dili'] as const;
const CATEGORY_FILTERS = ['Hamısı', 'Orta Məktəb', 'Abituriyent', 'Magistratura', 'MİQ', 'Sınaqlar'] as const;

// Filter dəyərləri məntiq açarıdır (AZ saxlanılır); göstərmək üçün tərcümə açarına xəritələnir.
const CATEGORY_TKEY: Record<string, string> = {
  'Hamısı': 'examHistory.catAll',
  'Orta Məktəb': 'examHistory.catSchool',
  'Abituriyent': 'examHistory.catAbituriyent',
  'Magistratura': 'examHistory.catMagistr',
  'MİQ': 'examHistory.catMiq',
  'Sınaqlar': 'examHistory.catMocks',
};
const SUBJECT_TKEY: Record<string, string> = {
  'Hamısı': 'examHistory.subjAll',
  'Riyaziyyat': 'examHistory.subjMath',
  'Azərbaycan dili': 'examHistory.subjAz',
  'İngilis dili': 'examHistory.subjEn',
};

function matchCategory(cat: string, title: string, subject?: string): boolean {
  if (cat === 'Hamısı') return true;
  const hay = `${title} ${subject ?? ''}`.toLowerCase();
  switch (cat) {
    case 'Orta Məktəb': return /\b(sinif|orta|məkt[əe]b|5-ci|6-ci|7-ci|8-ci|9-cu)/.test(hay);
    case 'Abituriyent': return /(abituri|d[ıi]m|qəbul|11-ci)/.test(hay);
    case 'Magistratura': return /(magistr)/.test(hay);
    case 'MİQ': return /(miq|m[ıi]q|m[üu][əe]llim)/.test(hay);
    case 'Sınaqlar': return /(s[ıi]naq|aylıq|həft[əe]lik)/.test(hay);
    default: return true;
  }
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function subjectIcon(subject?: string): keyof typeof Ionicons.glyphMap {
  const s = (subject ?? '').toLowerCase();
  if (s.includes('riyaz')) return 'calculator-outline';
  if (s.includes('ingil') || s.includes('engl')) return 'language-outline';
  if (s.includes('azərb') || s.includes('azer')) return 'book-outline';
  if (s.includes('fizik')) return 'flash-outline';
  if (s.includes('kimya')) return 'flask-outline';
  if (s.includes('biolog')) return 'leaf-outline';
  if (s.includes('tarix')) return 'time-outline';
  if (s.includes('coğraf') || s.includes('coqraf')) return 'globe-outline';
  return 'document-text-outline';
}

function subjectTone(subject?: string): { bg: string; fg: string } {
  const s = (subject ?? '').toLowerCase();
  if (s.includes('riyaz')) return { bg: Colors.primary + '1A', fg: Colors.primary };
  if (s.includes('ingil') || s.includes('engl')) return { bg: '#DCFCE7', fg: Colors.tertiary };
  if (s.includes('azərb') || s.includes('azer')) return { bg: '#EDE9FE', fg: '#7C3AED' };
  return { bg: Colors.primary + '1A', fg: Colors.primary };
}

function ringColor(pct: number): { ring: string; track: string; text: string } {
  if (pct >= 70) return { ring: Colors.primary, track: Colors.primary + '33', text: Colors.primary };
  if (pct >= 50) return { ring: Colors.warning, track: Colors.warning + '33', text: Colors.warning };
  return { ring: Colors.danger, track: Colors.danger + '33', text: Colors.danger };
}

function ScoreRing({ pct }: { pct: number }) {
  const c = ringColor(pct);
  return (
    <View style={[styles.scoreRing, { borderColor: c.track }]}>
      <Text style={[styles.scoreRingText, { color: c.text }]}>{pct}%</Text>
    </View>
  );
}

export default function ExamHistoryScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<(typeof SUBJECT_FILTERS)[number]>('Hamısı');
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]>('Hamısı');
  const [dateBucket, setDateBucket] = useState<DateBucket>('month');

  const { data: certs = [], isLoading, refetch } = useQuery({
    queryKey: ['examResults'],
    queryFn: getExamResults,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    const ms30 = 30 * 24 * 60 * 60 * 1000;
    const ms90 = 90 * 24 * 60 * 60 * 1000;
    return certs.filter((c) => {
      if (query) {
        const q = query.toLowerCase();
        if (!c.examTitle.toLowerCase().includes(q) && !(c.subject ?? '').toLowerCase().includes(q)) return false;
      }
      if (subject !== 'Hamısı') {
        if (!(c.subject ?? '').toLowerCase().includes(subject.toLowerCase().split(' ')[0])) return false;
      }
      if (!matchCategory(category, c.examTitle, c.subject)) return false;
      if (dateBucket !== 'all') {
        const age = now - new Date(c.completedAt).getTime();
        if (dateBucket === 'month' && age > ms30) return false;
        if (dateBucket === '3months' && age > ms90) return false;
      }
      return true;
    });
  }, [certs, query, subject, category, dateBucket]);

  const avgPct = certs.length
    ? Math.round(certs.reduce((s, c) => s + c.percentage, 0) / certs.length * 10) / 10
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('examHistory.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('examHistory.searchPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catPillsRow}>
          {CATEGORY_FILTERS.map((c) => {
            const active = category === c;
            if (active) {
              return (
                <TouchableOpacity key={c} activeOpacity={0.85} onPress={() => setCategory(c)}>
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.catPillActive}
                  >
                    <Text style={styles.catPillActiveText}>{t(CATEGORY_TKEY[c])}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity key={c} style={styles.catPill} activeOpacity={0.85} onPress={() => setCategory(c)}>
                <Text style={styles.catPillText}>{t(CATEGORY_TKEY[c])}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Stats grid (asymmetric 3/2) */}
        <View style={styles.statsGrid}>
          <View style={styles.statBig}>
            <Text style={styles.statBigKicker}>{t('examHistory.avgResult')}</Text>
            <Text style={styles.statBigValue}>{avgPct}%</Text>
            <Ionicons name="trending-up" size={88} color={Colors.primary + '14'} style={styles.statBigIcon} />
          </View>
          <View style={styles.statSmall}>
            <Text style={styles.statSmallKicker}>{t('examHistory.completed')}</Text>
            <Text style={styles.statSmallValue}>{t('examHistory.nExams', { n: certs.length })}</Text>
          </View>
        </View>

        {/* Subject filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('examHistory.bySubject')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {SUBJECT_FILTERS.map((s) => {
              const active = subject === s;
              if (active) {
                return (
                  <TouchableOpacity key={s} activeOpacity={0.85} onPress={() => setSubject(s)}>
                    <LinearGradient
                      colors={[Colors.gradientStart, Colors.gradientEnd]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={styles.chipActive}
                    >
                      <Text style={styles.chipActiveText}>{t(SUBJECT_TKEY[s])}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity key={s} style={styles.chip} activeOpacity={0.85} onPress={() => setSubject(s)}>
                  <Text style={styles.chipText}>{t(SUBJECT_TKEY[s])}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Date segmented */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('examHistory.byDate')}</Text>
          <View style={styles.segmented}>
            {([
              { id: 'month', label: t('examHistory.thisMonth') },
              { id: '3months', label: t('examHistory.last3') },
              { id: 'all', label: t('examHistory.all') },
            ] as { id: DateBucket; label: string }[]).map((opt) => {
              const active = dateBucket === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.85}
                  onPress={() => setDateBucket(opt.id)}
                  style={[styles.segItem, active && styles.segItemActive]}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* List */}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          certs.length === 0 ? (
            <EmptyState
              icon="ribbon-outline"
              title={t('getStarted.emptyExamsTitle')}
              subtitle={t('getStarted.emptyExamsSub')}
              ctaLabel={t('getStarted.emptyExamsCta')}
              onPress={() => navigation.navigate(Routes.ExamCategories)}
            />
          ) : (
            <View style={styles.center}>
              <Ionicons name="ribbon-outline" size={48} color={Colors.primaryFixed} />
              <Text style={styles.emptyText}>{t('examHistory.emptyFilter')}</Text>
            </View>
          )
        ) : (
          <View style={{ gap: 14 }}>
            {filtered.map((cert) => {
              const tone = subjectTone(cert.subject);
              return (
                <View key={cert.id} style={styles.examCard}>
                  <View style={styles.examTop}>
                    <View style={styles.examLeft}>
                      <View style={[styles.subjectIconBox, { backgroundColor: tone.bg }]}>
                        <Ionicons name={subjectIcon(cert.subject)} size={22} color={tone.fg} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.examTitle} numberOfLines={2}>{cert.examTitle}</Text>
                        <Text style={styles.examDate}>{formatShortDate(cert.completedAt)}</Text>
                      </View>
                    </View>
                    <ScoreRing pct={cert.percentage} />
                  </View>

                  <TouchableOpacity
                    style={styles.detailBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate(Routes.ExamResult, { examId: cert.examId })}
                  >
                    <Text style={styles.detailBtnText}>{t('examHistory.details')}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },

  scroll: { padding: 24, gap: 24, paddingBottom: 48 },

  /* Search */
  searchWrap: {
    position: 'relative',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  searchIcon: { position: 'absolute', left: 16, top: 16, zIndex: 1 },
  searchInput: {
    paddingVertical: 16, paddingLeft: 48, paddingRight: 16,
    fontSize: 15, color: Colors.textPrimary,
  },

  /* Filter */
  filterSection: { gap: 14 },
  filterLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  chipsRow: { gap: 12, paddingRight: 8 },
  chip: {
    backgroundColor: Colors.surfaceLow,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 999,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipActive: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 4,
  },
  chipActiveText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  /* Segmented */
  segmented: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999,
  },
  segItem: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
  segItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  segText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  segTextActive: { fontWeight: '700', color: Colors.primary },

  center: { paddingTop: 32, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  /* Card */
  examCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20,
    gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 2,
  },
  examTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  examLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  subjectIconBox: {
    width: 48, height: 48, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  examTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, lineHeight: 20 },
  examDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  scoreRing: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreRingText: { fontSize: 14, fontWeight: '700' },

  detailBtn: {
    paddingVertical: 12, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  detailBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  /* Category pills */
  catPillsRow: { gap: 12, paddingRight: 8 },
  catPill: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceLowest,
  },
  catPillText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  catPillActive: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 18, elevation: 4,
  },
  catPillActiveText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  /* Stats grid */
  statsGrid: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  statBig: {
    flex: 3, backgroundColor: Colors.primary + '14',
    borderRadius: 16, padding: 24, overflow: 'hidden', position: 'relative',
  },
  statBigKicker: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  statBigValue: { fontSize: 36, fontWeight: '900', color: Colors.primary, letterSpacing: -0.8 },
  statBigIcon: { position: 'absolute', right: -8, bottom: -16 },
  statSmall: {
    flex: 2, backgroundColor: Colors.surfaceLow,
    borderRadius: 16, padding: 18, justifyContent: 'center',
  },
  statSmallKicker: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  statSmallValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
});
