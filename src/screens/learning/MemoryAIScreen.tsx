import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function MemoryAIScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bulb-outline" size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Memory AI</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={20} color={Colors.primary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconWrap}>
            <View style={styles.heroAura} />
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.heroIconCircle}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Ionicons name="hardware-chip-outline" size={64} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.heroLabel}>KİMİ ROBOT ANALİZİ</Text>
          <Text style={styles.heroTitle}>Öyrənmə Strategiyanız</Text>
        </View>

        {/* Main Analysis Card */}
        <View style={styles.analysisCard}>
          <View style={styles.analysisCardAura} />
          <View style={styles.analysisCardTop}>
            <View>
              <Text style={styles.analysisCardTitle}>Yaddaş Analizi</Text>
              <Text style={styles.analysisCardSub}>Bu mövzunu unutmaq üzrəsən</Text>
            </View>
            <Ionicons name="warning" size={36} color={Colors.errorContainer} />
          </View>

          {/* Subject Detail */}
          <View style={styles.subjectBox}>
            <View style={styles.subjectBoxTop}>
              <View style={styles.subjectLeft}>
                <View style={styles.subjectIconCircle}>
                  <Ionicons name="calculator-outline" size={24} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.subjectMeta}>Mövzu</Text>
                  <Text style={styles.subjectName}>Riyaziyyat: Kəsrlər</Text>
                </View>
              </View>
              <View style={styles.subjectRight}>
                <Text style={styles.retentionMeta}>Yadda saxlanma</Text>
                <Text style={styles.retentionValue}>20%</Text>
              </View>
            </View>
            <View style={styles.retentionBar}>
              <View style={styles.retentionFill} />
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.ctaBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name="refresh" size={22} color="#fff" />
              <Text style={styles.ctaBtnText}>Təkrar et</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Niyə təkrar etməliyəm?</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: Colors.primary + '1A' }]}>
                <Ionicons name="flash-outline" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.benefitCardTitle}>Effektiv öyrənmə</Text>
              <Text style={styles.benefitCardSub}>Aralıqlı təkrar metodu ilə məlumatı uzunmüddətli yaddaşa köçürürsən.</Text>
            </View>
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: Colors.tertiary + '1A' }]}>
                <Ionicons name="trending-up-outline" size={22} color={Colors.tertiary} />
              </View>
              <Text style={styles.benefitCardTitle}>Zaman qənaəti</Text>
              <Text style={styles.benefitCardSub}>Yalnız unutmaq üzrə olduğun mövzuları təkrar edərək vaxtına qənaət et.</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 56,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryFixed + '33',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },

  scroll: { padding: 24, gap: 24 },

  heroSection: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  heroIconWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroAura: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '1A',
  },
  heroIconCircle: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.primary,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },

  analysisCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 24, padding: 24, gap: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06, shadowRadius: 32, elevation: 3,
  },
  analysisCardAura: {
    position: 'absolute', top: -30, right: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.primary + '0A',
  },
  analysisCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  analysisCardTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  analysisCardSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },

  subjectBox: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16, padding: 20, gap: 12,
  },
  subjectBoxTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subjectLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subjectIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  subjectMeta: { fontSize: 11, color: Colors.textSecondary },
  subjectName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  subjectRight: { alignItems: 'flex-end' },
  retentionMeta: { fontSize: 11, color: Colors.textSecondary },
  retentionValue: { fontSize: 16, fontWeight: '800', color: Colors.error },
  retentionBar: { height: 10, backgroundColor: Colors.surfaceHigh, borderRadius: 5, overflow: 'hidden' },
  retentionFill: { width: '20%', height: 10, backgroundColor: Colors.error, borderRadius: 5 },

  ctaBtn: {
    borderRadius: 999, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  benefitsSection: { gap: 16 },
  benefitsTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  benefitsGrid: { gap: 12 },
  benefitCard: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
  },
  benefitIcon: {
    width: 44, height: 44, borderRadius: 22, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  benefitCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  benefitCardSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, flex: 1 },
});
