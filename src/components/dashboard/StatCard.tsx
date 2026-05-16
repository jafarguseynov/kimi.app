import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

export default function StatCard({ label, value, icon, color = Colors.primary }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: '45%',
  },
  icon: { fontSize: 28, marginBottom: 8 },
  value: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  label: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500' },
});
