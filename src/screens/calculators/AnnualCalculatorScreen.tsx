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

type TFn = (key: string, vars?: Record<string, string | number>) => string;

function getGrade(score: number, t: TFn): string {
  if (score >= 91) return t('calc.gradeExcellentFull');
  if (score >= 71) return t('calc.gradeGoodFull');
  if (score >= 51) return t('calc.gradeFairFull');
  return t('calc.gradePoorFull');
}

function getLetter(score: number): string {
  if (score >= 91) return 'A';
  if (score >= 71) return 'B';
  if (score >= 51) return 'C';
  return 'D';
}

type Result = { final: number; grade: string; letter: string; passed: boolean };

export default function AnnualCalculatorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const [sem1, setSem1] = useState('');
  const [sem2, setSem2] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const addRecord = useCalcRecordsStore((s) => s.addRecord);

  const calculate = () => {
    if (!sem1.trim() || !sem2.trim()) return;
    const final = (Number(sem1) + Number(sem2)) / 2;
    setResult({ final, grade: getGrade(final, t), letter: getLetter(final), passed: final >= 51 });
    setRecordId(
      addRecord({
        calcId: 'annual',
        value: final.toFixed(1),
        unitKey: 'calc.balUnit',
        note: getGrade(final, t),
      }),
    );
  };

  const reset = () => {
    setSem1('');
    setSem2('');
    setResult(null);
    setRecordId(null);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('calc.annualHeader')}</Text>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="help-circle-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{t('calc.annHero')}</Text>
            <Text style={styles.heroSub}>{t('calc.annHeroSub')}</Text>
          </View>

          {/* Input Cards */}
          <View style={styles.inputRow}>
            <View style={styles.inputCard}>
              <View style={styles.inputIconRow}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="filter-outline" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.inputCardLabel}>{t('calc.sem1')}</Text>
              </View>
              <TextInput
                style={styles.inputField}
                value={sem1}
                onChangeText={setSem1}
                placeholder="Məs: 85"
                placeholderTextColor={Colors.outlineVariant}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.inputCard}>
              <View style={styles.inputIconRow}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="filter-outline" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.inputCardLabel}>{t('calc.sem2')}</Text>
              </View>
              <TextInput
                style={styles.inputField}
                value={sem2}
                onChangeText={setSem2}
                placeholder="Məs: 92"
                placeholderTextColor={Colors.outlineVariant}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity onPress={calculate} activeOpacity={0.9}>
            <LinearGradient colors={GRADIENT} style={styles.calcBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.calcBtnText}>{t('calc.calculate')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.8}>
            <Text style={styles.resetBtnText}>{t('calc.reset')}</Text>
          </TouchableOpacity>

          {/* Result */}
          <View style={styles.resultCard}>
            <View style={styles.resultTop}>
              <View>
                <Text style={styles.resultTopLabel}>{t('calc.finalAnnual')}</Text>
                <Text style={styles.resultTopScore}>{result ? result.final.toFixed(1) : '—'}</Text>
              </View>
              <LinearGradient colors={GRADIENT} style={styles.letterCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.letterText}>{result ? result.letter : '—'}</Text>
              </LinearGradient>
            </View>

            <View style={styles.resultGrid}>
              <View style={styles.resultCell}>
                <Text style={styles.resultCellLabel}>{t('calc.finalGrade')}</Text>
                <Text style={styles.resultCellValue}>{result ? result.grade : '—'}</Text>
              </View>
              <View style={styles.resultCell}>
                <Text style={styles.resultCellLabel}>{t('calc.status')}</Text>
                {result ? (
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: result.passed ? Colors.tertiary : Colors.danger }]} />
                    <Text style={[styles.resultCellValue, { color: result.passed ? Colors.tertiary : Colors.danger }]}>
                      {result.passed ? t('calc.passed') : t('calc.failed')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.resultCellValue}>—</Text>
                )}
              </View>
            </View>

            {result && (
              <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>
                  {result.passed
                    ? t('calc.passedMsg')
                    : t('calc.failedMsg')}
                </Text>
              </View>
            )}
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  scroll: { padding: 20, gap: 20, paddingBottom: 48 },

  hero: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 28, gap: 8,
    alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 1,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', lineHeight: 30 },
  heroSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  inputRow: { flexDirection: 'row', gap: 12 },
  inputCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  inputIconRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  inputCardLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  inputField: {
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 14,
    fontSize: 18, fontWeight: '700', color: Colors.textPrimary,
  },

  calcBtn: {
    borderRadius: 999, height: 58,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  calcBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  resetBtn: {
    backgroundColor: Colors.surfaceHigh, borderRadius: 999, height: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 2,
    gap: 20,
  },
  resultTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 20,
  },
  resultTopLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', marginBottom: 4 },
  resultTopScore: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  letterCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3,
  },
  letterText: { fontSize: 26, fontWeight: '800', color: '#fff' },

  resultGrid: { flexDirection: 'row', gap: 12 },
  resultCell: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 6,
  },
  resultCellLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  resultCellValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  infoBanner: {
    backgroundColor: Colors.primaryLight, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
