import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hapticSuccess } from '../../utils/haptics';

// Yaşıl uğur palitrası — açıqdan tünd zümrüdə keçid.
const SUCCESS_GRADIENT: [string, string, string] = ['#34D399', '#10B981', '#059669'];

type Props = {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
};

export default function SuccessOverlay({ visible, title, message, buttonText = 'OK', onClose }: Props) {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    hapticSuccess();
    cardAnim.setValue(0);
    checkAnim.setValue(0);
    ringAnim.setValue(0);
    floatAnim.setValue(0);

    Animated.sequence([
      Animated.spring(cardAnim, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
      Animated.spring(checkAnim, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
    ]).start();

    // Nişanın ətrafında genişlənib sönən halqa — davamlı nəbz.
    const ring = Animated.loop(
      Animated.timing(ringAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    // Arxa fondakı işıq dairələrinin yavaş üzməsi.
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    ring.start();
    float.start();
    return () => {
      ring.stop();
      float.stop();
    };
  }, [visible, cardAnim, checkAnim, ringAnim, floatAnim]);

  const cardScale = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });
  const checkScale = checkAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const ringScale = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const ringOpacity = ringAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.55, 0.15, 0] });
  const blob1Y = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  const blob2Y = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.cardWrap, { opacity: cardAnim, transform: [{ scale: cardScale }] }]}>
          <LinearGradient colors={SUCCESS_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            {/* Arxa fon işıq dairələri */}
            <Animated.View pointerEvents="none" style={[styles.blob, styles.blobTop, { transform: [{ translateY: blob1Y }] }]} />
            <Animated.View pointerEvents="none" style={[styles.blob, styles.blobBottom, { transform: [{ translateY: blob2Y }] }]} />

            <View style={styles.checkArea}>
              <Animated.View style={[styles.pulseRing, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
              <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
                <Ionicons name="checkmark" size={40} color="#059669" />
              </Animated.View>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={onClose}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 30, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
  },
  card: {
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  blobTop: { width: 180, height: 180, top: -70, right: -50 },
  blobBottom: { width: 140, height: 140, bottom: -60, left: -40 },

  checkArea: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  pulseRing: {
    position: 'absolute',
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 3, borderColor: '#FFFFFF',
  },
  checkCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },

  title: { fontSize: 21, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3, marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, color: 'rgba(255,255,255,0.92)', textAlign: 'center', lineHeight: 21, marginBottom: 24 },

  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  buttonText: { fontSize: 15, fontWeight: '800', color: '#059669' },
});
