import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { subscribeTeacher, subscribeByPlan } from '../../api/subscription.api';
import { useTranslation } from '../../i18n';
import { PAYMENTS_ENABLED } from '../../config/iap';
import PaymentUnavailable from '../../components/PaymentUnavailable';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function CardPaymentScreen() {
  // App Store 3.1.1: iOS-da kart/ödəniş ekranı açılmır.
  if (!PAYMENTS_ENABLED) return <PaymentUnavailable />;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const route = useRoute();
  const params = (route.params ?? {}) as { amount?: number; months?: number; isTeacherSub?: boolean; planName?: string; planKey?: string };
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const amountLabel = params.amount != null ? `${Number(params.amount).toFixed(2)} ` : '45.00 ';

  const { mutate: activateSub, isPending: activating } = useMutation({
    // Paket key-i varsa onunla abunə ol (müəllim & şagird üçün eyni axın, qiymət/müddət serverdə);
    // əks halda köhnə müəllim months-əsaslı axın (məs. abunəlik yeniləmə).
    mutationFn: () => (params.planKey ? subscribeByPlan(params.planKey) : subscribeTeacher(params.months ?? 1)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionStatus'] });
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
      queryClient.invalidateQueries({ queryKey: ['teacherAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigation.navigate(Routes.PaymentSuccess, params);
    },
    onError: (err: any) => {
      Alert.alert(t('pay.errorTitle'), err?.response?.data?.message ?? t('pay.subActivateFailed'));
    },
  });

  const onPay = () => {
    if (activating) return;
    // Paket key-i və ya müəllim abunəliyidirsə real olaraq aktivləşdir; əks halda mock axın.
    if (params.planKey || params.isTeacherSub) activateSub();
    else navigation.navigate(Routes.PaymentSuccess, params);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('pay.payHeader')}</Text>
          <Text style={styles.headerLogo}>Kimi.az</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hero */}
          <View style={styles.heroCenter}>
            <View style={styles.heroCircleWrap}>
              <LinearGradient colors={GRADIENT} style={styles.heroCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="hardware-chip-outline" size={36} color="#fff" />
              </LinearGradient>
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.tertiary} />
              </View>
            </View>
            <Text style={styles.heroTitle}>{t('pay.cardPayTitle')}</Text>
            <Text style={styles.heroSub}>{t('pay.cardPaySub')}</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{t('pay.cardName')}</Text>
              <View style={styles.fieldBox}>
                <TextInput
                  style={[styles.fieldInput, { textTransform: 'uppercase', letterSpacing: 1 }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('pay.cardNamePlaceholder')}
                  placeholderTextColor={Colors.outlineVariant}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{t('pay.cardNumber')}</Text>
              <View style={[styles.fieldBox, styles.fieldRow]}>
                <TextInput
                  style={[styles.fieldInput, { flex: 1, letterSpacing: 2 }]}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <View style={styles.cardBrands}>
                  <Text style={styles.cardBrandText}>VISA</Text>
                  <Text style={styles.cardBrandText}>MC</Text>
                </View>
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.fieldWrap, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>{t('pay.expiryLabel')}</Text>
                <View style={styles.fieldBox}>
                  <TextInput
                    style={[styles.fieldInput, { textAlign: 'center' }]}
                    value={expiry}
                    onChangeText={setExpiry}
                    placeholder={t('pay.expiryPlaceholder')}
                    placeholderTextColor={Colors.outlineVariant}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>
              <View style={[styles.fieldWrap, { flex: 1 }]}>
                <View style={styles.cvvLabelRow}>
                  <Text style={styles.fieldLabel}>CVV</Text>
                  <Ionicons name="help-circle-outline" size={14} color={Colors.outline} />
                </View>
                <View style={styles.fieldBox}>
                  <TextInput
                    style={[styles.fieldInput, { textAlign: 'center', letterSpacing: 4 }]}
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="•••"
                    placeholderTextColor={Colors.outlineVariant}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <View style={styles.amountRow}>
              <View>
                <Text style={styles.amountLabel}>{t('pay.amountToPay')}</Text>
                <Text style={styles.amountValue}>{amountLabel}<Text style={styles.amountCurrency}>AZN</Text></Text>
              </View>
              <View style={styles.sslBadge}>
                <Ionicons name="lock-closed" size={14} color={Colors.primary} />
                <Text style={styles.sslText}>256-bit SSL</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={onPay} activeOpacity={0.9} disabled={activating}>
            <LinearGradient colors={GRADIENT} style={styles.payBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.payBtnText}>{activating ? t('pay.activating') : t('pay.completePayment')}</Text>
              <Ionicons name={activating ? 'hourglass' : 'arrow-forward'} size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.terms}>
            {t('pay.termsPre')}
            <Text style={{ color: Colors.primary, fontWeight: '600' }}>{t('pay.termsLink')}</Text>
            {t('pay.termsPost')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },
  headerLogo: { fontSize: 17, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },

  scroll: { padding: 20, gap: 20, paddingBottom: 48 },

  heroCenter: { alignItems: 'center', gap: 12 },
  heroCircleWrap: { position: 'relative' },
  heroCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  verifiedBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.tertiaryContainer,
    borderWidth: 2, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  heroSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  formCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24, gap: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  fieldWrap: { gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, paddingLeft: 4 },
  fieldBox: {
    backgroundColor: Colors.surfaceLow, borderRadius: 16,
    paddingHorizontal: 16, height: 56, justifyContent: 'center',
  },
  fieldRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  fieldInput: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, padding: 0 },
  cardBrands: { flexDirection: 'row', gap: 6 },
  cardBrandText: { fontSize: 9, fontWeight: '800', color: Colors.outline, letterSpacing: 0.5 },
  cvvLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  amountRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 20, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  amountLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginBottom: 4 },
  amountValue: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  amountCurrency: { fontSize: 14, fontWeight: '500' },
  sslBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  sslText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },

  payBtn: {
    borderRadius: 999, height: 62,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  payBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  terms: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 12 },
});
