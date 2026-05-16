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

type SubjectScores = { qapalı: string; açıq: string; yazılı: string };
type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Subject = {
  key: 'riy' | 'azDili' | 'xDil';
  label: string;
  icon: IconName;
  iconColor: string;
  iconBg: string;
};

const SUBJECTS: Subject[] = [
  { key: 'riy', label: 'Riyaziyyat', icon: 'calculator-outline', iconColor: Colors.primary, iconBg: Colors.primaryLight },
  { key: 'azDili', label: 'Azərbaycan dili', icon: 'book-outline', iconColor: Colors.tertiary, iconBg: Colors.onTertiary },
  { key: 'xDil', label: 'Xarici dil', icon: 'globe-outline', iconColor: Colors.secondary, iconBg: Colors.secondaryContainer },
];

const empty = (): SubjectScores => ({ qapalı: '', açıq: '', yazılı: '' });

function calcSubject(s: SubjectScores): number {
  return Number(s.qapalı) * 0.5 + Number(s.açıq) * 1 + Number(s.yazılı) * 2;
}

export default function DIMCalculatorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [tab, setTab] = useState<'buraxilis' | 'blok'>('buraxilis');
  const [scores, setScores] = useState<Record<string, SubjectScores>>({
    riy: empty(), azDili: empty(), xDil: empty(),
  });
  const [total, setTotal] = useState<number | null>(null);

  const update = (key: string, field: keyof SubjectScores, val: string) => {
    setScores((prev) => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  };

  const calculate = () => {
    const t = SUBJECTS.reduce((sum, s) => sum + calcSubject(scores[s.key]), 0);
    setTotal(Math.round(t * 10) / 10);
  };

  const reset = () => {
    setScores({ riy: empty(), azDili: empty(), xDil: empty() });
    setTotal(null);
  };

  const getResultLabel = (t: number): string => {
    if (t >= 500) return 'Əla nəticə!';
    if (t >= 350) return 'Yaxşı nəticə!';
    if (t >= 200) return 'Orta nəticə';
    return 'Daha çox çalışın!';
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DİM Kalkulyatoru</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Intro card */}
          <View style={styles.introCard}>
            <View style={styles.introBlob} />
            <Text style={styles.introTag}>MƏSLƏHƏTÇİ</Text>
            <Text style={styles.introTitle}>Ballarını dəqiq{'\n'}hesablamağa hazırsan?</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {(['buraxilis', 'blok'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabItem, tab === t && styles.tabItemActive]}
                onPress={() => setTab(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'buraxilis' ? 'Buraxılış' : 'Blok'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Subject cards */}
          {SUBJECTS.map((subject) => (
            <View key={subject.key} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <View style={[styles.subjectIconBox, { backgroundColor: subject.iconBg }]}>
                  <Ionicons name={subject.icon} size={20} color={subject.iconColor} />
                </View>
                <Text style={styles.subjectLabel}>{subject.label}</Text>
              </View>
              <View style={styles.inputRow}>
                {(['qapalı', 'açıq', 'yazılı'] as const).map((field) => (
                  <View key={field} style={styles.inputCol}>
                    <Text style={styles.fieldLabel}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                    <TextInput
                      style={styles.inputField}
                      value={scores[subject.key][field]}
                      onChangeText={(v) => update(subject.key, field, v)}
                      placeholder="0"
                      placeholderTextColor={Colors.outlineVariant}
                      keyboardType="numeric"
                      maxLength={3}
                      textAlign="center"
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Buttons */}
          <TouchableOpacity onPress={calculate} activeOpacity={0.9}>
            <LinearGradient colors={GRADIENT} style={styles.calcBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.calcBtnText}>Hesabla</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.8}>
            <Text style={styles.resetBtnText}>Sıfırla</Text>
          </TouchableOpacity>

          {/* Result */}
          <View style={styles.resultCard}>
            <View style={styles.resultBlob1} />
            <View style={styles.resultBlob2} />
            <Text style={styles.resultTopLabel}>Ümumi Bal</Text>
            <Text style={styles.resultScore}>{total !== null ? total : '—'}</Text>
            {total !== null && (
              <View style={styles.resultBadge}>
                <Ionicons name="trending-up" size={16} color="#fff" />
                <Text style={styles.resultBadgeText}>{getResultLabel(total)}</Text>
              </View>
            )}
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

  scroll: { padding: 20, gap: 16, paddingBottom: 48 },

  introCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24, overflow: 'hidden',
    gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 20, elevation: 1,
  },
  introBlob: {
    position: 'absolute', bottom: -32, right: -32,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primary + '14',
  },
  introTag: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 2, textTransform: 'uppercase' },
  introTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, lineHeight: 28 },

  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.surfaceLow,
    borderRadius: 999, padding: 6, gap: 4,
  },
  tabItem: { flex: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  tabItemActive: { backgroundColor: Colors.surfaceLowest, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 1 },
  tabText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { fontWeight: '700', color: Colors.primary },

  subjectCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
  },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subjectIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  subjectLabel: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  inputRow: { flexDirection: 'row', gap: 10 },
  inputCol: { flex: 1, gap: 8 },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: Colors.secondary, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  inputField: {
    backgroundColor: Colors.surfaceLow, borderRadius: 14, padding: 14,
    fontSize: 18, fontWeight: '700', color: Colors.textPrimary,
  },

  calcBtn: {
    borderRadius: 999, height: 58, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  calcBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  resetBtn: { backgroundColor: Colors.surfaceHigh, borderRadius: 999, height: 52, alignItems: 'center', justifyContent: 'center' },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  resultCard: {
    backgroundColor: Colors.textPrimary, borderRadius: 20, padding: 32,
    alignItems: 'center', gap: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.12, shadowRadius: 32, elevation: 5,
  },
  resultBlob1: { position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.primary + '33' },
  resultBlob2: { position: 'absolute', bottom: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.tertiary + '33' },
  resultTopLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2 },
  resultScore: { fontSize: 64, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  resultBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  resultBadgeText: { fontSize: 13, fontWeight: '600', color: '#fff' },
});
