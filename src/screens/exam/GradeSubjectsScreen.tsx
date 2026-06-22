import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getSubcategories, FOREIGN_LANGUAGES, isForeignLangSubject } from '../../constants/educationTaxonomy';
import { getCoefficient, getStructureSummary } from '../../constants/dimOfficialStructure';
import { useServeMock } from '../../hooks/useExams';
import { useExamCategories } from '../../hooks/useExamCategories';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.GradeSubjects>;

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const isForeignLang = isForeignLangSubject;

export default function GradeSubjectsScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { categoryKey, parentKey, parentTitle } = route.params;
  // Fənlər serverdən (admin-idarəli taksonomiya) gəlir; offline/köhnə backend olarsa
  // hardcode taksonomiyaya düşürük. structureKey (DİM bal əmsalları) həmişə yereldir.
  const remote = useExamCategories();
  const hardcodedParent = getSubcategories(categoryKey).find((p) => p.key === parentKey);
  const remoteParent = remote?.find((c) => c.key === categoryKey)?.children?.find((s) => s.key === parentKey);
  const subjects = remoteParent?.subjects && remoteParent.subjects.length > 0
    ? remoteParent.subjects
    : hardcodedParent?.subjects ?? [];
  const structureKey = hardcodedParent?.structureKey;
  const structureSummary = structureKey ? getStructureSummary(structureKey) : undefined;

  const { mutate: startMock, isPending: mockPending } = useServeMock();

  // Konkret xarici dil seçimi tələb olunanda: 'single' (tək fənn) yoxsa 'mock' (tam sınaq).
  const [langPickerFor, setLangPickerFor] = useState<null | 'single' | 'mock'>(null);

  const goToSubject = (subject: string) => {
    navigation.navigate(Routes.CategoryExams, {
      categoryKey,
      categoryTitle: `${parentTitle} · ${subject}`,
      subKey: parentKey,
      subject,
    });
  };

  // Bütün fənlər üzrə günün sınağı — hər fənndən 25 ardıcıl sual, bloklarla.
  const runMock = (mockSubjects: string[]) => {
    startMock(
      { categoryKey, subKey: parentKey, subjects: mockSubjects },
      {
        onSuccess: (res) => {
          if (res.preparing || !res.id) {
            Alert.alert(t('gradeSubjects.mockPrepTitle'), t('gradeSubjects.mockPrepMsg'));
            return;
          }
          navigation.navigate(Routes.ExamInfo, { examId: res.id, title: res.title ?? t('gradeSubjects.dailyMock') });
        },
        onError: (err: any) => {
          Alert.alert(t('gradeSubjects.errorTitle'), err?.response?.data?.message ?? t('gradeSubjects.mockFailed'));
        },
      },
    );
  };

  const startFullMock = () => {
    if (mockPending || subjects.length === 0) return;
    if (subjects.some(isForeignLang)) { setLangPickerFor('mock'); return; }
    runMock(subjects);
  };

  const openSubject = (subject: string) => {
    if (isForeignLang(subject)) { setLangPickerFor('single'); return; }
    goToSubject(subject);
  };

  const pickLanguage = (lang: string) => {
    const mode = langPickerFor;
    setLangPickerFor(null);
    if (mode === 'single') {
      goToSubject(lang);
    } else if (mode === 'mock') {
      runMock(subjects.map((s) => (isForeignLang(s) ? lang : s)));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{parentTitle}</Text>
          <Text style={styles.headerSub}>{t('gradeSubjects.pickSubject')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>{t('gradeSubjects.introTitle')}</Text>
          <Text style={styles.introSub}>{t('gradeSubjects.subjectsAvailable', { n: subjects.length })}</Text>
          {!!structureSummary && (
            <View style={styles.structurePill}>
              <Ionicons name="ribbon-outline" size={12} color={Colors.primary} />
              <Text style={styles.structurePillText}>{t('gradeSubjects.officialFormat', { summary: structureSummary })}</Text>
            </View>
          )}
        </View>

        {/* Tam sınaq — bütün fənlər üzrə günün sınağı */}
        {subjects.length > 1 && (
          <TouchableOpacity activeOpacity={0.9} onPress={startFullMock} disabled={mockPending}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mockCard}>
              <View style={styles.mockIcon}>
                {mockPending
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="trophy" size={22} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mockTitle}>{t('gradeSubjects.fullMockTitle')}</Text>
                <Text style={styles.mockSub}>
                  {mockPending ? t('gradeSubjects.preparing') : t('gradeSubjects.fullMockSub', { n: subjects.length })}
                </Text>
              </View>
              {!mockPending && <Ionicons name="arrow-forward" size={20} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.orLabel}>{t('gradeSubjects.orSingle')}</Text>

        <View style={styles.grid}>
          {subjects.map((s) => {
            const coef = structureKey ? getCoefficient(structureKey, s) : undefined;
            return (
              <TouchableOpacity key={s} activeOpacity={0.85} style={styles.subjectCard} onPress={() => openSubject(s)}>
                <View style={styles.subjectIcon}>
                  <Ionicons name="book" size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subjectTitle}>{s}</Text>
                  {isForeignLang(s) ? (
                    <Text style={styles.coefText}>{t('gradeSubjects.langHint')}</Text>
                  ) : (!!coef && (
                    <Text style={[styles.coefText, coef >= 1.5 && styles.coefHigh]}>
                      {t('gradeSubjects.coef', { coef: coef.toFixed(1) })} {coef >= 1.5 ? t('gradeSubjects.coefMajor') : ''}
                    </Text>
                  ))}
                </View>
                <View style={styles.cta}>
                  <LinearGradient
                    colors={GRADIENT}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.ctaInner}
                  >
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Xarici dil seçimi */}
      <Modal
        visible={langPickerFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLangPickerFor(null)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setLangPickerFor(null)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('gradeSubjects.pickLangTitle')}</Text>
            <Text style={styles.sheetSub}>
              {langPickerFor === 'mock'
                ? t('gradeSubjects.pickLangMock')
                : t('gradeSubjects.pickLangSingle')}
            </Text>
            <View style={styles.langGrid}>
              {FOREIGN_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  activeOpacity={0.85}
                  style={styles.langCard}
                  onPress={() => pickLanguage(lang)}
                >
                  <View style={styles.langIcon}>
                    <Ionicons name="language" size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.langText}>{lang}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 64,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    gap: 8,
  },
  headerBackBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, letterSpacing: -0.2 },
  headerSub: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 1.2, marginTop: -2 },

  scroll: { padding: 20, gap: 20, paddingBottom: 48 },

  intro: { gap: 4 },
  introTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  introSub: { fontSize: 12, color: Colors.textSecondary },

  mockCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, padding: 18,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 4,
  },
  mockIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  mockTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  mockSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  orLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },

  grid: { gap: 10 },
  subjectCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  subjectIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primary + '14',
    alignItems: 'center', justifyContent: 'center',
  },
  subjectTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  coefText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 },
  coefHigh: { color: Colors.primary, fontWeight: '800' },
  structurePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    backgroundColor: Colors.primary + '14',
    marginTop: 8,
  },
  structurePillText: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 0.2 },
  cta: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  ctaInner: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surfaceLowest,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.borderLight,
    alignSelf: 'center', marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  sheetSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, marginBottom: 16 },
  langGrid: { gap: 10 },
  langCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLow, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  langIcon: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: Colors.primary + '14', alignItems: 'center', justifyContent: 'center',
  },
  langText: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
});
