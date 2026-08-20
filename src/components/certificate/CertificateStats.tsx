import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { tierOfCertificate } from '../../utils/certificateTier';
import type { Certificate } from '../../api/certificate.api';

/**
 * Nailiyyət statistikası — HAMISI real sertifikat siyahısından hesablanır.
 *
 * Heç bir sabit rəqəm yoxdur: sertifikat yoxdursa kart da yoxdur, çempionluq
 * yoxdursa həmin kart göstərilmir (0 yazıb boş yer tutmur).
 */
type Props = { certs: Certificate[] };

type StatItem = { key: string; icon: keyof typeof Ionicons.glyphMap; value: string; label: string; color: string };

export default function CertificateStats({ certs }: Props) {
  const { t } = useTranslation();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();
  }, [fade]);

  if (certs.length === 0) return null;

  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = certs.filter((c) => new Date(c.issuedAt).getTime() > monthAgo).length;
  const best = Math.max(...certs.map((c) => c.percentage));
  const champions = certs.filter((c) => tierOfCertificate(c).key === 'champion').length;

  const items: StatItem[] = [
    { key: 'total', icon: 'ribbon', value: String(certs.length), label: t('cert.statTotal'), color: Colors.primary },
    { key: 'best', icon: 'trending-up', value: `${best}%`, label: t('cert.statBest'), color: Colors.tertiary },
  ];
  // Yalnız REAL dəyər olduqda göstər — "0 çempionluq" motivasiya vermir.
  if (recent > 0) {
    items.push({ key: 'recent', icon: 'flame', value: String(recent), label: t('cert.statRecent'), color: Colors.warning });
  }
  if (champions > 0) {
    items.push({ key: 'champ', icon: 'trophy', value: String(champions), label: t('cert.statChampion'), color: '#D4901F' });
  }

  const translate = fade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <Animated.View style={[styles.grid, { opacity: fade, transform: [{ translateY: translate }] }]}>
      {items.map((s) => (
        <View key={s.key} style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: s.color + '14' }]}>
            <Ionicons name={s.icon} size={15} color={s.color} />
          </View>
          <Text style={styles.value}>{s.value}</Text>
          <Text style={styles.label} numberOfLines={2}>{s.label}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    flexGrow: 1, flexBasis: '46%',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, padding: 14, gap: 4,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  iconBox: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  value: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.6 },
  label: { fontSize: 11.5, color: Colors.textSecondary, fontWeight: '600' },
});
