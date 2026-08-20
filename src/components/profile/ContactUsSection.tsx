import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { getContactLinks, type ContactLink } from '../../api/contactLink.api';

/**
 * BİZİMLƏ ƏLAQƏ — profil ekranının altındakı sosial/rabitə kanalları.
 *
 * Siyahı tamamilə admin paneldən idarə olunur («Əlaqə linkləri» səhifəsi):
 * yeni kanal əlavə etmək və ya linki dəyişmək üçün OTA lazım deyil.
 * Link yoxdursa (və ya sorğu uğursuzdursa) bölmə ümumiyyətlə göstərilmir.
 */

const CHANNELS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; name: string }> = {
  instagram: { icon: 'logo-instagram', color: '#E1306C', name: 'Instagram' },
  whatsapp:  { icon: 'logo-whatsapp',  color: '#25D366', name: 'WhatsApp' },
  tiktok:    { icon: 'logo-tiktok',    color: '#111111', name: 'TikTok' },
  telegram:  { icon: 'paper-plane',    color: '#229ED9', name: 'Telegram' },
  x:         { icon: 'logo-x',         color: '#111111', name: 'X' },
  website:   { icon: 'globe-outline',  color: Colors.primary, name: 'Veb sayt' },
  facebook:  { icon: 'logo-facebook',  color: '#1877F2', name: 'Facebook' },
  youtube:   { icon: 'logo-youtube',   color: '#FF0000', name: 'YouTube' },
  email:     { icon: 'mail-outline',   color: '#0EA5E9', name: 'E-poçt' },
  phone:     { icon: 'call-outline',   color: '#10B981', name: 'Telefon' },
};
const channelOf = (p: string) =>
  CHANNELS[p] ?? { icon: 'link-outline' as const, color: Colors.primary, name: p };

export default function ContactUsSection() {
  const { t } = useTranslation();

  const { data: links = [] } = useQuery<ContactLink[]>({
    queryKey: ['contactLinks'],
    queryFn: () => getContactLinks().catch(() => [] as ContactLink[]),
    staleTime: 10 * 60 * 1000,
  });

  if (links.length === 0) return null;

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('profileScreen.contactUsTitle')}</Text>
      <Text style={styles.sub}>{t('profileScreen.contactUsSub')}</Text>

      <View style={styles.card}>
        {links.map((l) => {
          const c = channelOf(l.platform);
          return (
            <TouchableOpacity key={l.id} style={styles.item} activeOpacity={0.75} onPress={() => open(l.url)}>
              <View style={[styles.iconBox, { backgroundColor: c.color + '18' }]}>
                <Ionicons name={c.icon} size={20} color={c.color} />
              </View>
              <Text style={styles.label} numberOfLines={1}>{l.label || c.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: 12.5, color: Colors.textMuted, marginTop: 2, marginBottom: 12 },

  card: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 1,
  },
  // 4 sütun — sətir sayı kanal sayına görə özü artır.
  item: { width: '25%', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 2 },
  iconBox: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
});
