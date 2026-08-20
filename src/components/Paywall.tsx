import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { Colors } from '../constants/colors';
import { Routes } from '../constants/routes';
import { useTranslation } from '../i18n';
import { PREMIUM_ENTRY_ROUTE } from '../config/iap';
import { useEntitlements, useMonetizationConfig, formatResetIn } from '../hooks/useEntitlements';
import {
  PaywallError, PaywallSource, startTrial, trackMonetizationEvent,
} from '../api/monetization.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Backend-in 403 cavabı — hansı funksiyaya görə açıldığını bilir. */
  error?: PaywallError | null;
  /** Backend xətası olmadan əl ilə açılırsa (məs. kilidli karta toxunma). */
  source?: PaywallSource;
  /** Xüsusi başlıq — verilməsə serverin `paywallTitle`-ı işlədilir. */
  title?: string;
}

/**
 * §10 — PAYWALL.
 *
 * Funksiyanı GİZLƏTMİR: istifadəçi nəyə görə dayandığını görür, nə qazanacağını
 * oxuyur və bir toxunuşla Premium-a keçə bilir.
 *
 * Hansı funksiyadan gəldiyi (`paywallSource`) serverə göndərilir — beləliklə
 * sonradan "hansı funksiya istifadəçini Premium-a çevirir" sualına real
 * məlumatla cavab verilir (admin → Monetizasiya → Analitika).
 */
export default function Paywall({ visible, onClose, error, source, title }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const { data: config } = useMonetizationConfig();
  const { trial, refresh } = useEntitlements();

  const paywallSource: PaywallSource = error?.paywallSource ?? source ?? 'other';
  const isLimit = error?.error === 'LIMIT_REACHED';
  const trialEligible = error?.trialEligible ?? trial?.eligible ?? false;

  // Paywall göründü → analitika (konversiya funnel-inin birinci addımı).
  useEffect(() => {
    if (visible) trackMonetizationEvent('paywall_view', { paywallSource });
  }, [visible, paywallSource]);

  const { mutate: beginTrial, isPending: trialPending } = useMutation({
    mutationFn: () => startTrial(config?.trial.planKey ?? undefined, paywallSource),
    onSuccess: () => { refresh(); onClose(); },
  });

  const goPremium = () => {
    trackMonetizationEvent('paywall_cta_click', { paywallSource });
    onClose();
    // Giriş nöqtəsi platformadan asılıdır (iOS-da qiymətsiz məlumat səhifəsi).
    navigation.navigate(PREMIUM_ENTRY_ROUTE, { paywallSource });
  };

  // Bu funksiya üçün ən uyğun üstünlüklər — ümumi siyahı yerinə kontekstli.
  const benefits = BENEFITS_BY_SOURCE[paywallSource] ?? BENEFITS_BY_SOURCE.other;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <TouchableOpacity style={s.backdropTap} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
            <View style={s.iconWrap}>
              <LinearGradient colors={GRADIENT} style={s.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={isLimit ? 'hourglass' : 'lock-closed'} size={30} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={s.title}>
              {title ?? (isLimit ? t('premium.limitTitle') : config?.paywallTitle ?? t('premium.lockedTitle'))}
            </Text>

            {/* Limit halında dürüst rəqəm: nə qədər işlətdiyi + nə vaxt sıfırlanacağı */}
            {isLimit && error?.limit != null && (
              <View style={s.limitBox}>
                <Text style={s.limitText}>
                  {t('premium.limitUsed', { used: error.used ?? error.limit, limit: error.limit })}
                </Text>
                {error.resetsInMs != null && (
                  <Text style={s.limitReset}>{formatResetIn(error.resetsInMs, t)}</Text>
                )}
              </View>
            )}

            <View style={s.benefits}>
              {benefits.map((key) => (
                <View key={key} style={s.benefitRow}>
                  <Ionicons name="checkmark-circle" size={19} color={Colors.primary} />
                  <Text style={s.benefitText}>{t(`premium.benefit.${key}`)}</Text>
                </View>
              ))}
            </View>

            {/* Satınalma bağlıdırsa (məs. iOS) düymə göstərilmir — yalnız məlumat. */}
            {config?.purchasesEnabled === false ? (
              <Text style={s.iosNote}>{t('pay.iosUnavailableBody')}</Text>
            ) : (
              <View style={s.actions}>
                {trialEligible && config?.trial.enabled && (
                  <TouchableOpacity activeOpacity={0.9} onPress={() => beginTrial()} disabled={trialPending}>
                    <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
                      {trialPending
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={s.primaryBtnText}>
                            {config.ctaTrial || t('premium.tryFree', { days: config.trial.days })}
                          </Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                <TouchableOpacity activeOpacity={0.9} onPress={goPremium}>
                  {trialEligible && config?.trial.enabled ? (
                    <View style={s.secondaryBtn}>
                      <Text style={s.secondaryBtnText}>{config?.ctaPrimary ?? t('premium.goPremium')}</Text>
                    </View>
                  ) : (
                    <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
                      <Text style={s.primaryBtnText}>{config?.ctaPrimary ?? t('premium.goPremium')}</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={onClose} style={s.laterBtn} activeOpacity={0.7}>
              <Text style={s.laterText}>{t('premium.later')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Hansı funksiyadan gəlibsə ona uyğun üstünlüklər göstərilir —
 * ümumi siyahı yerinə kontekstli mesaj daha çox çevirir.
 */
const BENEFITS_BY_SOURCE: Record<string, string[]> = {
  exam: ['unlimitedExams', 'premiumExams', 'analytics'],
  premium_exam: ['premiumExams', 'unlimitedExams', 'analytics'],
  ai_test: ['aiCustomTest', 'unlimitedAi', 'weakTopics'],
  ai_chat: ['unlimitedAi', 'aiCustomTest', 'analytics'],
  analytics: ['analytics', 'weakTopics', 'weeklyReport'],
  weak_topics: ['weakTopics', 'analytics', 'aiCustomTest'],
  leaderboard: ['premiumLeaderboard', 'unlimitedExams', 'noAds'],
  extra_product: ['premiumExams', 'analytics', 'noAds'],
  other: ['unlimitedExams', 'aiCustomTest', 'analytics'],
};

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  backdropTap: { flex: 1 },
  sheet: {
    backgroundColor: Colors.surfaceLowest,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '85%', paddingBottom: 8,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.borderLight,
    alignSelf: 'center', marginTop: 10,
  },
  body: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 28, gap: 16 },

  iconWrap: { alignItems: 'center' },
  iconCircle: {
    width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 4,
  },

  title: {
    fontSize: 20, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.3, lineHeight: 27,
  },

  limitBox: {
    backgroundColor: Colors.surfaceLow, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 16, gap: 3, alignItems: 'center',
  },
  limitText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  limitReset: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  benefits: { gap: 11, paddingHorizontal: 4 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  benefitText: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '600', lineHeight: 20 },

  actions: { gap: 10, marginTop: 4 },
  primaryBtn: {
    height: 54, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 14, elevation: 4,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    height: 50, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  iosNote: {
    fontSize: 13, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 20, paddingHorizontal: 8,
  },

  laterBtn: { alignItems: 'center', paddingVertical: 6 },
  laterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
});
