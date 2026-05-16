import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type FaqIcon = 'wallet-outline' | 'school-outline' | 'checkmark-circle-outline';

interface FaqItem {
  icon: FaqIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
}

const FAQS: FaqItem[] = [
  {
    icon: 'wallet-outline',
    iconBg: Colors.primaryLight + '1A',
    iconColor: Colors.primary,
    title: 'Abunəliyi necə ləğv etmək olar?',
    desc: 'Profil ayarlarından bir toxunuşla abunəliyinizi dayandıra bilərsiniz.',
  },
  {
    icon: 'school-outline',
    iconBg: Colors.tertiaryContainer + '33',
    iconColor: Colors.tertiary,
    title: 'Müəllim seçimi necə edilir?',
    desc: 'Süni intellekt alqoritmimiz sizə ən uyğun müəllimi tapmağa kömək edəcək.',
  },
  {
    icon: 'checkmark-circle-outline',
    iconBg: Colors.secondaryContainer,
    iconColor: Colors.secondary,
    title: 'Sertifikatları haradan yükləyə bilərəm?',
    desc: 'Kursu tamamladıqdan sonra "Nailiyyətlər" bölməsindən PDF formatında yükləyin.',
  },
];

export default function HelpCenterScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım Mərkəzi</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>DƏSTƏK</Text>
            </View>
            <Text style={styles.heroTitle}>Necə kömək edə bilərik?</Text>
          </View>
          <View style={styles.heroIconBox}>
            <Ionicons name="help-circle-outline" size={48} color={Colors.primary} />
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
          <Ionicons name="search-outline" size={20} color={Colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sualınızı bura yazın..."
            placeholderTextColor={Colors.outlineVariant}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <View style={styles.faqHeader}>
            <Text style={styles.faqHeaderTitle}>Tez-tez verilən suallar</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.faqSeeAll}>Hamısı</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.faqList}>
            {FAQS.map((faq, idx) => (
              <TouchableOpacity key={idx} style={styles.faqCard} activeOpacity={0.85}>
                <View style={[styles.faqIconWrap, { backgroundColor: faq.iconBg }]}>
                  <Ionicons name={faq.icon} size={20} color={faq.iconColor} />
                </View>
                <View style={styles.faqContent}>
                  <Text style={styles.faqTitle}>{faq.title}</Text>
                  <Text style={styles.faqDesc}>{faq.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support grid */}
        <View style={styles.supportSection}>
          <Text style={styles.supportSectionTitle}>Dəstək ilə əlaqə</Text>
          <View style={styles.supportGrid}>
            <View style={styles.supportCard}>
              <View style={styles.supportIconCircle}>
                <Ionicons name="chatbubbles" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.supportCardTitle}>Canlı Çat</Text>
              <Text style={styles.supportCardSub}>2 dəqiqəyə cavab</Text>
            </View>
            <View style={styles.supportCard}>
              <View style={styles.supportIconCircle}>
                <Ionicons name="mail" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.supportCardTitle}>Email</Text>
              <Text style={styles.supportCardSub}>24 saat ərzində</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <LinearGradient colors={GRADIENT} style={styles.ctaCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.ctaGlow} />
            <View style={styles.ctaBugIcon}>
              <Ionicons name="bug-outline" size={48} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={styles.ctaTitle}>Problem bildir</Text>
            <Text style={styles.ctaSub}>Texniki çətinliklə qarşılaşırsınız? Bizə bildirin, dərhal həll edək.</Text>
            <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
              <Text style={styles.ctaBtnText}>Hesabat göndər</Text>
            </TouchableOpacity>
          </LinearGradient>
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 20, paddingBottom: 48 },

  hero: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 8 },
  heroContent: { flex: 1, gap: 8 },
  heroBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryLight + '33',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.2 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, lineHeight: 36, letterSpacing: -0.5 },
  heroIconBox: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 30, elevation: 1,
    borderWidth: 2, borderColor: 'transparent',
  },
  searchBarFocused: { borderColor: Colors.primaryFixed + '50', backgroundColor: '#fff' },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },

  faqSection: { gap: 14 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqHeaderTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  faqSeeAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  faqList: { gap: 12 },
  faqCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 20, elevation: 1,
  },
  faqIconWrap: { width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  faqContent: { flex: 1, gap: 4 },
  faqTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  faqDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  supportSection: { gap: 14 },
  supportSectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  supportGrid: { flexDirection: 'row', gap: 12 },
  supportCard: {
    flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 20,
    alignItems: 'center', gap: 10,
  },
  supportIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  supportCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  supportCardSub: { fontSize: 11, color: Colors.textMuted },

  ctaWrap: { borderRadius: 20, overflow: 'hidden' },
  ctaCard: { padding: 28, gap: 8, overflow: 'hidden', position: 'relative' },
  ctaGlow: {
    position: 'absolute', bottom: -40, right: -40,
    width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.10)',
  },
  ctaBugIcon: { position: 'absolute', top: 8, right: 16, opacity: 0.2 },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  ctaSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  ctaBtn: {
    marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#fff',
    borderRadius: 999, paddingHorizontal: 28, paddingVertical: 12,
  },
  ctaBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
