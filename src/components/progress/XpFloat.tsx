import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  amount: number;
  onDone: () => void;
}

/**
 * "+65 XP ✨" — qazanc anında yüngülcə yuxarı qalxıb itən yazı.
 * Qısa (1.1 san) və tamamilə native driver-lidir (opacity + translateY).
 */
export default function XpFloat({ amount, onDone }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => finished && onDone());
  }, [anim, onDone]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          opacity: anim.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [6, -26] }) },
          ],
        },
      ]}
    >
      <Text style={styles.text}>+{amount} XP ✨</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 14, top: 40 },
  text: { fontSize: 15, fontWeight: '900', color: Colors.tertiary, letterSpacing: -0.3 },
});
