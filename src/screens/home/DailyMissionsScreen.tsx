import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import api from '../../api/client';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.DailyMissions>;
};

interface Mission {
  id: string;
  type: 'exam' | 'flashcard' | 'question';
  title: string;
  target: number;
  xpReward: number;
  progress?: number;
  completed?: boolean;
}

const TYPE_CONFIG: Record<string, { icon: keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap; color: string; bg: string; route?: string }> = {
  exam: { icon: 'document-text-outline', color: Colors.primary, bg: Colors.primaryLight, route: 'Exams' },
  flashcard: { icon: 'albums-outline', color: '#7c3aed', bg: '#f3e8ff', route: 'Learn' },
  question: { icon: 'help-circle-outline', color: '#d97706', bg: '#fef3c7', route: 'Marketplace' },
};

export default function DailyMissionsScreen({ navigation }: Props) {
  const { data: missions = [], isLoading } = useQuery<Mission[]>({
    queryKey: ['dailyMissions'],
    queryFn: () => api.get('/engagement/missions').then((r) => r.data),
  });

  const completedCount = missions.filter((m) => m.completed).length;
  const total = missions.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const totalXp = missions.reduce((s, m) => s + m.xpReward, 0);
  const earnedXp = missions.filter((m) => m.completed).reduce((s, m) => s + m.xpReward, 0);

  const goToMission = (m: Mission) => {
    const cfg = TYPE_CONFIG[m.type];
    if (!cfg?.route) return;
    const parent = navigation.getParent() as any;
    parent?.navigate(cfg.route);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gündəlik tapşırıqlar</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress hero */}
        <LinearGradient colors={GRADIENT} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View>
            <Text style={styles.heroLabel}>Bugünki proqres</Text>
            <Text style={styles.heroPct}>{pct}%</Text>
            <Text style={styles.heroSub}>{completedCount} / {total} tamamlandı</Text>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="flash" size={16} color="#fbbf24" />
            <Text style={styles.xpBadgeText}>{earnedXp} / {totalXp} XP</Text>
          </View>
        </LinearGradient>

        {/* Missions list */}
        {isLoading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : missions.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={56} color={Colors.primaryFixed} />
            <Text style={styles.emptyTitle}>Bütün tapşırıqlar tamamlandı!</Text>
            <Text style={styles.emptySub}>Sabah yeni tapşırıqlar üçün geri qayıt.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {missions.map((m) => {
              const cfg = TYPE_CONFIG[m.type] ?? TYPE_CONFIG.exam;
              const done = !!m.completed;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.missionCard, done && styles.missionCardDone]}
                  activeOpacity={0.85}
                  onPress={() => goToMission(m)}
                  disabled={done}
                >
                  <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon} size={24} color={cfg.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.missionTitle, done && styles.missionTitleDone]} numberOfLines={2}>{m.title}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="flash" size={12} color="#f59e0b" />
                      <Text style={styles.metaText}>{m.xpReward} XP</Text>
                    </View>
                  </View>
                  {done ? (
                    <Ionicons name="checkmark-circle" size={26} color={Colors.tertiary} />
                  ) : (
                    <Ionicons name="chevron-forward" size={22} color={Colors.outlineVariant} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 56,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 20, gap: 20, paddingBottom: 40 },

  heroCard: {
    borderRadius: 22, padding: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 4,
  },
  heroLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  heroPct: { fontSize: 48, fontWeight: '800', color: '#fff', letterSpacing: -1, lineHeight: 56 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  xpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
  },
  xpBadgeText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  list: { gap: 12 },
  missionCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  missionCardDone: { opacity: 0.6 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  missionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  missionTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  empty: { alignItems: 'center', paddingTop: 32, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});
