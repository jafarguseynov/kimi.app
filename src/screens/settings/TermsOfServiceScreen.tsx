import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function TermsOfServiceScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const BULLETS = t('termsOfService.bullets').split('|');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('termsOfService.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroDate}>{t('termsOfService.heroDate')}</Text>
          <Text style={styles.heroTitle}>{t('termsOfService.heroTitle')}</Text>
          <LinearGradient colors={GRADIENT} style={styles.heroDivider} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIconWrap, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>{t('termsOfService.sec1Title')}</Text>
          </View>
          <View style={[styles.sectionCard, styles.shadow]}>
            <Text style={styles.cardPara}>
              {t('termsOfService.sec1Para')}
            </Text>
            <View style={styles.bulletList}>
              {BULLETS.map((text, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIconWrap, { backgroundColor: Colors.secondaryContainer }]}>
              <Ionicons name="person-outline" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.sectionTitle}>{t('termsOfService.sec2Title')}</Text>
          </View>
          <View style={[styles.sectionCard, { backgroundColor: Colors.surfaceLow }]}>
            <Text style={styles.cardPara}>
              {t('termsOfService.sec2Para')}
            </Text>
            <View style={styles.twoColGrid}>
              <View style={[styles.gridCard, styles.shadow]}>
                <Text style={styles.gridCardTitle}>{t('termsOfService.sec2Card1Title')}</Text>
                <Text style={styles.gridCardDesc}>{t('termsOfService.sec2Card1Desc')}</Text>
              </View>
              <View style={[styles.gridCard, styles.shadow]}>
                <Text style={styles.gridCardTitle}>{t('termsOfService.sec2Card2Title')}</Text>
                <Text style={styles.gridCardDesc}>{t('termsOfService.sec2Card2Desc')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rollara görə qaydalar — şagird / valideyn / müəllim */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIconWrap, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="layers-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>{t('termsOfService.rolesTitle')}</Text>
          </View>
          <View style={[styles.sectionCard, styles.shadow]}>
            {[
              { icon: 'school-outline' as const, title: t('termsOfService.roleStudentTitle'), desc: t('termsOfService.roleStudentDesc') },
              { icon: 'people-outline' as const, title: t('termsOfService.roleParentTitle'), desc: t('termsOfService.roleParentDesc') },
              { icon: 'person-circle-outline' as const, title: t('termsOfService.roleTeacherTitle'), desc: t('termsOfService.roleTeacherDesc') },
            ].map((r) => (
              <View key={r.title} style={styles.roleRow}>
                <View style={styles.roleIcon}>
                  <Ionicons name={r.icon} size={17} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>{r.title}</Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIconWrap, { backgroundColor: Colors.tertiaryContainer + '40' }]}>
              <Ionicons name="hammer-outline" size={18} color={Colors.tertiary} />
            </View>
            <Text style={styles.sectionTitle}>{t('termsOfService.sec3Title')}</Text>
          </View>
          <View style={[styles.sectionCard, styles.shadow, styles.accentCard]}>
            <View style={styles.accentStripe} />
            <Text style={styles.italicText}>
              {t('termsOfService.sec3Quote')}
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                {t('termsOfService.sec3Info')}
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <LinearGradient colors={GRADIENT} style={styles.ctaCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.ctaGlow} />
            <Text style={styles.ctaTitle}>{t('termsOfService.ctaTitle')}</Text>
            <Text style={styles.ctaSub}>{t('termsOfService.ctaSub')}</Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.85}
              onPress={() => Linking.openURL('mailto:destek@kimi.az').catch(() => {})}
            >
              <Text style={styles.ctaBtnText}>{t('termsOfService.ctaBtn')}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  roleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 12 },
  roleIcon: {
    width: 32, height: 32, borderRadius: 10, marginTop: 1,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight,
  },
  roleTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  roleDesc: { fontSize: 12.5, color: Colors.textSecondary, lineHeight: 19, marginTop: 2 },

  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 24, gap: 24, paddingBottom: 48 },

  hero: { gap: 12 },
  heroDate: { fontSize: 11, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.2 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, lineHeight: 36, letterSpacing: -0.5 },
  heroDivider: { width: 80, height: 4, borderRadius: 99 },

  section: { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, flex: 1 },

  sectionCard: { backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24, gap: 16 },
  shadow: {
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },

  cardPara: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24 },

  bulletList: { gap: 12 },
  bulletRow: { flexDirection: 'row', gap: 10 },
  bulletDot: { fontSize: 15, fontWeight: '700', color: Colors.primary, marginTop: 1 },
  bulletText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  twoColGrid: { flexDirection: 'row', gap: 12 },
  gridCard: { flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16, gap: 6 },
  gridCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  gridCardDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  accentCard: { overflow: 'hidden' },
  accentStripe: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, backgroundColor: Colors.primary },
  italicText: { fontSize: 15, fontStyle: 'italic', color: Colors.textSecondary, lineHeight: 24, paddingLeft: 8 },
  infoBox: { backgroundColor: Colors.surfaceSecondary, borderRadius: 12, padding: 14 },
  infoBoxText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  ctaWrap: { borderRadius: 20, overflow: 'hidden' },
  ctaCard: { padding: 28, gap: 8, overflow: 'hidden', position: 'relative' },
  ctaGlow: {
    position: 'absolute', bottom: -40, right: -40,
    width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.10)',
  },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  ctaSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
  ctaBtn: {
    marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#fff',
    borderRadius: 999, paddingHorizontal: 28, paddingVertical: 12,
  },
  ctaBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
