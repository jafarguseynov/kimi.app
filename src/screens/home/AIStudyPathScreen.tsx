import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.AIStudyPath>;
};

const PLAN_CARDS = [
  {
    id: '1',
    icon: 'calculator-outline' as const,
    iconBg: Colors.primaryLight,
    iconColor: Colors.primary,
    title: 'Riyaziyyat testi',
    sub: '15 sual • 25 dəq',
  },
  {
    id: '2',
    icon: 'language-outline' as const,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    title: 'İngilis dili testi',
    sub: '10 sual • 15 dəq',
  },
  {
    id: '3',
    icon: 'school-outline' as const,
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    title: 'Kəsrlər mövzusu',
    sub: 'Mövzu izahı',
  },
  {
    id: '4',
    icon: 'refresh-outline' as const,
    iconBg: '#fff1f2',
    iconColor: '#e11d48',
    title: 'Təkrar etməli',
    sub: '3 mövzu',
  },
];

const WEAK_TOPICS = ['Triqonometriya', 'Kimyəvi reaksiyalar'];
const STRONG_TOPICS = ['Azərbaycan dili', 'Tarix'];

const AI_TIPS = [
  'Triqonometriya düsturlarını səhər saatlarında təkrar etmək yaddaşı 30% artırır.',
  'Kimyəvi reaksiyalar üçün qısa video dərslərimizə baxmağı unutma.',
];

const NEXT_EXAMS = [
  { id: '1', icon: 'document-text-outline' as const, title: 'Blok İmtahanı #4', date: '12 Aprel', time: '09:00' },
  { id: '2', icon: 'calculator-outline' as const, title: 'Riyaziyyat Maratonu', date: '15 Aprel', time: '14:00' },
  { id: '3', icon: 'book-outline' as const, title: 'Ümumi sınaq #10', date: '20 Aprel', time: '10:00' },
];

export default function AIStudyPathScreen({ navigation }: Props) {
  const { user } = useUserStore();
  const initials = (user?.name ?? 'İ')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bugünkü plan</Text>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Insight */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.insightCard}
        >
          <View style={styles.insightBadge}>
            <Text style={styles.insightBadgeText}>KİMİ ROBOT INSİGHT</Text>
          </View>
          <Text style={styles.insightTitle}>
            Bugün riyaziyyata fokuslanmağın tam vaxtıdır!
          </Text>
          <Text style={styles.insightSub}>
            Günün ilk yarısında beynin mürəkkəb hesablamalar üçün daha hazırdır.
          </Text>
          <View style={styles.insightGlow} />
          <View style={styles.insightIconBg}>
            <Ionicons name="hardware-chip-outline" size={64} color="rgba(255,255,255,0.2)" />
          </View>
        </LinearGradient>

        {/* Daily Plan Grid */}
        <Text style={styles.sectionTitle}>Sənin üçün hazırlananlar</Text>
        <View style={styles.planGrid}>
          {PLAN_CARDS.map((card) => (
            <TouchableOpacity key={card.id} style={styles.planCard} activeOpacity={0.8}>
              <View style={[styles.planIconBox, { backgroundColor: card.iconBg }]}>
                <Ionicons name={card.icon} size={22} color={card.iconColor} />
              </View>
              <Text style={styles.planCardTitle}>{card.title}</Text>
              <Text style={styles.planCardSub}>{card.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Performance Analysis */}
        <Text style={styles.sectionTitle}>Performans analizi</Text>
        <View style={styles.perfCard}>
          <View style={styles.perfSection}>
            <View style={styles.perfLabelRow}>
              <View style={[styles.perfDot, { backgroundColor: '#e11d48' }]} />
              <Text style={styles.perfLabel}>ZƏİF MÖVZULAR</Text>
            </View>
            <View style={styles.chipRow}>
              {WEAK_TOPICS.map((t) => (
                <View key={t} style={styles.chipWeak}>
                  <Text style={styles.chipWeakText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.perfSection, styles.perfSectionTop]}>
            <View style={styles.perfLabelRow}>
              <View style={[styles.perfDot, { backgroundColor: '#16a34a' }]} />
              <Text style={styles.perfLabel}>GÜCLÜ MÖVZULAR</Text>
            </View>
            <View style={styles.chipRow}>
              {STRONG_TOPICS.map((t) => (
                <View key={t} style={styles.chipStrong}>
                  <Text style={styles.chipStrongText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* AI Recommendations */}
        <View style={styles.aiRecCard}>
          <View style={styles.aiRecHeader}>
            <View style={styles.aiRecIconBox}>
              <Ionicons name="sparkles" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.aiRecTitle}>AI tövsiyələri</Text>
          </View>
          {AI_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipBulletOuter}>
                <View style={styles.tipBulletInner} />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Next Tests */}
        <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>Növbəti sınaqlar</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nextExamRow}
          style={{ marginHorizontal: -20 }}
        >
          {NEXT_EXAMS.map((exam) => (
            <View key={exam.id} style={styles.examCard}>
              <View style={styles.examIconBox}>
                <Ionicons name={exam.icon} size={36} color={Colors.surfaceHigh} />
              </View>
              <Text style={styles.examTitle}>{exam.title}</Text>
              <View style={styles.examDateRow}>
                <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.examDate}>{exam.date} • {exam.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  insightCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 28,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  insightBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  insightBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.2,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
    marginBottom: 8,
    maxWidth: '80%',
  },
  insightSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    maxWidth: '80%',
  },
  insightGlow: {
    position: 'absolute',
    right: -32,
    bottom: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  insightIconBg: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -32,
    opacity: 0.8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 14,
  },

  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  planCard: {
    width: '47%',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  planIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  planCardSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  perfCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  perfSection: { padding: 18 },
  perfSectionTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  perfLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  perfDot: { width: 6, height: 6, borderRadius: 3 },
  perfLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipWeak: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipWeakText: { fontSize: 12, fontWeight: '600', color: '#e11d48' },
  chipStrong: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipStrongText: { fontSize: 12, fontWeight: '600', color: '#16a34a' },

  aiRecCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  aiRecHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  aiRecIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiRecTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  tipRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 16 },
  tipBulletOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  tipBulletInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  nextExamRow: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 12,
  },
  examCard: {
    width: 200,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  examIconBox: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  examTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  examDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  examDate: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
