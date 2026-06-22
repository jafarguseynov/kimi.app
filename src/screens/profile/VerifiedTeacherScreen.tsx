import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface Benefit { id: string; titleKey: string; descKey: string; }
const BENEFITS: Benefit[] = [
  { id: '1', titleKey: 'verifiedTeacher.benefit1Title', descKey: 'verifiedTeacher.benefit1Desc' },
  { id: '2', titleKey: 'verifiedTeacher.benefit2Title', descKey: 'verifiedTeacher.benefit2Desc' },
  { id: '3', titleKey: 'verifiedTeacher.benefit3Title', descKey: 'verifiedTeacher.benefit3Desc' },
];

interface Req { id: string; icon: keyof typeof Ionicons.glyphMap; titleKey: string; current: number; total: number; metPct: number; isPct?: boolean; met?: boolean; }
const REQS: Req[] = [
  { id: '1', icon: 'chatbubbles',  titleKey: 'verifiedTeacher.req1Title',        current: 15, total: 20, metPct: 75 },
  { id: '2', icon: 'thumbs-up',    titleKey: 'verifiedTeacher.req2Title', current: 92, total: 100, metPct: 92, isPct: true, met: true },
];

const ALL_MET = REQS.every((r) => r.met);

export default function VerifiedTeacherScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('verifiedTeacher.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBadge}>
            <Ionicons name="checkmark-done" size={42} color="#fff" />
          </LinearGradient>
          <Text style={styles.heroTitle}>{t('verifiedTeacher.heroTitle')}</Text>
          <Text style={styles.heroSub}>{t('verifiedTeacher.heroSub')}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.card}>
          <View style={styles.cardBlob} pointerEvents="none" />
          <Text style={styles.cardTitle}>{t('verifiedTeacher.benefitsTitle')}</Text>
          <View style={{ gap: 16, marginTop: 16 }}>
            {BENEFITS.map((b) => (
              <View key={b.id} style={styles.benefitRow}>
                <View style={styles.benefitDot}>
                  <Ionicons name="checkmark" size={14} color={Colors.tertiary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitTitle}>{t(b.titleKey)}</Text>
                  <Text style={styles.benefitDesc}>{t(b.descKey)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Requirements */}
        <View style={[styles.card, { backgroundColor: Colors.surfaceLow }]}>
          <Text style={styles.cardTitle}>{t('verifiedTeacher.reqsTitle')}</Text>
          <View style={{ gap: 20, marginTop: 16 }}>
            {REQS.map((r) => (
              <View key={r.id} style={{ gap: 8 }}>
                <View style={styles.reqHead}>
                  <View style={styles.reqLabelRow}>
                    <Ionicons name={r.icon} size={18} color={Colors.primary} />
                    <Text style={styles.reqLabel}>{t(r.titleKey)}</Text>
                  </View>
                  <Text style={[styles.reqValue, r.met && { color: Colors.tertiary }]}>
                    {r.isPct ? `${r.current}%` : `${r.current}/${r.total}`}
                  </Text>
                </View>
                <View style={styles.reqTrack}>
                  <LinearGradient
                    colors={r.met ? [Colors.tertiary, Colors.tertiaryContainer] : GRADIENT}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.reqFill, { width: `${r.metPct}%` as any }]}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={16} color={Colors.textSecondary} style={{ marginTop: 1 }} />
            <Text style={styles.infoText}>
              {t('verifiedTeacher.infoText')}
            </Text>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.9} disabled={!ALL_MET} style={{ width: '100%' }}>
          {ALL_MET ? (
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBtn}>
              <Text style={styles.ctaText}>{t('verifiedTeacher.apply')}</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.ctaBtn, styles.ctaBtnDisabled]}>
              <Text style={[styles.ctaText, { color: Colors.textSecondary }]}>{t('verifiedTeacher.apply')}</Text>
            </View>
          )}
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
    backgroundColor: 'rgba(245,247,249,0.85)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceLow },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 24, gap: 28, paddingBottom: 24 },

  hero: { alignItems: 'center', paddingTop: 16, gap: 16 },
  heroBadge: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 6,
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 20 },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24,
    overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 22, elevation: 2,
  },
  cardBlob: {
    position: 'absolute', top: -32, right: -32,
    width: 128, height: 128, borderRadius: 64, backgroundColor: Colors.primary + '12',
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },

  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  benefitDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.tertiaryContainer + '4D',
    alignItems: 'center', justifyContent: 'center',
  },
  benefitTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  benefitDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  reqHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reqLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 8 },
  reqLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  reqValue: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  reqTrack: { height: 8, backgroundColor: Colors.surfaceHigh, borderRadius: 999, overflow: 'hidden' },
  reqFill: { height: '100%', borderRadius: 999 },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: 20, backgroundColor: 'rgba(245,247,249,0.95)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 8,
  },
  ctaBtn: {
    paddingVertical: 16, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 4,
  },
  ctaBtnDisabled: { backgroundColor: Colors.surfaceHighest, shadowOpacity: 0 },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
