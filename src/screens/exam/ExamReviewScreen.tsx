import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getExamReview, ExamReviewQuestion } from '../../api/certificate.api';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamReview>;
type Filter = 'all' | 'wrong' | 'correct';

export default function ExamReviewScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { examId, filter: initialFilter } = route.params;
  const [filter, setFilter] = useState<Filter>(initialFilter ?? 'wrong');

  const { data, isLoading, error } = useQuery({
    queryKey: ['exam-review', examId],
    queryFn: () => getExamReview(examId),
    retry: false,
  });

  const questions = useMemo(() => {
    const all = data?.questions ?? [];
    if (filter === 'wrong') return all.filter((q) => !q.isCorrect);
    if (filter === 'correct') return all.filter((q) => q.isCorrect);
    return all;
  }, [data, filter]);

  const wrongCount = data?.questions.filter((q) => !q.isCorrect).length ?? 0;
  const correctCount = data?.questions.filter((q) => q.isCorrect).length ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{t('examReview.title')}</Text>
          {!!data && <Text style={styles.headerSub} numberOfLines={1}>{data.examTitle}</Text>}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {([
          { id: 'wrong',   label: t('examReview.nWrong', { n: wrongCount }),   color: Colors.danger },
          { id: 'correct', label: t('examReview.nCorrect', { n: correctCount }),  color: Colors.tertiary },
          { id: 'all',     label: t('examReview.allCount', { n: data?.total ?? 0 }), color: Colors.primary },
        ] as { id: Filter; label: string; color: string }[]).map((t) => {
          const active = filter === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.85}
              style={[styles.tab, active && { backgroundColor: t.color + '15', borderColor: t.color }]}
              onPress={() => setFilter(t.id)}
            >
              <Text style={[styles.tabText, active && { color: t.color, fontWeight: '800' }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={42} color={Colors.textMuted} />
          <Text style={styles.emptyText}>{t('examReview.loadFailed')}</Text>
        </View>
      ) : questions.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="checkmark-circle-outline" size={42} color={Colors.tertiary} />
          <Text style={styles.emptyText}>
            {filter === 'wrong' ? t('examReview.noWrong') : filter === 'correct' ? t('examReview.noCorrect') : t('examReview.noQuestions')}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {questions.map((q, idx) => (
            <QuestionCard key={q.id} q={q} index={idx + 1} />
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function QuestionCard({ q, index }: { q: ExamReviewQuestion; index: number }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.qCard, q.isCorrect ? styles.qCardCorrect : styles.qCardWrong]}>
      <View style={styles.qHeader}>
        <View style={[styles.qBadge, { backgroundColor: q.isCorrect ? Colors.tertiary + '20' : Colors.danger + '20' }]}>
          <Ionicons
            name={q.isCorrect ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={q.isCorrect ? Colors.tertiary : Colors.danger}
          />
          <Text style={[styles.qBadgeText, { color: q.isCorrect ? Colors.tertiary : Colors.danger }]}>
            {t('examReview.questionN', { n: index })} · {q.isCorrect ? t('examReview.correct') : t('examReview.wrong')}
          </Text>
        </View>
      </View>

      <Text style={styles.qText}>{q.text}</Text>

      <View style={{ gap: 8, marginTop: 12 }}>
        {q.options.map((opt) => {
          const isUser = q.userOptionId === opt.id;
          const isCorrect = q.correctOptionId === opt.id;
          let bgColor = Colors.surfaceLow;
          let borderColor = Colors.borderLight;
          let textColor = Colors.textPrimary;
          let icon: 'checkmark' | 'close' | null = null;
          let iconColor = Colors.textMuted;
          if (isCorrect) {
            bgColor = Colors.tertiary + '15';
            borderColor = Colors.tertiary;
            textColor = Colors.tertiary;
            icon = 'checkmark';
            iconColor = Colors.tertiary;
          } else if (isUser) {
            bgColor = Colors.danger + '15';
            borderColor = Colors.danger;
            textColor = Colors.danger;
            icon = 'close';
            iconColor = Colors.danger;
          }
          return (
            <View key={opt.id} style={[styles.optionRow, { backgroundColor: bgColor, borderColor }]}>
              <View style={[styles.optionLetter, { borderColor }]}>
                <Text style={[styles.optionLetterText, { color: textColor }]}>{opt.id.toUpperCase()}</Text>
              </View>
              <Text style={[styles.optionText, { color: textColor, fontWeight: isCorrect || isUser ? '700' : '500' }]}>
                {opt.text}
              </Text>
              {icon && <Ionicons name={icon} size={18} color={iconColor} />}
            </View>
          );
        })}
      </View>

      {q.userOptionId == null && (
        <Text style={styles.unansweredText}>{t('examReview.unanswered')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    gap: 8,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  headerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },

  tabs: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.surfaceLow,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  scroll: { padding: 16, gap: 14, paddingBottom: 32 },

  qCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    borderWidth: 1.5,
  },
  qCardCorrect: { borderColor: Colors.tertiary + '40' },
  qCardWrong: { borderColor: Colors.danger + '40' },
  qHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  qBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  qBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  qText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, lineHeight: 21 },

  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1.5,
  },
  optionLetter: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  optionLetterText: { fontSize: 12, fontWeight: '800' },
  optionText: { flex: 1, fontSize: 13, lineHeight: 18 },

  unansweredText: {
    fontSize: 11, color: Colors.textMuted, fontStyle: 'italic',
    marginTop: 8, textAlign: 'center',
  },
});
