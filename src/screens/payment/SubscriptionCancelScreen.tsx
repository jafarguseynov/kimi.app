import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const LOSING: { icon: IconName; key: string }[] = [
  { icon: 'sparkles',     key: 'pay.losingAi' },
  { icon: 'infinite',     key: 'pay.losingExams' },
  { icon: 'analytics',    key: 'pay.losingAnalytics' },
];

export default function SubscriptionCancelScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();

  const confirmCancel = () => {
    Alert.alert(
      t('pay.cancelAlertTitle'),
      t('pay.cancelAlertMsg'),
      [
        { text: t('pay.cancel'), style: 'cancel' },
        {
          text: t('pay.stop'),
          style: 'destructive',
          onPress: () => {
            // TODO: call /subscription/cancel endpoint
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.subSettings')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mascot block */}
        <View style={styles.mascotBlock}>
          <View style={styles.mascotAura} pointerEvents="none" />
          <View style={styles.mascotCard}>
            <Ionicons name="sad" size={84} color={Colors.primary} />
          </View>
          <View style={styles.questionBadge}>
            <Text style={styles.questionBadgeText}>{t('pay.cancelQuestion')}</Text>
          </View>
        </View>

        {/* Title + sub */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{t('pay.cancelTitle')}</Text>
          <Text style={styles.sub}>
            {t('pay.cancelSubPre')}
            <Text style={styles.subBold}>{t('pay.cancelSubBold')}</Text>{t('pay.cancelSubPost')}
          </Text>
        </View>

        {/* Losing card */}
        <View style={styles.losingCard}>
          <Text style={styles.losingTitle}>{t('pay.losingTitle')}</Text>
          <View style={{ gap: 10 }}>
            {LOSING.map((l) => (
              <View key={l.key} style={styles.losingRow}>
                <Ionicons name={l.icon} size={20} color={Colors.primary} />
                <Text style={styles.losingText}>{t(l.key)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 12, marginTop: 8 }}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.goBack()}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t('pay.goBack')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerBtn} activeOpacity={0.85} onPress={confirmCancel}>
            <Text style={styles.dangerBtnText}>{t('pay.cancelAlertTitle')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          {t('pay.cancelDisclaimer')}
        </Text>
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 24, paddingTop: 16, gap: 24, paddingBottom: 48 },

  /* Mascot */
  mascotBlock: { alignSelf: 'center', position: 'relative', width: 192, height: 192, alignItems: 'center', justifyContent: 'center' },
  mascotAura: {
    position: 'absolute', top: -12, right: -12,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primary + '14',
  },
  mascotCard: {
    width: 176, height: 176, borderRadius: 28,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.06, shadowRadius: 30, elevation: 4,
  },
  questionBadge: {
    position: 'absolute', bottom: -8, right: -8,
    backgroundColor: Colors.errorContainer ?? '#fb5151',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    borderWidth: 4, borderColor: Colors.background,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  questionBadgeText: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },

  /* Text */
  textBlock: { alignItems: 'center', gap: 14, paddingHorizontal: 12 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.4, lineHeight: 28 },
  sub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  subBold: { fontWeight: '800', color: Colors.primary },

  /* Losing card */
  losingCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 22, padding: 22, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  losingTitle: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.4, textTransform: 'uppercase' },
  losingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLow, borderRadius: 14, padding: 14,
  },
  losingText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  /* Buttons */
  primaryBtn: {
    height: 54, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  dangerBtn: {
    height: 54, borderRadius: 999,
    backgroundColor: Colors.danger + '14',
    alignItems: 'center', justifyContent: 'center',
  },
  dangerBtnText: { fontSize: 14, fontWeight: '800', color: Colors.danger },

  disclaimer: {
    fontSize: 11, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 16, fontWeight: '500',
    paddingHorizontal: 32, marginTop: 4,
  },
});
