import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

interface Mission {
  id: string;
  type: 'exam' | 'flashcard' | 'question';
  title: string;
  target: number;
  xpReward: number;
}

const TYPE_ICONS: Record<string, string> = {
  exam: '📝',
  flashcard: '🃏',
  question: '💬',
};

export default function DailyMissionsWidget() {
  const { t } = useTranslation();
  const { data: missions = [] } = useQuery<Mission[]>({
    queryKey: ['dailyMissions'],
    queryFn: () => api.get('/engagement/missions').then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  if (!missions.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('missionsWidget.title')}</Text>
        <Text style={styles.subtitle}>{t('missionsWidget.refreshDaily')}</Text>
      </View>
      {missions.map((m) => (
        <View key={m.id} style={styles.mission}>
          <Text style={styles.icon}>{TYPE_ICONS[m.type] ?? '⭐'}</Text>
          <Text style={styles.missionTitle} numberOfLines={2}>{m.title}</Text>
          <View style={styles.xp}>
            <Text style={styles.xpText}>+{t('missions.rewardCoins', { n: m.xpReward })}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textMuted },
  mission: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  icon: { fontSize: 22, width: 32, textAlign: 'center' },
  missionTitle: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  xp: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: { fontSize: 12, fontWeight: '700', color: Colors.warning },
});
