import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { registerSchema, RegisterFormData } from '../../utils/validation';
import { useRegister } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import { UserRole } from '../../types/auth.types';
import { useTranslation } from '../../i18n';
import { LanguageFlagButton } from '../../components/LanguageSwitch';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, typeof Routes.Register>;
  route: RouteProp<AuthStackParamList, typeof Routes.Register>;
};

const ROLE_OPTIONS: { id: Exclude<UserRole, 'admin'>; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'student', labelKey: 'register.roleStudent', icon: 'school-outline' },
  { id: 'teacher', labelKey: 'register.roleTeacher', icon: 'person-circle-outline' },
  { id: 'parent', labelKey: 'register.roleParent', icon: 'people-outline' },
];

const GRADES = ['5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif', 'Abituriyent'];

// Ad/soyad: hər sözün ilk hərfi avtomatik böyük (Azərbaycan i/İ qaydası ilə).
// Qalan hərflər istifadəçinin yazdığı kimi qalır, boşluqlar toxunulmadan saxlanır.
const capitalizeName = (s: string) =>
  s
    .split(' ')
    .map((w) => (w ? w.charAt(0).toLocaleUpperCase('az') + w.slice(1) : w))
    .join(' ');

// Telefon: +994 prefiksi həmişə saxlanır, silinə bilmir; istifadəçi yalnız
// qalan 9 rəqəmi yazır. Yalnız rəqəmlər qəbul olunur.
const normalizePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  const rest = (digits.startsWith('994') ? digits.slice(3) : digits).slice(0, 9);
  return '+994' + rest;
};

// Loqo ölçüsü: dar ekranda kiçilir, 340dp-də dayanır. Sabit ədədi en/hündürlük
// işlədilir — `width:'100%' + maxWidth + aspectRatio` kombinasiyası ScrollView
// (alignItems:'center') içində Yoga layout döngüsü yaradıb ekranı dondururdu.
const LOGO_RATIO = 380 / 205;
const LOGO_W = Math.min(340, Dimensions.get('window').width - 40);
const LOGO_H = Math.round(LOGO_W / LOGO_RATIO);

export default function RegisterScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: '+994' },
  });
  const { mutate, isPending } = useRegister();
  // Default seçim yoxdur — istifadəçi statusunu (şagird/müəllim/valideyn) mütləq
  // özü seçməlidir. Əvvəllər 'student' default idi və seçməyənlər səhvən şagird
  // kimi qeydiyyatdan keçirdi.
  const [role, setRole] = React.useState<Exclude<UserRole, 'admin'> | null>(null);
  const [roleError, setRoleError] = React.useState(false);
  const [grade, setGrade] = React.useState('');
  const [school, setSchool] = React.useState('');
  const [childName, setChildName] = React.useState('');
  // Referal linki ilə açılıbsa (kimiaz://join?ref=KOD və ya kimi.az/join?ref=KOD),
  // dəvət kodu avtomatik doldurulur.
  const [referralCode, setReferralCode] = React.useState(route.params?.ref ?? '');

  React.useEffect(() => {
    const ref = route.params?.ref;
    if (ref) setReferralCode(ref);
  }, [route.params?.ref]);

  const pickGrade = () =>
    Alert.alert(t('register.pickGrade'), '', [
      ...GRADES.map((g) => ({ text: g, onPress: () => setGrade(g) })),
      { text: t('register.cancel'), style: 'cancel' as const, onPress: () => {} },
    ]);

  const onSubmit = (data: RegisterFormData) => {
    // Status seçilməyibsə qeydiyyatı dayandır və xəbərdarlıq göstər.
    if (!role) {
      setRoleError(true);
      return Alert.alert(t('register.roleRequiredTitle'), t('register.roleRequiredMsg'));
    }
    if (role === 'parent') {
      if (!childName.trim()) return Alert.alert(t('register.childTitle'), t('register.childMsg'));
      if (!grade) return Alert.alert(t('register.gradeTitle'), t('register.gradeMsg'));
    }

    mutate(
      {
        ...data,
        role,
        // Şagird üçün sinif/məktəb/məqsəd qeydiyyatdan sonra profildə doldurulur
        school: role === 'parent' ? school || undefined : undefined,
        grade: role === 'parent' ? grade || undefined : undefined,
        childName: role === 'parent' ? childName || undefined : undefined,
        referralCode: referralCode.trim() || undefined,
      },
      {
        onError: (err: any) => {
          Alert.alert(t('register.errorTitle'), err?.response?.data?.message || t('register.registerError'));
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dil seçimi — qeydiyyat bölməsində dili dəyişmək üçün */}
      <View style={styles.langBar}>
        <LanguageFlagButton />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo section */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoSub}>{t('register.logoSub')}</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('register.cardTitle')}</Text>
          <Text style={styles.cardSub}>{t('register.cardSub')}</Text>

          <View style={styles.form}>
            {/* Role */}
            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>{t('register.roleLabel')}</Text>
            </View>
            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((opt) => {
                const active = role === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.roleChip,
                      roleError && styles.roleChipError,
                      active && styles.roleChipActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setRole(opt.id);
                      setRoleError(false);
                    }}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={active ? '#fff' : Colors.primary}
                    />
                    <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                      {t(opt.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {roleError && (
              <Text style={styles.roleErrorText}>{t('register.roleHint')}</Text>
            )}

            {/* Name */}
            <View style={[styles.labelWrap, { marginTop: 16 }]}>
              <Text style={styles.fieldLabel}>{t('register.nameLabel')}</Text>
            </View>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('register.namePlaceholder')}
                  onChangeText={(v: string) => onChange(capitalizeName(v))}
                  value={value}
                  autoCapitalize="words"
                  error={errors.name?.message}
                />
              )}
            />

            {/* Phone */}
            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>{t('register.phoneLabel')}</Text>
            </View>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="+994 (__) ___-__-__"
                  onChangeText={(v: string) => onChange(normalizePhone(v))}
                  value={value || '+994'}
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                />
              )}
            />

            {/* Email */}
            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>{t('register.emailLabel')}</Text>
            </View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('register.emailPlaceholder')}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  error={errors.email?.message}
                />
              )}
            />

            {/* Password */}
            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>{t('register.passwordLabel')}</Text>
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

            {/* Şagird: sinif/məktəb qeydiyyatdan sonra profil bölməsində seçilir */}
            {role === 'student' && (
              <View style={styles.infoNote}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                <Text style={styles.infoNoteText}>
                  {t('register.studentInfo')}
                </Text>
              </View>
            )}

            {role === 'parent' && (
              <>
                <View style={styles.labelWrap}>
                  <Text style={styles.fieldLabel}>{t('register.childNameLabel')}</Text>
                </View>
                <Input
                  placeholder={t('register.childNamePlaceholder')}
                  value={childName}
                  onChangeText={(v: string) => setChildName(capitalizeName(v))}
                  autoCapitalize="words"
                />

                <View style={styles.labelWrap}>
                  <Text style={styles.fieldLabel}>{t('register.childGradeLabel')}</Text>
                </View>
                <TouchableOpacity style={styles.selectBox} activeOpacity={0.7} onPress={pickGrade}>
                  <Text style={[styles.selectText, !grade && styles.selectPlaceholder]}>
                    {grade || t('register.pickGrade')}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.primary} />
                </TouchableOpacity>

                <View style={styles.labelWrap}>
                  <Text style={styles.fieldLabel}>{t('register.childSchoolLabel')}</Text>
                </View>
                <Input
                  placeholder={t('register.schoolPlaceholder')}
                  value={school}
                  onChangeText={setSchool}
                />
              </>
            )}

            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>{t('register.referralLabel')}</Text>
            </View>
            <Input
              placeholder={t('register.referralPlaceholder')}
              value={referralCode}
              onChangeText={(val: string) => setReferralCode(val.toUpperCase())}
              autoCapitalize="characters"
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
                    <Text style={styles.submitBtnText}>{t('register.submit')}</Text>
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
              {t('register.haveAccount')}{' '}
              <Text
                style={styles.loginLinkBold}
                onPress={() => navigation.navigate(Routes.Login)}
              >
                {t('register.signIn')}
              </Text>
            </Text>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          {t('register.termsPre')}
          <Text style={styles.termsLink}>{t('register.termsOfUse')}</Text>
          {t('register.and')}
          <Text style={styles.termsLink}>{t('register.privacyPolicy')}</Text>
          {t('register.termsPost')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  langBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
    zIndex: 10,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 32,
    alignItems: 'center',
  },

  logoSection: { alignItems: 'center', marginBottom: 28, marginTop: 16, width: '100%' },
  logoImage: {
    width: LOGO_W,
    height: LOGO_H,
    marginBottom: 8,
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

  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  infoNoteText: { flex: 1, fontSize: 13, color: Colors.primary, fontWeight: '500', lineHeight: 18 },

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
  roleChipError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  roleChipText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  roleChipTextActive: { color: '#fff' },
  roleErrorText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
    marginTop: 6,
    marginLeft: 2,
  },

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
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 12, paddingVertical: 15, borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  googleG: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

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
