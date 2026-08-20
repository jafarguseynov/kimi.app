import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { tierOfCertificate } from '../../utils/certificateTier';
import { certificateSubtitle } from '../../utils/certificateMeta';
import type { Certificate } from '../../api/certificate.api';

/**
 * Sertifikat kartı — kompakt.
 *
 * Əvvəlki kartın yuxarısında 156dp boş qradiyent sahə var idi (ekranın yarısını
 * yeyirdi, heç bir məlumat daşımırdı). İndi kartın hər sətri məlumatdır:
 * səviyyə nişanı → imtahan adı → fənn·sinif → nəticə + tarix.
 *
 * `subject`/`grade` backend-də imtahan sətrindən gəlir; yoxdursa sətir
 * ÜMUMİYYƏTLƏ göstərilmir (boş yer tutmasın).
 */
type Props = {
  cert: Certificate;
  /** Son 30 gündə qazanılıbsa yüngül vurğu (yeni nailiyyət hissi). */
  isNew?: boolean;
  onPress: () => void;
};

export default function CertificateCard({ cert, isNew, onPress }: Props) {
  const { t, language } = useTranslation();
  const tier = tierOfCertificate(cert);

  // Başlıqda onsuz da olan hissə təkrarlanmır (bax certificateMeta).
  const subjectLine = certificateSubtitle(cert, language, t);

  const dateStr = new Date(cert.issuedAt).toLocaleDateString(
    language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'az-AZ',
    { day: 'numeric', month: 'long', year: 'numeric' },
  );

  return (
    <TouchableOpacity
      style={[styles.card, isNew && styles.cardNew]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: tier.color + '14' }]}>
          <Ionicons name={tier.icon} size={13} color={tier.color} />
          <Text style={[styles.badgeText, { color: tier.color }]}>{t(tier.labelKey)}</Text>
        </View>
        {isNew && (
          <View style={styles.newChip}>
            <Text style={styles.newChipText}>{t('cert.newChip')}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>{cert.examTitle}</Text>
      {!!subjectLine && <Text style={styles.subject} numberOfLines={1}>{subjectLine}</Text>}

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="stats-chart" size={13} color={Colors.primary} />
          <Text style={styles.metaStrong}>{cert.percentage}%</Text>
          <Text style={styles.metaDim}>({cert.score}/{cert.total})</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.metaDim}>{dateStr}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('cert.viewCertificate')}</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  cardNew: { borderColor: Colors.primary + '55' },

  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  newChip: { backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  newChipText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.6, textTransform: 'uppercase' },

  title: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2, marginTop: 4 },
  subject: { fontSize: 12.5, color: Colors.textSecondary, fontWeight: '600' },

  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaStrong: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  metaDim: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  footerText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
