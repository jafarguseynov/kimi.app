import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

interface MonthData {
  ratio: number;
  highlight?: boolean;
}

interface SubjectRow {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  score: number;
  statusKey: string;
  statusColor: string;
}

const MONTHS: MonthData[] = [
  { ratio: 0.40 },
  { ratio: 0.60 },
  { ratio: 0.85, highlight: true },
  { ratio: 0.75 },
];

const SUBJECTS: SubjectRow[] = [
  { name: 'Riyaziyyat', icon: 'calculator-outline', score: 42, statusKey: 'childReport.statusNeedsWork', statusColor: Colors.error },
  { name: 'Azərbaycan dili', icon: 'book-outline', score: 94, statusKey: 'childReport.statusExcellent', statusColor: Colors.tertiary },
  { name: 'İngilis dili', icon: 'language-outline', score: 78, statusKey: 'childReport.statusGood', statusColor: Colors.primary },
];

export default function ChildAcademicReportScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const childName: string | undefined = route.params?.childName;
  const monthLabels = t('childReport.months').split('|');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('childReport.headerTitle')}</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero progress chart */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.heroTitle}>
                {childName ? t('childReport.heroTitleWithName', { name: childName }) : t('childReport.heroTitleNoName')}
              </Text>
              <Text style={styles.heroSub}>{t('childReport.heroSub')}</Text>
            </View>
            <View style={styles.deltaPill}>
              <Text style={styles.deltaText}>{t('childReport.delta')}</Text>
            </View>
          </View>

          <View style={styles.chart}>
            {MONTHS.map((m, mi) => (
              <View key={mi} style={styles.chartCol}>
                <View style={styles.chartBarTrack}>
                  {m.highlight ? (
                    <LinearGradient
                      colors={[Colors.gradientStart, Colors.gradientEnd]}
                      style={[styles.chartBarFill, { height: `${m.ratio * 100}%` as any }]}
                      start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                    />
                  ) : (
                    <View style={[styles.chartBarFill, styles.chartBarMuted, { height: `${m.ratio * 100}%` as any }]} />
                  )}
                </View>
                <Text style={[styles.chartLabel, m.highlight && styles.chartLabelHighlight]}>{monthLabels[mi]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Warning card */}
        <View style={styles.warningCard}>
          <View style={styles.warningIconBox}>
            <Ionicons name="warning" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>{t('childReport.warningTitle')}</Text>
            <Text style={styles.warningSub}>{t('childReport.warningSub')}</Text>
          </View>
        </View>

        {/* Subjects */}
        <Text style={styles.sectionTitle}>{t('childReport.sectionTitle')}</Text>
        <View style={styles.subjectList}>
          {SUBJECTS.map((s) => (
            <View key={s.name} style={styles.subjectCard}>
              <View style={styles.subjectLeft}>
                <View style={styles.subjectIcon}>
                  <Ionicons name={s.icon} size={22} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.subjectName}>{s.name}</Text>
                  <Text style={[styles.subjectStatus, { color: s.statusColor }]}>{t(s.statusKey)}</Text>
                </View>
              </View>
              <Text style={styles.subjectScore}>{s.score}%</Text>
            </View>
          ))}
        </View>

        {/* AI Tövsiyə */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.aiCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.aiTopRow}>
            <Ionicons name="flash" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.aiKicker}>{t('childReport.aiKicker')}</Text>
          </View>
          <Text style={styles.aiText}>
            {t('childReport.aiText')}
          </Text>
          <TouchableOpacity
            style={styles.aiCta}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.ChildActivity, { childName })}
          >
            <Text style={styles.aiCtaText}>{t('childReport.aiCta')}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 28 },

  // Hero chart
  heroCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  heroSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  deltaPill: { backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  deltaText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  chart: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    height: 168, gap: 14, paddingHorizontal: 4,
  },
  chartCol: { flex: 1, alignItems: 'center', gap: 8, height: '100%' },
  chartBarTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  chartBarFill: { width: '100%', borderTopLeftRadius: 999, borderTopRightRadius: 999 },
  chartBarMuted: { backgroundColor: Colors.surfaceHigh },
  chartLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  chartLabelHighlight: { fontWeight: '800', color: Colors.primary },

  // Warning
  warningCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFF1F2',
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: '#FECDD3',
  },
  warningIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.errorContainer ?? '#fb5151',
    alignItems: 'center', justifyContent: 'center',
  },
  warningTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  warningSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 17 },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: -12, paddingHorizontal: 4 },

  // Subjects
  subjectList: { gap: 12 },
  subjectCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLow, borderRadius: 18, padding: 18,
  },
  subjectLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  subjectIcon: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  subjectName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  subjectStatus: { fontSize: 11, fontWeight: '600', marginTop: 3 },
  subjectScore: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },

  // AI
  aiCard: {
    borderRadius: 20, padding: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5,
  },
  aiTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 },
  aiKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: 'rgba(255,255,255,0.85)' },
  aiText: { fontSize: 14, fontWeight: '500', color: '#fff', textAlign: 'center', lineHeight: 22 },
  aiCta: {
    alignSelf: 'center', marginTop: 20,
    paddingHorizontal: 22, paddingVertical: 10,
    backgroundColor: '#fff', borderRadius: 999,
  },
  aiCtaText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
});
