import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform, Switch,
  ActivityIndicator, Image, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ProfileStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getMe, updateUser } from '../../api/user.api';
import { getSpecializations } from '../../api/specialization.api';
import { uploadImageOrFallback } from '../../api/media.api';
import { selectAvatar, getEntitlements } from '../../api/shop.api';
import { AVATARS, avatarEmoji } from '../../constants/cosmetics';
import { useUserStore } from '../../store/user.store';
import LocationSchoolPicker from '../../components/common/LocationSchoolPicker';
import LocationPicker from '../../components/common/LocationPicker';
import SubjectMultiPicker from '../../components/common/SubjectMultiPicker';
import { useTranslation } from '../../i18n';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, typeof Routes.EditProfile>;
  route: RouteProp<ProfileStackParamList, typeof Routes.EditProfile>;
};

type LessonFormat = 'online' | 'home' | 'course';
type Goal = 'university' | 'school' | 'general';

// Admin paneldəki ixtisas siyahısı yüklənmədikdə istifadə olunan ehtiyat siyahı.
const FALLBACK_SUBJECTS = ['Riyaziyyat', 'Fizika', 'Kimya', 'Azərbaycan dili', 'İngilis dili'];
const GOALS: { id: Goal; labelKey: string }[] = [
  { id: 'university', labelKey: 'editProfile.goalUniversity' },
  { id: 'school', labelKey: 'editProfile.goalSchool' },
  { id: 'general', labelKey: 'editProfile.goalGeneral' },
];
const DAY_FILLS = [0.5, 0.75, 1.0, 0.25, 0, 0.5, 0];
const GRADES = ['1-ci', '2-ci', '3-cü', '4-cü', '5-ci', '6-cı', '7-ci', '8-ci', '9-cu', '10-cu', '11-ci'];
const FORMATS: { key: LessonFormat; labelKey: string }[] = [
  { key: 'online', labelKey: 'editProfile.formatOnline' },
  { key: 'home', labelKey: 'editProfile.formatHome' },
  { key: 'course', labelKey: 'editProfile.formatCourse' },
];

export default function EditProfileScreen({ navigation, route }: Props) {
  const { user, setUser } = useUserStore();
  const { t } = useTranslation();
  const role = route.params?.role ?? (user?.role === 'teacher' ? 'teacher' : user?.role === 'parent' ? 'parent' : 'student');
  const userAny = user as any;

  // Admin paneldən idarə olunan fən/ixtisas siyahısı.
  const { data: specs = [] } = useQuery({
    queryKey: ['specializations'],
    queryFn: getSpecializations,
    staleTime: 1000 * 60 * 30,
  });
  const subjectOptions = specs.length ? specs.map((s) => s.name) : FALLBACK_SUBJECTS;

  const [avatarUri, setAvatarUri] = useState<string | undefined>(userAny?.avatarUrl);
  // Yeni seçilmiş lokal şəkil yaddaşa basılanda yüklənməlidir.
  const [avatarDirty, setAvatarDirty] = useState(false);
  // Preset emoji avatar
  const [avatarId, setAvatarId] = useState<string | null>(userAny?.avatarId ?? null);
  const [avatarModal, setAvatarModal] = useState(false);
  const [ownsAvatarPack, setOwnsAvatarPack] = useState(false);

  const onPickAvatar = async (id: string, premium: boolean) => {
    if (premium && !ownsAvatarPack) {
      Alert.alert(t('editProfile.avatarLockedTitle'), t('editProfile.avatarLockedBody'));
      return;
    }
    try {
      await selectAvatar(id);
      setAvatarId(id);
      setAvatarModal(false);
      if (user) setUser({ ...(user as any), avatarId: id });
    } catch (e: any) {
      Alert.alert(t('editProfile.avatarLockedTitle'), e?.response?.data?.message || t('editProfile.avatarLockedBody'));
    }
  };

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('editProfile.permTitle'), fromCamera ? t('editProfile.permCamera') : t('editProfile.permGallery'));
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      setAvatarDirty(true);
      setAvatarId(null); // şəkil seçildi → emoji avatarı kənarlaşdır (şəkil göstərilsin)
      if (user) setUser({ ...(user as any), avatarUrl: uri });
    }
  };

  const onChangePhoto = () => {
    Alert.alert(
      t('editProfile.photoTitle'),
      t('editProfile.photoBody'),
      [
        { text: t('editProfile.camera'), onPress: () => pickImage(true) },
        { text: t('editProfile.gallery'), onPress: () => pickImage(false) },
        { text: t('editProfile.chooseAvatar'), onPress: () => setAvatarModal(true) },
        { text: t('editProfile.cancel'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // shared
  const nameParts = (user?.name ?? '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] ?? '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') ?? '');

  // teacher
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(userAny?.subjects ?? []);
  const [price, setPrice] = useState(userAny?.hourlyRate?.toString() ?? '');
  const [lessonFormats, setLessonFormats] = useState<LessonFormat[]>(userAny?.lessonFormats?.length ? userAny.lessonFormats : ['online']);
  const [areas, setAreas] = useState<string[]>(userAny?.areaNames?.length ? userAny.areaNames : (userAny?.areaName ? [userAny.areaName] : []));
  const [bio, setBio] = useState(userAny?.bio ?? '');
  // teacher trust
  const [headline, setHeadline] = useState(userAny?.headline ?? '');
  const [experienceYears, setExperienceYears] = useState(userAny?.experienceYears?.toString() ?? '');
  const [introVideoUrl, setIntroVideoUrl] = useState(userAny?.introVideoUrl ?? '');
  const [offersFreeDemo, setOffersFreeDemo] = useState(!!userAny?.offersFreeDemo);

  // şəhər/ərazi — həm şagird, həm müəllim üçün
  const [city, setCity] = useState(userAny?.city ?? userAny?.areaName ?? '');
  const [school, setSchool] = useState(userAny?.school ?? '');
  const [grade, setGrade] = useState(userAny?.grade ?? '9-cu');
  const [interests, setInterests] = useState<string[]>(userAny?.interests ?? []);
  const [goal, setGoal] = useState<Goal>((userAny?.goal as Goal) ?? 'university');

  // əlaqə (bütün rollar)
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [birthDate, setBirthDate] = useState(userAny?.birthDate ?? '');
  // parent
  const [notifExams, setNotifExams] = useState(true);
  const [notifLessons, setNotifLessons] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);

  useEffect(() => {
    getMe().then((me) => {
      const parts = me.name.split(' ');
      setFirstName(parts[0] ?? '');
      setLastName(parts.slice(1).join(' ') ?? '');
      setPhone(me.phone ?? '');
      setEmail(me.email ?? '');
      const meAny = me as any;
      if (meAny.birthDate) setBirthDate(meAny.birthDate);
      if (meAny.avatarUrl) setAvatarUri(meAny.avatarUrl);
      if (meAny.avatarId) setAvatarId(meAny.avatarId);
      else if (meAny.profile?.avatarId) setAvatarId(meAny.profile.avatarId);
      if (meAny.city) setCity(meAny.city);
      if (meAny.areaNames?.length) setAreas(meAny.areaNames);
      else if (meAny.areaName) setAreas([meAny.areaName]);
      if (meAny.lessonFormats?.length) setLessonFormats(meAny.lessonFormats);
      if (meAny.school) setSchool(meAny.school);
      if (meAny.grade) setGrade(meAny.grade);
      if (meAny.goal) setGoal(meAny.goal);
      if (meAny.bio) setBio(meAny.bio);
      if (meAny.subjects?.length) setSelectedSubjects(meAny.subjects);
      if (meAny.hourlyRate) setPrice(meAny.hourlyRate.toString());
      if (meAny.headline) setHeadline(meAny.headline);
      if (meAny.experienceYears) setExperienceYears(meAny.experienceYears.toString());
      if (meAny.introVideoUrl) setIntroVideoUrl(meAny.introVideoUrl);
      if (typeof meAny.offersFreeDemo === 'boolean') setOffersFreeDemo(meAny.offersFreeDemo);
    }).catch(() => {});
    getEntitlements().then((e) => setOwnsAvatarPack(e.ownedPacks?.includes('avatar') ?? false)).catch(() => {});
  }, []);

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const data: any = { name: [firstName, lastName].filter(Boolean).join(' ') };

      // Yeni şəkil seçilibsə əvvəlcə yüklə (uğursuz olsa lokal URI saxlanır).
      if (avatarDirty && avatarUri) {
        data.avatarUrl = await uploadImageOrFallback(avatarUri);
      }

      // Əlaqə məlumatları (müəllim + şagird üçün)
      if (role !== 'parent') {
        if (phone) data.phone = phone;
        if (email) data.email = email;
        data.birthDate = birthDate;
      }

      if (role === 'teacher') {
        data.bio = bio;
        data.subjects = selectedSubjects;
        if (price) data.hourlyRate = parseFloat(price);
        data.headline = headline;
        data.experienceYears = experienceYears ? parseInt(experienceYears, 10) : 0;
        data.introVideoUrl = introVideoUrl;
        data.offersFreeDemo = offersFreeDemo;
        data.lessonFormats = lessonFormats;
        data.areaNames = areas;
        if (areas[0]) data.areaName = areas[0];
      } else if (role === 'student') {
        // Əvvəllər bu sahələr heç vaxt göndərilmirdi — ona görə "yaddaşda qalmırdı".
        if (city) data.city = city;
        data.school = school;
        data.grade = grade;
        data.goal = goal;
      }
      return updateUser(data);
    },
    onSuccess: (updated) => {
      // Store-u serverdən qayıdan dəyərlərlə yenilə ki, geri qayıdanda dolu görünsün.
      if (updated) setUser({ ...(user as any), ...(updated as any) });
      Alert.alert(t('editProfile.savedTitle'), t('editProfile.savedBody'));
      navigation.goBack();
    },
    onError: () => Alert.alert(t('editProfile.errorTitle'), t('editProfile.errorBody')),
  });

  const toggleSubject = (s: string) =>
    setSelectedSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const toggleFormat = (f: LessonFormat) =>
    setLessonFormats((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const addArea = (name: string) =>
    setAreas((prev) => (prev.includes(name) ? prev : [...prev, name]));
  const removeArea = (name: string) =>
    setAreas((prev) => prev.filter((x) => x !== name));

  const toggleInterest = (s: string) =>
    setInterests((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleSave = () => save();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('editProfile.headerTitle')}</Text>
          </View>
          {role !== 'parent' ? (
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7} hitSlop={8}>
              <Text style={styles.saveTopBtn}>{t('editProfile.save')}</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 80 }} />}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <LinearGradient
                colors={[Colors.gradientStart + '30', Colors.gradientEnd + '15']}
                style={styles.avatarGradientRing}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <View style={styles.avatarInner}>
                  {avatarId ? (
                    <Text style={{ fontSize: 52 }}>{avatarEmoji(avatarId)}</Text>
                  ) : avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={52} color={Colors.primary} />
                  )}
                </View>
              </LinearGradient>
              <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8} onPress={onChangePhoto}>
                <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.cameraBtnInner}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={onChangePhoto}>
              <Text style={styles.changePhotoText}>{t('editProfile.changePhoto')}</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar (emoji) seçici modal */}
          <Modal visible={avatarModal} transparent animationType="slide" onRequestClose={() => setAvatarModal(false)}>
            <TouchableOpacity style={avStyles.overlay} activeOpacity={1} onPress={() => setAvatarModal(false)}>
              <View style={avStyles.sheet} onStartShouldSetResponder={() => true}>
                <Text style={avStyles.title}>{t('editProfile.chooseAvatar')}</Text>
                <View style={avStyles.grid}>
                  {AVATARS.map((a) => {
                    const locked = a.premium && !ownsAvatarPack;
                    const selected = avatarId === a.id;
                    return (
                      <TouchableOpacity
                        key={a.id}
                        style={[avStyles.cell, selected && avStyles.cellSel, locked && avStyles.cellLocked]}
                        activeOpacity={0.8}
                        onPress={() => onPickAvatar(a.id, a.premium)}
                      >
                        <Text style={{ fontSize: 34 }}>{a.emoji}</Text>
                        {locked && (
                          <View style={avStyles.lockBadge}><Ionicons name="lock-closed" size={11} color="#fff" /></View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {!ownsAvatarPack && <Text style={avStyles.hint}>{t('editProfile.avatarPackHint')}</Text>}
                <TouchableOpacity style={avStyles.closeBtn} onPress={() => setAvatarModal(false)} activeOpacity={0.85}>
                  <Text style={avStyles.closeText}>{t('editProfile.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {role === 'teacher' ? (
            <TeacherForm
              firstName={firstName} setFirstName={setFirstName}
              lastName={lastName} setLastName={setLastName}
              selectedSubjects={selectedSubjects} toggleSubject={toggleSubject}
              subjectOptions={subjectOptions}
              areas={areas} addArea={addArea} removeArea={removeArea}
              price={price} setPrice={setPrice}
              lessonFormats={lessonFormats} toggleFormat={toggleFormat}
              bio={bio} setBio={setBio}
              headline={headline} setHeadline={setHeadline}
              experienceYears={experienceYears} setExperienceYears={setExperienceYears}
              introVideoUrl={introVideoUrl} setIntroVideoUrl={setIntroVideoUrl}
              offersFreeDemo={offersFreeDemo} setOffersFreeDemo={setOffersFreeDemo}
            />
          ) : role === 'parent' ? (
            <ParentForm
              firstName={firstName} setFirstName={setFirstName}
              lastName={lastName} setLastName={setLastName}
              phone={phone} setPhone={setPhone}
              email={email} setEmail={setEmail}
              notifExams={notifExams} setNotifExams={setNotifExams}
              notifLessons={notifLessons} setNotifLessons={setNotifLessons}
              notifUpdates={notifUpdates} setNotifUpdates={setNotifUpdates}
              onSave={handleSave}
              onCancel={() => navigation.goBack()}
            />
          ) : (
            <StudentForm
              firstName={firstName} setFirstName={setFirstName}
              lastName={lastName} setLastName={setLastName}
              city={city} setCity={setCity}
              school={school} setSchool={setSchool}
              grade={grade} setGrade={setGrade}
              interests={interests} toggleInterest={toggleInterest}
              interestOptions={subjectOptions}
              goal={goal} setGoal={setGoal}
            />
          )}

          {/* Əlaqə məlumatları — müəllim və şagird üçün */}
          {role !== 'parent' && (
            <ContactFields
              phone={phone} setPhone={setPhone}
              email={email} setEmail={setEmail}
              birthDate={birthDate} setBirthDate={setBirthDate}
            />
          )}

          {/* Actions (teacher/student only — parent has inline actions) */}
          {role !== 'parent' && (
            <View style={styles.actions}>
              <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.85} onPress={handleSave} disabled={isSaving}>
                <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.saveBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t('editProfile.save')}</Text>}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelBtnText}>{t('editProfile.cancel')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ─── Teacher Form ────────────────────────────────────────────────────────────
function TeacherForm({
  firstName, setFirstName, lastName, setLastName,
  selectedSubjects, toggleSubject, subjectOptions, areas, addArea, removeArea, price, setPrice,
  lessonFormats, toggleFormat, bio, setBio,
  headline, setHeadline, experienceYears, setExperienceYears,
  introVideoUrl, setIntroVideoUrl, offersFreeDemo, setOffersFreeDemo,
}: {
  firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
  selectedSubjects: string[]; toggleSubject: (s: string) => void;
  subjectOptions: string[];
  areas: string[]; addArea: (s: string) => void; removeArea: (s: string) => void;
  price: string; setPrice: (v: string) => void;
  lessonFormats: LessonFormat[]; toggleFormat: (v: LessonFormat) => void;
  bio: string; setBio: (v: string) => void;
  headline: string; setHeadline: (v: string) => void;
  experienceYears: string; setExperienceYears: (v: string) => void;
  introVideoUrl: string; setIntroVideoUrl: (v: string) => void;
  offersFreeDemo: boolean; setOffersFreeDemo: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.formSection}>
      {/* Name */}
      <View style={styles.nameRow}>
        <View style={styles.nameField}>
          <Text style={styles.fieldLabel}>{t('editProfile.firstName')}</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder={t('editProfile.firstNamePlaceholder')} placeholderTextColor={Colors.textMuted} />
        </View>
        <View style={styles.nameField}>
          <Text style={styles.fieldLabel}>{t('editProfile.lastName')}</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder={t('editProfile.lastNamePlaceholder')} placeholderTextColor={Colors.textMuted} />
        </View>
      </View>

      {/* Subjects */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{t('editProfile.teachingSubjects')}</Text>
        <SubjectMultiPicker
          options={subjectOptions}
          selected={selectedSubjects}
          onToggle={toggleSubject}
          placeholder={t('editProfile.pickSubject')}
          title={t('editProfile.teachingSubjects')}
        />
      </View>

      {/* Bento: experience + price + city */}
      <View style={styles.bentoGrid}>
        <View style={[styles.bentoCard, styles.bentoHalf]}>
          <Text style={styles.bentoLabel}>{t('editProfile.experience')}</Text>
          <View style={styles.bentoRow}>
            <TextInput
              style={styles.bentoInput}
              value={experienceYears}
              onChangeText={setExperienceYears}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              maxLength={2}
            />
            <Text style={styles.bentoUnit}>{t('editProfile.yearUnit')}</Text>
          </View>
        </View>
        <View style={[styles.bentoCard, styles.bentoHalf]}>
          <Text style={styles.bentoLabel}>{t('editProfile.lessonPrice')}</Text>
          <View style={styles.bentoRow}>
            <TextInput style={styles.bentoInput} value={price} onChangeText={setPrice} keyboardType="numeric" />
            <Text style={styles.bentoUnit}>AZN</Text>
          </View>
        </View>
      </View>

      {/* Dərs keçdiyi ərazilər (bir neçə) */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{t('editProfile.teachingAreas')}</Text>
        {areas.length > 0 && (
          <View style={[styles.chipsWrap, { marginBottom: 8 }]}>
            {areas.map((a) => (
              <TouchableOpacity key={a} style={styles.areaChip} activeOpacity={0.7} onPress={() => removeArea(a)}>
                <Ionicons name="location" size={13} color={Colors.primary} />
                <Text style={styles.areaChipText} numberOfLines={1}>{a}</Text>
                <Ionicons name="close" size={14} color={Colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <LocationPicker
          placeholder={t('editProfile.addArea')}
          onSelect={({ path, name }) => addArea(path || name)}
        />
      </View>

      {/* Lesson format — bir neçə seçilə bilər */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{t('editProfile.lessonFormat')}</Text>
        <View style={styles.formatWrap}>
          {FORMATS.map((f) => {
            const active = lessonFormats.includes(f.key);
            return (
              <TouchableOpacity key={f.key}
                style={[styles.formatBtn, active && styles.formatBtnActive]}
                activeOpacity={0.8} onPress={() => toggleFormat(f.key)}>
                {active && <Ionicons name="checkmark-circle" size={16} color="#fff" />}
                <Text style={[styles.segText, active && styles.segTextActive]}>{t(f.labelKey)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Headline */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{t('editProfile.headline')}</Text>
        <TextInput
          style={styles.input} value={headline} onChangeText={setHeadline}
          placeholder={t('editProfile.headlinePlaceholder')}
          placeholderTextColor={Colors.textMuted}
          maxLength={90}
        />
      </View>

      {/* Bio */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{t('editProfile.about')}</Text>
        <TextInput
          style={styles.textarea} value={bio} onChangeText={setBio}
          multiline textAlignVertical="top" numberOfLines={4}
          placeholder={t('editProfile.aboutPlaceholder')}
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Intro video */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{t('editProfile.introVideo')}</Text>
        <View style={styles.inputIconWrap}>
          <Ionicons name="logo-youtube" size={18} color="#e11d48" style={styles.inputIcon} />
          <TextInput
            style={styles.inputCardWithIcon} value={introVideoUrl} onChangeText={setIntroVideoUrl}
            placeholder="https://youtu.be/..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none" keyboardType="url"
          />
        </View>
      </View>

      {/* Free demo lesson */}
      <View style={styles.demoRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.fieldLabel}>{t('editProfile.freeDemo')}</Text>
          <Text style={styles.demoSub}>{t('editProfile.freeDemoSub')}</Text>
        </View>
        <Switch
          value={offersFreeDemo} onValueChange={setOffersFreeDemo}
          trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
          thumbColor="#fff" ios_backgroundColor={Colors.surfaceHigh}
        />
      </View>

      {/* Availability */}
      <View style={styles.fieldBlock}>
        <View style={styles.availHeader}>
          <Text style={styles.fieldLabel}>{t('editProfile.availableHours')}</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.calendarLink}>{t('editProfile.openCalendar')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.availCard}>
          {t('editProfile.days').split('|').map((dayLabel, di) => (
            <View key={di} style={styles.dayCol}>
              <Text style={styles.dayLabel}>{dayLabel}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${DAY_FILLS[di] * 100}%` as any }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Student Form ─────────────────────────────────────────────────────────────
function StudentForm({
  firstName, setFirstName, lastName, setLastName,
  city, setCity, school, setSchool,
  grade, setGrade, interests, toggleInterest, interestOptions, goal, setGoal,
}: {
  firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
  city: string; setCity: (v: string) => void;
  school: string; setSchool: (v: string) => void;
  grade: string; setGrade: (v: string) => void;
  interests: string[]; toggleInterest: (s: string) => void;
  interestOptions: string[];
  goal: Goal; setGoal: (v: Goal) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.formSection}>
      {/* White card */}
      <View style={styles.formCard}>
        {/* Name */}
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Text style={styles.fieldLabelSm}>{t('editProfile.firstName')}</Text>
            <TextInput style={styles.inputCard} value={firstName} onChangeText={setFirstName} placeholder={t('editProfile.firstNamePlaceholder')} placeholderTextColor={Colors.textMuted} />
          </View>
          <View style={styles.nameField}>
            <Text style={styles.fieldLabelSm}>{t('editProfile.lastName')}</Text>
            <TextInput style={styles.inputCard} value={lastName} onChangeText={setLastName} placeholder={t('editProfile.lastNamePlaceholder')} placeholderTextColor={Colors.textMuted} />
          </View>
        </View>

        {/* City */}
        <View style={styles.fieldBlockCard}>
          <Text style={styles.fieldLabelSm}>{t('editProfile.cityArea')}</Text>
          <LocationPicker value={city} onSelect={({ path, name }) => setCity(path || name)} />
        </View>

        {/* School — ərazi → məktəb kaskad seçimi */}
        <View style={styles.fieldBlockCard}>
          <Text style={styles.fieldLabelSm}>{t('editProfile.school')}</Text>
          <LocationSchoolPicker value={school} onSelect={({ path }) => setSchool(path)} />
        </View>

        {/* Grade */}
        <View style={styles.fieldBlockCard}>
          <Text style={styles.fieldLabelSm}>{t('editProfile.grade')}</Text>
          <View style={styles.gradeBar}>
            {GRADES.map((g) => (
              <TouchableOpacity key={g}
                style={[styles.gradeBtn, grade === g && styles.gradeBtnActive]}
                activeOpacity={0.8} onPress={() => setGrade(g)}>
                <Text style={[styles.gradeText, grade === g && styles.gradeTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Interests */}
      <View style={styles.fieldBlock}>
        <Text style={styles.sectionTitle}>{t('editProfile.interests')}</Text>
        <SubjectMultiPicker
          options={interestOptions}
          selected={interests}
          onToggle={toggleInterest}
          placeholder={t('editProfile.pickSubject')}
          title={t('editProfile.interests')}
        />
      </View>

      {/* Goals */}
      <View style={styles.fieldBlock}>
        <Text style={styles.sectionTitle}>{t('editProfile.goal')}</Text>
        <View style={styles.goalsCard}>
          {GOALS.map((g) => {
            const selected = goal === g.id;
            return (
              <TouchableOpacity key={g.id}
                style={[styles.goalRow, selected && styles.goalRowActive]}
                activeOpacity={0.8} onPress={() => setGoal(g.id)}>
                <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.goalLabel, selected && styles.goalLabelActive]}>{t(g.labelKey)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Parent Form ──────────────────────────────────────────────────────────────
const PARENT_CHILDREN = [
  { id: '1', name: 'Cəfər Yusifov', gradeKey: 'editProfile.child1Grade', bgColor: Colors.primary + '1A', iconColor: Colors.primary },
  { id: '2', name: 'Aysel Məmmədova', gradeKey: 'editProfile.child2Grade', bgColor: Colors.tertiaryContainer + '60', iconColor: Colors.tertiary },
];

function ParentForm({
  firstName, setFirstName, lastName, setLastName,
  phone, setPhone, email, setEmail,
  notifExams, setNotifExams,
  notifLessons, setNotifLessons,
  notifUpdates, setNotifUpdates,
  onSave, onCancel,
}: {
  firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  notifExams: boolean; setNotifExams: (v: boolean) => void;
  notifLessons: boolean; setNotifLessons: (v: boolean) => void;
  notifUpdates: boolean; setNotifUpdates: (v: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.formSection}>
      {/* Personal info card */}
      <View style={styles.parentCard}>
        <Text style={styles.parentCardTitle}>{t('editProfile.personalInfo')}</Text>
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Text style={styles.fieldLabelSm}>{t('editProfile.firstName')}</Text>
            <TextInput style={styles.inputCard} value={firstName} onChangeText={setFirstName} placeholder={t('editProfile.firstNamePlaceholder')} placeholderTextColor={Colors.textMuted} />
          </View>
          <View style={styles.nameField}>
            <Text style={styles.fieldLabelSm}>{t('editProfile.lastName')}</Text>
            <TextInput style={styles.inputCard} value={lastName} onChangeText={setLastName} placeholder={t('editProfile.lastNamePlaceholder')} placeholderTextColor={Colors.textMuted} />
          </View>
        </View>
        <View style={styles.fieldBlockCard}>
          <Text style={styles.fieldLabelSm}>{t('editProfile.phoneNumber')}</Text>
          <View style={styles.inputIconWrap}>
            <TextInput
              style={styles.inputCardRight}
              value={phone}
              onChangeText={setPhone}
              placeholder="+994 XX XXX XX XX"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
            />
            <Ionicons name="call-outline" size={18} color={Colors.textMuted} style={styles.inputIconRightPos} />
          </View>
        </View>
        <View style={styles.fieldBlockCard}>
          <Text style={styles.fieldLabelSm}>{t('editProfile.emailAddress')}</Text>
          <View style={styles.inputIconWrap}>
            <TextInput
              style={styles.inputCardRight}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIconRightPos} />
          </View>
        </View>
      </View>

      {/* Connected students card */}
      <View style={styles.parentCard}>
        <View style={styles.parentCardHeader}>
          <Text style={styles.parentCardTitle}>{t('editProfile.connectedStudents')}</Text>
          <TouchableOpacity style={styles.addChildBtn} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={18} color={Colors.primary} />
            <Text style={styles.addChildText}>{t('editProfile.addStudent')}</Text>
          </TouchableOpacity>
        </View>
        {PARENT_CHILDREN.map((child) => (
          <View key={child.id} style={styles.childRow}>
            <View style={[styles.childIconBox, { backgroundColor: child.bgColor }]}>
              <Ionicons name="person" size={22} color={child.iconColor} />
            </View>
            <View style={styles.childTextBlock}>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childGrade}>{t(child.gradeKey)}</Text>
            </View>
            <TouchableOpacity style={styles.childDeleteBtn} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Notification settings card */}
      <View style={styles.parentCard}>
        <Text style={styles.parentCardTitle}>{t('editProfile.notifPrefs')}</Text>
        <View style={styles.notifRow}>
          <View style={styles.notifTextBlock}>
            <Text style={styles.notifLabel}>{t('editProfile.notifExam')}</Text>
            <Text style={styles.notifSub}>{t('editProfile.notifExamSub')}</Text>
          </View>
          <Switch
            value={notifExams} onValueChange={setNotifExams}
            trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
            thumbColor="#fff" ios_backgroundColor={Colors.surfaceHigh}
          />
        </View>
        <View style={[styles.notifRow, styles.notifRowBorder]}>
          <View style={styles.notifTextBlock}>
            <Text style={styles.notifLabel}>{t('editProfile.notifLesson')}</Text>
            <Text style={styles.notifSub}>{t('editProfile.notifLessonSub')}</Text>
          </View>
          <Switch
            value={notifLessons} onValueChange={setNotifLessons}
            trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
            thumbColor="#fff" ios_backgroundColor={Colors.surfaceHigh}
          />
        </View>
        <View style={[styles.notifRow, styles.notifRowBorder]}>
          <View style={styles.notifTextBlock}>
            <Text style={styles.notifLabel}>{t('editProfile.notifSystem')}</Text>
            <Text style={styles.notifSub}>{t('editProfile.notifSystemSub')}</Text>
          </View>
          <Switch
            value={notifUpdates} onValueChange={setNotifUpdates}
            trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
            thumbColor="#fff" ios_backgroundColor={Colors.surfaceHigh}
          />
        </View>
      </View>

      {/* Actions — side by side */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.cancelBtnRow} activeOpacity={0.7} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>{t('editProfile.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtnRowWrap} activeOpacity={0.85} onPress={onSave}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.saveBtnRow}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveBtnText}>{t('editProfile.save')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Contact Fields (müəllim + şagird) ────────────────────────────────────────
function ContactFields({
  phone, setPhone, email, setEmail, birthDate, setBirthDate,
}: {
  phone: string; setPhone: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  birthDate: string; setBirthDate: (v: string) => void;
}) {
  const { t } = useTranslation();
  // Doğum tarixini GG.AA.İİİİ formatında avtomatik nöqtələ.
  const onBirth = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 8);
    let out = d.slice(0, 2);
    if (d.length > 2) out += '.' + d.slice(2, 4);
    if (d.length > 4) out += '.' + d.slice(4, 8);
    setBirthDate(out);
  };
  return (
    <View style={styles.formSection}>
      <Text style={styles.fieldLabel}>{t('editProfile.contactInfo')}</Text>

      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabelSm}>{t('editProfile.birthDate')}</Text>
        <View style={styles.contactInputRow}>
          <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
          <TextInput
            style={styles.contactInput}
            value={birthDate}
            onChangeText={onBirth}
            placeholder={t('editProfile.birthPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabelSm}>{t('editProfile.phone')}</Text>
        <View style={styles.contactInputRow}>
          <Ionicons name="call-outline" size={18} color={Colors.primary} />
          <TextInput
            style={styles.contactInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="+994XXXXXXXXX"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabelSm}>{t('editProfile.emailField')}</Text>
        <View style={styles.contactInputRow}>
          <Ionicons name="mail-outline" size={18} color={Colors.primary} />
          <TextInput
            style={styles.contactInput}
            value={email}
            onChangeText={setEmail}
            placeholder="ad@mail.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contactInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceSecondary, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  contactInput: { flex: 1, fontSize: 15, color: Colors.textPrimary, padding: 0 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  saveTopBtn: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 20, gap: 20, paddingBottom: 40 },

  // Avatar
  avatarSection: { alignItems: 'center', gap: 12 },
  avatarRing: { position: 'relative' },
  avatarGradientRing: {
    width: 136, height: 136, borderRadius: 68, padding: 4,
  },
  avatarInner: {
    flex: 1, borderRadius: 64, backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.surfaceLowest,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  cameraBtn: { position: 'absolute', bottom: 4, right: 4 },
  cameraBtnInner: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surfaceLowest,
  },
  changePhotoText: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  // Forms
  formSection: { gap: 20 },
  nameRow: { flexDirection: 'row', gap: 12 },
  nameField: { flex: 1, gap: 6 },

  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginLeft: 2 },
  fieldLabelSm: {
    fontSize: 10, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1, marginLeft: 2,
  },
  fieldBlock: { gap: 10 },
  fieldBlockCard: { gap: 8 },

  input: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontWeight: '600', color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.borderLight,
  },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  chipBorder: { backgroundColor: Colors.surfaceLowest, borderWidth: 1, borderColor: Colors.border },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  chipTextActive: { color: '#fff' },
  chipAdd: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },

  // Bento grid
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  bentoCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    padding: 16, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  bentoHalf: { width: '47%' },
  bentoFull: { width: '100%' },
  bentoLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.2 },
  bentoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bentoRowInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bentoValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  bentoInput: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1, padding: 0 },
  bentoUnit: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  // Segmented (lesson format)
  segmented: {
    flexDirection: 'row', gap: 4,
    backgroundColor: Colors.surfaceLow, borderRadius: 999, padding: 4,
  },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  segBtnActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  segText: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },
  segTextActive: { fontWeight: '700', color: '#fff' },

  // Çoxseçimli format düymələri
  formatWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  formatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999,
    backgroundColor: Colors.surfaceLowest, borderWidth: 1, borderColor: Colors.border,
  },
  formatBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },

  // Ərazi çipləri (silinə bilən)
  areaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingVertical: 7, paddingHorizontal: 12, maxWidth: '100%',
  },
  areaChipText: { fontSize: 13, fontWeight: '600', color: Colors.primary, flexShrink: 1 },

  // Bio
  textarea: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, color: Colors.textPrimary, lineHeight: 22,
    minHeight: 110,
    borderWidth: 1, borderColor: Colors.borderLight,
  },

  // Free demo
  demoRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  demoSub: { fontSize: 11, color: Colors.textMuted, marginTop: 4, lineHeight: 16 },

  // Availability
  availHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarLink: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  availCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  dayCol: { alignItems: 'center', gap: 8 },
  dayLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase' },
  barTrack: {
    width: 8, height: 40, borderRadius: 4,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: Colors.primary, borderRadius: 4 },

  // Student form card
  formCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  inputCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, fontWeight: '600', color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  inputIconWrap: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 14, zIndex: 1 },
  inputCardWithIcon: {
    backgroundColor: Colors.surfaceLow, borderRadius: 16,
    paddingLeft: 44, paddingRight: 16, paddingVertical: 14,
    fontSize: 14, fontWeight: '500', color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  inputText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // Grade
  gradeBar: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  gradeBtn: {
    minWidth: 52, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: Colors.surfaceLowest, borderWidth: 1, borderColor: Colors.border,
  },
  gradeBtnActive: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 3,
  },
  gradeText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  gradeTextActive: { fontWeight: '800', color: '#fff' },

  // Interests
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  interestHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  addAllText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  // Goals
  goalsCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 16, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  goalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 16, borderWidth: 1, borderColor: 'transparent',
  },
  goalRowActive: {
    backgroundColor: Colors.primaryLight + '66',
    borderColor: Colors.primary + '1A',
  },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  goalLabel: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, flex: 1 },
  goalLabelActive: { fontWeight: '700', color: Colors.primary },

  // Actions
  actions: { gap: 12, paddingTop: 8 },
  saveBtn: {
    borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  cancelBtn: {
    borderRadius: 999, paddingVertical: 16,
    backgroundColor: Colors.surfaceHigh, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },

  // Parent form
  parentCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  parentCardTitle: {
    fontSize: 10, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.4,
  },
  parentCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addChildBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addChildText: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  childRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 12, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  childIconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  childTextBlock: { flex: 1, gap: 2 },
  childName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  childGrade: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
  childDeleteBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  notifRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12,
  },
  notifRowBorder: {
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  notifTextBlock: { flex: 1, gap: 2, marginRight: 12 },
  notifLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  notifSub: { fontSize: 11, color: Colors.textMuted },
  actionsRow: { flexDirection: 'row', gap: 12, paddingTop: 8 },
  cancelBtnRow: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: Colors.surfaceHigh, alignItems: 'center',
  },
  saveBtnRowWrap: { flex: 1 },
  saveBtnRow: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  inputCardRight: {
    backgroundColor: Colors.surfaceLow, borderRadius: 16,
    paddingLeft: 16, paddingRight: 44, paddingVertical: 14,
    fontSize: 14, fontWeight: '600', color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  inputIconRightPos: { position: 'absolute', right: 14, zIndex: 1 },
});

const avStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  title: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  cell: {
    width: 62, height: 62, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow, borderWidth: 2, borderColor: 'transparent',
  },
  cellSel: { borderColor: Colors.primary, backgroundColor: Colors.primary + '12' },
  cellLocked: { opacity: 0.55 },
  lockBadge: {
    position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#6B7280', alignItems: 'center', justifyContent: 'center',
  },
  hint: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 14, lineHeight: 17 },
  closeBtn: { marginTop: 18, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 28 },
  closeText: { fontSize: 14, fontWeight: '800', color: Colors.textSecondary },
});
