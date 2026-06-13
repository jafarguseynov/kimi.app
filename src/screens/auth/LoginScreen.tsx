import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
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

type IconName = keyof typeof Ionicons.glyphMap;

const FEATURES: { icon: IconName; label: string }[] = [
  { icon: 'flash', label: 'AI testlər' },
  { icon: 'videocam', label: 'Canlı dərs' },
  { icon: 'ribbon', label: 'Sertifikat' },
];

export default function LoginScreen({ navigation }: Props) {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { mutate, isPending } = useLogin();

  // Entrance animation
  const appear = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear]);
  const slideUp = appear.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

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

          <Animated.View style={{ width: '100%', alignItems: 'center', opacity: appear, transform: [{ translateY: slideUp }] }}>
            {/* Logo */}
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />

            {/* Headline */}
            <View style={styles.headline}>
              <Text style={styles.title}>Kimi.az-a xoş gəlmisən</Text>
              <Text style={styles.subtitle}>Süni intellekt dəstəkli təhsil platforması</Text>
            </View>

            {/* Feature pills */}
            <View style={styles.features}>
              {FEATURES.map((f) => (
                <View key={f.label} style={styles.featurePill}>
                  <Ionicons name={f.icon} size={14} color={Colors.primary} />
                  <Text style={styles.featureText}>{f.label}</Text>
                </View>
              ))}
            </View>

            {/* Login form */}
            <View style={styles.form}>
              <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Email və ya telefon nömrəsi"
                    placeholder="email@example.com  və ya  +994XXXXXXXXX"
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    error={errors.identifier?.message}
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

              <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isPending} activeOpacity={0.85} style={{ marginTop: 4 }}>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.loginBtn, isPending && { opacity: 0.65 }]}
                >
                  {isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.loginBtnText}>Daxil ol</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

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
          </Animated.View>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
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

  logoImage: {
    width: 260,
    height: 120,
    marginBottom: 20,
  },

  headline: { alignItems: 'center', marginBottom: 18 },
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

  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
  },
  featureText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  form: { width: '100%' },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  loginBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
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
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  ssoBtnDark: { backgroundColor: Colors.inverse, borderColor: Colors.inverse },
  googleG: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  ssoBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  footer: { marginTop: 28 },
  footerText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  footerLink: { color: Colors.primary, fontWeight: '700' },
});
