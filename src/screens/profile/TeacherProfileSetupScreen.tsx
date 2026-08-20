import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTeacherProfileCompletion } from '../../hooks/useTeacherProfileCompletion';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const BENEFITS = [
  { icon: 'trending-up' as const, textKey: 'teacherProfileSetup.benefit1' },
  { icon: 'people' as const, textKey: 'teacherProfileSetup.benefit2' },
  { icon: 'gift' as const, textKey: 'teacherProfileSetup.benefit3' },
];

export default function TeacherProfileSetupScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { pct, state, nextStep } = useTeacherProfileCompletion();

  // §18 — onboarding yalnız MƏCBURİ sahələri addım-addım göstərir.
  // Sıra serverdən gəlir, ona görə admin sahə əlavə edəndə bura da dəyişir.
  const steps = (state?.fields ?? []).filter((f) => f.required);
  const doneCount = steps.filter((f) => f.done).length;

  /** Müəllimi düşünməyə məcbur etmə — ilk çatışmayan sahəyə apar (§7). */
  const goEdit = () => {
    navigation.goBack();
    (navigation.getParent() as any)?.navigate(Routes.Profile, {
      screen: Routes.EditProfile,
      params: nextStep ? { focusField: nextStep.key } : undefined,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <LinearGradient colors={GRADIENT} style={styles.heroIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="sparkles" size={34} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>{t('teacherProfileSetup.title')}</Text>
        <Text style={styles.sub}>
          {t('teacherProfileSetup.sub')}
        </Text>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>
              {t('teacherProfileSetup.progressLabel')}
              {steps.length > 0 && <Text style={styles.stepCounter}>  {doneCount} / {steps.length}</Text>}
            </Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
          <View style={styles.checklist}>
            {steps.map((it) => (
              <View key={it.key} style={styles.checkRow}>
                <Ionicons
                  name={it.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={it.done ? Colors.tertiary : Colors.textMuted}
                />
                <Text style={[styles.checkText, it.done && styles.checkTextDone]}>{it.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={b.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.benefitText}>{t(b.textKey)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity activeOpacity={0.9} onPress={goEdit}>
            <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.primaryBtnText}>{t('teacherProfileSetup.completeNow')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnText}>{t('teacherProfileSetup.later')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 24, gap: 18, flexGrow: 1, justifyContent: 'center' },

  heroWrap: { alignItems: 'center' },
  heroIcon: {
    width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 6,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  sub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 320, alignSelf: 'center' },

  progressCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 18, gap: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  stepCounter: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  progressPct: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.surfaceHighest, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  checklist: { gap: 10, marginTop: 2 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkText: { fontSize: 14, color: Colors.textSecondary },
  checkTextDone: { color: Colors.textPrimary, textDecorationLine: 'line-through' },

  benefits: { gap: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  benefitText: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },

  actions: { gap: 12, marginTop: 4 },
  primaryBtn: {
    height: 56, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  secondaryBtn: { height: 50, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceHigh },
  secondaryBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
