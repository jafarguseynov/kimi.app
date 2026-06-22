import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamFilterSheet>;
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const SUBJECTS = ['Riyaziyyat', 'İngilis dili', 'Fizika', 'Azərbaycan dili', 'Kimya'] as const;
const SUBJECT_TKEY: Record<string, string> = {
  'Riyaziyyat': 'examFilter.subjMath', 'İngilis dili': 'examFilter.subjEn', 'Fizika': 'examFilter.subjPhysics',
  'Azərbaycan dili': 'examFilter.subjAz', 'Kimya': 'examFilter.subjChem',
};

type Difficulty = 'easy' | 'medium' | 'hard';
const DIFFICULTIES: { id: Difficulty; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'easy',   labelKey: 'examList.diff.easy',   icon: 'happy-outline' },
  { id: 'medium', labelKey: 'examList.diff.medium', icon: 'remove-circle-outline' },
  { id: 'hard',   labelKey: 'examList.diff.hard',   icon: 'sad-outline' },
];

type ExamKind = 'practice' | 'live' | 'monthly';
const KINDS: { id: ExamKind; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'practice', labelKey: 'examFilterSheet.kindPractice', icon: 'create-outline' },
  { id: 'live',     labelKey: 'examFilterSheet.kindLive',     icon: 'radio-outline' },
  { id: 'monthly',  labelKey: 'examFilterSheet.kindMonthly',  icon: 'calendar-outline' },
];

export default function ExamFilterSheetScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Set<string>>(new Set(['Riyaziyyat']));
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [kind, setKind] = useState<ExamKind>('live');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const toggleSubject = (s: string) => {
    const next = new Set(subjects);
    next.has(s) ? next.delete(s) : next.add(s);
    setSubjects(next);
  };

  const reset = () => {
    setSubjects(new Set());
    setDifficulty('medium');
    setKind('practice');
    setStart(''); setEnd('');
  };

  return (
    <View style={styles.backdrop}>
      <TouchableOpacity style={styles.dismiss} activeOpacity={1} onPress={() => navigation.goBack()} />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('examFilterSheet.title')}</Text>
          <TouchableOpacity hitSlop={8} onPress={reset}>
            <Text style={styles.resetText}>{t('examFilterSheet.reset')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Subject */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{t('examFilterSheet.subject')}</Text>
              <View style={styles.multiPill}>
                <Text style={styles.multiPillText}>{t('examFilterSheet.multiSelect')}</Text>
              </View>
            </View>
            <View style={styles.chipsRow}>
              {SUBJECTS.map((s) => {
                const active = subjects.has(s);
                return (
                  <TouchableOpacity
                    key={s}
                    activeOpacity={0.85}
                    onPress={() => toggleSubject(s)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t(SUBJECT_TKEY[s])}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Difficulty */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('examFilterSheet.difficulty')}</Text>
            <View style={styles.diffGrid}>
              {DIFFICULTIES.map((d) => {
                const active = difficulty === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    activeOpacity={0.85}
                    onPress={() => setDifficulty(d.id)}
                    style={[styles.diffItem, active && styles.diffItemActive]}
                  >
                    <Ionicons name={d.icon} size={22} color={active ? Colors.primary : Colors.textSecondary} />
                    <Text style={[styles.diffText, active && styles.diffTextActive]}>{t(d.labelKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('examFilterSheet.date')}</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateInputWrap}>
                <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} style={styles.dateIcon} />
                <TextInput
                  placeholder={t('examFilterSheet.startPlaceholder')} placeholderTextColor={Colors.textMuted + 'AA'}
                  value={start} onChangeText={setStart}
                  style={styles.dateInput}
                />
              </View>
              <View style={styles.dateSep} />
              <View style={styles.dateInputWrap}>
                <Ionicons name="calendar-clear-outline" size={18} color={Colors.textSecondary} style={styles.dateIcon} />
                <TextInput
                  placeholder={t('examFilterSheet.endPlaceholder')} placeholderTextColor={Colors.textMuted + 'AA'}
                  value={end} onChangeText={setEnd}
                  style={styles.dateInput}
                />
              </View>
            </View>
          </View>

          {/* Exam kind */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('examFilterSheet.examType')}</Text>
            <View style={styles.chipsRow}>
              {KINDS.map((k) => {
                const active = kind === k.id;
                if (active) {
                  return (
                    <TouchableOpacity key={k.id} activeOpacity={0.85} onPress={() => setKind(k.id)}>
                      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.kindChipActive}>
                        <Ionicons name={k.icon} size={18} color="#fff" />
                        <Text style={styles.kindChipActiveText}>{t(k.labelKey)}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={k.id} activeOpacity={0.85} onPress={() => setKind(k.id)}
                    style={styles.kindChip}
                  >
                    <Ionicons name={k.icon} size={18} color={Colors.textSecondary} />
                    <Text style={styles.kindChipText}>{t(k.labelKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.goBack()}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>{t('examFilterSheet.apply')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.footerHint}>{t('examFilterSheet.footerHint')}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11,15,16,0.4)' },
  dismiss: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: Colors.surfaceLowest,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  handle: { width: 48, height: 5, borderRadius: 999, backgroundColor: Colors.surfaceHigh, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  resetText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  scroll: { paddingHorizontal: 24, paddingVertical: 32, gap: 40 },

  section: { gap: 16 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  multiPill: { backgroundColor: Colors.primary + '1A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  multiPillText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.2 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: Colors.surfaceLow },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  chipActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 3,
  },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  diffGrid: { flexDirection: 'row', gap: 12 },
  diffItem: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', gap: 8,
  },
  diffItemActive: {
    backgroundColor: Colors.primary + '0D',
    borderWidth: 2, borderColor: Colors.primary,
  },
  diffText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  diffTextActive: { fontWeight: '700', color: Colors.primary },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateInputWrap: { flex: 1, position: 'relative' },
  dateIcon: { position: 'absolute', left: 16, top: 14, zIndex: 1 },
  dateInput: {
    paddingLeft: 44, paddingRight: 16, paddingVertical: 14,
    fontSize: 13, color: Colors.textPrimary,
    backgroundColor: Colors.surfaceLow, borderRadius: 12,
  },
  dateSep: { width: 16, height: 2, borderRadius: 1, backgroundColor: Colors.surfaceHigh },

  kindChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceLow,
    borderWidth: 1, borderColor: 'transparent',
  },
  kindChipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  kindChipActive: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 3,
  },
  kindChipActiveText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  footer: {
    paddingHorizontal: 24, paddingVertical: 16, gap: 12,
    backgroundColor: Colors.surfaceLowest,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 4,
  },
  applyBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  footerHint: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', letterSpacing: 1.4 },
});
