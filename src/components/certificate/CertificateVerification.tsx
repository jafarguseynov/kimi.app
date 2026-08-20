import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { certificateQrUrl } from '../../api/certificate.api';
import type { Certificate } from '../../api/certificate.api';

/**
 * Doğrulama bloku: Kimi.az təsdiqi + sertifikat nömrəsi + QR.
 *
 * QR şəkli SERVERDƏ yaradılır (`/api/sertifikat/:id/qr`) və burada sadəcə
 * <Image> kimi göstərilir — mobil tərəfdə QR kitabxanası yoxdur və onu əlavə
 * etmək yeni store build tələb edərdi. Beləcə funksiya OTA ilə çatır.
 *
 * QR oxunduqda ictimai yoxlama səhifəsi açılır: ad, imtahan, nəticə, tarix,
 * səviyyə və Kimi.az təsdiqi. Telefon/e-poçt kimi şəxsi məlumat orada YOXDUR.
 */
type Props = {
  cert: Pick<Certificate, 'id' | 'certificateNo'>;
  /** QR yalnız detal/paylaşım görünüşündə lazımdır. */
  showQr?: boolean;
};

export default function CertificateVerification({ cert, showQr = true }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      {showQr && (
        <Image
          source={{ uri: certificateQrUrl(cert.id) }}
          style={styles.qr}
          resizeMode="contain"
          accessibilityLabel={t('cert.qrHint')}
        />
      )}

      <View style={styles.verified}>
        <Ionicons name="shield-checkmark" size={13} color={Colors.tertiary} />
        <Text style={styles.verifiedText}>{t('cert.verifiedBy')}</Text>
      </View>

      {!!cert.certificateNo && (
        <View style={styles.noBlock}>
          <Text style={styles.noLabel}>{t('cert.certNoLabel')}</Text>
          <Text style={styles.noValue}>{cert.certificateNo}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  qr: {
    width: 84, height: 84, borderRadius: 8,
    backgroundColor: '#fff',
  },
  verified: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.tertiary + '14', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  verifiedText: { fontSize: 11, fontWeight: '800', color: Colors.tertiary },
  noBlock: { alignItems: 'center', gap: 1 },
  noLabel: { fontSize: 8, fontWeight: '800', color: Colors.outline, letterSpacing: 1.6 },
  noValue: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1 },
});
