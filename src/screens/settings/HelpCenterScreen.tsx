import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * TEZ-TEZ VERİLƏN SUALLAR (FAQ)
 *
 * Sual/cavab mətnləri i18n-dədir (`helpCenter.q<id>Q` / `q<id>A`).
 * Hər bölmə rola bağlıdır: istifadəçi «Ümumi» + öz rolunun bölməsini görür.
 * Yeni sual əlavə etmək üçün buraya `id` + ikon, i18n-ə isə iki sətir yazmaq kifayətdir.
 */
type Section = {
  key: string;
  titleKey: string;
  roles: ('student' | 'teacher' | 'parent')[] | 'all';
  items: { id: string; icon: keyof typeof Ionicons.glyphMap }[];
};

const SECTIONS: Section[] = [
  {
    key: 'basics',
    titleKey: 'helpCenter.secBasics',
    roles: 'all',
    items: [
      { id: 'Profile', icon: 'person-circle-outline' },
      { id: 'Lang', icon: 'globe-outline' },
      { id: 'Password', icon: 'lock-closed-outline' },
      { id: 'Notif', icon: 'notifications-outline' },
      { id: 'Block', icon: 'ban-outline' },
      { id: 'Report', icon: 'bug-outline' },
    ],
  },
  {
    key: 'student',
    titleKey: 'helpCenter.secStudent',
    roles: ['student'],
    items: [
      { id: 'Exam', icon: 'document-text-outline' },
      { id: 'Result', icon: 'ribbon-outline' },
      { id: 'Market', icon: 'help-buoy-outline' },
      { id: 'FindTeacher', icon: 'search-outline' },
      { id: 'Request', icon: 'megaphone-outline' },
      { id: 'JoinClass', icon: 'key-outline' },
      { id: 'Duel', icon: 'flash-outline' },
      { id: 'Spin', icon: 'disc-outline' },
      { id: 'Xp', icon: 'trophy-outline' },
    ],
  },
  {
    key: 'teacher',
    titleKey: 'helpCenter.secTeacher',
    roles: ['teacher'],
    items: [
      { id: 'TRequests', icon: 'megaphone-outline' },
      { id: 'TStudents', icon: 'people-outline' },
      { id: 'TLevel', icon: 'trending-up-outline' },
      { id: 'TStats', icon: 'stats-chart-outline' },
      { id: 'TPreview', icon: 'eye-outline' },
    ],
  },
  {
    key: 'parent',
    titleKey: 'helpCenter.secParent',
    roles: ['parent'],
    items: [
      { id: 'PLink', icon: 'link-outline' },
      { id: 'PWatch', icon: 'analytics-outline' },
    ],
  },
  {
    key: 'money',
    titleKey: 'helpCenter.secMoney',
    roles: 'all',
    items: [
      { id: 'Premium', icon: 'diamond-outline' },
      { id: 'Referral', icon: 'gift-outline' },
      { id: 'Promo', icon: 'pricetag-outline' },
    ],
  },
];

export default function HelpCenterScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const role = (user?.role ?? 'student') as 'student' | 'teacher' | 'parent';

  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  // Rola uyğun bölmələr + axtarış süzgəci (həm sual, həm cavab mətnində axtarır).
  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SECTIONS.filter((s) => s.roles === 'all' || s.roles.includes(role))
      .map((s) => ({
        ...s,
        items: s.items.filter((it) => {
          if (!q) return true;
          const question = t(`helpCenter.q${it.id}Q`).toLowerCase();
          const answer = t(`helpCenter.q${it.id}A`).toLowerCase();
          return question.includes(q) || answer.includes(q);
        }),
      }))
      .filter((s) => s.items.length > 0);
  }, [search, role, t]);

  const openReport = () => navigation.navigate(Routes.ReportProblem);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('helpCenter.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{t('helpCenter.heroBadge')}</Text>
            </View>
            <Text style={styles.heroTitle}>{t('helpCenter.heroTitle')}</Text>
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
            placeholder={t('helpCenter.searchPlaceholder')}
            placeholderTextColor={Colors.outlineVariant}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {sections.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={38} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('helpCenter.noResultTitle')}</Text>
            <Text style={styles.emptySub}>{t('helpCenter.noResultSub')}</Text>
          </View>
        )}

        {sections.map((section) => (
          <View key={section.key} style={styles.faqSection}>
            <Text style={styles.faqHeaderTitle}>{t(section.titleKey)}</Text>
            <View style={styles.faqList}>
              {section.items.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.faqCard, isOpen && styles.faqCardOpen]}
                    activeOpacity={0.85}
                    onPress={() => toggle(item.id)}
                  >
                    <View style={styles.faqRow}>
                      <View style={[styles.faqIconWrap, isOpen && styles.faqIconWrapOpen]}>
                        <Ionicons name={item.icon} size={18} color={isOpen ? '#fff' : Colors.primary} />
                      </View>
                      <Text style={styles.faqTitle}>{t(`helpCenter.q${item.id}Q`)}</Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={Colors.textMuted}
                      />
                    </View>
                    {isOpen && <Text style={styles.faqDesc}>{t(`helpCenter.q${item.id}A`)}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Cavab tapılmadısa — birbaşa dəstəyə */}
        <View style={styles.ctaWrap}>
          <LinearGradient colors={GRADIENT} style={styles.ctaCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.ctaGlow} />
            <View style={styles.ctaBugIcon}>
              <Ionicons name="bug-outline" size={48} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={styles.ctaTitle}>{t('helpCenter.reportTitle')}</Text>
            <Text style={styles.ctaSub}>{t('helpCenter.reportSub')}</Text>
            <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85} onPress={openReport}>
              <Text style={styles.ctaBtnText}>{t('helpCenter.reportBtn')}</Text>
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
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, lineHeight: 34, letterSpacing: -0.5 },
  heroIconBox: {
    width: 76, height: 76, borderRadius: 20,
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

  empty: { alignItems: 'center', gap: 6, paddingVertical: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 6 },
  emptySub: { fontSize: 12.5, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 18 },

  faqSection: { gap: 12 },
  faqHeaderTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  faqList: { gap: 10 },
  faqCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 20, elevation: 1,
  },
  faqCardOpen: { backgroundColor: '#fff' },
  faqRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  faqIconWrap: {
    width: 36, height: 36, borderRadius: 12, flexShrink: 0,
    backgroundColor: Colors.primaryLight + '33', alignItems: 'center', justifyContent: 'center',
  },
  faqIconWrapOpen: { backgroundColor: Colors.primary },
  faqTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.textPrimary, lineHeight: 19 },
  faqDesc: { fontSize: 13.5, color: Colors.textSecondary, lineHeight: 21, marginTop: 10, marginLeft: 48 },

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
