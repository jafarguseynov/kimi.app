import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function VerificationPendingScreen() {
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
            <LinearGradient colors={[Colors.surfaceLow, Colors.surfaceHigh]} style={styles.heroBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="hardware-chip-outline" size={100} color={Colors.textMuted} />
            </LinearGradient>
          </View>

          {/* Status badge */}
          <View style={styles.statusBadge}>
            <Ionicons name="sync-outline" size={16} color={Colors.primary} />
            <Text style={styles.statusBadgeText}>Yoxlanılır</Text>
          </View>

          <Text style={styles.heroTitle}>Sənədləriniz yoxlanılır</Text>
          <Text style={styles.heroSubtitle}>
            Sənədləriniz süni intellekt və komandamız tərəfindən analiz edilir. Bu proses adətən 24 saat ərzində tamamlanır.
          </Text>
        </View>

        {/* Next steps card */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsDecorIcon}>
            <Ionicons name="checkmark-circle-outline" size={64} color={Colors.primary} style={{ opacity: 0.08 }} />
          </View>
          <View style={styles.stepsHeader}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.stepsTitle}>Növbəti mərhələlər</Text>
          </View>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepIconCircle}>
                <Ionicons name="search-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>Axtarışda görünmə</Text>
                <Text style={styles.stepSub}>
                  Profiliniz təsdiqləndikdən sonra dərhal axtarış nəticələrində ön sıralarda yer alacaq.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepIconCircle}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>Mavi nişan</Text>
                <Text style={styles.stepSub}>
                  Adınızın yanında "Təsdiqlənmiş profil" nişanı görünəcək və istifadəçi etibarı artacaq.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Əlavə məlumata ehtiyac olarsa, qeydiyyatdan keçdiyiniz e-poçt ünvanına bildiriş göndəriləcək.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('HomeMain' as never)}>
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.primaryBtnText}>Ana səhifəyə qayıt</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 24, gap: 20, paddingBottom: 120, alignItems: 'center' },

  heroSection: { alignItems: 'center', gap: 16, width: '100%' },
  heroWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroAura: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: Colors.primaryFixed + '12',
  },
  heroBox: {
    width: 240, height: 240, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  statusBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  heroTitle: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },

  stepsCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24, gap: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
    overflow: 'hidden', position: 'relative',
  },
  stepsDecorIcon: { position: 'absolute', top: 12, right: 16 },
  stepsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepsTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  stepsList: { gap: 20 },
  stepItem: { flexDirection: 'row', gap: 16 },
  stepIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepBody: { flex: 1, gap: 4 },
  stepTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  stepSub: { fontSize: 11, color: Colors.textSecondary, lineHeight: 17 },

  infoCard: {
    width: '100%', backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

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
