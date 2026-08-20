import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import type { Certificate } from '../../api/certificate.api';

/**
 * NƏTİCƏ BLOKU — sertifikatın ən güclü vizual elementi.
 *
 * Rəqəmlər HƏMİŞƏ realdır: `score`/`total` sertifikat sətrindən, faiz isə
 * serverdə `correct / total * 100` ilə hesablanıb saxlanılıb. Burada heç nə
 * yenidən hesablanmır və uydurulmur.
 *
 * ⚠️ `passed=false` (serverin `passMin` astanasından aşağı) olduqda nəticə
 * DOMİNANT göstərilmir: belə sertifikat iştirak sənədidir və nəhəng «0%»
 * nailiyyət kimi təqdim edilə bilməz. Rəqəm gizlədilmir — sadəcə sakit,
 * ikinci dərəcəli sətirdə verilir.
 */
type Props = { cert: Pick<Certificate, 'score' | 'total' | 'percentage' | 'passed'> };

export default function CertificateResult({ cert }: Props) {
  const { t } = useTranslation();
  const passed = cert.passed !== false;

  if (!passed) {
    return (
      <View style={styles.quietWrap}>
        <Text style={styles.quietLabel}>{t('cert.resultLabel')}</Text>
        <Text style={styles.quietValue}>
          {cert.score}/{cert.total} · {cert.percentage}%
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.scoreRow}>
        <Text style={styles.score}>{cert.score}</Text>
        <Text style={styles.slash}>/</Text>
        <Text style={styles.total}>{cert.total}</Text>
      </View>
      <View style={styles.pctRow}>
        <Text style={styles.pct}>{cert.percentage}</Text>
        <Text style={styles.pctSign}>%</Text>
      </View>
      <Text style={styles.label}>{t('cert.resultLabelBig')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  score: { fontSize: 44, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -2 },
  slash: { fontSize: 26, fontWeight: '700', color: Colors.outlineVariant },
  total: { fontSize: 26, fontWeight: '800', color: Colors.textSecondary },
  pctRow: { flexDirection: 'row', alignItems: 'baseline', gap: 1, marginTop: 2 },
  pct: { fontSize: 22, fontWeight: '900', color: Colors.primary, letterSpacing: -0.6 },
  pctSign: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  label: { fontSize: 9, fontWeight: '800', color: Colors.outline, letterSpacing: 2.4, marginTop: 4 },

  quietWrap: { alignItems: 'center', gap: 3 },
  quietLabel: { fontSize: 9, fontWeight: '800', color: Colors.outline, letterSpacing: 2 },
  quietValue: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
});
