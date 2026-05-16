import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExamStore } from '../../store/exam.store';
import { useSubmitExam } from '../../hooks/useExams';
import { formatTime } from '../../utils/formatters';

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamSession> };

const LETTERS = ['A', 'B', 'C', 'D'];

export default function ExamSessionScreen({ navigation }: Props) {
  const {
    questions,
    currentIndex,
    answers,
    timeRemaining,
    examId,
    setAnswer,
    nextQuestion,
    previousQuestion,
    decrementTimer,
  } = useExamStore();
  const { mutate, isPending } = useSubmitExam();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;
  const questionLabel = `Sual ${String(currentIndex + 1).padStart(2, '0')}`;

  const submit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mutate(
      { examId: examId!, answers, timeSpent: 0 },
      { onSuccess: () => navigation.replace(Routes.ExamResult) },
    );
  };

  const handleClose = () => {
    Alert.alert(
      'İmtahandan çıxmaq istəyirsiniz?',
      'Tərəqqiniz saxlanılmayacaq.',
      [
        { text: 'Xeyr', style: 'cancel' },
        {
          text: 'Çıx',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            navigation.goBack();
          },
        },
      ],
    );
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (timeRemaining === 0) submit();
  }, [timeRemaining]);

  if (!currentQuestion) return null;

  const selectedOptionId = answers[currentQuestion.id];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="close" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>İmtahan</Text>
        <View style={styles.timerBadge}>
          <Text style={[styles.timerText, timeRemaining < 60 && { color: Colors.danger }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Badge */}
        <View style={styles.questionBadge}>
          <Text style={styles.questionBadgeText}>{questionLabel}</Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.cardAccent} />
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>{currentQuestion.text}</Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((opt, index) => {
            const letter = LETTERS[index] ?? String(index + 1);
            const isSelected = selectedOptionId === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => setAnswer(currentQuestion.id, opt.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.letterCircle, isSelected && styles.letterCircleSelected]}>
                  <Text style={[styles.letterText, isSelected && styles.letterTextSelected]}>
                    {letter}
                  </Text>
                </View>
                <Text style={styles.optionText}>{opt.text}</Text>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* AI Tip */}
        <View style={styles.aiTipCard}>
          <View style={styles.aiTipAvatar}>
            <Ionicons name="hardware-chip-outline" size={26} color={Colors.primary} />
          </View>
          <View style={styles.aiTipBody}>
            <Text style={styles.aiTipLabel}>Kimi Robot İpucu</Text>
            <Text style={styles.aiTipText}>Viyet teoremini xatırlamağa çalışın.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnBack, isFirst && styles.navBtnDisabled]}
          onPress={() => !isFirst && previousQuestion()}
          activeOpacity={isFirst ? 1 : 0.8}
        >
          <Ionicons name="arrow-back-outline" size={16} color={isFirst ? Colors.textMuted : Colors.textSecondary} />
          <Text style={[styles.navBtnTextBack, isFirst && { color: Colors.textMuted }]}>Geri</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => isLast ? submit() : nextQuestion()}
          disabled={isPending}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.navBtnNext}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.navBtnTextNext}>
              {isPending ? 'Yüklənir...' : isLast ? 'Bitir' : 'Növbəti'}
            </Text>
            {!isLast && <Ionicons name="arrow-forward-outline" size={16} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },
  timerBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  timerText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: Colors.surfaceLow,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primaryFixed,
    borderRadius: 999,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },

  questionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  questionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  cardAccent: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: Colors.primaryLight,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: 20,
    maxWidth: '85%',
  },
  formulaBox: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  formulaText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primaryDim,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  optionsContainer: { gap: 12, marginBottom: 28 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  optionRowSelected: { borderColor: Colors.primaryFixed },
  letterCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  letterCircleSelected: { backgroundColor: Colors.primary },
  letterText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  letterTextSelected: { color: '#fff' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 14,
  },
  aiTipAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiTipBody: { flex: 1 },
  aiTipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  aiTipText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  navBtn: { borderRadius: 999, overflow: 'hidden' },
  navBtnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceLow,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  navBtnDisabled: { opacity: 0.5 },
  navBtnTextBack: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  navBtnNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  navBtnTextNext: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
