import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { AppState } from 'react-native';
import { useExamStore } from '../../store/exam.store';
import { useSubmitExam, useSubmitCollectionTest } from '../../hooks/useExams';
import { isOnlineNow } from '../../services/offline/netStatus';
import { enqueueExam } from '../../services/offline/examQueue';
import { gradeLocally, saveLocalReview } from '../../services/offline/grade';
import { formatTime } from '../../utils/formatters';
import { hapticLight, hapticMedium, hapticSelection } from '../../utils/haptics';
import { rf, rs } from '../../utils/responsive';
import { useTranslation } from '../../i18n';

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamSession> };

const LETTERS = ['A', 'B', 'C', 'D'];

// Alçaq ekranlar (məs. Samsung A5 2017 ~640dp hündürlük) — şaquli boşluqları
// sıxlaşdır ki, sual + bütün variantlar ekrana sığsın.
const { height: SCREEN_H } = Dimensions.get('window');
const SHORT = SCREEN_H < 720;

export default function ExamSessionScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const {
    questions,
    currentIndex,
    answers,
    timeRemaining,
    durationSeconds,
    examId,
    sessionId,
    collectionId,
    submissionType,
    examMeta,
    setAnswer,
    nextQuestion,
    previousQuestion,
    decrementTimer,
    recomputeTimer,
    setResult,
  } = useExamStore();
  const { mutate, isPending } = useSubmitExam();
  const { mutate: mutateCollection, isPending: isPendingCollection } = useSubmitCollectionTest();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Task 16 — son 5 dəqiqə xəbərdarlığı (bir dəfə)
  const warned5Ref = useRef(false);
  const [showFiveMin, setShowFiveMin] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;
  const questionLabel = t('examSession.questionLabel', { n: String(currentIndex + 1).padStart(2, '0') });

  const submit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!examId) {
      Alert.alert(t('examSession.errorTitle'), t('examSession.noSession'));
      navigation.goBack();
      return;
    }
    const timeSpent = Math.max(0, durationSeconds - timeRemaining);

    // 1) DƏRHAL yerli nəticə — online/offline fərq etməz. İstifadəçi internet
    //    gözləmir; bal cihazda hesablanır (server `correctOptionId` göndərib).
    const { result, review } = gradeLocally(questions, answers, {
      examTitle: examMeta?.title,
      subject: examMeta?.subject,
      timeSpent,
    });
    setResult(result);
    saveLocalReview(examId, review).catch(() => {});
    navigation.replace(Routes.ExamResult);

    // 2) Arxa planda serverə yaz (rəsmi qeyd: liderlik · sertifikat · analitika).
    //    Offline və ya xəta olarsa növbəyə yazılır → internet qayıdanda avtomatik sinxron.
    const queueForSync = () => {
      enqueueExam({
        localId: sessionId ?? `${examId}-${Date.now()}`,
        kind: collectionId ? 'collection' : 'exam',
        examId,
        collectionId: collectionId ?? undefined,
        questionIds: collectionId ? questions.map((q) => q.id) : undefined,
        answers,
        timeSpent,
        type: submissionType ?? undefined,
        title: examMeta?.title,
        queuedAt: Date.now(),
      }).catch(() => {});
    };

    if (!isOnlineNow()) {
      queueForSync();
      return;
    }
    const onSyncError = (err: any) => {
      const status = err?.response?.status;
      const transient = !err?.response || err?.code === 'ECONNABORTED' || (typeof status === 'number' && status >= 500);
      if (transient) queueForSync(); // şəbəkə/server xətası → sonra təkrar sinxron
      // 4xx-də nəticə artıq göstərilib; sakitcə keç (istifadəçini narahat etmə).
    };
    if (collectionId) {
      mutateCollection(
        { id: collectionId, questionIds: questions.map((q) => q.id), answers, timeSpent },
        { onError: onSyncError },
      );
    } else {
      mutate({ examId, answers, timeSpent, type: submissionType ?? undefined }, { onError: onSyncError });
    }
  };

  const handleClose = () => {
    Alert.alert(
      t('examSession.exitTitle'),
      t('examSession.exitMsg'),
      [
        { text: t('examSession.exitNo'), style: 'cancel' },
        {
          text: t('examSession.exitYes'),
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
    // Wall-clock: açılışda qalan vaxtı startedAt-dan dəqiq hesabla (resume/sönmə üçün).
    recomputeTimer();
    timerRef.current = setInterval(() => {
      decrementTimer();
    }, 1000);
    // Tətbiq fona keçib qayıdanda da vaxtı real saata görə düzəlt.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') recomputeTimer();
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (timeRemaining === 0) submit();
  }, [timeRemaining]);

  // Task 16 — yalnız 5 dəqiqədən uzun imtahanlarda, son 5 dəqiqədə bir dəfə xəbərdarlıq
  useEffect(() => {
    if (
      !warned5Ref.current &&
      durationSeconds > 300 &&
      timeRemaining > 0 &&
      timeRemaining <= 300
    ) {
      warned5Ref.current = true;
      hapticMedium();
      setShowFiveMin(true);
      setTimeout(() => setShowFiveMin(false), 4000);
    }
  }, [timeRemaining, durationSeconds]);

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
        <Text style={styles.topBarTitle}>{t('examSession.title')}</Text>
        <View style={[styles.timerBadge, timeRemaining <= 300 && timeRemaining > 60 && styles.timerBadgeWarn, timeRemaining <= 60 && styles.timerBadgeDanger]}>
          <Text style={[
            styles.timerText,
            timeRemaining <= 300 && timeRemaining > 60 && { color: Colors.warning },
            timeRemaining <= 60 && { color: Colors.danger },
          ]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Task 16 — son 5 dəqiqə xəbərdarlığı */}
      {showFiveMin && (
        <View style={styles.fiveMinBanner}>
          <Ionicons name="alarm-outline" size={16} color="#fff" />
          <Text style={styles.fiveMinBannerText}>{t('examSession.fiveMinWarning')}</Text>
        </View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Badge + fənn bloku (çoxfənnli sınaqda) */}
        <View style={styles.badgeRow}>
          <View style={styles.questionBadge}>
            <Text style={styles.questionBadgeText}>{questionLabel}</Text>
          </View>
          {!!currentQuestion.section && (
            <View style={styles.sectionBadge}>
              <Ionicons name="book-outline" size={12} color={Colors.primary} />
              <Text style={styles.sectionBadgeText}>{currentQuestion.section}</Text>
            </View>
          )}
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.cardAccent} />
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
                onPress={() => { hapticSelection(); setAnswer(currentQuestion.id, opt.id); }}
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

        {/* AI Tip — alçaq ekranlarda gizlət ki, variantlar tam görünsün */}
        {!SHORT && (
        <View style={styles.aiTipCard}>
          <View style={styles.aiTipAvatar}>
            <Ionicons name="hardware-chip-outline" size={26} color={Colors.primary} />
          </View>
          <View style={styles.aiTipBody}>
            <Text style={styles.aiTipLabel}>{t('examSession.aiTipLabel')}</Text>
            <Text style={styles.aiTipText}>{t('examSession.aiTipText')}</Text>
          </View>
        </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnBack, isFirst && styles.navBtnDisabled]}
          onPress={() => !isFirst && previousQuestion()}
          activeOpacity={isFirst ? 1 : 0.8}
        >
          <Ionicons name="arrow-back-outline" size={16} color={isFirst ? Colors.textMuted : Colors.textSecondary} />
          <Text style={[styles.navBtnTextBack, isFirst && { color: Colors.textMuted }]}>{t('examSession.back')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { if (isLast) { hapticMedium(); submit(); } else { hapticLight(); nextQuestion(); } }}
          disabled={isPending || isPendingCollection}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.navBtnNext}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.navBtnTextNext}>
              {(isPending || isPendingCollection) ? t('examSession.loading') : isLast ? t('examSession.finish') : t('examSession.next')}
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
  timerBadgeWarn: { backgroundColor: Colors.warningLight },
  timerBadgeDanger: { backgroundColor: Colors.dangerLight },
  timerText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  fiveMinBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.warning,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  fiveMinBannerText: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

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

  scroll: { paddingHorizontal: 20, paddingTop: SHORT ? 12 : 24, paddingBottom: 20 },

  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SHORT ? 10 : 16, flexWrap: 'wrap' },
  questionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sectionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '14',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  sectionBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 0.3 },
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
    padding: rs(SHORT ? 14 : 24),
    marginBottom: rs(SHORT ? 12 : 20),
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
    fontSize: rf(18),
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: rf(26),
    marginBottom: 20,
    maxWidth: '85%',
  },
  formulaBox: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 14,
    paddingVertical: rs(SHORT ? 14 : 20),
    paddingHorizontal: rs(SHORT ? 14 : 20),
    alignItems: 'center',
  },
  formulaText: {
    fontSize: rf(SHORT ? 17 : 19),
    fontWeight: '700',
    color: Colors.primaryDim,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  optionsContainer: { gap: SHORT ? 8 : 12, marginBottom: SHORT ? 12 : 28 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingVertical: rs(SHORT ? 10 : 13),
    paddingHorizontal: rs(16),
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
    width: rs(SHORT ? 30 : 36),
    height: rs(SHORT ? 30 : 36),
    borderRadius: rs(SHORT ? 15 : 18),
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  letterCircleSelected: { backgroundColor: Colors.primary },
  letterText: { fontSize: rf(15), fontWeight: '700', color: Colors.primary },
  letterTextSelected: { color: '#fff' },
  optionText: { flex: 1, fontSize: rf(15), fontWeight: '500', color: Colors.textPrimary },
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
