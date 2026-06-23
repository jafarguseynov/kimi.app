import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../i18n';
import { getPartners, Partner } from '../api/partner.api';
import { Colors } from '../constants/colors';
import { rs } from '../utils/responsive';

function resolveLink(p: Partner): string | null {
  if (p.linkUrl) return p.linkUrl;
  if (p.whatsapp) {
    const w = p.whatsapp.trim();
    if (w.startsWith('http')) return w;
    return `https://wa.me/${w.replace(/[^\d]/g, '')}`;
  }
  if (p.phone) return `tel:${p.phone.replace(/\s/g, '')}`;
  const social = p.socials && Object.values(p.socials)[0];
  return social || null;
}

export default function PartnersSection() {
  const { t } = useTranslation();
  const { data: partners = [] } = useQuery({
    queryKey: ['partners'],
    queryFn: getPartners,
    staleTime: 5 * 60 * 1000,
  });

  if (partners.length === 0) return null;

  const open = (p: Partner) => {
    const url = resolveLink(p);
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('home.partners.title')}</Text>
      <View style={styles.grid}>
        {partners.map((p) => (
          <TouchableOpacity key={p.id} style={styles.card} activeOpacity={0.85} onPress={() => open(p)}>
            <Image source={{ uri: p.logoUrl }} style={styles.logo} resizeMode="contain" />
            <Text style={styles.name} numberOfLines={2}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: rs(20), marginBottom: rs(8) },
  title: { fontSize: rs(16), fontWeight: '700', color: Colors.textPrimary, marginBottom: rs(12) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(10) },
  card: {
    width: '30.5%', alignItems: 'center', paddingVertical: rs(12), paddingHorizontal: rs(6),
    backgroundColor: Colors.surface, borderRadius: rs(14), borderWidth: 1, borderColor: Colors.borderLight,
  },
  logo: { width: rs(48), height: rs(48), marginBottom: rs(8) },
  name: { fontSize: rs(11), fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
});
