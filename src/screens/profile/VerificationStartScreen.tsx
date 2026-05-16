import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function VerificationStartScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verifikasiya</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroWrap}>
            <View style={styles.heroAura} />
            <LinearGradient colors={GRADIENT} style={styles.heroCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="shield-checkmark" size={80} color="#fff" />
            </LinearGradient>
            <View style={styles.sparkBadge}>
              <Ionicons name="sparkles" size={14} color="#fff" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Profilini təsdiqlə</Text>
          <Text style={styles.heroSubtitle}>
            Təcrübənizi rəsmiləşdirin və təhsil ekosistemində bir addım öndə olun.
          </Text>
        </View>

        {/* Benefit cards */}
        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <View style={styles.cardIconWrap}>
            <View style={styles.cardIconCircle}>
              <Ionicons name="shield-outline" size={22} color={Colors.primary} />
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Güvən qazan</Text>
            <Text style={styles.cardSub}>Təsdiqlənmiş profil şagirdlərin sizə olan etibarını artırır.</Text>
          </View>
        </View>

        <View style={[styles.card, { borderLeftWidth: 0 }]}>
          <View style={[styles.cardIconCircle, { backgroundColor: Colors.tertiary + '1A' }]}>
            <Ionicons name="trending-up" size={22} color={Colors.tertiary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Daha çox görünürlük</Text>
            <Text style={styles.cardSub}>Axtarış nəticələrində ön plana çıxın və daha çox dərs sorğusu alın.</Text>
          </View>
        </View>

        <View style={[styles.card, { borderLeftWidth: 0 }]}>
          <View style={[styles.cardIconCircle, { backgroundColor: Colors.primaryLight }]}>
            <Ionicons name="ribbon" size={22} color={Colors.primary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Premium nişan</Text>
            <Text style={styles.cardSub}>Profilinizdə xüsusi təsdiq nişanı ilə digərlərindən fərqlənin.</Text>
          </View>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>Verifikasiya prosesi adətən 24 saat ərzində tamamlanır.</Text>
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.VerificationDocuments)}>
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.primaryBtnText}>Təsdiqə başla</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 16, paddingBottom: 120 },

  heroSection: { alignItems: 'center', gap: 14, marginBottom: 8 },
  heroWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroAura: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primary + '10',
  },
  heroCircle: {
    width: 192, height: 192, borderRadius: 96,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.2, shadowRadius: 40, elevation: 4,
  },
  sparkBadge: {
    position: 'absolute', bottom: 8, right: 8,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.tertiary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.background,
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 30, elevation: 1,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  cardAccent: {},
  cardIconWrap: {},
  cardIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  infoBanner: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, paddingBottom: 32,
    backgroundColor: Colors.background,
  },
  primaryBtn: {
    height: 60, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
