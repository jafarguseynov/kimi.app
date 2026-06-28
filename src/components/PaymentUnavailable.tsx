import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { useTranslation } from '../i18n';

/**
 * iOS-da (App Store 3.1.1) ödəniş/abunəlik ekranları açıldıqda göstərilən
 * yalnız-məlumat ekranı. Qiymət, satınalma düyməsi və ya xarici link YOXDUR.
 *
 * Ödəniş axınına aparan ekranlar iOS-da bu komponenti erkən qaytarır — beləcə
 * normal naviqasiya bağlı olsa belə (defense-in-depth) heç bir satınalma UI
 * görünmür.
 */
export default function PaymentUnavailable() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pay.premiumHeader')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconBox}>
          <Ionicons name="information-circle-outline" size={44} color={Colors.primary} />
        </View>
        <Text style={styles.title}>{t('pay.iosUnavailableTitle')}</Text>
        <Text style={styles.sub}>{t('pay.iosUnavailableBody')}</Text>

        <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>{t('pay.ok')}</Text>
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
    backgroundColor: 'rgba(248,250,252,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },

  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  iconBox: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  sub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  btn: {
    marginTop: 8, height: 50, borderRadius: 999, paddingHorizontal: 40,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
