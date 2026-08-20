import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { getGamification, getXpHistory, XpHistoryItem } from '../../api/gamification.api';
import ProgressBar from '../../components/progress/ProgressBar';
import { useReturnTab } from '../../hooks/useReturnTab';

/** Hər XP hadisəsi üçün ikon — tarixçəni gözlə oxumaq asan olsun. */
const ICON: Record<string, string> = {
  question_correct: '✅',
  exam_completed: '📝',
  exam_high_score: '🌟',
  daily_challenge_completed: '⚡',
  daily_goal_completed: '🎯',
  streak_bonus: '🔥',
  achievement_unlocked: '🏅',
  duel_win: '⚔️',
  spin_reward: '🎡',
  mission_claimed: '🎁',
  legacy_balance: '📦',
};

/**
 * XP tarixçəsi — "bu XP haradan gəldi?" sualının cavabı.
 * Məlumat tamamilə serverin hadisə jurnalındandır (`xp_events`).
 */
export default function XpHistoryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  useReturnTab();

  const { data: state } = useQuery({ queryKey: ['gamification'], queryFn: getGamification, retry: false });
  const { data: items, isLoading } = useQuery({
    queryKey: ['xp-history'],
    queryFn: () => getXpHistory(100),
    retry: false,
  });

  const renderItem = ({ item }: { item: XpHistoryItem }) => {
    const d = new Date(item.createdAt);
    const meta = item.meta ?? {};
    const detail = meta.examTitle ?? meta.title ?? meta.label ?? null;
    return (
      <View style={s.row}>
        <View style={s.rowIcon}>
          <Text style={{ fontSize: 17 }}>{ICON[item.type] ?? '⚡'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.rowTitle} numberOfLines={1}>{item.label}</Text>
          <Text style={s.rowSub} numberOfLines={1}>
            {detail ? `${detail} · ` : ''}
            {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={s.rowXp}>+{item.amount}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('progress.xpHistoryTitle')}</Text>
        <View style={s.headerBtn} />
      </View>

      {/* Səviyyə xülasəsi */}
      {state && (
        <View style={s.summary}>
          <View style={s.summaryTop}>
            <Text style={s.summaryXp}>⚡ {state.xp.toLocaleString()} XP</Text>
            <View style={s.levelChip}>
              <Text style={s.levelChipText}>{t('progress.level', { n: state.level })}</Text>
            </View>
          </View>
          <ProgressBar
            progress={state.xpForLevel > 0 ? state.xpIntoLevel / state.xpForLevel : 0}
            colors={[Colors.gradientStart, Colors.gradientEnd]}
          />
          <Text style={s.summarySub}>
            {t('progress.toNextLevel', { xp: state.xpToNextLevel.toLocaleString() })}
          </Text>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={items ?? []}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 34 }}>⚡</Text>
              <Text style={s.emptyTitle}>{t('progress.xpHistoryEmptyTitle')}</Text>
              <Text style={s.emptySub}>{t('progress.xpHistoryEmptySub')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '55',
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },

  summary: {
    margin: 16, padding: 16, gap: 8,
    backgroundColor: Colors.surface, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.outlineVariant + '55',
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryXp: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
  summarySub: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  levelChip: { backgroundColor: Colors.primary + '14', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  levelChipText: { fontSize: 11, fontWeight: '800', color: Colors.primary },

  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '40',
  },
  rowIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.primary + '0D',
    alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  rowSub: { fontSize: 11.5, color: Colors.textMuted, marginTop: 2 },
  rowXp: { fontSize: 15, fontWeight: '900', color: Colors.tertiary },

  empty: { alignItems: 'center', gap: 6, paddingTop: 50 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  emptySub: { fontSize: 12.5, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 30 },
});
