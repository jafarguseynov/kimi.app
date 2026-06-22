import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, typeof Routes.AccountDeactivated>;
};

export default function AccountDeactivatedScreen({ navigation }: Props) {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Check icon in gradient circle */}
        <View style={styles.iconOuter}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.iconInner}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark" size={48} color="#fff" />
          </LinearGradient>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>{t('accountDeactivated.title')}</Text>
          <Text style={styles.subtitle}>
            {t('accountDeactivated.subtitle')}
          </Text>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{t('accountDeactivated.infoTitle')}</Text>
            <Text style={styles.infoNote}>
              {t('accountDeactivated.infoNote')}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={{ width: '100%' }}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.ProfileHome)}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.ctaBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaBtnText}>{t('accountDeactivated.backToLogin')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(Routes.ProfileHome)}
        >
          <Text style={styles.closeBtnText}>{t('accountDeactivated.close')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceLowest },

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 40,
  },

  iconOuter: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  iconInner: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 8,
  },

  textBlock: { alignItems: 'center', gap: 12, maxWidth: 300 },
  title: {
    fontSize: 28, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.5, lineHeight: 36,
  },
  subtitle: {
    fontSize: 16, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },

  infoCard: {
    width: '100%', backgroundColor: Colors.surfaceLow,
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoIconBox: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  infoText: { flex: 1, gap: 4 },
  infoTitle: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  infoNote: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  footer: { padding: 24, paddingBottom: 32, gap: 12 },
  ctaBtn: {
    borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  closeBtn: { borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  closeBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
