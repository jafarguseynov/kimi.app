import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useGenerateExam } from '../../hooks/useExams';
import { useExamConfig, pickExamConfig } from '../../hooks/useExamConfig';
import { useExamStore } from '../../store/exam.store';
import ExamLoadingOverlay from '../../components/exam/ExamLoadingOverlay';

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.NewExam>;
  route: RouteProp<ExamStackParamList, typeof Routes.NewExam>;
};

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

// ─── Fallback dəyərlər — admin /exam-config boş/əlçatmaz olarsa istifadə olunur ───
const FALLBACK_GRADES = ['5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'];

const FALLBACK_SUBJECTS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'math', label: 'Riyaziyyat', icon: 'calculator' },
  { key: 'az', label: 'Azərbaycan dili', icon: 'language' },
  { key: 'en', label: 'İngilis dili', icon: 'globe' },
];

const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  math: ['Həqiqi ədədlər', 'Üçbucaqlar', 'Funksiyalar', 'Vektorlar', 'Tənliklər', 'Həndəsə'],
  az: ['Morfologiya', 'Sintaksis', 'Orfoqrafiya', 'Bədii ədəbiyyat', 'İnşa'],
  en: ['Grammar', 'Tenses', 'Reading', 'Listening', 'Writing'],
};

const DIFF_LABELS: Record<string, string> = { easy: 'Asan', medium: 'Orta', hard: 'Çətin' };
const FALLBACK_DIFFICULTIES: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
const FALLBACK_DURATIONS = [15, 30, 45, 60, 90];

type ExamTypeKey = 'practice' | 'monthly' | 'national' | 'live';
const EXAM_TYPES: { key: ExamTypeKey; label: string; color: string }[] = [
  { key: 'practice', label: 'Sınaq', color: '#1196DA' },
  { key: 'monthly',  label: 'Aylıq', color: '#B45309' },
  { key: 'national', label: 'Milli', color: '#7C3AED' },
  { key: 'live',     label: 'Canlı', color: '#DC2626' },
];

const THUMB_SIZE = 26;

export default function NewExamScreen({ navigation, route }: Props) {
  const { mutate: doGenerate, isPending: isGenerating } = useGenerateExam();
  const setSubmissionType = useExamStore((s) => s.setSubmissionType);
  const initial = route.params ?? {};
  // 'mixed' difficulty from ExamSettings is treated as 'medium' on backend (no AI level for true mixed yet)
  const initialDifficulty: 'easy' | 'medium' | 'hard' =
    initial.difficulty === 'easy' || initial.difficulty === 'hard' ? initial.difficulty : 'medium';
  const [gradeIdx, setGradeIdx] = useState(4);
  const [subject, setSubject] = useState('math');
  const [topics, setTopics] = useState<Set<string>>(new Set(['Həqiqi ədədlər']));
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialDifficulty);
  const [examType, setExamType] = useState<ExamTypeKey>(initial.examType ?? 'practice');
  const [questionCount, setQuestionCount] = useState(initial.questionCount ?? 25);
  const [duration, setDuration] = useState<number | undefined>(initial.duration);
  const [gradeOpen, setGradeOpen] = useState(false);

  // ─── Admin paneldən gələn parametrlər (boş/əlçatmaz olsa fallback) ───
  const configBundle = useExamConfig();
  const cfg = useMemo(() => pickExamConfig(configBundle, { type: examType }), [configBundle, examType]);

  const SUBJECTS = useMemo(
    () =>
      cfg?.subjects?.length
        ? cfg.subjects.map((s) => ({ key: s.key, label: s.label, icon: (s.icon ?? 'book') as keyof typeof Ionicons.glyphMap }))
        : FALLBACK_SUBJECTS,
    [cfg],
  );
  const GRADES = useMemo(() => (cfg?.grades?.length ? cfg.grades : FALLBACK_GRADES), [cfg]);
  const DIFFICULTIES = useMemo(
    () => (cfg?.difficulties?.length ? cfg.difficulties : FALLBACK_DIFFICULTIES).map((k) => ({ key: k as 'easy' | 'medium' | 'hard', label: DIFF_LABELS[k] ?? k })),
    [cfg],
  );
  const DURATIONS = cfg?.durationOptions?.length ? cfg.durationOptions : FALLBACK_DURATIONS;
  const VISIBLE_EXAM_TYPES = useMemo(
    () => (cfg?.examTypes?.length ? EXAM_TYPES.filter((t) => cfg.examTypes.includes(t.key)) : EXAM_TYPES),
    [cfg],
  );
  // Sual sayı bütün imtahanlar üçün sabitdir — admin paneldəki "Defolt sual" dəyəri.
  // İstifadəçi dəyişə bilmir; backend onsuz da bu sayı tətbiq edir.
  const STANDARD_Q = cfg?.defaultQuestions ?? 25;

  // Sual sayı sabitdir — həmişə standart dəyərə bərabər saxlanılır
  useEffect(() => {
    setQuestionCount(STANDARD_Q);
  }, [STANDARD_Q]);

  // Seçilmiş fənn artıq siyahıda yoxdursa — ilkinə qayıt
  useEffect(() => {
    if (SUBJECTS.length && !SUBJECTS.some((s) => s.key === subject)) {
      setSubject(SUBJECTS[0].key);
      setTopics(new Set());
    }
  }, [SUBJECTS]);

  // Seçilmiş çətinlik artıq icazəli deyilsə — ilkinə qayıt
  useEffect(() => {
    if (DIFFICULTIES.length && !DIFFICULTIES.some((d) => d.key === difficulty)) {
      setDifficulty(DIFFICULTIES[0].key);
    }
  }, [DIFFICULTIES]);

  // Sinif indeksi diapazondan kənardadırsa — düzəlt
  useEffect(() => {
    if (gradeIdx >= GRADES.length) setGradeIdx(Math.max(0, GRADES.length - 1));
  }, [GRADES]);

  const topicList = TOPICS_BY_SUBJECT[subject] ?? [];

  const toggleTopic = (t: string) => {
    setTopics((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const selectAllTopics = () => setTopics(new Set(topicList));

  const handleStart = () => {
    if (isGenerating) return;
    doGenerate(
      {
        subject,
        topics: Array.from(topics),
        difficulty,
        questionCount,
        duration,
        grade: GRADES[gradeIdx],
        type: examType,
      },
      {
        onSuccess: (exam) => {
          setSubmissionType(examType);
          navigation.navigate(Routes.ExamDetail, { examId: exam.id, title: exam.title });
        },
        onError: (err: any) => {
          Alert.alert('Xəta', err?.response?.data?.message ?? 'İmtahan yaradıla bilmədi. Yenidən cəhd edin.');
        },
      },
    );
  };

  const aiTopic = Array.from(topics)[0] ?? topicList[0] ?? 'mövzu';
  const aiSubject = SUBJECTS.find((s) => s.key === subject)?.label ?? 'imtahan';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.headerIconBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerBrand}>Kimi.az</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Ionicons name="person" size={18} color={Colors.primary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Yeni İmtahan</Text>
          <Text style={styles.heroSub}>Biliklərini yoxlamaq üçün seçimləri tamamla.</Text>
        </View>

        {/* Grade */}
        <View style={styles.section}>
          <Text style={styles.label}>Sinif seçin</Text>
          <TouchableOpacity
            style={styles.selectBox}
            activeOpacity={0.85}
            onPress={() => setGradeOpen((o) => !o)}
          >
            <Text style={styles.selectText}>{GRADES[gradeIdx]}</Text>
            <Ionicons name={gradeOpen ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {gradeOpen && (
            <View style={styles.dropdown}>
              {GRADES.map((g, i) => {
                const active = i === gradeIdx;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => {
                      setGradeIdx(i);
                      setGradeOpen(false);
                    }}
                    style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                  >
                    <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>{g}</Text>
                    {active && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Subject */}
        <View style={styles.section}>
          <Text style={styles.label}>Fənn seçin</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectsRow}>
            {SUBJECTS.map((s) => {
              const active = s.key === subject;
              return (
                <TouchableOpacity
                  key={s.key}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSubject(s.key);
                    setTopics(new Set());
                  }}
                  style={active ? styles.subjectChipActive : styles.subjectChip}
                >
                  <Ionicons name={s.icon} size={18} color={active ? '#fff' : Colors.textSecondary} />
                  <Text style={active ? styles.subjectChipActiveText : styles.subjectChipText}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Topics */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Mövzular</Text>
            <TouchableOpacity onPress={selectAllTopics} hitSlop={8}>
              <Text style={styles.linkText}>Hamısını seç</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.topicsWrap}>
            {topicList.map((t) => {
              const active = topics.has(t);
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => toggleTopic(t)}
                  activeOpacity={0.85}
                  style={active ? styles.topicChipActive : styles.topicChip}
                >
                  <Text style={active ? styles.topicChipActiveText : styles.topicChipText}>{t}</Text>
                  {active && <Ionicons name="close" size={14} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Difficulty */}
        <View style={styles.section}>
          <Text style={styles.label}>Çətinlik dərəcəsi</Text>
          <View style={styles.segWrap}>
            {DIFFICULTIES.map((d) => {
              const active = d.key === difficulty;
              return (
                <TouchableOpacity
                  key={d.key}
                  activeOpacity={0.85}
                  onPress={() => setDifficulty(d.key)}
                  style={[styles.segItem, active && styles.segItemActive]}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>{d.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Exam type */}
        <View style={styles.section}>
          <Text style={styles.label}>İmtahan növü</Text>
          <View style={styles.segWrap}>
            {VISIBLE_EXAM_TYPES.map((t) => {
              const active = t.key === examType;
              return (
                <TouchableOpacity
                  key={t.key}
                  activeOpacity={0.85}
                  onPress={() => setExamType(t.key)}
                  style={[styles.segItem, active && { backgroundColor: t.color + '14', borderColor: t.color }]}
                >
                  <Text style={[styles.segText, active && { color: t.color, fontWeight: '700' }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Question count — sabit standart */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Sual sayı</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{questionCount}</Text>
            </View>
          </View>
          <Text style={styles.sliderLabelText}>
            Bütün imtahanlar üçün standart say — {STANDARD_Q} sual.
          </Text>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Müddət</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{duration ? `${duration} dəq` : 'Avto'}</Text>
            </View>
          </View>
          <View style={styles.segWrap}>
            {DURATIONS.map((m) => {
              const active = duration === m;
              return (
                <TouchableOpacity
                  key={m}
                  activeOpacity={0.85}
                  onPress={() => setDuration(active ? undefined : m)}
                  style={[styles.segItem, active && styles.segItemActive]}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>{m}m</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* AI tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={16} color={Colors.primary} />
            <Text style={styles.tipTitle}>Kimi-nin məsləhəti</Text>
          </View>
          <Text style={styles.tipText}>
            {aiSubject} imtahanına başlamazdan əvvəl{' '}
            <Text style={styles.tipStrong}>"{aiTopic}"</Text> mövzusuna təkrar baxmağın faydalı ola bilər!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.ctaWrap} pointerEvents="box-none">
        <TouchableOpacity activeOpacity={0.9} onPress={handleStart} disabled={isGenerating} style={styles.ctaTouchable}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
            {isGenerating ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.ctaText}>Yaradılır...</Text>
              </>
            ) : (
              <>
                <Ionicons name="rocket" size={20} color="#fff" />
                <Text style={styles.ctaText}>İmtahanı başlat</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ExamLoadingOverlay visible={isGenerating} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceLow,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerBrand: { fontSize: 22, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },

  hero: { marginBottom: 28 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.8, marginBottom: 4 },
  heroSub: { fontSize: 16, color: Colors.textSecondary, lineHeight: 22 },

  section: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 },
  label: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12, paddingHorizontal: 4 },
  linkText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  selectBox: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  selectText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  dropdown: {
    marginTop: 8, backgroundColor: Colors.surfaceLowest, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dropdownItemActive: { backgroundColor: Colors.primaryLight },
  dropdownItemText: { fontSize: 14, color: Colors.textPrimary },
  dropdownItemTextActive: { color: Colors.primary, fontWeight: '700' },

  subjectsRow: { gap: 12, paddingHorizontal: 4, paddingVertical: 2 },
  subjectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLowest, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16,
  },
  subjectChipText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  subjectChipActive: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 3,
  },
  subjectChipActiveText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  topicsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  topicChip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: 'transparent',
  },
  topicChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  topicChipActive: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1, borderColor: Colors.primaryFixed + '4D',
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  topicChipActiveText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  segWrap: {
    flexDirection: 'row', backgroundColor: Colors.surfaceLow, padding: 6, borderRadius: 16, gap: 4,
  },
  segItem: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  segItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  segText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  segTextActive: { color: Colors.textPrimary, fontWeight: '800' },

  countBadge: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 999 },
  countBadgeText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  sliderTrackWrap: { height: 40, justifyContent: 'center', paddingHorizontal: 0 },
  sliderTrack: { height: 8, backgroundColor: Colors.surfaceHigh, borderRadius: 999, overflow: 'hidden' },
  sliderFill: { height: '100%', borderRadius: 999 },
  sliderThumb: {
    position: 'absolute', top: 7, width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#fff', borderWidth: 3, borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLabelText: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.5 },

  tipCard: {
    marginTop: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: Colors.primaryFixed + '33',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  tipTitle: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  tipText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  tipStrong: { fontWeight: '800', color: Colors.textPrimary },

  ctaWrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 28,
    backgroundColor: Colors.background,
  },
  ctaTouchable: { borderRadius: 999 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 18, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
