import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function ConnectionSuccessScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('connectionSuccess.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success indicator */}
        <View style={styles.successSection}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark-circle" size={56} color={Colors.tertiary} />
          </View>
          <Text style={styles.successTitle}>{t('connectionSuccess.successTitle')}</Text>
        </View>

        {/* Child info card */}
        <View style={styles.childCard}>
          <View style={styles.childCardDecor} />
          <View style={styles.childCardContent}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>CY</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            </View>
            <Text style={styles.childName}>Cəfər Yusifov</Text>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>{t('connectionSuccess.gradeBadge')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="school-outline" size={20} color={Colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>{t('connectionSuccess.schoolLabel')}</Text>
                <Text style={styles.detailValue}>23 nömrəli tam orta məktəb</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>{t('connectionSuccess.yearLabel')}</Text>
                <Text style={styles.detailValue}>2023 - 2024</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mascot speech section */}
        <View style={styles.mascotSection}>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {t('connectionSuccess.speech')}
            </Text>
          </View>
          <View style={styles.speechArrow} />
          <View style={styles.mascotCircle}>
            <Ionicons name="hardware-chip-outline" size={40} color={Colors.primary} />
            <View style={styles.onlineDot} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.ParentChildren)}>
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.primaryBtnText}>{t('connectionSuccess.goPanel')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 24, gap: 20, paddingBottom: 120, alignItems: 'center' },

  successSection: { alignItems: 'center', gap: 16, marginBottom: 8 },
  successCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.tertiary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 4,
  },
  successTitle: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },

  childCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
    overflow: 'hidden', position: 'relative',
  },
  childCardDecor: {
    position: 'absolute', top: 0, right: 0,
    width: 128, height: 128, borderBottomLeftRadius: 128,
    opacity: 0.05, backgroundColor: Colors.primary,
  },
  childCardContent: { alignItems: 'center', gap: 8 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    borderWidth: 4, borderColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: Colors.primary },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.tertiary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.surfaceLowest,
  },
  childName: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  gradeBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8,
  },
  gradeBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  divider: { width: '100%', height: 1, backgroundColor: Colors.borderLight, marginVertical: 4 },
  detailRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 4 },
  detailIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  detailLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  mascotSection: { alignItems: 'center' },
  speechBubble: {
    backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  speechText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  speechArrow: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: Colors.surfaceLow,
  },
  mascotCircle: {
    width: 80, height: 80, borderRadius: 40, marginTop: 0,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  onlineDot: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.tertiaryContainer,
    borderWidth: 2, borderColor: Colors.surfaceLowest,
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, paddingBottom: 32, backgroundColor: Colors.background,
  },
  primaryBtn: {
    height: 60, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
