import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function VerificationSuccessScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('verificationSuccess.headerTitle')}</Text>
        <LinearGradient colors={GRADIENT} style={styles.headerAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.headerAvatarText}>K</Text>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroWrap}>
            <LinearGradient colors={GRADIENT} style={styles.heroCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="shield-checkmark" size={48} color="#fff" />
            </LinearGradient>
            <View style={styles.sparkBadge}>
              <Ionicons name="sparkles" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.heroTitle}>{t('verificationSuccess.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('verificationSuccess.heroSubPre')}
            <Text style={styles.heroHighlight}>{t('verificationSuccess.heroBadgeName')}</Text>
            {t('verificationSuccess.heroSubPost')}
          </Text>
        </View>

        {/* Profile preview card */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>{t('verificationSuccess.previewLabel')}</Text>
        </View>
        <View style={styles.previewCard}>
          <View style={styles.previewCardDecor} />
          <View style={styles.previewAvatarWrap}>
            <View style={styles.previewAvatar}>
              <Text style={styles.previewAvatarText}>LA</Text>
            </View>
            <LinearGradient colors={GRADIENT} style={styles.previewVerifiedBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.previewInfo}>
            <View style={styles.previewNameRow}>
              <Text style={styles.previewName}>Leyla Əliyeva</Text>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.previewSubject}>{t('verificationSuccess.previewSubject')}</Text>
            <View style={styles.previewStats}>
              <View style={styles.previewStatChip}>
                <Ionicons name="star" size={13} color="#f59e0b" />
                <Text style={styles.previewStatText}>5.0</Text>
              </View>
              <View style={styles.previewStatRow}>
                <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.previewStatMuted}>{t('verificationSuccess.previewStudents')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits grid */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>{t('verificationSuccess.benefitsLabel')}</Text>
        </View>
        <View style={styles.benefitsGrid}>
          <View style={styles.benefitCard}>
            <View style={styles.benefitIconWrap}>
              <Ionicons name="trending-up" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.benefitTitle}>{t('verificationSuccess.benefit1Title')}</Text>
              <Text style={styles.benefitSub}>{t('verificationSuccess.benefit1Sub')}</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIconWrap}>
              <Ionicons name="shield-outline" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.benefitTitle}>{t('verificationSuccess.benefit2Title')}</Text>
              <Text style={styles.benefitSub}>{t('verificationSuccess.benefit2Sub')}</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIconWrap}>
              <Ionicons name="ribbon" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.benefitTitle}>{t('verificationSuccess.benefit3Title')}</Text>
              <Text style={styles.benefitSub}>{t('verificationSuccess.benefit3Sub')}</Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.primaryBtnText}>{t('verificationSuccess.viewProfile')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('HomeMain' as never)} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>{t('verificationSuccess.backHome')}</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  scroll: { padding: 24, gap: 16, paddingBottom: 40 },

  heroSection: { alignItems: 'center', gap: 14 },
  heroWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 4,
  },
  sparkBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.gradientStart,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.background,
  },
  heroTitle: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 8 },
  heroHighlight: { fontWeight: '600', color: Colors.primary },

  sectionLabel: { marginTop: 4 },
  sectionLabelText: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.5 },

  previewCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
    overflow: 'hidden', position: 'relative',
  },
  previewCardDecor: {
    position: 'absolute', top: -32, right: -32,
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primary + '08',
  },
  previewAvatarWrap: { position: 'relative', flexShrink: 0 },
  previewAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    borderWidth: 3, borderColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  previewAvatarText: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  previewVerifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surfaceLowest,
  },
  previewInfo: { flex: 1, gap: 6 },
  previewNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  previewSubject: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  previewStats: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  previewStatChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  previewStatText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  previewStatRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewStatMuted: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },

  benefitsGrid: { gap: 12 },
  benefitCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
  },
  benefitIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  benefitTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  benefitSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  primaryBtn: {
    height: 60, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 25, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    height: 60, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
});
