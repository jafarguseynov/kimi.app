import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getSubjects, getFlashcards, Flashcard } from '../../api/learning.api';
import { useLearningStore } from '../../store/learning.store';
import { useLearningProgressStore } from '../../store/learningProgress.store';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

type Props = { navigation: NativeStackNavigationProp<any> };

const SUBJECT_ICONS: Record<string, string> = {
  Riyaziyyat: '🔢',
  Fizika: '⚛️',
  Kimya: '🧪',
  Biologiya: '🧬',
  Tarix: '📜',
  Coğrafiya: '🌍',
  'İngilis dili': '🇬🇧',
  İngilis: '🇬🇧',
  'Azərbaycan Dili': '📖',
  default: '📚',
};

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function LearningHomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });
  const { data: allCards = [] } = useQuery({
    queryKey: ['flashcards', 'all'],
    queryFn: () => getFlashcards(),
  });

  const setCards = useLearningStore((s) => s.setCards);
  const progressForSubject = useLearningProgressStore((s) => s.progressForSubject);
  const dueCards = useLearningProgressStore((s) => s.dueCards);
  const weeklyLearnedCount = useLearningProgressStore((s) => s.weeklyLearnedCount);
  // subscribe to entries so derived counts re-render on rate
  const entries = useLearningProgressStore((s) => s.entries);

  const dueList = React.useMemo(() => dueCards(allCards), [allCards, entries, dueCards]);
  const weekCount = React.useMemo(() => weeklyLearnedCount(), [entries, weeklyLearnedCount]);

  const [loadingSubject, setLoadingSubject] = useState<string | null>(null);
  const startSession = async (subject: string) => {
    setLoadingSubject(subject);
    try {
      const cards = await getFlashcards(subject);
      if (cards.length === 0) {
        Alert.alert(
          t('learning.noCardsTitle', { subject }),
          t('learning.noCardsMsg'),
          [{ text: 'OK' }],
        );
        return;
      }
      setCards(cards, subject);
      navigation.navigate(Routes.FlashcardSession);
    } catch (err: any) {
      Alert.alert(t('learning.errorTitle'), err?.message ?? t('learning.cardsLoadFailed'));
    } finally {
      setLoadingSubject(null);
    }
  };

  const startDueSession = () => {
    if (dueList.length === 0) return;
    setCards(dueList, t('learning.todayReview'));
    navigation.navigate(Routes.FlashcardSession);
  };

  const subjectCards = (subject: string): Flashcard[] =>
    allCards.filter((c) => c.subject === subject);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : (navigation.getParent() as any)?.navigate(Routes.Home))}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('learning.learn')}</Text>
          <Text style={styles.subtitle}>{t('learning.whatToLearn')}</Text>
        </View>

        {/* Due cards banner */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={startDueSession}
          disabled={dueList.length === 0}
          style={{ marginHorizontal: 20, marginBottom: 16 }}
        >
          <LinearGradient
            colors={dueList.length > 0 ? GRADIENT : [Colors.surfaceHigh, Colors.surfaceHigh]}
            style={styles.banner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.bannerIconWrap}>
              <Ionicons
                name={dueList.length > 0 ? 'flame' : 'checkmark-done'}
                size={26}
                color={dueList.length > 0 ? '#fff' : Colors.textSecondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, dueList.length === 0 && { color: Colors.textPrimary }]}>
                {dueList.length > 0 ? t('learning.dueReady', { n: dueList.length }) : t('learning.allUpdated')}
              </Text>
              <Text style={[styles.bannerSub, dueList.length === 0 && { color: Colors.textSecondary }]}>
                {dueList.length > 0
                  ? t('learning.dueSub')
                  : t('learning.allUpdatedSub')}
              </Text>
            </View>
            {dueList.length > 0 && (
              <View style={styles.bannerCta}>
                <Ionicons name="play" size={14} color={Colors.primary} />
                <Text style={styles.bannerCtaText}>{t('learning.start')}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick links */}
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: '#EEF2FF' }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.MemoryAI)}
          >
            <Ionicons name="sparkles" size={20} color={Colors.primary} />
            <Text style={styles.quickTitle}>{t('learning.memoryAi')}</Text>
            <Text style={styles.quickSub}>{t('learning.smartReview')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: '#FEF3C7' }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.LearningGroups)}
          >
            <Ionicons name="people" size={20} color="#F59E0B" />
            <Text style={styles.quickTitle}>{t('learning.groups')}</Text>
            <Text style={styles.quickSub}>{t('learning.learnTogether')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: '#DCFCE7' }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.LearningStats)}
          >
            <Ionicons name="stats-chart" size={20} color="#16A34A" />
            <Text style={styles.quickTitle}>{t('learning.stats')}</Text>
            <Text style={styles.quickSub}>{t('learning.thisWeekN', { n: weekCount })}</Text>
          </TouchableOpacity>
        </View>

        {/* Subjects */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t('learning.topics')}</Text>
          <Text style={styles.sectionSub}>{t('learning.topicsCount', { n: subjects.length })}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.subjectGrid}>
            {subjects.map((item) => {
              const cards = subjectCards(item);
              const { learned, total, pct } = progressForSubject(cards);
              return (
                <TouchableOpacity
                  key={item}
                  style={styles.subjectCard}
                  onPress={() => startSession(item)}
                  activeOpacity={0.85}
                  disabled={loadingSubject === item}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.subjectIcon}>{SUBJECT_ICONS[item] ?? SUBJECT_ICONS.default}</Text>
                    {loadingSubject === item && <ActivityIndicator size="small" color={Colors.primary} />}
                  </View>
                  <Text style={styles.subjectName}>{item}</Text>
                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: pct === 100 ? '#16A34A' : Colors.primary },
                      ]}
                    />
                  </View>
                  <Text style={styles.subjectMeta}>
                    {t('learning.subjectMeta', { learned, total, pct })}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {subjects.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{t('learning.noTopics')}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerBackBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: -8, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, padding: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5,
  },
  bannerIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  bannerCta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  bannerCtaText: { fontSize: 12, fontWeight: '800', color: Colors.primary },

  quickRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  quickCard: {
    flex: 1, borderRadius: 16, padding: 12, gap: 4,
    alignItems: 'flex-start',
  },
  quickTitle: { fontSize: 12, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  quickSub: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },

  sectionHead: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  sectionSub: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },

  subjectGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    paddingHorizontal: 20,
  },
  subjectCard: {
    width: '47%',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1,
  },
  subjectIcon: { fontSize: 30 },
  subjectName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  progressBg: {
    height: 6, borderRadius: 3, backgroundColor: Colors.surfaceLow,
    overflow: 'hidden', marginTop: 4,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  subjectMeta: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  empty: { width: '100%', alignItems: 'center', marginTop: 40 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
});
