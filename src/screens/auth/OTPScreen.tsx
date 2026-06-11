import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OtpInput } from 'react-native-otp-entry';
import { AuthStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { OTP_RESEND_SECONDS } from '../../constants/config';
import { useVerifyOTP, useRequestOtp } from '../../hooks/useAuth';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, typeof Routes.OTP>;
  route: RouteProp<AuthStackParamList, typeof Routes.OTP>;
};

export default function OTPScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);
  const [otpValue, setOtpValue] = useState('');
  const { mutate, isPending } = useVerifyOTP();
  const { mutate: resendOtp, isPending: isResending } = useRequestOtp();

  const onResend = useCallback(() => {
    resendOtp(phone, {
      onSuccess: () => setCountdown(OTP_RESEND_SECONDS),
      onError: (err: any) => {
        Alert.alert('Xəta', err?.response?.data?.message || 'Kod yenidən göndərilə bilmədi');
      },
    });
  }, [phone, resendOtp]);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const submitOtp = useCallback((code: string) => {
    mutate(
      { phone, code },
      {
        onSuccess: (data) => {
          if (!data.user.role || data.user.role === 'student') {
            navigation.navigate(Routes.RoleSelect);
          }
        },
        onError: (err: any) => {
          Alert.alert('Xəta', err?.response?.data?.message || 'OTP yanlışdır');
        },
      },
    );
  }, [phone, mutate, navigation]);

  const onFilled = useCallback((code: string) => {
    submitOtp(code);
  }, [submitOtp]);

  const mm = Math.floor(countdown / 60).toString().padStart(2, '0');
  const ss = (countdown % 60).toString().padStart(2, '0');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verifikasiya</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero illustration */}
        <View style={styles.heroWrap}>
          {/* Aura glow */}
          <View style={styles.aura} />

          {/* Main card */}
          <View style={styles.illustrationCard}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.illustrationGradient}
            >
              <Ionicons name="shield-checkmark" size={64} color="rgba(255,255,255,0.92)" />
            </LinearGradient>
          </View>

          {/* Floating mascot */}
          <View style={styles.mascot}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mascotGradient}
            >
              <Ionicons name="hardware-chip" size={28} color="#fff" />
            </LinearGradient>
          </View>
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Təsdiqləmə kodu</Text>
          <Text style={styles.subtitle}>
            Zəhmət olmasa,{' '}
            <Text style={styles.phoneHighlight}>{phone}</Text>
            {' '}nömrəsinə göndərilən 6 rəqəmli kodu daxil edin.
          </Text>
        </View>

        {/* OTP input */}
        <View style={styles.otpWrap}>
          <OtpInput
            numberOfDigits={6}
            onFilled={onFilled}
            onTextChange={setOtpValue}
            focusColor={Colors.primary}
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: styles.pinBox,
              pinCodeTextStyle: styles.pinText,
              focusedPinCodeContainerStyle: styles.pinBoxFocused,
            }}
          />
        </View>

        {/* Timer / resend */}
        <View style={styles.timerRow}>
          <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
          {countdown > 0 ? (
            <Text style={styles.timerText}>Kodu yenidən göndər ({mm}:{ss})</Text>
          ) : (
            <TouchableOpacity onPress={onResend} disabled={isResending}>
              <Text style={styles.resendText}>
                {isResending ? 'Göndərilir...' : 'Kodu yenidən göndər'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          onPress={() => submitOtp(otpValue)}
          disabled={isPending || otpValue.length < 6}
          activeOpacity={0.85}
          style={styles.submitWrap}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.submitBtn,
              (isPending || otpValue.length < 6) && { opacity: 0.55 },
            ]}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Təsdiqlə</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>Kimi.az • Premium Educational Intelligence</Text>
      </ScrollView>
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
    backgroundColor: Colors.background + 'b3',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerSpacer: { width: 40 },

  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },

  heroWrap: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  aura: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.primaryFixed + '26',
  },
  illustrationCard: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 10,
  },
  illustrationGradient: {
    width: 192,
    height: 192,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    position: 'absolute',
    top: 20,
    right: 12,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: Colors.background,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  mascotGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textSection: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 8 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneHighlight: {
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  otpWrap: { width: '100%', marginBottom: 24 },
  otpContainer: { gap: 8, justifyContent: 'center' },
  pinBox: {
    width: 48,
    height: 64,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.surfaceContainer,
    backgroundColor: Colors.surfaceLow,
  },
  pinBoxFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  pinText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },

  submitWrap: { width: '100%', marginBottom: 24 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },

  footer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    opacity: 0.7,
  },
});
