import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();

  const goHome = () => {
    const parent = navigation.getParent() as any;
    parent?.navigate(Routes.Home, { screen: Routes.HomeMain, initial: false });
  };

  const goSubscription = () => {
    navigation.navigate(Routes.Subscription);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.successHeader')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success hero */}
        <View style={styles.heroBlock}>
          <View style={styles.aura} pointerEvents="none" />
          <View style={styles.successCircle}>
            <Ionicons name="checkmark-circle" size={56} color={Colors.tertiary} />
          </View>
        </View>

        {/* Title + sub */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{t('pay.paymentSuccess')}</Text>
          <Text style={styles.sub}>
            {t('pay.paymentSuccessSub')}
          </Text>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('pay.plan')}</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>PREMIUM</Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('pay.status')}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{t('pay.active')}</Text>
            </View>
          </View>
        </View>

        {/* CTAs */}
        <View style={styles.actions}>
          <TouchableOpacity activeOpacity={0.9} onPress={goHome}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t('pay.backHome')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85} onPress={goSubscription}>
            <Ionicons name="receipt-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>{t('pay.viewSub')}</Text>
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
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40, gap: 24 },

  /* Success hero */
  heroBlock: {
    width: 160, height: 160,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  aura: {
    position: 'absolute',
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: Colors.tertiary + '14',
  },
  successCircle: {
    width: 104, height: 104, borderRadius: 52,
    backgroundColor: Colors.tertiaryContainer + 'AA',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 8, borderColor: '#fff',
    shadowColor: Colors.tertiary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6,
  },

  /* Text */
  textBlock: { alignItems: 'center', gap: 12, maxWidth: 320 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5, lineHeight: 32 },
  sub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, fontWeight: '500', maxWidth: 300 },

  /* Summary card */
  summaryCard: {
    width: '100%',
    backgroundColor: Colors.surfaceLowest, borderRadius: 22,
    padding: 22, gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.05, shadowRadius: 28, elevation: 2,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: -2 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  planBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999,
  },
  planBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1.4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.tertiary },
  statusText: { fontSize: 13, fontWeight: '700', color: Colors.tertiary },

  /* Actions */
  actions: { width: '100%', gap: 12 },
  primaryBtn: {
    height: 56, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 22, elevation: 4,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
  secondaryBtn: {
    height: 52, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
