import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import client from '../../api/client';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

interface SearchResults {
  exams: { id: string; title: string; subject: string; difficulty: string }[];
  questions: { id: string; title: string; subject: string }[];
  users: { id: string; name: string; email: string }[];
}

type TabKey = 'all' | 'teachers' | 'exams' | 'questions' | 'calculators' | 'schools';

const TABS: { key: TabKey; labelKey: string }[] = [
  { key: 'all', labelKey: 'search.tabAll' },
  { key: 'teachers', labelKey: 'search.tabTeachers' },
  { key: 'exams', labelKey: 'search.tabExams' },
  { key: 'questions', labelKey: 'search.tabQuestions' },
  { key: 'calculators', labelKey: 'search.tabCalculators' },
  { key: 'schools', labelKey: 'search.tabSchools' },
];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const goTab = (tab: string, params?: any) => {
    const parent = navigation.getParent() as any;
    parent?.navigate(tab, params);
  };
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(text), 400);
  };

  const { data, isLoading, isFetching } = useQuery<SearchResults>({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.trim().length < 2) return { exams: [], questions: [], users: [] };
      const res = await client.get('/search', { params: { q: debouncedQuery } });
      return res.data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const showResults = debouncedQuery.length >= 2;

  const allItems = data ? [
    ...data.users.map(u => ({ ...u, _type: 'user' as const, title: u.name })),
    ...data.exams.map(e => ({ ...e, _type: 'exam' as const })),
    ...data.questions.map(q => ({ ...q, _type: 'question' as const })),
  ] : [];

  const filteredItems =
    activeTab === 'teachers' ? allItems.filter(i => i._type === 'user') :
    activeTab === 'exams' ? allItems.filter(i => i._type === 'exam') :
    activeTab === 'questions' ? allItems.filter(i => i._type === 'question') :
    activeTab === 'calculators' || activeTab === 'schools' ? [] :
    allItems;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="search-outline" size={22} color={Colors.primary} />
          <Text style={styles.headerTitle}>{t('search.title')}</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Ionicons name="person-outline" size={18} color={Colors.primary} />
        </View>
      </View>

      {/* Search input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search.placeholder')}
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={handleChange}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => { setQuery(''); setDebouncedQuery(''); }}
              hitSlop={8}
            >
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {!showResults && (
          <View style={styles.historyRow}>
            <Ionicons name="time-outline" size={15} color={Colors.textMuted} />
            <Text style={styles.historyLabel}>{t('search.recentSearches')}</Text>
            <TouchableOpacity onPress={() => handleChange('Riyaziyyat testləri')}>
              <Text style={styles.historyChip}>Riyaziyyat testləri</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleChange('Qəbul imtahanı')}>
              <Text style={styles.historyChip}>Qəbul imtahanı</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showResults ? (
        /* ── Results state ── */
        <View style={{ flex: 1 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContent}
          >
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {t(tab.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.metaRow}>
            <Text style={styles.metaCount}>{t('search.resultsCount', { count: filteredItems.length })}</Text>
            <Text style={styles.metaSort}>{t('search.sortBest')}</Text>
          </View>

          {(isLoading || isFetching) ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : filteredItems.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>{t('search.noResultsFor', { query: debouncedQuery })}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={item => `${item._type}-${item.id}`}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isUser = item._type === 'user';
                const isExam = item._type === 'exam';
                return (
                  <TouchableOpacity style={styles.resultCard} activeOpacity={0.85}>
                    <View style={[styles.resultAvatar, {
                      backgroundColor: isUser ? Colors.secondaryContainer : isExam ? Colors.primaryLight : '#d1fae5',
                    }]}>
                      <Ionicons
                        name={isUser ? 'person-outline' : isExam ? 'document-text-outline' : 'chatbubbles-outline'}
                        size={22}
                        color={isUser ? Colors.secondary : isExam ? Colors.primary : '#059669'}
                      />
                    </View>
                    <View style={styles.resultInfo}>
                      <View style={styles.resultBadgeRow}>
                        <View style={[styles.resultBadge, {
                          backgroundColor: isUser ? '#d1fae5' : isExam ? Colors.secondaryContainer : Colors.surfaceLow,
                        }]}>
                          <Text style={[styles.resultBadgeText, {
                            color: isUser ? '#059669' : isExam ? Colors.secondary : Colors.textSecondary,
                          }]}>
                            {isUser ? t('search.badgeTeacher') : isExam ? t('search.badgeExam') : t('search.badgeQuestion')}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.resultTitle} numberOfLines={1}>
                        {(item as any).title || (item as any).name}
                      </Text>
                      <Text style={styles.resultSub} numberOfLines={1}>
                        {isExam ? (item as any).subject : isUser ? (item as any).email : (item as any).subject}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      ) : (
        /* ── Browse / empty state ── */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.browseContent}>
          <Text style={styles.sectionLabel}>{t('search.categories')}</Text>

          {/* Wide featured card */}
          <TouchableOpacity
            style={styles.bentoWide}
            activeOpacity={0.85}
            onPress={() => goTab('Booking', { screen: Routes.TeacherList })}
          >
            <View style={styles.bentoWideInner}>
              <View style={styles.bentoWideLeft}>
                <Text style={styles.bentoWideTitle}>{t('search.teachers')}</Text>
                <Text style={styles.bentoWideSub}>{t('search.teachersSub')}</Text>
              </View>
              <View style={styles.bentoWideIcon}>
                <Ionicons name="school-outline" size={30} color={Colors.primary} />
              </View>
            </View>
          </TouchableOpacity>

          {/* 2-col grid */}
          <View style={styles.bentoGrid}>
            <TouchableOpacity style={styles.bentoCard} activeOpacity={0.85} onPress={() => goTab('Exams')}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={styles.bentoCardIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="document-text-outline" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.bentoCardTitle}>{t('search.tabExams')}</Text>
              <Text style={styles.bentoCardSub}>{t('search.examsSub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bentoCard} activeOpacity={0.85} onPress={() => goTab('Marketplace')}>
              <View style={[styles.bentoCardIcon, { backgroundColor: '#d1fae5' }]}>
                <Ionicons name="chatbubbles-outline" size={22} color="#059669" />
              </View>
              <Text style={styles.bentoCardTitle}>{t('search.tabQuestions')}</Text>
              <Text style={styles.bentoCardSub}>{t('search.questionsSub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bentoCard} activeOpacity={0.85} onPress={() => goTab('Calculators')}>
              <View style={[styles.bentoCardIcon, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="calculator-outline" size={22} color="#4f46e5" />
              </View>
              <Text style={styles.bentoCardTitle}>{t('search.tabCalculators')}</Text>
              <Text style={styles.bentoCardSub}>{t('search.calculatorsSub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bentoCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(Routes.SchoolRanking)}
            >
              <View style={[styles.bentoCardIcon, { backgroundColor: '#ffe4e6' }]}>
                <Ionicons name="business-outline" size={22} color="#f43f5e" />
              </View>
              <Text style={styles.bentoCardTitle}>{t('search.schools')}</Text>
              <Text style={styles.bentoCardSub}>{t('search.schoolsSub')}</Text>
            </TouchableOpacity>
          </View>

          {/* AI suggestion card */}
          <View style={styles.aiCard}>
            <View style={styles.aiCardBlob} />
            <View style={styles.aiCardRow}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={styles.aiAvatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="hardware-chip-outline" size={26} color="#fff" />
              </LinearGradient>
              <View style={styles.aiCardContent}>
                <Text style={styles.aiCardTitle}>{t('search.askMe')}</Text>
                <Text style={styles.aiCardSub}>
                  {t('search.askMeSub')}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.aiBtnWrap}
                  onPress={() => goTab(Routes.AIMentor)}
                >
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    style={styles.aiBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.aiBtnText}>{t('search.searchWithAi')}</Text>
                    <Ionicons name="flash" size={15} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primaryFixed + '30',
  },

  searchSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, height: 52,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  historyRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingHorizontal: 4 },
  historyLabel: { fontSize: 13, color: Colors.textMuted },
  historyChip: { fontSize: 13, fontWeight: '700', color: Colors.primary, textDecorationLine: 'underline' },

  // Tabs
  tabsScroll: { maxHeight: 52 },
  tabsContent: {
    flexDirection: 'row', gap: 4, alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 6,
    backgroundColor: Colors.surfaceLow,
  },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  tabActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },

  metaRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  metaCount: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  metaSort: { fontSize: 12, fontWeight: '500', color: Colors.textMuted },

  resultsList: { paddingHorizontal: 20, gap: 12, paddingBottom: 40 },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  resultAvatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1, gap: 4 },
  resultBadgeRow: { flexDirection: 'row' },
  resultBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  resultBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  resultTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  resultSub: { fontSize: 12, color: Colors.textMuted },

  noResults: { alignItems: 'center', marginTop: 60 },
  noResultsText: { fontSize: 15, color: Colors.textMuted },

  // Browse / empty state
  browseContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48, gap: 16 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 2, textTransform: 'uppercase',
  },

  bentoWide: {
    backgroundColor: Colors.primaryLight + '90', borderRadius: 24,
    borderWidth: 1, borderColor: Colors.primaryFixed + '18', overflow: 'hidden',
  },
  bentoWideInner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 24,
  },
  bentoWideLeft: { flex: 1, gap: 4 },
  bentoWideTitle: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  bentoWideSub: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  bentoWideIcon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },

  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  bentoCard: {
    width: '47%', backgroundColor: Colors.surfaceLowest, borderRadius: 24,
    padding: 20, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  bentoCardIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bentoCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  bentoCardSub: { fontSize: 11, color: Colors.textMuted },

  aiCard: {
    backgroundColor: Colors.primaryLight + '60', borderRadius: 24,
    borderWidth: 1, borderColor: Colors.primaryFixed + '20',
    overflow: 'hidden', padding: 20,
  },
  aiCardBlob: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '10',
  },
  aiCardRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  aiAvatar: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3,
  },
  aiCardContent: { flex: 1, gap: 8 },
  aiCardTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  aiCardSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  aiBtnWrap: { borderRadius: 16, overflow: 'hidden', alignSelf: 'flex-start' },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16,
  },
  aiBtnText: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
