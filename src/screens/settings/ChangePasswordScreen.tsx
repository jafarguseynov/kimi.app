import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { ProfileStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { changePassword } from '../../api/auth.api';
import { useTranslation } from '../../i18n';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, typeof Routes.ChangePassword>;
};

export default function ChangePasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => changePassword({ currentPassword: current, newPassword: newPass }),
    onSuccess: () => navigation.navigate(Routes.PasswordChanged),
    onError: (e: any) => Alert.alert(t('changePassword.errorTitle'), e?.response?.data?.message || t('changePassword.changeFailed')),
  });

  const onSubmit = () => {
    if (!current) return Alert.alert(t('changePassword.currentTitle'), t('changePassword.currentMsg'));
    if (newPass.length < 8) return Alert.alert(t('changePassword.newTitle'), t('changePassword.newMsg'));
    if (newPass !== confirm) return Alert.alert(t('changePassword.confirmTitle'), t('changePassword.confirmMsg'));
    mutate();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('changePassword.headerTitle')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Security card */}
          <View style={styles.securityCard}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.keyIconBox}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Ionicons name="key" size={30} color="#fff" />
            </LinearGradient>
            <View style={styles.securityText}>
              <Text style={styles.securityTitle}>{t('changePassword.securityTitle')}</Text>
              <Text style={styles.securitySub}>
                {t('changePassword.securitySub')}
              </Text>
            </View>
          </View>

          {/* Form card */}
          <View style={styles.formCard}>
            {/* Current password */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('changePassword.currentLabel')}</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={current}
                  onChangeText={setCurrent}
                  placeholder={t('changePassword.currentPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showCurrent}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrent(!showCurrent)} hitSlop={8}>
                  <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* New password */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('changePassword.newLabel')}</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={newPass}
                  onChangeText={setNewPass}
                  placeholder={t('changePassword.newPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showNew}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(!showNew)} hitSlop={8}>
                  <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.strengthBar}>
                <View style={[styles.strengthSeg, { backgroundColor: Colors.primary + '50' }]} />
                <View style={[styles.strengthSeg, { backgroundColor: Colors.surfaceHigh }]} />
                <View style={[styles.strengthSeg, { backgroundColor: Colors.surfaceHigh }]} />
              </View>
            </View>

            {/* Confirm password */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('changePassword.confirmLabel')}</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder={t('changePassword.confirmPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)} hitSlop={8}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.85} onPress={onSubmit} disabled={isPending}>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.submitBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{t('changePassword.submit')}</Text>}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelBtnText}>{t('changePassword.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footerNote}>
            {t('changePassword.footerNote')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 20, gap: 20, paddingBottom: 40 },

  securityCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20,
    padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  keyIconBox: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  securityText: { flex: 1, gap: 4 },
  securityTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  securitySub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  formCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24, gap: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },

  fieldBlock: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginLeft: 2 },

  inputWrap: { position: 'relative', justifyContent: 'center' },
  input: {
    backgroundColor: Colors.surfaceLow, borderRadius: 16,
    paddingHorizontal: 16, paddingRight: 52, paddingVertical: 14,
    fontSize: 15, fontWeight: '500', color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  eyeBtn: { position: 'absolute', right: 14 },

  strengthBar: { flexDirection: 'row', gap: 4 },
  strengthSeg: { flex: 1, height: 4, borderRadius: 2 },

  actions: { gap: 12, paddingTop: 8 },
  submitBtn: {
    borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  submitBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  cancelBtn: {
    borderRadius: 999, paddingVertical: 16,
    backgroundColor: Colors.surfaceHigh, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },

  footerNote: {
    fontSize: 12, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 18, paddingHorizontal: 16,
  },
});
