import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const SUPPORT_EMAIL = 'destek@kimi.az';

/**
 * MƏXFİLİK SİYASƏTİ.
 *
 * Qeydiyyat ekranından da açılır (istifadəçi razılıq verməzdən əvvəl oxuya
 * bilsin), Tənzimləmələr → Tətbiq haqqında bölməsindən də.
 *
 * ⚠️ Mətn i18n-dədir (az/ru/en) — hüquqi redaktə OTA ilə göndərilə bilir.
 * Sənəd dəyişəndə `TERMS_VERSION` (backend) də artırılmalıdır.
 */
export default function PrivacyPolicyScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const collectBullets = t('privacyPolicy.collectBullets').split('|');
  const useBullets = t('privacyPolicy.useBullets').split('|');
  const rightsBullets = t('privacyPolicy.rightsBullets').split('|');

  const ROLES: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
    { icon: 'school-outline', title: t('privacyPolicy.roleStudentTitle'), desc: t('privacyPolicy.roleStudentDesc') },
    { icon: 'people-outline', title: t('privacyPolicy.roleParentTitle'), desc: t('privacyPolicy.roleParentDesc') },
    { icon: 'person-circle-outline', title: t('privacyPolicy.roleTeacherTitle'), desc: t('privacyPolicy.roleTeacherDesc') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacyPolicy.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroDate}>{t('privacyPolicy.heroDate')}</Text>
          <Text style={styles.heroTitle}>{t('privacyPolicy.heroTitle')}</Text>
          <LinearGradient colors={GRADIENT} style={styles.heroDivider} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
          <Text style={styles.heroIntro}>{t('privacyPolicy.intro')}</Text>
        </View>

        {/* Toplanan məlumatlar */}
        <Section icon="folder-open-outline" title={t('privacyPolicy.collectTitle')}>
          <Text style={styles.cardPara}>{t('privacyPolicy.collectPara')}</Text>
          <Bullets items={collectBullets} />
        </Section>

        {/* İstifadə məqsədi */}
        <Section icon="bulb-outline" title={t('privacyPolicy.useTitle')}>
          <Bullets items={useBullets} />
        </Section>

        {/* Rollara görə */}
        <Section icon="layers-outline" title={t('privacyPolicy.roleTitle')}>
          <View style={{ gap: 12 }}>
            {ROLES.map((r) => (
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
        </Section>

        {/* Paylaşım */}
        <Section icon="share-social-outline" title={t('privacyPolicy.shareTitle')}>
          <Text style={styles.cardPara}>{t('privacyPolicy.sharePara')}</Text>
          <View style={styles.noteBox}>
            <Ionicons name="close-circle" size={16} color="#B91C1C" />
            <Text style={styles.noteText}>{t('privacyPolicy.shareNever')}</Text>
          </View>
        </Section>

        {/* Təhlükəsizlik və saxlanma */}
        <Section icon="lock-closed-outline" title={t('privacyPolicy.securityTitle')}>
          <Text style={styles.cardPara}>{t('privacyPolicy.securityPara')}</Text>
        </Section>

        {/* Uşaqların məxfiliyi */}
        <Section icon="happy-outline" title={t('privacyPolicy.childrenTitle')}>
          <Text style={styles.cardPara}>{t('privacyPolicy.childrenPara')}</Text>
        </Section>

        {/* Hüquqlar */}
        <Section icon="shield-checkmark-outline" title={t('privacyPolicy.rightsTitle')}>
          <Bullets items={rightsBullets} />
        </Section>

        {/* Əlaqə */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>{t('privacyPolicy.contactTitle')}</Text>
          <Text style={styles.ctaSub}>{t('privacyPolicy.contactSub')}</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {})}
          >
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Ionicons name="mail-outline" size={17} color="#fff" />
              <Text style={styles.ctaBtnText}>{SUPPORT_EMAIL}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  icon, title, children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={styles.sectionIconWrap}>
          <Ionicons name={icon} size={18} color={Colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <View style={styles.bulletList}>
      {items.map((text, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },

  scroll: { padding: 20, paddingBottom: 48, gap: 20 },

  hero: { gap: 8 },
  heroDate: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: Colors.textMuted },
  heroTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5, lineHeight: 30 },
  heroDivider: { width: 56, height: 4, borderRadius: 2 },
  heroIntro: { fontSize: 13.5, color: Colors.textSecondary, lineHeight: 21, marginTop: 4 },

  section: { gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIconWrap: {
    width: 34, height: 34, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight,
  },
  sectionTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  sectionCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16, gap: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },

  cardPara: { fontSize: 13.5, color: Colors.textSecondary, lineHeight: 21 },

  bulletList: { gap: 8 },
  bulletRow: { flexDirection: 'row', gap: 8 },
  bulletDot: { fontSize: 15, color: Colors.primary, lineHeight: 21 },
  bulletText: { flex: 1, fontSize: 13.5, color: Colors.textSecondary, lineHeight: 21 },

  roleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  roleIcon: {
    width: 32, height: 32, borderRadius: 10, marginTop: 1,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight,
  },
  roleTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  roleDesc: { fontSize: 12.5, color: Colors.textSecondary, lineHeight: 19, marginTop: 2 },

  noteBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12,
  },
  noteText: { flex: 1, fontSize: 12.5, color: '#991B1B', lineHeight: 19, fontWeight: '600' },

  ctaCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18, gap: 8,
    borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center',
  },
  ctaTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  ctaSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 46, borderRadius: 999, paddingHorizontal: 24, marginTop: 6,
  },
  ctaBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
