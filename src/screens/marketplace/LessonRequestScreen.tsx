import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const SUBJECTS = ['Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Fizika', 'Kimya', 'Biologiya', 'Tarix'];
const GRADES = ['5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif', 'Abituriyent', 'Magistratura'];
const FORMATS = ['Online', 'Evdə', 'Kursda'] as const;
type Format = typeof FORMATS[number];

export default function LessonRequestScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState<Format>('Online');
  const [frequency, setFrequency] = useState(3);
  const [note, setNote] = useState('');

  const showSubjectPicker = () =>
    Alert.alert('Fənn seçin', '', [
      ...SUBJECTS.map(s => ({ text: s, onPress: () => setSubject(s) })),
      { text: 'Ləğv et', style: 'cancel' as const, onPress: () => {} },
    ]);

  const showGradePicker = () =>
    Alert.alert('Sinif seçin', '', [
      ...GRADES.map(g => ({ text: g, onPress: () => setGrade(g) })),
      { text: 'Ləğv et', style: 'cancel' as const, onPress: () => {} },
    ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dərs Sorğusu</Text>
          </View>
          <View style={styles.headerBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Kimi mascot banner */}
          <View style={styles.mascotBanner}>
            <View style={styles.mascotText}>
              <Text style={styles.mascotTitle}>Salam! Mən Kimi.</Text>
              <Text style={styles.mascotSub}>
                Sizin üçün ən uyğun müəllimi tapmağım üçün zəhmət olmasa dərslə bağlı detalları qeyd edin.
              </Text>
            </View>
            <LinearGradient colors={GRADIENT} style={styles.mascotGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="hardware-chip-outline" size={36} color="#fff" />
            </LinearGradient>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Subject + Grade */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>FƏNN</Text>
                <TouchableOpacity style={styles.selectBox} activeOpacity={0.7} onPress={showSubjectPicker}>
                  <Text style={[styles.selectText, !subject && styles.selectPlaceholder]}>
                    {subject || 'Fənn seçin'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>SİNİF</Text>
                <TouchableOpacity style={styles.selectBox} activeOpacity={0.7} onPress={showGradePicker}>
                  <Text style={[styles.selectText, !grade && styles.selectPlaceholder]}>
                    {grade || 'Sinif seçin'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Topic */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>MÖVZU</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Öyrənmək istədiyiniz mövzunu daxil edin"
                placeholderTextColor={Colors.outlineVariant}
                value={topic}
                onChangeText={setTopic}
              />
            </View>

            {/* Format */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DƏRS FORMATI</Text>
              <View style={styles.formatRow}>
                {FORMATS.map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.formatBtn, format === f && styles.formatBtnActive]}
                    activeOpacity={0.7}
                    onPress={() => setFormat(f)}
                  >
                    <Text style={[styles.formatBtnText, format === f && styles.formatBtnTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time + Frequency */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>VAXT</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>HƏFTƏDƏ NƏ QƏDƏR</Text>
                <View style={styles.stepperBox}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    activeOpacity={0.7}
                    onPress={() => setFrequency(v => Math.max(1, v - 1))}
                  >
                    <Ionicons name="remove" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{frequency} dəfə</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    activeOpacity={0.7}
                    onPress={() => setFrequency(v => Math.min(7, v + 1))}
                  >
                    <Ionicons name="add" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>QEYD</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Müəllim üçün əlavə qeydləriniz varsa bura yaza bilərsiniz..."
                placeholderTextColor={Colors.outlineVariant}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={{ marginTop: 8 }}
              onPress={() => Alert.alert('Sorğu göndərildi', 'Sorğunuz 24 saat ərzində cavablandırılacaq')}
            >
              <LinearGradient
                colors={GRADIENT}
                style={styles.submitBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitBtnText}>Sorğu göndər</Text>
                <Ionicons name="send" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.submitNote}>Sorğu 24 saat ərzində cavablandırılacaq</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  mascotBanner: {
    backgroundColor: Colors.primary + '18',
    borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: Colors.primary + '0D',
    marginBottom: 24,
  },
  mascotText: { flex: 1, gap: 4 },
  mascotTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  mascotSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  mascotGrad: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  form: { gap: 20 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1, gap: 6 },
  field: { gap: 6 },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.textSecondary,
    letterSpacing: 1.2, paddingHorizontal: 4,
  },

  selectBox: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 12, height: 56,
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  selectText: { fontSize: 14, color: Colors.textPrimary, flex: 1 },
  selectPlaceholder: { color: Colors.outlineVariant },

  textInput: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 12, height: 56,
    paddingHorizontal: 14, fontSize: 14, color: Colors.textPrimary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },

  formatRow: { flexDirection: 'row', gap: 10 },
  formatBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: Colors.surfaceLow, alignItems: 'center',
  },
  formatBtnActive: { backgroundColor: Colors.primary },
  formatBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  formatBtnTextActive: { color: '#fff' },

  stepperBox: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 12, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  stepBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  stepperValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },

  textarea: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 12,
    padding: 14, fontSize: 14, color: Colors.textPrimary, minHeight: 120,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },

  submitBtn: {
    borderRadius: 16, height: 64,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  submitNote: {
    fontSize: 10, color: Colors.textMuted, textAlign: 'center',
    letterSpacing: 1, textTransform: 'uppercase', marginTop: 8,
  },
});
