import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';

interface Props {
  front: string;
  back: string;
  onRate: (quality: number) => void;
}

export default function FlashCard({ front, back, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.card} onPress={() => setFlipped((f) => !f)} activeOpacity={0.95}>
        <TouchableOpacity style={styles.flipIcon} onPress={() => setFlipped((f) => !f)} activeOpacity={0.7}>
          <Ionicons name="sync-outline" size={28} color={Colors.outlineVariant} />
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <Text style={styles.cardLabel}>{flipped ? 'Cavab' : 'Sual'}</Text>
          <Text style={styles.cardText}>{flipped ? back : front}</Text>
        </View>
        <View style={styles.cardFooterBar} />
      </TouchableOpacity>

      {!flipped && (
        <View style={styles.hintRow}>
          <Text style={styles.hintText}>Kartı çevirmək üçün toxun</Text>
          <Ionicons name="chevron-down-outline" size={20} color={Colors.outlineVariant} />
        </View>
      )}

      {flipped && (
        <View style={styles.rateRow}>
          <TouchableOpacity style={styles.rateBtn} onPress={() => onRate(1)} activeOpacity={0.8}>
            <View style={styles.rateBadIcon}>
              <Ionicons name="close" size={24} color={Colors.error} />
            </View>
            <Text style={styles.rateBtnText}>Bilmədim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rateBtn} onPress={() => onRate(5)} activeOpacity={0.8}>
            <View style={styles.rateGoodIcon}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.rateBtnText}>Bildim</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', gap: 24 },

  card: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 24,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 4,
  },
  flipIcon: { position: 'absolute', top: 20, right: 20 },
  cardContent: { alignItems: 'center', gap: 16, paddingHorizontal: 8 },
  cardLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.primaryFixedDim,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  cardText: {
    fontSize: 28, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', lineHeight: 38,
  },
  cardFooterBar: {
    position: 'absolute', bottom: 24,
    width: 48, height: 4,
    backgroundColor: Colors.surfaceContainer, borderRadius: 2,
  },

  hintRow: { alignItems: 'center', gap: 4 },
  hintText: { fontSize: 13, color: Colors.textSecondary + 'B3', fontStyle: 'italic' },

  rateRow: { flexDirection: 'row', gap: 12, width: '100%' },
  rateBtn: {
    flex: 1, flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 20,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16, gap: 10,
  },
  rateBadIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.error + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  rateGoodIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  rateBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
