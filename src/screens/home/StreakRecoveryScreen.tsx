import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface Option { id: string; icon: keyof typeof Ionicons.glyphMap; iconBg: string; iconColor: string; titleKey: string; }
const OPTIONS: Option[] = [
  { id: 'bonus',  icon: 'star',          iconBg: Colors.tertiaryContainer, iconColor: Colors.tertiary, titleKey: 'streak.recUseBonus' },
  { id: 'points', icon: 'pricetag',      iconBg: Colors.secondaryContainer, iconColor: Colors.primary, titleKey: 'streak.recUsePoints' },
];

export default function StreakRecoveryScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.aura} pointerEvents="none" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Text style={styles.title}>{t('streak.recTitle')}</Text>
          <Text style={styles.sub}>{t('streak.recSub')}</Text>
        </View>

        {/* Broken flame visual */}
        <View style={styles.flameWrap}>
          <View style={styles.flameGlow} pointerEvents="none" />
          <Ionicons name="flame" size={100} color={Colors.dangerLight} />
          <Ionicons name="flash" size={56} color={Colors.surfaceLowest} style={styles.boltOverlay} />
        </View>

        {/* Recovery options card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('streak.recCardTitle')}</Text>
          <View style={{ gap: 12 }}>
            {OPTIONS.map((o) => (
              <TouchableOpacity key={o.id} activeOpacity={0.85} style={styles.optionBtn}>
                <View style={[styles.optionIcon, { backgroundColor: o.iconBg }]}>
                  <Ionicons name={o.icon} size={20} color={o.iconColor} />
                </View>
                <Text style={styles.optionText}>{t(o.titleKey)}</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTAs */}
        <View style={{ gap: 12, width: '100%' }}>
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t('streak.recover')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.ghostBtn}>
            <Text style={styles.ghostBtnText}>{t('streak.startNewStreak')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, position: 'relative', overflow: 'hidden' },
  aura: {
    position: 'absolute', top: -100, left: -100, right: -100, height: 400,
    backgroundColor: Colors.primaryFixed, opacity: 0.12, borderRadius: 999,
  },

  header: { paddingHorizontal: 16, paddingTop: 8, alignItems: 'flex-end' },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingHorizontal: 24, paddingTop: 24, alignItems: 'center', gap: 28 },

  title: { fontSize: 30, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.6 },
  sub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },

  flameWrap: {
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 30, elevation: 3,
    position: 'relative',
  },
  flameGlow: { position: 'absolute', inset: 0 as any, width: 192, height: 192, borderRadius: 96, backgroundColor: Colors.dangerLight, opacity: 0.4 },
  boltOverlay: { position: 'absolute' },

  card: {
    width: '100%',
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24, gap: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 22, elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },

  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999,
    backgroundColor: Colors.surfaceLow,
  },
  optionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  primaryBtn: {
    paddingVertical: 18, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 6,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  ghostBtn: { paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
  ghostBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
