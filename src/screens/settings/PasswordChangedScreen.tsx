import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, typeof Routes.PasswordChanged>;
};

export default function PasswordChangedScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uğurlu əməliyyat</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Success icon */}
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Ionicons name="checkmark-circle" size={72} color={Colors.tertiary} />
          </View>
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>Şifrəniz uğurla dəyişdirildi</Text>
          <Text style={styles.subtitle}>
            Artıq yeni şifrənizlə daxil ola bilərsiniz. Təhlükəsizliyiniz bizim üçün önəmlidir.
          </Text>
        </View>

        {/* CTA section */}
        <View style={styles.cta}>
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
              <Text style={styles.ctaBtnText}>Profilə qayıt</Text>
              <Ionicons name="person" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Security tip */}
          <View style={styles.tipCard}>
            <View style={styles.tipIconBox}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
            </View>
            <View style={styles.tipText}>
              <Text style={styles.tipLabel}>TƏHLÜKƏSİZLİK TÖVSİYƏSİ</Text>
              <Text style={styles.tipNote}>
                Şifrənizi heç kimlə bölüşməyin və mütəmadi olaraq yeniləyin.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
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

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, gap: 40,
  },

  iconOuter: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.06, shadowRadius: 32, elevation: 3,
  },
  iconInner: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primary + '0D',
    alignItems: 'center', justifyContent: 'center',
  },

  textBlock: { alignItems: 'center', gap: 12, maxWidth: 320 },
  title: {
    fontSize: 26, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.5, lineHeight: 34,
  },
  subtitle: {
    fontSize: 15, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22, paddingHorizontal: 8,
  },

  cta: { width: '100%', gap: 20 },
  ctaBtn: {
    borderRadius: 999, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  tipCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  tipIconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
  },
  tipText: { flex: 1, gap: 4 },
  tipLabel: {
    fontSize: 9, fontWeight: '700', color: Colors.primary,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  tipNote: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});
