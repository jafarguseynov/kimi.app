import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { getWallet, withdraw } from '../../api/payment.api';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const MIN_AMOUNT = 5;

export default function WithdrawalScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [card, setCard] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [cardFocused, setCardFocused] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getWallet().then((w) => setBalance(w.balance)).catch(() => setBalance(0));
  }, []);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      Alert.alert(t('pay.errorTitle'), t('pay.errInvalidAmount'));
      return;
    }
    if (numAmount < MIN_AMOUNT) {
      Alert.alert(t('pay.errorTitle'), t('pay.errMinAmount', { n: MIN_AMOUNT }));
      return;
    }
    if (balance !== null && numAmount > balance) {
      Alert.alert(t('pay.errorTitle'), t('pay.errInsufficient'));
      return;
    }
    setSubmitting(true);
    try {
      await withdraw(numAmount, card || undefined);
      navigation.navigate(Routes.WithdrawalSuccess);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('pay.errWithdraw');
      Alert.alert(t('pay.errorTitle'), msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.withdrawHeader')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Balance hero */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>{t('pay.yourCurrentBalance')}</Text>
          <View style={styles.balanceRow}>
            {balance === null ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.balanceAmount}>{balance.toFixed(2)}</Text>
                <Text style={styles.balanceCurrency}>AZN</Text>
              </>
            )}
          </View>
          <Text style={styles.balanceSub}>{t('pay.withdrawSub')}</Text>
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          {/* Amount */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('pay.amount')}</Text>
            <View style={[styles.inputBox, amountFocused && styles.inputBoxFocused]}>
              <TextInput
                style={styles.textInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={Colors.surfaceHigh}
                keyboardType="decimal-pad"
                onFocus={() => setAmountFocused(true)}
                onBlur={() => setAmountFocused(false)}
              />
              <Text style={styles.currencyTag}>AZN</Text>
            </View>
            <View style={styles.hintRow}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.primary} />
              <Text style={styles.hintText}>{t('pay.minWithdraw', { n: MIN_AMOUNT })}</Text>
            </View>
          </View>

          {/* Card number (reference) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('pay.cardOptional')}</Text>
            <View style={[styles.inputBox, cardFocused && styles.inputBoxFocused]}>
              <TextInput
                style={styles.textInput}
                value={card}
                onChangeText={setCard}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={Colors.surfaceHigh}
                keyboardType="number-pad"
                maxLength={19}
                onFocus={() => setCardFocused(true)}
                onBlur={() => setCardFocused(false)}
              />
              <Ionicons name="card-outline" size={22} color={Colors.primary} />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity activeOpacity={0.9} onPress={handleSubmit} disabled={submitting}>
            <LinearGradient colors={GRADIENT} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>{t('pay.confirmWithdraw')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={Colors.tertiary} />
            <Text style={styles.securityText}>{t('pay.secure256')}</Text>
          </View>
        </View>

        {/* Info grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="time-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.infoCardLabel}>{t('pay.processingTime')}</Text>
            <Text style={styles.infoCardValue}>{t('pay.businessDays')}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="wallet-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.infoCardLabel}>{t('pay.commission')}</Text>
            <Text style={styles.infoCardValue}>{t('pay.noCommission')}</Text>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 24, paddingBottom: 40 },

  balanceSection: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  balanceLabel: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, minHeight: 52 },
  balanceAmount: { fontSize: 40, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 },
  balanceCurrency: { fontSize: 22, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  balanceSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },

  formCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24, gap: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },

  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 4 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.borderLight,
    paddingHorizontal: 20, height: 56,
  },
  inputBoxFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 1,
  },
  textInput: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  currencyTag: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 4 },
  hintText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },

  submitBtn: {
    height: 60, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  submitBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  securityText: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },

  infoGrid: { flexDirection: 'row', gap: 12 },
  infoCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  infoCardLabel: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  infoCardValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
});
