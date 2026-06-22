import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function StreakWarningScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.brand}>Kimi.az</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Warning badge */}
        <View style={styles.warnPill}>
          <Ionicons name="warning" size={14} color={Colors.danger} />
          <Text style={styles.warnPillText}>{t('streak.warnTag')}</Text>
        </View>

        <Text style={styles.title}>{t('streak.warnTitle')}</Text>

        {/* Fading fire visual */}
        <View style={styles.flameWrap}>
          <View style={styles.flameGlow} pointerEvents="none" />
          <View style={styles.flameInner}>
            <Text style={{ fontSize: 56, opacity: 0.55 }}>🔥</Text>
          </View>
          <View style={[styles.smokeBlob, { top: -16, right: 32, width: 32, height: 32 }]} />
          <View style={[styles.smokeBlob, { top: 16, left: -16, width: 48, height: 48, opacity: 0.3 }]} />
        </View>

        {/* Main card */}
        <View style={styles.card}>
          <LinearGradient
            colors={[Colors.danger, Colors.dangerLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.cardStripe}
          />
          <Text style={styles.cardTitle}>{t('streak.warnCardTitle')}</Text>
          <Text style={styles.cardSub}>{t('streak.warnCardSub')}</Text>
        </View>

        {/* Actions */}
        <View style={{ gap: 12, width: '100%', marginTop: 4 }}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.goBack()}>
            <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t('streak.startNow')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.ghostBtn}>
            <Text style={styles.ghostBtnText}>{t('streak.remindLater')}</Text>
          </TouchableOpacity>
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
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 22, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },

  scroll: { paddingHorizontal: 24, paddingTop: 24, alignItems: 'center', gap: 32 },

  warnPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
    backgroundColor: Colors.dangerLight,
  },
  warnPillText: { fontSize: 13, fontWeight: '600', color: Colors.danger },

  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.4, lineHeight: 32 },

  flameWrap: { width: 192, height: 192, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  flameGlow: { position: 'absolute', width: 192, height: 192, borderRadius: 96, backgroundColor: Colors.dangerLight, opacity: 0.6 },
  flameInner: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 5,
  },
  smokeBlob: { position: 'absolute', borderRadius: 999, backgroundColor: Colors.surfaceVariant, opacity: 0.5 },

  card: {
    width: '100%',
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 32,
    overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 22, elevation: 2,
  },
  cardStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  cardSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

  primaryBtn: {
    paddingVertical: 18, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  ghostBtn: { paddingVertical: 16, borderRadius: 999, alignItems: 'center' },
  ghostBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
