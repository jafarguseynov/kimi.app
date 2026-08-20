import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { nextTierGap, tierOfCertificate } from '../../utils/certificateTier';
import type { Certificate } from '../../api/certificate.api';

/**
 * «Növbəti nailiyyətin» — REAL vəziyyətə bağlı motivasiya kartı.
 *
 * Backend qaydası (exam.service `submitExam`): hər tamamlanmış imtahan bir
 * sertifikat yaradır, EYNİ imtahan daha yüksək faizlə təkrar verilsə mövcud
 * sertifikat YÜKSƏLİR. Yəni istifadəçinin növbəti nailiyyəti iki yolla gəlir:
 *   1. səviyyə astanasına ən yaxın sertifikatı təkrar verib yüksəltmək
 *   2. tamamilə yeni imtahan verib yeni sertifikat qazanmaq
 *
 * Kart məhz bunu göstərir — astanaya ən yaxın sertifikat seçilir («3% qalıb»).
 * Bütün sertifikatlar ən yuxarı səviyyədədirsə (2) variantına keçir.
 */
type Props = {
  certs: Certificate[];
  /** Astanaya ən yaxın sertifikatı təkrar vermək. */
  onRetake: (cert: Certificate) => void;
  /** İmtahanlar bölməsinə keçid. */
  onBrowse: () => void;
};

export default function NextAchievementCard({ certs, onRetake, onBrowse }: Props) {
  const { t } = useTranslation();
  if (certs.length === 0) return null;

  // Astanalar serverdən gəlir (admin idarəli) — sertifikatların özündən toplanır.
  const knownTiers = certs
    .map((c) => c.tier)
    .filter((t): t is { key: string; label: string; min: number } => !!t)
    .map((t) => ({ key: t.key as any, min: t.min }));

  // Növbəti səviyyəyə ƏN YAXIN sertifikat (ən kiçik fərq qalib gəlir).
  let closest: { cert: Certificate; gap: number; tierLabel: string } | null = null;
  for (const c of certs) {
    const next = nextTierGap(c.percentage, knownTiers);
    if (!next) continue;
    if (!closest || next.gap < closest.gap) {
      closest = { cert: c, gap: next.gap, tierLabel: t(next.tier.labelKey) };
    }
  }

  const allMaxed = !closest;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.iconBox}>
          <Ionicons name={allMaxed ? 'sparkles' : 'flag'} size={16} color={Colors.primary} />
        </View>
        <Text style={styles.kicker}>{t('cert.nextTitle')}</Text>
      </View>

      {allMaxed ? (
        <>
          <Text style={styles.body}>{t('cert.nextAllMaxed')}</Text>
          <TouchableOpacity style={styles.cta} activeOpacity={0.8} onPress={onBrowse}>
            <Text style={styles.ctaText}>{t('cert.browseExams')}</Text>
            <Ionicons name="arrow-forward" size={15} color={Colors.primary} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.body}>
            {t('cert.nextGap', {
              gap: closest!.gap,
              tier: closest!.tierLabel,
              exam: closest!.cert.examTitle,
            })}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(4, Math.min(100, closest!.cert.percentage))}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {t('cert.nextProgress', {
              current: closest!.cert.percentage,
              tier: t(tierOfCertificate(closest!.cert).labelKey),
            })}
          </Text>
          <TouchableOpacity style={styles.cta} activeOpacity={0.8} onPress={() => onRetake(closest!.cert)}>
            <Text style={styles.ctaText}>{t('cert.retakeExam')}</Text>
            <Ionicons name="arrow-forward" size={15} color={Colors.primary} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary + '0A',
    borderRadius: 18, padding: 18, gap: 8,
    borderWidth: 1, borderColor: Colors.primary + '22',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  iconBox: {
    width: 28, height: 28, borderRadius: 9,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  kicker: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 0.8, textTransform: 'uppercase' },
  body: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20, fontWeight: '600' },

  progressTrack: {
    height: 6, borderRadius: 999, backgroundColor: Colors.surfaceHigh,
    overflow: 'hidden', marginTop: 4,
  },
  progressFill: { height: 6, borderRadius: 999, backgroundColor: Colors.primary },
  progressLabel: { fontSize: 11.5, color: Colors.textSecondary, fontWeight: '600' },

  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', marginTop: 6,
  },
  ctaText: { fontSize: 13.5, fontWeight: '800', color: Colors.primary },
});
