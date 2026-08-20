import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from '../../i18n';
import { tierOfCertificate } from '../../utils/certificateTier';
import type { Certificate } from '../../api/certificate.api';

/**
 * Səviyyə nişanı — köhnə böyük sarı ulduzun əvəzi.
 *
 * Səviyyə serverdən gəlir (admin astanaları), emoji deyil vektor ikon işlədilir
 * ki, sertifikat çap/paylaşım zamanı da peşəkar görünsün.
 */
type Props = { cert: Pick<Certificate, 'percentage' | 'tier'>; size?: 'lg' | 'sm' };

export default function CertificateBadge({ cert, size = 'lg' }: Props) {
  const { t } = useTranslation();
  const tier = tierOfCertificate(cert);
  const lg = size === 'lg';

  return (
    <View style={[styles.wrap, lg ? styles.wrapLg : styles.wrapSm, { borderColor: tier.color + '55' }]}>
      <View style={[styles.iconRing, lg ? styles.ringLg : styles.ringSm, { backgroundColor: tier.color + '14' }]}>
        <Ionicons name={tier.icon} size={lg ? 26 : 15} color={tier.color} />
      </View>
      <Text style={[styles.label, lg ? styles.labelLg : styles.labelSm, { color: tier.color }]}>
        {t(tier.labelKey)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'center', borderRadius: 999, borderWidth: 1,
    backgroundColor: '#fff',
  },
  wrapLg: { gap: 10, paddingLeft: 8, paddingRight: 18, paddingVertical: 8 },
  wrapSm: { gap: 6, paddingLeft: 5, paddingRight: 11, paddingVertical: 4 },
  iconRing: { alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  ringLg: { width: 44, height: 44 },
  ringSm: { width: 24, height: 24 },
  label: { fontWeight: '900', textTransform: 'uppercase' },
  labelLg: { fontSize: 13, letterSpacing: 1.6 },
  labelSm: { fontSize: 10, letterSpacing: 0.8 },
});
