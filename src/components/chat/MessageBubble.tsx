import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  content: string;
  isOwn: boolean;
  senderName: string;
  time: string;
}

export default function MessageBubble({ content, isOwn, senderName, time }: Props) {
  return (
    <View style={[styles.row, isOwn && styles.rowOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && <Text style={styles.sender}>{senderName}</Text>}
        <Text style={[styles.content, isOwn && styles.contentOwn]}>{content}</Text>
        <Text style={[styles.time, isOwn && styles.timeOwn]}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 8, paddingHorizontal: 16 },
  rowOwn: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
  },
  bubbleOther: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleOwn: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  sender: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  content: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },
  contentOwn: { color: '#fff' },
  time: { fontSize: 11, color: Colors.textMuted, marginTop: 4, textAlign: 'right' },
  timeOwn: { color: 'rgba(255,255,255,0.7)' },
});
