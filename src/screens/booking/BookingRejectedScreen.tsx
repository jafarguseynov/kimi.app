import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function BookingRejectedScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nəticə</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mascot section */}
        <View style={styles.mascotSection}>
          <View style={styles.mascotAura} pointerEvents="none" />
          <View style={styles.mascotWrap}>
            <Ionicons name="hardware-chip-outline" size={112} color={Colors.primary + '66'} />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Bu dəfə seçilmədin 😔</Text>
          <Text style={styles.subtitle}>Qismət növbəti suala!</Text>
        </View>

        {/* Encouragement Card */}
        <View style={styles.encourageCard}>
          <View style={styles.encourageIconWrap}>
            <View style={styles.encourageIconBox}>
              <Ionicons name="flash" size={22} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.encourageTitle}>
            Daha tez və keyfiyyətli cavab verərək qazan!
          </Text>
          <View style={styles.encourageHintRow}>
            <Ionicons name="trending-up-outline" size={14} color={Colors.primary} />
            <Text style={styles.encourageHint}>Növbəti şansını qaçırma</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.goBack()}
          >
            <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.primaryBtnText}>Başqa suallara bax</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('HomeMain' as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Ana səhifəyə qayıt</Text>
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
    paddingHorizontal: 24, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: {
    paddingHorizontal: 24, paddingTop: 40, paddingBottom: 48,
    alignItems: 'center', gap: 28,
  },

  mascotSection: {
    width: 224, height: 224,
    alignItems: 'center', justifyContent: 'center',
  },
  mascotAura: {
    position: 'absolute', width: 224, height: 224, borderRadius: 112,
    backgroundColor: Colors.primary + '0D',
  },
  mascotWrap: { alignItems: 'center', justifyContent: 'center' },

  titleSection: { alignItems: 'center', gap: 8 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },

  encourageCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 28, gap: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 1,
    overflow: 'hidden',
  },
  encourageIconWrap: {},
  encourageIconBox: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  encourageTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, lineHeight: 28 },
  encourageHintRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  encourageHint: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  actions: { width: '100%', gap: 12 },
  primaryBtn: {
    width: '100%', height: 58, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    width: '100%', height: 58, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  secondaryBtnText: { fontSize: 17, fontWeight: '600', color: Colors.textSecondary },
});
