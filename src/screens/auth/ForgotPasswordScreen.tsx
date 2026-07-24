import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { OtpInput } from 'react-native-otp-entry';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { OTP_RESEND_SECONDS } from '../../constants/config';
import { useForgotPassword, useResetPassword } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import { useTranslation } from '../../i18n';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, typeof Routes.ForgotPassword>;
  route: RouteProp<AuthStackParamList, typeof Routes.ForgotPassword>;
};

type Step = 'phone' | 'code' | 'password';

export default function ForgotPasswordScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState(route.params?.phone ?? '+994');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { mutate: sendCode, isPending: isSending } = useForgotPassword();
  const { mutate: doReset, isPending: isResetting } = useResetPassword();

  // Xəta mesajını çıxar: cavab yoxdursa (timeout/şəbəkə) ayrıca mesaj,
  // validation massivini birləşdir, digər halda backend mesajını göstər.
  const errMessage = useCallback((err: any, fallback: string): string => {
    if (!err?.response) return t('forgot.networkError');
    const m = err.response.data?.message;
    if (Array.isArray(m)) return m[0] ?? fallback;
    return m || fallback;
  }, [t]);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const onSendCode = useCallback(() => {
    const value = phone.trim();
    if (!/^\+994[0-9]{9}$/.test(value)) {
      Alert.alert(t('forgot.errorTitle'), t('register.phoneLabel'));
      return;
    }
    sendCode(value, {
      onSuccess: () => {
        setStep('code');
        setCountdown(OTP_RESEND_SECONDS);
      },
      onError: (err: any) => {
        Alert.alert(t('forgot.errorTitle'), errMessage(err, t('forgot.sendError')));
      },
    });
  }, [phone, sendCode, t]);

  const onResend = useCallback(() => {
    sendCode(phone.trim(), {
      onSuccess: () => setCountdown(OTP_RESEND_SECONDS),
      onError: (err: any) => {
        Alert.alert(t('forgot.errorTitle'), errMessage(err, t('forgot.sendError')));
      },
    });
  }, [phone, sendCode, t]);

  const onReset = useCallback(() => {
    doReset(
      { phone: phone.trim(), code, newPassword },
      {
        // Uğurda token saxlanır → RootNavigator avtomatik tətbiqə keçir.
        onSuccess: () => Alert.alert(t('forgot.successTitle'), t('forgot.successMsg')),
        onError: (err: any) => {
          Alert.alert(t('forgot.errorTitle'), errMessage(err, t('forgot.resetError')));
        },
      },
    );
  }, [phone, code, newPassword, doReset, t]);

  const goBack = useCallback(() => {
    if (step === 'password') setStep('code');
    else if (step === 'code') setStep('phone');
    else navigation.goBack();
  }, [step, navigation]);

  const mm = Math.floor(countdown / 60).toString().padStart(2, '0');
  const ss = (countdown % 60).toString().padStart(2, '0');

  const iconName: keyof typeof Ionicons.glyphMap =
    step === 'phone' ? 'lock-closed' : step === 'code' ? 'shield-checkmark' : 'key';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('forgot.headerTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Ionicons name={iconName} size={40} color="#fff" />
            </LinearGradient>
          </View>

          {/* ─── STEP 1: PHONE ─── */}
          {step === 'phone' && (
            <>
              <Text style={styles.title}>{t('forgot.step1Title')}</Text>
              <Text style={styles.subtitle}>{t('forgot.step1Sub')}</Text>
              <View style={styles.form}>
                <Input
                  label={t('forgot.phoneLabel')}
                  placeholder="+994XXXXXXXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={onSendCode} disabled={isSending} activeOpacity={0.85} style={{ marginTop: 8 }}>
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.btn, isSending && { opacity: 0.65 }]}
                  >
                    {isSending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.btnText}>{t('forgot.sendCode')}</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ─── STEP 2: CODE ─── */}
          {step === 'code' && (
            <>
              <Text style={styles.title}>{t('forgot.codeTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('forgot.codeSubPre')}
                <Text style={styles.phoneHighlight}>{phone.trim()}</Text>
                {t('forgot.codeSubPost')}
              </Text>
              <View style={styles.form}>
                <View style={styles.otpWrap}>
                  <OtpInput
                    numberOfDigits={6}
                    onTextChange={setCode}
                    onFilled={(v) => { setCode(v); setStep('password'); }}
                    focusColor={Colors.primary}
                    theme={{
                      containerStyle: styles.otpContainer,
                      pinCodeContainerStyle: styles.pinBox,
                      pinCodeTextStyle: styles.pinText,
                      focusedPinCodeContainerStyle: styles.pinBoxFocused,
                    }}
                  />
                </View>

                {/* Resend */}
                <View style={styles.timerRow}>
                  <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
                  {countdown > 0 ? (
                    <Text style={styles.timerText}>{t('forgot.resendCountdown', { time: `${mm}:${ss}` })}</Text>
                  ) : (
                    <TouchableOpacity onPress={onResend} disabled={isSending}>
                      <Text style={styles.resendText}>
                        {isSending ? t('forgot.resending') : t('forgot.resend')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => setStep('password')}
                  disabled={code.length < 6}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.btn, code.length < 6 && { opacity: 0.55 }]}
                  >
                    <Text style={styles.btnText}>{t('forgot.continue')}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ─── STEP 3: NEW PASSWORD ─── */}
          {step === 'password' && (
            <>
              <Text style={styles.title}>{t('forgot.pwTitle')}</Text>
              <Text style={styles.subtitle}>{t('forgot.pwSub')}</Text>
              <View style={styles.form}>
                <Input
                  label={t('forgot.newPasswordLabel')}
                  placeholder={t('forgot.newPasswordPlaceholder')}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={onReset}
                  disabled={newPassword.length < 8 || isResetting}
                  activeOpacity={0.85}
                  style={{ marginTop: 8 }}
                >
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.btn, (newPassword.length < 8 || isResetting) && { opacity: 0.55 }]}
                  >
                    {isResetting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.btnText}>{t('forgot.submit')}</Text>
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  headerSpacer: { width: 40 },

  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },

  iconWrap: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },

  title: {
    fontSize: 23,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  phoneHighlight: { color: Colors.primary, fontWeight: '600', letterSpacing: 0.5 },

  form: { width: '100%' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  btnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  otpWrap: { width: '100%', marginBottom: 12 },
  otpContainer: { gap: 8, justifyContent: 'center' },
  pinBox: {
    width: 46,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.surfaceContainer,
    backgroundColor: Colors.surfaceLow,
  },
  pinBoxFocused: { borderColor: Colors.primary, backgroundColor: Colors.white },
  pinText: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },

  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  timerText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  resendText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
