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

export default function WithdrawalSuccessScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.withdrawSuccessHeader')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success indicator */}
        <View style={styles.successSection}>
          <View style={styles.successAura} />
          <View style={styles.successOuter}>
            <View style={styles.successInner}>
              <Ionicons name="checkmark" size={40} color={Colors.surfaceLowest} />
            </View>
          </View>
          <Text style={styles.successTitle}>{t('pay.requestAccepted')}</Text>
          <Text style={styles.successSubtitle}>
            {t('pay.requestAcceptedPre')}
            <Text style={styles.highlightText}>{t('pay.businessDaysInline')}</Text>
            {t('pay.requestAcceptedPost')}
          </Text>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardAccent} />
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryAmountLabel}>{t('pay.amount')}</Text>
              <Text style={styles.summaryAmount}>45.50 AZN</Text>
            </View>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.statusBadgeText}>{t('pay.processing')}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="card-outline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.detailRowLabel}>{t('pay.cardInfo')}</Text>
            </View>
            <Text style={styles.detailRowValue}>**** 1234</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="repeat-outline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.detailRowLabel}>{t('pay.date')}</Text>
            </View>
            <Text style={styles.detailRowValue}>24 May, 2024</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('HomeMain' as never)}>
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.primaryBtnText}>{t('pay.backHome')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(Routes.PayoutHistory)}
        >
          <Text style={styles.secondaryBtnText}>{t('pay.withdrawalHistory')}</Text>
        </TouchableOpacity>

        {/* Kimi insight */}
        <View style={styles.insightBox}>
          <View style={styles.insightIconWrap}>
            <Ionicons name="bulb-outline" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightLabel}>{t('pay.kimiTipLabel')}</Text>
            <Text style={styles.insightText}>
              {t('pay.withdrawTipText')}
            </Text>
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
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 20, paddingBottom: 40, alignItems: 'center' },

  successSection: { alignItems: 'center', gap: 16, width: '100%', marginBottom: 8, position: 'relative' },
  successAura: {
    position: 'absolute', top: -16, width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primary + '08',
  },
  successOuter: {
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: Colors.tertiaryContainer + '50',
    alignItems: 'center', justifyContent: 'center',
  },
  successInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.tertiary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.tertiary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  successTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  successSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  highlightText: { fontWeight: '700', color: Colors.primary },

  summaryCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
    position: 'relative', overflow: 'hidden', gap: 0,
  },
  cardAccent: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
    backgroundColor: Colors.primary, borderTopLeftRadius: 20, borderBottomLeftRadius: 20,
  },
  summaryTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20,
  },
  summaryAmountLabel: { fontSize: 12, fontWeight: '500', color: Colors.textMuted, marginBottom: 4 },
  summaryAmount: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  detailRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.surfaceLow,
  },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  detailRowLabel: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  detailRowValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  primaryBtn: {
    width: '100%', height: 60, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  secondaryBtn: {
    width: '100%', height: 56, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceLowest,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  insightBox: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    backgroundColor: Colors.primaryLight, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.primaryFixed + '30',
  },
  insightIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  insightLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  insightText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
