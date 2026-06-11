import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Mode = 'semester' | 'annual';

// Şagird sətri — v1/v2 mənası rejimdən asılıdır:
//  semester: v1 = KSQ ortalaması, v2 = BSQ (opsional)
//  annual:   v1 = 1-ci yarımil balı, v2 = 2-ci yarımil balı
type StudentRow = { id: string; name: string; v1: string; v2: string };

type RowResult = {
  final: number | null;
  grade: number | null; // 5 / 4 / 3 / 2
};

function gradeOf(score: number): number {
  if (score >= 91) return 5;
  if (score >= 71) return 4;
  if (score >= 51) return 3;
  return 2;
}

const GRADE_LABEL: Record<number, string> = {
  5: 'Əla',
  4: 'Yaxşı',
  3: 'Kafi',
  2: 'Qeyri-kafi',
};

function gradeColor(g: number): string {
  if (g === 5) return Colors.tertiary;
  if (g === 4) return Colors.primary;
  if (g === 3) return Colors.secondary;
  return Colors.danger;
}

function parseScore(v: string): number | null {
  const s = v.trim();
  if (s === '') return null;
  const n = Number(s);
  if (isNaN(n) || n < 0 || n > 100) return null;
  return n;
}

function computeRow(mode: Mode, row: StudentRow): RowResult {
  const a = parseScore(row.v1);
  const b = parseScore(row.v2);
  if (mode === 'semester') {
    if (a === null) return { final: null, grade: null };
    // BSQ varsa: KSQ 40% + BSQ 60%, yoxdursa yalnız KSQ ortalaması
    const final = b === null ? a : Math.min(100, a * 0.4 + b * 0.6);
    return { final, grade: gradeOf(final) };
  }
  // annual: hər iki yarımil tələb olunur
  if (a === null || b === null) return { final: null, grade: null };
  const final = (a + b) / 2;
  return { final, grade: gradeOf(final) };
}

export default function ClassGradeCalculatorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const idRef = useRef(4);

  const [mode, setMode] = useState<Mode>('semester');
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([
    { id: '1', name: '', v1: '', v2: '' },
    { id: '2', name: '', v1: '', v2: '' },
    { id: '3', name: '', v1: '', v2: '' },
  ]);

  const addStudent = () => {
    const id = String(idRef.current++);
    setStudents((prev) => [...prev, { id, name: '', v1: '', v2: '' }]);
  };

  const removeStudent = (id: string) => {
    setStudents((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
  };

  const updateStudent = (id: string, field: keyof StudentRow, value: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const reset = () => {
    setStudents([{ id: String(idRef.current++), name: '', v1: '', v2: '' }]);
    setClassName('');
  };

  // Hər sətrin nəticəsi
  const rowResults = useMemo(
    () => students.map((s) => computeRow(mode, s)),
    [students, mode],
  );

  // Sinif statistikası — yalnız etibarlı nəticələr
  const stats = useMemo(() => {
    const finals = rowResults.filter((r) => r.final !== null) as Required<RowResult>[];
    const total = finals.length;
    if (total === 0) {
      return { total: 0, avg: 0, dist: { 5: 0, 4: 0, 3: 0, 2: 0 }, quality: 0, success: 0 };
    }
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0 } as Record<number, number>;
    let sum = 0;
    for (const r of finals) {
      sum += r.final as number;
      dist[r.grade as number] += 1;
    }
    const avg = sum / total;
    const quality = Math.round(((dist[4] + dist[5]) / total) * 1000) / 10;
    const success = Math.round(((dist[3] + dist[4] + dist[5]) / total) * 1000) / 10;
    return { total, avg, dist, quality, success };
  }, [rowResults]);

  const modeLabels =
    mode === 'semester'
      ? { v1: 'KSQ ortalaması', v2: 'BSQ', hint: 'BSQ boş qalsa, yalnız KSQ ortalaması götürülür.' }
      : { v1: '1-ci yarımil', v2: '2-ci yarımil', hint: 'İllik bal iki yarımilin ortalamasıdır.' };

  const onShare = async () => {
    if (stats.total === 0) return;
    const title = `${className.trim() || 'Sinif'} — ${mode === 'semester' ? 'Yarımillik' : 'İllik'} nəticələr`;
    const lines = students
      .map((s, i) => {
        const r = rowResults[i];
        if (r.final === null) return null;
        const nm = s.name.trim() || `Şagird ${i + 1}`;
        return `${nm}: ${(r.final as number).toFixed(1)} — ${r.grade} (${GRADE_LABEL[r.grade as number]})`;
      })
      .filter(Boolean)
      .join('\n');
    const summary =
      `\nOrtalama: ${stats.avg.toFixed(1)}\n` +
      `Keyfiyyət: ${stats.quality}%   Müvəffəqiyyət: ${stats.success}%\n` +
      `5: ${stats.dist[5]}  4: ${stats.dist[4]}  3: ${stats.dist[3]}  2: ${stats.dist[2]}`;
    try {
      await Share.share({ message: `${title}\n\n${lines}\n${summary}\n\nKimi.az` });
    } catch {
      /* paylaşma ləğv edildi */
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sinif Qiymət Kalkulyatoru</Text>
          <Text style={styles.brand}>Kimi.az</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <LinearGradient colors={GRADIENT} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.heroBlob} />
            <Text style={styles.heroTitle}>Sinfin qiymətlərini bir yerdə hesabla</Text>
            <Text style={styles.heroSub}>Şagirdləri əlavə et, yarımillik və ya illik balı, keyfiyyət və müvəffəqiyyət faizini anında gör.</Text>
          </LinearGradient>

          {/* Mode toggle */}
          <View style={styles.segmented}>
            {([
              { key: 'semester', label: 'Yarımillik', icon: 'calendar-outline' as const },
              { key: 'annual', label: 'İllik', icon: 'calendar-clear-outline' as const },
            ] as const).map((m) => {
              const active = mode === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.segItem, active && styles.segItemActive]}
                  onPress={() => setMode(m.key)}
                  activeOpacity={0.85}
                >
                  <Ionicons name={m.icon} size={16} color={active ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.segText, active && styles.segTextActive]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Class name */}
          <View style={styles.classCard}>
            <View style={styles.classIconBox}>
              <Ionicons name="school-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.classLabel}>Sinif adı (opsional)</Text>
              <TextInput
                style={styles.classInput}
                value={className}
                onChangeText={setClassName}
                placeholder="Məs: 9-A sinfi"
                placeholderTextColor={Colors.outlineVariant}
              />
            </View>
          </View>

          {/* Hint */}
          <View style={styles.hintBanner}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.hintText}>{modeLabels.hint}</Text>
          </View>

          {/* Students */}
          <View style={styles.studentsList}>
            {students.map((s, i) => {
              const r = rowResults[i];
              return (
                <View key={s.id} style={styles.studentCard}>
                  <View style={styles.studentTop}>
                    <View style={styles.indexBadge}>
                      <Text style={styles.indexText}>{i + 1}</Text>
                    </View>
                    <TextInput
                      style={styles.nameInput}
                      value={s.name}
                      onChangeText={(v) => updateStudent(s.id, 'name', v)}
                      placeholder={`Şagird ${i + 1}`}
                      placeholderTextColor={Colors.outlineVariant}
                    />
                    <TouchableOpacity
                      onPress={() => removeStudent(s.id)}
                      hitSlop={8}
                      disabled={students.length <= 1}
                      style={styles.removeBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={students.length <= 1 ? Colors.outlineVariant : Colors.danger}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.scoreRow}>
                    <View style={styles.scoreField}>
                      <Text style={styles.scoreLabel}>{modeLabels.v1}</Text>
                      <TextInput
                        style={styles.scoreInput}
                        value={s.v1}
                        onChangeText={(v) => updateStudent(s.id, 'v1', v)}
                        placeholder="0-100"
                        placeholderTextColor={Colors.outlineVariant}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>
                    <View style={styles.scoreField}>
                      <Text style={styles.scoreLabel}>{modeLabels.v2}</Text>
                      <TextInput
                        style={styles.scoreInput}
                        value={s.v2}
                        onChangeText={(v) => updateStudent(s.id, 'v2', v)}
                        placeholder="0-100"
                        placeholderTextColor={Colors.outlineVariant}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>
                    <View style={styles.resultPill}>
                      {r.final !== null && r.grade !== null ? (
                        <>
                          <Text style={styles.resultScore}>{r.final.toFixed(1)}</Text>
                          <View style={[styles.gradeDot, { backgroundColor: gradeColor(r.grade) }]}>
                            <Text style={styles.gradeDotText}>{r.grade}</Text>
                          </View>
                        </>
                      ) : (
                        <Text style={styles.resultEmpty}>—</Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Add student */}
          <TouchableOpacity style={styles.addBtn} onPress={addStudent} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.addBtnText}>Şagird əlavə et</Text>
          </TouchableOpacity>

          {/* Class summary */}
          <Text style={styles.sectionTitle}>Sinif statistikası</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={styles.summaryLabel}>Orta bal</Text>
                <Text style={styles.summaryAvg}>{stats.total ? stats.avg.toFixed(1) : '—'}</Text>
                <Text style={styles.summaryCount}>{stats.total} şagird hesablandı</Text>
              </View>
              <View style={styles.summaryIconBox}>
                <Ionicons name="stats-chart" size={24} color={Colors.primary} />
              </View>
            </View>

            <View style={styles.pctRow}>
              <View style={styles.pctCell}>
                <Text style={styles.pctValue}>{stats.total ? `${stats.success}%` : '—'}</Text>
                <Text style={styles.pctLabel}>Müvəffəqiyyət</Text>
                <View style={styles.pctTrack}>
                  <View style={[styles.pctFill, { width: `${Math.min(stats.success, 100)}%`, backgroundColor: Colors.primary }]} />
                </View>
              </View>
              <View style={styles.pctCell}>
                <Text style={[styles.pctValue, { color: Colors.tertiary }]}>{stats.total ? `${stats.quality}%` : '—'}</Text>
                <Text style={styles.pctLabel}>Keyfiyyət</Text>
                <View style={styles.pctTrack}>
                  <View style={[styles.pctFill, { width: `${Math.min(stats.quality, 100)}%`, backgroundColor: Colors.tertiary }]} />
                </View>
              </View>
            </View>

            {/* Distribution */}
            <View style={styles.distRow}>
              {[5, 4, 3, 2].map((g) => (
                <View key={g} style={styles.distCell}>
                  <View style={[styles.distDot, { backgroundColor: gradeColor(g) }]}>
                    <Text style={styles.distDotText}>{g}</Text>
                  </View>
                  <Text style={styles.distCount}>{stats.dist[g]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity onPress={onShare} activeOpacity={0.9} disabled={stats.total === 0}>
            <LinearGradient
              colors={stats.total === 0 ? [Colors.surfaceHigh, Colors.surfaceHigh] : GRADIENT}
              style={styles.shareBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="share-outline" size={20} color={stats.total === 0 ? Colors.textSecondary : '#fff'} />
              <Text style={[styles.shareBtnText, stats.total === 0 && { color: Colors.textSecondary }]}>Nəticələri paylaş</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={18} color={Colors.danger} />
            <Text style={styles.resetBtnText}>Sıfırla</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.outlineVariant} />
            <Text style={styles.footerText}>ARTİ qiymətləndirmə standartlarına uyğun</Text>
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
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3, flex: 1, textAlign: 'center' },
  brand: { fontSize: 14, fontWeight: '800', color: Colors.primaryDim, letterSpacing: -0.3, width: 56, textAlign: 'right' },

  scroll: { padding: 20, gap: 16, paddingBottom: 48 },

  hero: {
    borderRadius: 20, padding: 24, overflow: 'hidden', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 4,
  },
  heroBlob: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroTitle: { fontSize: 19, fontWeight: '800', color: '#fff', lineHeight: 26 },
  heroSub: { fontSize: 12.5, fontWeight: '500', color: 'rgba(255,255,255,0.85)', lineHeight: 19 },

  segmented: {
    flexDirection: 'row', gap: 6,
    backgroundColor: Colors.surfaceLow,
    padding: 6, borderRadius: 16,
  },
  segItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 12,
  },
  segItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  segText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  segTextActive: { color: Colors.primary, fontWeight: '800' },

  classCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  classIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  classLabel: { fontSize: 11, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  classInput: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, padding: 0 },

  hintBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary + '0F', borderRadius: 12, padding: 12,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  hintText: { flex: 1, fontSize: 12, color: Colors.textSecondary, fontWeight: '500', lineHeight: 17 },

  studentsList: { gap: 12 },
  studentCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1,
  },
  studentTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  indexBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  indexText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  nameInput: {
    flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary,
    backgroundColor: Colors.surfaceLow, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  removeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  scoreField: { flex: 1, gap: 6 },
  scoreLabel: { fontSize: 10, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.3 },
  scoreInput: {
    backgroundColor: Colors.surfaceLow, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 17, fontWeight: '800', color: Colors.textPrimary,
  },
  resultPill: {
    minWidth: 74, height: 46, borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingHorizontal: 8,
  },
  resultScore: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  resultEmpty: { fontSize: 16, fontWeight: '800', color: Colors.outlineVariant },
  gradeDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  gradeDotText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 14, height: 50,
    borderWidth: 1.5, borderColor: Colors.primary + '44', borderStyle: 'dashed',
    backgroundColor: Colors.primary + '08',
  },
  addBtnText: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },

  summaryCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryAvg: { fontSize: 34, fontWeight: '800', color: Colors.primary, marginTop: 2 },
  summaryCount: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 },
  summaryIconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },

  pctRow: { flexDirection: 'row', gap: 12 },
  pctCell: { flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 14, gap: 8 },
  pctValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  pctLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  pctTrack: { height: 8, backgroundColor: Colors.surfaceContainer, borderRadius: 999, overflow: 'hidden' },
  pctFill: { height: '100%', borderRadius: 999 },

  distRow: { flexDirection: 'row', gap: 10 },
  distCell: {
    flex: 1, alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceLow, borderRadius: 14, paddingVertical: 12,
  },
  distDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  distDotText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  distCount: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 999, height: 56,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 18, elevation: 3,
  },
  shareBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surfaceHigh, borderRadius: 999, height: 50,
  },
  resetBtnText: { fontSize: 14, fontWeight: '700', color: Colors.danger },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 6 },
  footerText: { fontSize: 10, fontWeight: '700', color: Colors.outlineVariant, textTransform: 'uppercase', letterSpacing: 1 },
});
