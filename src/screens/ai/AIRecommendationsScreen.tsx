import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getAiRecommendations } from '../../api/ai.api';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const MOCK_EXAM_CARDS = [
  {
    id: '1',
    subjectBadge: 'Riyaziyyat',
    typeBadge: 'AI SEÇİMİ' as const,
    typeBadgeBg: Colors.tertiaryContainer + '4D',
    typeBadgeColor: Colors.tertiary,
    title: 'Funksiyalar və Qrafiklər',
    duration: 25,
    difficulty: 'Orta',
    questions: 20,
    icon: 'calculator-outline' as const,
    iconBg: Colors.primaryFixed + '33',
    iconColor: Colors.primary,
  },
  {
    id: '2',
    subjectBadge: 'Azərbaycan dili',
    typeBadge: 'YENİ' as const,
    typeBadgeBg: Colors.primaryFixed + '1A',
    typeBadgeColor: Colors.primary,
    title: 'Sintaktik əlaqələr',
    duration: 15,
    difficulty: 'Asan',
    questions: 15,
    icon: 'language-outline' as const,
    iconBg: Colors.secondaryContainer + '80',
    iconColor: Colors.secondary,
  },
  {
    id: '3',
    subjectBadge: 'Fizika',
    typeBadge: 'AI SEÇİMİ' as const,
    typeBadgeBg: Colors.tertiaryContainer + '4D',
    typeBadgeColor: Colors.tertiary,
    title: 'Elektrodinamika',
    duration: 35,
    difficulty: 'Çətin',
    questions: 30,
    icon: 'flash-outline' as const,
    iconBg: Colors.warningLight,
    iconColor: Colors.warning,
  },
];

export default function AIRecommendationsScreen() {
  const navigation = useNavigation<any>();

  const { isLoading } = useQuery({
    queryKey: ['aiRecommendations'],
    queryFn: getAiRecommendations,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İmtahanlar</Text>
        <Text style={styles.brandText}>Kimi.az</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Aura decoration */}
          <View style={styles.auraBlob} pointerEvents="none" />

          {/* Hero */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Sənin üçün{' '}
              <Text style={{ color: Colors.primary }}>ən yaxşı</Text>
              {' '}sınaqlar!
            </Text>
            <Text style={styles.heroSub}>
              AI sənin performansını analiz edərək bu imtahanları seçdi.
            </Text>
          </View>

          {/* AI Analysis Card */}
          <View style={styles.analysisCard}>
            <View style={styles.analysisTop}>
              <View style={styles.analyticsIconCircle}>
                <Ionicons name="analytics-outline" size={26} color={Colors.primary} />
              </View>
              <View style={styles.analysisTextCol}>
                <Text style={styles.analysisLabel}>Hazırlıq səviyyəsi</Text>
                <Text style={styles.analysisTitle}>Analiz: 82% hazır</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={GRADIENT}
                style={[styles.progressFill, { width: '82%' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* Section header */}
          <View style={styles.secHeader}>
            <Text style={styles.secTitle}>Sənə uyğun imtahanlar</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.secMore}>Buna da bax →</Text>
            </TouchableOpacity>
          </View>

          {/* Exam Cards */}
          {MOCK_EXAM_CARDS.map((card) => (
            <View key={card.id} style={styles.examCard}>
              <View style={styles.examCardTop}>
                <View style={styles.examBadgeRow}>
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectBadgeText}>{card.subjectBadge}</Text>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: card.typeBadgeBg }]}>
                    {card.typeBadge === 'AI SEÇİMİ' && (
                      <Ionicons name="sparkles" size={12} color={card.typeBadgeColor} />
                    )}
                    <Text style={[styles.typeBadgeText, { color: card.typeBadgeColor }]}>
                      {card.typeBadge}
                    </Text>
                  </View>
                </View>
                <View style={[styles.thumbBox, { backgroundColor: card.iconBg }]}>
                  <Ionicons name={card.icon} size={28} color={card.iconColor} />
                </View>
              </View>

              <Text style={styles.examTitle}>{card.title}</Text>

              {/* Metadata with top/bottom separator lines */}
              <View style={styles.examMetaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{card.duration} dəq</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="bar-chart-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{card.difficulty}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="document-text-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{card.questions} sual</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate(Routes.ExamList)}
              >
                <LinearGradient
                  colors={GRADIENT}
                  style={styles.startBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.startBtnText}>Başla</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: Colors.primary },
  brandText: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 48, gap: 24 },

  auraBlob: {
    position: 'absolute', top: -40, right: -24,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary, opacity: 0.05,
  },

  heroSection: { gap: 10 },
  heroTitle: { fontSize: 34, fontWeight: '800', color: Colors.textPrimary, lineHeight: 44, letterSpacing: -0.8 },
  heroSub: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, opacity: 0.8 },

  analysisCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24, gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.06, shadowRadius: 32, elevation: 2,
    overflow: 'hidden',
  },
  analysisTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  analyticsIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primaryFixed + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  analysisTextCol: { gap: 4 },
  analysisLabel: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.5 },
  analysisTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  progressTrack: { height: 10, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },

  secHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  secMore: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  examCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 1,
  },
  examCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  examBadgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', flex: 1, marginRight: 12 },
  subjectBadge: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  subjectBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  typeBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  thumbBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  examTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, lineHeight: 28 },

  examMetaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1, borderBottomWidth: 1,
    borderTopColor: Colors.surfaceLow, borderBottomColor: Colors.surfaceLow,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary },

  startBtn: {
    height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 3,
  },
  startBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
