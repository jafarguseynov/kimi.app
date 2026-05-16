import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'secondary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: Colors.primaryLight, text: Colors.primary },
  success: { bg: Colors.successLight, text: Colors.success },
  danger: { bg: Colors.dangerLight, text: Colors.danger },
  warning: { bg: Colors.warningLight, text: Colors.warning },
  secondary: { bg: Colors.secondaryLight, text: Colors.secondary },
};

export default function Badge({ label, variant = 'primary' }: BadgeProps) {
  const vc = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: vc.bg }]}>
      <Text style={[styles.text, { color: vc.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  text: { fontSize: 12, fontWeight: '600' },
});
