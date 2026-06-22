import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, typeof Routes.LogoutConfirm>;
};

export default function LogoutConfirmScreen({ navigation }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        {/* Mascot icon */}
        <View style={styles.mascotBox}>
          <Ionicons name="hardware-chip-outline" size={56} color={Colors.primary} />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>{t('logoutConfirm.title')}</Text>
          <Text style={styles.subtitle}>
            {t('logoutConfirm.subtitle')}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={{ width: '100%' }}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.ProfileHome)}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.logoutBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.logoutBtnText}>{t('logoutConfirm.logout')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>{t('logoutConfirm.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 24, padding: 32,
    width: '100%', maxWidth: 360,
    alignItems: 'center', gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 10,
  },
  mascotBox: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  textBlock: { alignItems: 'center', gap: 8, maxWidth: 280 },
  title: {
    fontSize: 20, fontWeight: '700', color: Colors.textPrimary,
    textAlign: 'center', lineHeight: 28,
  },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },
  actions: { width: '100%', gap: 12, paddingTop: 4 },
  logoutBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  logoutBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cancelBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
