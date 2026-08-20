import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

interface Props {
  /** 0..1 */
  progress: number;
  colors: [string, string];
  height?: number;
}

/**
 * Doldurma zolağı — dəyər dəyişəndə yumşaq axır.
 *
 * PERFORMANS: `width` yerine `translateX` animasiya edilir və native driver
 * işlədilir → animasiya UI thread-də gedir, aşağı səviyyəli Android-də də
 * kadr itirmir. Doldurma tam enli zolağın sola sürüşdürülməsi ilə alınır.
 */
export default function ProgressBar({ progress, colors, height = 10 }: Props) {
  const [width, setWidth] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;
  const mounted = useRef(false);
  const clamped = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      anim.setValue(clamped);
      return;
    }
    Animated.timing(anim, {
      toValue: clamped,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [clamped, anim]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]} onLayout={onLayout}>
      {width > 0 && (
        <Animated.View
          style={{
            width,
            height,
            transform: [
              {
                translateX: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-width, 0],
                }),
              },
            ],
          }}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: height / 2 }}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: Colors.outlineVariant + '55',
    overflow: 'hidden',
  },
});
