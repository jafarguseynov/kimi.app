import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { getFlashcards } from '../../api/learning.api';
import { useLearningProgressStore } from '../../store/learningProgress.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function LearningStatsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { data: allCards = [] } = useQuery({
    queryKey: ['flashcards', 'all'],
    queryFn: () => getFlashcards(),
  });

  const entries = useLearningProgressStore((s) => s.entries);
  const totalLearnedCount = useLearningProgressStore((s) => s.totalLearnedCount);
  const weeklyLearnedCount = useLearningProgressStore((s) => s.weeklyLearnedCount);
  const perSubjectStats = useLearningProgressStore((s) => s.perSubjectStats);
  const dueCards = useLearningProgressStore((s) => s.dueCards);

  const total = React.useMemo(() => totalLearnedCount(), [entries, totalLearnedCount]);
  const week = React.useMemo(() => weeklyLearnedCount(), [entries, weeklyLearnedCount]);
  const subjects = React.useMemo(() => perSubjectStats(allCards), [allCards, entries, perSubjectStats]);
  const dueLen = React.useMemo(() => dueCards(allCards).length, [allCards, entries, dueCards]);

  const seenCount = Object.keys(entries).length;
  const overallPct = allCards.length ? Math.round((total / allCards.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} hitSlop={8} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('learning.stats')}</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={GRADIENT} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroIcon}>
            <Ionicons name="trophy" size={28} color="#fff" />
          </View>
          <Text style={styles.heroValue}>{total}</Text>
          <Text style={styles.heroLabel}>{t('learning.cardsLearned')}</Text>
          <View style={styles.heroBarBg}>
            <View style={[styles.heroBarFill, { width: `${overallPct}%` }]} />
          </View>
          <Text style={styles.heroPct}>{t('learning.overall', { pct: overallPct })}</Text>
        </LinearGradient>

        {/* Mini stats */}
        <View style={styles.miniRow}>
          <View style={styles.miniCard}>
            <View style={[styles.miniIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flame" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.miniValue}>{week}</Text>
            <Text style={styles.miniLabel}>{t('learning.thisWeek')}</Text>
          </View>
          <View style={styles.miniCard}>
            <View style={[styles.miniIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="eye" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.miniValue}>{seenCount}</Text>
            <Text style={styles.miniLabel}>{t('learning.viewed')}</Text>
          </View>
          <View style={styles.miniCard}>
            <View style={[styles.miniIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="time" size={18} color="#DC2626" />
            </View>
            <Text style={styles.miniValue}>{dueLen}</Text>
            <Text style={styles.miniLabel}>{t('learning.forReview')}</Text>
          </View>
        </View>

        {/* Per-subject */}
        <Text style={styles.sectionTitle}>{t('learning.bySubject')}</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          {subjects.map((s) => {
            const pct = s.total ? Math.round((s.learned / s.total) * 100) : 0;
            const done = pct === 100;
            return (
              <View key={s.subject} style={styles.subjectRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.subjectRowHead}>
                    <Text style={styles.subjectRowName}>{s.subject}</Text>
                    <Text style={[styles.subjectRowMeta, done && { color: '#16A34A' }]}>
                      {s.learned}/{s.total}
                    </Text>
                  </View>
                  <View style={styles.subjectRowBarBg}>
                    <View
                      style={[
                        styles.subjectRowBarFill,
                        { width: `${pct}%`, backgroundColor: done ? '#16A34A' : Colors.primary },
                      ]}
                    />
                  </View>
                </View>
                {done && <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={{ marginLeft: 10 }} />}
              </View>
            );
          })}
          {subjects.length === 0 && (
            <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
              {t('learning.noLearnedYet')}
            </Text>
          )}
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={16} color="#F59E0B" />
          <Text style={styles.tipText}>
            {t('learning.statsTip')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },

  hero: {
    borderRadius: 22, padding: 24, alignItems: 'center', gap: 6,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 22, elevation: 6,
  },
  heroIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  heroValue: { fontSize: 44, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  heroBarBg: {
    width: '100%', height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 14, overflow: 'hidden',
  },
  heroBarFill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },
  heroPct: { fontSize: 11, color: 'rgba(255,255,255,0.95)', fontWeight: '700', marginTop: 6, letterSpacing: 0.6 },

  miniRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  miniCard: {
    flex: 1, alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  miniIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  miniValue: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary },
  miniLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700', letterSpacing: 0.5 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 24 },
  subjectRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  subjectRowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectRowName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  subjectRowMeta: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary },
  subjectRowBarBg: {
    height: 6, borderRadius: 3, backgroundColor: Colors.surfaceLow,
    marginTop: 8, overflow: 'hidden',
  },
  subjectRowBarFill: { height: '100%', borderRadius: 3 },

  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 12, padding: 12, marginTop: 20,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  tipText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 17 },
});
