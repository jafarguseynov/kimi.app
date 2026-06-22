import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.MonthlyExamDetail>;
  route: RouteProp<ExamStackParamList, typeof Routes.MonthlyExamDetail>;
};

const RULES = [
  { icon: 'shield-checkmark-outline' as const, color: Colors.primary, bg: Colors.primaryLight, titleKey: 'monthlyExam.rule1Title', bodyKey: 'monthlyExam.rule1Body' },
  { icon: 'wifi-outline' as const, color: Colors.secondary, bg: Colors.secondaryLight + '55', titleKey: 'monthlyExam.rule2Title', bodyKey: 'monthlyExam.rule2Body' },
  { icon: 'analytics-outline' as const, color: Colors.tertiary, bg: Colors.tertiaryContainer + '40', titleKey: 'monthlyExam.rule3Title', bodyKey: 'monthlyExam.rule3Body' },
];

const STATS = [
  { icon: 'calendar-outline' as const, labelKey: 'monthlyExam.statDate', valueKey: 'monthlyExam.statDateVal' },
  { icon: 'time-outline' as const, labelKey: 'monthlyExam.statTime', valueKey: 'monthlyExam.statTimeVal' },
  { icon: 'help-circle-outline' as const, labelKey: 'monthlyExam.statQuestions', valueKey: 'monthlyExam.statQuestionsVal' },
  { icon: 'timer-outline' as const, labelKey: 'monthlyExam.statDuration', valueKey: 'monthlyExam.statDurationVal' },
];

export default function MonthlyExamDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { title = t('monthlyExam.title'), examId } = route.params;

  const handleJoin = () => {
    navigation.navigate(Routes.LiveExamWaiting, { examId, title });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('monthlyExam.title')}</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroGlow1} />
          <View style={styles.heroGlow2} />
          <View style={styles.heroBadge}>
            <Ionicons name="star" size={12} color="#fff" />
            <Text style={styles.heroBadgeText}>{t('monthlyExam.badge')}</Text>
          </View>
          <Text style={styles.heroTitle}>{t('monthlyExam.heroTitle')}</Text>
          <View style={styles.statsGrid}>
            {STATS.map((s) => (
              <View key={s.labelKey} style={styles.statBox}>
                <Text style={styles.statBoxLabel}>{t(s.labelKey)}</Text>
                <View style={styles.statBoxRow}>
                  <Ionicons name={s.icon} size={18} color={Colors.primaryFixed} />
                  <Text style={styles.statBoxValue}>{t(s.valueKey)}</Text>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Rules */}
        <View style={styles.rulesSection}>
          <View style={styles.rulesTitleRow}>
            <View style={styles.rulesAccent} />
            <Text style={styles.rulesTitle}>{t('monthlyExam.rulesTitle')}</Text>
          </View>
          <View style={styles.rulesCard}>
            {RULES.map((r, i) => (
              <View key={r.titleKey} style={[styles.ruleRow, i < RULES.length - 1 && styles.ruleRowBorder]}>
                <View style={[styles.ruleIcon, { backgroundColor: r.bg }]}>
                  <Ionicons name={r.icon} size={22} color={r.color} />
                </View>
                <View style={styles.ruleBody}>
                  <Text style={styles.ruleTitle}>{t(r.titleKey)}</Text>
                  <Text style={styles.ruleText}>{t(r.bodyKey)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.warning} />
          </View>
          <Text style={styles.warningTitle}>{t('monthlyExam.warningTitle')}</Text>
          <Text style={styles.warningText}>
            {t('monthlyExam.warningText')}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleJoin} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.joinBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.joinBtnText}>{t('monthlyExam.join')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.bottomFooter}>{t('monthlyExam.providedBy')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 24, gap: 20 },

  heroCard: {
    borderRadius: 24,
    padding: 28,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  heroGlow1: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroGlow2: {
    position: 'absolute',
    bottom: -16,
    left: -16,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 1.5 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 34, letterSpacing: -0.4, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  statBoxLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1.5 },
  statBoxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statBoxValue: { fontSize: 17, fontWeight: '700', color: '#fff' },

  rulesSection: { gap: 14 },
  rulesTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rulesAccent: { width: 4, height: 22, backgroundColor: Colors.primary, borderRadius: 2 },
  rulesTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  rulesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: 16,
    padding: 18,
  },
  ruleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  ruleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ruleBody: { flex: 1 },
  ruleTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  ruleText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  warningCard: {
    backgroundColor: Colors.warningLight,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  warningTitle: { fontSize: 17, fontWeight: '700', color: '#92400E' },
  warningText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500',
  },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 8,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 999,
    paddingVertical: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  joinBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  bottomFooter: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
