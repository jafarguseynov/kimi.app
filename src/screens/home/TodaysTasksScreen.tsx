import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface Task {
  id: string;
  titleKey: string;
  hintKey?: string;
  done: boolean;
}

const INITIAL: Task[] = [
  { id: '1', titleKey: 'todaysTasks.task1', done: true },
  { id: '2', titleKey: 'todaysTasks.task2', done: true },
  { id: '3', titleKey: 'todaysTasks.task3', hintKey: 'todaysTasks.task3hint', done: false },
];

export default function TodaysTasksScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>(INITIAL);

  const toggle = (id: string) => setTasks((prev) => prev.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  const completed = tasks.filter((task) => task.done).length;
  const pct = Math.round((completed / tasks.length) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('todaysTasks.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero title */}
        <View style={{ gap: 8 }}>
          <Text style={styles.hero}>
            {t('todaysTasks.heroWelcome')}{'\n'}
            <Text style={{ color: Colors.primary }}>{t('todaysTasks.heroGoals')}</Text>
          </Text>
          <Text style={styles.heroSub}>{t('todaysTasks.heroSub')}</Text>
        </View>

        {/* Main task card */}
        <View style={styles.taskCard}>
          <View style={styles.streakBadge}>
            <Text style={{ fontSize: 22 }}>🔥</Text>
          </View>
          <Text style={styles.cardTitle}>{t('todaysTasks.cardTitle')}</Text>

          <View style={{ marginBottom: 24 }}>
            <View style={styles.progressTopRow}>
              <Text style={styles.progressLabel}>{t('todaysTasks.progressLabel')}</Text>
              <Text style={styles.progressValue}>{t('todaysTasks.completedOf', { done: completed, total: tasks.length })}</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.progressFill, { width: `${pct}%` as any }]}
              />
            </View>
          </View>

          <View style={{ gap: 12, marginBottom: 28 }}>
            {tasks.map((task) => (
              <TouchableOpacity key={task.id} style={styles.taskRow} activeOpacity={0.85} onPress={() => toggle(task.id)}>
                <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
                  {task.done && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{t(task.titleKey)}</Text>
                  {task.hintKey && !task.done && <Text style={styles.taskHint}>{t(task.hintKey)}</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity activeOpacity={0.85}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
              <Text style={styles.ctaText}>{t('todaysTasks.continue')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Missiya alt-action */}
        <View style={ttActStyles.section}>
          <View style={ttActStyles.row}>
            <TouchableOpacity style={ttActStyles.card} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.MissionStart)}>
              <Ionicons name="flame" size={20} color={Colors.primary} />
              <Text style={ttActStyles.cardTitle}>{t('todaysTasks.missionStart')}</Text>
              <Text style={ttActStyles.cardSub}>{t('todaysTasks.missionStartSub')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ttActStyles.card} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.MissionProgress)}>
              <Ionicons name="ribbon" size={20} color={Colors.primary} />
              <Text style={ttActStyles.cardTitle}>{t('todaysTasks.missionProgress')}</Text>
              <Text style={ttActStyles.cardSub}>{t('todaysTasks.missionProgressSub')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ttActStyles = StyleSheet.create({
  section: { marginTop: 24 },
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1, padding: 14, borderRadius: 16, gap: 6,
    backgroundColor: Colors.surfaceLowest, borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 11, color: Colors.textSecondary },
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  hero: { fontSize: 36, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.6, lineHeight: 42 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  taskCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 28,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
    position: 'relative',
  },
  streakBadge: {
    position: 'absolute', top: 24, right: 24,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFF4E5',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 28, paddingRight: 64 },

  progressTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  progressLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1.2 },
  progressValue: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  progressTrack: { height: 12, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },

  taskRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    padding: 16, borderRadius: 12,
    backgroundColor: Colors.surfaceLow + '80',
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkboxDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  taskTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  taskTitleDone: { textDecorationLine: 'line-through', opacity: 0.6 },
  taskHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 18, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
