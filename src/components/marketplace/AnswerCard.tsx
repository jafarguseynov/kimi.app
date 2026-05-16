import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { MarketAnswer } from '../../api/marketplace.api';
import { formatDate } from '../../utils/formatters';

interface Props {
  item: MarketAnswer;
  isOwner: boolean;
  isResolved: boolean;
  onAccept: (id: string) => void;
}

export default function AnswerCard({ item, isOwner, isResolved, onAccept }: Props) {
  return (
    <View style={[styles.card, item.isAccepted && styles.cardAccepted]}>
      {item.isAccepted && (
        <View style={styles.acceptedBanner}>
          <Text style={styles.acceptedText}>✓ Qəbul edilmiş cavab</Text>
        </View>
      )}
      <Text style={styles.body}>{item.body}</Text>
      <View style={styles.footer}>
        <View>
          <Text style={styles.author}>{item.author.name}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        {isOwner && !isResolved && !item.isAccepted && (
          <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(item.id)}>
            <Text style={styles.acceptBtnText}>Qəbul et</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardAccepted: { borderColor: Colors.success, backgroundColor: '#F0FDF4' },
  acceptedBanner: { marginBottom: 10 },
  acceptedText: { fontSize: 13, color: Colors.success, fontWeight: '700' },
  body: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  author: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  date: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  acceptBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
