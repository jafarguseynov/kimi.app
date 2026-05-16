import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamFilter> };

const SUBJECTS = ['Riyaziyyat', 'İngilis dili', 'Fizika', 'Azərbaycan dili', 'Kimya'];

const DIFFICULTIES = [
  { label: 'Asan', icon: 'happy-outline' as const },
  { label: 'Orta', icon: 'remove-circle-outline' as const },
  { label: 'Çətin', icon: 'sad-outline' as const },
];

const EXAM_TYPES = [
  { label: 'Practice', icon: 'create-outline' as const },
  { label: 'Canlı', icon: 'radio-outline' as const },
  { label: 'Aylıq sınaq', icon: 'calendar-outline' as const },
];

export default function ExamFilterScreen({ navigation }: Props) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Riyaziyyat']);
  const [difficulty, setDifficulty] = useState('Orta');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [examType, setExamType] = useState('Canlı');

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const clearAll = () => {
    setSelectedSubjects([]);
    setDifficulty('');
    setDateFrom('');
    setDateTo('');
    setExamType('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Drag handle */}
      <View style={styles.dragHandle} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtrlər</Text>
        <TouchableOpacity onPress={clearAll} activeOpacity={0.7}>
          <Text style={styles.resetText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Fənn */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Fənn</Text>
            <View style={styles.multiSelectBadge}>
              <Text style={styles.multiSelectText}>Çoxlu seçim</Text>
            </View>
          </View>
          <View style={styles.chipsWrap}>
            {SUBJECTS.map((s) => {
              const active = selectedSubjects.includes(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.subjectChip, active && styles.subjectChipActive]}
                  onPress={() => toggleSubject(s)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.subjectChipText, active && styles.subjectChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Çətinlik */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Çətinlik</Text>
          <View style={styles.diffGrid}>
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.label;
              return (
                <TouchableOpacity
                  key={d.label}
                  style={[styles.diffCard, active && styles.diffCardActive]}
                  onPress={() => setDifficulty(d.label)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={d.icon} size={22} color={active ? Colors.primary : Colors.textMuted} />
                  <Text style={[styles.diffLabel, active && styles.diffLabelActive]}>{d.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tarix */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tarix</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateInputWrap}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} style={styles.dateIcon} />
              <TextInput
                style={styles.dateInput}
                placeholder="Başlanğıc"
                placeholderTextColor={Colors.textMuted}
                value={dateFrom}
                onChangeText={setDateFrom}
              />
            </View>
            <View style={styles.dateSeparator} />
            <View style={styles.dateInputWrap}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} style={styles.dateIcon} />
              <TextInput
                style={styles.dateInput}
                placeholder="Son tarix"
                placeholderTextColor={Colors.textMuted}
                value={dateTo}
                onChangeText={setDateTo}
              />
            </View>
          </View>
        </View>

        {/* İmtahan növü */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>İmtahan növü</Text>
          <View style={styles.typeRow}>
            {EXAM_TYPES.map((t) => {
              const active = examType === t.label;
              return (
                <TouchableOpacity
                  key={t.label}
                  onPress={() => setExamType(t.label)}
                  activeOpacity={0.85}
                  style={{ borderRadius: 999 }}
                >
                  {active ? (
                    <LinearGradient
                      colors={GRADIENT}
                      style={styles.typeChipActive}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name={t.icon} size={18} color="#fff" />
                      <Text style={styles.typeChipActiveText}>{t.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.typeChip}>
                      <Ionicons name={t.icon} size={18} color={Colors.textSecondary} />
                      <Text style={styles.typeChipText}>{t.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Decorative mascot */}
        <View style={styles.mascotDecor} pointerEvents="none">
          <LinearGradient
            colors={GRADIENT}
            style={styles.mascotCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="hardware-chip-outline" size={40} color="rgba(255,255,255,0.85)" />
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.9}
          style={{ width: '100%' }}
        >
          <LinearGradient
            colors={GRADIENT}
            style={styles.applyBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.applyBtnText}>Tətbiq et</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.footerBrand}>Kimi.az tərəfindən tənzimlənir</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceLowest },

  dragHandle: {
    width: 48, height: 6, borderRadius: 3,
    backgroundColor: Colors.surfaceVariant,
    alignSelf: 'center', marginTop: 12, marginBottom: 4, opacity: 0.4,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 64,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainer,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  resetText: { fontSize: 14, fontWeight: '600', color: Colors.primary, paddingHorizontal: 8 },

  scroll: { padding: 24, gap: 32, paddingBottom: 16 },

  section: { gap: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  multiSelectBadge: {
    backgroundColor: Colors.primary + '1A', borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  multiSelectText: { fontSize: 9, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  subjectChip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceLow,
  },
  subjectChipActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2,
  },
  subjectChipText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  subjectChipTextActive: { color: '#fff', fontWeight: '600' },

  diffGrid: { flexDirection: 'row', gap: 12 },
  diffCard: {
    flex: 1, paddingVertical: 16, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', gap: 8,
    borderWidth: 2, borderColor: 'transparent',
  },
  diffCardActive: {
    backgroundColor: Colors.primary + '0A',
    borderColor: Colors.primary,
  },
  diffLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  diffLabelActive: { color: Colors.primary, fontWeight: '700' },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLow, borderRadius: 16,
    paddingHorizontal: 14, height: 52,
  },
  dateIcon: { marginRight: 8 },
  dateInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  dateSeparator: { width: 16, height: 2, backgroundColor: Colors.outlineVariant, borderRadius: 999 },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeChipActive: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 3,
  },
  typeChipActiveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999,
    backgroundColor: Colors.surfaceLow,
    borderWidth: 1, borderColor: 'transparent',
  },
  typeChipText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },

  mascotDecor: { alignItems: 'flex-end', marginTop: 8 },
  mascotCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 4,
  },

  footer: {
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24,
    backgroundColor: Colors.surfaceLowest,
    borderTopWidth: 1, borderTopColor: Colors.surfaceContainer,
    gap: 12, alignItems: 'center',
  },
  applyBtn: {
    width: '100%', height: 60, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 4,
  },
  applyBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  footerBrand: { fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },
});
