import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getSubcategories } from '../../constants/educationTaxonomy';
import { getCoefficient, getStructureSummary } from '../../constants/dimOfficialStructure';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.GradeSubjects>;

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function GradeSubjectsScreen({ navigation, route }: Props) {
  const { categoryKey, parentKey, parentTitle } = route.params;
  const parent = getSubcategories(categoryKey).find((p) => p.key === parentKey);
  const subjects = parent?.subjects ?? [];
  const structureKey = parent?.structureKey;
  const structureSummary = structureKey ? getStructureSummary(structureKey) : undefined;

  const openSubject = (subject: string) => {
    navigation.navigate(Routes.CategoryExams, {
      categoryKey,
      categoryTitle: `${parentTitle} · ${subject}`,
      subKey: parentKey,
      subject,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{parentTitle}</Text>
          <Text style={styles.headerSub}>FƏNN SEÇ</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Hansı fənn üzrə sınamaq istəyirsən?</Text>
          <Text style={styles.introSub}>{subjects.length} fənn mövcuddur</Text>
          {!!structureSummary && (
            <View style={styles.structurePill}>
              <Ionicons name="ribbon-outline" size={12} color={Colors.primary} />
              <Text style={styles.structurePillText}>Rəsmi format: {structureSummary}</Text>
            </View>
          )}
        </View>

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
                  {!!coef && (
                    <Text style={[styles.coefText, coef >= 1.5 && styles.coefHigh]}>
                      Əmsal: {coef.toFixed(1)}x {coef >= 1.5 ? '· ixtisas fənni' : ''}
                    </Text>
                  )}
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
});
