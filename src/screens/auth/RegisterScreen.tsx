import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
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
import { registerSchema, RegisterFormData } from '../../utils/validation';
import { useRegister } from '../../hooks/useAuth';
import Input from '../../components/common/Input';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, typeof Routes.Register> };

export default function RegisterScreen({ navigation }: Props) {
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const { mutate, isPending } = useRegister();

  const onSubmit = (data: RegisterFormData) => {
    mutate(data, {
      onSuccess: () => {
        navigation.navigate(Routes.OTP, { phone: data.phone });
      },
      onError: (err: any) => {
        Alert.alert('Xəta', err?.response?.data?.message || 'Qeydiyyat zamanı xəta baş verdi');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo section */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBox}
          >
            <Ionicons name="school-outline" size={32} color="#fff" />
          </LinearGradient>
          <Text style={styles.logoText}>Kimi.az</Text>
          <Text style={styles.logoSub}>Gələcəyin təhsil platforması</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Yeni hesab yarat</Text>
          <Text style={styles.cardSub}>Məlumatları daxil edərək qeydiyyatdan keçin</Text>

          <View style={styles.form}>
            {/* Name */}
            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>AD SOYAD</Text>
            </View>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Məs: Əli Məmmədov"
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />

            {/* Phone */}
            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>TELEFON</Text>
            </View>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="+994 (__) ___-__-__"
                  onChangeText={onChange}
                  value={value}
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                />
              )}
            />

            {/* Email */}
            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>EMAIL</Text>
            </View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="nümunə@mail.com"
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  error={errors.email?.message}
                />
              )}
            />

            {/* Password */}
            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>ŞİFRƏ</Text>
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="••••••••"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
              activeOpacity={0.85}
              style={{ marginTop: 8 }}
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
                  <>
                    <Text style={styles.submitBtnText}>Qeydiyyatdan keç</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Divider + login link */}
          <View style={styles.cardFooter}>
            <View style={styles.dividerLine} />
            <Text style={styles.loginLink}>
              Artıq hesabınız var?{' '}
              <Text
                style={styles.loginLinkBold}
                onPress={() => navigation.navigate(Routes.Login)}
              >
                Daxil olun
              </Text>
            </Text>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          Qeydiyyatdan keçməklə siz Kimi.az-ın{' '}
          <Text style={styles.termsLink}>İstifadə Şərtləri</Text>
          {' '}və{' '}
          <Text style={styles.termsLink}>Məxfilik Siyasəti</Text>
          {' '}ilə razılaşırsınız.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 32,
    alignItems: 'center',
  },

  logoSection: { alignItems: 'center', marginBottom: 28, marginTop: 16 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  logoSub: { fontSize: 14, color: Colors.textSecondary },

  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },

  form: { gap: 0 },

  labelWrap: { marginBottom: 4 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginLeft: 2,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  cardFooter: { marginTop: 20, alignItems: 'center', gap: 12 },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.surfaceContainer,
  },
  loginLink: { fontSize: 14, color: Colors.textSecondary },
  loginLinkBold: { color: Colors.primary, fontWeight: '700' },

  terms: {
    fontSize: 11,
    color: Colors.outline,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 8,
    lineHeight: 17,
    letterSpacing: 0.2,
  },
  termsLink: { textDecorationLine: 'underline' },
});
