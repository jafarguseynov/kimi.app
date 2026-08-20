import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Linking,
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
import { startCheckout } from '../../api/monetization.api';
import { validatePromo, getMyPromo, PromoPreview } from '../../api/promo.api';
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
  const params = (route.params ?? {}) as {
    amount?: number; months?: number; isTeacherSub?: boolean; planName?: string;
    planKey?: string; productKey?: string; paywallSource?: any;
  };
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Endirim kodu — yalnız paket (planKey) axınında göstərilir.
  const [promo, setPromo] = useState('');
  const [preview, setPreview] = useState<PromoPreview | null>(null);
  const [checking, setChecking] = useState(false);

  const applyPromo = async (codeArg?: string) => {
    const code = (codeArg ?? promo).trim();
    if (!params.planKey || !code) return;
    setChecking(true);
    try {
      const res = await validatePromo(code, params.planKey);
      setPreview(res);
    } catch {
      setPreview({ valid: false, reason: t('pay.promoInvalid') });
    } finally {
      setChecking(false);
    }
  };

  // Qeydiyyatda yazılmış promo kodu varsa avtomatik doldur və yoxla.
  useEffect(() => {
    if (!params.planKey) return;
    getMyPromo()
      .then((r) => {
        if (r.code) {
          setPromo(r.code);
          applyPromo(r.code);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.planKey]);

  const baseAmount = params.amount != null ? Number(params.amount) : 45.0;
  const finalAmount = preview?.valid && preview.finalAmount != null ? preview.finalAmount : baseAmount;
  const amountLabel = `${finalAmount.toFixed(2)} `;
  const appliedCode = preview?.valid ? promo.trim() : undefined;

  /**
   * ⚠️ ÖDƏNİŞ AXINI DƏYİŞDİ (monetizasiya sistemi).
   *
   * Əvvəl bu ekran birbaşa `subscribeByPlan()` çağırır və server heç bir ödəniş
   * yoxlamadan premium verirdi — yəni kart forması dekorativ idi. İndi:
   *   checkout → provayder → SERVER doğrulaması → premium.
   * Ödəniş uğursuz olarsa premium AÇILMIR (§13, §30).
   *
   * `idempotencyKey` sifariş başına sabitdir: düymə iki dəfə basılsa da
   * ikinci sorğu YENİ sifariş yaratmır, mövcudunu qaytarır.
   */
  const idempotencyKey = React.useMemo(
    () => `co-${params.planKey ?? params.productKey ?? 'sub'}-${Date.now()}`,
    [params.planKey, params.productKey],
  );

  const { mutate: pay, isPending: activating } = useMutation({
    mutationFn: async () => {
      const res = await startCheckout({
        kind: params.productKey ? 'extra_product' : 'subscription',
        planKey: params.planKey,
        productKey: params.productKey,
        promoCode: appliedCode,
        paywallSource: params.paywallSource ?? 'profile',
        idempotencyKey,
      });

      // Hosted checkout: provayder xarici səhifə istəyir → brauzerdə aç,
      // qayıdışda status serverdən soruşulur (müştəri "ödədim" deyə bilmir).
      if (res.redirectUrl) {
        await Linking.openURL(res.redirectUrl);
        return { ...res, pendingExternal: true };
      }
      return { ...res, pendingExternal: false };
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionStatus'] });
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
      queryClient.invalidateQueries({ queryKey: ['teacherAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });

      if (res.success) {
        navigation.navigate(Routes.PaymentSuccess, { ...params, orderId: res.orderId });
        return;
      }
      if (res.pendingExternal) {
        // Xarici ödəniş davam edir — nəticəni server webhook/verify ilə təyin edəcək.
        navigation.navigate(Routes.PaymentMethod, { ...params, orderId: res.orderId, awaiting: true });
        return;
      }
      navigation.navigate(Routes.PaymentFailed, {
        ...params,
        orderId: res.orderId,
        reason: res.failureReason ?? t('pay.subActivateFailed'),
      });
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      Alert.alert(t('pay.errorTitle'), data?.message ?? t('pay.subActivateFailed'));
    },
  });

  const onPay = () => {
    if (activating) return;
    pay();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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

            {/* Endirim kodu — yalnız paket abunəliyində */}
            {params.planKey && (
              <View style={styles.promoWrap}>
                <Text style={styles.fieldLabel}>{t('pay.promoLabel')}</Text>
                <View style={styles.promoRow}>
                  <View style={[styles.fieldBox, { flex: 1 }]}>
                    <TextInput
                      style={[styles.fieldInput, { textTransform: 'uppercase', letterSpacing: 1 }]}
                      value={promo}
                      onChangeText={(v) => { setPromo(v.toUpperCase()); if (preview) setPreview(null); }}
                      placeholder={t('pay.promoPlaceholder')}
                      placeholderTextColor={Colors.outlineVariant}
                      autoCapitalize="characters"
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.promoBtn, (!promo.trim() || checking) && { opacity: 0.5 }]}
                    onPress={() => applyPromo()}
                    disabled={!promo.trim() || checking}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.promoBtnText}>{t('pay.promoApply')}</Text>
                  </TouchableOpacity>
                </View>
                {preview && (
                  <Text style={[styles.promoMsg, { color: preview.valid ? Colors.tertiary : Colors.danger }]}>
                    {preview.valid
                      ? `✓ ${t('pay.promoApplied')}`
                      : `✕ ${preview.reason || t('pay.promoInvalid')}`}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.amountRow}>
              <View>
                <Text style={styles.amountLabel}>{t('pay.amountToPay')}</Text>
                {preview?.valid && preview.discountAmount ? (
                  <View style={styles.priceStack}>
                    <Text style={styles.priceOld}>{baseAmount.toFixed(2)} AZN</Text>
                    <Text style={styles.amountValue}>{amountLabel}<Text style={styles.amountCurrency}>AZN</Text></Text>
                    <Text style={styles.discountNote}>
                      {t('pay.promoDiscount')}: −{Number(preview.discountAmount).toFixed(2)} AZN
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.amountValue}>{amountLabel}<Text style={styles.amountCurrency}>AZN</Text></Text>
                )}
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
  priceStack: { gap: 2 },
  priceOld: { fontSize: 13, color: Colors.textSecondary, textDecorationLine: 'line-through' },
  discountNote: { fontSize: 11, fontWeight: '700', color: Colors.tertiary },

  promoWrap: { gap: 8 },
  promoRow: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  promoBtn: {
    paddingHorizontal: 18, borderRadius: 16, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  promoBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  promoMsg: { fontSize: 12, fontWeight: '600', paddingLeft: 4 },
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
