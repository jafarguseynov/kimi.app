import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const ERROR_GRADIENT: [string, string] = ['#b31b25', '#fb5151'];

export default function PaymentFailedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="close" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.statusHeader')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Error Visual */}
        <View style={styles.errorVisualWrap}>
          <View style={styles.errorAura} pointerEvents="none" />
          <LinearGradient
            colors={ERROR_GRADIENT}
            style={styles.errorCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Ionicons name="alert-circle" size={60} color="#fff" />
          </LinearGradient>
          {/* Sad mascot peek */}
          <View style={styles.mascotPeek}>
            <View style={styles.mascotInner}>
              <Ionicons name="sad-outline" size={22} color={Colors.primary} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>{t('pay.paymentFailed')}</Text>
        <Text style={styles.sub}>
          {t('pay.paymentFailedSub')}
        </Text>

        {/* Reason card */}
        <View style={styles.reasonCard}>
          <View style={styles.reasonIconBox}>
            <Ionicons name="card" size={22} color={Colors.danger} />
          </View>
          <View style={styles.reasonInfo}>
            <Text style={styles.reasonTitle}>{t('pay.possibleReason')}</Text>
            <Text style={styles.reasonSub}>{t('pay.reasonSub')}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate(Routes.CardPayment)} activeOpacity={0.9} style={{ width: '100%' }}>
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>{t('pay.retry')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate(Routes.PaymentMethod)}
          activeOpacity={0.85}
        >
          <Ionicons name="wallet-outline" size={18} color={Colors.textPrimary} />
          <Text style={styles.secondaryBtnText}>{t('pay.chooseOther')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportLink} activeOpacity={0.7}>
          <Text style={styles.supportText}>{t('pay.contactSupport')}</Text>
          <Ionicons name="open-outline" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 24, gap: 20, paddingBottom: 48, alignItems: 'center' },

  errorVisualWrap: { alignItems: 'center', paddingVertical: 20, position: 'relative' },
  errorAura: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: Colors.danger + '14',
    top: 0,
  },
  errorCard: {
    width: 128, height: 128, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '3deg' }],
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.22, shadowRadius: 30, elevation: 6,
  },
  mascotPeek: {
    position: 'absolute',
    top: 4, right: '24%',
    width: 56, height: 56, borderRadius: 28,
    transform: [{ rotate: '-12deg' }],
    backgroundColor: '#fff',
    borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  mascotInner: {
    width: '100%', height: '100%', borderRadius: 28,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },

  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', lineHeight: 36 },
  sub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  reasonCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
  },
  reasonIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.danger + '18',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  reasonInfo: { flex: 1 },
  reasonTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  reasonSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  primaryBtn: {
    width: '100%', height: 58, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    width: '100%', height: 58, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.surfaceHigh,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  supportLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  supportText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
});
