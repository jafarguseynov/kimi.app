import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamPurchaseSuccess>;
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function ExamPurchaseSuccessScreen({ route, navigation }: Props) {
  const { examId, title = 'İmtahan', subject = 'Magistratura', questions = 50, successRate = 85 } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.popToTop()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Təhsil</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success hero */}
        <View style={styles.hero}>
          <View style={styles.checkOuter}>
            <View style={styles.checkInner}>
              <Ionicons name="checkmark" size={42} color="#fff" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Uğurla alındı 🎉</Text>
          <Text style={styles.heroSub}>İmtahana indi başlaya bilərsən</Text>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryGlow} pointerEvents="none" />
          <View style={styles.summaryTop}>
            <View style={{ flex: 1 }}>
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.tertiary} />
                <Text style={styles.verifiedText}>Alındı</Text>
              </View>
              <Text style={styles.summaryTitle}>{title}</Text>
            </View>
            <View style={styles.summaryIconBox}>
              <Ionicons name="school" size={22} color={Colors.primary} />
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.gridLabel}>Kateqoriya</Text>
              <Text style={styles.gridValue}>{subject}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.gridLabel}>Sual sayı</Text>
              <Text style={styles.gridValue}>{questions} Sual</Text>
            </View>
          </View>
        </View>

        {/* Kimi tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipAvatar}>
            <Text style={{ fontSize: 22 }}>🤖</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipKicker}>Kimi Köməkçi</Text>
            <Text style={styles.tipText}>"Bu imtahan üzrə uğur göstəricisi {successRate}% təşkil edir. Uğurlar!"</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 16 }}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.replace(Routes.ExamInfo, { examId, title })}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Başla</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.secondaryBtn} onPress={() => navigation.popToTop()}>
            <Text style={styles.secondaryBtnText}>İmtahanlara bax</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  hero: { alignItems: 'center', marginTop: 16 },
  checkOuter: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.tertiary + '22',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.08, shadowRadius: 40, elevation: 4,
  },
  checkInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.tertiary,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 8 },
  heroSub: { fontSize: 16, color: Colors.textSecondary },

  summaryCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24,
    overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.08, shadowRadius: 40, elevation: 3,
  },
  summaryGlow: {
    position: 'absolute', top: -48, right: -48,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primary + '14',
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, zIndex: 1 },
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.tertiary + '1A',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: Colors.tertiary },
  summaryTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, lineHeight: 26 },
  summaryIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  summaryGrid: { flexDirection: 'row', gap: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  gridLabel: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
  gridValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surfaceLow, padding: 16, borderRadius: 16,
  },
  tipAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary + '33',
  },
  tipKicker: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  tipText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', lineHeight: 18 },

  primaryBtn: {
    paddingVertical: 18, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  secondaryBtn: { paddingVertical: 18, borderRadius: 999, alignItems: 'center', backgroundColor: Colors.surfaceHigh },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});
