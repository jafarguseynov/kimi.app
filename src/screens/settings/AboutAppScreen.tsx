import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type FeatureIcon = 'school-outline' | 'sparkles-outline' | 'bar-chart-outline' | 'people-outline';
type LinkIcon = 'document-text-outline' | 'shield-outline' | 'mail-outline' | 'star-outline';

interface Feature { icon: FeatureIcon; titleKey: string; descKey: string }
interface LinkItem { icon: LinkIcon; labelKey: string }

const FEATURES: Feature[] = [
  { icon: 'school-outline', titleKey: 'aboutApp.featCalcTitle', descKey: 'aboutApp.featCalcDesc' },
  { icon: 'sparkles-outline', titleKey: 'aboutApp.featAiTitle', descKey: 'aboutApp.featAiDesc' },
  { icon: 'bar-chart-outline', titleKey: 'aboutApp.featAnalyticsTitle', descKey: 'aboutApp.featAnalyticsDesc' },
  { icon: 'people-outline', titleKey: 'aboutApp.featCommunityTitle', descKey: 'aboutApp.featCommunityDesc' },
];

const LINKS: LinkItem[] = [
  { icon: 'document-text-outline', labelKey: 'aboutApp.linkTerms' },
  { icon: 'shield-outline', labelKey: 'aboutApp.linkPrivacy' },
  { icon: 'mail-outline', labelKey: 'aboutApp.linkContact' },
  { icon: 'star-outline', labelKey: 'aboutApp.linkRate' },
];

export default function AboutAppScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aboutApp.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroDecor} />
          <LinearGradient colors={GRADIENT} style={styles.heroIconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.heroLetter}>K</Text>
          </LinearGradient>
          <Text style={styles.heroAppName}>Kimi.az</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v1.0.0 (100)</Text>
          </View>
          <Text style={styles.heroTagline}>{t('aboutApp.tagline')}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('aboutApp.featuresTitle')}</Text>
          <View style={styles.listCard}>
            {FEATURES.map((f, idx) => (
              <View key={idx} style={[styles.listRow, idx === FEATURES.length - 1 && styles.listRowLast]}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon} size={20} color={Colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{t(f.titleKey)}</Text>
                  <Text style={styles.featureDesc}>{t(f.descKey)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('aboutApp.linksTitle')}</Text>
          <View style={styles.listCard}>
            {LINKS.map((link, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.listRow, idx === LINKS.length - 1 && styles.listRowLast]}
                activeOpacity={0.7}
              >
                <View style={styles.linkIconWrap}>
                  <Ionicons name={link.icon} size={18} color={Colors.primary} />
                </View>
                <Text style={styles.linkLabel}>{t(link.labelKey)}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Kimi.az • Premium Educational Intelligence</Text>
          <Text style={styles.footerCopy}>{t('aboutApp.copyright')}</Text>
        </View>
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 24, gap: 24, paddingBottom: 48 },

  heroCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 32,
    alignItems: 'center', gap: 10, position: 'relative', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  heroDecor: {
    position: 'absolute', top: -40, right: -40,
    width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.primaryLight,
  },
  heroIconBg: { width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  heroLetter: { fontSize: 52, fontWeight: '800', color: '#fff' },
  heroAppName: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  versionBadge: { backgroundColor: Colors.surfaceLow, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 },
  versionText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  heroTagline: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },

  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  listCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  listRowLast: { borderBottomWidth: 0 },

  featureIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, gap: 2 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  featureDesc: { fontSize: 12, color: Colors.textMuted },

  linkIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  footer: { alignItems: 'center', gap: 4, paddingTop: 8 },
  footerText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  footerCopy: { fontSize: 11, color: Colors.textLight },
});
