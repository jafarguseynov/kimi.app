import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { useExamConfig } from '../../hooks/useExamConfig';
import { generateExam } from '../../api/exam.api';
import { getTopicStats } from '../../api/topicStats.api';
import { useQuery } from '@tanstack/react-query';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Count = 5 | 10 | 20;
type Difficulty = 'easy' | 'medium' | 'hard';
const DIFF_TKEY: Record<Difficulty, string> = {
  easy: 'aiPractice.diffEasy',
  medium: 'aiPractice.diffMedium',
  hard: 'aiPractice.diffHard',
};

const FALLBACK_SUBJECTS = ['Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Fizika', 'Kimya', 'Biologiya', 'Tarix', 'Coğrafiya'];

export default function AIPracticeBuilderScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const config = useExamConfig();

  // Fənn siyahısı: admin konfiqi → yoxdursa fallback
  const subjects = useMemo(() => {
    const fromCfg = config?.global?.subjects?.map((s) => s.label).filter(Boolean);
    return fromCfg && fromCfg.length ? fromCfg : FALLBACK_SUBJECTS;
  }, [config]);

  // İstifadəçinin zəif mövzuları (tövsiyə üçün)
  const { data: stats } = useQuery({
    queryKey: ['topicStats'],
    queryFn: () => getTopicStats(),
  });
  const weakSubject: string | undefined = stats?.weak?.[0];

  const [topic, setTopic] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [count, setCount] = useState<Count>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const selectedTopic = topic ?? weakSubject ?? subjects[0];

  const gen = useMutation({
    mutationFn: () =>
      generateExam({
        subject: selectedTopic,
        difficulty,
        questionCount: count,
        type: 'practice',
      }),
    onSuccess: (exam) => {
      navigation.getParent()?.navigate('Exams', {
        screen: Routes.ExamInfo,
        params: {
          examId: exam.id,
          title: exam.title,
          questionCount: exam.questionCount,
          duration: exam.duration,
          difficulty: exam.difficulty as any,
          subject: exam.subject,
        },
      });
    },
    onError: () => {
      Alert.alert(t('aiPractice.headerTitle'), t('aiPractice.genError'));
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aiPractice.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Topic selector */}
        <View style={{ gap: 8 }}>
          <Text style={styles.label}>{t('aiPractice.topicLabel')}</Text>
          <TouchableOpacity style={styles.selector} activeOpacity={0.85} onPress={() => setPickerOpen(true)}>
            <Text style={styles.selectorText}>{selectedTopic}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* AI recommendation (real weak subject) */}
        {weakSubject && (
          <View style={styles.recCard}>
            <View style={styles.recBlob} pointerEvents="none" />
            <View style={styles.recIcon}>
              <Ionicons name="bulb" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recTitle}>{t('aiPractice.recTitle')}</Text>
              <Text style={styles.recSub}>{t('aiPractice.recSub')}</Text>
              <TouchableOpacity onPress={() => setTopic(weakSubject)} activeOpacity={0.8}>
                <Text style={styles.recValue}>{weakSubject} →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Question count */}
        <View style={{ gap: 12 }}>
          <Text style={styles.label}>{t('aiPractice.countLabel')}</Text>
          <View style={styles.segmented}>
            {([5, 10, 20] as Count[]).map((n) => {
              const active = count === n;
              return (
                <TouchableOpacity key={n} activeOpacity={0.85} onPress={() => setCount(n)} style={[styles.segItem, active && styles.segItemActive]}>
                  <Text style={[styles.segText, active && styles.segTextActive]}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Difficulty */}
        <View style={{ gap: 12 }}>
          <Text style={styles.label}>{t('aiPractice.diffLabel')}</Text>
          <View style={styles.segmented}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
              const active = difficulty === d;
              return (
                <TouchableOpacity key={d} activeOpacity={0.85} onPress={() => setDifficulty(d)} style={[styles.segItem, active && styles.segItemActive]}>
                  <Text style={[styles.segText, active && styles.segTextActive]}>{t(DIFF_TKEY[d])}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CTA — REAL generate */}
        <TouchableOpacity activeOpacity={0.85} style={{ marginTop: 8 }} onPress={() => gen.mutate()} disabled={gen.isPending}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBtn}>
            {gen.isPending ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.ctaText}>{t('aiPractice.generating')}</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.ctaText}>{t('aiPractice.ctaCreate')}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.hint}>{t('aiPractice.hint')}</Text>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Subject picker modal */}
      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('aiPractice.topicLabel')}</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {subjects.map((s) => {
                const active = s === selectedTopic;
                return (
                  <TouchableOpacity key={s} style={styles.modalItem} onPress={() => { setTopic(s); setPickerOpen(false); }} activeOpacity={0.8}>
                    <Text style={[styles.modalItemText, active && { color: Colors.primary, fontWeight: '700' }]}>{s}</Text>
                    {active && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 24, gap: 24, paddingBottom: 48 },

  label: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  selector: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest,
    paddingVertical: 16, paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  selectorText: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary },

  recCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
    position: 'relative', overflow: 'hidden',
  },
  recBlob: { position: 'absolute', top: -16, right: -16, width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.primary + '14' },
  recIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  recTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  recSub: { fontSize: 13, color: Colors.textSecondary },
  recValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },

  segmented: {
    flexDirection: 'row', gap: 8,
    backgroundColor: Colors.surfaceLow,
    padding: 6, borderRadius: 16,
  },
  segItem: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  segItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  segText: { fontSize: 15, fontWeight: '500', color: Colors.textSecondary },
  segTextActive: { fontWeight: '600', color: Colors.textPrimary },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 4,
  },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  hint: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.borderLight, marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  modalItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  modalItemText: { fontSize: 16, color: Colors.textPrimary },
});
