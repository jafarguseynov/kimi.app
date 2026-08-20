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
  KeyboardAvoidingView,
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
import apiClient from '../../api/client';

type Inviter = { name: string; avatarUrl: string | null; avatarId: string | null; role: string };

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
    defaultValues: { phone: '+994', name: '', surname: '' },
  });
  const { mutate, isPending } = useRegister();
  // Default seçim yoxdur — istifadəçi statusunu (şagird/müəllim/valideyn) mütləq
  // özü seçməlidir. Əvvəllər 'student' default idi və seçməyənlər səhvən şagird
  // kimi qeydiyyatdan keçirdi.
  const [role, setRole] = React.useState<Exclude<UserRole, 'admin'> | null>(null);
  const [roleError, setRoleError] = React.useState(false);
  // İstifadə şərtləri + məxfilik siyasətinin qəbulu (qeydiyyat üçün MƏCBURİ).
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [termsError, setTermsError] = React.useState(false);
  const [grade, setGrade] = React.useState('');
  const [school, setSchool] = React.useState('');
  const [childName, setChildName] = React.useState('');
  // Referal linki ilə açılıbsa (kimiaz://join?ref=KOD və ya kimi.az/join?ref=KOD),
  // dəvət kodu avtomatik doldurulur.
  const [referralCode, setReferralCode] = React.useState(route.params?.ref ?? '');
  // Dəvət edənin ictimai məlumatı (ad + şəkil) — formanın üstündə "X səni dəvət edir" banneri üçün.
  const [inviter, setInviter] = React.useState<Inviter | null>(null);
  // Dəvət kodunun yoxlanma statusu — kod sahəsinin altında sahibi/xəta göstərmək üçün.
  const [codeStatus, setCodeStatus] = React.useState<'idle' | 'checking' | 'found' | 'notfound'>('idle');

  React.useEffect(() => {
    const ref = route.params?.ref;
    if (ref) setReferralCode(ref);
  }, [route.params?.ref]);

  React.useEffect(() => {
    const ref = (referralCode || '').trim();
    if (!ref) { setInviter(null); setCodeStatus('idle'); return; }
    let alive = true;
    setCodeStatus('checking');
    // Hər hərfdə sorğu getməsin deyə debounce.
    const timer = setTimeout(() => {
      apiClient
        .get<Inviter>(`/referral/resolve?code=${encodeURIComponent(ref)}`)
        .then((res) => {
          if (!alive) return;
          const data = res.data && (res.data as any).name ? res.data : null;
          setInviter(data);
          setCodeStatus(data ? 'found' : 'notfound');
        })
        .catch(() => { if (alive) { setInviter(null); setCodeStatus('idle'); } });
    }, 350);
    return () => { alive = false; clearTimeout(timer); };
  }, [referralCode]);

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
    // Razılıq olmadan qeydiyyat getmir — həm burada, həm serverdə qeyd olunur.
    if (!acceptedTerms) {
      setTermsError(true);
      return Alert.alert(t('register.termsRequiredTitle'), t('register.termsRequiredMsg'));
    }

    // Backend tək `name` sahəsi saxlayır — ad və soyadı birləşdirib göndəririk,
    // `surname` payload-a düşməsin deyə ayrıca çıxarılır.
    const { surname, ...rest } = data;
    const phone = rest.phone;
    mutate(
      {
        ...rest,
        name: `${data.name.trim()} ${surname.trim()}`.trim(),
        role,
        // Şagird üçün sinif/məktəb/məqsəd qeydiyyatdan sonra profildə doldurulur
        school: role === 'parent' ? school || undefined : undefined,
        grade: role === 'parent' ? grade || undefined : undefined,
        childName: role === 'parent' ? childName || undefined : undefined,
        referralCode: referralCode.trim() || undefined,
        // Qəbul vaxtını server yazır; redaksiya nömrəsi backend-dəki TERMS_VERSION.
        acceptedTerms: true,
      },
      {
        onSuccess: (res) => {
          // Backend telefon təsdiqi tələb edirsə → WhatsApp OTP ekranına keç.
          // (Köhnə backend requiresOtp qaytarmır → hook birbaşa girişə salır.)
          if (res?.requiresOtp && !res.user?.isVerified) {
            navigation.navigate(Routes.OTP, { phone: res.user?.phone || phone });
          }
        },
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
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

        {/* Dəvət banneri — referal linki ilə açılıbsa dəvət edənin şəkli + adı */}
        {inviter && (
          <View style={styles.inviteBanner}>
            {inviter.avatarUrl ? (
              <Image source={{ uri: inviter.avatarUrl }} style={styles.inviteAvatar} />
            ) : (
              <View style={[styles.inviteAvatar, styles.inviteAvatarFallback]}>
                <Text style={styles.inviteAvatarInitial}>
                  {(inviter.name || '?').trim().charAt(0).toLocaleUpperCase('az')}
                </Text>
              </View>
            )}
            <Text style={styles.inviteText} numberOfLines={2}>
              <Text style={styles.inviteName}>{inviter.name}</Text>{' '}
              {t('referral.inviteBannerSuffix')} 🎓
            </Text>
          </View>
        )}

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('register.cardTitle')}</Text>
          <Text style={styles.cardSub}>{t('register.cardSub')}</Text>

          <View style={styles.form}>
            {/* Name */}
            <View style={styles.labelWrap}>
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

            {/* Surname */}
            <View style={styles.labelWrap}>
              <Text style={styles.fieldLabel}>{t('register.surnameLabel')}</Text>
            </View>
            <Controller
              control={control}
              name="surname"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('register.surnamePlaceholder')}
                  onChangeText={(v: string) => onChange(capitalizeName(v))}
                  value={value}
                  autoCapitalize="words"
                  error={errors.surname?.message}
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

            {/* Role — şifrədən sonra: "kimsiniz?" statusu ən sonda seçilir */}
            <View style={[styles.labelWrap, { marginTop: 16 }]}>
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

            {/* Dəvət kodunun sahibi — səhv adamın kodu deyilsə əvvəlcədən görünsün */}
            {codeStatus === 'checking' && (
              <View style={styles.codeHintRow}>
                <ActivityIndicator size="small" color={Colors.textSecondary} />
                <Text style={styles.codeHintMuted}>{t('register.codeChecking')}</Text>
              </View>
            )}
            {codeStatus === 'found' && inviter && (
              <View style={styles.codeHintRow}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.codeHintOk} numberOfLines={1}>
                  {t('register.codeOwner', { name: inviter.name })}
                </Text>
              </View>
            )}
            {codeStatus === 'notfound' && (
              <View style={styles.codeHintRow}>
                <Ionicons name="close-circle" size={16} color={Colors.danger} />
                <Text style={styles.codeHintErr}>{t('register.codeNotFound')}</Text>
              </View>
            )}

            {/* Razılıq — istifadə şərtləri + məxfilik siyasəti.
                Mətnlərin özü toxunulan linklərdir (oxumadan da təsdiq oluna bilər,
                amma qutu işarələnmədən qeydiyyat getmir). */}
            <TouchableOpacity
              style={[styles.consentRow, termsError && styles.consentRowError]}
              activeOpacity={0.8}
              onPress={() => { setAcceptedTerms((v) => !v); setTermsError(false); }}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]}>
                {acceptedTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.consentText}>
                {t('register.consentPre')}
                <Text
                  style={styles.consentLink}
                  onPress={() => navigation.navigate(Routes.TermsOfService)}
                >
                  {t('register.consentTerms')}
                </Text>
                {t('register.consentMid')}
                <Text
                  style={styles.consentLink}
                  onPress={() => navigation.navigate(Routes.PrivacyPolicy)}
                >
                  {t('register.consentPrivacy')}
                </Text>
                {t('register.consentPost')}
              </Text>
            </TouchableOpacity>

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

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
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
    paddingBottom: 120,
    alignItems: 'center',
  },

  logoSection: { alignItems: 'center', marginBottom: 28, marginTop: 16, width: '100%' },
  logoImage: {
    width: LOGO_W,
    height: LOGO_H,
    marginBottom: 8,
  },
  logoSub: { fontSize: 14, color: Colors.textSecondary },

  inviteBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 12,
  },
  inviteAvatar: { width: 44, height: 44, borderRadius: 22 },
  inviteAvatarFallback: { backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  inviteAvatarInitial: { color: '#fff', fontSize: 20, fontWeight: '800' },
  inviteText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  inviteName: { fontWeight: '800', color: Colors.textPrimary },

  codeHintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingHorizontal: 2 },
  codeHintMuted: { fontSize: 12, color: Colors.textSecondary },
  codeHintOk: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.success },
  codeHintErr: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.danger },

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

  consentRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginTop: 12, paddingVertical: 4,
  },
  consentRowError: {
    borderRadius: 12, padding: 8, marginHorizontal: -8,
    backgroundColor: '#FEF2F2',
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 7, marginTop: 1,
    borderWidth: 1.5, borderColor: Colors.outlineVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  consentText: { flex: 1, fontSize: 12.5, color: Colors.textSecondary, lineHeight: 19 },
  consentLink: { color: Colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
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
