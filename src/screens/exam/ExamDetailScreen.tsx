import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useStartExam, useExamList } from '../../hooks/useExams';
import { useUserStore } from '../../store/user.store';
import { useTranslation, translate } from '../../i18n';
import type { AppLanguage } from '../../store/settings.store';

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamDetail>;
  route: RouteProp<ExamStackParamList, typeof Routes.ExamDetail>;
};

const DIFFICULTY_TKEY: Record<string, string> = {
  easy: 'examList.diff.easy', medium: 'examList.diff.medium', hard: 'examList.diff.hard',
};
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: Colors.tertiary, medium: Colors.primary, hard: Colors.danger,
};

// Sinif nömrəsi → Azərbaycan dilində sıra şəkilçili ad (yalnız az dili üçün)
const GRADE_LABELS: Record<number, string> = {
  1: '1-ci', 2: '2-ci', 3: '3-cü', 4: '4-cü', 5: '5-ci', 6: '6-cı',
  7: '7-ci', 8: '8-ci', 9: '9-cu', 10: '10-cu', 11: '11-ci',
};

// İmtahanın sinfini tapır: əvvəl `grade` sahəsi, sonra başlıqdan ("7-ci sinif").
function detectGrade(gradeRaw?: string | null, title?: string): number {
  const fromField = parseInt(String(gradeRaw ?? '').match(/\d+/)?.[0] ?? '', 10);
  if (fromField >= 1 && fromField <= 11) return fromField;
  // Başlıqda "7-ci sinif" / "6-cı sinif" formasını axtar
  const m = String(title ?? '').match(/(\d{1,2})\s*-?\s*(?:ci|cı|cu|cü)?\s*sin[fi]/i);
  const fromTitle = m ? parseInt(m[1], 10) : NaN;
  return fromTitle >= 1 && fromTitle <= 11 ? fromTitle : 0;
}

// İmtahanın sinfinə uyğun standart müddət qaydası (1-8 → 120, 9-11 → 180).
function buildDurationRule(lang: AppLanguage, gradeRaw?: string | null, title?: string) {
  const gradeNum = detectGrade(gradeRaw, title);
  const text =
    gradeNum >= 1 && gradeNum <= 11
      ? translate(lang, 'examDetail.durationGraded', {
          grade: lang === 'az' ? GRADE_LABELS[gradeNum] : String(gradeNum),
          min: gradeNum <= 8 ? 120 : 180,
        })
      : translate(lang, 'examDetail.durationGeneric');
  return { icon: 'time-outline' as keyof typeof Ionicons.glyphMap, titleKey: 'examDetail.durationTitle', text };
}

const EXAM_RULES: { icon: keyof typeof Ionicons.glyphMap; titleKey: string; textKey: string }[] = [
  { icon: 'sync-outline', titleKey: 'examDetail.rule1Title', textKey: 'examDetail.rule1Text' },
  { icon: 'bar-chart-outline', titleKey: 'examDetail.rule2Title', textKey: 'examDetail.rule2Text' },
  { icon: 'save-outline', titleKey: 'examDetail.rule3Title', textKey: 'examDetail.rule3Text' },
  { icon: 'create-outline', titleKey: 'examDetail.rule4Title', textKey: 'examDetail.rule4Text' },
];

export default function ExamDetailScreen({ navigation, route }: Props) {
  const { t, language } = useTranslation();
  const { examId, title } = route.params;
  const { mutate, isPending } = useStartExam();
  const { user } = useUserStore();
  const { data: exams = [] } = useExamList();
  const exam = exams.find((e) => e.id === examId);

  const initials = (user?.name ?? 'K')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const loadAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPending) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(loadAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
        ])
      ).start();
    } else {
      loadAnim.stopAnimation();
      loadAnim.setValue(0);
    }
  }, [isPending]);

  const onStart = () => {
    if (!examId) {
      Alert.alert(t('examDetail.errorTitle'), t('examDetail.noId'));
      return;
    }
    mutate(examId, {
      onSuccess: () => navigation.navigate(Routes.ExamSession),
      onError: (err: any) => {
        const msg = err?.code === 'ECONNABORTED'
          ? t('examDetail.timeout')
          : err?.response?.data?.message ?? err?.message ?? t('examDetail.startFailed');
        Alert.alert(t('examDetail.cantStart'), msg);
      },
    });
  };

  if (isPending) {
    const barLeft = loadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '55%'] as any });
    const barWidth = loadAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['30%', '42%', '30%'] as any });
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingBlobTL} />
        <View style={styles.loadingBlobBR} />
        <View style={styles.loadingCenter}>
          <View style={styles.loadingMascot}>
            <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.loadingMascotGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="school-outline" size={52} color="#fff" />
            </LinearGradient>
            <View style={styles.loadingFloatCard}>
              <Ionicons name="sparkles" size={22} color={Colors.primaryFixed} />
            </View>
            <View style={styles.loadingFloatCard2}>
              <Ionicons name="book-outline" size={22} color={Colors.tertiary} />
            </View>
          </View>
          <View style={styles.loadingTextBlock}>
            <Text style={styles.loadingTitle}>{t('examDetail.loadingTitle')}</Text>
            <Text style={styles.loadingSubtitle}>{t('examDetail.loadingSubtitle')}</Text>
          </View>
          <View style={styles.loadingBarTrack}>
            <Animated.View style={[styles.loadingBar, { left: barLeft, width: barWidth }]} />
          </View>
          <View style={styles.loadingStatusRow}>
            <View style={styles.loadingStatusCard}>
              <Ionicons name="server-outline" size={18} color={Colors.primaryFixed} />
              <Text style={styles.loadingStatusLabel}>{t('examDetail.loadingDb')}</Text>
              <Text style={styles.loadingStatusValue}>{t('examDetail.loadingDbVal')}</Text>
            </View>
            <View style={styles.loadingStatusCard}>
              <Ionicons name="bulb-outline" size={18} color={Colors.tertiaryContainer} />
              <Text style={styles.loadingStatusLabel}>{t('examDetail.loadingAnalysis')}</Text>
              <Text style={styles.loadingStatusValue}>{t('examDetail.loadingAnalysisVal')}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.loadingFooter}>
          {t('examDetail.loadingFooter')}
        </Text>
      </View>
    );
  }

  const diffKey = DIFFICULTY_TKEY[exam?.difficulty ?? ''];
  const diffLabel = diffKey ? t(diffKey) : (exam?.difficulty ?? t('examList.diff.medium'));
  const diffColor = DIFFICULTY_COLORS[exam?.difficulty ?? ''] ?? Colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.logoText}>Kimi.az</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate(Routes.ExamSettings, { examId, title: exam?.title ?? title })}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{exam?.title ?? title ?? t('examDetail.titleFallback')}</Text>
          <Text style={styles.heroSub}>
            {t('examDetail.heroSub')}
          </Text>
        </View>

        {/* Info cards grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="help-circle-outline" size={26} color={Colors.primary} />
            <Text style={styles.infoValue}>{exam?.questionCount ?? '?'}</Text>
            <Text style={styles.infoLabel}>{t('examDetail.qCount')}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={26} color={Colors.secondary} />
            <Text style={styles.infoValue}>{exam?.duration ?? '?'}</Text>
            <Text style={styles.infoLabel}>{t('examDetail.minutes')}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="bar-chart-outline" size={26} color={diffColor} />
            <Text style={[styles.infoValue, { color: diffColor }]}>{diffLabel}</Text>
            <Text style={styles.infoLabel}>{t('examDetail.difficulty')}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="book-outline" size={26} color={Colors.tertiary} />
            <Text style={styles.infoValue} numberOfLines={1}>{exam?.subject ?? '—'}</Text>
            <Text style={styles.infoLabel}>{t('examDetail.subject')}</Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIconRow}>
            <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
            <Text style={styles.insightTitle}>{t('examDetail.insightTitle')}</Text>
          </View>
          <Text style={styles.insightText}>
            {t('examDetail.insightText')}
          </Text>
        </View>

        {/* Test Qaydaları */}
        <View style={styles.rulesCard}>
          <View style={styles.rulesHeader}>
            <Ionicons name="warning-outline" size={22} color={Colors.secondary} />
            <Text style={styles.rulesTitle}>{t('examDetail.rulesTitle')}</Text>
          </View>
          {[buildDurationRule(language, (exam as any)?.grade, exam?.title ?? title), ...EXAM_RULES].map((r) => (
            <View key={r.titleKey} style={styles.ruleRow}>
              <View style={styles.ruleIconBubble}>
                <Ionicons name={r.icon} size={18} color={Colors.primary} />
              </View>
              <View style={styles.ruleTextWrap}>
                <Text style={styles.ruleTitle}>{t(r.titleKey)}</Text>
                <Text style={styles.ruleText}>{'text' in r ? r.text : t(r.textKey)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={onStart} disabled={isPending} activeOpacity={0.85} style={styles.startBtnOuter}>
          <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.startBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="rocket-outline" size={22} color="#fff" />
            <Text style={styles.startBtnText}>{t('examDetail.start')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 16 },

  hero: { marginBottom: 28 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.8, marginBottom: 8, lineHeight: 38 },
  heroSub: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  infoCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surfaceLowest, borderRadius: 20,
    padding: 20, alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  infoValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  infoLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  insightCard: {
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.primaryFixed + '30',
    backgroundColor: Colors.primaryLight,
  },
  insightIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  insightTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  insightText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  // Test Qaydaları
  rulesCard: {
    marginTop: 20, borderRadius: 20, padding: 20,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  rulesHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  rulesTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  ruleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  ruleIconBubble: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  ruleTextWrap: { flex: 1, gap: 2 },
  ruleTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  ruleText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  bottomBar: {
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 24,
    backgroundColor: 'rgba(245,247,249,0.9)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  startBtnOuter: { borderRadius: 999, overflow: 'hidden' },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 18, borderRadius: 999,
  },
  startBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },

  loadingScreen: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  loadingBlobTL: { position: 'absolute', top: '-10%' as any, left: '-10%' as any, width: 288, height: 288, borderRadius: 144, backgroundColor: Colors.primary, opacity: 0.08 },
  loadingBlobBR: { position: 'absolute', bottom: '-5%' as any, right: '-5%' as any, width: 384, height: 384, borderRadius: 192, backgroundColor: Colors.tertiary, opacity: 0.05 },
  loadingCenter: { alignItems: 'center', width: '100%', maxWidth: 360, gap: 32, paddingHorizontal: 24 },
  loadingMascot: { alignItems: 'center', justifyContent: 'center', width: 240, height: 240 },
  loadingMascotGrad: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 8 },
  loadingFloatCard: { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 12, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3, transform: [{ rotate: '12deg' }] },
  loadingFloatCard2: { position: 'absolute', bottom: 24, left: 0, backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 12, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3, transform: [{ rotate: '-12deg' }] },
  loadingTextBlock: { alignItems: 'center', gap: 8 },
  loadingTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  loadingSubtitle: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.7 },
  loadingBarTrack: { width: '100%', height: 8, backgroundColor: Colors.surfaceHigh, borderRadius: 999, overflow: 'hidden', position: 'relative' },
  loadingBar: { position: 'absolute', top: 0, height: '100%', borderRadius: 999, backgroundColor: Colors.primary },
  loadingStatusRow: { flexDirection: 'row', gap: 16, width: '100%' },
  loadingStatusCard: { flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 6, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2 },
  loadingStatusLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  loadingStatusValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  loadingFooter: { position: 'absolute', bottom: 48, fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
});
