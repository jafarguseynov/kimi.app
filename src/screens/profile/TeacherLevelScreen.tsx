import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const CURRENT_XP = 1200;
const NEXT_XP = 1500;
const PCT = Math.round((CURRENT_XP / NEXT_XP) * 100);

interface Perk { id: string; icon: keyof typeof Ionicons.glyphMap; iconBg: string; iconColor: string; titleKey: string; descKey: string; }
const PERKS: Perk[] = [
  { id: '1', icon: 'wallet',     iconBg: Colors.secondaryContainer, iconColor: Colors.primary,     titleKey: 'teacherLevel.perk1Title',  descKey: 'teacherLevel.perk1Desc' },
  { id: '2', icon: 'flash',      iconBg: Colors.tertiaryContainer,  iconColor: Colors.tertiary,    titleKey: 'teacherLevel.perk2Title', descKey: 'teacherLevel.perk2Desc' },
];

export default function TeacherLevelScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('teacherLevel.headerTitle')}</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('teacherLevel.title')}</Text>

        {/* Level card */}
        <View style={styles.levelCard}>
          <View style={styles.levelGlow} pointerEvents="none" />
          <View style={styles.trophyWrap}>
            <Ionicons name="trophy" size={56} color={Colors.primary} />
          </View>
          <Text style={styles.levelText}>{t('teacherLevel.level', { n: 5 })}</Text>

          <View style={{ width: '100%', marginTop: 20 }}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>{t('teacherLevel.xpLabel')}</Text>
              <Text style={styles.xpValue}>{CURRENT_XP} / {NEXT_XP} XP</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${PCT}%` as any }]}
              />
            </View>
            <Text style={styles.progressHint}>{t('teacherLevel.progressHint', { xp: NEXT_XP - CURRENT_XP })}</Text>
          </View>
        </View>

        {/* Perks */}
        <View style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>{t('teacherLevel.perksTitle')}</Text>
          {PERKS.map((p) => (
            <View key={p.id} style={styles.perkCard}>
              <View style={[styles.perkIcon, { backgroundColor: p.iconBg }]}>
                <Ionicons name={p.icon} size={22} color={p.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perkTitle}>{t(p.titleKey)}</Text>
                <Text style={styles.perkDesc}>{t(p.descKey)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity activeOpacity={0.85} style={{ marginTop: 4 }}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBtn}>
            <Text style={styles.ctaText}>{t('teacherLevel.cta')}</Text>
          </LinearGradient>
        </TouchableOpacity>

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
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, flex: 1, textAlign: 'center' },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  title: { fontSize: 30, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },

  levelCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 32,
    alignItems: 'center', overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  levelGlow: {
    position: 'absolute', top: -60, left: '50%', marginLeft: -96,
    width: 192, height: 192, borderRadius: 96, backgroundColor: Colors.primary + '14',
  },
  trophyWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  levelText: { fontSize: 40, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 },

  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  xpLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  xpValue: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  progressTrack: { height: 12, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressHint: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 12 },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  perkCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 16,
  },
  perkIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  perkTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  perkDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  ctaBtn: {
    paddingVertical: 18, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
