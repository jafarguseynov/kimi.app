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

type Result = {
  pointPerQ: number;
  earnedScore: number;
  deduction: number;
  final: number;
  percent: number;
};

export default function ScoreCalculatorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const [totalQ, setTotalQ] = useState('');
  const [correct, setCorrect] = useState('');
  const [wrong, setWrong] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [hasError, setHasError] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const addRecord = useCalcRecordsStore((s) => s.addRecord);

  const calculate = () => {
    const q = Number(totalQ), c = Number(correct), w = Number(wrong), m = Number(maxScore);
    if (!totalQ || !correct || !maxScore || isNaN(q) || isNaN(c) || isNaN(w) || isNaN(m) || q === 0 || c + w > q) {
      setHasError(true);
      return;
    }
    setHasError(false);
    const pointPerQ = m / q;
    const earnedScore = c * pointPerQ;
    const deduction = w * pointPerQ * 0.25;
    const final = Math.max(0, earnedScore - deduction);
    const percent = Math.round((final / m) * 100);
    setResult({ pointPerQ, earnedScore, deduction, final, percent });
    setRecordId(
      addRecord({
        calcId: 'score',
        value: final.toFixed(1),
        unitKey: 'calc.balUnit',
        note: `${c}/${q} · ${percent}%`,
      }),
    );
  };

  const reset = () => {
    setTotalQ('');
    setCorrect('');
    setWrong('');
    setMaxScore('');
    setResult(null);
    setHasError(false);
    setRecordId(null);
  };

  if (hasError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('calc.scoreHeader')}</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.errorCenter}>
          <View style={styles.errorAura} />
          {/* Icon card composition */}
          <View style={styles.errorCardWrap}>
            <View style={[styles.errorMainCard, { transform: [{ rotate: '-2deg' }] }]}>
              <Ionicons name="calculator" size={60} color={Colors.primary} />
            </View>
            <View style={[styles.errorBadge, { transform: [{ rotate: '12deg' }] }]}>
              <Ionicons name="close" size={24} color="#fff" />
            </View>
            <View style={[styles.errorDecor, { transform: [{ rotate: '-12deg' }] }]}>
              <Ionicons name="warning-outline" size={20} color={Colors.secondary} />
            </View>
          </View>
          <Text style={styles.errorTitle}>{t('calc.errTitle')}</Text>
          <Text style={styles.errorSub}>
            {t('calc.errSub')}
          </Text>
          <TouchableOpacity onPress={() => setHasError(false)} style={{ width: '100%' }} activeOpacity={0.9}>
            <LinearGradient colors={GRADIENT} style={styles.errorPrimaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="refresh-outline" size={22} color="#fff" />
              <Text style={styles.errorPrimaryBtnText}>{t('calc.recalc')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.errorSecBtn}
            activeOpacity={0.7}
            onPress={() => Alert.alert(t('calc.support'), t('calc.supportSoon'))}
          >
            <Text style={styles.errorSecBtnText}>{t('calc.contactSupport')}</Text>
          </TouchableOpacity>
          <View style={styles.errorHintCard}>
            <View style={styles.errorHintIconBox}>
              <Ionicons name="hardware-chip-outline" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.errorHintLabel}>{t('calc.aiTip')}</Text>
              <Text style={styles.errorHintText}>
                {t('calc.aiTipText')}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('calc.scoreHeader')}</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hero */}
          <LinearGradient colors={GRADIENT} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.heroBlob} />
            <Ionicons name="help-circle-outline" size={36} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroTitle}>{t('calc.scoreHero')}</Text>
          </LinearGradient>

          {/* Inputs */}
          <View style={styles.inputGrid}>
            <View style={styles.inputRow}>
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>{t('calc.totalQ')}</Text>
                <TextInput
                  style={styles.inputField}
                  value={totalQ}
                  onChangeText={setTotalQ}
                  placeholder="Məs: 40"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>{t('calc.maxScore')}</Text>
                <TextInput
                  style={styles.inputField}
                  value={maxScore}
                  onChangeText={setMaxScore}
                  placeholder="Məs: 100"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={[styles.inputCard, styles.inputCardCorrect]}>
                <View style={styles.inputCardBadge}>
                  <Ionicons name="checkmark" size={14} color={Colors.tertiary} />
                </View>
                <Text style={styles.inputLabel}>{t('calc.correct')}</Text>
                <TextInput
                  style={[styles.inputField, { color: Colors.tertiary }]}
                  value={correct}
                  onChangeText={setCorrect}
                  placeholder="0"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              <View style={[styles.inputCard, styles.inputCardWrong]}>
                <View style={styles.inputCardBadgeRed}>
                  <Ionicons name="close" size={14} color={Colors.danger} />
                </View>
                <Text style={styles.inputLabel}>{t('calc.wrong')}</Text>
                <TextInput
                  style={[styles.inputField, { color: Colors.danger }]}
                  value={wrong}
                  onChangeText={setWrong}
                  placeholder="0"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>{t('calc.deductInfo')}</Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity onPress={calculate} activeOpacity={0.9}>
            <LinearGradient colors={GRADIENT} style={styles.calcBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="calculator-outline" size={22} color="#fff" />
              <Text style={styles.calcBtnText}>{t('calc.calculate')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={20} color={Colors.danger} />
            <Text style={styles.resetBtnText}>{t('calc.reset')}</Text>
          </TouchableOpacity>

          {/* Result */}
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>{t('calc.result')}</Text>
            <View style={styles.resultGrid}>
              <View style={styles.resultRowWide}>
                <View>
                  <Text style={styles.resultLabel}>{t('calc.pointPerQ')}</Text>
                  <Text style={styles.resultValue}>{result ? result.pointPerQ.toFixed(2) : '—'} {t('calc.balUnit')}</Text>
                </View>
                <View style={styles.resultIconBox}>
                  <Ionicons name="analytics-outline" size={22} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.twoCol}>
                <View style={styles.miniCard}>
                  <Text style={styles.miniLabel}>{t('calc.earned')}</Text>
                  <Text style={[styles.miniValue, { color: Colors.tertiary }]}>{result ? result.earnedScore.toFixed(1) : '—'}</Text>
                </View>
                <View style={styles.miniCard}>
                  <Text style={styles.miniLabel}>{t('calc.deducted')}</Text>
                  <Text style={[styles.miniValue, { color: Colors.danger }]}>
                    {result ? (result.deduction > 0 ? `-${result.deduction.toFixed(1)}` : '0') : '—'}
                  </Text>
                </View>
              </View>
              <LinearGradient colors={GRADIENT} style={styles.finalCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.finalBlob} />
                <View>
                  <Text style={styles.finalLabel}>{t('calc.finalScore')}</Text>
                  <Text style={styles.finalScore}>{result ? result.final.toFixed(1) : '—'}</Text>
                </View>
                <View style={styles.percentBox}>
                  <Text style={styles.percentText}>{result ? `${result.percent}%` : '—'}</Text>
                </View>
              </LinearGradient>
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  scroll: { padding: 20, gap: 16, paddingBottom: 48 },

  hero: {
    borderRadius: 20, padding: 28, overflow: 'hidden', gap: 10, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 4,
  },
  heroBlob: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroTitle: { fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: 24 },

  inputGrid: { gap: 12 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1,
  },
  inputCardCorrect: { borderWidth: 1, borderColor: Colors.tertiary + '33' },
  inputCardWrong: { borderWidth: 1, borderColor: Colors.danger + '33' },
  inputCardBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.tertiary + '22', alignItems: 'center', justifyContent: 'center',
  },
  inputCardBadgeRed: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.danger + '22', alignItems: 'center', justifyContent: 'center',
  },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputField: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, padding: 0 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primaryLight, borderRadius: 14, padding: 14,
  },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary },

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

  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  resultSection: { gap: 12 },
  resultGrid: { gap: 12 },
  resultRowWide: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  resultLabel: { fontSize: 11, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  resultValue: { fontSize: 20, fontWeight: '800', color: Colors.primaryDim },
  resultIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  twoCol: { flexDirection: 'row', gap: 12 },
  miniCard: {
    flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 16, gap: 6,
  },
  miniLabel: { fontSize: 10, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.3 },
  miniValue: { fontSize: 22, fontWeight: '800' },
  finalCard: {
    borderRadius: 20, padding: 24, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  finalBlob: { position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  finalLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  finalScore: { fontSize: 44, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  percentBox: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  percentText: { fontSize: 18, fontWeight: '800', color: '#fff' },

  // ── Error state ──────────────────────────────────────────────────────────
  errorCenter: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 20,
  },
  errorAura: {
    position: 'absolute', top: '5%' as any, left: '5%' as any,
    right: '5%' as any, bottom: '25%' as any,
    backgroundColor: Colors.primary + '08', borderRadius: 999,
  },
  errorCardWrap: {
    width: 180, height: 180, alignItems: 'center', justifyContent: 'center',
  },
  errorMainCard: {
    width: 140, height: 140, borderRadius: 24,
    backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06, shadowRadius: 32, elevation: 3,
  },
  errorBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.danger,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.background,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  errorDecor: {
    position: 'absolute', bottom: 0, left: 4,
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  errorTitle: {
    fontSize: 24, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.3, lineHeight: 32,
  },
  errorSub: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 22, maxWidth: 280,
  },
  errorPrimaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 999, height: 58, width: '100%',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  errorPrimaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  errorSecBtn: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999,
  },
  errorSecBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  errorHintCard: {
    width: '100%', flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 18,
  },
  errorHintIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  errorHintLabel: {
    fontSize: 9, fontWeight: '700', color: Colors.primary,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4,
  },
  errorHintText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
});
