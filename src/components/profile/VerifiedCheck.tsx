import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/** Instagram tipli mavi təsdiq rəngi. */
export const VERIFIED_BLUE = '#1DA1F2';

interface Props {
  /** Profil 100% tamamlanıb və yayımdadır? */
  visible?: boolean;
  size?: number;
  /** Avatarın küncünə yapışdırılan variant (ağ haşiyəli dairə). */
  onAvatar?: boolean;
}

/**
 * §10 — TAM PROFİL NİŞANI.
 *
 * Bütün məcburi məlumatları tamamlayıb profilini yayımlamış müəllimin
 * adının yanında görünür — şagird üçün etibar siqnalıdır.
 * Eyni nişan müəllimin öz profilində, ictimai profilində və siyahı
 * kartlarında işlədilir ki, mənası hər yerdə eyni olsun.
 */
export default function VerifiedCheck({ visible = true, size = 18, onAvatar = false }: Props) {
  if (!visible) return null;

  if (onAvatar) {
    const box = size + 10;
    return (
      <View style={[s.avatarBadge, { width: box, height: box, borderRadius: box / 2 }]}>
        <Ionicons name="checkmark" size={size - 4} color="#fff" />
      </View>
    );
  }
  return <Ionicons name="checkmark-circle" size={size} color={VERIFIED_BLUE} />;
}

const s = StyleSheet.create({
  avatarBadge: {
    position: 'absolute', bottom: 4, right: 4,
    backgroundColor: VERIFIED_BLUE,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
});
