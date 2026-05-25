import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useStartExam } from '../../hooks/useExams';

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamSettings>;
  route: RouteProp<ExamStackParamList, typeof Routes.ExamSettings>;
};

const QUESTION_COUNTS = [10, 20, 30, 40, 50];
const DURATIONS = [15, 30, 45, 60, 90];
const DIFFICULTIES: { id: 'easy' | 'medium' | 'hard' | 'mixed'; label: string; color: string }[] = [
  { id: 'easy', label: 'Asan', color: Colors.tertiary },
  { id: 'medium', label: 'Orta', color: Colors.primary },
  { id: 'hard', label: 'Çətin', color: Colors.danger },
  { id: 'mixed', label: 'Qarışıq', color: Colors.secondary },
];
const QUESTION_TYPES: { id: 'test' | 'open' | 'both'; label: string }[] = [
  { id: 'test', label: 'Test' },
  { id: 'open', label: 'Açıq' },
  { id: 'both', label: 'Hər ikisi' },
];

export default function ExamSettingsScreen({ navigation, route }: Props) {
  const examId = route.params?.examId;
  const title = route.params?.title ?? 'İmtahan tənzimləmələri';
  const { mutate, isPending } = useStartExam();

  const [questionCount, setQuestionCount] = useState(20);
  const [duration, setDuration] = useState(30);
  const [noTimeLimit, setNoTimeLimit] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [questionType, setQuestionType] = useState<'test' | 'open' | 'both'>('test');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showCorrect, setShowCorrect] = useState(true);
  const [autoNext, setAutoNext] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleStart = () => {
    if (!examId) {
      // No specific exam pre-selected — forward all chosen settings to NewExam,
      // where the user can pick subject/topics and generate a matching exam.
      navigation.navigate(Routes.NewExam, {
        questionCount,
        duration: noTimeLimit ? undefined : duration,
        difficulty,
        questionType,
      });
      return;
    }
    mutate(examId, {
      onSuccess: () => navigation.navigate(Routes.ExamSession),
      onError: () => Alert.alert('Xəta', 'İmtahan başlamadı, yenidən cəhd edin'),
    });
  };

  const handleReset = () => {
    setQuestionCount(20);
    setDuration(30);
    setNoTimeLimit(false);
    setDifficulty('medium');
    setQuestionType('test');
    setShuffleQuestions(true);
    setShowCorrect(true);
    setAutoNext(false);
    setSoundEffects(true);
    setHapticFeedback(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Tənzimləmələr</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{title}</Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} hitSlop={8}>
          <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="settings-outline" size={26} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>İmtahan tənzimləmələri</Text>
          <Text style={styles.heroSub}>
            İmtahanın çətinliyini, müddətini və sual növünü öz tələblərinə görə ayarlay
          </Text>
        </View>

        {/* Sual sayı */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="help-circle-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Sual sayı</Text>
              <Text style={styles.cardSub}>İmtahanda neçə sual olsun?</Text>
            </View>
            <Text style={styles.cardValue}>{questionCount}</Text>
          </View>
          <View style={styles.chipRow}>
            {QUESTION_COUNTS.map((n) => {
              const active = questionCount === n;
              return (
                <TouchableOpacity
                  key={n}
                  onPress={() => setQuestionCount(n)}
                  activeOpacity={0.85}
                  style={active ? styles.chipActive : styles.chip}
                >
                  <Text style={active ? styles.chipActiveText : styles.chipText}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Müddət */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="time-outline" size={18} color={Colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Müddət</Text>
              <Text style={styles.cardSub}>İmtahan vaxtı (dəq)</Text>
            </View>
            <Text style={styles.cardValue}>{noTimeLimit ? '∞' : `${duration}m`}</Text>
          </View>
          <View style={[styles.chipRow, noTimeLimit && { opacity: 0.4 }]} pointerEvents={noTimeLimit ? 'none' : 'auto'}>
            {DURATIONS.map((n) => {
              const active = duration === n;
              return (
                <TouchableOpacity
                  key={n}
                  onPress={() => setDuration(n)}
                  activeOpacity={0.85}
                  style={active ? styles.chipActive : styles.chip}
                >
                  <Text style={active ? styles.chipActiveText : styles.chipText}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Vaxt limiti olmasın</Text>
            <Switch
              value={noTimeLimit}
              onValueChange={setNoTimeLimit}
              trackColor={{ false: Colors.borderLight, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Çətinlik */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="bar-chart-outline" size={18} color={Colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Çətinlik səviyyəsi</Text>
              <Text style={styles.cardSub}>Suallar nə qədər çətin olsun?</Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => setDifficulty(d.id)}
                  activeOpacity={0.85}
                  style={[
                    active ? styles.chipActive : styles.chip,
                    active && { backgroundColor: d.color },
                  ]}
                >
                  <Text style={active ? styles.chipActiveText : styles.chipText}>{d.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sual növü */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="list-outline" size={18} color={Colors.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Sual növü</Text>
              <Text style={styles.cardSub}>Test, açıq və ya hər ikisi</Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            {QUESTION_TYPES.map((t) => {
              const active = questionType === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setQuestionType(t.id)}
                  activeOpacity={0.85}
                  style={active ? styles.chipActive : styles.chip}
                >
                  <Text style={active ? styles.chipActiveText : styles.chipText}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Davranış */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Davranış</Text>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Sualları qarışdır</Text>
              <Text style={styles.toggleSub}>Hər dəfə fərqli sıra ilə</Text>
            </View>
            <Switch
              value={shuffleQuestions}
              onValueChange={setShuffleQuestions}
              trackColor={{ false: Colors.borderLight, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Düzgün cavabı göstər</Text>
              <Text style={styles.toggleSub}>Sual cavablandıqda izahla göstər</Text>
            </View>
            <Switch
              value={showCorrect}
              onValueChange={setShowCorrect}
              trackColor={{ false: Colors.borderLight, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Avtomatik növbəti</Text>
              <Text style={styles.toggleSub}>Cavabdan sonra növbəti suala keç</Text>
            </View>
            <Switch
              value={autoNext}
              onValueChange={setAutoNext}
              trackColor={{ false: Colors.borderLight, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Səs effektləri</Text>
              <Text style={styles.toggleSub}>Düzgün/səhv səsləri</Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={setSoundEffects}
              trackColor={{ false: Colors.borderLight, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Vibrasiya</Text>
              <Text style={styles.toggleSub}>Cavab verdikdə kiçik vibrasiya</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: Colors.borderLight, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
          <Text style={styles.tipText}>
            {examId
              ? 'Tənzimləmələr bu imtahan sessiyasında tətbiq olunur.'
              : 'Bu ayarlarla yeni imtahan yaratmaq üçün sonra mövzu və fənn seçəcəksən.'}
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleStart} disabled={isPending} activeOpacity={0.85} style={styles.startBtnOuter}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.startBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="rocket-outline" size={22} color="#fff" />
            <Text style={styles.startBtnText}>
              {examId ? 'Tənzimləmələrlə başla' : 'Tənzimləmələrlə yeni imtahan yarat'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  resetBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 16 },

  hero: { alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  heroIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  heroSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  cardValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: -4 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceContainer,
  },
  chipActive: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipActiveText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  toggleSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 4 },

  tipCard: {
    flexDirection: 'row', gap: 10, padding: 14, borderRadius: 14,
    backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primaryFixed + '30',
  },
  tipText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  bottomBar: {
    paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 20,
    backgroundColor: 'rgba(245,247,249,0.95)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  startBtnOuter: { borderRadius: 999, overflow: 'hidden' },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: 999,
  },
  startBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
});
