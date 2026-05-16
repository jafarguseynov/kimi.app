import React, { useEffect, useRef, useState } from 'react';
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

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.LiveExamSession> };

const LETTERS = ['A', 'B', 'C', 'D'];

const LIVE_FEED = [
  { id: '1', text: 'Sənan cavab verdi!', bold: 'Sənan', live: true },
  { id: '2', text: 'Aytən qoşuldu', bold: 'Aytən', live: false },
  { id: '3', text: 'Murad səhv etdi', bold: 'Murad', live: false },
];

export default function LiveExamSessionScreen({ navigation }: Props) {
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
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  const submit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mutate(
      { examId: examId!, answers, timeSpent: 0 },
      { onSuccess: () => navigation.replace(Routes.ExamRanking) },
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
    timerRef.current = setInterval(() => { decrementTimer(); }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (timeRemaining === 0) submit();
  }, [timeRemaining]);

  if (!currentQuestion) return null;

  const selectedOptionId = answers[currentQuestion.id];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Canlı İmtahan</Text>
        </View>
        <View style={styles.topBarRight}>
          <View style={styles.timerCol}>
            <Text style={styles.timerLabel}>Qalan vaxt</Text>
            <Text style={[styles.timerValue, timeRemaining < 60 && { color: Colors.danger }]}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
          <TouchableOpacity style={styles.helpBtn} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="help-circle-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressMeta}>
            <View>
              <Text style={styles.progressSubject}>Riyaziyyat • Sual {currentIndex + 1}/{questions.length}</Text>
              <Text style={styles.progressChapter}>Cəbr və Funksiyalar</Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>ZORLUQ: ORTA</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        {/* Live Feed */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.feedScroll}
        >
          {LIVE_FEED.map((item, i) => (
            <View key={item.id} style={[styles.feedPill, i > 0 && { opacity: i === 1 ? 0.8 : 0.6 }]}>
              {item.live && <View style={styles.liveDot} />}
              <Text style={styles.feedText}>
                <Text style={styles.feedBold}>{item.bold}</Text>
                {item.text.replace(item.bold, '')}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionAccentIcon}>
            <Ionicons name="calculator-outline" size={72} color={Colors.primary} />
          </View>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((opt, index) => {
            const letter = LETTERS[index] ?? String(index + 1);
            const isSelected = selectedOptionId === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setAnswer(currentQuestion.id, opt.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.letterCircle, isSelected && styles.letterCircleSelected]}>
                  <Text style={[styles.letterText, isSelected && styles.letterTextSelected]}>
                    {letter}
                  </Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {opt.text}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Kimi Hint */}
        <View style={styles.hintCard}>
          <View style={styles.hintIconBox}>
            <Ionicons name="bulb-outline" size={20} color={Colors.tertiary} />
          </View>
          <View style={styles.hintBody}>
            <Text style={styles.hintLabel}>Kimi-dən kömək</Text>
            <Text style={styles.hintText}>
              Unutma ki, kvadrat tənliyin həm müsbət, həm də mənfi kökü ola bilər.
            </Text>
          </View>
          <View style={styles.hintBgIcon}>
            <Ionicons name="hardware-chip-outline" size={56} color={Colors.tertiary} />
          </View>
        </View>

        {/* Ranking Indicator */}
        <View style={styles.rankingBar}>
          <View style={styles.rankingLeft}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.rankCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.rankNum}>42</Text>
            </LinearGradient>
            <View>
              <Text style={styles.rankMeta}>Sizin yeriniz</Text>
              <Text style={styles.rankText}>Liderlik cədvəlində 42-ci</Text>
            </View>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.xpText}>1,240 XP</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navBtnBack, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={() => currentIndex > 0 && previousQuestion()}
          activeOpacity={currentIndex === 0 ? 1 : 0.8}
        >
          <Ionicons name="arrow-back-outline" size={16} color={currentIndex === 0 ? Colors.textMuted : Colors.textSecondary} />
          <Text style={[styles.navBtnBackText, currentIndex === 0 && { color: Colors.textMuted }]}>Geri</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => isLast ? submit() : nextQuestion()} disabled={isPending} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.navBtnNext}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.navBtnNextText}>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timerCol: { alignItems: 'flex-end' },
  timerLabel: { fontSize: 9, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  timerValue: { fontSize: 18, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  helpBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, gap: 16 },

  progressSection: { gap: 10 },
  progressMeta: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  progressSubject: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary, marginBottom: 2 },
  progressChapter: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  difficultyBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  difficultyText: { fontSize: 9, fontWeight: '700', color: Colors.primary, letterSpacing: 0.8 },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999 },

  feedScroll: { paddingRight: 4, gap: 10 },
  feedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  feedText: { fontSize: 12, color: Colors.textPrimary },
  feedBold: { fontWeight: '700' },

  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  questionAccentIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    opacity: 0.08,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 26,
    maxWidth: '90%',
  },

  optionsContainer: { gap: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  optionCardSelected: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primaryFixed,
  },
  letterCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterCircleSelected: { backgroundColor: Colors.primary },
  letterText: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  letterTextSelected: { color: '#fff' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  optionTextSelected: { fontWeight: '700', color: Colors.primaryDim },

  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: Colors.tertiaryContainer + '25',
    borderRadius: 16,
    padding: 18,
    overflow: 'hidden',
  },
  hintIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  hintBody: { flex: 1 },
  hintLabel: { fontSize: 11, fontWeight: '700', color: Colors.tertiary, marginBottom: 4 },
  hintText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  hintBgIcon: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    opacity: 0.12,
  },

  rankingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inverse,
    borderRadius: 16,
    padding: 16,
  },
  rankingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rankNum: { fontSize: 14, fontWeight: '700', color: '#fff' },
  rankMeta: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 },
  rankText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  xpText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  navBtnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceLow,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  navBtnDisabled: { opacity: 0.45 },
  navBtnBackText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  navBtnNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  navBtnNextText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
