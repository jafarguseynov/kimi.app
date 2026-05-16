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
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type School = {
  id: string;
  name: string;
  location: string;
  students: string;
  languages: string;
  rating: number;
  iconBg: string;
  iconColor: string;
};

const SCHOOLS: School[] = [
  {
    id: '1', name: 'Bakı Müasir Məktəbi', location: 'Bakı, Nərimanov r.',
    students: '850+', languages: 'Az / Rus / İng', rating: 4.9,
    iconBg: Colors.primaryLight, iconColor: Colors.primary,
  },
  {
    id: '2', name: 'Gəncə Beynəlxalq Liseyi', location: 'Gəncə şəhəri',
    students: '600+', languages: 'Az / İng', rating: 4.7,
    iconBg: Colors.onTertiary, iconColor: Colors.tertiary,
  },
  {
    id: '3', name: 'Sumqayıt İxtisaslaşmış Liseyi', location: 'Sumqayıt şəhəri',
    students: '400+', languages: 'Az / Rus', rating: 4.5,
    iconBg: Colors.secondaryLight, iconColor: Colors.secondary,
  },
  {
    id: '4', name: 'Bakı Olimpiya Liseyi', location: 'Bakı, Səbail r.',
    students: '700+', languages: 'Az / İng', rating: 4.8,
    iconBg: Colors.primaryLight, iconColor: Colors.primary,
  },
];

export default function SchoolSearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [query, setQuery] = useState('');

  const filtered = query.trim().length >= 1
    ? SCHOOLS.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.location.toLowerCase().includes(query.toLowerCase()))
    : SCHOOLS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Ionicons name="search" size={22} color={Colors.primary} />
        <Text style={styles.headerTitle}>Məktəb Axtarışı</Text>
        <View style={styles.headerAvatar}>
          <Ionicons name="person-outline" size={18} color={Colors.primary} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="Məktəb axtar..."
              placeholderTextColor={Colors.outlineVariant}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={Colors.outlineVariant} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Motivation banner */}
        <LinearGradient colors={GRADIENT} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.bannerBlob} />
          <Text style={styles.bannerTitle}>Sənin üçün ən yaxşı{'\n'}təhsil ocaqlarını seçdik!</Text>
          <Text style={styles.bannerSub}>Ən yaxşı məktəbləri sənin üçün sıraladıq.{'\n'}Gələcəyin burada başlayır.</Text>
        </LinearGradient>

        {/* Results */}
        <Text style={styles.resultsLabel}>Tapılan Nəticələr ({filtered.length})</Text>

        {filtered.map((school) => (
          <TouchableOpacity
            key={school.id}
            style={styles.schoolCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.SchoolDetail, { schoolName: school.name })}
          >
            {/* Card top */}
            <View style={styles.cardTop}>
              <LinearGradient colors={GRADIENT} style={[styles.schoolIconBox, { opacity: 0.9 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="school-outline" size={22} color="#fff" />
              </LinearGradient>
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{school.rating}</Text>
              </View>
            </View>

            {/* Info */}
            <Text style={styles.schoolName}>{school.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.outline} />
              <Text style={styles.locationText}>{school.location}</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Şagird sayı</Text>
                <View style={styles.statValueRow}>
                  <Ionicons name="people-outline" size={14} color={Colors.primary} />
                  <Text style={styles.statValue}>{school.students}</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Tədris dili</Text>
                <Text style={styles.statValue}>{school.languages}</Text>
              </View>
              <TouchableOpacity style={styles.arrowBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={40} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>"{query}" üçün nəticə tapılmadı</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.primary },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primaryFixed + '55',
  },

  scroll: { padding: 20, gap: 16, paddingBottom: 48 },

  searchRow: { flexDirection: 'row', gap: 12 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18,
    paddingHorizontal: 16, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary, padding: 0 },
  filterBtn: {
    width: 52, height: 52, borderRadius: 18,
    backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },

  banner: {
    borderRadius: 20, padding: 24, overflow: 'hidden', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 4,
  },
  bannerBlob: {
    position: 'absolute', bottom: -32, right: -32,
    width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', lineHeight: 26 },
  bannerSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)', lineHeight: 20 },

  resultsLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.outline,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },

  schoolCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  schoolIconBox: {
    width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },

  schoolName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  statItem: { flex: 1, gap: 4 },
  statLabel: { fontSize: 9, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.8 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.borderLight, marginHorizontal: 12 },
  arrowBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },

  emptyBox: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
