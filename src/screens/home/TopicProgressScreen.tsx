import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type StepState = 'done' | 'active' | 'pending';
interface Step { id: string; titleKey: string; subtitleKey?: string; state: StepState; }

const STEPS: Step[] = [
  { id: '1', titleKey: 'topicProgress.s1', state: 'done' },
  { id: '2', titleKey: 'topicProgress.s2', state: 'done' },
  { id: '3', titleKey: 'topicProgress.s3', state: 'active',  subtitleKey: 'topicProgress.s3sub' },
  { id: '4', titleKey: 'topicProgress.s4', state: 'pending', subtitleKey: 'topicProgress.s4sub' },
];

export default function TopicProgressScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const topic = route.params?.topic ?? 'Faizlər';
  const pct = 60;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('topicProgress.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Topic header */}
        <View style={styles.topicCard}>
          <View style={styles.topicTop}>
            <Text style={styles.topicTitle}>{topic}</Text>
            <View style={styles.ringWrap}>
              <View style={styles.ringBg} />
              <View style={[
                styles.ringFg,
                {
                  borderTopColor: Colors.primary,
                  borderRightColor: pct > 25 ? Colors.primary : 'transparent',
                  borderBottomColor: pct > 50 ? Colors.primary : 'transparent',
                  borderLeftColor: pct > 75 ? Colors.primary : 'transparent',
                  transform: [{ rotate: '-45deg' }],
                },
              ]} />
              <Text style={styles.ringText}>{pct}%</Text>
            </View>
          </View>
          <Text style={styles.topicSub}>{t('topicProgress.learned', { n: pct })}</Text>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <View style={styles.timelineBar} />
          {STEPS.map((s, i) => (
            <View key={s.id} style={[styles.step, i === STEPS.length - 1 && { marginBottom: 0 }]}>
              {s.state === 'done' ? (
                <View style={[styles.stepDot, { backgroundColor: Colors.primary }]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              ) : s.state === 'active' ? (
                <View style={[styles.stepDot, styles.stepDotActive]}>
                  <Ionicons name="sync" size={16} color={Colors.primary} />
                </View>
              ) : (
                <View style={[styles.stepDot, { backgroundColor: Colors.surfaceHigh }]}>
                  <Ionicons name="hourglass-outline" size={16} color={Colors.textSecondary} />
                </View>
              )}
              <View style={{ flex: 1, paddingTop: 6 }}>
                <Text style={[
                  styles.stepTitle,
                  s.state === 'active' && { color: Colors.primary, fontWeight: '700' },
                  s.state === 'pending' && { color: Colors.textSecondary, fontWeight: '500' },
                ]}>
                  {t(s.titleKey)}
                </Text>
                {s.subtitleKey && <Text style={styles.stepSub}>{t(s.subtitleKey)}</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* AI insight */}
        <View style={styles.aiCard}>
          <View style={styles.aiBlob} pointerEvents="none" />
          <View style={styles.aiIcon}>
            <Ionicons name="hardware-chip" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiKicker}>{t('topicProgress.kimiSays')}</Text>
            <Text style={styles.aiText}>{t('topicProgress.aiText')}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-done" size={16} color={Colors.tertiary} />
            </View>
            <View>
              <Text style={styles.statLabel}>{t('topicProgress.correct')}</Text>
              <Text style={styles.statValue}>18</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="close" size={16} color={Colors.danger} />
            </View>
            <View>
              <Text style={styles.statLabel}>{t('topicProgress.wrong')}</Text>
              <Text style={styles.statValue}>4</Text>
            </View>
          </View>
          <View style={[styles.statCard, { flexBasis: '100%' }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="time-outline" size={16} color={Colors.secondary ?? Colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.statLabel}>{t('topicProgress.timeSpent')}</Text>
              <Text style={styles.statValue}>{t('topicProgress.timeValue')}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <Text style={styles.ctaText}>{t('topicProgress.continue')}</Text>
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
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  topicCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  topicTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  topicTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  topicSub: { fontSize: 13, color: Colors.textSecondary },

  ringWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  ringBg: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 5, borderColor: Colors.surfaceLow },
  ringFg: {
    position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 5,
    borderTopColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: 'transparent', borderLeftColor: 'transparent',
  },
  ringText: { fontSize: 13, fontWeight: '800', color: Colors.primary },

  /* Timeline */
  timelineCard: { backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 24, position: 'relative' },
  timelineBar: { position: 'absolute', left: 42, top: 36, bottom: 36, width: 2, backgroundColor: Colors.surfaceHigh },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 24, zIndex: 1 },
  stepDot: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  stepDotActive: {
    backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.primary,
  },
  stepTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  stepSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },

  /* AI */
  aiCard: {
    flexDirection: 'row', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24,
    position: 'relative', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  aiBlob: { position: 'absolute', top: -16, right: -16, width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.secondary ? Colors.secondary + '22' : '#CCD4EE' + '33' },
  aiIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '22', alignItems: 'center', justifyContent: 'center' },
  aiKicker: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  aiText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },

  /* Stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flexBasis: '47%', flexGrow: 1,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },
  statIconBox: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  statValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, paddingBottom: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  cta: {
    paddingVertical: 16, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 6,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
