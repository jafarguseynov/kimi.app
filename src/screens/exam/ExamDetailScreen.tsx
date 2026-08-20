import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useStartExam, useExam } from '../../hooks/useExams';
import { useTranslation } from '../../i18n';
import Paywall from '../../components/Paywall';
import { asPaywallError, PaywallError } from '../../api/monetization.api';

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamDetail>;
  route: RouteProp<ExamStackParamList, typeof Routes.ExamDetail>;
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ExamDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { examId, title } = route.params;
  const { mutate, isPending } = useStartExam();
  // Rəqəmlər birbaşa imtahanın özündən gəlir (əvvəl siyahıdan axtarılırdı və
  // imtahan siyahıda olmadıqda ekranda «?» görünürdü).
  const { data: exam } = useExam(examId);

  const questionCount = exam?.questionCount ?? route.params.questionCount ?? null;
  const duration = exam?.duration ?? route.params.duration ?? null;
  const displayTitle = exam?.title ?? title ?? t('examDetail.titleFallback');

  const [rulesOpen, setRulesOpen] = useState(false);
  const [paywall, setPaywall] = useState<PaywallError | null>(null);
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

  const toggleRules = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRulesOpen((v) => !v);
  };

  const onStart = () => {
    if (!examId) {
      Alert.alert(t('examDetail.errorTitle'), t('examDetail.noId'));
      return;
    }
    mutate(examId, {
      onSuccess: () => navigation.navigate(Routes.ExamSession),
      onError: (err: any) => {
        // Pulsuz limit dolubsa server 403 (LIMIT_REACHED) qaytarır → paywall
        const pw = asPaywallError(err);
        if (pw) { setPaywall(pw); return; }
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

  // Qaydalar — ilk iki bənd imtahanın REAL parametrindən qurulur
  const rules: string[] = [
    questionCount ? t('examDetail.ruleQuestions', { n: questionCount }) : '',
    duration ? t('examDetail.ruleDuration', { n: duration }) : '',
    t('examDetail.ruleChange'),
    t('examDetail.ruleResult'),
    t('examDetail.ruleTimer'),
  ].filter(Boolean);

  const summary = [
    questionCount ? t('catExams.questions', { n: questionCount }) : null,
    duration ? t('catExams.minutes', { n: duration }) : null,
  ].filter(Boolean).join(' · ');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.logoText}>Kimi.az</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>{t('examDetail.readyKicker')}</Text>
          <Text style={styles.heroTitle}>{displayTitle}</Text>
          <Text style={styles.heroSub}>{t('examDetail.heroSub')}</Text>
          {!!summary && (
            <View style={styles.summaryPill}>
              <Ionicons name="documents-outline" size={14} color={Colors.primary} />
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          )}
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIconRow}>
            <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
            <Text style={styles.insightTitle}>{t('examDetail.insightTitle')}</Text>
          </View>
          <Text style={styles.insightText}>{t('examDetail.insightText')}</Text>
        </View>

        {/* İmtahan qaydaları — açılıb-bağlanan */}
        <View style={styles.rulesCard}>
          <TouchableOpacity style={styles.rulesHeader} activeOpacity={0.75} onPress={toggleRules}>
            <Ionicons name="clipboard-outline" size={20} color={Colors.primary} />
            <Text style={styles.rulesTitle}>{t('examDetail.rulesTitle')}</Text>
            <Ionicons name={rulesOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          {rulesOpen && (
            <View style={styles.rulesBody}>
              {rules.map((r) => (
                <View key={r} style={styles.ruleRow}>
                  <View style={styles.ruleDot} />
                  <Text style={styles.ruleText}>{r}</Text>
                </View>
              ))}
            </View>
          )}
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
      <Paywall visible={!!paywall} error={paywall} onClose={() => setPaywall(null)} />
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

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },

  hero: { marginBottom: 22, gap: 6 },
  heroKicker: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1.2, textTransform: 'uppercase' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6, lineHeight: 33 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  summaryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 4,
  },
  summaryText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  insightCard: {
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: Colors.primaryFixed + '30',
    backgroundColor: Colors.primaryLight,
  },
  insightIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  insightTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  insightText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  rulesCard: {
    marginTop: 16, borderRadius: 16, paddingHorizontal: 18,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  rulesHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 18 },
  rulesTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  rulesBody: { paddingBottom: 18, gap: 12 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 7 },
  ruleText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

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
