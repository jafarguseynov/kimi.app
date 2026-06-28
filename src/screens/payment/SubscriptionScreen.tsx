import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { PAYMENTS_ENABLED } from '../../config/iap';
import PaymentUnavailable from '../../components/PaymentUnavailable';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function SubscriptionScreen() {
  // App Store 3.1.1: iOS-da abunəlik/yeniləmə ekranı açılmır.
  if (!PAYMENTS_ENABLED) return <PaymentUnavailable />;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const [autoRenew, setAutoRenew] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.subHeader')}</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="help-circle-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Active plan card */}
        <LinearGradient colors={GRADIENT} style={styles.planCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.planBlob1} />
          <View style={styles.planBlob2} />
          <View style={styles.planCardTop}>
            <View>
              <Text style={styles.planCardLabel}>{t('pay.currentSub')}</Text>
              <Text style={styles.planCardTitle}>{t('pay.premiumPlan')}</Text>
              <Text style={styles.planCardDuration}>{t('pay.package12mo')}</Text>
            </View>
            <View style={styles.planBadgeBox}>
              <Ionicons name="ribbon" size={22} color="#fff" />
            </View>
          </View>
          <View style={styles.planActiveRow}>
            <View style={styles.planCheckCircle}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
            <Text style={styles.planActiveText}>{t('pay.subActive')}</Text>
          </View>
        </LinearGradient>

        {/* Details grid */}
        <View style={styles.detailsGrid}>
          <View style={[styles.detailCard, styles.detailHalf]}>
            <Text style={styles.detailLabel}>{t('pay.startDate')}</Text>
            <Text style={styles.detailValue}>15.01.2024</Text>
          </View>
          <View style={[styles.detailCard, styles.detailHalf]}>
            <Text style={styles.detailLabel}>{t('pay.endDate')}</Text>
            <Text style={styles.detailValue}>15.01.2025</Text>
          </View>
          <View style={[styles.detailCard, styles.detailFull]}>
            <View>
              <Text style={styles.detailLabel}>{t('pay.paymentMethod')}</Text>
              <View style={styles.payMethodRow}>
                <Ionicons name="card-outline" size={16} color={Colors.textPrimary} />
                <Text style={styles.detailValue}>•••• 4242</Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.tertiary} />
              <Text style={styles.verifiedText}>{t('pay.verified')}</Text>
            </View>
          </View>
        </View>

        {/* Auto-renew */}
        <View style={styles.autoRenewCard}>
          <View style={styles.autoRenewLeft}>
            <View style={styles.autoRenewIconBox}>
              <Ionicons name="refresh-outline" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.autoRenewTitle}>{t('pay.autoRenew')}</Text>
              <Text style={styles.autoRenewSub}>{t('pay.autoRenewSub')}</Text>
            </View>
          </View>
          <Switch
            value={autoRenew}
            onValueChange={setAutoRenew}
            trackColor={{ false: Colors.surfaceContainer, true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Actions */}
        <TouchableOpacity onPress={() => navigation.navigate(Routes.SubscriptionRenew)} activeOpacity={0.9}>
          <LinearGradient colors={GRADIENT} style={styles.changePlanBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.changePlanBtnText}>{t('pay.renewSubBtn')}</Text>
            <Ionicons name="refresh" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={() => navigation.navigate(Routes.SubscriptionCancel)}>
          <Text style={styles.cancelBtnText}>{t('pay.cancelSubBtn')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },

  scroll: { padding: 20, gap: 16, paddingBottom: 48 },

  planCard: {
    borderRadius: 24, padding: 28, gap: 28, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32, elevation: 6,
  },
  planBlob1: { position: 'absolute', top: -48, right: -48, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.1)' },
  planBlob2: { position: 'absolute', bottom: -24, left: -24, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(0,0,0,0.05)' },
  planCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planCardLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  planCardTitle: { fontSize: 24, fontWeight: '900', color: '#fff', lineHeight: 30 },
  planCardDuration: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginTop: 4 },
  planBadgeBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  planActiveRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planCheckCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  planActiveText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18, gap: 6,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  detailHalf: { flex: 1, minWidth: '45%' },
  detailFull: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 9, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 1.2 },
  detailValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  payMethodRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.tertiaryContainer + '40', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: Colors.tertiary },

  autoRenewCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  autoRenewLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  autoRenewIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  autoRenewTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  autoRenewSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  changePlanBtn: {
    height: 58, borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  changePlanBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  cancelBtn: {
    height: 58, borderRadius: 18,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
});
