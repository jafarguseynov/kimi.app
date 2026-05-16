import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../../api/client';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const QUESTIONS = [
  'Hansı fənlər sizi ən çox maraqlandırır? (Riyaziyyat, Fizika, Kimya...)',
  'Hazırda ən çox çətinlik çəkdiyiniz mövzu nədir?',
  'Gündə neçə saat öyrənməyə vaxt ayıra bilərsiniz?',
  'Yaxın 6 ayda hansı məqsədinizə çatmaq istəyirsiniz?',
  'Öyrənmənin hansı üsulu sizə daha uyğundur? (video, oxumaq, məşq etmək...)',
];

interface LearningPlanItem {
  subject: string;
  goal: string;
  dailyMinutes: number;
}

export default function AIOnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''));
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<LearningPlanItem[] | null>(null);

  const currentAnswer = answers[step];

  const updateAnswer = (text: string) => {
    setAnswers((prev) => prev.map((a, i) => (i === step ? text : a)));
  };

  const goNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      try {
        const { data } = await api.post<{ plan: LearningPlanItem[] }>('/ai/onboarding', { answers });
        setPlan(data.plan);
      } catch {
        Alert.alert('Xəta', 'Plan hazırlanmadı. Daha sonra cəhd edin.');
        navigation.replace(Routes.Home);
      } finally {
        setLoading(false);
      }
    }
  };

  if (plan) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.planContent}>
        <Text style={styles.planEmoji}>🎯</Text>
        <Text style={styles.planTitle}>Fərdi Öyrənmə Planınız</Text>
        <Text style={styles.planSubtitle}>AI-nin tövsiyəsinə əsasən hazırlanmışdır</Text>

        {plan.map((item, i) => (
          <View key={i} style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <Text style={styles.planSubject}>{item.subject}</Text>
              <Text style={styles.planMinutes}>{item.dailyMinutes} dəq/gün</Text>
            </View>
            <Text style={styles.planGoal}>{item.goal}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.replace(Routes.Home)}
        >
          <Text style={styles.startBtnText}>Başlayaq! 🚀</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((step + 1) / QUESTIONS.length) * 100}%` }]} />
      </View>

      <Text style={styles.stepText}>{step + 1} / {QUESTIONS.length}</Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionEmoji}>🤖</Text>
        <Text style={styles.question}>{QUESTIONS[step]}</Text>
      </View>

      <TextInput
        style={styles.answer}
        placeholder="Cavabınızı yazın..."
        placeholderTextColor={Colors.textMuted}
        value={currentAnswer}
        onChangeText={updateAnswer}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        autoFocus
      />

      <TouchableOpacity
        style={[styles.nextBtn, (!currentAnswer.trim() || loading) && styles.nextBtnDisabled]}
        onPress={goNext}
        disabled={!currentAnswer.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.nextBtnText}>
            {step < QUESTIONS.length - 1 ? 'Növbəti →' : 'Plan hazırla 🎯'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => navigation.replace(Routes.Home)}
      >
        <Text style={styles.skipText}>Keç</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    marginTop: 56,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepText: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 12,
    marginBottom: 32,
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  questionEmoji: { fontSize: 40, marginBottom: 16 },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  answer: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 100,
    marginBottom: 20,
  },
  nextBtn: {
    marginHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  skipBtn: { alignItems: 'center', marginTop: 16 },
  skipText: { color: Colors.textMuted, fontSize: 14 },
  // Plan styles
  planContent: { padding: 24, paddingBottom: 48, alignItems: 'center' },
  planEmoji: { fontSize: 60, marginTop: 40, marginBottom: 16 },
  planTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  planSubtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 28 },
  planCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  planCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planSubject: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  planMinutes: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  planGoal: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  startBtn: {
    marginTop: 24,
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontWeight: '800', fontSize: 18 },
});
