import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function ConnectionPendingScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('connectionPending.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mascot */}
        <View style={styles.mascotSection}>
          <View style={styles.mascotAura} />
          <LinearGradient
            colors={[Colors.surfaceLow, Colors.surfaceHigh]}
            style={styles.mascotBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="hardware-chip-outline" size={80} color={Colors.textMuted} />
          </LinearGradient>
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Text style={styles.title}>{t('connectionPending.title')}</Text>
          <Text style={styles.subtitle}>
            {t('connectionPending.subtitle')}
          </Text>
        </View>

        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={styles.statusIconWrap}>
              <Ionicons name="time-outline" size={28} color={Colors.warning} />
            </View>
            <View>
              <Text style={styles.statusLabel}>{t('connectionPending.statusLabel')}</Text>
              <Text style={styles.statusValue}>{t('connectionPending.statusValue')}</Text>
            </View>
          </View>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: Colors.warning }]} />
            <View style={[styles.dot, { backgroundColor: Colors.warning, opacity: 0.4 }]} />
            <View style={[styles.dot, { backgroundColor: Colors.warning, opacity: 0.2 }]} />
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('HomeMain' as never)}
        >
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.primaryBtnText}>{t('connectionPending.backHome')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>{t('connectionPending.cancelRequest')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 24, paddingBottom: 40, alignItems: 'center' },

  mascotSection: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  mascotAura: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: Colors.primary + '08',
  },
  mascotBox: {
    width: 240, height: 240, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },

  textSection: { alignItems: 'center', gap: 12, width: '100%' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },

  statusCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statusIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.warningLight,
    alignItems: 'center', justifyContent: 'center',
  },
  statusLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  statusValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  dotsRow: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },

  primaryBtn: {
    width: '100%', height: 60, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  cancelBtn: { width: '100%', height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.danger },
});
