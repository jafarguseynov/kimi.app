import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { certificateSubtitle } from '../../utils/certificateMeta';
import { tierOfCertificate } from '../../utils/certificateTier';
import CertificateBadge from './CertificateBadge';
import CertificateResult from './CertificateResult';
import CertificateVerification from './CertificateVerification';
import type { Certificate } from '../../api/certificate.api';

/**
 * SERTİFİKATIN ÖZÜ — paylaşıla bilən əsas vizual.
 *
 * Məlumat iyerarxiyası (yuxarıdan aşağı): brend → sertifikat növü → şagirdin
 * adı → NƏTİCƏ (dominant) → imtahan/fənn → səviyyə nişanı → tarix → doğrulama.
 *
 * ⚠️ MƏTN NƏTİCƏYƏ GÖRƏ DƏYİŞİR. Əvvəl şablon sabit idi və canlıda belə cümlə
 * çıxırdı: «Azərbaycan dili · 8-ci sinif imtahanını 0/20 nəticə ilə UĞURLA
 * BAŞA VURDUĞU ÜÇÜN». Server indi `passed` bayrağı göndərir (admin `passMin`
 * astanası) — aşağı nəticədə sertifikat İŞTİRAK sənədi kimi ifadə olunur.
 */
type Props = {
  cert: Certificate;
  studentName: string;
};

export default function CertificatePreview({ cert, studentName }: Props) {
  const { t, language } = useTranslation();
  const tier = tierOfCertificate(cert);
  const passed = cert.passed !== false;
  const subtitle = certificateSubtitle(cert, language, t);

  const dateStr = new Date(cert.issuedAt)
    .toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'az-AZ', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    .toUpperCase();

  return (
    <View style={styles.card}>
      {/* İncə akademik çərçivə + çox yüngül dekor */}
      <View style={styles.frame} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerTL, { borderColor: tier.color + '66' }]} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerBR, { borderColor: tier.color + '66' }]} pointerEvents="none" />

      <Text style={styles.brand}>
        Kimi<Text style={styles.brandAccent}>.az</Text>
      </Text>

      <Text style={styles.kicker}>
        {passed ? t('cert.titleAchievement') : t('cert.titleParticipation')}
      </Text>

      <Text style={styles.intro}>{t('cert.awardedTo')}</Text>
      <Text style={styles.name} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6}>
        {studentName}
      </Text>

      <View style={styles.rule} />

      {/* Nəticə — sertifikatın vizual mərkəzi */}
      <CertificateResult cert={cert} />

      {/* İmtahan / fənn · sinif */}
      <View style={styles.examBlock}>
        <Text style={styles.examTitle} numberOfLines={2}>{cert.examTitle}</Text>
        {!!subtitle && <Text style={styles.examSub} numberOfLines={1}>{subtitle}</Text>}
      </View>

      <CertificateBadge cert={cert} />

      <Text style={styles.reason}>
        {passed ? t('cert.reasonPassed') : t('cert.reasonParticipated')}
      </Text>

      <View style={styles.dateBlock}>
        <Text style={styles.dateLabel}>{t('cert.dateLabel')}</Text>
        <Text style={styles.dateValue}>{dateStr}</Text>
      </View>

      <View style={styles.rule} />

      <CertificateVerification cert={cert} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 22,
    paddingHorizontal: 24, paddingVertical: 30,
    alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.07, shadowRadius: 32, elevation: 3,
  },
  /* İncə ikinci çərçivə — akademik sənəd hissi (dolğun dekor yoxdur) */
  frame: {
    position: 'absolute', top: 10, left: 10, right: 10, bottom: 10,
    borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 14,
  },
  corner: { position: 'absolute', width: 26, height: 26 },
  cornerTL: { top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 14 },
  cornerBR: { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 14 },

  brand: { fontSize: 19, fontWeight: '900', color: Colors.primary, letterSpacing: -0.4 },
  brandAccent: { color: Colors.primaryFixed },

  kicker: {
    fontSize: 10, fontWeight: '800', color: Colors.outline,
    letterSpacing: 2.6, textAlign: 'center', marginTop: 2,
  },

  intro: { fontSize: 11.5, color: Colors.textSecondary, marginTop: 10 },
  name: {
    fontSize: 26, fontWeight: '900', color: Colors.textPrimary,
    letterSpacing: -0.6, textAlign: 'center', paddingHorizontal: 4,
  },

  rule: { width: 64, height: 1, backgroundColor: Colors.border, marginVertical: 6 },

  examBlock: { alignItems: 'center', gap: 2, paddingHorizontal: 8 },
  examTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.2 },
  examSub: { fontSize: 12.5, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  reason: {
    fontSize: 12, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 18, maxWidth: 280, marginTop: 2,
  },

  dateBlock: { alignItems: 'center', gap: 2, marginTop: 4 },
  dateLabel: { fontSize: 8, fontWeight: '800', color: Colors.outline, letterSpacing: 1.8 },
  dateValue: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.4 },
});
