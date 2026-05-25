import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface Props {
  visible: boolean;
  title?: string;
  subtitle?: string;
  footnote?: string;
}

export default function ExamLoadingOverlay({
  visible,
  title = 'İmtahan hazırlanır...',
  subtitle = 'Süni intellekt sualları seçir',
  footnote = 'Uğurlar! Kimi Robot sizin bilik səviyyənizə uyğun ən effektiv sualları hazırlayır.',
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loopProgress = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(progress, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    );
    const loopFloat = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loopProgress.start();
    loopFloat.start();
    return () => {
      loopProgress.stop();
      loopFloat.stop();
    };
  }, [visible, progress, float]);

  const barLeft = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '60%'] });
  const barWidth = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['30%', '45%', '30%'] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.root}>
        <View style={styles.blobOne} />
        <View style={styles.blobTwo} />

        <View style={styles.content}>
          {/* Mascot */}
          <View style={styles.mascotWrap}>
            <Animated.View style={[styles.mascotInner, { transform: [{ translateY: floatY }] }]}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mascotCircle}>
                <Ionicons name="school" size={84} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <View style={styles.chipTopRight}>
              <Ionicons name="sparkles" size={20} color={Colors.primary} />
            </View>
            <View style={styles.chipBottomLeft}>
              <Ionicons name="book-outline" size={20} color={Colors.tertiary} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Progress */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFillWrap, { left: barLeft, width: barWidth }]}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.progressFill} />
            </Animated.View>
          </View>

          {/* Status cards */}
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <Ionicons name="server-outline" size={22} color={Colors.primary} />
              <Text style={styles.statusLabel}>Məlumat bazası</Text>
              <Text style={styles.statusValue}>Yüklənir</Text>
            </View>
            <View style={styles.statusCard}>
              <Ionicons name="hardware-chip-outline" size={22} color={Colors.tertiary} />
              <Text style={styles.statusLabel}>Analiz</Text>
              <Text style={styles.statusValue}>Tamamlanır</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footnote}>{footnote}</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  blobOne: {
    position: 'absolute', top: '-10%', left: '-10%',
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: Colors.primary + '1A',
  },
  blobTwo: {
    position: 'absolute', bottom: '-5%', right: '-10%',
    width: 360, height: 360, borderRadius: 180,
    backgroundColor: Colors.tertiary + '14',
  },

  content: { alignItems: 'center', width: '100%', maxWidth: 420 },

  mascotWrap: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 32, position: 'relative' },
  mascotInner: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  mascotCircle: {
    width: 180, height: 180, borderRadius: 90,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 12,
  },
  chipTopRight: {
    position: 'absolute', top: -4, right: -4,
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '12deg' }],
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4,
  },
  chipBottomLeft: {
    position: 'absolute', bottom: 24, left: -16,
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
    shadowColor: Colors.tertiary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4,
  },

  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, textAlign: 'center' },
  subtitle: {
    fontSize: 11, fontWeight: '600', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 2,
    marginTop: 6, marginBottom: 24, textAlign: 'center',
  },

  progressTrack: {
    width: '100%', height: 8, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh, overflow: 'hidden',
    position: 'relative',
  },
  progressFillWrap: { position: 'absolute', top: 0, bottom: 0 },
  progressFill: { flex: 1, borderRadius: 999 },

  statusGrid: { flexDirection: 'row', gap: 12, marginTop: 32, width: '100%' },
  statusCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    padding: 18, gap: 8, alignItems: 'flex-start',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
  },
  statusLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.2 },
  statusValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  footnote: {
    position: 'absolute', bottom: 48, paddingHorizontal: 32,
    fontSize: 13, color: Colors.textSecondary, lineHeight: 20, textAlign: 'center',
  },
});
