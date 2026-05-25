import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

type Tab = 'all' | 'edu' | 'exam' | 'tips';
type Kind = 'featured' | 'card' | 'mini';
type Category = 'Təhsil' | 'Məsləhətlər' | 'İmtahan' | 'Xəbərdarlıq';

interface Article {
  id: string;
  category: Category;
  title: string;
  excerpt: string;
  dateLabel: string;
  views: number;
  kind: Kind;
  imageUrl?: string;
  tabKey: Tab;
}

const ARTICLES: Article[] = [
  {
    id: '1', category: 'Təhsil', tabKey: 'edu', kind: 'featured',
    title: 'Dövlət İmtahan Mərkəzi yeni qaydaları elan etdi',
    excerpt: 'Gələn tədris ili üçün qəbul imtahanlarında tətbiq olunacaq əsas dəyişikliklər və abituriyentlər üçün vacib məqamlar.',
    dateLabel: '22 Oktyabr, 2024', views: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=70',
  },
  {
    id: '2', category: 'Məsləhətlər', tabKey: 'tips', kind: 'card',
    title: 'İmtahan həyəcanını necə dəf etməli?',
    excerpt: 'Psixoloqların hazırladığı 5 praktiki addımla imtahan zamanı stresinizi minimuma endirin və fokuslanın.',
    dateLabel: '20 Oktyabr, 2024', views: 856,
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=70',
  },
  {
    id: '3', category: 'Xəbərdarlıq', tabKey: 'exam', kind: 'mini',
    title: 'Magistratura üzrə qeydiyyat müddəti uzadıldı',
    excerpt: 'Sənəd qəbulu üçün son tarix oktyabrın 30-na qədər dəyişdirildi. Gecikmədən qeydiyyatdan keçin.',
    dateLabel: '19 Oktyabr', views: 432,
  },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Hamısı' },
  { id: 'edu', label: 'Təhsil' },
  { id: 'exam', label: 'İmtahan' },
  { id: 'tips', label: 'Məsləhətlər' },
];

const CAT_TONE: Record<Category, { bg: string; fg: string }> = {
  'Təhsil':       { bg: Colors.primary,   fg: '#fff' },
  'Məsləhətlər':  { bg: Colors.tertiary,  fg: '#fff' },
  'İmtahan':      { bg: '#7C3AED',        fg: '#fff' },
  'Xəbərdarlıq':  { bg: Colors.primary + '33', fg: Colors.primary },
};

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

function formatViews(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function NewsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<Tab>('all');

  const filtered = useMemo(() => {
    if (tab === 'all') return ARTICLES;
    return ARTICLES.filter((a) => a.tabKey === tab);
  }, [tab]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.brandIcon}>
            <Text style={{ fontSize: 18 }}>🤖</Text>
          </View>
          <Text style={styles.headerTitle}>Xəbərlər və Yeniliklər</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pair-tab switcher: Fəaliyyət / Xəbərlər */}
        <View style={pairTab.row}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.replace(Routes.LiveActivity)}
            style={pairTab.btn}
          >
            <Text style={pairTab.text}>Fəaliyyət</Text>
          </TouchableOpacity>
          <View style={[pairTab.btn, pairTab.btnActive]}>
            <Text style={[pairTab.text, pairTab.textActive]}>Xəbərlər</Text>
          </View>
        </View>

        {/* Hero welcome */}
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>Xoş gəldiniz!</Text>
          <Text style={styles.heroTitle}>Təhsil dünyasından ən son xəbərlər</Text>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsInner}>
          <View style={styles.tabsWrap}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <TouchableOpacity
                  key={t.id} activeOpacity={0.85}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setTab(t.id)}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Articles */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={42} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Bu kateqoriyada xəbər yoxdur</Text>
          </View>
        ) : (
          <View style={{ gap: 32 }}>
            {filtered.map((a) => {
              const tone = CAT_TONE[a.category];
              if (a.kind === 'mini') {
                return (
                  <View key={a.id} style={styles.miniCard}>
                    <View style={styles.miniTopRow}>
                      <View style={[styles.catChip, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.catChipText, { color: tone.fg }]}>{a.category}</Text>
                      </View>
                      <Text style={styles.miniDate}>{a.dateLabel}</Text>
                    </View>
                    <Text style={styles.miniTitle}>{a.title}</Text>
                    <Text style={styles.miniExcerpt}>{a.excerpt}</Text>
                    <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
                      <Text style={styles.linkText}>Ətraflı məlumat</Text>
                      <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                );
              }

              const isFeatured = a.kind === 'featured';
              return (
                <View key={a.id} style={styles.card}>
                  {a.imageUrl ? (
                    <View style={styles.imageWrap}>
                      <Image source={{ uri: a.imageUrl }} style={styles.image} resizeMode="cover" />
                      <View style={[styles.catChipFloating, { backgroundColor: tone.bg + 'E6' }]}>
                        <Text style={[styles.catChipText, { color: tone.fg }]}>{a.category}</Text>
                      </View>
                    </View>
                  ) : null}
                  <View style={styles.cardBody}>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.metaText}>{a.dateLabel}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="eye-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.metaText}>{formatViews(a.views)}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardTitle}>{a.title}</Text>
                    <Text style={styles.cardExcerpt} numberOfLines={2}>{a.excerpt}</Text>
                    {isFeatured ? (
                      <TouchableOpacity activeOpacity={0.85}>
                        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
                          <Text style={styles.primaryBtnText}>Oxu</Text>
                          <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity activeOpacity={0.85} style={styles.secondaryBtn}>
                        <Text style={styles.secondaryBtnText}>Oxu</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerBackBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  brandIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.primary, letterSpacing: -0.2, flex: 1 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  /* Hero */
  heroCard: {
    backgroundColor: Colors.primary + '14',
    padding: 24, borderRadius: 16,
    alignItems: 'center',
  },
  heroKicker: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3, lineHeight: 28 },

  /* Tabs */
  tabsInner: { paddingVertical: 2 },
  tabsWrap: {
    flexDirection: 'row', gap: 8,
    backgroundColor: Colors.surfaceLow, padding: 4, borderRadius: 999,
  },
  tab: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999 },
  tabActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  tabText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { fontWeight: '700', color: Colors.primary },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },

  /* Card */
  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  imageWrap: {
    aspectRatio: 16 / 10, margin: 8, borderRadius: 12, overflow: 'hidden',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
    alignSelf: 'flex-start',
  },
  catChipFloating: {
    position: 'absolute', top: 16, left: 16,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
  },
  catChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },

  cardBody: { padding: 24, paddingTop: 8, gap: 12 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, lineHeight: 26 },
  cardExcerpt: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 999, marginTop: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 4,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 12,
    backgroundColor: Colors.surfaceHigh,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },

  /* Mini */
  miniCard: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16, padding: 24, gap: 12,
  },
  miniTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniDate: { fontSize: 11, color: Colors.textSecondary },
  miniTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  miniExcerpt: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  linkText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});

const pairTab = StyleSheet.create({
  row: {
    flexDirection: 'row', gap: 4,
    backgroundColor: Colors.surfaceLow,
    padding: 4, borderRadius: 999,
  },
  btn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999 },
  btnActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  text: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  textActive: { fontWeight: '800', color: Colors.primary },
});
