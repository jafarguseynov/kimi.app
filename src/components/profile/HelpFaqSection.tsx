import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

/**
 * TEZ-TEZ VERİLƏN SUALLAR — profil ekranında yalnız bir sətir.
 *
 * Suallar burada açıq göstərilmir; sətrə toxunanda tam FAQ ekranı açılır
 * (axtarış + rola görə bölmələr + açılan cavablar) → `HelpCenter`.
 */
export default function HelpFaqSection() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.75}
        onPress={() => navigation.navigate(Routes.HelpCenter)}
      >
        <View style={styles.iconBox}>
          <Ionicons name="help-buoy-outline" size={20} color={Colors.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{t('profileScreen.faqTitle')}</Text>
          <Text style={styles.sub} numberOfLines={1}>{t('profileScreen.faqSub')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 1,
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 13,
    backgroundColor: Colors.primaryLight + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});
