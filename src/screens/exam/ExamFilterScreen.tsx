import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, GestureResponderEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamFilter> };

const TYPE_TABS = ['Hamısı', 'Sınaq', 'Aylıq', 'Milli'] as const;
const TYPE_TKEY: Record<string, string> = {
  'Hamısı': 'examFilter.tabAll', 'Sınaq': 'examFilter.tabMock', 'Aylıq': 'examFilter.tabMonthly', 'Milli': 'examFilter.tabNational',
};
const SUBJECTS = ['Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Fizika', 'Kimya', 'Tarix'];
const SUBJECT_TKEY: Record<string, string> = {
  'Riyaziyyat': 'examFilter.subjMath', 'Azərbaycan dili': 'examFilter.subjAz', 'İngilis dili': 'examFilter.subjEn',
  'Fizika': 'examFilter.subjPhysics', 'Kimya': 'examFilter.subjChem', 'Tarix': 'examFilter.subjHistory',
};
const MAX_SCORE = 700;

export default function ExamFilterScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [examType, setExamType] = useState<(typeof TYPE_TABS)[number]>('Hamısı');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Riyaziyyat', 'İngilis dili']);
  const [dateFrom, setDateFrom] = useState('01.10.2023');
  const [dateTo, setDateTo] = useState('31.10.2023');
  const [scoreMax, setScoreMax] = useState(MAX_SCORE);
  const sliderWidth = useRef(0);

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const clearAll = () => {
    setExamType('Hamısı');
    setSelectedSubjects([]);
    setDateFrom('');
    setDateTo('');
    setScoreMax(MAX_SCORE);
  };

  const onTrackTouch = (e: GestureResponderEvent) => {
    const w = sliderWidth.current;
    if (!w) return;
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / w));
    setScoreMax(Math.round(ratio * MAX_SCORE));
  };

  const fillRatio = scoreMax / MAX_SCORE;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('examFilter.title')}</Text>
        </View>
        <TouchableOpacity onPress={clearAll} activeOpacity={0.7} style={styles.clearBtn}>
          <Text style={styles.clearText}>{t('examFilter.clear')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* İmtahan növü */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('examFilter.examType')}</Text>
          <View style={styles.segment}>
            {TYPE_TABS.map((tab) => {
              const active = examType === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  onPress={() => setExamType(tab)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{t(TYPE_TKEY[tab])}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Fənn */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('examFilter.pickSubject')}</Text>
          <View style={styles.chipsWrap}>
            {SUBJECTS.map((s) => {
              const active = selectedSubjects.includes(s);
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => toggleSubject(s)}
                  activeOpacity={0.85}
                  style={[styles.subjectChip, active && styles.subjectChipActive]}
                >
                  <Text style={[styles.subjectChipText, active && styles.subjectChipTextActive]}>{t(SUBJECT_TKEY[s])}</Text>
                  {active ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tarix aralığı */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('examFilter.dateRange')}</Text>
          <View style={styles.dateGrid}>
            <View style={styles.dateCard}>
              <Text style={styles.dateLabel}>{t('examFilter.start')}</Text>
              <Text style={styles.dateValue}>{dateFrom || '— —'}</Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateLabel}>{t('examFilter.end')}</Text>
              <Text style={styles.dateValue}>{dateTo || '— —'}</Text>
            </View>
          </View>
        </View>

        {/* Bal aralığı */}
        <View style={styles.section}>
          <View style={styles.scoreHead}>
            <Text style={styles.sectionLabel}>{t('examFilter.scoreRange')}</Text>
            <View style={styles.scoreValueRow}>
              <Text style={styles.scoreValueNum}>0 - {scoreMax}</Text>
              <Text style={styles.scoreValueUnit}>{t('examFilter.balUnit')}</Text>
            </View>
          </View>

          <View style={styles.sliderWrap}>
            {/* Floating mascot above thumb */}
            <View
              style={[
                styles.mascotFloat,
                { left: `${fillRatio * 100}%`, transform: [{ translateX: -36 }] },
              ]}
              pointerEvents="none"
            >
              <View style={styles.mascotTag}>
                <Text style={styles.mascotTagText}>{t('examFilter.robotTag')}</Text>
              </View>
              <LinearGradient
                colors={GRADIENT}
                style={styles.mascotAvatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="hardware-chip-outline" size={24} color="rgba(255,255,255,0.9)" />
              </LinearGradient>
            </View>

            <Pressable
              onLayout={(e) => { sliderWidth.current = e.nativeEvent.layout.width; }}
              onPress={onTrackTouch}
              onTouchMove={onTrackTouch}
              style={styles.sliderTrackHit}
            >
              <View style={styles.sliderTrackBg}>
                <View style={[styles.sliderTrackFill, { width: `${fillRatio * 100}%` }]} />
              </View>
              <View style={[styles.sliderThumb, { left: `${fillRatio * 100}%` }]} />
            </Pressable>

            <View style={styles.sliderLabelsRow}>
              <Text style={styles.sliderLabel}>{t('examFilter.min')}</Text>
              <Text style={styles.sliderLabel}>{t('examFilter.max')}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.9}>
          <LinearGradient
            colors={GRADIENT}
            style={styles.applyBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.applyBtnText}>{t('examFilter.showResults')}</Text>
            <Ionicons name="trending-up" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  clearText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 24, gap: 32, paddingBottom: 32 },

  section: { gap: 14 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.4, marginLeft: 4 },

  /* Segment */
  segment: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceContainer,
    padding: 4, borderRadius: 999,
  },
  segmentBtn: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  segmentBtnActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  segmentText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.primary, fontWeight: '700' },

  /* Subject chips */
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  subjectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.outlineVariant + '4D',
  },
  subjectChipActive: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2,
  },
  subjectChipText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  subjectChipTextActive: { color: '#fff', fontWeight: '700' },

  /* Date grid */
  dateGrid: { flexDirection: 'row', gap: 12 },
  dateCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest,
    borderRadius: 18, padding: 14, gap: 2,
    borderWidth: 1, borderColor: Colors.outlineVariant + '33',
  },
  dateLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.2, textTransform: 'uppercase' },
  dateValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  /* Score / slider */
  scoreHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  scoreValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  scoreValueNum: { fontSize: 22, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  scoreValueUnit: { fontSize: 11, fontWeight: '800', color: Colors.primary, marginBottom: 3 },

  sliderWrap: {
    paddingTop: 70, paddingBottom: 6, paddingHorizontal: 4,
    position: 'relative',
  },
  mascotFloat: {
    position: 'absolute', top: 0,
    alignItems: 'center', width: 72,
  },
  mascotTag: {
    backgroundColor: Colors.primaryDim,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999, marginBottom: 4,
  },
  mascotTagText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: -0.2, textTransform: 'uppercase' },
  mascotAvatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },

  sliderTrackHit: { height: 24, justifyContent: 'center' },
  sliderTrackBg: {
    height: 6, borderRadius: 999, backgroundColor: Colors.surfaceHigh, overflow: 'hidden',
  },
  sliderTrackFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },
  sliderThumb: {
    position: 'absolute',
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary,
    borderWidth: 4, borderColor: '#fff',
    marginLeft: -12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  sliderLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLabel: { fontSize: 10, fontWeight: '800', color: Colors.outline, letterSpacing: 1.5 },

  /* Footer */
  footer: {
    paddingHorizontal: 24, paddingTop: 14, paddingBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  applyBtn: {
    height: 58, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 4,
  },
  applyBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
});
