import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const SUPPORT_EMAIL = 'support@kimi.az';

export default function SupportScreen() {
  const navigation = useNavigation<any>();

  const openChat = () => {
    const parent = navigation.getParent() as any;
    parent?.navigate('Chat', { screen: Routes.ChatList });
  };
  const openEmail = () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Kimi.az%20Dəstək`);
  const openReport = () => navigation.navigate(Routes.ReportProblem);
  const openFaq = () => navigation.navigate(Routes.HelpCenter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dəstək və Əlaqə</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconContainer}>
            <View style={styles.heroIconGlow} />
            <LinearGradient colors={GRADIENT} style={styles.heroIconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="headset-outline" size={64} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Sizə necə kömək edə bilərik?</Text>
          <Text style={styles.heroSub}>Kimi komandası dərslərinizdə və texniki məsələlərdə sizə dəstək olmağa hazırdır.</Text>
        </View>

        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={styles.dotRow}>
              <View style={styles.pingOuter} />
              <View style={styles.pingDot} />
              <Text style={styles.statusLabel}>Dəstək komandası onlayndır</Text>
            </View>
            <Text style={styles.statusSub}>
              Gözləmə müddəti: <Text style={styles.statusHighlight}>~10 dəqiqə</Text>
            </Text>
          </View>
          <View style={styles.statusIconWrap}>
            <Ionicons name="speedometer-outline" size={22} color={Colors.primary} />
          </View>
        </View>

        {/* Contact options */}
        <View style={styles.contactList}>
          <TouchableOpacity style={styles.contactCard} activeOpacity={0.85} onPress={openChat}>
            <LinearGradient colors={GRADIENT} style={styles.contactIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Canlı Çat</Text>
              <Text style={styles.contactSub}>2 dəqiqəyə cavab</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} activeOpacity={0.85} onPress={openEmail}>
            <View style={[styles.contactIconBox, { backgroundColor: Colors.surfaceLow }]}>
              <Ionicons name="mail-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Dəstəyi</Text>
              <Text style={styles.contactSub}>24 saat ərzində</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.outlineVariant} />
          </TouchableOpacity>
        </View>

        {/* Problem report */}
        <View style={styles.problemSection}>
          <Text style={styles.problemSectionTitle}>Texniki məsələlər</Text>
          <View style={styles.problemCard}>
            <View style={styles.problemIconWrap}>
              <Ionicons name="warning" size={22} color={Colors.danger} />
            </View>
            <Text style={styles.problemTitle}>Xəta və ya Problem Bildir</Text>
            <Text style={styles.problemDesc}>Tətbiqdə qarşılaşdığınız texniki problemləri bizə bildirin.</Text>
            <TouchableOpacity style={styles.problemBtn} activeOpacity={0.85} onPress={openReport}>
              <Text style={styles.problemBtnText}>Problem Bildir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ link */}
        <TouchableOpacity style={styles.faqLink} activeOpacity={0.7} onPress={openFaq}>
          <Text style={styles.faqLinkText}>Tez-tez verilən suallar (FAQ)</Text>
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 20, paddingBottom: 48 },

  hero: { alignItems: 'center', paddingVertical: 16, gap: 12 },
  heroIconContainer: { position: 'relative', width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  heroIconGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primary + '10',
  },
  heroIconBg: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280 },

  statusCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  statusLeft: { gap: 6 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pingOuter: {
    position: 'absolute', width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.tertiaryContainer + 'BF',
  },
  pingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.tertiary, zIndex: 1 },
  statusLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  statusSub: { fontSize: 13, color: Colors.textMuted, marginLeft: 20 },
  statusHighlight: { color: Colors.primary, fontWeight: '600' },
  statusIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight + '33', alignItems: 'center', justifyContent: 'center',
  },

  contactList: { gap: 12 },
  contactCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 20, elevation: 1,
  },
  contactIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  contactInfo: { flex: 1, gap: 2 },
  contactTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  contactSub: { fontSize: 12, color: Colors.textMuted },

  problemSection: { gap: 12 },
  problemSectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: 4 },
  problemCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8,
  },
  problemIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  problemTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  problemDesc: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  problemBtn: {
    marginTop: 8, backgroundColor: Colors.textPrimary, borderRadius: 999,
    paddingHorizontal: 32, paddingVertical: 12,
  },
  problemBtnText: { fontSize: 14, fontWeight: '700', color: Colors.surfaceLowest },

  faqLink: { alignItems: 'center', paddingVertical: 8 },
  faqLinkText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
