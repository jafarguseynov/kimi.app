import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Params = {
  userScore?: number;
  opponentScore?: number;
  userName?: string;
  opponentName?: string;
  mode?: 'bot' | 'live';
  userCorrect?: number;
  opponentCorrect?: number;
  totalQuestions?: number;
  xpEarned?: number;
  medalsEarned?: number;
};

export default function CompetitionResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const p: Params = (route.params ?? {}) as Params;

  const userScore = p.userScore ?? 18;
  const opponentScore = p.opponentScore ?? 14;
  const xpEarned = p.xpEarned ?? 120;
  const medalsEarned = p.medalsEarned ?? 2;
  const userName = p.userName ?? 'Sən';
  const opponentName = p.opponentName ?? 'Rəqib';
  const mode = p.mode ?? 'bot';
  const userCorrect = p.userCorrect;
  const opponentCorrect = p.opponentCorrect;
  const totalQuestions = p.totalQuestions;
  const won = userScore > opponentScore;
  const draw = userScore === opponentScore;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yarışın Nəticəsi</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero — mascot + headline */}
        <View style={styles.hero}>
          <View style={styles.mascotWrap}>
            <View style={styles.mascotAura} />
            <LinearGradient
              colors={GRADIENT}
              style={styles.mascotRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.mascotInner}>
                <Ionicons
                  name={won ? 'trophy' : 'sad-outline'}
                  size={64}
                  color={won ? '#F59E0B' : Colors.textSecondary}
                />
              </View>
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>
            {draw ? 'Bərabərə!' : won ? 'Sən qalib gəldin 🎉' : 'Bu dəfə uduzdun 💪'}
          </Text>
          <Text style={styles.heroSub}>
            {draw
              ? 'Eyni xal — heç kim qalib deyil.'
              : won
              ? `${opponentName}-i məğlub etdin!`
              : `${opponentName} bu dəfə daha sürətli idi.`}
          </Text>
        </View>

        {/* Versus stats */}
        <View style={styles.versusRow}>
          <View style={[styles.statCard, won && styles.statCardWin, !won && !draw && styles.statCardLose]}>
            {!draw && (
              <View style={[styles.resultBadge, won ? styles.resultBadgeWin : styles.resultBadgeLose]}>
                <Ionicons
                  name={won ? 'trophy' : 'close-circle'}
                  size={11}
                  color="#fff"
                />
                <Text style={styles.resultBadgeText}>{won ? 'QALİB' : 'MƏĞLUB'}</Text>
              </View>
            )}
            <LinearGradient
              colors={GRADIENT}
              style={styles.statAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.statLabel} numberOfLines={1}>{userName.toUpperCase()}</Text>
            <Text style={[styles.statValue, won && { color: Colors.primary }]}>{userScore}</Text>
            <Text style={styles.statMeta}>xal</Text>
            {userCorrect !== undefined && totalQuestions !== undefined && (
              <Text style={styles.statSub}>{userCorrect}/{totalQuestions} doğru</Text>
            )}
          </View>

          <View style={[styles.statCard, !won && !draw && styles.statCardWin, won && styles.statCardLose]}>
            {!draw && (
              <View style={[styles.resultBadge, !won ? styles.resultBadgeWin : styles.resultBadgeLose]}>
                <Ionicons
                  name={!won ? 'trophy' : 'close-circle'}
                  size={11}
                  color="#fff"
                />
                <Text style={styles.resultBadgeText}>{!won ? 'QALİB' : 'MƏĞLUB'}</Text>
              </View>
            )}
            <View style={[styles.statAvatar, { backgroundColor: mode === 'live' ? '#FEF3C7' : Colors.surfaceContainer }]}>
              <Ionicons
                name={mode === 'live' ? 'person' : 'hardware-chip'}
                size={22}
                color={mode === 'live' ? '#F59E0B' : Colors.textSecondary}
              />
            </View>
            <Text style={styles.statLabel} numberOfLines={1}>{opponentName.toUpperCase()}</Text>
            <Text style={[styles.statValue, !won && !draw && { color: Colors.primary }]}>{opponentScore}</Text>
            <Text style={styles.statMeta}>xal</Text>
            {opponentCorrect !== undefined && totalQuestions !== undefined && (
              <Text style={styles.statSub}>{opponentCorrect}/{totalQuestions} doğru</Text>
            )}
          </View>
        </View>

        {/* Rewards */}
        <View style={styles.rewardsCard}>
          <View style={styles.rewardsHeader}>
            <Ionicons name="medal-outline" size={18} color={Colors.primary} />
            <Text style={styles.rewardsTitle}>Qazandığın mükafatlar</Text>
          </View>
          <View style={styles.rewardsBody}>
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="flash" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.rewardValue}>+{xpEarned} XP</Text>
              <Text style={styles.rewardLabel}>Təcrübə balı</Text>
            </View>
            <View style={styles.rewardDivider} />
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="ribbon" size={28} color="#F59E0B" />
              </View>
              <Text style={styles.rewardValue}>+{medalsEarned} Medal</Text>
              <Text style={styles.rewardLabel}>Uğur nişanı</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={{ width: '100%' }}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.ExamList as never)}
        >
          <LinearGradient
            colors={GRADIENT}
            style={styles.primaryBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="reload" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Yenidən oyna</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text style={styles.secondaryBtnText}>Ana səhifəyə qayıt</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 24 },

  hero: { alignItems: 'center', gap: 6 },
  mascotWrap: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  mascotAura: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: Colors.primary + '12',
  },
  mascotRing: {
    width: 152, height: 152, borderRadius: 76, padding: 6,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.2, shadowRadius: 32, elevation: 8,
  },
  mascotInner: {
    flex: 1, borderRadius: 70,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6, textAlign: 'center' },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },

  versusRow: { flexDirection: 'row', gap: 14 },
  statCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 22, alignItems: 'center', gap: 4,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.05, shadowRadius: 28, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  statCardWin: { borderColor: Colors.primary, borderWidth: 1.5, backgroundColor: '#F5F8FF' },
  statCardLose: { opacity: 0.85 },
  resultBadge: {
    position: 'absolute', top: -10, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    zIndex: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  resultBadgeWin: { backgroundColor: '#16A34A' },
  resultBadgeLose: { backgroundColor: '#9CA3AF' },
  resultBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 0.8 },
  statSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 6, fontWeight: '600' },
  statAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  statLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5 },
  statValue: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6 },
  statMeta: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },

  rewardsCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 22, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 1,
  },
  rewardsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rewardsTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  rewardsBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  rewardItem: { alignItems: 'center', gap: 6, flex: 1 },
  rewardIcon: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  rewardValue: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  rewardLabel: { fontSize: 10, color: Colors.textSecondary },
  rewardDivider: { width: 1, height: 48, backgroundColor: Colors.borderLight, marginHorizontal: 8 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 999, paddingVertical: 18,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  secondaryBtn: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 999, paddingVertical: 16, alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
});
