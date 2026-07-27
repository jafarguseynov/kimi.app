import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { getTopicStats } from '../../api/topicStats.api';
import { getMissions, DailyMission } from '../../api/engagement.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function AIStudyPlanScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const { data: stats, isLoading: sLoading } = useQuery({
    queryKey: ['topicStats'],
    queryFn: () => getTopicStats(),
  });
  const { data: missions = [], isLoading: mLoading } = useQuery<DailyMission[]>({
    queryKey: ['missions'],
    queryFn: () => getMissions().catch(() => []),
  });

  const weakSubjects = stats?.weak ?? [];
  const recTopic = weakSubjects[0];
  const loading = sLoading || mLoading;

  const startPractice = () => {
    // Yeni: AIPracticeBuilder real AI məşq yaradır — zəif mövzunu ötür
    navigation.navigate(Routes.AIPracticeBuilder);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aiStudyPlan.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>{t('aiStudyPlan.title')}</Text>
          <Text style={styles.subtitle}>{t('aiStudyPlan.subtitle')}</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={Colors.primary} />
        ) : (
          <>
            {/* AI Recommendation card (real weakest subject) */}
            <View style={styles.recCard}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.recHeader}>
                <View style={styles.botBgDecor}>
                  <Ionicons name="hardware-chip" size={120} color="rgba(255,255,255,0.18)" />
                </View>
                <View style={styles.recHeaderTop}>
                  <View style={styles.botPill}>
                    <Ionicons name="hardware-chip" size={16} color="#fff" />
                  </View>
                  <Text style={styles.recKicker}>{t('aiStudyPlan.recKicker')}</Text>
                </View>
                <Text style={styles.recTopic}>
                  {recTopic ? t('aiStudyPlan.recTopicPrefix', { s: recTopic }) : t('aiStudyPlan.noWeak')}
                </Text>
              </LinearGradient>

              <View style={styles.recBody}>
                <View>
                  <Text style={styles.recBodyKicker}>{t('aiStudyPlan.targetLabel')}</Text>
                  <Text style={styles.recBodyValue}>
                    {weakSubjects.length > 0
                      ? t('aiStudyPlan.weakCount', { n: weakSubjects.length })
                      : t('aiStudyPlan.targetNone')}
                  </Text>
                </View>
                <View style={styles.recBodyIcon}>
                  <Ionicons name="analytics" size={22} color={Colors.primary} />
                </View>
              </View>
            </View>

            {/* Task list — real daily missions */}
            <View style={{ gap: 12 }}>
              <Text style={styles.sectionTitle}>{t('aiStudyPlan.todoTitle')}</Text>
              {missions.length === 0 ? (
                <Text style={styles.emptyText}>{t('missions.empty')}</Text>
              ) : (
                missions.map((m) => (
                  <View key={m.id} style={styles.taskRow}>
                    {m.completed ? (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={24} color={Colors.outline ?? Colors.textMuted} />
                    )}
                    <Text style={[styles.taskText, m.completed && styles.taskTextDone]}>{m.title}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Priority topics — real weak subjects */}
            {weakSubjects.length > 0 && (
              <View style={{ gap: 12 }}>
                <Text style={styles.sectionTitle}>{t('aiStudyPlan.priorityTitle')}</Text>
                <Text style={styles.priorityHint}>{t('aiStudyPlan.priorityHint')}</Text>
                <View style={styles.chipsRow}>
                  {weakSubjects.map((p) => (
                    <TouchableOpacity key={p} style={styles.priorityChip} activeOpacity={0.8} onPress={startPractice}>
                      <Text style={styles.priorityChipText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Daha çox AI alətləri */}
        <View style={aiActStyles.section}>
          <Text style={aiActStyles.title}>{t('aiStudyPlan.moreTitle')}</Text>
          <View style={aiActStyles.row}>
            <TouchableOpacity style={aiActStyles.card} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.AIPracticeBuilder)}>
              <Ionicons name="construct" size={20} color={Colors.primary} />
              <Text style={aiActStyles.cardTitle}>{t('aiStudyPlan.buildPractice')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={aiActStyles.card} activeOpacity={0.85} onPress={() => navigation.getParent()?.navigate('Exams', { screen: Routes.AIExamRecommendations })}>
              <Ionicons name="sparkles" size={20} color={Colors.primary} />
              <Text style={aiActStyles.cardTitle}>{t('aiStudyPlan.examRec')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={aiActStyles.card} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.MotivationReminder)}>
              <Ionicons name="notifications-circle" size={20} color="#F97316" />
              <Text style={aiActStyles.cardTitle}>{t('aiStudyPlan.reminder')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} onPress={startPractice}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
            <Text style={styles.startBtnText}>{t('aiStudyPlan.start')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const aiActStyles = StyleSheet.create({
  section: { marginTop: 24, gap: 12 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1, alignItems: 'center', gap: 6, padding: 12, borderRadius: 16,
    backgroundColor: Colors.surfaceLowest, borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardTitle: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 32, paddingBottom: 120 },

  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 6 },

  recCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  recHeader: { padding: 24, position: 'relative', overflow: 'hidden' },
  botBgDecor: { position: 'absolute', right: -16, top: -16, opacity: 0.5 },
  recHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  botPill: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  recKicker: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: 1.2 },
  recTopic: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  recBody: {
    padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest,
  },
  recBodyKicker: { fontSize: 10, fontWeight: '500', color: Colors.textMuted, letterSpacing: 1.2, marginBottom: 4 },
  recBodyValue: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  recBodyIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 14, color: Colors.textMuted },

  taskRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    padding: 20, borderRadius: 16,
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 20, elevation: 2,
  },
  taskText: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary, lineHeight: 22 },
  taskTextDone: { textDecorationLine: 'line-through', color: Colors.textMuted },

  priorityHint: { fontSize: 13, color: Colors.textMuted },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  priorityChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
    backgroundColor: '#FEE2E2',
  },
  priorityChipText: { fontSize: 13, fontWeight: '500', color: Colors.danger },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24,
    backgroundColor: 'rgba(245,247,249,0.95)',
  },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.25, shadowRadius: 30, elevation: 6,
  },
  startBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
