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
import { UserRole } from '../../types/auth.types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, typeof Routes.Register> };

const ROLE_OPTIONS: { id: Exclude<UserRole, 'admin'>; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'student', label: 'Şagird', icon: 'school-outline' },
  { id: 'teacher', label: 'Müəllim', icon: 'person-circle-outline' },
  { id: 'parent', label: 'Valideyn', icon: 'people-outline' },
];

const GRADES = ['5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif', 'Abituriyent'];
const GOALS: { id: string; label: string }[] = [
  { id: 'university', label: 'Universitet hazırlığı' },
  { id: 'school', label: 'Məktəb dərsləri' },
  { id: 'olympiad', label: 'Olimpiada hazırlığı' },
  { id: 'general', label: 'Ümumi bilik' },
];

export default function RegisterScreen({ navigation }: Props) {
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const { mutate, isPending } = useRegister();
  const [role, setRole] = React.useState<Exclude<UserRole, 'admin'>>('student');
  const [grade, setGrade] = React.useState('');
  const [school, setSchool] = React.useState('');
  const [goal, setGoal] = React.useState('');
  const [childName, setChildName] = React.useState('');

  const pickGrade = () =>
    Alert.alert('Sinif seçin', '', [
      ...GRADES.map((g) => ({ text: g, onPress: () => setGrade(g) })),
      { text: 'Ləğv et', style: 'cancel' as const, onPress: () => {} },
    ]);

  const pickGoal = () =>
    Alert.alert('Məqsəd seçin', '', [
      ...GOALS.map((g) => ({ text: g.label, onPress: () => setGoal(g.id) })),
      { text: 'Ləğv et', style: 'cancel' as const, onPress: () => {} },
    ]);

  const onSubmit = (data: RegisterFormData) => {
    if (role === 'student') {
      if (!grade) return Alert.alert('Sinif', 'Zəhmət olmasa sinif seçin');
      if (!school.trim()) return Alert.alert('Məktəb', 'Məktəb adını daxil edin');
      if (!goal) return Alert.alert('Məqsəd', 'Məqsəd seçin');
    }
    if (role === 'parent') {
      if (!childName.trim()) return Alert.alert('Övlad', 'Övladınızın adını daxil edin');
      if (!grade) return Alert.alert('Sinif', 'Övladınızın sinfini seçin');
    }

    mutate(
      {
        ...data,
        role,
        school: school || undefined,
        grade: grade || undefined,
        goal: role === 'student' ? goal || undefined : undefined,
        childName: role === 'parent' ? childName || undefined : undefined,
      },
      {
        onError: (err: any) => {
          Alert.alert('Xəta', err?.response?.data?.message || 'Qeydiyyat zamanı xəta baş verdi');
        },
      },
    );
  };

  const goalLabel = GOALS.find((g) => g.id === goal)?.label;

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
            {/* Role */}
            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>ROL</Text>
            </View>
            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((opt) => {
                const active = role === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.roleChip, active && styles.roleChipActive]}
                    activeOpacity={0.85}
                    onPress={() => setRole(opt.id)}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={active ? '#fff' : Colors.primary}
                    />
                    <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Name */}
            <View style={[styles.labelWrap, { marginTop: 16 }]}>
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

            {/* Role-specific extra fields */}
            {role === 'student' && (
              <>
                <View style={styles.labelWrap}>
                  <Text style={styles.fieldLabel}>SİNİF</Text>
                </View>
                <TouchableOpacity style={styles.selectBox} activeOpacity={0.7} onPress={pickGrade}>
                  <Text style={[styles.selectText, !grade && styles.selectPlaceholder]}>
                    {grade || 'Sinif seçin'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.primary} />
                </TouchableOpacity>

                <View style={styles.labelWrap}>
                  <Text style={styles.fieldLabel}>MƏKTƏB</Text>
                </View>
                <Input
                  placeholder="Məs: 132 saylı tam orta məktəb"
                  value={school}
                  onChangeText={setSchool}
                />

                <View style={styles.labelWrap}>
                  <Text style={styles.fieldLabel}>MƏQSƏD</Text>
                </View>
                <TouchableOpacity style={styles.selectBox} activeOpacity={0.7} onPress={pickGoal}>
                  <Text style={[styles.selectText, !goal && styles.selectPlaceholder]}>
                    {goalLabel || 'Məqsəd seçin'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </>
            )}

            {role === 'parent' && (
              <>
                <View style={styles.labelWrap}>
                  <Text style={styles.fieldLabel}>ÖVLADIN ADI</Text>
                </View>
                <Input
                  placeholder="Məs: Cəfər Yusifov"
                  value={childName}
                  onChangeText={setChildName}
                />

                <View style={styles.labelWrap}>
                  <Text style={styles.fieldLabel}>ÖVLADIN SİNFİ</Text>
                </View>
                <TouchableOpacity style={styles.selectBox} activeOpacity={0.7} onPress={pickGrade}>
                  <Text style={[styles.selectText, !grade && styles.selectPlaceholder]}>
                    {grade || 'Sinif seçin'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.primary} />
                </TouchableOpacity>

                <View style={styles.labelWrap}>
                  <Text style={styles.fieldLabel}>ÖVLADIN MƏKTƏBİ (opsional)</Text>
                </View>
                <Input
                  placeholder="Məktəb adı"
                  value={school}
                  onChangeText={setSchool}
                />
              </>
            )}

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

  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLow,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  roleChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  roleChipText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  roleChipTextActive: { color: '#fff' },

  labelWrap: { marginBottom: 4, marginTop: 12 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginLeft: 2,
  },

  selectBox: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 14, height: 52,
    paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  selectText: { fontSize: 14, color: Colors.textPrimary, flex: 1 },
  selectPlaceholder: { color: Colors.textMuted },

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
