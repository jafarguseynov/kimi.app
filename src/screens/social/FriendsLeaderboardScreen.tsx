import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const AVATAR = (seed: string) =>
  `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundColor=eef1f3&textColor=006190`;

type Tab = 'week' | 'month';

interface RankRow {
  rank: number;
  name: string;
  points: number;
  sub?: string;
  isYou?: boolean;
  weekDelta?: number;
  initial?: string;
}

const ROWS: RankRow[] = [
  { rank: 4, name: 'Aysel', points: 680, sub: 'Cəmi 10 dərs' },
  { rank: 5, name: 'Sən', points: 615, isYou: true, weekDelta: 20 },
  { rank: 6, name: 'Tural', points: 590, sub: 'Cəmi 8 dərs' },
  { rank: 7, name: 'Nigar', points: 240, sub: 'Yeni iştirakçı', initial: 'N' },
];

export default function FriendsLeaderboardScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('week');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={6} style={styles.avatarWrap}>
            <Image source={{ uri: AVATAR('Sən') }} style={styles.avatar} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('social.friendsTop')}</Text>
        </View>
        <TouchableOpacity hitSlop={6} style={styles.bellBtn}>
          <Ionicons name="notifications" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pair-tab switcher: Hamı / Dostlar */}
        <View style={pairTab.row}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.replace(Routes.LeaderboardDetail)}
            style={pairTab.btn}
          >
            <Text style={pairTab.text}>{t('social.all')}</Text>
          </TouchableOpacity>
          <View style={[pairTab.btn, pairTab.btnActive]}>
            <Text style={[pairTab.text, pairTab.textActive]}>{t('social.friends')}</Text>
          </View>
        </View>

        {/* Segmented tabs */}
        <View style={styles.segment}>
          <TouchableOpacity
            style={[styles.segmentBtn, tab === 'week' && styles.segmentBtnActive]}
            activeOpacity={0.85}
            onPress={() => setTab('week')}
          >
            <Text style={[styles.segmentText, tab === 'week' && styles.segmentTextActive]}>{t('social.thisWeek')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, tab === 'month' && styles.segmentBtnActive]}
            activeOpacity={0.85}
            onPress={() => setTab('month')}
          >
            <Text style={[styles.segmentText, tab === 'month' && styles.segmentTextActive]}>{t('social.thisMonth')}</Text>
          </TouchableOpacity>
        </View>

        {/* Podium */}
        <View style={styles.podium}>
          {/* 2nd */}
          <View style={[styles.podiumCol, { marginTop: 24 }]}>
            <View style={styles.silverAvatarWrap}>
              <Image source={{ uri: AVATAR('Leyla') }} style={styles.podiumAvatarSm} />
              <View style={styles.medalBubble}><Text style={styles.medal}>🥈</Text></View>
            </View>
            <Text style={styles.podiumName}>Leyla</Text>
            <Text style={styles.podiumPts}>850 {t('social.points')}</Text>
            <View style={[styles.podiumBar, { height: 90, backgroundColor: Colors.surfaceLow }]} />
          </View>

          {/* 1st */}
          <View style={[styles.podiumCol, { marginTop: -8 }]}>
            <View style={styles.goldAvatarWrap}>
              <View style={styles.goldGlow} />
              <Image source={{ uri: AVATAR('Kamran') }} style={styles.podiumAvatarLg} />
              <View style={[styles.medalBubble, styles.medalBubbleLg]}><Text style={styles.medalLg}>🥇</Text></View>
            </View>
            <Text style={styles.podiumNameLg}>Kamran</Text>
            <Text style={styles.podiumPtsLg}>1,240 {t('social.points')}</Text>
            <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[styles.podiumBar, { height: 120 }]}>
              <Text style={styles.podiumBarNum}>1</Text>
            </LinearGradient>
          </View>

          {/* 3rd */}
          <View style={[styles.podiumCol, { marginTop: 40 }]}>
            <View style={styles.bronzeAvatarWrap}>
              <Image source={{ uri: AVATAR('Ramin') }} style={styles.podiumAvatarXs} />
              <View style={styles.medalBubble}><Text style={styles.medal}>🥉</Text></View>
            </View>
            <Text style={styles.podiumName}>Ramin</Text>
            <Text style={styles.podiumPts}>720 {t('social.points')}</Text>
            <View style={[styles.podiumBar, { height: 75, backgroundColor: Colors.surfaceHigh }]} />
          </View>
        </View>

        {/* Ranking list */}
        <View style={{ gap: 12 }}>
          {ROWS.map((r) => (
            <View
              key={r.rank}
              style={[
                styles.row,
                r.isYou && styles.rowYou,
              ]}
            >
              {r.isYou && <View style={styles.youStripe} />}
              <Text style={[styles.rowRank, r.isYou && { color: Colors.textPrimary }]}>{r.rank}</Text>
              {r.initial ? (
                <View style={[styles.rowAvatar, styles.rowAvatarInitial]}>
                  <Text style={styles.rowAvatarInitialText}>{r.initial}</Text>
                </View>
              ) : (
                <View style={r.isYou ? styles.rowAvatarRing : null}>
                  <Image source={{ uri: AVATAR(r.name) }} style={styles.rowAvatar} />
                </View>
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.rowName, r.isYou && { fontWeight: '700' }]} numberOfLines={1}>{r.isYou ? t('social.you') : r.name}</Text>
                {r.isYou && r.weekDelta ? (
                  <View style={styles.deltaPill}>
                    <Ionicons name="trending-up" size={11} color={Colors.tertiary} />
                    <Text style={styles.deltaText}>{t('social.weekDelta', { delta: r.weekDelta })}</Text>
                  </View>
                ) : (
                  r.sub && <Text style={styles.rowSub} numberOfLines={1}>{r.sub}</Text>
                )}
              </View>
              <View style={styles.ptsWrap}>
                <Text style={styles.ptsValue}>{r.points}</Text>
                <Text style={styles.ptsLabel}>{t('social.points')}</Text>
              </View>
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
    paddingHorizontal: 16, height: 64,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant + '4D',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrap: {
    width: 40, height: 40, borderRadius: 20, overflow: 'hidden',
    backgroundColor: Colors.surfaceHigh,
  },
  avatar: { width: '100%', height: '100%' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 24 },

  segment: {
    flexDirection: 'row', padding: 4, borderRadius: 999,
    backgroundColor: Colors.surfaceLow, gap: 4,
  },
  segmentBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  segmentText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.primary },

  // Podium
  podium: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    paddingHorizontal: 8, gap: 8,
  },
  podiumCol: { flex: 1, alignItems: 'center' },

  silverAvatarWrap: { position: 'relative', width: 64, height: 64, marginBottom: 8 },
  bronzeAvatarWrap: { position: 'relative', width: 56, height: 56, marginBottom: 8 },
  goldAvatarWrap: { position: 'relative', width: 88, height: 88, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  goldGlow: {
    position: 'absolute', width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primaryFixed, opacity: 0.35,
  },
  podiumAvatarSm: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 4, borderColor: Colors.background,
    backgroundColor: Colors.surfaceHigh,
  },
  podiumAvatarXs: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 4, borderColor: Colors.background,
    backgroundColor: Colors.surfaceHigh,
  },
  podiumAvatarLg: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 4, borderColor: Colors.surfaceLowest,
    backgroundColor: Colors.surfaceHigh,
  },
  medalBubble: {
    position: 'absolute', bottom: -6, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 2, borderColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  medalBubbleLg: {
    bottom: -8, right: undefined, left: '50%', marginLeft: -16,
    width: 32, height: 32, borderRadius: 16,
  },
  medal: { fontSize: 14 },
  medalLg: { fontSize: 18 },

  podiumName: { marginTop: 8, fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  podiumNameLg: { marginTop: 14, fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  podiumPts: { marginTop: 2, fontSize: 11, fontWeight: '600', color: Colors.primary },
  podiumPtsLg: { marginTop: 2, fontSize: 13, fontWeight: '700', color: Colors.primary },
  podiumBar: {
    width: '100%', marginTop: 10, borderTopLeftRadius: 16, borderTopRightRadius: 16,
    alignItems: 'center', paddingTop: 6,
  },
  podiumBarNum: { fontSize: 22, fontWeight: '700', color: '#ffffff', opacity: 0.5 },

  // Rows
  row: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  rowYou: {
    backgroundColor: Colors.surfaceLow,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  youStripe: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 4, backgroundColor: Colors.primary,
    borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
  },
  rowRank: {
    width: 24, fontSize: 18, fontWeight: '700', color: Colors.outlineVariant, textAlign: 'center',
  },
  rowAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceHigh,
  },
  rowAvatarRing: {
    borderWidth: 2, borderColor: Colors.primary,
    borderRadius: 24, padding: 1,
  },
  rowAvatarInitial: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
  },
  rowAvatarInitialText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  rowName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  rowSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  deltaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
    marginTop: 4,
  },
  deltaText: { fontSize: 10, fontWeight: '700', color: Colors.tertiary },

  ptsWrap: { alignItems: 'flex-end' },
  ptsValue: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  ptsLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
});

const pairTab = StyleSheet.create({
  row: {
    flexDirection: 'row', gap: 4,
    backgroundColor: Colors.surfaceLow,
    padding: 4, borderRadius: 999,
  },
  btn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999 },
  btnActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  text: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  textActive: { fontWeight: '800', color: Colors.primary },
});
