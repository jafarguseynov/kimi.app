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

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

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
  const [ksq, setKsq] = useState(['', '', '']);
  const [bsq, setBsq] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const updateKsq = (idx: number, val: string) => {
    const next = [...ksq];
    next[idx] = val;
    setKsq(next);
  };

  const calculate = () => {
    const filled = ksq.filter((v) => v.trim() !== '').map(Number);
    if (filled.length === 0 || !bsq.trim()) return;
    const ksqAvg = filled.reduce((a, b) => a + b, 0) / filled.length;
    const ksq40 = ksqAvg * 0.4;
    const bsq60 = Number(bsq) * 0.6;
    const final = Math.min(100, ksq40 + bsq60);
    setResult({ ksqAvg, ksq40, bsq60, final, grade: getGrade(final) });
  };

  const reset = () => {
    setKsq(['', '', '']);
    setBsq('');
    setResult(null);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yarımillik Qiymətləndirmə</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Salam! Mən Kimi.</Text>
            <Text style={styles.heroSub}>Gəl yarımillik balını birlikdə hesablayaq.</Text>
            <View style={styles.heroLine} />
          </View>

          {/* KSQ Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>KSQ Qiymətləri</Text>
              <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
                <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
                <Text style={styles.addBtnText}>Yeni KSQ</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputGrid}>
              {[0, 1, 2].map((idx) => (
                <View key={idx} style={styles.inputCard}>
                  <Text style={styles.inputLabel}>KSQ {idx + 1}</Text>
                  <TextInput
                    style={styles.inputField}
                    value={ksq[idx]}
                    onChangeText={(v) => updateKsq(idx, v)}
                    placeholder="0 - 100"
                    placeholderTextColor={Colors.outlineVariant}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.addCard} activeOpacity={0.7}>
                <Ionicons name="add" size={24} color={Colors.outline} />
              </TouchableOpacity>
            </View>
          </View>

          {/* BSQ Section */}
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

          {/* Buttons */}
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
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Nəticə</Text>
            <View style={styles.resultCard}>
              <View style={styles.resultRowWide}>
                <View>
                  <Text style={styles.resultLabel}>KSQ ortalaması</Text>
                  <Text style={styles.resultValue}>{result ? result.ksqAvg.toFixed(1) : '—'}</Text>
                </View>
                <View style={styles.resultIconBox}>
                  <Ionicons name="analytics-outline" size={22} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.resultRow2}>
                <View style={styles.resultHalf}>
                  <Text style={styles.resultLabelSm}>KSQ-nin 40%-i</Text>
                  <Text style={styles.resultValueMd}>{result ? result.ksq40.toFixed(1) : '—'}</Text>
                </View>
                <View style={styles.resultHalf}>
                  <Text style={styles.resultLabelSm}>BSQ-nin 60%-i</Text>
                  <Text style={styles.resultValueMd}>{result ? result.bsq60.toFixed(1) : '—'}</Text>
                </View>
              </View>
              {/* Final */}
              <LinearGradient colors={GRADIENT} style={styles.finalCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.finalBlob} />
                <View>
                  <Text style={styles.finalLabel}>Yekun bal və qiymət</Text>
                  <View style={styles.finalAmountRow}>
                    <Text style={styles.finalAmount}>{result ? result.final.toFixed(1) : '—'}</Text>
                    <Text style={styles.finalMax}> / 100</Text>
                  </View>
                </View>
                <View style={styles.finalGradeBox}>
                  <Text style={styles.finalGradeText}>{result ? result.grade.charAt(0) : '—'}</Text>
                </View>
              </LinearGradient>
              {result && (
                <View style={styles.gradeRow}>
                  <Text style={styles.gradeFullText}>{result.grade}</Text>
                </View>
              )}
            </View>
          </View>
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
    backgroundColor: Colors.primaryLight, borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 8,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  heroSub: { fontSize: 14, color: Colors.textSecondary },
  heroLine: { width: 48, height: 6, borderRadius: 3, backgroundColor: Colors.primary + '33', marginTop: 8 },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  inputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  inputCard: {
    width: '47%', backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1,
    gap: 8,
  },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputField: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, padding: 0 },
  addCard: {
    width: '47%', backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 16,
    alignItems: 'center', justifyContent: 'center', minHeight: 72,
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.outlineVariant + '66',
  },

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
