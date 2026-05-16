import React, { useState } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { loginSchema, LoginFormData } from '../../utils/validation';
import { useLogin } from '../../hooks/useAuth';
import Input from '../../components/common/Input';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, typeof Routes.Login> };

export default function LoginScreen({ navigation }: Props) {
  const [showEmailForm, setShowEmailForm] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { mutate, isPending } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    mutate(data, {
      onError: (err: any) => {
        Alert.alert('Xəta', err?.response?.data?.message || 'Giriş zamanı xəta baş verdi');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Background auras */}
          <View style={styles.aura1} pointerEvents="none" />
          <View style={styles.aura2} pointerEvents="none" />

          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <Ionicons name="hardware-chip" size={40} color="#fff" />
            </LinearGradient>
          </View>

          {/* Headline */}
          <View style={styles.headline}>
            <Text style={styles.title}>Kimi.az-a xoş gəlmisən</Text>
            <Text style={styles.subtitle}>Süni intellekt dəstəkli təhsil platforması</Text>
          </View>

          {/* Auth buttons */}
          <View style={styles.buttons}>
            {/* Phone login */}
            <TouchableOpacity
              onPress={() => navigation.navigate(Routes.Register)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.phoneBtn}
              >
                <View style={styles.phoneBtnLeft}>
                  <Ionicons name="phone-portrait-outline" size={22} color="#fff" />
                  <Text style={styles.phoneBtnText}>Telefon ilə giriş</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Email login toggle */}
            <TouchableOpacity
              style={styles.emailBtn}
              onPress={() => setShowEmailForm(!showEmailForm)}
              activeOpacity={0.85}
            >
              <Ionicons name="mail-outline" size={22} color={Colors.primary} />
              <Text style={styles.emailBtnText}>Email ilə giriş</Text>
            </TouchableOpacity>

            {/* Inline email form */}
            {showEmailForm && (
              <View style={styles.emailForm}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="E-poçt"
                      placeholder="email@example.com"
                      onChangeText={onChange}
                      value={value}
                      keyboardType="email-address"
                      error={errors.email?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Şifrə"
                      placeholder="••••••••"
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                      error={errors.password?.message}
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={isPending}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.submitBtn, isPending && { opacity: 0.65 }]}
                  >
                    {isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitBtnText}>Daxil ol</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>VƏ YA</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* SSO */}
            <View style={styles.ssoRow}>
              <TouchableOpacity
                style={styles.ssoBtn}
                onPress={() => Alert.alert('Tezliklə', 'Google ilə giriş tezliklə əlavə ediləcək')}
                activeOpacity={0.85}
              >
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.ssoBtnText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ssoBtn, styles.ssoBtnDark]}
                onPress={() => Alert.alert('Tezliklə', 'Apple ilə giriş tezliklə əlavə ediləcək')}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-apple" size={20} color="#fff" />
                <Text style={[styles.ssoBtnText, { color: '#fff' }]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Hesabın yoxdur?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate(Routes.Register)}
              >
                Qeydiyyat
              </Text>
            </Text>
          </View>

          {/* Bottom accent line */}
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bottomAccent}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },

  aura1: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.primary + '18',
  },
  aura2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.primaryFixed + '22',
  },

  logoWrap: { marginBottom: 28 },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  headline: { alignItems: 'center', marginBottom: 36 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  buttons: { width: '100%', gap: 12 },

  phoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  phoneBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  phoneBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emailBtnText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },

  emailForm: { gap: 4, paddingTop: 4 },
  submitBtn: {
    paddingVertical: 17,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.surfaceHigh },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 1.5,
  },

  ssoRow: { flexDirection: 'row', gap: 12 },
  ssoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    backgroundColor: Colors.white,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  ssoBtnDark: { backgroundColor: Colors.inverse },
  googleG: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  ssoBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  footer: { marginTop: 32 },
  footerText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  footerLink: { color: Colors.primary, fontWeight: '700' },

  bottomAccent: {
    width: '120%',
    height: 6,
    borderRadius: 3,
    opacity: 0.3,
    marginTop: 24,
  },
});
