import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.LiveExamWaiting>;
  route: RouteProp<ExamStackParamList, typeof Routes.LiveExamWaiting>;
};

export default function LiveExamWaitingScreen({ navigation, route }: Props) {
  const { title = 'Riyaziyyat' } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="close" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rəqib gözlənilir...</Text>
        </View>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>Canlı</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.subjectChip}>
            <Text style={styles.subjectChipText}>{title} • Səviyyə B1</Text>
          </View>
          <Text style={styles.heroTitle}>Uyğun rəqib{'\n'}<Text style={styles.heroTitlePrimary}>axtarılır...</Text></Text>
          <Text style={styles.heroSub}>Sizin bilik səviyyənizə uyğun ən yaxşı rəqiblərdən biri seçilir.</Text>
        </View>

        {/* Arena */}
        <View style={styles.arenaWrap}>
          {/* Concentric rings */}
          <View style={[styles.ring, { left: 0, right: 0, top: 0, bottom: 0, borderColor: Colors.primary + '0D' }]} />
          <View style={[styles.ring, { left: '10%', right: '10%', top: '10%', bottom: '10%', borderColor: Colors.primary + '1A' }]} />
          <View style={[styles.ring, { left: '20%', right: '20%', top: '20%', bottom: '20%', borderColor: Colors.primary + '33' }]} />
          <View style={[styles.ring, { left: '30%', right: '30%', top: '30%', bottom: '30%', borderColor: Colors.primary + '4D' }]} />

          {/* VS badge — centered absolute */}
          <View style={styles.vsCenterLayer} pointerEvents="none">
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>
          </View>

          {/* User — left */}
          <View style={styles.arenaUser}>
            <View style={styles.userAuraWrap}>
              <View style={styles.userAura} />
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={40} color={Colors.primary} />
              </View>
              <View style={styles.onlineDot} />
            </View>
            <Text style={styles.arenaName}>Siz</Text>
            <Text style={styles.arenaXP}>1,240 XP</Text>
          </View>

          {/* Opponent — right */}
          <View style={styles.arenaOpponent}>
            <View style={styles.opponentAuraWrap}>
              <View style={styles.opponentAura} />
              <View style={styles.opponentAvatar}>
                <Ionicons name="person-outline" size={36} color={Colors.primary + '66'} />
                <View style={styles.opponentScanOverlay} />
              </View>
            </View>
            <Text style={styles.arenaNameMuted}>Gözlənilir</Text>
            <Text style={styles.arenaXPMuted}>Skan edilir...</Text>
          </View>

          {/* Kimi tooltip */}
          <View style={styles.kimiTooltip}>
            <View style={styles.kimiTooltipIcon}>
              <Ionicons name="hardware-chip-outline" size={16} color="#fff" />
            </View>
            <View>
              <Text style={styles.kimiTooltipLabel}>Kimi Mesajı</Text>
              <Text style={styles.kimiTooltipText}>Rəqib 5 saniyəyə hazır olacaq!</Text>
            </View>
          </View>
        </View>

        {/* Tip */}
        <View style={styles.tipRow}>
          <Ionicons name="bulb-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.tipText}>Bilirsinizmi? Sürətli cavablar əlavə xal qazandırır.</Text>
        </View>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close-circle-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.cancelBtnText}>Axtarışı dayandır</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 56,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },
  liveBadge: {
    backgroundColor: Colors.primary + '1A', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  liveBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },

  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, alignItems: 'center', gap: 32 },

  infoSection: { alignItems: 'center', gap: 12 },
  subjectChip: {
    backgroundColor: Colors.surfaceHigh, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  subjectChipText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { fontSize: 40, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', lineHeight: 48, letterSpacing: -0.5 },
  heroTitlePrimary: { color: Colors.primary },
  heroSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 22 },

  arenaWrap: {
    width: '100%', aspectRatio: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    position: 'relative',
  },
  ring: {
    position: 'absolute', borderRadius: 9999,
    borderWidth: 1,
  },
  vsCenterLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 20,
  },
  vsBadge: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.surfaceLow,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  vsText: { fontSize: 14, fontWeight: '800', color: Colors.primary, fontStyle: 'italic' },

  arenaUser: { alignItems: 'center', gap: 8, zIndex: 10 },
  userAuraWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  userAura: {
    position: 'absolute', width: 112, height: 112, borderRadius: 56,
    backgroundColor: Colors.primary + '1A',
  },
  userAvatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 4, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4,
  },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#22c55e',
    borderWidth: 3, borderColor: '#fff',
    zIndex: 5,
  },
  arenaName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  arenaXP: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5 },

  arenaOpponent: { alignItems: 'center', gap: 8, zIndex: 10 },
  opponentAuraWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  opponentAura: {
    position: 'absolute', width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primary + '1A', opacity: 0.5,
  },
  opponentAvatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.surfaceLow,
    borderWidth: 4, borderStyle: 'dashed', borderColor: Colors.primary + '4D',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  opponentScanOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
    backgroundColor: Colors.primary + '1A',
  },
  arenaNameMuted: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary + '66' },
  arenaXPMuted: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary + '66', textTransform: 'uppercase', letterSpacing: 1.5 },

  kimiTooltip: {
    position: 'absolute', bottom: 16, right: 40,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 30,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 25, elevation: 4,
  },
  kimiTooltipIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  kimiTooltipLabel: { fontSize: 9, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  kimiTooltipText: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },

  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999,
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
});
