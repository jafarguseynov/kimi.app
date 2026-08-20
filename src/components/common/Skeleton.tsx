import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

/**
 * Yüklənmə plasholderi (skeleton).
 *
 * ⚠️ Niyə lazım oldu: əvvəl skeletonlar `Colors.borderLight` (#eef1f3) rəngi ilə
 * `Colors.surfaceLow` (#eef1f3) fonun üstünə çəkilirdi — İKİ RƏNG EYNİDİR, ona görə
 * kartın içindəki sətirlər ümumiyyətlə görünmürdü və ekran açılanda böyük boz
 * boşluq kimi (yəni "xəta" kimi) görünürdü. İndi kontrastlı rəng + nəbz
 * animasiyası var: istifadəçi "yüklənir" olduğunu dərhal anlayır.
 *
 * Animasiya `useNativeDriver` ilə işləyir → JS thread yükləmə ilə məşğul olsa da
 * nəbz donmur.
 */
type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Skeleton({ width = '100%', height = 12, radius = 8, style }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: Colors.surfaceHigh, opacity },
        style,
      ]}
    />
  );
}
