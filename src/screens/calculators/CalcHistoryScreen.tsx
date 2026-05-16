import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

type EntryIcon = 'bar-chart-outline' | 'school-outline' | 'document-text-outline';

interface HistoryEntry {
  category: string;
  title: string;
  date: string;
  icon: EntryIcon;
  scoreLabel: string;
  score: string;
}

const ENTRIES: HistoryEntry[] = [
  {
    category: 'Yarımillik qiymətləndirmə',
    title: 'KSQ üzrə hesablamalar',
    date: '24 May, 2024',
    icon: 'bar-chart-outline',
    scoreLabel: 'Ortalama göstərici',
    score: '88.5 Bal',
  },
  {
    category: 'DİM Kalkulyatoru',
    title: 'Blok imtahanı (III Qrup)',
    date: '12 May, 2024',
    icon: 'school-outline',
    scoreLabel: 'Ümumi nəticə',
    score: '450 Bal',
  },
  {
    category: 'İllik qiymətləndirmə',
    title: 'Riyaziyyat fənni üzrə',
    date: '05 May, 2024',
    icon: 'document-text-outline',
    scoreLabel: 'Yekun qiymət',
    score: '92 Bal',
  },
];

export default function CalcHistoryScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesablama Tarixçəsi</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome card */}
        <View style={styles.welcomeCard}>
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroTitle}>Bütün hesablamaların </Text>
            <View style={styles.birBadge}>
              <Text style={styles.birBadgeText}>bir</Text>
            </View>
            <Text style={styles.heroTitle}> yerdədir!</Text>
          </View>
          <Text style={styles.heroSub}>Nəticələrini izlə və irəliləyişini gör.</Text>
        </View>

        {/* History entries */}
        <View style={styles.entriesList}>
          {ENTRIES.map((entry, idx) => (
            <TouchableOpacity key={idx} style={styles.entryCard} activeOpacity={0.85}>
              <View style={styles.entryTop}>
                <View style={styles.entryTopLeft}>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{entry.category}</Text>
                  </View>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                </View>
                <Text style={styles.entryDate}>{entry.date}</Text>
              </View>
              <View style={styles.entryBottom}>
                <View style={styles.entryBottomLeft}>
                  <View style={styles.entryIconWrap}>
                    <Ionicons name={entry.icon} size={16} color={Colors.primary} />
                  </View>
                  <Text style={styles.entryBottomLabel}>{entry.scoreLabel}</Text>
                </View>
                <Text style={styles.entryScore}>{entry.score}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Load more */}
        <TouchableOpacity style={styles.loadMoreBtn} activeOpacity={0.8}>
          <Text style={styles.loadMoreText}>Daha çox göstər</Text>
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

  welcomeCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  heroTitleRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center',
  },
  heroTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  birBadge: {
    backgroundColor: Colors.primary, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  birBadgeText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  heroSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  entriesList: { gap: 12 },
  entryCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 1,
    gap: 16,
  },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryTopLeft: { gap: 8, flex: 1 },
  categoryChip: {
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start',
  },
  categoryChipText: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  entryTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  entryDate: { fontSize: 11, fontWeight: '500', color: Colors.textMuted, opacity: 0.7, flexShrink: 0, marginLeft: 8 },

  entryBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  entryBottomLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  entryIconWrap: { opacity: 0.4 },
  entryBottomLabel: { fontSize: 12, fontWeight: '500', color: Colors.textMuted },
  entryScore: { fontSize: 24, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },

  loadMoreBtn: {
    backgroundColor: Colors.surfaceHigh, borderRadius: 999,
    height: 48, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, alignSelf: 'center',
  },
  loadMoreText: { fontSize: 14, fontWeight: '500', color: Colors.textMuted },
});
