import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExamList, useStartExam } from '../../hooks/useExams';
import { getCategoryTitle } from '../../constants/educationTaxonomy';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamInfo>;
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const DIFFICULTY_KEY: Record<string, string> = { easy: 'examList.diff.easy', medium: 'examList.diff.medium', hard: 'examList.diff.hard' };

type IconName = keyof typeof Ionicons.glyphMap;

// Fənnə uyğun ikon — bütün imtahanlarda eyni kalkulyator əvəzinə
const SUBJECT_ICON: { match: string; icon: IconName }[] = [
  { match: 'riyaz', icon: 'calculator' },
  { match: 'cəbr', icon: 'calculator' },
  { match: 'həndəs', icon: 'shapes' },
  { match: 'fizik', icon: 'flash' },
  { match: 'kimya', icon: 'flask' },
  { match: 'biolog', icon: 'leaf' },
  { match: 'coğraf', icon: 'earth' },
  { match: 'tarix', icon: 'time' },
  { match: 'ədəbiy', icon: 'book' },
  { match: 'dil', icon: 'language' },
  { match: 'informat', icon: 'laptop' },
  { match: 'məntiq', icon: 'bulb' },
];
function iconForSubject(subject?: string): IconName {
  const s = (subject ?? '').toLowerCase();
  return SUBJECT_ICON.find((m) => s.includes(m.match))?.icon ?? 'document-text';
}

export default function ExamInfoScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { examId, title } = route.params;
  const { data: exams = [], isLoading } = useExamList();
  const exam: any = exams.find((e: any) => e.id === examId);
  const { mutate: startExamMutate, isPending: isStarting } = useStartExam();

  const displayTitle = exam?.title ?? title ?? t('examInfo.titleFallback');
  const questionCount = exam?.questionCount ?? route.params.questionCount ?? 20;
  const duration = exam?.duration ?? route.params.duration ?? 25;
  const difficulty = t(DIFFICULTY_KEY[exam?.difficulty ?? route.params.difficulty ?? 'medium'] ?? 'examList.diff.medium');
  const subject = exam?.subject ?? route.params.subject;
  const category = getCategoryTitle(exam?.categoryKey ?? route.params.categoryKey) ?? subject ?? t('examInfo.categoryFallback');
  const heroIcon = iconForSubject(subject ?? displayTitle);
  const description = (exam as any)?.description ?? t('examInfo.defaultDesc');

  const startExam = () => {
    if (!examId) {
      Alert.alert(t('examInfo.errorTitle'), t('examInfo.noId'));
      return;
    }
    startExamMutate(examId, {
      onSuccess: () => navigation.navigate(Routes.ExamSession),
      onError: (err: any) => {
        Alert.alert(t('examInfo.cantStart'), err?.response?.data?.message ?? err?.message ?? t('examInfo.unknownError'));
      },
    });
  };

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
            {/* Hero banner */}
            <LinearGradient
              colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.heroPattern}>
                <Ionicons name={heroIcon} size={150} color="#fff" />
              </View>
              <View style={styles.heroKicker}>
                <View style={styles.heroDot} />
                <Text style={styles.heroKickerText}>{t('examInfo.newExam')}</Text>
              </View>
              <View style={styles.heroIconCircle}>
                <Ionicons name={heroIcon} size={40} color="#fff" />
              </View>
            </LinearGradient>

            {/* Title */}
            <View style={{ gap: 8 }}>
              <Text style={styles.bigTitle}>{displayTitle}</Text>
              {!!subject && (
                <View style={styles.subjectRow}>
                  <Ionicons name="pricetag" size={13} color={Colors.primary} />
                  <Text style={styles.subjectText}>{subject}</Text>
                </View>
              )}
            </View>

            {/* Bento info grid */}
            <View style={styles.grid}>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}><Ionicons name="help-circle" size={18} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('examInfo.questionCount')}</Text>
                  <Text style={styles.infoValue}>{t('examInfo.questionsVal', { n: questionCount })}</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}><Ionicons name="time" size={18} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('examInfo.time')}</Text>
                  <Text style={styles.infoValue}>{t('examInfo.minutesVal', { n: duration })}</Text>
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
                <View style={styles.infoIcon}><Ionicons name="albums" size={18} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('examInfo.category')}</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{category}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={{ gap: 12 }}>
              <Text style={styles.sectionTitle}>{t('examInfo.aboutExam')}</Text>
              <View style={styles.descCard}>
                <Text style={styles.descText}>{description}</Text>
              </View>
              <View style={styles.infoHint}>
                <Ionicons name="information-circle" size={22} color={Colors.primary} />
                <Text style={styles.infoHintText}>
                  {t('examInfo.afterHint')}
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.bookmarkBtn} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.bookmarkText}>{t('examInfo.bookmark')}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} onPress={startExam} style={styles.startBtnWrap} disabled={isStarting}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
            {isStarting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.startBtnText}>{t('examInfo.startExam')}</Text>
              </>
            )}
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

  scroll: { padding: 20, paddingBottom: 120, gap: 22 },

  /* Hero */
  hero: {
    height: 150, borderRadius: 20, padding: 18,
    justifyContent: 'space-between', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6,
  },
  heroPattern: { position: 'absolute', right: -30, bottom: -40, opacity: 0.12 },
  heroKicker: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  heroKickerText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1.2 },
  heroIconCircle: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Title */
  bigTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, lineHeight: 30 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  subjectText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  /* Grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoCard: {
    flexBasis: '47%', flexGrow: 1,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 2,
  },
  infoIcon: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2, marginTop: 1 },

  /* Description */
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  descCard: { backgroundColor: Colors.surfaceLow, padding: 16, borderRadius: 14 },
  descText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  infoHint: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary + '0F',
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
    padding: 16, borderRadius: 12,
  },
  infoHintText: { flex: 1, fontSize: 12, fontWeight: '500', color: Colors.primary, lineHeight: 18 },

  /* Action bar */
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: -20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 12,
    gap: 12,
  },
  bookmarkBtn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  bookmarkText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, marginTop: 4 },
  startBtnWrap: { flex: 1 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 6,
  },
  startBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});
