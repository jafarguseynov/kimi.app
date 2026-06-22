import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
type Period = 'week' | 'month';

const AVATAR = (seed: string) => `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundColor=eef1f3&textColor=006190`;

interface Top { name: string; xp: number; medal: string; size: number; offset: number; }
const TOP3: Top[] = [
  { name: 'Rəşad N.',  xp: 980,  medal: '🥈', size: 80,  offset: 0 },
  { name: 'Aygün S.',  xp: 1250, medal: '🥇', size: 112, offset: -28 },
  { name: 'Emin Q.',   xp: 850,  medal: '🥉', size: 80,  offset: 0 },
];

interface Row { rank: number; name: string; answers: number; xp: number; me?: boolean; }
const ROWS: Row[] = [
  { rank: 4, name: 'Leyla M.',     answers: 42, xp: 720 },
  { rank: 5, name: 'Sən (Səbinə Ə.)', answers: 38, xp: 650, me: true },
  { rank: 6, name: 'Tural V.',     answers: 30, xp: 590 },
  { rank: 7, name: 'Nərmin K.',    answers: 25, xp: 510 },
];

export default function TopTeachersLeaderboardScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('week');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('topTeachers.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Period segmented */}
        <View style={styles.segmented}>
          {(['week', 'month'] as Period[]).map((p) => {
            const active = period === p;
            return (
              <TouchableOpacity
                key={p} style={[styles.segItem, active && styles.segActive]}
                activeOpacity={0.85} onPress={() => setPeriod(p)}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>
                  {p === 'week' ? t('topTeachers.week') : t('topTeachers.month')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Podium */}
        <View style={styles.podium}>
          {TOP3.map((top, idx) => {
            const winner = idx === 1;
            return (
              <View key={top.name} style={[styles.podiumItem, { marginTop: top.offset }]}>
                <View style={{ position: 'relative', marginBottom: 8 }}>
                  {winner && <View style={styles.winnerHalo} />}
                  <Image
                    source={{ uri: AVATAR(top.name) }}
                    style={[
                      styles.avatar,
                      { width: top.size, height: top.size, borderRadius: top.size / 2 },
                      winner ? styles.avatarWinner : styles.avatarRegular,
                    ]}
                  />
                  <View style={[styles.medalBubble, winner && styles.medalBubbleWinner]}>
                    <Text style={{ fontSize: winner ? 18 : 16 }}>{top.medal}</Text>
                  </View>
                </View>
                <Text style={[styles.podiumName, winner && { fontSize: 16, fontWeight: '800' }]} numberOfLines={1}>
                  {top.name}
                </Text>
                <Text style={[styles.podiumXp, winner && { fontWeight: '800', fontSize: 15 }]}>{top.xp} XP</Text>
              </View>
            );
          })}
        </View>

        {/* List */}
        <View style={{ gap: 12 }}>
          {ROWS.map((r) => (
            <View key={r.rank} style={[styles.row, r.me && styles.rowMe]}>
              {r.me && <View style={styles.meStripe} />}
              <Text style={[styles.rank, r.me && { color: Colors.primary }]}>{r.rank}</Text>
              <Image
                source={{ uri: AVATAR(r.name) }}
                style={[styles.rowAvatar, r.me && { borderWidth: 2, borderColor: Colors.primaryFixed }]}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowName, r.me && { color: Colors.primary, fontWeight: '700' }]} numberOfLines={1}>{r.name}</Text>
                <Text style={styles.rowMeta}>{t('topTeachers.answersCount', { count: r.answers })}</Text>
              </View>
              <Text style={styles.rowXp}>{r.xp} XP</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Decorative gradient ring used inline below */}
      <View pointerEvents="none" style={{ position: 'absolute', width: 0, height: 0 }}>
        <LinearGradient colors={GRADIENT} style={{ width: 1, height: 1 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(245,247,249,0.85)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 20, gap: 28, paddingBottom: 32 },

  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLow, borderRadius: 999, padding: 4,
  },
  segItem: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  segActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  segText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  segTextActive: { color: Colors.primary, fontWeight: '700' },

  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginTop: 16 },
  podiumItem: { flex: 1, alignItems: 'center' },
  winnerHalo: {
    position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 999, backgroundColor: Colors.primary + '40',
  },
  avatar: { backgroundColor: Colors.surfaceLow },
  avatarRegular: { borderWidth: 4, borderColor: Colors.surfaceLow },
  avatarWinner: { borderWidth: 4, borderColor: '#fff' },
  medalBubble: {
    position: 'absolute', bottom: -12, left: '50%', marginLeft: -16,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  medalBubbleWinner: {
    width: 40, height: 40, borderRadius: 20, marginLeft: -20,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
  },
  podiumName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginTop: 12, textAlign: 'center' },
  podiumXp: { fontSize: 13, fontWeight: '600', color: Colors.primary, marginTop: 4 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
    position: 'relative', overflow: 'hidden',
  },
  rowMe: { backgroundColor: Colors.secondaryContainer + '4D', borderColor: Colors.primaryFixed + '33' },
  meStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: Colors.primary },
  rank: { width: 24, textAlign: 'center', fontSize: 15, fontWeight: '800', color: Colors.textSecondary },
  rowAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceLow },
  rowName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  rowMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  rowXp: { fontSize: 14, fontWeight: '800', color: Colors.primary },
});
