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
import { useExamList } from '../../hooks/useExams';
import { useUserStore } from '../../store/user.store';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function AIRecommendationsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const { t } = useTranslation();

  const { data: aiRec, isLoading: aiLoading } = useQuery({
    queryKey: ['aiRecommendations'],
    queryFn: getAiRecommendations,
  });
  const { data: exams = [], isLoading: examsLoading } = useExamList();
  const isLoading = aiLoading || examsLoading;

  const weak = aiRec?.weakTopics ?? [];
  const weakSubjects = weak.map((w) => w.subject.toLowerCase());
  const recommendedExam = exams.find((e) => weakSubjects.some((s) => e.subject.toLowerCase().includes(s))) ?? exams[0];

  const weakTopics = weak.length > 0
    ? weak.slice(0, 3).map((w) => w.subject)
    : ['Kəsrlər', 'Sifətin dərəcələri', 'Bölmə'];

  const strongTopics = ['Vurma cədvəli', 'İsim', 'Tənliklər'];

  const growthPercent = weak.length > 0
    ? Math.max(5, Math.min(50, Math.round(100 - (weak[0]?.avg ?? 50))))
    : 15;

  const userName = (user?.name ?? t('aiRecommendations.defaultName')).split(' ')[0];

  const aiTip = recommendedExam
    ? t('aiRecommendations.tipDifficulty', { name: userName, topic: weakTopics[0]?.toLowerCase() ?? '' })
    : t('aiRecommendations.tipFirst', { name: userName });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>{t('aiRecommendations.headerTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aiRecommendations.headerTitle')}</Text>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{(user?.name ?? t('aiRecommendations.avatarFallback')).charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <LinearGradient
          colors={GRADIENT}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{t('aiRecommendations.heroBadge')}</Text>
          </View>
          <Text style={styles.heroTitle}>{t('aiRecommendations.heroTitle', { name: userName })}</Text>
          <Text style={styles.heroSub}>
            {t('aiRecommendations.heroSub', { percent: growthPercent })}
          </Text>
        </LinearGradient>

        {/* Growth + Weak bento */}
        <View style={styles.bentoRow}>
          <View style={styles.growthCard}>
            <View style={styles.growthTop}>
              <Text style={styles.growthLabel}>{t('aiRecommendations.growthLabel')}</Text>
              <Ionicons name="trending-up" size={20} color={Colors.tertiary} />
            </View>
            <View style={styles.growthValueRow}>
              <Text style={styles.growthValue}>+{growthPercent}%</Text>
              <Text style={styles.growthSub}>{t('aiRecommendations.growthRise')}</Text>
            </View>
            <View style={styles.growthTrack}>
              <LinearGradient
                colors={GRADIENT}
                style={[styles.growthFill, { width: `${Math.min(95, growthPercent * 4)}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.growthCaption}>{t('aiRecommendations.growthCaption')}</Text>
          </View>

          <View style={styles.weakCard}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.danger} />
              <Text style={styles.cardTitle}>{t('aiRecommendations.weakTitle')}</Text>
            </View>
            <View style={styles.chipRow}>
              {weakTopics.map((topic, i) => (
                <View key={topic} style={[styles.chip, i === 2 ? styles.chipMuted : styles.chipDanger]}>
                  <Text style={[styles.chipText, i === 2 ? styles.chipTextMuted : styles.chipTextDanger]}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Strong + AI tip */}
        <View style={styles.strongCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.tertiary} />
            <Text style={styles.cardTitle}>{t('aiRecommendations.strongTitle')}</Text>
          </View>
          <View style={styles.chipRow}>
            {strongTopics.map((topic) => (
              <View key={topic} style={styles.chipSuccess}>
                <Text style={styles.chipTextSuccess}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.aiTipCard}>
          <View style={styles.aiTipIcon}>
            <Ionicons name="bulb" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTipTitle}>{t('aiRecommendations.aiTipTitle')}</Text>
            <Text style={styles.aiTipText}>"{aiTip}"</Text>
          </View>
        </View>

        {/* Next step */}
        {recommendedExam && (
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionLabel}>{t('aiRecommendations.nextStep')}</Text>
            <View style={styles.nextStepCard}>
              <View style={{ flex: 1, gap: 8 }}>
                <View style={styles.recRow}>
                  <View style={styles.recDot} />
                  <Text style={styles.recText}>{t('aiRecommendations.recommended')}</Text>
                </View>
                <Text style={styles.nextStepTitle}>{recommendedExam.title}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{recommendedExam.duration} {t('aiRecommendations.minutes')}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="help-circle-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{recommendedExam.questionCount ?? '?'} {t('aiRecommendations.questions')}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate(Routes.ExamDetail, { examId: recommendedExam.id, title: recommendedExam.title })}
              >
                <LinearGradient
                  colors={GRADIENT}
                  style={styles.playBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="play" size={22} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  headerAvatarText: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 20, gap: 20 },

  heroCard: {
    borderRadius: 20, padding: 28, gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.15, shadowRadius: 32, elevation: 6,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 1.5 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 32, letterSpacing: -0.4 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },

  bentoRow: { gap: 12 },
  growthCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.04, shadowRadius: 28, elevation: 2,
  },
  growthTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  growthLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  growthValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 14 },
  growthValue: { fontSize: 44, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 },
  growthSub: { fontSize: 13, fontWeight: '800', color: Colors.tertiary },
  growthTrack: { height: 8, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden', marginTop: 18 },
  growthFill: { height: '100%', borderRadius: 999 },
  growthCaption: { fontSize: 11, color: Colors.textMuted, marginTop: 10, fontStyle: 'italic' },

  weakCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 18, padding: 20, gap: 12,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  chipDanger: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  chipMuted: { backgroundColor: Colors.surfaceHigh, borderColor: 'transparent' },
  chipText: { fontSize: 12, fontWeight: '600' },
  chipTextDanger: { color: '#B91C1C' },
  chipTextMuted: { color: Colors.textSecondary },

  strongCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20, gap: 12,
    borderWidth: 1, borderColor: Colors.primary + '0D',
  },
  chipSuccess: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0',
  },
  chipTextSuccess: { fontSize: 12, fontWeight: '600', color: Colors.tertiary },

  aiTipCard: {
    backgroundColor: Colors.primaryLight, borderRadius: 18, padding: 20,
    flexDirection: 'row', gap: 14,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  aiTipIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  aiTipTitle: { fontSize: 13, fontWeight: '800', color: Colors.primary, marginBottom: 4 },
  aiTipText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, fontStyle: 'italic' },

  sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginLeft: 4 },

  nextStepCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.03, shadowRadius: 40, elevation: 2,
  },
  recRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  recText: { fontSize: 10, fontWeight: '800', color: Colors.danger, textTransform: 'uppercase', letterSpacing: 1 },
  nextStepTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },

  playBtn: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 4,
  },
});
