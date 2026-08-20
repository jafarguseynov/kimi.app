import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExam } from '../../hooks/useExams';
import { useEntitlements } from '../../hooks/useEntitlements';
import { getCategoryTitle } from '../../constants/educationTaxonomy';
import { checkBookmark, addBookmark, removeBookmark } from '../../api/bookmark.api';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamInfo>;
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const DIFFICULTY_KEY: Record<string, string> = { easy: 'examList.diff.easy', medium: 'examList.diff.medium', hard: 'examList.diff.hard' };

export default function ExamInfoScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { examId, title } = route.params;
  // İmtahan birbaşa id ilə gətirilir → hansı siyahıdan gəlməsindən asılı olmayaraq
  // rəqəmlər realdır. Route parametrləri yalnız ilkin (dərhal görünən) dəyərdir.
  const { data: exam, isLoading } = useExam(examId);

  const displayTitle = exam?.title ?? title ?? t('examInfo.titleFallback');
  const questionCount = exam?.questionCount ?? route.params.questionCount ?? null;
  const duration = exam?.duration ?? route.params.duration ?? null;
  const difficultyKey = exam?.difficulty ?? route.params.difficulty ?? 'medium';
  const difficulty = t(DIFFICULTY_KEY[difficultyKey] ?? 'examList.diff.medium');
  const subject = exam?.subject ?? route.params.subject;
  const category = getCategoryTitle((exam as any)?.categoryKey ?? route.params.categoryKey) ?? subject ?? t('examInfo.categoryFallback');

  const { isPremium, limitOf } = useEntitlements();
  const examLimit = limitOf('exam');
  const limited = !isPremium && !!examLimit && !examLimit.unlimited;
  const locked = limited && examLimit.remaining <= 0;

  // «Yadda saxla» — real bookmark API-si (əvvəl düymənin heç bir işi yox idi)
  const qc = useQueryClient();
  const { data: bookmark } = useQuery({
    queryKey: ['bookmark', 'exam', examId],
    queryFn: () => checkBookmark(examId, 'exam'),
    enabled: !!examId,
    retry: false,
  });
  const [savingBookmark, setSavingBookmark] = React.useState(false);
  const saved = !!bookmark?.bookmarked;

  const toggleBookmark = async () => {
    if (!examId || savingBookmark) return;
    setSavingBookmark(true);
    try {
      if (saved && bookmark?.bookmarkId) await removeBookmark(bookmark.bookmarkId);
      else await addBookmark(examId, 'exam', displayTitle);
      qc.invalidateQueries({ queryKey: ['bookmark', 'exam', examId] });
    } catch {
      Alert.alert(t('examInfo.errorTitle'), t('examInfo.bookmarkFailed'));
    } finally {
      setSavingBookmark(false);
    }
  };

  const goPrepare = () => {
    if (!examId) {
      Alert.alert(t('examInfo.errorTitle'), t('examInfo.noId'));
      return;
    }
    navigation.navigate(Routes.ExamDetail, {
      examId,
      title: displayTitle,
      questionCount: questionCount ?? undefined,
      duration: duration ?? undefined,
      difficulty: difficultyKey as 'easy' | 'medium' | 'hard',
      subject,
      categoryKey: (exam as any)?.categoryKey ?? route.params.categoryKey,
    });
  };

  // «Bu imtahanda nə var?» — ilk üç bənd REAL imtahan məlumatıdır,
  // qalanları hər imtahanda mövcud olan funksiyalardır.
  const includes: string[] = [
    questionCount ? t('examInfo.incQuestions', { n: questionCount }) : '',
    duration ? t('examInfo.incDuration', { n: duration }) : '',
    t('examInfo.incLevel', { level: category }),
    t('examInfo.incResult'),
    t('examInfo.incMistakes'),
    t('examInfo.incAi'),
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayTitle}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading && !exam ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* Başlıq */}
            <View style={{ gap: 6 }}>
              <Text style={styles.bigTitle}>{displayTitle}</Text>
              <Text style={styles.categoryText}>{category}</Text>
              {/* Premium istifadəçidə status nişanı göstərilmir — hər şey açıqdır */}
              {!isPremium && (
              <View style={styles.accessRow}>
                {locked ? (
                  <View style={[styles.accessChip, styles.accessChipPremium]}>
                    <Ionicons name="lock-closed" size={12} color="#B45309" />
                    <Text style={[styles.accessChipText, { color: '#B45309' }]}>{t('catExams.premium')}</Text>
                  </View>
                ) : (
                  <View style={[styles.accessChip, styles.accessChipFree]}>
                    <Ionicons name="checkmark-circle" size={12} color={Colors.tertiary} />
                    <Text style={[styles.accessChipText, { color: Colors.tertiary }]}>{t('catExams.free')}</Text>
                  </View>
                )}
                {limited && !locked && (
                  <Text style={styles.accessNote}>{t('catExams.freeLeft', { n: examLimit.remaining })}</Text>
                )}
              </View>
              )}
            </View>

            {/* 4 əsas məlumat */}
            <View style={styles.grid}>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}><Ionicons name="help-circle" size={18} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('examInfo.questionCount')}</Text>
                  <Text style={styles.infoValue}>{questionCount ? t('examInfo.questionsVal', { n: questionCount }) : '—'}</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}><Ionicons name="time" size={18} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('examInfo.time')}</Text>
                  <Text style={styles.infoValue}>{duration ? t('examInfo.minutesVal', { n: duration }) : '—'}</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}><Ionicons name="stats-chart" size={18} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('examInfo.difficulty')}</Text>
                  <Text style={styles.infoValue}>{difficulty}</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}><Ionicons name="book" size={18} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('examInfo.subject')}</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{subject ?? '—'}</Text>
                </View>
              </View>
            </View>

            {/* Bu imtahanda nə var? */}
            <View style={{ gap: 12 }}>
              <Text style={styles.sectionTitle}>{t('examInfo.whatsInside')}</Text>
              <View style={styles.includeCard}>
                {includes.map((line) => (
                  <View key={line} style={styles.includeRow}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.tertiary} />
                    <Text style={styles.includeText}>{line}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Kimi AI — fərqləndirici funksiya */}
            <View style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <View style={styles.aiIcon}>
                  <Ionicons name="sparkles" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.aiTitle}>{t('examInfo.aiTitle')}</Text>
              </View>
              <Text style={styles.aiText}>{t('examInfo.aiText')}</Text>
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Aşağı sabit CTA */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.bookmarkBtn} activeOpacity={0.7} onPress={toggleBookmark} disabled={savingBookmark}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={saved ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.bookmarkText, saved && { color: Colors.primary }]}>
            {saved ? t('examInfo.bookmarked') : t('examInfo.bookmark')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} onPress={goPrepare} style={styles.startBtnWrap}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.startBtnText}>{t('examInfo.startExam')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginHorizontal: 12, letterSpacing: -0.2 },

  scroll: { padding: 20, paddingBottom: 130, gap: 22 },

  /* Başlıq */
  bigTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, lineHeight: 30 },
  categoryText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  accessRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' },
  accessChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  accessChipFree: { backgroundColor: '#DCFCE7' },
  accessChipPremium: { backgroundColor: '#FEF3C7' },
  accessChipText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  accessNote: { fontSize: 11, color: Colors.textMuted, flexShrink: 1 },

  /* Grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoCard: {
    flexBasis: '47%', flexGrow: 1,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoIcon: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2, marginTop: 1 },

  /* Bu imtahanda nə var */
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  includeCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  includeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  includeText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },

  /* Kimi AI */
  aiCard: {
    borderRadius: 16, padding: 18, gap: 8,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1, borderColor: Colors.primary + '2E',
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  aiTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: Colors.primary, letterSpacing: -0.2 },
  aiText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  /* Action bar */
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    gap: 12,
  },
  bookmarkBtn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  bookmarkText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, marginTop: 4 },
  startBtnWrap: { flex: 1 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 5,
  },
  startBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
});
