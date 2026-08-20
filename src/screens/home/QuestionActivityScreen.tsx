import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { getExamResults, type ExamResultRow } from '../../api/certificate.api';
import EmptyState from '../../components/common/EmptyState';

type SubjectRow = { subject: string; correct: number; wrong: number; unanswered: number; answered: number; pct: number };

function normalize(r: ExamResultRow) {
  const correct = r.correct ?? r.score ?? 0;
  const answered = r.answered ?? correct + (r.wrong ?? 0);
  const wrong = r.wrong ?? Math.max(0, answered - correct);
  const unanswered = r.unanswered ?? Math.max(0, r.total - answered);
  return { correct, wrong, unanswered, answered };
}

function accuracyTone(pct: number): string {
  if (pct >= 70) return Colors.primary;
  if (pct >= 50) return Colors.warning;
  return Colors.danger;
}

export default function QuestionActivityScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: rows = [], isLoading, refetch } = useQuery({
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

  const { totals, subjects } = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const bySubject = new Map<string, { correct: number; wrong: number; unanswered: number; answered: number }>();

    for (const r of rows) {
      const n = normalize(r);
      correct += n.correct;
      wrong += n.wrong;
      unanswered += n.unanswered;

      const subj = (r.subject ?? '').trim() || t('questionActivity.otherSubject');
      const cur = bySubject.get(subj) ?? { correct: 0, wrong: 0, unanswered: 0, answered: 0 };
      cur.correct += n.correct;
      cur.wrong += n.wrong;
      cur.unanswered += n.unanswered;
      cur.answered += n.answered;
      bySubject.set(subj, cur);
    }

    const answered = correct + wrong;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const total = correct + wrong + unanswered;

    const subjectRows: SubjectRow[] = [...bySubject.entries()]
      .map(([subject, v]) => ({
        subject,
        ...v,
        pct: v.answered > 0 ? Math.round((v.correct / v.answered) * 100) : 0,
      }))
      .sort((a, b) => b.answered - a.answered);

    return {
      totals: { correct, wrong, unanswered, answered, accuracy, total },
      subjects: subjectRows,
    };
  }, [rows, t]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('questionActivity.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="help-circle-outline"
            title={t('questionActivity.emptyTitle')}
            subtitle={t('questionActivity.emptySub')}
            ctaLabel={t('getStarted.emptyExamsCta')}
            onPress={() => navigation.navigate(Routes.ExamCategories)}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {/* Accuracy hero */}
          <View style={styles.heroCard}>
            <Text style={styles.heroKicker}>{t('questionActivity.accuracy')}</Text>
            <Text style={styles.heroValue}>{totals.accuracy}%</Text>
            <Text style={styles.heroSub}>{t('questionActivity.totalAnswered', { n: totals.answered })}</Text>
          </View>

          {/* Count tiles */}
          <View style={styles.tilesRow}>
            <View style={[styles.tile, { backgroundColor: Colors.primary + '14' }]}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              <Text style={[styles.tileValue, { color: Colors.primary }]}>{totals.correct}</Text>
              <Text style={styles.tileLabel}>{t('questionActivity.correct')}</Text>
            </View>
            <View style={[styles.tile, { backgroundColor: Colors.danger + '14' }]}>
              <Ionicons name="close-circle" size={22} color={Colors.danger} />
              <Text style={[styles.tileValue, { color: Colors.danger }]}>{totals.wrong}</Text>
              <Text style={styles.tileLabel}>{t('questionActivity.wrong')}</Text>
            </View>
            <View style={[styles.tile, { backgroundColor: Colors.surfaceLow }]}>
              <Ionicons name="ellipse-outline" size={22} color={Colors.textMuted} />
              <Text style={[styles.tileValue, { color: Colors.textSecondary }]}>{totals.unanswered}</Text>
              <Text style={styles.tileLabel}>{t('questionActivity.unanswered')}</Text>
            </View>
          </View>

          {/* Per-subject breakdown */}
          <Text style={styles.sectionLabel}>{t('questionActivity.bySubject')}</Text>
          <View style={{ gap: 12 }}>
            {subjects.map((s) => {
              const tone = accuracyTone(s.pct);
              return (
                <View key={s.subject} style={styles.subjectCard}>
                  <View style={styles.subjectTop}>
                    <Text style={styles.subjectName} numberOfLines={1}>{s.subject}</Text>
                    <Text style={[styles.subjectPct, { color: tone }]}>{s.pct}%</Text>
                  </View>
                  <View style={styles.subjectBarTrack}>
                    <View style={[styles.subjectBarFill, { width: `${s.pct}%`, backgroundColor: tone }]} />
                  </View>
                  <Text style={styles.subjectMeta}>
                    {t('questionActivity.subjectMeta', { correct: s.correct, wrong: s.wrong })}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

  scroll: { padding: 24, gap: 20, paddingBottom: 48 },

  heroCard: {
    backgroundColor: Colors.primary + '14', borderRadius: 24, padding: 24, alignItems: 'center', gap: 4,
  },
  heroKicker: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1.2, textTransform: 'uppercase' },
  heroValue: { fontSize: 44, fontWeight: '900', color: Colors.primary, letterSpacing: -1 },
  heroSub: { fontSize: 13, color: Colors.textSecondary },

  tilesRow: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center', gap: 6 },
  tileValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  tileLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 4,
  },

  subjectCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16, gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
  },
  subjectTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  subjectName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  subjectPct: { fontSize: 15, fontWeight: '800' },
  subjectBarTrack: { height: 8, borderRadius: 999, backgroundColor: Colors.surfaceHigh, overflow: 'hidden' },
  subjectBarFill: { height: '100%', borderRadius: 999 },
  subjectMeta: { fontSize: 12, color: Colors.textMuted },
});
