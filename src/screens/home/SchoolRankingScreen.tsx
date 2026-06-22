import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type School = { rank: number; name: string; city: string; score: number };

const SCHOOLS: School[] = [
  { rank: 1, name: 'Bakı Müasir Təhsil Kompleksi', city: 'Bakı şəhəri', score: 94.2 },
  { rank: 2, name: 'Kaspi Liseyi', city: 'Xətai r.', score: 91.8 },
  { rank: 3, name: '216 saylı məktəb', city: 'Sabunçu r.', score: 89.5 },
  { rank: 4, name: '160 saylı Bakı Fizika-Riyaziyyat Liseyi', city: 'Binəqədi r.', score: 87.1 },
  { rank: 5, name: 'Azərbaycan Dövlət İqtisad Universiteti Liseyi', city: 'Nəsimi r.', score: 85.6 },
  { rank: 6, name: '23 saylı orta məktəb', city: 'Sumqayıt', score: 83.9 },
  { rank: 7, name: 'Gəncə Humanitar Liseyi', city: 'Gəncə', score: 82.4 },
];

const MEDAL_COLORS: Record<number, { icon: string; iconColor: string; numColor: string }> = {
  1: { icon: 'amber', iconColor: '#D97706', numColor: '#78350F' },
  2: { icon: 'silver', iconColor: '#94A3B8', numColor: '#1E293B' },
  3: { icon: 'bronze', iconColor: '#CD7F32', numColor: '#fff' },
};

const TAB_KEYS = ['schoolRanking.tabTop', 'schoolRanking.tabActive', 'schoolRanking.tabHighScore'];

export default function SchoolRankingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? SCHOOLS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : SCHOOLS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="menu" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('schoolRanking.headerTitle')}</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="search" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('schoolRanking.searchPlaceholder')}
            placeholderTextColor={Colors.outline}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabsRow}>
            {TAB_KEYS.map((tabKey, i) => (
              <TouchableOpacity
                key={tabKey}
                style={[styles.tab, activeTab === i && styles.tabActive]}
                onPress={() => setActiveTab(i)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t(tabKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Motivation card */}
        <LinearGradient colors={GRADIENT} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.bannerTitle}>{t('schoolRanking.bannerTitle')}</Text>
          <Text style={styles.bannerSub}>{t('schoolRanking.bannerSub')}</Text>
        </LinearGradient>

        {/* Ranking list */}
        <View style={styles.list}>
          {filtered.map((school) => {
            const medal = MEDAL_COLORS[school.rank];
            return (
              <View key={school.rank} style={styles.schoolCard}>
                {/* Medal / rank */}
                {medal ? (
                  <View style={styles.medalWrap}>
                    <Ionicons
                      name="ribbon"
                      size={36}
                      color={medal.iconColor}
                    />
                    <Text style={[styles.medalNum, { color: medal.numColor }]}>{school.rank}</Text>
                  </View>
                ) : (
                  <View style={styles.rankNumWrap}>
                    <Text style={styles.rankNum}>{school.rank}</Text>
                  </View>
                )}

                <View style={styles.schoolInfo}>
                  <Text style={styles.schoolName} numberOfLines={2}>{school.name}</Text>
                  <View style={styles.cityRow}>
                    <Ionicons name="location-outline" size={13} color={Colors.outline} />
                    <Text style={styles.cityText}>{school.city}</Text>
                  </View>
                </View>

                <View style={styles.scoreCol}>
                  <Text style={styles.scoreValue}>{school.score}</Text>
                  <Text style={styles.scoreLabel}>{t('schoolRanking.scoreLabel')}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 16 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, height: 56,
    paddingHorizontal: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },

  tabsRow: {
    flexDirection: 'row', gap: 6,
    backgroundColor: Colors.surfaceLow, borderRadius: 999, padding: 6,
  },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
  tabActive: { backgroundColor: Colors.surfaceLowest, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { fontWeight: '600', color: Colors.primary },

  banner: {
    borderRadius: 18, padding: 22, gap: 6, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 4,
  },
  bannerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', textAlign: 'center' },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 19 },

  list: { gap: 12 },

  schoolCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
  },
  medalWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  medalNum: {
    position: 'absolute',
    fontSize: 13, fontWeight: '800',
    top: 10, left: 0, right: 0, textAlign: 'center',
  },
  rankNumWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  rankNum: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },

  schoolInfo: { flex: 1 },
  schoolName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, lineHeight: 20 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  cityText: { fontSize: 11, color: Colors.textSecondary },

  scoreCol: { alignItems: 'flex-end' },
  scoreValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  scoreLabel: { fontSize: 9, fontWeight: '600', color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
});
