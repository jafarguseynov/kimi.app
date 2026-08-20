import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { useCalcRecordsStore } from '../../store/calcRecords.store';
import SaveResultButton from '../../components/calculators/SaveResultButton';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Result = { muveffaqiyyat: number; keyfiyyat: number };

export default function QualityCalculatorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const [total, setTotal] = useState('');
  const [grade2, setGrade2] = useState('');
  const [grade3, setGrade3] = useState('');
  const [grade4, setGrade4] = useState('');
  const [grade5, setGrade5] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const addRecord = useCalcRecordsStore((s) => s.addRecord);

  const calculate = () => {
    const g2 = Number(grade2) || 0;
    const g3 = Number(grade3) || 0;
    const g4 = Number(grade4) || 0;
    const g5 = Number(grade5) || 0;
    const count = Number(total) || g2 + g3 + g4 + g5;
    if (count === 0) return;
    const muveffaqiyyat = Math.round(((g3 + g4 + g5) / count) * 1000) / 10;
    const keyfiyyat = Math.round(((g4 + g5) / count) * 1000) / 10;
    setResult({ muveffaqiyyat, keyfiyyat });
    setRecordId(
      addRecord({
        calcId: 'quality',
        value: `${keyfiyyat}%`,
        note: `${t('calc.successPct')}: ${muveffaqiyyat}%`,
      }),
    );
  };

  const reset = () => {
    setTotal(''); setGrade2(''); setGrade3(''); setGrade4(''); setGrade5('');
    setResult(null);
    setRecordId(null);
  };

  const GRADE_ROWS: { label: string; value: string; set: (v: string) => void; dot: string }[][] = [
    [
      { label: t('calc.grade2'), value: grade2, set: setGrade2, dot: Colors.danger },
      { label: t('calc.grade3'), value: grade3, set: setGrade3, dot: Colors.secondary },
    ],
    [
      { label: t('calc.grade4'), value: grade4, set: setGrade4, dot: Colors.primaryFixed },
      { label: t('calc.grade5'), value: grade5, set: setGrade5, dot: Colors.tertiary },
    ],
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('calc.qualityHeader')}</Text>
          <View style={styles.headerBtn}>
            <Ionicons name="school-outline" size={22} color={Colors.primary} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hero */}
          <LinearGradient colors={GRADIENT} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.heroBlob} />
            <Text style={styles.heroTitle}>{t('calc.qualHero')}</Text>
            <Text style={styles.heroSub}>{t('calc.qualHeroSub')}</Text>
          </LinearGradient>

          {/* Inputs */}
          <View style={styles.inputSection}>
            {/* Total */}
            <View>
              <Text style={styles.inputLabel}>{t('calc.totalStudents')}</Text>
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.inputField}
                  value={total}
                  onChangeText={setTotal}
                  placeholder="0"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            {/* Grade rows */}
            {GRADE_ROWS.map((row, ri) => (
              <View key={ri} style={styles.gradeRow}>
                {row.map((g) => (
                  <View key={g.label} style={styles.gradeCardWrap}>
                    <Text style={styles.inputLabel}>{g.label}</Text>
                    <View style={styles.gradeCard}>
                      <View style={[styles.dot, { backgroundColor: g.dot }]} />
                      <TextInput
                        style={styles.gradeField}
                        value={g.value}
                        onChangeText={g.set}
                        placeholder="0"
                        placeholderTextColor={Colors.outlineVariant}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Buttons */}
          <TouchableOpacity onPress={calculate} activeOpacity={0.9}>
            <LinearGradient colors={GRADIENT} style={styles.calcBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="calculator-outline" size={22} color="#fff" />
              <Text style={styles.calcBtnText}>{t('calc.calculate')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={20} color={Colors.outline} />
            <Text style={styles.resetBtnText}>{t('calc.reset')}</Text>
          </TouchableOpacity>

          {/* Results */}
          <Text style={styles.sectionTitle}>{t('calc.results')}</Text>
          <View style={styles.resultRow}>
            {/* Müvəffəqiyyət */}
            <View style={[styles.resultCard, styles.resultCardBorderPrimary]}>
              <View style={styles.resultCardTop}>
                <View style={styles.resultIconBox}>
                  <Ionicons name="trending-up" size={20} color={Colors.primary} />
                </View>
                <Text style={[styles.resultPct, { color: Colors.primary }]}>
                  {result ? `${result.muveffaqiyyat}%` : '—'}
                </Text>
              </View>
              <Text style={styles.resultLabel}>{t('calc.successPct')}</Text>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={GRADIENT}
                  style={[styles.progressFill, { width: result ? `${Math.min(result.muveffaqiyyat, 100)}%` as any : '0%' }]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                />
              </View>
            </View>

            {/* Keyfiyyət */}
            <View style={[styles.resultCard, styles.resultCardBorderTertiary]}>
              <View style={styles.resultCardTop}>
                <View style={[styles.resultIconBox, { backgroundColor: Colors.onTertiary }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={Colors.tertiary} />
                </View>
                <Text style={[styles.resultPct, { color: Colors.tertiary }]}>
                  {result ? `${result.keyfiyyat}%` : '—'}
                </Text>
              </View>
              <Text style={styles.resultLabel}>{t('calc.qualityPct')}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFillSolid, { width: result ? `${Math.min(result.keyfiyyat, 100)}%` as any : '0%' }]}
                />
              </View>
            </View>
          </View>

          {result && <SaveResultButton recordId={recordId} />}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 20, gap: 16, paddingBottom: 48 },

  hero: {
    borderRadius: 20, padding: 28, overflow: 'hidden', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 4,
  },
  heroBlob: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 28 },
  heroSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },

  inputSection: { gap: 12 },
  inputLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, paddingLeft: 4 },
  inputCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  inputField: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, padding: 0 },

  gradeRow: { flexDirection: 'row', gap: 12 },
  gradeCardWrap: { flex: 1 },
  gradeCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  gradeField: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, padding: 0, flex: 1 },

  calcBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 999, height: 58,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  calcBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surfaceHigh, borderRadius: 999, height: 52,
  },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  resultRow: { flexDirection: 'row', gap: 12 },
  resultCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 12,
    borderBottomWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 1,
  },
  resultCardBorderPrimary: { borderBottomColor: Colors.primary + '33' },
  resultCardBorderTertiary: { borderBottomColor: Colors.tertiary + '33' },
  resultCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resultIconBox: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  resultPct: { fontSize: 26, fontWeight: '800' },
  resultLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  progressTrack: { height: 10, backgroundColor: Colors.surfaceContainer, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressFillSolid: { height: '100%', borderRadius: 999, backgroundColor: Colors.tertiary },
});
