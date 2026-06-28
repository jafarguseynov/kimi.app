import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { topUp } from '../../api/payment.api';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { PAYMENTS_ENABLED } from '../../config/iap';
import PaymentUnavailable from '../../components/PaymentUnavailable';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const TOPUP_AMOUNT = 5;

type Props = { navigation: NativeStackNavigationProp<any> };

export default function TopUpScreen({ navigation }: Props) {
  // App Store 3.1.1: iOS-da real-pul balans artırımı açılmır.
  if (!PAYMENTS_ENABLED) return <PaymentUnavailable />;
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => topUp(TOPUP_AMOUNT),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      Alert.alert(t('pay.successTitle'), t('pay.topupAdded', { amount: TOPUP_AMOUNT }), [
        { text: t('pay.ok'), onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => Alert.alert(t('pay.errorTitle'), t('pay.topupFailed')),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Blurred background skeleton */}
      <View style={styles.bgSkeleton} pointerEvents="none">
        <View style={styles.bgCard} />
        <View style={styles.bgGrid}>
          <View style={styles.bgCardSmall} />
          <View style={styles.bgCardSmall} />
        </View>
        <View style={styles.bgCardTall} />
      </View>

      {/* Overlay */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Modal card */}
      <View style={styles.modalWrap}>
        {/* Mascot breaking out */}
        <View style={styles.mascotBreakout}>
          <View style={styles.mascotAura} />
          <LinearGradient colors={GRADIENT} style={styles.mascotCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="hardware-chip-outline" size={64} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </View>

        <View style={styles.modalCard}>
          {/* Gradient tint */}
          <View style={styles.modalGradientTint} pointerEvents="none" />

          <View style={styles.modalContent}>
            {/* Warning icon */}
            <View style={styles.warningIconBox}>
              <Ionicons name="alert-circle-outline" size={26} color="#F97316" />
            </View>

            <Text style={styles.modalTitle}>{t('pay.lowBalanceTitle')}</Text>
            <Text style={styles.modalSub}>
              {t('pay.lowBalanceSub')}
            </Text>

            {/* Primary button */}
            <TouchableOpacity
              style={{ width: '100%' }}
              activeOpacity={0.9}
              onPress={() => mutate()}
              disabled={isPending}
            >
              <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={22} color="#fff" />
                    <Text style={styles.primaryBtnText}>{t('pay.addAmount', { amount: TOPUP_AMOUNT })}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary button */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>{t('pay.later')}</Text>
            </TouchableOpacity>

            {/* Trust indicator */}
            <View style={styles.trustRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.trustText}>{t('pay.securePaymentUpper')}</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  bgSkeleton: {
    position: 'absolute', top: 80, left: 24, right: 24, gap: 16,
    opacity: 0.2,
  },
  bgCard: { height: 160, backgroundColor: Colors.surfaceLowest, borderRadius: 20 },
  bgGrid: { flexDirection: 'row', gap: 14 },
  bgCardSmall: { flex: 1, height: 120, backgroundColor: Colors.surfaceLowest, borderRadius: 20 },
  bgCardTall: { height: 200, backgroundColor: Colors.surfaceLowest, borderRadius: 20 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44,47,49,0.3)',
  },

  modalWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },

  mascotBreakout: {
    width: 128, height: 128, alignItems: 'center', justifyContent: 'center',
    marginBottom: -48, zIndex: 10,
  },
  mascotAura: {
    position: 'absolute', width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primary + '1A',
  },
  mascotCircle: {
    width: 112, height: 112, borderRadius: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32, elevation: 8,
  },

  modalCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest,
    borderRadius: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 32 }, shadowOpacity: 0.15, shadowRadius: 64, elevation: 12,
  },
  modalGradientTint: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 120,
    backgroundColor: Colors.primary + '08',
  },

  modalContent: {
    paddingTop: 64, paddingBottom: 32, paddingHorizontal: 28,
    alignItems: 'center', gap: 16,
  },

  warningIconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#FFF7ED',
    alignItems: 'center', justifyContent: 'center',
  },

  modalTitle: {
    fontSize: 22, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.3, lineHeight: 30, paddingHorizontal: 8,
  },
  modalSub: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 24, paddingHorizontal: 8,
  },

  primaryBtn: {
    width: '100%', height: 64, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 6,
    marginTop: 8,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  secondaryBtn: {
    width: '100%', height: 56, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: Colors.textMuted },

  trustRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceLow, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  trustText: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },
});
