import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform, Switch,
  ActivityIndicator, Image,
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
import { useMutation } from '@tanstack/react-query';
import { getMe, updateUser } from '../../api/user.api';
import { useUserStore } from '../../store/user.store';
import LocationSchoolPicker from '../../components/common/LocationSchoolPicker';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, typeof Routes.EditProfile>;
  route: RouteProp<ProfileStackParamList, typeof Routes.EditProfile>;
};

type LessonFormat = 'online' | 'home' | 'course';
type Goal = 'university' | 'school' | 'general';

const TEACHER_SUBJECTS = ['Riyaziyyat', 'Fizika', 'Kimya', 'Azərbaycan dili', 'İngilis dili'];
const STUDENT_INTERESTS = ['Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Fizika', 'Kimya'];
const GOALS: { id: Goal; label: string }[] = [
  { id: 'university', label: 'Ali məktəbə qəbul hazırlığı' },
  { id: 'school', label: 'Məktəb dərslərində uğur' },
  { id: 'general', label: 'Ümumi bilik və inkişaf' },
];
const DAYS = [
  { label: 'B.E', fill: 0.5 }, { label: 'Ç.A', fill: 0.75 },
  { label: 'Ç', fill: 1.0 }, { label: 'C.A', fill: 0.25 },
  { label: 'C', fill: 0 }, { label: 'Ş', fill: 0.5 }, { label: 'B', fill: 0 },
];
const GRADES = ['9-cu', '10-cu', '11-ci'];
const FORMATS: { key: LessonFormat; label: string }[] = [
  { key: 'online', label: 'Online' },
  { key: 'home', label: 'Evdə' },
  { key: 'course', label: 'Kursda' },
];

export default function EditProfileScreen({ navigation, route }: Props) {
  const { user, setUser } = useUserStore();
  const role = route.params?.role ?? (user?.role === 'teacher' ? 'teacher' : user?.role === 'parent' ? 'parent' : 'student');
  const userAny = user as any;
  const [avatarUri, setAvatarUri] = useState<string | undefined>(userAny?.avatarUrl);

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İcazə yoxdur', fromCamera ? 'Kamera icazəsi verilməyib' : 'Qalereya icazəsi verilməyib');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      if (user) setUser({ ...(user as any), avatarUrl: uri });
    }
  };

  const onChangePhoto = () => {
    Alert.alert(
      'Şəkil seç',
      'Şəkli haradan seçmək istəyirsən?',
      [
        { text: 'Kamera', onPress: () => pickImage(true) },
        { text: 'Qalereya', onPress: () => pickImage(false) },
        { text: 'Ləğv et', style: 'cancel' },
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
  const [lessonFormat, setLessonFormat] = useState<LessonFormat>('online');
  const [bio, setBio] = useState(userAny?.bio ?? '');
  // teacher trust
  const [headline, setHeadline] = useState(userAny?.headline ?? '');
  const [experienceYears, setExperienceYears] = useState(userAny?.experienceYears?.toString() ?? '');
  const [introVideoUrl, setIntroVideoUrl] = useState(userAny?.introVideoUrl ?? '');
  const [offersFreeDemo, setOffersFreeDemo] = useState(!!userAny?.offersFreeDemo);

  // student
  const [city, setCity] = useState('Bakı');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('9-cu');
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState<Goal>('university');

  // parent
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
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
      if (meAny.bio) setBio(meAny.bio);
      if (meAny.subjects?.length) setSelectedSubjects(meAny.subjects);
      if (meAny.hourlyRate) setPrice(meAny.hourlyRate.toString());
      if (meAny.headline) setHeadline(meAny.headline);
      if (meAny.experienceYears) setExperienceYears(meAny.experienceYears.toString());
      if (meAny.introVideoUrl) setIntroVideoUrl(meAny.introVideoUrl);
      if (typeof meAny.offersFreeDemo === 'boolean') setOffersFreeDemo(meAny.offersFreeDemo);
    }).catch(() => {});
  }, []);

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: () => {
      const data: any = { name: [firstName, lastName].filter(Boolean).join(' ') };
      if (role === 'teacher') {
        data.bio = bio;
        data.subjects = selectedSubjects;
        if (price) data.hourlyRate = parseFloat(price);
        data.headline = headline;
        data.experienceYears = experienceYears ? parseInt(experienceYears, 10) : 0;
        data.introVideoUrl = introVideoUrl;
        data.offersFreeDemo = offersFreeDemo;
      }
      return updateUser(data);
    },
    onSuccess: () => {
      Alert.alert('Yadda saxlandı', 'Profil məlumatları yeniləndi.');
      navigation.goBack();
    },
    onError: () => Alert.alert('Xəta', 'Saxlanılmadı. Yenidən cəhd edin.'),
  });

  const toggleSubject = (s: string) =>
    setSelectedSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

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
            <Text style={styles.headerTitle}>Profili Redaktə Et</Text>
          </View>
          {role !== 'parent' ? (
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7} hitSlop={8}>
              <Text style={styles.saveTopBtn}>Yadda saxla</Text>
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
                  {avatarUri ? (
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
              <Text style={styles.changePhotoText}>Şəkli dəyiş</Text>
            </TouchableOpacity>
          </View>

          {role === 'teacher' ? (
            <TeacherForm
              firstName={firstName} setFirstName={setFirstName}
              lastName={lastName} setLastName={setLastName}
              selectedSubjects={selectedSubjects} toggleSubject={toggleSubject}
              price={price} setPrice={setPrice}
              lessonFormat={lessonFormat} setLessonFormat={setLessonFormat}
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
              goal={goal} setGoal={setGoal}
            />
          )}

          {/* Actions (teacher/student only — parent has inline actions) */}
          {role !== 'parent' && (
            <View style={styles.actions}>
              <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.85} onPress={handleSave} disabled={isSaving}>
                <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.saveBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Yadda saxla</Text>}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelBtnText}>Ləğv et</Text>
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
  selectedSubjects, toggleSubject, price, setPrice,
  lessonFormat, setLessonFormat, bio, setBio,
  headline, setHeadline, experienceYears, setExperienceYears,
  introVideoUrl, setIntroVideoUrl, offersFreeDemo, setOffersFreeDemo,
}: {
  firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
  selectedSubjects: string[]; toggleSubject: (s: string) => void;
  price: string; setPrice: (v: string) => void;
  lessonFormat: LessonFormat; setLessonFormat: (v: LessonFormat) => void;
  bio: string; setBio: (v: string) => void;
  headline: string; setHeadline: (v: string) => void;
  experienceYears: string; setExperienceYears: (v: string) => void;
  introVideoUrl: string; setIntroVideoUrl: (v: string) => void;
  offersFreeDemo: boolean; setOffersFreeDemo: (v: boolean) => void;
}) {
  return (
    <View style={styles.formSection}>
      {/* Name */}
      <View style={styles.nameRow}>
        <View style={styles.nameField}>
          <Text style={styles.fieldLabel}>Ad</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Adınız" placeholderTextColor={Colors.textMuted} />
        </View>
        <View style={styles.nameField}>
          <Text style={styles.fieldLabel}>Soyad</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Soyadınız" placeholderTextColor={Colors.textMuted} />
        </View>
      </View>

      {/* Subjects */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>Tədris etdiyiniz fənlər</Text>
        <View style={styles.chipsWrap}>
          {TEACHER_SUBJECTS.map((s) => {
            const active = selectedSubjects.includes(s);
            return (
              <TouchableOpacity key={s} style={[styles.chip, active && styles.chipActive]} activeOpacity={0.8} onPress={() => toggleSubject(s)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.chipAdd} activeOpacity={0.7}>
            <Ionicons name="add" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bento: experience + price + city */}
      <View style={styles.bentoGrid}>
        <View style={[styles.bentoCard, styles.bentoHalf]}>
          <Text style={styles.bentoLabel}>Təcrübə (il)</Text>
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
            <Text style={styles.bentoUnit}>İl</Text>
          </View>
        </View>
        <View style={[styles.bentoCard, styles.bentoHalf]}>
          <Text style={styles.bentoLabel}>Dərs qiyməti</Text>
          <View style={styles.bentoRow}>
            <TextInput style={styles.bentoInput} value={price} onChangeText={setPrice} keyboardType="numeric" />
            <Text style={styles.bentoUnit}>AZN</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.bentoCard, styles.bentoFull]} activeOpacity={0.8}>
          <Text style={styles.bentoLabel}>Şəhər</Text>
          <View style={styles.bentoRow}>
            <View style={styles.bentoRowInner}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={styles.bentoValue}>Bakı, Azərbaycan</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Lesson format */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>Dərs formatı</Text>
        <View style={styles.segmented}>
          {FORMATS.map((f) => (
            <TouchableOpacity key={f.key}
              style={[styles.segBtn, lessonFormat === f.key && styles.segBtnActive]}
              activeOpacity={0.8} onPress={() => setLessonFormat(f.key)}>
              <Text style={[styles.segText, lessonFormat === f.key && styles.segTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Headline */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>Qısa təqdimat (şüar)</Text>
        <TextInput
          style={styles.input} value={headline} onChangeText={setHeadline}
          placeholder="Məs: 10 ildir abituriyentləri ali məktəbə hazırlayıram"
          placeholderTextColor={Colors.textMuted}
          maxLength={90}
        />
      </View>

      {/* Bio */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>Haqqımda</Text>
        <TextInput
          style={styles.textarea} value={bio} onChangeText={setBio}
          multiline textAlignVertical="top" numberOfLines={4}
          placeholder="Özünüz haqqında qısa məlumat yazın..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Intro video */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>Təqdimat videosu (YouTube linki)</Text>
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
          <Text style={styles.fieldLabel}>Pulsuz demo dərs</Text>
          <Text style={styles.demoSub}>Yeni şagirdlərə 1 pulsuz tanışlıq dərsi təklif et — daha çox sorğu gətirir.</Text>
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
          <Text style={styles.fieldLabel}>Mövcud saatlar</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.calendarLink}>Təqvimi aç</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.availCard}>
          {DAYS.map((d) => (
            <View key={d.label} style={styles.dayCol}>
              <Text style={styles.dayLabel}>{d.label}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${d.fill * 100}%` as any }]} />
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
  grade, setGrade, interests, toggleInterest, goal, setGoal,
}: {
  firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
  city: string; setCity: (v: string) => void;
  school: string; setSchool: (v: string) => void;
  grade: string; setGrade: (v: string) => void;
  interests: string[]; toggleInterest: (s: string) => void;
  goal: Goal; setGoal: (v: Goal) => void;
}) {
  return (
    <View style={styles.formSection}>
      {/* White card */}
      <View style={styles.formCard}>
        {/* Name */}
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Text style={styles.fieldLabelSm}>Ad</Text>
            <TextInput style={styles.inputCard} value={firstName} onChangeText={setFirstName} placeholder="Adınız" placeholderTextColor={Colors.textMuted} />
          </View>
          <View style={styles.nameField}>
            <Text style={styles.fieldLabelSm}>Soyad</Text>
            <TextInput style={styles.inputCard} value={lastName} onChangeText={setLastName} placeholder="Soyadınız" placeholderTextColor={Colors.textMuted} />
          </View>
        </View>

        {/* City */}
        <View style={styles.fieldBlockCard}>
          <Text style={styles.fieldLabelSm}>Şəhər</Text>
          <TouchableOpacity style={styles.inputCard} activeOpacity={0.8}
            onPress={() => Alert.alert('Şəhər', 'Şəhər seçimi')}>
            <View style={styles.selectRow}>
              <Text style={styles.inputText}>{city}</Text>
              <Ionicons name="chevron-expand" size={18} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* School — ərazi → məktəb kaskad seçimi */}
        <View style={styles.fieldBlockCard}>
          <Text style={styles.fieldLabelSm}>Məktəb</Text>
          <LocationSchoolPicker value={school} onSelect={({ path }) => setSchool(path)} />
        </View>

        {/* Grade */}
        <View style={styles.fieldBlockCard}>
          <Text style={styles.fieldLabelSm}>Sinif</Text>
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
        <View style={styles.interestHeader}>
          <Text style={styles.sectionTitle}>Maraqlandığın fənlər</Text>
          <TouchableOpacity style={styles.addAllBtn} activeOpacity={0.7}>
            <Ionicons name="add" size={14} color={Colors.primary} />
            <Text style={styles.addAllText}>Hamısı</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipsWrap}>
          {STUDENT_INTERESTS.map((s) => {
            const active = interests.includes(s);
            return (
              <TouchableOpacity key={s}
                style={[styles.chip, active ? styles.chipActive : styles.chipBorder]}
                activeOpacity={0.8} onPress={() => toggleInterest(s)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}</Text>
                {active && <Ionicons name="checkmark" size={13} color="#fff" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Goals */}
      <View style={styles.fieldBlock}>
        <Text style={styles.sectionTitle}>Məqsədin</Text>
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
                <Text style={[styles.goalLabel, selected && styles.goalLabelActive]}>{g.label}</Text>
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
  { id: '1', name: 'Cəfər Yusifov', grade: '7-ci sinif şagirdi', bgColor: Colors.primary + '1A', iconColor: Colors.primary },
  { id: '2', name: 'Aysel Məmmədova', grade: '4-cü sinif şagirdi', bgColor: Colors.tertiaryContainer + '60', iconColor: Colors.tertiary },
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
  return (
    <View style={styles.formSection}>
      {/* Personal info card */}
      <View style={styles.parentCard}>
        <Text style={styles.parentCardTitle}>ŞƏXSİ MƏLUMATLAR</Text>
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Text style={styles.fieldLabelSm}>Ad</Text>
            <TextInput style={styles.inputCard} value={firstName} onChangeText={setFirstName} placeholder="Adınız" placeholderTextColor={Colors.textMuted} />
          </View>
          <View style={styles.nameField}>
            <Text style={styles.fieldLabelSm}>Soyad</Text>
            <TextInput style={styles.inputCard} value={lastName} onChangeText={setLastName} placeholder="Soyadınız" placeholderTextColor={Colors.textMuted} />
          </View>
        </View>
        <View style={styles.fieldBlockCard}>
          <Text style={styles.fieldLabelSm}>Telefon nömrəsi</Text>
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
          <Text style={styles.fieldLabelSm}>Email ünvanı</Text>
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
          <Text style={styles.parentCardTitle}>ƏLAQƏLİ ŞAGİRDLƏR</Text>
          <TouchableOpacity style={styles.addChildBtn} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={18} color={Colors.primary} />
            <Text style={styles.addChildText}>ŞAGİRD ƏLAVƏ ET</Text>
          </TouchableOpacity>
        </View>
        {PARENT_CHILDREN.map((child) => (
          <View key={child.id} style={styles.childRow}>
            <View style={[styles.childIconBox, { backgroundColor: child.bgColor }]}>
              <Ionicons name="person" size={22} color={child.iconColor} />
            </View>
            <View style={styles.childTextBlock}>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childGrade}>{child.grade}</Text>
            </View>
            <TouchableOpacity style={styles.childDeleteBtn} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Notification settings card */}
      <View style={styles.parentCard}>
        <Text style={styles.parentCardTitle}>BİLDİRİŞ SEÇİMLƏRİ</Text>
        <View style={styles.notifRow}>
          <View style={styles.notifTextBlock}>
            <Text style={styles.notifLabel}>İmtahan nəticələri</Text>
            <Text style={styles.notifSub}>Nəticələr çıxdıqda dərhal xəbər ver</Text>
          </View>
          <Switch
            value={notifExams} onValueChange={setNotifExams}
            trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
            thumbColor="#fff" ios_backgroundColor={Colors.surfaceHigh}
          />
        </View>
        <View style={[styles.notifRow, styles.notifRowBorder]}>
          <View style={styles.notifTextBlock}>
            <Text style={styles.notifLabel}>Dərs xatırlatmaları</Text>
            <Text style={styles.notifSub}>Dərsdən 1 saat əvvəl bildiriş göndər</Text>
          </View>
          <Switch
            value={notifLessons} onValueChange={setNotifLessons}
            trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
            thumbColor="#fff" ios_backgroundColor={Colors.surfaceHigh}
          />
        </View>
        <View style={[styles.notifRow, styles.notifRowBorder]}>
          <View style={styles.notifTextBlock}>
            <Text style={styles.notifLabel}>Sistem yenilikləri</Text>
            <Text style={styles.notifSub}>Yeni funksiyalar haqqında məlumat al</Text>
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
          <Text style={styles.cancelBtnText}>Ləğv et</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtnRowWrap} activeOpacity={0.85} onPress={onSave}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.saveBtnRow}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveBtnText}>Yadda saxla</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

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
  segTextActive: { fontWeight: '700', color: Colors.primary },

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
    flexDirection: 'row', gap: 4,
    backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 4,
  },
  gradeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
  },
  gradeBtnActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  gradeText: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },
  gradeTextActive: { fontWeight: '700', color: Colors.primary },

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
