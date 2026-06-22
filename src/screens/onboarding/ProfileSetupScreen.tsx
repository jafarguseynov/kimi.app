import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useUpdateUser } from '../../hooks/useUser';
import { useUserStore } from '../../store/user.store';
import { useQuery } from '@tanstack/react-query';
import { getSpecializations } from '../../api/specialization.api';
import AreaPicker from '../../components/common/AreaPicker';
import { useTranslation } from '../../i18n';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, typeof Routes.ProfileSetup> };

const SUBJECTS = [
  'Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'Tarix',
  'Coğrafiya', 'Azərbaycan dili', 'Ədəbiyyat', 'İngilis dili', 'Rus dili',
  'İnformatika', 'Musiqi', 'Rəsm', 'Bədən tərbiyəsi',
];

const CITIES = ['Bakı', 'Sumqayıt', 'Gəncə', 'Xırdalan', 'Lənkəran', 'Mingəçevir'];

const GRADES = [
  '1-ci', '2-ci', '3-cü', '4-cü', '5-ci',
  '6-cı', '7-ci', '8-ci', '9-cu', '10-cu', '11-ci',
];

const STUDENT_GRADES: { value: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: '5', label: '5-ci sinif', icon: 'school-outline' },
  { value: '6', label: '6-cı sinif', icon: 'book-outline' },
  { value: '7', label: '7-ci sinif', icon: 'bookmarks-outline' },
  { value: '8', label: '8-ci sinif', icon: 'bulb-outline' },
  { value: '9', label: '9-cu sinif', icon: 'flask-outline' },
  { value: '10', label: '10-cu sinif', icon: 'calculator-outline' },
  { value: '11', label: '11-ci sinif', icon: 'ribbon-outline' },
];

type GoalType = 'university' | 'school' | 'general';

const GOALS: { id: GoalType; icon: keyof typeof Ionicons.glyphMap; labelKey: string; subKey: string }[] = [
  { id: 'university', icon: 'school', labelKey: 'onboarding.goalUniversity', subKey: 'onboarding.goalUniversitySub' },
  { id: 'school', icon: 'library-outline', labelKey: 'onboarding.goalSchool', subKey: 'onboarding.goalSchoolSub' },
  { id: 'general', icon: 'sparkles-outline', labelKey: 'onboarding.goalGeneral', subKey: 'onboarding.goalGeneralSub' },
];

type FormatType = 'online' | 'home' | 'center';

export default function ProfileSetupScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { mutate, isPending } = useUpdateUser();
  const role = user?.role ?? 'student';

  // Shared
  const [name, setName] = useState(user?.name || '');

  // Teacher step 1
  const [subjects, setSubjects] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  // Admin-idarəli ixtisaslar (boşdursa statik siyahıya keç)
  const { data: specs = [] } = useQuery({
    queryKey: ['specializations'],
    queryFn: getSpecializations,
    enabled: role === 'teacher',
  });
  const subjectOptions = specs.length ? specs.map((s) => s.name) : SUBJECTS;

  // Teacher step 2
  const [price, setPrice] = useState('');
  const [format, setFormat] = useState<FormatType>('online');
  const [city, setCity] = useState('Bakı');
  const [area, setArea] = useState<{ locationId: string; areaName: string } | null>(null);
  const [bio, setBio] = useState('');

  // Parent
  const [studentSearch, setStudentSearch] = useState('');
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');
  const [notifExam, setNotifExam] = useState(true);
  const [notifAttendance, setNotifAttendance] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);

  // Student multi-step
  const [studentStep, setStudentStep] = useState(1);
  const [goal, setGoal] = useState<string>('');

  // Teacher multi-step
  const [step, setStep] = useState(1);
  const totalSteps = role === 'teacher' ? 2 : 1;

  const toggleSubject = (s: string) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const onFinish = () => {
    if (name.trim().length < 2) {
      Alert.alert(t('onboarding.errorTitle'), t('onboarding.errName'));
      return;
    }
    mutate({ name: name.trim() }, {
      onSuccess: () => navigation.navigate(Routes.AIOnboarding),
    });
  };

  const onTeacherStep1Next = () => {
    if (name.trim().length < 2) {
      Alert.alert(t('onboarding.errorTitle'), t('onboarding.errName'));
      return;
    }
    if (subjects.length === 0) {
      Alert.alert(t('onboarding.subjectsErr'), t('onboarding.subjectsErrMsg'));
      return;
    }
    setStep(2);
  };

  const onTeacherFinish = () => {
    if (!area) {
      Alert.alert(t('onboarding.areaErr'), t('onboarding.areaErrMsg'));
      return;
    }
    mutate(
      {
        name: name.trim(),
        subjects,
        hourlyRate: Number(price) || 0,
        bio: bio.trim() || undefined,
        locationId: area.locationId,
        areaName: area.areaName,
      } as any,
      { onSuccess: () => navigation.navigate(Routes.AIOnboarding) },
    );
  };

  // ── Student ────────────────────────────────────────────────────────────
  if (role === 'student') {
    const { width: W } = Dimensions.get('window');

    // Step 1 — Name
    if (studentStep === 1) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.simpleHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.simpleHeaderTitle}>{t('onboarding.registration')}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.simpleScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.avatarCircleWrap}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarCircle}
              >
                <Ionicons name="person" size={48} color="rgba(255,255,255,0.9)" />
              </LinearGradient>
            </View>
            <Text style={styles.sectionTitle}>{t('onboarding.nameLabel')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder={t('onboarding.namePlaceholder')}
                placeholderTextColor={Colors.outline}
              />
              <Ionicons name="person-outline" size={20} color={Colors.outlineVariant} style={styles.inputIcon} />
            </View>
            <TouchableOpacity
              onPress={() => {
                if (name.trim().length < 2) {
                  Alert.alert(t('onboarding.errorTitle'), t('onboarding.errName'));
                  return;
                }
                setStudentStep(2);
              }}
              activeOpacity={0.85}
              style={{ marginTop: 32, width: '100%' }}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >
                <Text style={styles.ctaBtnText}>{t('onboarding.continue')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }

    // Step 2 — Grade selection
    if (studentStep === 2) {
      const gradeCardW = (W - 48 - 14) / 2;
      const gradeRows: (typeof STUDENT_GRADES)[] = [
        STUDENT_GRADES.slice(0, 2),
        STUDENT_GRADES.slice(2, 4),
        STUDENT_GRADES.slice(4, 6),
      ];
      const grade11 = STUDENT_GRADES[6];
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.simpleHeader}>
            <TouchableOpacity onPress={() => setStudentStep(1)} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.simpleHeaderTitle}>{t('onboarding.registration')}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.gradeScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.gradeHeadline}>{t('onboarding.gradeHeadline')}</Text>
            <Text style={styles.gradeSub}>
              {t('onboarding.gradeSub')}
            </Text>

            <View style={styles.gradeGrid}>
              {gradeRows.map((pair, rowIdx) => (
                <View key={rowIdx} style={styles.gradeRow}>
                  {pair.map((g) => {
                    const isSelected = grade === g.value;
                    return (
                      <TouchableOpacity
                        key={g.value}
                        style={[
                          styles.gradeCard,
                          { width: gradeCardW },
                          isSelected && styles.gradeCardSelected,
                        ]}
                        onPress={() => setGrade(g.value)}
                        activeOpacity={0.8}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={18} color={Colors.primary} style={styles.gradeCheckIcon} />
                        )}
                        <View style={[styles.gradeIconBox, isSelected && styles.gradeIconBoxSelected]}>
                          <Ionicons
                            name={g.icon}
                            size={22}
                            color={isSelected ? Colors.primary : Colors.textSecondary}
                          />
                        </View>
                        <Text style={styles.gradeLabel}>{g.label}</Text>
                        {isSelected && <Text style={styles.gradeSelectedTag}>{t('onboarding.selected')}</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              {/* Grade 11 — full width horizontal */}
              {(() => {
                const isSelected = grade === grade11.value;
                return (
                  <TouchableOpacity
                    style={[styles.gradeCardFull, isSelected && styles.gradeCardSelected]}
                    onPress={() => setGrade(grade11.value)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.gradeIconBox, { marginBottom: 0 }, isSelected && styles.gradeIconBoxSelected]}>
                      <Ionicons
                        name={grade11.icon}
                        size={22}
                        color={isSelected ? Colors.primary : Colors.textSecondary}
                      />
                    </View>
                    <Text style={[styles.gradeLabel, { flex: 1, marginBottom: 0 }]}>{grade11.label}</Text>
                    {isSelected
                      ? <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                      : <Ionicons name="chevron-forward" size={20} color={Colors.outlineVariant} />}
                  </TouchableOpacity>
                );
              })()}
            </View>

            <Text style={styles.gradeHintText}>
              {t('onboarding.gradeHint')}
            </Text>
          </ScrollView>

          <View style={styles.stickyFooter}>
            <TouchableOpacity
              onPress={() => { if (grade) setStudentStep(3); }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.ctaBtn, !grade && { opacity: 0.55 }]}
              >
                <Text style={styles.ctaBtnText}>{t('onboarding.continue')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    // Step 3 — School + City
    if (studentStep === 3) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.simpleHeader}>
            <TouchableOpacity onPress={() => setStudentStep(2)} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.simpleHeaderTitle}>{t('onboarding.registration')}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.gradeScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.gradeHeadline}>{t('onboarding.schoolCityHeadline')}</Text>
            <Text style={styles.gradeSub}>{t('onboarding.schoolCitySub')}</Text>

            <Text style={styles.fieldLabelPrimary}>{t('onboarding.cityLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <View style={styles.chipRow}>
                {CITIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, city === c && styles.chipActive]}
                    onPress={() => setCity(c)}
                  >
                    <Text style={[styles.chipText, city === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.fieldLabelPrimary, { marginTop: 24 }]}>{t('onboarding.schoolLabel')}</Text>
            <View style={[styles.inputRow, { borderWidth: 1.5, borderColor: Colors.border }]}>
              <Ionicons name="search-outline" size={20} color={Colors.outline} style={styles.inputIconLeft} />
              <TextInput
                style={[styles.textInput, { paddingLeft: 44 }]}
                value={school}
                onChangeText={setSchool}
                placeholder={t('onboarding.schoolNamePlaceholder')}
                placeholderTextColor={Colors.outline}
              />
            </View>

            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.infoBannerText}>
                {t('onboarding.infoBanner')}
              </Text>
            </View>

            <View style={styles.progressDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.progressDot, i === 0 && styles.progressDotActive]} />
              ))}
            </View>
          </ScrollView>

          <View style={styles.stickyFooter}>
            <TouchableOpacity onPress={() => setStudentStep(4)} activeOpacity={0.85}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >
                <Text style={styles.ctaBtnText}>{t('onboarding.continue')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    // Step 4 — Goal selection
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => setStudentStep(3)} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.simpleHeaderTitle}>Qeydiyyat</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.gradeScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.stepBadge}>{t('onboarding.stepBadge34')}</Text>
          <Text style={styles.gradeHeadline}>{t('onboarding.goalHeadline')}</Text>

          <View style={styles.goalList}>
            {GOALS.map((g) => {
              const isSelected = goal === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                  onPress={() => setGoal(g.id)}
                  activeOpacity={0.85}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={[Colors.gradientStart, Colors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goalIconCircle}
                    >
                      <Ionicons name={g.icon} size={28} color="#fff" />
                    </LinearGradient>
                  ) : (
                    <View style={styles.goalIconCircleInactive}>
                      <Ionicons name={g.icon} size={28} color={Colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.goalTextBlock}>
                    <Text style={styles.goalLabel}>{t(g.labelKey)}</Text>
                    <Text style={styles.goalSub}>{t(g.subKey)}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.goalCheck}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.gradeHintText}>
            {t('onboarding.goalHint')}
          </Text>
        </ScrollView>

        <View style={styles.stickyFooter}>
          <View style={styles.goalProgressWrap}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.goalProgressFill}
            />
          </View>
          <TouchableOpacity onPress={onFinish} disabled={isPending} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.ctaBtn, isPending && { opacity: 0.6 }]}
            >
              {isPending ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.ctaBtnText}>{t('onboarding.done')}</Text>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Parent ─────────────────────────────────────────────────────────────
  if (role === 'parent') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.simpleHeaderTitle}>{t('onboarding.parentReg')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.parentScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.parentHeadline}>{t('onboarding.parentHeadline')}</Text>
          <Text style={styles.parentLabel}>{t('onboarding.parentLabel')}</Text>

          {/* Section 1 */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <Ionicons name="person-outline" size={22} color={Colors.primary} />
              <Text style={styles.sectionCardTitle}>{t('onboarding.personalInfo')}</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>1</Text>
            </View>
            <Text style={styles.fieldLabel}>{t('onboarding.parentNameLabel')}</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={t('onboarding.parentNamePlaceholder')}
              placeholderTextColor={Colors.outline}
            />
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>{t('onboarding.linkedStudent')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, { paddingLeft: 40 }]}
                value={studentSearch}
                onChangeText={setStudentSearch}
                placeholder={t('onboarding.linkedStudentPlaceholder')}
                placeholderTextColor={Colors.outline}
              />
              <Ionicons name="search-outline" size={20} color={Colors.outline} style={styles.inputIconLeft} />
            </View>
          </View>

          {/* Section 2 */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <Ionicons name="school-outline" size={22} color={Colors.primary} />
              <Text style={styles.sectionCardTitle}>{t('onboarding.eduInfo')}</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>2</Text>
            </View>
            <Text style={styles.fieldLabel}>{t('onboarding.childGrade')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <View style={styles.chipRow}>
                {GRADES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, grade === g && styles.chipActive]}
                    onPress={() => setGrade(g)}
                  >
                    <Text style={[styles.chipText, grade === g && styles.chipTextActive]}>{t('onboarding.gradeChip', { g })}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>{t('onboarding.schoolLabel')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, { paddingLeft: 40 }]}
                value={school}
                onChangeText={setSchool}
                placeholder={t('onboarding.parentSchoolPlaceholder')}
                placeholderTextColor={Colors.outline}
              />
              <Ionicons name="school-outline" size={20} color={Colors.outline} style={styles.inputIconLeft} />
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
              <Text style={styles.sectionCardTitle}>{t('onboarding.notifPrefs')}</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>3</Text>
            </View>
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>{t('onboarding.notifExamTitle')}</Text>
                <Text style={styles.toggleSub}>{t('onboarding.notifExamSub')}</Text>
              </View>
              <Switch
                value={notifExam}
                onValueChange={setNotifExam}
                trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={[styles.toggleItem, { borderTopWidth: 1, borderTopColor: Colors.surfaceLow }]}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>{t('onboarding.notifAttTitle')}</Text>
                <Text style={styles.toggleSub}>{t('onboarding.notifAttSub')}</Text>
              </View>
              <Switch
                value={notifAttendance}
                onValueChange={setNotifAttendance}
                trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={[styles.toggleItem, { borderTopWidth: 1, borderTopColor: Colors.surfaceLow }]}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>{t('onboarding.notifWeeklyTitle')}</Text>
                <Text style={styles.toggleSub}>{t('onboarding.notifWeeklySub')}</Text>
              </View>
              <Switch
                value={notifWeekly}
                onValueChange={setNotifWeekly}
                trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <TouchableOpacity onPress={onFinish} disabled={isPending} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.ctaBtn, isPending && { opacity: 0.6 }]}
            >
              {isPending ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.ctaBtnText}>{t('onboarding.confirmContinue')}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Teacher Step 1 ─────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.teacherHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.simpleHeaderTitle}>{t('onboarding.teacherProfile')}</Text>
          <Text style={styles.stepLabel}>{t('onboarding.step', { n: 1, total: totalSteps })}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.teacherScroll} keyboardShouldPersistTaps="handled">
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarOuter}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGrad}
              >
                <Ionicons name="person" size={56} color="rgba(255,255,255,0.9)" />
              </LinearGradient>
              <View style={styles.editBtn}>
                <Ionicons name="create" size={16} color="#fff" />
              </View>
            </View>
          </View>

          <Text style={styles.heroTitle}>{t('onboarding.buildProfile')}</Text>
          <Text style={styles.heroSub}>{t('onboarding.buildProfileSub')}</Text>

          {/* Name */}
          <Text style={styles.fieldLabelPrimary}>{t('onboarding.teacherNameLabel')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={t('onboarding.teacherNamePlaceholder')}
              placeholderTextColor={Colors.outline}
            />
            <Ionicons name="person-outline" size={20} color={Colors.outlineVariant} style={styles.inputIcon} />
          </View>

          {/* Subjects */}
          <Text style={[styles.fieldLabelPrimary, { marginTop: 8 }]}>{t('onboarding.subjectsLabel')}</Text>
          <View style={styles.subjectContainer}>
            <View style={styles.subjectPills}>
              {subjects.map((s) => (
                <View key={s} style={styles.subjectPill}>
                  <Text style={styles.subjectPillText}>{s}</Text>
                  <TouchableOpacity onPress={() => toggleSubject(s)} hitSlop={6}>
                    <Ionicons name="close" size={13} color={Colors.primaryDim} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addSubjectBtn}
                onPress={() => setShowSubjectPicker(!showSubjectPicker)}
              >
                <Ionicons name="add" size={16} color={Colors.primary} />
                <Text style={styles.addSubjectText}>{t('onboarding.addSubject')}</Text>
              </TouchableOpacity>
            </View>
            {showSubjectPicker && (
              <View style={styles.subjectPicker}>
                {subjectOptions.filter((s) => !subjects.includes(s)).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.subjectPickerItem}
                    onPress={() => { toggleSubject(s); setShowSubjectPicker(false); }}
                  >
                    <Text style={styles.subjectPickerItemText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {subjects.length === 0 && (
            <Text style={styles.fieldHint}>{t('onboarding.minSubjectHint')}</Text>
          )}

          {/* Experience */}
          <View style={styles.bentoRow}>
            <View style={[styles.bentoCard, { flex: 1 }]}>
              <View style={styles.bentoIcon}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.bentoLabel}>{t('onboarding.expYears')}</Text>
              <TextInput
                style={styles.bentoInput}
                value={experience}
                onChangeText={setExperience}
                placeholder={t('onboarding.expPlaceholder')}
                placeholderTextColor={Colors.outline}
                keyboardType="number-pad"
              />
            </View>
            <View style={[styles.bentoCard, { flex: 1 }]}>
              <View style={[styles.bentoIcon, { backgroundColor: Colors.tertiaryContainer + '44' }]}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.tertiary} />
              </View>
              <Text style={styles.bentoLabel}>{t('onboarding.verifiedProfile')}</Text>
              <Text style={styles.bentoSub}>{t('onboarding.verifiedSub')}</Text>
            </View>
          </View>

          {/* Footer buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backFooterBtn}>
              <Text style={styles.backFooterText}>{t('onboarding.back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onTeacherStep1Next}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >
                <Text style={styles.ctaBtnText}>{t('onboarding.continue')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Teacher Step 2 ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.teacherHeader}>
        <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.simpleHeaderTitle}>{t('onboarding.lessonDetails')}</Text>
        <Text style={styles.stepLabel}>{t('onboarding.step', { n: 2, total: totalSteps })}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.teacherScroll} keyboardShouldPersistTaps="handled">
        {/* Price */}
        <Text style={styles.fieldLabelPrimary}>{t('onboarding.priceLabel')}</Text>
        <View style={[styles.inputRow, styles.priceRow]}>
          <Ionicons name="card-outline" size={20} color={Colors.primary} style={styles.inputIconLeft} />
          <TextInput
            style={[styles.textInput, { paddingLeft: 40, flex: 1, fontSize: 17, fontWeight: '600' }]}
            value={price}
            onChangeText={setPrice}
            placeholder={t('onboarding.pricePlaceholder')}
            placeholderTextColor={Colors.outline}
            keyboardType="number-pad"
          />
          <Text style={styles.currency}>{t('onboarding.currency')}</Text>
        </View>
        <Text style={styles.fieldHint}>{t('onboarding.priceHint')}</Text>

        {/* Format */}
        <Text style={[styles.fieldLabelPrimary, { marginTop: 16 }]}>{t('onboarding.formatLabel')}</Text>
        <View style={styles.formatRow}>
          {([
            { id: 'online', icon: 'videocam-outline', label: t('onboarding.formatOnline') },
            { id: 'home', icon: 'home-outline', label: t('onboarding.formatHome') },
            { id: 'center', icon: 'business-outline', label: t('onboarding.formatCenter') },
          ] as { id: FormatType; icon: keyof typeof Ionicons.glyphMap; label: string }[]).map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.formatCard, format === f.id && styles.formatCardActive]}
              onPress={() => setFormat(f.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.formatIcon, format === f.id && styles.formatIconActive]}>
                <Ionicons
                  name={f.icon}
                  size={26}
                  color={format === f.id ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <Text style={[styles.formatLabel, format === f.id && styles.formatLabelActive]}>{f.label}</Text>
              {format === f.id && (
                <View style={styles.formatCheck}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Ərazi — Lokasiyalar iyerarxiyasından seçim */}
        <Text style={[styles.fieldLabelPrimary, { marginTop: 16 }]}>{t('onboarding.activityArea')}</Text>
        <AreaPicker value={area?.areaName} onSelect={setArea} />
        <Text style={styles.fieldHint}>{t('onboarding.areaHint')}</Text>

        {/* Bio */}
        <Text style={[styles.fieldLabelPrimary, { marginTop: 16 }]}>{t('onboarding.bioLabel')}</Text>
        <TextInput
          style={styles.bioInput}
          value={bio}
          onChangeText={setBio}
          placeholder={t('onboarding.bioPlaceholder')}
          placeholderTextColor={Colors.outline}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{bio.length}/500</Text>

        {/* Kimi tip */}
        <View style={styles.kimiTip}>
          <View style={styles.kimiTipIcon}>
            <Ionicons name="hardware-chip" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.kimiTipLabel}>{t('onboarding.kimiTip')}</Text>
            <Text style={styles.kimiTipText}>
              {t('onboarding.kimiTipText')}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <TouchableOpacity onPress={() => setStep(1)} style={styles.backFooterBtn}>
            <Text style={styles.backFooterText}>Geri</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onTeacherFinish}
            disabled={isPending}
            activeOpacity={0.85}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.ctaBtn, isPending && { opacity: 0.6 }]}
            >
              {isPending ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.ctaBtnText}>{t('onboarding.complete')}</Text>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Headers
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white + 'b3',
  },
  simpleHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },

  // Scroll containers
  simpleScroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  teacherScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  parentScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Avatar (student/simple)
  avatarCircleWrap: {
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Avatar (teacher)
  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  avatarOuter: {
    position: 'relative',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarGrad: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
  },
  editBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  // Fields
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  fieldLabelPrimary: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  fieldHint: {
    fontSize: 11,
    color: Colors.outline,
    marginTop: 6,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },

  // Input
  textInput: {
    flex: 1,
    height: 54,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16,
    marginBottom: 0,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
  },
  inputIconLeft: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  priceRow: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 12,
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: 4,
  },

  // Subjects
  subjectContainer: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16,
    padding: 12,
    marginBottom: 4,
  },
  subjectPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.primaryFixed + '44',
    borderRadius: 999,
  },
  subjectPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryDim,
  },
  addSubjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 999,
  },
  addSubjectText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  subjectPicker: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subjectPickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subjectPickerItemText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },

  // Bento cards (experience)
  bentoRow: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
  bentoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  bentoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  bentoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  bentoSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  bentoInput: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.surfaceHigh,
    paddingVertical: 6,
  },

  // Format cards
  formatRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  formatCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  formatCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  formatIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: Colors.surfaceLow,
  },
  formatIconActive: {
    backgroundColor: Colors.primaryLight,
  },
  formatLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  formatLabelActive: {
    color: Colors.primary,
  },
  formatCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // City/Grade chips
  chipScroll: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 4, paddingHorizontal: 2 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chipTextActive: { color: '#fff' },

  // Bio
  bioInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  charCount: {
    fontSize: 11,
    color: Colors.outline,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },

  // Kimi tip
  kimiTip: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '22',
  },
  kimiTipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kimiTipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  kimiTipText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 20,
  },

  // Parent section cards
  parentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  parentHeadline: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 34,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
    position: 'relative',
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Toggles (parent notifications)
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  toggleLeft: { flex: 1 },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  toggleSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Footer buttons
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  backFooterBtn: {
    paddingHorizontal: 24,
    paddingVertical: 17,
    borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
  },
  backFooterText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // CTA button
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Student multi-step ──────────────────────────────────────────────────
  gradeScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },
  gradeHeadline: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 12,
  },
  gradeSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  gradeGrid: {
    gap: 14,
    marginBottom: 24,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 14,
  },
  gradeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: 'relative',
  },
  gradeCardFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  gradeCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  gradeCheckIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  gradeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gradeIconBoxSelected: {
    backgroundColor: Colors.primaryLight,
  },
  gradeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  gradeSelectedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1.2,
  },
  gradeHintText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
    opacity: 0.8,
    paddingHorizontal: 8,
    marginBottom: 8,
  },

  // Sticky footer (student steps)
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    backgroundColor: Colors.background + 'f0',
  },

  // Progress dots (step 3)
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  progressDot: {
    width: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceHigh,
  },
  progressDotActive: {
    width: 32,
    backgroundColor: Colors.primary,
  },

  // Info banner (step 3)
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '22',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primaryDim,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Step badge (step 4)
  stepBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 12,
  },

  // Goal cards (step 4)
  goalList: {
    gap: 14,
    marginBottom: 24,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  goalCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  goalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  goalIconCircleInactive: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  goalTextBlock: { flex: 1 },
  goalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  goalSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  goalCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Goal progress bar (step 4 footer)
  goalProgressWrap: {
    width: 128,
    height: 6,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 3,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 14,
  },
  goalProgressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
  },
});
