import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { MarketQuestion } from '../../api/marketplace.api';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface Props {
  item: MarketQuestion;
  onPress: () => void;
}

export default function QuestionCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{item.subject}</Text>
        </View>
        {item.isResolved && (
          <View style={styles.resolvedBadge}>
            <Text style={styles.resolvedText}>✓ Həll edildi</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.body} numberOfLines={2}>{item.body}</Text>

      <View style={styles.footer}>
        <Text style={styles.author}>{item.author.name}</Text>
        <View style={styles.footerRight}>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          {item.price > 0 && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{formatCurrency(item.price)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  subjectBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  subjectText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  resolvedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  resolvedText: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  body: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 12, color: Colors.textMuted },
  priceBadge: { backgroundColor: '#FEF9C3', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  priceText: { fontSize: 12, color: Colors.warning, fontWeight: '700' },
});
