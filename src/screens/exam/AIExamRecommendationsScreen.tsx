import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.AIExamRecommendations>;
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const DIFFICULTY_TKEY: Record<string, string> = {
  Asan: 'examList.diff.easy',
  Orta: 'examList.diff.medium',
  Çətin: 'examList.diff.hard',
};

type AiTag = 'AI SEÇİMİ' | 'YENİ';

interface Rec {
  id: string;
  subject: string;
  tag: AiTag;
  title: string;
  durationMin: number;
  difficulty: 'Asan' | 'Orta' | 'Çətin';
  questions: number;
  thumbIcon: keyof typeof Ionicons.glyphMap;
  thumbColor: string;
}

const RECS: Rec[] = [
  { id: 'a1', subject: 'Riyaziyyat',     tag: 'AI SEÇİMİ', title: 'Funksiyalar və Qrafiklər', durationMin: 25, difficulty: 'Orta',  questions: 20, thumbIcon: 'analytics-outline',  thumbColor: Colors.primary },
  { id: 'a2', subject: 'Azərbaycan dili', tag: 'YENİ',      title: 'Sintaktik əlaqələr',       durationMin: 15, difficulty: 'Asan',  questions: 15, thumbIcon: 'book-outline',       thumbColor: Colors.tertiary },
  { id: 'a3', subject: 'Fizika',         tag: 'AI SEÇİMİ', title: 'Elektrodinamika',          durationMin: 35, difficulty: 'Çətin', questions: 30, thumbIcon: 'flash-outline',      thumbColor: '#7C3AED' },
];

const DIFFICULTY_COLOR: Record<Rec['difficulty'], string> = {
  Asan: Colors.tertiary,
  Orta: Colors.primary,
  Çətin: Colors.danger,
};

export default function AIExamRecommendationsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const readyPct = 82;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('examList.title')}</Text>
        <Text style={styles.brand}>Kimi.az</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroWrap}>
          <View style={styles.heroBlob} pointerEvents="none" />
          <Text style={styles.heroTitle}>
            {t('aiRec.heroPre')}<Text style={{ color: Colors.primary }}>{t('aiRec.heroEm')}</Text>{t('aiRec.heroPost')}
          </Text>
          <Text style={styles.heroSub}>
            {t('aiRec.heroSub')}
          </Text>
        </View>

        {/* AI Analysis card */}
        <View style={styles.analysisCard}>
          <View style={styles.analysisIconBox}>
            <Ionicons name="analytics" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.analysisKicker}>{t('aiRec.readyLevel')}</Text>
          <Text style={styles.analysisTitle}>{t('aiRec.analysis', { n: readyPct })}</Text>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.progressFill, { width: `${readyPct}%` as any }]}
            />
          </View>
        </View>

        {/* Section header */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t('aiRec.forYou')}</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionMore}>{t('aiRec.seeMore')}</Text>
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <View style={{ gap: 24 }}>
          {RECS.map((r) => {
            const diffColor = DIFFICULTY_COLOR[r.difficulty];
            const isAiPick = r.tag === 'AI SEÇİMİ';
            const tagBg = isAiPick ? '#DCFCE7' : Colors.primary + '33';
            const tagFg = isAiPick ? Colors.tertiary : Colors.primary;
            const tagLabel = isAiPick ? t('aiRec.tagAi') : t('aiRec.tagNew');
            return (
              <View key={r.id} style={styles.recCard}>
                <View style={styles.recTopRow}>
                  <View style={{ flex: 1, gap: 12 }}>
                    <View style={styles.tagsRow}>
                      <View style={styles.subjectChip}>
                        <Text style={styles.subjectChipText}>{r.subject}</Text>
                      </View>
                      <View style={[styles.aiChip, { backgroundColor: tagBg }]}>
                        {isAiPick && <Ionicons name="sparkles" size={12} color={tagFg} />}
                        <Text style={[styles.aiChipText, { color: tagFg }]}>{tagLabel}</Text>
                      </View>
                    </View>
                    <Text style={styles.recTitle}>{r.title}</Text>
                  </View>
                  <View style={[styles.thumb, { backgroundColor: r.thumbColor + '1A' }]}>
                    <Ionicons name={r.thumbIcon} size={28} color={r.thumbColor} />
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{t('aiRec.nMin', { n: r.durationMin })}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="bar-chart-outline" size={14} color={diffColor} />
                    <Text style={[styles.metaText, { color: diffColor, fontWeight: '700' }]}>{t(DIFFICULTY_TKEY[r.difficulty])}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="help-circle-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{t('aiRec.nQuestions', { n: r.questions })}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate(Routes.ExamInfo, { examId: r.id, title: r.title })}
                >
                  <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
                    <Text style={styles.startBtnText}>{t('aiRec.start')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}
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
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3, flex: 1, marginLeft: 4 },
  brand: { fontSize: 18, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 20, gap: 32, paddingBottom: 48 },

  /* Hero */
  heroWrap: { position: 'relative', paddingTop: 16, gap: 8 },
  heroBlob: {
    position: 'absolute', top: -40, right: -24,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '14',
  },
  heroTitle: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6, lineHeight: 38 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, opacity: 0.85, lineHeight: 20 },

  /* Analysis card */
  analysisCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  analysisIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary + '1F',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  analysisKicker: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1.2 },
  analysisTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16, letterSpacing: -0.3 },
  progressTrack: { width: '100%', height: 10, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },

  /* Section head */
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  sectionMore: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  /* Card */
  recCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 2,
  },
  recTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  subjectChip: {
    backgroundColor: Colors.secondary ? Colors.secondary + '22' : '#E0E7FF',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
  },
  subjectChipText: { fontSize: 10, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.8, textTransform: 'uppercase' },
  aiChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
  },
  aiChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  recTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, lineHeight: 26 },
  thumb: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },

  metaRow: {
    flexDirection: 'row', gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: Colors.surfaceLow,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceLow,
    borderStyle: 'dashed' as any,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  startBtn: {
    paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  startBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});
