import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.DailyMissions>;
};

export default function DailyMissionsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sənin proqresin</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main content */}
      <View style={styles.main}>
        {/* Circular progress widget */}
        <View style={styles.progressWrap}>
          {/* Glow aura */}
          <View style={styles.progressAura} pointerEvents="none" />
          {/* Outer track ring */}
          <View style={styles.progressTrack}>
            {/* Inner gradient fill ring */}
            <View style={styles.progressFillRing}>
              <LinearGradient
                colors={GRADIENT}
                style={styles.progressArcLeft}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </View>
            {/* White inner circle */}
            <View style={styles.progressInner}>
              <Text style={styles.progressPct}>66%</Text>
              <View style={styles.progressChip}>
                <Text style={styles.progressChipText}>2/3 tamamlandı</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Typography */}
        <View style={styles.textSection}>
          <Text style={styles.mainTitle}>Davam et, Kimi!</Text>
          <Text style={styles.mainSub}>
            Son tapşırıq qalıb. Bu günkü məqsədinə çatmaq üçün sadəcə bir addım uzaqdasan.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaWrap}
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
        >
          <LinearGradient
            colors={GRADIENT}
            style={styles.ctaBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaBtnText}>Davam et</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  backBtn: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 22, fontWeight: '800', color: Colors.textPrimary,
  },
  headerSpacer: { width: 48 },

  main: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, gap: 40, paddingBottom: 32,
  },

  progressWrap: {
    width: 256, height: 256,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  progressAura: {
    position: 'absolute',
    width: 256, height: 256, borderRadius: 128,
    backgroundColor: Colors.primaryFixed,
    opacity: 0.15,
    shadowColor: Colors.primaryFixed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 0,
  },
  progressTrack: {
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 10, borderColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryFixed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFillRing: {
    position: 'absolute',
    width: '100%', height: '100%',
    borderRadius: 120,
    borderWidth: 10, borderColor: Colors.primary,
    overflow: 'hidden',
  },
  progressArcLeft: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: '100%',
    opacity: 0,
  },
  progressInner: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  progressPct: {
    fontSize: 52, fontWeight: '800', color: Colors.primary,
    letterSpacing: -2,
  },
  progressChip: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6,
  },
  progressChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  textSection: { alignItems: 'center', gap: 12, maxWidth: 300 },
  mainTitle: {
    fontSize: 34, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.8,
  },
  mainSub: {
    fontSize: 15, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },

  ctaWrap: { width: '100%' },
  ctaBtn: {
    height: 60, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryFixed,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 25, elevation: 6,
  },
  ctaBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
