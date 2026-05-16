import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExamList } from '../../hooks/useExams';
import { Exam } from '../../types/exam.types';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamList> };

const FILTER_CHIPS = ['Hamısı', 'Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Digər'];

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  easy: { label: 'Asan', color: Colors.tertiary },
  medium: { label: 'Orta', color: Colors.primary },
  hard: { label: 'Çətin', color: Colors.danger },
};

const KNOWN_SUBJECTS = ['riyaziyyat', 'math', 'azərbaycan', 'azerbaijani', 'ingilis', 'english'];

const matchesFilter = (subject: string, filter: string): boolean => {
  const s = subject.toLowerCase();
  if (filter === 'Hamısı') return true;
  if (filter === 'Riyaziyyat') return s.includes('riyaz') || s.includes('math');
  if (filter === 'Azərbaycan dili') return s.includes('azərb') || s === 'az';
  if (filter === 'İngilis dili') return s.includes('ingi') || s.includes('english') || s === 'en';
  if (filter === 'Digər') return !KNOWN_SUBJECTS.some((k) => s.includes(k));
  return true;
};

function diffInfo(exam: Exam) {
  return DIFFICULTY_MAP[exam.difficulty] ?? { label: exam.difficulty, color: Colors.textSecondary };
}

export default function ExamListScreen({ navigation }: Props) {
  const { data: exams = [], isLoading } = useExamList();
  const [activeFilter, setActiveFilter] = useState('Hamısı');
  const [search, setSearch] = useState('');

  const displayed = exams.filter((e) => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = matchesFilter(e.subject, activeFilter);
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>İmtahanlar</Text>
          <Text style={styles.headerSub}>Uyğun imtahanı seç</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="İmtahan axtar..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow} style={styles.filtersScroll}>
          {FILTER_CHIPS.map((chip) => {
            const active = activeFilter === chip;
            return (
              <TouchableOpacity key={chip} onPress={() => setActiveFilter(chip)} activeOpacity={0.85}>
                {active ? (
                  <LinearGradient colors={GRADIENT} style={styles.filterChipActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.filterChipActiveText}>{chip}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>{chip}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Məktəb İmtahanları</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{displayed.length} nəticə</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : displayed.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="search-outline" size={48} color={Colors.primaryFixed} />
            <Text style={styles.emptyText}>Heç bir imtahan tapılmadı</Text>
          </View>
        ) : (
          displayed.map((exam) => {
            const { label: diffLabel, color: diffColor } = diffInfo(exam);
            return (
              <View key={exam.id} style={styles.examCard}>
                <View style={styles.examCardTop}>
                  <View style={[styles.tagBadge, { backgroundColor: Colors.tertiaryContainer + '4D' }]}>
                    <Text style={[styles.tagBadgeText, { color: Colors.tertiary }]}>{exam.subject}</Text>
                  </View>
                  <View style={styles.freeRow}>
                    <Ionicons name="lock-open-outline" size={16} color={Colors.tertiary} />
                    <Text style={styles.freeText}>Pulsuz</Text>
                  </View>
                </View>

                <Text style={styles.examTitle}>{exam.title}</Text>

                <View style={styles.examMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="help-circle-outline" size={15} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{exam.questionCount ?? '?'} sual</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={15} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{exam.duration} dəq</Text>
                  </View>
                  <Text style={[styles.metaDifficulty, { color: diffColor }]}>{diffLabel}</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate(Routes.ExamDetail, { examId: exam.id, title: exam.title })}
                >
                  <LinearGradient colors={GRADIENT} style={styles.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.ctaBtnText}>Başla</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },
  headerSub: { fontSize: 10, fontWeight: '500', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: -2 },

  scroll: { padding: 16, paddingBottom: 48, gap: 20 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    paddingHorizontal: 16, height: 54,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },

  filtersScroll: { marginHorizontal: -16 },
  filtersRow: { paddingHorizontal: 16, gap: 10 },
  filterChipActive: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2,
  },
  filterChipActiveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  filterChip: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999, backgroundColor: Colors.surfaceContainer },
  filterChipText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  countBadge: { backgroundColor: Colors.primaryFixed + '33', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  countBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  center: { paddingTop: 40, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },

  examCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 1,
  },
  examCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tagBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tagBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  freeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  freeText: { fontSize: 14, fontWeight: '700', color: Colors.tertiary },

  examTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, lineHeight: 26 },

  examMeta: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  metaDifficulty: { fontSize: 13, fontWeight: '600' },

  ctaBtn: {
    height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 3,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
