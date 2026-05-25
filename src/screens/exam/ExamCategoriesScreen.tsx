import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamCategories>;

interface Category {
  key: string;
  title: string;
  desc: string;
  emoji: string;
  bg: string;
}

const CATEGORIES: Category[] = [
  { key: 'middle',        title: 'Orta Məktəb',   desc: '1–11-ci sinif imtahanları',      emoji: '📘',     bg: '#EFF6FF' },
  { key: 'abituriyent',   title: 'Abituriyent',   desc: 'DİM bakalavriat I–V qrup',       emoji: '🎓',     bg: '#FFFBEB' },
  { key: 'magistr',       title: 'Magistratura',  desc: 'Magistr hazırlıq',               emoji: '📚',     bg: '#F5F3FF' },
  { key: 'miq',           title: 'MIQ',           desc: 'Müəllimlərin işə qəbulu',        emoji: '👨‍🏫', bg: '#ECFDF5' },
  { key: 'rezidentura',   title: 'Rezidentura',   desc: 'Tibb bakalavrı sonrası',         emoji: '🩺',     bg: '#FEE2E2' },
  { key: 'doctorate',     title: 'Doktorantura',  desc: 'PhD / Fəlsəfə doktoru',          emoji: '🎓',     bg: '#E0E7FF' },
  { key: 'govservice',    title: 'Dövlət qulluğu',desc: 'Test + müsahibə sertifikatı',    emoji: '🏛️',     bg: '#F3F4F6' },
  { key: 'ability',       title: 'Qabiliyyət',    desc: 'İncəsənət / idman / hərbi',      emoji: '🎨',     bg: '#FDF4FF' },
  { key: 'college',       title: 'Kollec',        desc: 'Orta ixtisas (9 il bazada)',     emoji: '🏫',     bg: '#FEF3C7' },
  { key: 'international', title: 'Beynəlxalq',    desc: 'TOEFL · SAT · GRE · Cambridge',  emoji: '🌐',     bg: '#DBEAFE' },
  { key: 'professional',  title: 'Peşəkar sert.', desc: 'Mühasib · Sığorta · Hüquq',      emoji: '🏅',     bg: '#FEF9C3' },
  { key: 'preschool',     title: 'Məktəbəqədər',  desc: 'Kiçik yaşlı uşaqlar',            emoji: '🧒',     bg: '#FFF7ED' },
  { key: 'mock',          title: 'Sınaqlar',      desc: 'Aylıq · həftəlik · DİM sınağı',  emoji: '📊',     bg: '#FCE7F3' },
];

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function ExamCategoriesScreen({ navigation }: Props) {
  const openCategory = (cat: Category) => {
    navigation.navigate(Routes.CategorySubcategories, { categoryKey: cat.key, categoryTitle: cat.title });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Text style={{ fontSize: 18 }}>🤖</Text>
            </View>
            <Text style={styles.headerTitle}>Kateqoriyalar</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8} onPress={() => (navigation.getParent() as any)?.navigate('Home', { screen: Routes.Notifications })}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero intro */}
        <View style={styles.heroIntro}>
          <Text style={styles.heroKicker}>İmtahan Mərkəzi</Text>
          <Text style={styles.heroTitle}>
            Gələcəyini{'\n'}
            <Text style={{ color: Colors.primary }}>bizimlə planla.</Text>
          </Text>
        </View>

        {/* Bento grid */}
        <View style={styles.grid}>
          {CATEGORIES.map((c) => (
            <View key={c.key} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: c.bg }]}>
                <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
              </View>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardDesc}>{c.desc}</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => openCategory(c)}>
                <LinearGradient
                  colors={GRADIENT}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.cardCta}
                >
                  <Text style={styles.cardCtaText}>Daxil ol</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Featured */}
        <View style={styles.featured}>
          <View style={styles.featuredGlow} pointerEvents="none" />
          <View style={styles.featuredLiveRow}>
            <View style={styles.livePulse} />
            <Text style={styles.featuredKicker}>YENİ KURSLAR</Text>
          </View>
          <Text style={styles.featuredTitle}>Robotika Dünyası</Text>
          <Text style={styles.featuredDesc}>AI və Robotika haqqında öyrənməyə elə indi başla.</Text>
          <TouchableOpacity style={styles.featuredBtn} activeOpacity={0.85}>
            <Text style={styles.featuredBtnText}>Ətraflı</Text>
          </TouchableOpacity>
          <View style={styles.featuredRobotIcon} pointerEvents="none">
            <Ionicons name="hardware-chip" size={96} color={Colors.primary} />
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBackBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  /* Hero */
  heroIntro: { marginBottom: -8 },
  heroKicker: {
    fontSize: 12, fontWeight: '700', color: Colors.primary,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, opacity: 0.85,
  },
  heroTitle: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, lineHeight: 34, letterSpacing: -0.5 },

  /* Grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    flex: 1, minWidth: '46%', maxWidth: '48%',
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 2,
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, lineHeight: 22, marginBottom: 6 },
  cardDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16, fontWeight: '500', marginBottom: 22 },
  cardCta: {
    paddingVertical: 10, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 3,
  },
  cardCtaText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  /* Featured */
  featured: {
    backgroundColor: Colors.primary + '14',
    borderRadius: 20, padding: 24, overflow: 'hidden',
    position: 'relative',
  },
  featuredGlow: {
    position: 'absolute', right: -48, bottom: -48,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: Colors.primary + '1A',
  },
  featuredLiveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  featuredKicker: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5 },
  featuredTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary, marginBottom: 6, letterSpacing: -0.3 },
  featuredDesc: { fontSize: 13, color: Colors.textSecondary, maxWidth: 200, marginBottom: 18 },
  featuredBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 1,
  },
  featuredBtnText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  featuredRobotIcon: {
    position: 'absolute', right: -12, top: 24,
    opacity: 0.35,
  },
});
