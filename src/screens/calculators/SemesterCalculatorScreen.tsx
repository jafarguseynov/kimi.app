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
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const KSQ_OPTIONS = [3, 4, 5, 6] as const;

function getGrade(score: number): string {
  if (score >= 91) return '5 (Əla)';
  if (score >= 71) return '4 (Yaxşı)';
  if (score >= 51) return '3 (Kafi)';
  return '2 (Qeyri-kafi)';
}

type Result = {
  ksqAvg: number;
  ksq40: number;
  bsq60: number;
  final: number;
  grade: string;
};

export default function SemesterCalculatorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [step, setStep] = useState<'setup' | 'input'>('setup');
  const [ksqCount, setKsqCount] = useState<number>(3);
  const [hasBsq, setHasBsq] = useState<boolean>(true);

  const [ksq, setKsq] = useState<string[]>(['', '', '']);
  const [bsq, setBsq] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const goToInput = () => {
    setKsq(Array(ksqCount).fill(''));
    setBsq('');
    setResult(null);
    setStep('input');
  };

  const updateKsq = (idx: number, val: string) => {
    const next = [...ksq];
    next[idx] = val;
    setKsq(next);
  };

  const calculate = () => {
    const filled = ksq.filter((v) => v.trim() !== '').map(Number);
    if (filled.length === 0) {
      Alert.alert('Məlumat çatmır', 'Ən azı bir KSQ qiyməti daxil edin');
      return;
    }
    if (filled.some((v) => isNaN(v) || v < 0 || v > 100)) {
      Alert.alert('Yanlış qiymət', 'KSQ qiymətləri 0-100 aralığında olmalıdır');
      return;
    }
    const ksqAvg = filled.reduce((a, b) => a + b, 0) / filled.length;
    if (hasBsq) {
      if (!bsq.trim()) {
        Alert.alert('Məlumat çatmır', 'BSQ qiymətini daxil edin');
        return;
      }
      const bsqNum = Number(bsq);
      if (isNaN(bsqNum) || bsqNum < 0 || bsqNum > 100) {
        Alert.alert('Yanlış qiymət', 'BSQ 0-100 aralığında olmalıdır');
        return;
      }
      const ksq40 = ksqAvg * 0.4;
      const bsq60 = bsqNum * 0.6;
      const final = Math.min(100, ksq40 + bsq60);
      setResult({ ksqAvg, ksq40, bsq60, final, grade: getGrade(final) });
    } else {
      // No BSQ: semester grade = KSQ average
      setResult({ ksqAvg, ksq40: ksqAvg, bsq60: 0, final: ksqAvg, grade: getGrade(ksqAvg) });
    }
  };

  const reset = () => {
    setKsq(Array(ksqCount).fill(''));
    setBsq('');
    setResult(null);
  };

  const onBack = () => {
    if (step === 'input') {
      setStep('setup');
      setResult(null);
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={onBack} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Semestr Balı</Text>
          <Text style={styles.brand}>Kimi.az</Text>
        </View>

        {step === 'setup' ? (
          <ScrollView contentContainerStyle={styles.scrollSetup} showsVerticalScrollIndicator={false}>
            {/* Mascot */}
            <View style={styles.mascotWrap}>
              <View style={styles.mascotAura} pointerEvents="none" />
              <View style={styles.mascotCircle}>
                <Ionicons name="school" size={42} color={Colors.primary} />
              </View>
            </View>

            {/* Hero */}
            <View style={styles.heroBlock}>
              <Text style={styles.heroTitle}>Yarımillik Qiymətləndirmə</Text>
              <Text style={styles.heroSub}>KSQ sayını seçin və BSQ-nin olub-olmadığını qeyd edin.</Text>
            </View>

            {/* KSQ count */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldLabelRow}>
                <Ionicons name="list-outline" size={18} color={Colors.primary} />
                <Text style={styles.fieldLabel}>KSQ sayı</Text>
              </View>
              <View style={styles.segmented}>
                {KSQ_OPTIONS.map((n) => {
                  const active = ksqCount === n;
                  return (
                    <TouchableOpacity
                      key={n}
                      style={[styles.segItem, active && styles.segItemActive]}
                      onPress={() => setKsqCount(n)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.segText, active && styles.segTextActive]}>{n}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* BSQ toggle */}
            <View style={styles.toggleCard}>
              <View style={styles.toggleLeft}>
                <View style={styles.toggleIcon}>
                  <Ionicons name="checkmark-done" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>BSQ var</Text>
                  <Text style={styles.toggleSub}>Böyük Summativ Qiymətləndirmə</Text>
                </View>
              </View>
              <Switch
                value={hasBsq}
                onValueChange={setHasBsq}
                trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
                thumbColor="#fff"
                ios_backgroundColor={Colors.surfaceHigh}
              />
            </View>

            {/* Tip banner */}
            <View style={styles.tipBanner}>
              <Ionicons name="sparkles" size={18} color={Colors.primary} />
              <Text style={styles.tipText}>Kimi Robot ilə balını saniyələr ərzində hesabla!</Text>
            </View>

            {/* CTA */}
            <TouchableOpacity activeOpacity={0.9} onPress={goToInput} style={{ marginTop: 8 }}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
                <Text style={styles.ctaText}>Davam et</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInput}>
            {/* Setup summary */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryChip}>
                <Ionicons name="list-outline" size={14} color={Colors.primary} />
                <Text style={styles.summaryChipText}>{ksqCount} KSQ</Text>
              </View>
              <View style={[styles.summaryChip, !hasBsq && styles.summaryChipMuted]}>
                <Ionicons name={hasBsq ? 'checkmark-circle' : 'close-circle'} size={14} color={hasBsq ? Colors.tertiary : Colors.outline} />
                <Text style={[styles.summaryChipText, !hasBsq && { color: Colors.textSecondary }]}>
                  {hasBsq ? 'BSQ var' : 'BSQ yox'}
                </Text>
              </View>
              <TouchableOpacity style={styles.summaryEdit} onPress={() => setStep('setup')} hitSlop={8}>
                <Ionicons name="create-outline" size={14} color={Colors.primary} />
                <Text style={styles.summaryEditText}>Dəyiş</Text>
              </TouchableOpacity>
            </View>

            {/* KSQ inputs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>KSQ Qiymətləri</Text>
              <View style={styles.inputGrid}>
                {ksq.map((val, idx) => (
                  <View key={idx} style={styles.inputCard}>
                    <Text style={styles.inputLabel}>KSQ {idx + 1}</Text>
                    <TextInput
                      style={styles.inputField}
                      value={val}
                      onChangeText={(v) => updateKsq(idx, v)}
                      placeholder="0 - 100"
                      placeholderTextColor={Colors.outlineVariant}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* BSQ input */}
            {hasBsq && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>BSQ Qiyməti</Text>
                <View style={styles.bsqCard}>
                  <View style={styles.bsqIconBox}>
                    <Ionicons name="ribbon-outline" size={22} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Yekun BSQ balı</Text>
                    <TextInput
                      style={styles.inputField}
                      value={bsq}
                      onChangeText={setBsq}
                      placeholder="Balı daxil edin"
                      placeholderTextColor={Colors.outlineVariant}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Calculate / reset */}
            <TouchableOpacity onPress={calculate} activeOpacity={0.9}>
              <LinearGradient colors={GRADIENT} style={styles.calcBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="calculator-outline" size={22} color="#fff" />
                <Text style={styles.calcBtnText}>Hesabla</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={20} color={Colors.danger} />
              <Text style={styles.resetBtnText}>Sıfırla</Text>
            </TouchableOpacity>

            {/* Result */}
            {result && (
              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>Nəticə</Text>
                <View style={styles.resultCard}>
                  <View style={styles.resultRowWide}>
                    <View>
                      <Text style={styles.resultLabel}>KSQ ortalaması</Text>
                      <Text style={styles.resultValue}>{result.ksqAvg.toFixed(1)}</Text>
                    </View>
                    <View style={styles.resultIconBox}>
                      <Ionicons name="analytics-outline" size={22} color={Colors.primary} />
                    </View>
                  </View>
                  {hasBsq && (
                    <View style={styles.resultRow2}>
                      <View style={styles.resultHalf}>
                        <Text style={styles.resultLabelSm}>KSQ-nin 40%-i</Text>
                        <Text style={styles.resultValueMd}>{result.ksq40.toFixed(1)}</Text>
                      </View>
                      <View style={styles.resultHalf}>
                        <Text style={styles.resultLabelSm}>BSQ-nin 60%-i</Text>
                        <Text style={styles.resultValueMd}>{result.bsq60.toFixed(1)}</Text>
                      </View>
                    </View>
                  )}
                  <LinearGradient colors={GRADIENT} style={styles.finalCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={styles.finalBlob} />
                    <View>
                      <Text style={styles.finalLabel}>Yekun bal və qiymət</Text>
                      <View style={styles.finalAmountRow}>
                        <Text style={styles.finalAmount}>{result.final.toFixed(1)}</Text>
                        <Text style={styles.finalMax}> / 100</Text>
                      </View>
                    </View>
                    <View style={styles.finalGradeBox}>
                      <Text style={styles.finalGradeText}>{result.grade.charAt(0)}</Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.gradeRow}>
                    <Text style={styles.gradeFullText}>{result.grade}</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
  brand: { fontSize: 16, fontWeight: '800', color: Colors.primaryDim, letterSpacing: -0.3, width: 70, textAlign: 'right' },

  /* Setup step */
  scrollSetup: { padding: 24, paddingTop: 32, paddingBottom: 48, gap: 24, alignItems: 'stretch' },

  mascotWrap: {
    alignSelf: 'center',
    position: 'relative',
    width: 110, height: 110,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  mascotAura: {
    position: 'absolute', inset: 0,
    backgroundColor: Colors.primary + '22',
    borderRadius: 55,
    transform: [{ scale: 1.2 }],
  },
  mascotCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6,
  },

  heroBlock: { alignItems: 'center', gap: 10, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5, lineHeight: 30 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 300, fontWeight: '500' },

  fieldBlock: { gap: 12 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },

  segmented: {
    flexDirection: 'row', gap: 6,
    backgroundColor: Colors.surfaceLow,
    padding: 6, borderRadius: 16,
  },
  segItem: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  segItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  segText: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  segTextActive: { color: Colors.primary, fontWeight: '800' },

  toggleCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  toggleIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  toggleSub: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },

  tipBanner: {
    backgroundColor: Colors.primary + '0F', borderRadius: 14,
    padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  tipText: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontWeight: '500', lineHeight: 18 },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 58, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 22, elevation: 4,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },

  /* Input step */
  scrollInput: { padding: 20, gap: 20, paddingBottom: 48 },

  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  summaryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: Colors.primary + '12',
  },
  summaryChipMuted: { backgroundColor: Colors.surfaceLow },
  summaryChipText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  summaryEdit: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    marginLeft: 'auto',
  },
  summaryEditText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  inputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  inputCard: {
    width: '47%', backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1,
    gap: 8,
  },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputField: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, padding: 0 },

  bsqCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1,
  },
  bsqIconBox: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center',
  },

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

  resultSection: { gap: 12 },
  resultCard: { gap: 12 },
  resultRowWide: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  resultLabel: { fontSize: 11, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  resultValue: { fontSize: 28, fontWeight: '800', color: Colors.primaryDim },
  resultIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  resultRow2: { flexDirection: 'row', gap: 12 },
  resultHalf: {
    flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 16,
  },
  resultLabelSm: { fontSize: 10, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 },
  resultValueMd: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },

  finalCard: {
    borderRadius: 20, padding: 24, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  finalBlob: {
    position: 'absolute', top: -20, right: -20,
    width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  finalLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  finalAmountRow: { flexDirection: 'row', alignItems: 'flex-end' },
  finalAmount: { fontSize: 40, fontWeight: '800', color: '#fff' },
  finalMax: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  finalGradeBox: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  finalGradeText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  gradeRow: {
    backgroundColor: Colors.primaryLight, borderRadius: 16, padding: 14,
    alignItems: 'center',
  },
  gradeFullText: { fontSize: 16, fontWeight: '800', color: Colors.primary },
});
