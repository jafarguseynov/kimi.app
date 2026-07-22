import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { hapticLight } from '../../utils/haptics';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onPress?: () => void;
  style?: object;
}

/**
 * Boş ekranlar üçün ümumi komponent: aydın izah + tək çağırış (CTA).
 * Məqsəd: istifadəçi boş siyahı görəndə "burada nə var, nə etməliyəm?" deyə
 * çaşmasın — dərhal növbəti addımı görsün.
 */
export default function EmptyState({ icon, title, subtitle, ctaLabel, onPress, style }: Props) {
  return (
    <View style={[s.wrap, style]}>
      <View style={s.iconCircle}>
        <Ionicons name={icon} size={40} color={Colors.primary} />
      </View>
      <Text style={s.title}>{title}</Text>
      {!!subtitle && <Text style={s.sub}>{subtitle}</Text>}
      {!!ctaLabel && !!onPress && (
        <TouchableOpacity
          style={s.cta}
          activeOpacity={0.85}
          onPress={() => {
            hapticLight();
            onPress();
          }}
        >
          <Text style={s.ctaText}>{ctaLabel}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  sub: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 14,
    marginTop: 22,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
