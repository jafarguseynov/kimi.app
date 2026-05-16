import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const BENEFITS = [
  {
    icon: 'trending-up' as const,
    title: 'Tərəqqini izlə',
    sub: 'İmtahan ballarını və dərs aktivliyini anında görün.',
    bg: Colors.primaryLight,
    color: Colors.primary,
  },
  {
    icon: 'school-outline' as const,
    title: 'AI Analizlər',
    sub: 'Övladınızın zəif və güclü tərəfləri haqqında süni intellekt rəyi.',
    bg: Colors.successLight + '40',
    color: Colors.tertiary,
  },
  {
    icon: 'bulb-outline' as const,
    title: 'Xüsusi tövsiyələr',
    sub: 'İnkişaf üçün uyğun müəllim və dərs təklifləri.',
    bg: Colors.warningLight,
    color: Colors.warning,
  },
];

export default function ConnectChildScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesabların Qoşulması</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero visual */}
        <View style={styles.heroSection}>
          <View style={styles.heroVisual}>
            <View style={styles.glow} />
            <View style={styles.avatarGroup}>
              <View style={styles.parentBox}>
                <Ionicons name="hardware-chip-outline" size={60} color={Colors.primary} />
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              </View>
              <View style={styles.childBoxWrap}>
                <View style={styles.childBox}>
                  <Ionicons name="person-outline" size={44} color={Colors.textMuted} />
                </View>
              </View>
            </View>
            <View style={styles.linkBadge}>
              <Ionicons name="link-outline" size={14} color={Colors.tertiary} />
            </View>
          </View>
          <Text style={styles.heroTitle}>Övladınızın təhsilini bir yerdən idarə edin</Text>
          <Text style={styles.heroSubtitle}>
            Övladınızın hesabını öz profilinizə bağlayaraq onun tərəqqisini real vaxtda izləyə və AI tövsiyələrindən yararlana bilərsiniz.
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsList}>
          {BENEFITS.map((b, idx) => (
            <View key={idx} style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: b.bg }]}>
                <Ionicons name={b.icon} size={24} color={b.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitSub}>{b.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.EnterChildCode)}>
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="link-outline" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Hesabı bağla</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.textBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.textBtnText}>Daha sonra</Text>
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
  heroVisual: { width: '100%', height: 200, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  glow: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: Colors.primary + '08',
  },
  avatarGroup: { flexDirection: 'row', alignItems: 'flex-end' },
  parentBox: {
    width: 128, height: 128, borderRadius: 20,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 4,
    borderWidth: 1, borderColor: Colors.borderLight,
    position: 'relative', zIndex: 2,
  },
  verifiedBadge: {
    position: 'absolute', top: -10, right: -10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  childBoxWrap: { marginLeft: -24, transform: [{ translateY: 16 }], zIndex: 1 },
  childBox: {
    width: 96, height: 96, borderRadius: 16,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  linkBadge: {
    position: 'absolute', top: '20%', right: '22%',
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  heroTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },

  benefitsList: { gap: 12 },
  benefitCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 1,
  },
  benefitIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  benefitTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  benefitSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  primaryBtn: {
    height: 60, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  textBtn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  textBtnText: { fontSize: 15, fontWeight: '500', color: Colors.textMuted },
});
