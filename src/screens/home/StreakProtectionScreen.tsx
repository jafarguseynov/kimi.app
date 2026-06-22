import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function StreakProtectionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentStreak = (route.params as any)?.currentStreak ?? 12;
  const { t } = useTranslation();

  const activate = () => {
    Alert.alert(
      t('streak.protActivatedTitle'),
      t('streak.protActivatedBody'),
      [{ text: t('streak.protGreat'), onPress: () => navigation.goBack() }],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kimi.az</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <LinearGradient
              colors={['#e0f2fe', '#bae6fd']}
              style={styles.frozenCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.frozenInner}>
                <Ionicons name="snow" size={70} color={Colors.primaryFixed} />
                <Ionicons name="flame" size={48} color={Colors.primary} style={styles.frozenFlame} />
              </View>
            </LinearGradient>
            <View style={styles.alertBadge}>
              <Ionicons name="alert" size={18} color="#fff" />
            </View>
          </View>
          <Text style={styles.heroTitle}>{t('streak.protHeroTitle')}</Text>
          <Text style={styles.heroSub}>{t('streak.protHeroSub')}</Text>
        </View>

        {/* Main card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBox}>
              <Ionicons name="shield-checkmark" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t('streak.protCardTitle')}</Text>
              <Text style={styles.cardSub}>{t('streak.protCardSub')}</Text>
            </View>
          </View>

          <View style={styles.streakStatRow}>
            <View style={styles.streakStatLeft}>
              <Ionicons name="flash" size={22} color="#F59E0B" />
              <Text style={styles.streakStatValue}>{t('streak.daysUnit', { n: currentStreak })}</Text>
            </View>
            <View style={styles.streakStatChip}>
              <Text style={styles.streakStatChipText}>{t('streak.protCurrentChip')}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={{ width: '100%' }}
            activeOpacity={0.9}
            onPress={activate}
          >
            <LinearGradient
              colors={GRADIENT}
              style={styles.primaryBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>{t('streak.protActivate')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryBtnText}>{t('streak.protContinue')}</Text>
          </TouchableOpacity>
        </View>

        {/* Bento info */}
        <View style={styles.bento}>
          <View style={styles.bentoCell}>
            <Ionicons name="time-outline" size={22} color={Colors.primary} />
            <Text style={styles.bentoValue}>{t('streak.protTime24h')}</Text>
            <Text style={styles.bentoLabel}>{t('streak.protTimeLeft')}</Text>
          </View>
          <View style={styles.bentoCell}>
            <Ionicons name="star" size={22} color={Colors.tertiary} />
            <Text style={styles.bentoValue}>{t('streak.protPremium')}</Text>
            <Text style={styles.bentoLabel}>{t('streak.protStatus')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },

  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40, gap: 24 },

  hero: { alignItems: 'center', gap: 14 },
  heroIconWrap: { width: 192, height: 192, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  frozenCircle: {
    width: 192, height: 192, borderRadius: 96,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 4,
  },
  frozenInner: { alignItems: 'center', justifyContent: 'center' },
  frozenFlame: { position: 'absolute', top: 50 },
  alertBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.error,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.error, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6, textAlign: 'center' },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },

  card: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 22, padding: 22, gap: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  cardHeaderRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  cardIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  streakStatRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLow,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
  },
  streakStatLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakStatValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  streakStatChip: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  streakStatChipText: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  secondaryBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },

  bento: { flexDirection: 'row', gap: 14 },
  bentoCell: {
    flex: 1, backgroundColor: Colors.surfaceLow,
    borderRadius: 18, padding: 18, gap: 6,
  },
  bentoValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 8 },
  bentoLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2 },
});
