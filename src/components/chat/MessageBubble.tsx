import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';

interface Props {
  content: string;
  isOwn: boolean;
  senderName: string;
  time: string;
  type?: string;
  isRead?: boolean;
}

// Oxu qəbzi: göndərilib = tək ✓, görülüb = qoşa ✓✓ (mavi). Yalnız öz mesajlarda.
function ReadReceipt({ isRead, onLight }: { isRead?: boolean; onLight?: boolean }) {
  const color = isRead ? '#34B7F1' : onLight ? Colors.textMuted : 'rgba(255,255,255,0.7)';
  return (
    <View style={styles.receipt}>
      <Ionicons name={isRead ? 'checkmark-done' : 'checkmark'} size={14} color={color} />
    </View>
  );
}

export default function MessageBubble({ content, isOwn, senderName, time, type, isRead }: Props) {
  // Stiker — fon olmadan böyük emoji
  if (type === 'sticker') {
    return (
      <View style={[styles.row, isOwn && styles.rowOwn]}>
        <View style={styles.stickerWrap}>
          {!isOwn && <Text style={styles.sender}>{senderName}</Text>}
          <Text style={styles.sticker}>{content}</Text>
          <View style={[styles.metaRow, isOwn && { justifyContent: 'flex-end' }]}>
            <Text style={styles.time}>{time}</Text>
            {isOwn && <ReadReceipt isRead={isRead} onLight />}
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.row, isOwn && styles.rowOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && <Text style={styles.sender}>{senderName}</Text>}
        <Text style={[styles.content, isOwn && styles.contentOwn]}>{content}</Text>
        <View style={[styles.metaRow, { justifyContent: 'flex-end' }]}>
          <Text style={[styles.time, isOwn && styles.timeOwn]}>{time}</Text>
          {isOwn && <ReadReceipt isRead={isRead} />}
        </View>
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  time: { fontSize: 11, color: Colors.textMuted, textAlign: 'right' },
  timeOwn: { color: 'rgba(255,255,255,0.7)' },
  receipt: { marginLeft: 1 },
  stickerWrap: { maxWidth: '60%', paddingHorizontal: 4 },
  sticker: { fontSize: 56, lineHeight: 64 },
});
