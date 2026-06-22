import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type FeatureCell = { kind: 'check' | 'cross' | 'text' | 'infinity' | 'verified'; textKey?: string };
type Row = { featureKey: string; free: FeatureCell; student: FeatureCell; teacher: FeatureCell };

const ROWS: Row[] = [
  { featureKey: 'pay.rowAiExams',         free: { kind: 'text', textKey: 'pay.cellThreeUnits' }, student: { kind: 'infinity' }, teacher: { kind: 'infinity' } },
  { featureKey: 'pay.rowAnalyticsDepth',  free: { kind: 'text', textKey: 'pay.cellBase' },       student: { kind: 'check' },    teacher: { kind: 'check' } },
  { featureKey: 'pay.rowProfileVerify',   free: { kind: 'cross' },                               student: { kind: 'cross' },    teacher: { kind: 'verified' } },
  { featureKey: 'pay.rowStudentMgmt',     free: { kind: 'cross' },                               student: { kind: 'cross' },    teacher: { kind: 'check' } },
  { featureKey: 'pay.rowSpecialBadges',   free: { kind: 'cross' },                               student: { kind: 'check' },    teacher: { kind: 'check' } },
];

function Cell({ cell, tone, t }: { cell: FeatureCell; tone: 'primary' | 'dark'; t: (k: string) => string }) {
  const color = tone === 'primary' ? Colors.primary : Colors.textPrimary;
  switch (cell.kind) {
    case 'check':
      return <Ionicons name="checkmark-circle" size={20} color={color} />;
    case 'cross':
      return <Ionicons name="close" size={20} color={Colors.outlineVariant} />;
    case 'infinity':
      return <Ionicons name="infinite" size={20} color={color} />;
    case 'verified':
      return <Ionicons name="shield-checkmark" size={20} color={Colors.tertiary} />;
    case 'text':
      return <Text style={styles.cellText}>{cell.textKey ? t(cell.textKey) : ''}</Text>;
  }
}

export default function PlanCompareScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <LinearGradient colors={GRADIENT} style={styles.brandBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.brandLetter}>K</Text>
          </LinearGradient>
          <Text style={styles.brandText}>Kimi.az</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroBlock}>
          <View style={styles.heroAura} pointerEvents="none" />
          <View style={styles.heroEmblem}>
            <Ionicons name="rocket" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>
            {t('pay.comparePre')}
            <Text style={styles.heroAccent}>{t('pay.compareAccent')}</Text>
          </Text>
          <Text style={styles.heroSub}>{t('pay.compareSub')}</Text>
        </View>

        {/* Plan cards */}
        <View style={{ gap: 18 }}>
          {/* Pulsuz */}
          <View style={styles.planCard}>
            <Text style={styles.planNameDim}>{t('pay.planFree')}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceNum}>0</Text>
              <Text style={styles.priceUnit}>{t('pay.perMonthFull')}</Text>
            </View>
            <View style={styles.featuresList}>
              {t('pay.freeFeatures').split('|').map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.tertiary} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.btnNeutral} activeOpacity={0.85}>
              <Text style={styles.btnNeutralText}>{t('pay.startNow')}</Text>
            </TouchableOpacity>
          </View>

          {/* Şagird Premium — featured */}
          <View style={[styles.planCard, styles.planCardFeatured]}>
            <View style={styles.popularRibbon}>
              <Text style={styles.popularRibbonText}>{t('pay.mostPopular')}</Text>
            </View>
            <Text style={styles.planNamePrimary}>{t('pay.planStudentPremium')}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceNum}>9.90</Text>
              <Text style={styles.priceUnit}>{t('pay.perMonthFull')}</Text>
            </View>
            <View style={styles.featuresList}>
              {(['star', 'analytics', 'locate', 'medal'] as const).map((icon, idx) => {
                const text = t('pay.studentFeatures').split('|')[idx];
                return (
                  <View key={text} style={styles.featureRow}>
                    <Ionicons name={icon} size={18} color={Colors.primary} />
                    <Text style={[styles.featureText, idx === 0 && styles.featureTextStrong]}>{text}</Text>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.PaymentMethod)}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>{t('pay.goToPremium')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Müəllim Premium */}
          <View style={styles.planCard}>
            <Text style={styles.planNameDim}>{t('pay.planTeacherPremium')}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceNum}>19.90</Text>
              <Text style={styles.priceUnit}>{t('pay.perMonthFull')}</Text>
            </View>
            <View style={styles.featuresList}>
              {(['people', 'shield-checkmark', 'eye', 'cash'] as const).map((icon, idx) => {
                const text = t('pay.teacherFeatures').split('|')[idx];
                return (
                  <View key={text} style={styles.featureRow}>
                    <Ionicons name={icon} size={18} color={Colors.textPrimary} />
                    <Text style={styles.featureText}>{text}</Text>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity style={styles.btnOutline} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.PaymentMethod)}>
              <Text style={styles.btnOutlineText}>{t('pay.becomePro')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comparison table */}
        <View style={{ gap: 18, marginTop: 16 }}>
          <View style={styles.tableHeader}>
            <LinearGradient colors={GRADIENT} style={styles.tableBar} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
            <Text style={styles.tableTitle}>{t('pay.comparison')}</Text>
          </View>

          <View style={styles.table}>
            {/* Column headers */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colHead, styles.colFeature]}>{t('pay.colFeature')}</Text>
              <Text style={[styles.colHead, styles.col]}>{t('pay.colFree')}</Text>
              <Text style={[styles.colHead, styles.col, { color: Colors.primary }]}>{t('pay.colStudent')}</Text>
              <Text style={[styles.colHead, styles.col]}>{t('pay.colTeacher')}</Text>
            </View>

            {ROWS.map((r, i) => (
              <View key={r.featureKey} style={[styles.tableRow, i > 0 && styles.tableRowBorder]}>
                <Text style={[styles.rowFeature, styles.colFeature]} numberOfLines={2}>{t(r.featureKey)}</Text>
                <View style={[styles.col, styles.cellCenter]}>
                  <Cell cell={r.free} tone="dark" t={t} />
                </View>
                <View style={[styles.col, styles.cellCenter]}>
                  <Cell cell={r.student} tone="primary" t={t} />
                </View>
                <View style={[styles.col, styles.cellCenter]}>
                  <Cell cell={r.teacher} tone="dark" t={t} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBox: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  brandLetter: { fontSize: 16, fontWeight: '900', color: '#fff' },
  brandText: { fontSize: 17, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.3 },

  scroll: { padding: 24, gap: 28, paddingBottom: 40 },

  /* Hero */
  heroBlock: { alignItems: 'center', gap: 14, paddingTop: 12, position: 'relative' },
  heroAura: {
    position: 'absolute', top: -10,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primary + '14',
  },
  heroEmblem: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6,
    marginBottom: 6,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5, lineHeight: 32, paddingHorizontal: 16 },
  heroAccent: { color: Colors.primary, fontStyle: 'italic' },
  heroSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 280, fontWeight: '500' },

  /* Plan card */
  planCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 22, padding: 24,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 1,
    position: 'relative', overflow: 'hidden',
  },
  planCardFeatured: {
    borderWidth: 2, borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOpacity: 0.12, shadowRadius: 26, shadowOffset: { width: 0, height: 12 }, elevation: 4,
  },
  popularRibbon: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14, paddingVertical: 4,
    borderBottomLeftRadius: 14,
  },
  popularRibbonText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1.2, textTransform: 'uppercase' },

  planNameDim: { fontSize: 16, fontWeight: '800', color: Colors.textSecondary, letterSpacing: -0.3 },
  planNamePrimary: { fontSize: 16, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 },
  priceNum: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -1 },
  priceUnit: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  featuresList: { gap: 12, marginTop: 22, marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureText: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  featureTextStrong: { color: Colors.textPrimary, fontWeight: '700' },

  btnPrimary: {
    height: 50, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  btnPrimaryText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  btnNeutral: {
    height: 46, borderRadius: 999,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  btnNeutralText: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  btnOutline: {
    height: 46, borderRadius: 999,
    borderWidth: 2, borderColor: Colors.textPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  btnOutlineText: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },

  /* Table */
  tableHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tableBar: { width: 4, height: 24, borderRadius: 2 },
  tableTitle: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },

  table: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18,
    paddingHorizontal: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 18, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  colHead: { fontSize: 10, fontWeight: '800', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 1 },
  colFeature: { flex: 1.4, paddingRight: 8 },
  col: { flex: 1, alignItems: 'center' },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16,
  },
  tableRowBorder: { borderTopWidth: 1, borderTopColor: Colors.surfaceLow },
  rowFeature: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
  cellCenter: { alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', fontStyle: 'italic', textAlign: 'center' },
});
