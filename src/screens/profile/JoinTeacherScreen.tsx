import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { joinTeacher } from '../../api/collaboration.api';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const BENEFITS = [
  { icon: 'gift' as const, textKey: 'joinTeacher.benefit1' },
  { icon: 'school' as const, textKey: 'joinTeacher.benefit2' },
  { icon: 'trending-up' as const, textKey: 'joinTeacher.benefit3' },
];

export default function JoinTeacherScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => joinTeacher(code.trim()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (data.alreadyMember) {
        Alert.alert(t('joinTeacher.alreadyTitle'), t('joinTeacher.alreadyBody', { name: data.teacherName }), [
          { text: t('joinTeacher.ok'), onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert(
          t('joinTeacher.successTitle'),
          t('joinTeacher.successBody', { name: data.teacherName, days: data.premiumDays ?? 7 }),
          [{ text: t('joinTeacher.great'), onPress: () => navigation.goBack() }],
        );
      }
    },
    onError: (err: any) => {
      Alert.alert(t('joinTeacher.errorTitle'), err?.response?.data?.message ?? t('joinTeacher.errorBody'));
    },
  });

  const onJoin = () => {
    if (!code.trim()) return Alert.alert(t('joinTeacher.codeTitle'), t('joinTeacher.codeEmpty'));
    if (isPending) return;
    mutate();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('joinTeacher.headerTitle')}</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.iconBox}>
            <Ionicons name="people" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{t('joinTeacher.title')}</Text>
          <Text style={styles.subtitle}>
            {t('joinTeacher.subtitle')}
          </Text>

          <View style={styles.benefits}>
            {BENEFITS.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <View style={styles.benefitIcon}><Ionicons name={b.icon} size={16} color={Colors.primary} /></View>
                <Text style={styles.benefitText}>{t(b.textKey)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.label}>{t('joinTeacher.label')}</Text>
          <TextInput
            style={[styles.input, focused && styles.inputFocused]}
            value={code}
            onChangeText={(val) => setCode(val.toUpperCase())}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t('joinTeacher.placeholder')}
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity activeOpacity={0.9} onPress={onJoin} disabled={isPending} style={{ marginTop: 20 }}>
            <LinearGradient colors={GRADIENT} style={styles.joinBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {isPending ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.joinBtnText}>{t('joinTeacher.join')}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 24, gap: 14 },
  iconBox: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 8,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, maxWidth: 320, alignSelf: 'center' },

  benefits: { gap: 10, marginTop: 8, marginBottom: 8 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },

  label: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginTop: 8, marginLeft: 2 },
  input: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 16,
    fontSize: 18, fontWeight: '800', letterSpacing: 2, color: Colors.textPrimary,
    borderWidth: 2, borderColor: Colors.borderLight, textAlign: 'center',
  },
  inputFocused: { borderColor: Colors.primary },
  joinBtn: {
    height: 56, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  joinBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
