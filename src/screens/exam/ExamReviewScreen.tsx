import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getExamReview, getQuestionSolution, ExamReviewQuestion, ExamReview } from '../../api/certificate.api';
import { getLocalReview } from '../../services/offline/grade';
import { useTranslation } from '../../i18n';

// Offline yerli baxışı server formatına çevir (internet yoxdursa göstərmək üçün).
async function loadReview(examId: string): Promise<ExamReview> {
  try {
    return await getExamReview(examId);
  } catch (e) {
    const local = await getLocalReview(examId);
    if (!local || local.length === 0) throw e;
    let correct = 0, wrong = 0, unanswered = 0;
    const questions: ExamReviewQuestion[] = local.map((r) => {
      const status: 'correct' | 'wrong' | 'unanswered' =
        r.yourOptionId == null ? 'unanswered' : r.isCorrect ? 'correct' : 'wrong';
      if (status === 'correct') correct += 1; else if (status === 'wrong') wrong += 1; else unanswered += 1;
      return {
        id: r.questionId,
        text: r.text,
        options: r.options,
        correctOptionId: r.correctOptionId ?? '',
        userOptionId: r.yourOptionId,
        isCorrect: r.isCorrect,
        status,
      };
    });
    return {
      examId, examTitle: '', subject: '',
      score: correct, total: local.length, correct, wrong, unanswered,
      answered: correct + wrong, questions,
    };
  }
}

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamReview>;
type Filter = 'all' | 'wrong' | 'correct' | 'unanswered';

// Variant hərfi mövqeyə görə (imtahan ekranı ilə eyni) — A,B,C,D ardıcıl.
const REVIEW_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Sualın statusunu müəyyən et (köhnə backend `status` göndərməsə də işləsin).
function qStatus(q: ExamReviewQuestion): 'correct' | 'wrong' | 'unanswered' {
  if (q.status) return q.status;
  if (q.userOptionId == null) return 'unanswered';
  return q.isCorrect ? 'correct' : 'wrong';
}

export default function ExamReviewScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { examId, filter: initialFilter } = route.params;
  const [filter, setFilter] = useState<Filter>(initialFilter ?? 'wrong');

  const { data, isLoading, error } = useQuery({
    queryKey: ['exam-review', examId],
    queryFn: () => loadReview(examId),
    retry: false,
  });

  const questions = useMemo(() => {
    const all = data?.questions ?? [];
    if (filter === 'all') return all;
    return all.filter((q) => qStatus(q) === filter);
  }, [data, filter]);

  const all = data?.questions ?? [];
  const wrongCount = data?.wrong ?? all.filter((q) => qStatus(q) === 'wrong').length;
  const correctCount = data?.correct ?? all.filter((q) => qStatus(q) === 'correct').length;
  const unansweredCount = data?.unanswered ?? all.filter((q) => qStatus(q) === 'unanswered').length;

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
          { id: 'wrong',      label: t('examReview.nWrong', { n: wrongCount }),         color: Colors.danger },
          { id: 'unanswered', label: t('examReview.nUnanswered', { n: unansweredCount }), color: Colors.warning ?? Colors.textMuted },
          { id: 'correct',    label: t('examReview.nCorrect', { n: correctCount }),      color: Colors.tertiary },
          { id: 'all',        label: t('examReview.allCount', { n: data?.total ?? 0 }),  color: Colors.primary },
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
            {filter === 'wrong' ? t('examReview.noWrong')
              : filter === 'correct' ? t('examReview.noCorrect')
              : filter === 'unanswered' ? t('examReview.noUnanswered')
              : t('examReview.noQuestions')}
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
  const status = qStatus(q);

  // Task 15 — Həllini Gör: izah artıq review ilə gəlibsə onu istifadə et, yoxsa basıldıqda yüklə.
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(q.explanation ?? null);
  const [optionExpl, setOptionExpl] = useState<Record<string, string> | null>(q.optionExplanations ?? null);

  const toggleSolution = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (explanation) return; // artıq yüklənib
    setLoading(true);
    setFailed(false);
    try {
      const sol = await getQuestionSolution(q.id);
      setExplanation(sol.explanation);
      setOptionExpl(sol.optionExplanations ?? null);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const badge =
    status === 'correct'
      ? { bg: Colors.tertiary + '20', color: Colors.tertiary, icon: 'checkmark-circle' as const, label: t('examReview.correct') }
      : status === 'unanswered'
        ? { bg: Colors.warning + '20', color: Colors.warning, icon: 'remove-circle' as const, label: t('examReview.unanswered') }
        : { bg: Colors.danger + '20', color: Colors.danger, icon: 'close-circle' as const, label: t('examReview.wrong') };

  const cardBorder =
    status === 'correct' ? styles.qCardCorrect : status === 'unanswered' ? styles.qCardUnanswered : styles.qCardWrong;

  return (
    <View style={[styles.qCard, cardBorder]}>
      <View style={styles.qHeader}>
        <View style={[styles.qBadge, { backgroundColor: badge.bg }]}>
          <Ionicons name={badge.icon} size={16} color={badge.color} />
          <Text style={[styles.qBadgeText, { color: badge.color }]}>
            {t('examReview.questionN', { n: index })} · {badge.label}
          </Text>
        </View>
      </View>

      <Text style={styles.qText}>{q.text}</Text>

      <View style={{ gap: 8, marginTop: 12 }}>
        {q.options.map((opt, oIndex) => {
          const isUser = q.userOptionId === opt.id;
          const isCorrect = q.correctOptionId === opt.id;
          // Hərf MÖVQEYƏ görədir (A,B,C,D ardıcıl) — id-yə görə yox, imtahan ekranı ilə eyni.
          const letter = REVIEW_LETTERS[oIndex] ?? opt.id.toUpperCase();
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
            <View key={opt.id}>
              <View style={[styles.optionRow, { backgroundColor: bgColor, borderColor }]}>
                <View style={[styles.optionLetter, { borderColor }]}>
                  <Text style={[styles.optionLetterText, { color: textColor }]}>{letter}</Text>
                </View>
                <Text style={[styles.optionText, { color: textColor, fontWeight: isCorrect || isUser ? '700' : '500' }]}>
                  {opt.text}
                </Text>
                {icon && <Ionicons name={icon} size={18} color={iconColor} />}
              </View>
              {/* Variant izahı (yalnız həll açıq olduqda) */}
              {open && optionExpl?.[opt.id] && (
                <Text style={styles.optExplText}>{optionExpl[opt.id]}</Text>
              )}
            </View>
          );
        })}
      </View>

      {status === 'unanswered' && (
        <Text style={styles.unansweredText}>{t('examReview.unanswered')}</Text>
      )}

      {/* Task 15 — Həllini Gör */}
      <TouchableOpacity style={styles.solutionBtn} activeOpacity={0.85} onPress={toggleSolution}>
        <Ionicons name={open ? 'chevron-up' : 'bulb-outline'} size={16} color={Colors.primary} />
        <Text style={styles.solutionBtnText}>
          {open ? t('examReview.hideSolution') : t('examReview.showSolution')}
        </Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.solutionBox}>
          {loading ? (
            <View style={styles.solutionLoadingRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.solutionLoadingText}>{t('examReview.solutionLoading')}</Text>
            </View>
          ) : failed ? (
            <Text style={styles.solutionFailedText}>{t('examReview.solutionFailed')}</Text>
          ) : explanation ? (
            <>
              <Text style={styles.solutionTitle}>{t('examReview.solutionTitle')}</Text>
              <Text style={styles.solutionText}>{explanation}</Text>
            </>
          ) : null}
        </View>
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
  qCardUnanswered: { borderColor: Colors.warning + '40' },
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

  optExplText: {
    fontSize: 11, color: Colors.textSecondary, lineHeight: 16,
    marginTop: 4, marginLeft: 40, marginBottom: 2,
  },

  solutionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, alignSelf: 'flex-start',
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 999, backgroundColor: Colors.primary + '12',
  },
  solutionBtnText: { fontSize: 12, fontWeight: '800', color: Colors.primary },

  solutionBox: {
    marginTop: 10, padding: 12, borderRadius: 12,
    backgroundColor: Colors.primary + '08',
    borderWidth: 1, borderColor: Colors.primary + '20',
  },
  solutionLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  solutionLoadingText: { fontSize: 12, color: Colors.textSecondary },
  solutionFailedText: { fontSize: 12, color: Colors.danger },
  solutionTitle: { fontSize: 12, fontWeight: '800', color: Colors.primary, marginBottom: 4 },
  solutionText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
});
