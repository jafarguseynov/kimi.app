import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function BookingRejectedScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dərs Müraciəti</Text>
        <Text style={styles.headerBrand}>Kimi.az</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mascot */}
        <View style={styles.mascotSection}>
          <View style={styles.mascotAura} pointerEvents="none" />
          <View style={styles.mascotWrap}>
            <Ionicons name="hardware-chip-outline" size={120} color={Colors.primary + '80'} />
            <View style={styles.regretPill}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.regretPillText}>Təəssüf edirik</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Müraciət rədd edildi</Text>
          <Text style={styles.subtitle}>
            Təəssüf ki, müəllim hazırda bu dərsi keçə bilmir. Amma narahat olma, sənin üçün yüzlərlə başqa mükəmməl müəllimimiz var!
          </Text>
        </View>

        {/* Bento suggestion cards */}
        <View style={styles.bentoRow}>
          <TouchableOpacity
            style={styles.bentoCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.TeacherList)}
          >
            <View>
              <Ionicons name="search" size={22} color={Colors.primary} />
              <Text style={styles.bentoTitle}>Top Müəllimlər</Text>
              <Text style={styles.bentoSub}>Reytinqi 4.9+ olanlar</Text>
            </View>
            <View style={styles.avatarStack}>
              <View style={[styles.avatarDot, { backgroundColor: '#fde68a', zIndex: 4 }]} />
              <View style={[styles.avatarDot, { backgroundColor: '#bfdbfe', marginLeft: -8, zIndex: 3 }]} />
              <View style={[styles.avatarDot, { backgroundColor: '#fecaca', marginLeft: -8, zIndex: 2 }]} />
              <View style={[styles.avatarDot, styles.avatarCount, { marginLeft: -8, zIndex: 1 }]}>
                <Text style={styles.avatarCountText}>+40</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.bentoCard}>
            <View>
              <Ionicons name="sparkles" size={22} color={Colors.tertiary} />
              <Text style={styles.bentoTitle}>Sürətli Seçim</Text>
              <Text style={styles.bentoSub}>Sənə uyğun ən yaxşı alternativ</Text>
            </View>
            <View style={styles.aiChip}>
              <Text style={styles.aiChipText}>AI Tövsiyəsi</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate(Routes.TeacherList)}
          >
            <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.primaryBtnText}>Başqa müəllimlərə bax</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('HomeMain' as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Ana səhifəyə qayıt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },
  headerBrand: { fontSize: 16, fontWeight: '800', color: Colors.primaryDim },

  scroll: { padding: 24, gap: 24, paddingBottom: 48, alignItems: 'center' },

  mascotSection: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  mascotAura: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: Colors.primaryFixed + '14',
  },
  mascotWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', height: '100%' },
  regretPill: {
    position: 'absolute', top: 12, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceLowest,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 2,
  },
  regretPillText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },

  titleSection: { alignItems: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, textAlign: 'center', maxWidth: 340 },

  bentoRow: { width: '100%', flexDirection: 'row', gap: 12 },
  bentoCard: {
    flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 18,
    minHeight: 160, justifyContent: 'space-between',
  },
  bentoTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginTop: 10 },
  bentoSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  avatarStack: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  avatarDot: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: '#fff',
  },
  avatarCount: { backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  avatarCountText: { fontSize: 9, fontWeight: '800', color: Colors.primary },
  aiChip: {
    alignSelf: 'flex-start', backgroundColor: Colors.surfaceLowest,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  aiChipText: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  actions: { width: '100%', gap: 12, maxWidth: 360 },
  primaryBtn: {
    width: '100%', height: 58, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    width: '100%', height: 58, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
});
