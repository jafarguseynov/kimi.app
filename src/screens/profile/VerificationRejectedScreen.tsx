import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const TIPS = [
  { icon: 'eye-outline', textKey: 'verificationRejected.tip1' },
  { icon: 'sunny-outline', textKey: 'verificationRejected.tip2' },
  { icon: 'document-outline', textKey: 'verificationRejected.tip3' },
];

export default function VerificationRejectedScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('verificationRejected.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroWrap}>
            <View style={styles.heroAura} />
            <LinearGradient colors={[Colors.surfaceLow, Colors.surfaceHigh]} style={styles.heroBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="hardware-chip-outline" size={80} color={Colors.textMuted} />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>{t('verificationRejected.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('verificationRejected.heroSubtitle')}
          </Text>
        </View>

        {/* Rejection reason card */}
        <View style={styles.reasonCard}>
          <View style={styles.reasonIconWrap}>
            <Ionicons name="alert-circle" size={24} color={Colors.danger} />
          </View>
          <View style={styles.reasonBody}>
            <Text style={styles.reasonLabel}>{t('verificationRejected.reasonLabel')}</Text>
            <Text style={styles.reasonText}>
              {t('verificationRejected.reasonText')}
            </Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>{t('verificationRejected.tipsTitle')}</Text>
          <View style={styles.tipsList}>
            {TIPS.map((tip, idx) => (
              <View key={idx} style={styles.tipItem}>
                <View style={styles.tipIconCircle}>
                  <Ionicons name={tip.icon as any} size={18} color={Colors.primary} />
                </View>
                <Text style={styles.tipText}>{t(tip.textKey)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action buttons */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.VerificationDocuments)}>
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.primaryBtnText}>{t('verificationRejected.reupload')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.textBtn} activeOpacity={0.7}>
          <Text style={styles.textBtnText}>{t('verificationRejected.contactSupport')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 24, gap: 20, paddingBottom: 40 },

  heroSection: { alignItems: 'center', gap: 16 },
  heroWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroAura: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primaryFixed + '10',
  },
  heroBox: {
    width: 192, height: 192, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, paddingHorizontal: 8 },

  reasonCard: {
    backgroundColor: Colors.danger + '0D', borderRadius: 20, padding: 20,
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
  },
  reasonIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.danger + '1A',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  reasonBody: { flex: 1, gap: 4 },
  reasonLabel: { fontSize: 11, fontWeight: '700', color: Colors.danger, textTransform: 'uppercase', letterSpacing: 0.8 },
  reasonText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },

  tipsCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 20, gap: 18,
  },
  tipsTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  tipsList: { gap: 16 },
  tipItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  tipIconCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  tipText: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  primaryBtn: {
    height: 60, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  textBtn: { height: 56, alignItems: 'center', justifyContent: 'center' },
  textBtnText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
});
