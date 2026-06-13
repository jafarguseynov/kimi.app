import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { UserRole } from '../../types/auth.types';
import { useUpdateUser } from '../../hooks/useUser';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, typeof Routes.RoleSelect> };

type RoleOption = {
  role: UserRole;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
};

const ROLES: RoleOption[] = [
  { role: 'student', icon: 'school', title: 'Şagird', desc: 'İmtahan ver, AI ilə öyrən və müəllim tap.' },
  { role: 'teacher', icon: 'person', title: 'Müəllim', desc: 'Profil yarat, şagird tap və sorğulara qoşul.' },
  { role: 'parent', icon: 'people', title: 'Valideyn', desc: 'Övladının inkişafını izlə və müəllim tap.' },
];

export default function RoleSelectScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<UserRole | null>('student');
  const { mutate, isPending } = useUpdateUser();

  const onContinue = () => {
    if (!selected) return;
    mutate({ role: selected }, {
      onSuccess: () => navigation.navigate(Routes.ProfileSetup),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Kimi.az-da necə davam etmək istəyirsən?</Text>
          <Text style={styles.heroSub}>Öz rolunu seç və sənə uyğun təcrübə ilə davam et.</Text>
        </View>

        {/* Role cards */}
        <View style={styles.cards}>
          {ROLES.map((r) => {
            const active = selected === r.role;
            return (
              <TouchableOpacity
                key={r.role}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => setSelected(r.role)}
                activeOpacity={0.85}
              >
                <View style={[styles.iconBox, active && styles.iconBoxActive]}>
                  <Ionicons
                    name={r.icon}
                    size={28}
                    color={active ? Colors.primary : Colors.textMuted}
                  />
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>{r.title}</Text>
                  <Text style={styles.cardDesc}>{r.desc}</Text>
                </View>
                {active && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={{ width: '100%' }}
            activeOpacity={0.85}
            onPress={onContinue}
            disabled={!selected || isPending}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={[styles.continueBtn, (!selected || isPending) && { opacity: 0.6 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueBtnText}>
                {isPending ? 'Yüklənir...' : 'Davam et'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.footerNote}>Qərarınızı sonra ayarlardan dəyişə bilərsiniz.</Text>
        </View>
      </ScrollView>

      {/* Background glow */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowMidLeft} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: 24, paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandLogo: { width: 130, height: 46 },

  scroll: { padding: 24, gap: 28, paddingBottom: 40 },

  hero: { gap: 10, alignItems: 'center' },
  heroTitle: {
    fontSize: 26, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.5, lineHeight: 34,
  },
  heroSub: {
    fontSize: 14, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 20, maxWidth: 280,
  },

  cards: { gap: 14 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2,
  },
  cardActive: {
    borderColor: Colors.primary,
    shadowOpacity: 0.06,
  },
  iconBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBoxActive: { backgroundColor: Colors.primaryLight },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardTitleActive: { color: Colors.primary },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  checkBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  ctaSection: { gap: 16, alignItems: 'center' },
  continueBtn: {
    borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 6,
  },
  continueBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  footerNote: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', opacity: 0.7 },

  glowTopRight: {
    position: 'absolute', top: '-10%' as any, right: '-5%' as any,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primary + '14',
    zIndex: -1,
  },
  glowMidLeft: {
    position: 'absolute', top: '40%' as any, left: '-10%' as any,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: Colors.primaryFixed + '18',
    zIndex: -1,
  },
});
