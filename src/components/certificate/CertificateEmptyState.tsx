import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

/**
 * Sertifikatı olmayan şagird üçün boş vəziyyət.
 *
 * Boş ağ ekran əvəzinə tək bir aydın addım verir: ilk imtahanı seç. Backend
 * qaydası ilə uyğundur — hər tamamlanmış imtahan sertifikat yaradır, yəni
 * «ilk imtahan = ilk sertifikat» vədi realdır.
 */
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function CertificateEmptyState({ onBrowse }: { onBrowse: () => void }) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <View style={styles.iconBox}>
        <Ionicons name="ribbon-outline" size={40} color={Colors.primary} />
      </View>
      <Text style={styles.title}>{t('cert.emptyTitle')}</Text>
      <Text style={styles.sub}>{t('cert.emptySub')}</Text>
      <TouchableOpacity activeOpacity={0.9} onPress={onBrowse} style={{ width: '100%', maxWidth: 280 }}>
        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
          <Text style={styles.btnText}>{t('cert.emptyCta')}</Text>
          <Ionicons name="arrow-forward" size={17} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  iconBox: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: Colors.primary + '0F',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19, maxWidth: 260, marginBottom: 8 },
  btn: {
    height: 50, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 4,
  },
  btnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
