import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, typeof Routes.DeactivateReason>;
};

type Reason = { id: string; labelKey: string; icon: React.ComponentProps<typeof Ionicons>['name']; iconColor: string; iconBg: string };

const REASONS: Reason[] = [
  {
    id: 'temp',
    labelKey: 'deactivateReason.reasonTemp',
    icon: 'time-outline',
    iconColor: Colors.primary,
    iconBg: Colors.primaryFixed + '33',
  },
  {
    id: 'other_platform',
    labelKey: 'deactivateReason.reasonOtherPlatform',
    icon: 'swap-horizontal-outline',
    iconColor: Colors.secondary,
    iconBg: Colors.secondaryContainer + '4D',
  },
  {
    id: 'notif',
    labelKey: 'deactivateReason.reasonNotif',
    icon: 'notifications-off-outline',
    iconColor: Colors.tertiary,
    iconBg: Colors.tertiaryContainer + '4D',
  },
  {
    id: 'other',
    labelKey: 'deactivateReason.reasonOther',
    icon: 'ellipsis-horizontal',
    iconColor: Colors.textSecondary,
    iconBg: Colors.surfaceHigh,
  },
];

export default function DeactivateReasonScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('temp');
  const [notes, setNotes] = useState('');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('deactivateReason.headerTitle')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>{t('deactivateReason.pageTitle')}</Text>
            <Text style={styles.pageSub}>{t('deactivateReason.pageSub')}</Text>
          </View>

          <View style={styles.grid}>
            {REASONS.map(r => (
              <TouchableOpacity
                key={r.id}
                style={[styles.reasonCard, selected === r.id && styles.reasonCardSelected]}
                activeOpacity={0.8}
                onPress={() => setSelected(r.id)}
              >
                {selected === r.id && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  </View>
                )}
                <View style={[styles.reasonIconBox, { backgroundColor: r.iconBg }]}>
                  <Ionicons name={r.icon} size={24} color={r.iconColor} />
                </View>
                <Text style={styles.reasonLabel}>{t(r.labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>{t('deactivateReason.notesLabel')}</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('deactivateReason.notesPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={{ width: '100%' }}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.AccountDeactivated)}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.ctaBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaBtnText}>{t('deactivateReason.continue')}</Text>
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
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 20, gap: 20, paddingBottom: 48 },

  titleBlock: { gap: 6 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  pageSub: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  reasonCard: {
    width: '47.5%',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, padding: 20, gap: 12,
    borderWidth: 2, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  reasonCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFixed + '0D',
  },
  checkBadge: { position: 'absolute', top: 10, right: 10 },
  reasonIconBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  reasonLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, lineHeight: 18 },

  notesBlock: { gap: 8 },
  notesLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginLeft: 4 },
  notesInput: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    padding: 16, minHeight: 100,
    fontSize: 14, color: Colors.textPrimary, lineHeight: 22,
    borderWidth: 1, borderColor: Colors.borderLight,
  },

  ctaBtn: {
    borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
