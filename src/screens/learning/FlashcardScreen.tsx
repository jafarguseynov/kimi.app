import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { recordProgress } from '../../api/learning.api';
import { useLearningStore } from '../../store/learning.store';
import { useLearningProgressStore } from '../../store/learningProgress.store';
import FlashCard from '../../components/learning/FlashCard';
import { Colors } from '../../constants/colors';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function FlashcardScreen({ navigation }: Props) {
  const { cards, currentIndex, subject, nextCard, resetSession } = useLearningStore();
  const markRated = useLearningProgressStore((s) => s.markRated);
  const { mutate } = useMutation({ mutationFn: ({ id, q }: { id: string; q: number }) => recordProgress(id, q) });

  const current = cards[currentIndex];
  const isLast = currentIndex === cards.length - 1;
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const handleRate = (quality: number) => {
    if (current) {
      markRated(current.id, quality);
      mutate({ id: current.id, q: quality });
    }
    if (isLast) {
      resetSession();
      navigation.goBack();
    } else {
      nextCard();
    }
  };

  useEffect(() => {
    if (!current) {
      navigation.goBack();
    }
  }, [current, navigation]);

  if (!current) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => { resetSession(); navigation.goBack(); }}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fleşkartlar</Text>
        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="settings-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>MƏŞQ DAVAM EDİR{subject ? ` · ${subject}` : ''}</Text>
          <Text style={styles.progressCount}>{currentIndex + 1}/{cards.length} kart</Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={[styles.progressFill, { width: `${progress}%` as any }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          />
        </View>
      </View>

      {/* Card + Actions */}
      <View style={styles.body}>
        <FlashCard front={current.front} back={current.back} onRate={handleRate} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 56,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },

  progressSection: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8, gap: 8 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.8 },
  progressCount: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  progressBar: {
    height: 8, backgroundColor: Colors.surfaceHigh,
    borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4 },

  body: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
});
