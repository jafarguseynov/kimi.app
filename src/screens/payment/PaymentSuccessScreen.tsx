import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödəniş Təsdiqi</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <View style={styles.heroSection}>
          <View style={styles.aura} />
          <View style={styles.successOuter}>
            <View style={styles.successInner}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.tertiary} />
            </View>
          </View>
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Ödəniş uğurludur 🎉</Text>
          <Text style={styles.sub}>
            Təbriklər! Ödənişiniz uğurla tamamlandı. Kurs materialları artıq profilinizdə əlçatandır.
          </Text>
        </View>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptTop}>
            <View>
              <Text style={styles.receiptMeta}>Məbləğ</Text>
              <Text style={styles.receiptAmount}>49.99 AZN</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.receiptMeta}>Tarix</Text>
              <Text style={styles.receiptDate}>12 Oktyabr, 2023</Text>
            </View>
          </View>
          <View style={styles.receiptGrid}>
            <View style={styles.receiptGridItem}>
              <Text style={styles.receiptGridLabel}>METOD</Text>
              <View style={styles.receiptGridValue}>
                <Ionicons name="card-outline" size={14} color={Colors.primary} />
                <Text style={styles.receiptGridText}>**** 4242</Text>
              </View>
            </View>
            <View style={styles.receiptGridItem}>
              <Text style={styles.receiptGridLabel}>STATUS</Text>
              <View style={styles.receiptGridValue}>
                <View style={styles.statusDot} />
                <Text style={styles.receiptGridText}>Təsdiqləndi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTAs */}
        <View style={{ width: '100%', gap: 4 }}>
          <TouchableOpacity onPress={() => navigation.navigate(Routes.HomeMain)} activeOpacity={0.9}>
            <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.primaryBtnText}>Davam et</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>Qəbzi yüklə</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 56,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },

  heroSection: { alignItems: 'center', justifyContent: 'center', width: 200, height: 200 },
  aura: {
    position: 'absolute', width: 256, height: 256, borderRadius: 128,
    backgroundColor: Colors.tertiaryContainer + '33',
  },
  successOuter: {
    width: 128, height: 128, borderRadius: 64, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.tertiary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 50, elevation: 6,
  },
  successInner: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.tertiaryContainer + '4D',
    alignItems: 'center', justifyContent: 'center',
  },

  textSection: { alignItems: 'center', gap: 12, maxWidth: 340 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  sub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  receiptCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 28, gap: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  receiptTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceHigh, paddingBottom: 16,
  },
  receiptMeta: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  receiptAmount: { fontSize: 24, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  receiptDate: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  receiptGrid: { flexDirection: 'row', gap: 12 },
  receiptGridItem: {
    flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 16, gap: 10,
  },
  receiptGridLabel: {
    fontSize: 9, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  receiptGridValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  receiptGridText: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.tertiary },

  primaryBtn: {
    width: '100%', height: 58, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    width: '100%', height: 52, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
