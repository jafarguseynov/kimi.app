import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const PROBLEM_TYPES = [
  { value: 'tech', label: 'Texniki xəta' },
  { value: 'content', label: 'Dərs məzmunu' },
  { value: 'payment', label: 'Ödəniş problemi' },
  { value: 'other', label: 'Digər' },
];

export default function ReportProblemScreen() {
  const navigation = useNavigation<any>();
  const [problemType, setProblemType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const selectedLabel = PROBLEM_TYPES.find(t => t.value === problemType)?.label ?? 'Növ seçin';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Problemi Bildir</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Sizə necə kömək edə bilərik?</Text>
          <Text style={styles.introSub}>Problemi təsvir edin, komandamız ən qısa zamanda sizinlə əlaqə saxlayacaq.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Problem type */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Problem növü</Text>
            <TouchableOpacity style={styles.selectRow} activeOpacity={0.85} onPress={() => setShowPicker(!showPicker)}>
              <Text style={[styles.selectText, !problemType && styles.selectPlaceholder]}>{selectedLabel}</Text>
              <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.outline} />
            </TouchableOpacity>
            {showPicker && (
              <View style={styles.dropdown}>
                {PROBLEM_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.dropdownOption, problemType === type.value && styles.dropdownOptionActive]}
                    onPress={() => { setProblemType(type.value); setShowPicker(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownOptionText, problemType === type.value && styles.dropdownOptionTextActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Qısa başlıq</Text>
            <View style={[styles.inputBox, titleFocused && styles.inputBoxFocused]}>
              <TextInput
                style={styles.inputText}
                placeholder="Məsələn: Video açılmır"
                placeholderTextColor={Colors.outlineVariant}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Açıqlama</Text>
            <View style={[styles.textareaBox, descFocused && styles.inputBoxFocused]}>
              <TextInput
                style={styles.textareaInput}
                placeholder="Problemi ətraflı izah edin..."
                placeholderTextColor={Colors.outlineVariant}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setDescFocused(true)}
                onBlur={() => setDescFocused(false)}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* File upload */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fayl əlavə et</Text>
            <TouchableOpacity style={styles.uploadZone} activeOpacity={0.85}>
              <View style={styles.uploadIconWrap}>
                <Ionicons name="cloud-upload-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.uploadTitle}>Şəkil və ya sənəd yüklə</Text>
              <Text style={styles.uploadSub}>PNG, JPG və ya PDF (Max. 5MB)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity activeOpacity={0.85} style={styles.submitWrap}>
          <LinearGradient colors={GRADIENT} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.submitText}>Göndər</Text>
            <Ionicons name="send-outline" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 24, gap: 24, paddingBottom: 48 },

  intro: { gap: 6 },
  introTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  introSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  form: { gap: 20 },
  field: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginLeft: 4 },

  selectRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, height: 56, paddingHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 20, elevation: 1,
  },
  selectText: { fontSize: 15, color: Colors.textPrimary },
  selectPlaceholder: { color: Colors.outlineVariant },

  dropdown: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 4,
  },
  dropdownOption: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  dropdownOptionActive: { backgroundColor: Colors.primaryLight },
  dropdownOptionText: { fontSize: 15, color: Colors.textPrimary },
  dropdownOptionTextActive: { color: Colors.primary, fontWeight: '700' },

  inputBox: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, height: 56,
    paddingHorizontal: 20, justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 20, elevation: 1,
  },
  inputBoxFocused: { borderColor: Colors.primaryFixed + '50', backgroundColor: '#fff' },
  inputText: { fontSize: 15, color: Colors.textPrimary },

  textareaBox: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: 'transparent', minHeight: 120,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 20, elevation: 1,
  },
  textareaInput: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },

  uploadZone: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.surfaceHighest,
    borderRadius: 16, backgroundColor: Colors.surfaceLow,
    paddingVertical: 32, alignItems: 'center', gap: 8,
  },
  uploadIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight + '33', alignItems: 'center', justifyContent: 'center',
  },
  uploadTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  uploadSub: { fontSize: 12, color: Colors.outlineVariant },

  submitWrap: { borderRadius: 999, overflow: 'hidden' },
  submitBtn: {
    height: 56, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 4,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
