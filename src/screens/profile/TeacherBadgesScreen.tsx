import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

interface Badge {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  bg: string;
  locked?: boolean;
  lockHint?: string;
  highlight?: boolean;
}

const BADGES: Badge[] = [
  { id: '1', title: 'Top müəllim',          desc: 'Ayın ən yaxşı müəllimi',           emoji: '🏆', bg: Colors.primary + '1A', highlight: true },
  { id: '2', title: 'Sürətli cavab verən', desc: 'Sualları 5 dəqiqədən tez cavablayır', emoji: '⚡', bg: Colors.tertiaryContainer + '4D' },
  { id: '3', title: 'Yüksək keyfiyyət',    desc: 'Tələbələrdən 5 ulduzlu rəylər',     emoji: '⭐', bg: '#FFF3E0' },
  { id: '4', title: 'Dəqiq müəllim',       desc: 'Açmaq üçün 50 cavab ver',           emoji: '🎯', bg: Colors.surfaceLow, locked: true, lockHint: '🔒' },
];

export default function TeacherBadgesScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ağıllı Təhsil</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.heroTitle}>Nailiyyətlərinlə{'\n'}fəxr edirik!</Text>
            <Text style={styles.heroSub}>Sizin aktivliyiniz və dəstəyiniz tələbələr üçün çox önəmlidir.</Text>
          </View>
          <View style={styles.heroEmojiWrap}>
            <Text style={styles.heroEmoji}>🤖</Text>
          </View>
        </View>

        {/* Grid */}
        <Text style={styles.sectionTitle}>Sənin nailiyyətlərin</Text>
        <View style={styles.grid}>
          {BADGES.map((b) => (
            <View key={b.id} style={[styles.card, b.locked && styles.cardLocked]}>
              <View style={[styles.badgeIcon, { backgroundColor: b.bg }]}>
                {b.locked ? (
                  <View style={styles.lockWrap}>
                    <Ionicons name="lock-closed" size={24} color={Colors.textSecondary} />
                    <Text style={styles.lockEmoji}>🎯</Text>
                  </View>
                ) : (
                  <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                )}
              </View>
              <Text style={[styles.cardTitle, b.highlight && { color: Colors.primary }, b.locked && { color: Colors.textSecondary }]} numberOfLines={1}>
                {b.title}
              </Text>
              <Text style={[styles.cardDesc, b.locked && { color: Colors.textMuted }]} numberOfLines={2}>
                {b.desc}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary, flex: 1, textAlign: 'center' },

  scroll: { padding: 20, gap: 24, paddingBottom: 32 },

  heroCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLow, borderRadius: 24, padding: 24,
    position: 'relative', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.primary, lineHeight: 32, marginBottom: 8 },
  heroSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  heroEmojiWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + '14',
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 40 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47.5%',
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 18, elevation: 2,
  },
  cardLocked: { backgroundColor: Colors.surfaceLow, opacity: 0.85, shadowOpacity: 0 },
  badgeIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  badgeEmoji: { fontSize: 28 },
  lockWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  lockEmoji: { position: 'absolute', top: -8, right: -10, fontSize: 14, opacity: 0.6 },

  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4, textAlign: 'center' },
  cardDesc: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', lineHeight: 15 },
});
