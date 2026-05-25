import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';

interface Props {
  front: string;
  back: string;
  onRate: (quality: number) => void;
}

type RateOption = {
  key: 'again' | 'hard' | 'good' | 'easy';
  label: string;
  quality: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
};

const OPTIONS: RateOption[] = [
  { key: 'again', label: 'Yenidən', quality: 1, icon: 'refresh', color: '#DC2626', bg: '#FEE2E2' },
  { key: 'hard', label: 'Çətin', quality: 2, icon: 'flame', color: '#F59E0B', bg: '#FEF3C7' },
  { key: 'good', label: 'Yaxşı', quality: 4, icon: 'checkmark', color: '#16A34A', bg: '#DCFCE7' },
  { key: 'easy', label: 'Asan', quality: 5, icon: 'sparkles', color: Colors.primary, bg: '#EEF2FF' },
];

export default function FlashCard({ front, back, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);
  const flip = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFlipped(false);
    flip.setValue(0);
  }, [front, back, flip]);

  const toggle = () => {
    const next = !flipped;
    Animated.spring(flip, {
      toValue: next ? 1 : 0,
      useNativeDriver: true,
      friction: 9,
      tension: 60,
    }).start();
    setFlipped(next);
  };

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flip.interpolate({ inputRange: [0, 0.5, 0.5], outputRange: [1, 1, 0] });
  const backOpacity = flip.interpolate({ inputRange: [0.5, 0.5, 1], outputRange: [0, 1, 1] });

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity activeOpacity={0.95} onPress={toggle} style={styles.cardWrap}>
        <Animated.View
          style={[
            styles.card,
            styles.cardFace,
            { transform: [{ perspective: 1000 }, { rotateY: frontRotate }], opacity: frontOpacity },
          ]}
        >
          <View style={styles.cardTopRow}>
            <View style={styles.cardChip}>
              <Ionicons name="help-circle" size={12} color={Colors.primary} />
              <Text style={styles.cardChipText}>SUAL</Text>
            </View>
            <View style={styles.flipPill}>
              <Ionicons name="sync" size={12} color={Colors.textSecondary} />
              <Text style={styles.flipPillText}>Çevir</Text>
            </View>
          </View>
          <View style={styles.cardCenter}>
            <Text style={styles.cardText}>{front}</Text>
          </View>
          <Text style={styles.hintText}>Cavabı görmək üçün toxun</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            styles.cardFace,
            styles.cardBack,
            { transform: [{ perspective: 1000 }, { rotateY: backRotate }], opacity: backOpacity },
          ]}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.cardChip, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle" size={12} color="#15803D" />
              <Text style={[styles.cardChipText, { color: '#15803D' }]}>CAVAB</Text>
            </View>
            <View style={styles.flipPill}>
              <Ionicons name="sync" size={12} color={Colors.textSecondary} />
              <Text style={styles.flipPillText}>Çevir</Text>
            </View>
          </View>
          <View style={styles.cardCenter}>
            <Text style={styles.cardText}>{back}</Text>
          </View>
          <Text style={styles.hintText}>Bilik səviyyəni qiymətləndir ↓</Text>
        </Animated.View>
      </TouchableOpacity>

      {flipped && (
        <View style={styles.rateRow}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.rateBtn}
              activeOpacity={0.85}
              onPress={() => onRate(opt.quality)}
            >
              <View style={[styles.rateIcon, { backgroundColor: opt.bg }]}>
                <Ionicons name={opt.icon} size={20} color={opt.color} />
              </View>
              <Text style={styles.rateBtnText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', gap: 16 },

  cardWrap: { width: '100%', aspectRatio: 3 / 4 },
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 24,
    padding: 22,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 4,
  },
  cardFace: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backfaceVisibility: 'hidden',
  },
  cardBack: { backgroundColor: '#F7FAFC' },

  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  cardChipText: { fontSize: 10, fontWeight: '900', color: Colors.primary, letterSpacing: 1.2 },
  flipPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
  },
  flipPillText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },

  cardCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  cardText: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', lineHeight: 36 },
  hintText: {
    fontSize: 12, color: Colors.textSecondary,
    textAlign: 'center', fontStyle: 'italic',
  },

  rateRow: { flexDirection: 'row', gap: 8, width: '100%' },
  rateBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, gap: 6,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  rateIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  rateBtnText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
});
