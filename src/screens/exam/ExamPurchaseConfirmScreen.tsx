import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamPurchaseConfirm>;
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function ExamPurchaseConfirmScreen({ route, navigation }: Props) {
  const { examId, title, price, subject, questions } = route.params;
  const { t } = useTranslation();
  const balance = 20;

  const pulse = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ).start();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] });

  const confirm = () => {
    navigation.replace(Routes.ExamPurchaseSuccess, {
      examId, title: title ?? t('examPurchase.defaultExam'), subject, questions: questions ?? 50, successRate: 85,
    });
  };

  return (
    <SafeAreaView style={styles.backdrop} edges={[]}>
      <TouchableOpacity style={styles.dismiss} activeOpacity={1} onPress={() => navigation.goBack()} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.content}>
          <View style={styles.mascotWrap}>
            <Animated.View style={[styles.mascotAura, { transform: [{ scale }] }]} />
            <View style={styles.mascotCircle}>
              <Ionicons name="cash" size={40} color={Colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>{t('examPurchase.confirmTitle')}</Text>
          <Text style={styles.subtitle}>{t('examPurchase.confirmSub')}</Text>

          <View style={styles.txCard}>
            <View style={styles.txRow}>
              <Text style={styles.txLabel}>{t('examPurchase.price')}</Text>
              <Text style={styles.txValueBig}>{price.toFixed(2)} AZN</Text>
            </View>
            <View style={styles.txRow}>
              <Text style={styles.txLabel}>{t('examPurchase.balance')}</Text>
              <Text style={styles.txValue}>{balance} AZN</Text>
            </View>
            <View style={styles.txDivider} />
            <View style={styles.txHint}>
              <Ionicons name="information-circle" size={14} color={Colors.primary} />
              <Text style={styles.txHintText}>{t('examPurchase.deductNote')}</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.85} onPress={confirm} style={{ width: '100%' }}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t('examPurchase.buyAndStart')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>{t('examPurchase.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11,15,16,0.4)' },
  dismiss: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: Colors.surfaceLowest,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxWidth: 440, width: '100%', alignSelf: 'center',
    paddingBottom: 24,
  },
  handle: {
    width: 48, height: 5, borderRadius: 999, backgroundColor: Colors.surfaceHigh,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  content: { padding: 32, alignItems: 'center', gap: 8 },

  mascotWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  mascotAura: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.primary + '1F' },
  mascotCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + '14',
    alignItems: 'center', justifyContent: 'center',
  },

  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, paddingHorizontal: 12 },

  txCard: { width: '100%', backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 24, gap: 16, marginBottom: 24 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  txValueBig: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  txValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  txDivider: { height: 1, borderTopWidth: 1, borderTopColor: Colors.borderLight, borderStyle: 'dashed' as any, marginVertical: 4 },
  txHint: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  txHintText: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1.2 },

  primaryBtn: {
    paddingVertical: 16, borderRadius: 999, alignItems: 'center', width: '100%',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  cancelBtn: { paddingVertical: 16, borderRadius: 999, alignItems: 'center', width: '100%', backgroundColor: Colors.surfaceHigh, marginTop: 12 },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
