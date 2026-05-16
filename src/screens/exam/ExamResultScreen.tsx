import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExamStore } from '../../store/exam.store';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamResult> };

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')} dəq`;
}

export default function ExamResultScreen({ navigation }: Props) {
  const { result, examId, resetExam } = useExamStore();

  useEffect(() => () => { resetExam(); }, []);

  const scorePercent = result?.percentage ?? 0;
  const correctCount = result?.score ?? 0;
  const wrongCount = result ? (result.total - result.score) : 0;
  const prepLevel = Math.min(100, Math.round(scorePercent * 0.97));

  const handleShare = () => {
    Share.share({ message: `Kimi.az imtahanımda ${scorePercent}/100 aldım! 🎉` });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate(Routes.ExamList)} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İmtahan Nəticəsi</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="share-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreBlob1} />
          <View style={styles.scoreBlob2} />
          <Text style={styles.scoreCardLabel}>Ümumi Toplanan Bal</Text>
          <Text style={styles.scoreValue}>{scorePercent}<Text style={styles.scoreTotal}>/100</Text></Text>
          <View style={styles.scoreStats}>
            <View style={styles.scoreStatItem}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.tertiary} />
              <Text style={[styles.scoreStatNum, { color: Colors.tertiary }]}>{correctCount} düzgün</Text>
              <Text style={styles.scoreStatSub}>Cavablar</Text>
            </View>
            <View style={styles.scoreStatDivider} />
            <View style={styles.scoreStatItem}>
              <Ionicons name="close-circle" size={22} color={Colors.danger} />
              <Text style={[styles.scoreStatNum, { color: Colors.danger }]}>{wrongCount} səhv</Text>
              <Text style={styles.scoreStatSub}>Səhvlər</Text>
            </View>
            <View style={styles.scoreStatDivider} />
            <View style={styles.scoreStatItem}>
              <Ionicons name="time-outline" size={22} color={Colors.secondary} />
              <Text style={styles.scoreStatNum}>{result?.timeSpent ? formatTime(result.timeSpent) : '—'}</Text>
              <Text style={styles.scoreStatSub}>Zaman</Text>
            </View>
          </View>
        </View>

        {/* AI Analysis */}
        <View style={styles.aiCard}>
          <View style={styles.aiLeft}>
            <View style={styles.aiAura} />
            <LinearGradient colors={GRADIENT} style={styles.aiIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="hardware-chip-outline" size={32} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.aiRight}>
            <View style={styles.aiTitleRow}>
              <Text style={styles.aiTitle}>Kimi AI Təhlili</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>SMART</Text>
              </View>
            </View>
            <Text style={styles.aiText}>
              "Sənin riyazi məntiqin çox güclüdür, lakin tənliklər bölməsində bir az daha diqqətli olmalısan."
            </Text>
          </View>
        </View>

        {/* Prep Level */}
        <LinearGradient colors={GRADIENT} style={styles.prepCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.prepDecor} />
          <View style={styles.prepLeft}>
            <Text style={styles.prepTitle}>Hazırlıq səviyyəsi: {prepLevel}%</Text>
            <Text style={styles.prepSub}>Növbəti addım: daha çox imtahan həll et!</Text>
          </View>
          <View style={styles.prepCircle}>
            <Text style={styles.prepCircleText}>{prepLevel}</Text>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Fixed bottom actions */}
      <View style={styles.bottomBar}>
        {examId && scorePercent >= 70 && (
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => navigation.navigate(Routes.CertificatePreview, { examId })}
            activeOpacity={0.9}
          >
            <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="ribbon-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Sertifikata bax</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate(Routes.ExamList)}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh-outline" size={20} color={Colors.textPrimary} />
          <Text style={styles.secondaryBtnText}>Yenidən həll et</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 20, gap: 16, paddingBottom: 20 },

  scoreCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 28,
    alignItems: 'center', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  scoreBlob1: { position: 'absolute', top: -48, right: -48, width: 128, height: 128, borderRadius: 64, backgroundColor: Colors.primaryLight + '80' },
  scoreBlob2: { position: 'absolute', bottom: -48, left: -48, width: 128, height: 128, borderRadius: 64, backgroundColor: Colors.tertiaryContainer + '30' },
  scoreCardLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  scoreValue: { fontSize: 64, fontWeight: '800', color: Colors.primary, letterSpacing: -2, lineHeight: 76 },
  scoreTotal: { fontSize: 24, fontWeight: '700', color: Colors.textLight },
  scoreStats: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 20, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    width: '100%',
  },
  scoreStatItem: { flex: 1, alignItems: 'center', gap: 4 },
  scoreStatDivider: { width: 1, height: 40, backgroundColor: Colors.borderLight },
  scoreStatNum: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  scoreStatSub: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },

  aiCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 20,
    flexDirection: 'row', gap: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  aiLeft: { position: 'relative' },
  aiAura: {
    position: 'absolute', inset: 0 as any, borderRadius: 999,
    backgroundColor: Colors.primary + '33', top: -4, left: -4, right: -4, bottom: -4,
    opacity: 0.2,
  },
  aiIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  aiRight: { flex: 1 },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: Colors.primaryDim },
  aiBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  aiBadgeText: { fontSize: 8, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
  aiText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20, fontStyle: 'italic' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },

  topicCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 1,
  },
  topicHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topicIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  topicTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },

  prepCard: {
    borderRadius: 20, padding: 24, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden',
  },
  prepDecor: {
    position: 'absolute', bottom: -40, right: -40,
    width: 128, height: 128, borderRadius: 64,
    borderWidth: 16, borderColor: 'rgba(255,255,255,0.1)',
  },
  prepLeft: { flex: 1 },
  prepTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 4 },
  prepSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  prepCircle: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  prepCircleText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  bottomBar: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  primaryBtn: {
    flex: 1, height: 56, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 4,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    flex: 1, height: 56, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surfaceHigh,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
});
