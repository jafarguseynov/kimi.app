import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Vibration } from 'react-native';
import { hapticSuccess } from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = ['#F59E0B', '#16A34A', '#DC2626', '#3B82F6', '#A855F7', '#EC4899', '#10B981', '#EAB308'];

const PIECE_COUNT = 40;

type Origin = 'top' | 'bottom';

type Props = {
  active: boolean;
  duration?: number;
  onDone?: () => void;
  /** 'top' = yuxarıdan tökülən (default), 'bottom' = aşağıdan partlayan (fişəng). */
  origin?: Origin;
};

type PieceConfig = {
  x: number;
  size: number;
  delay: number;
  color: string;
  rotateStart: number;
  rotateEnd: number;
  driftX: number;
  totalDuration: number;
  // top rejimi:
  fallDistance: number;
  // bottom rejimi (parabola):
  peakY: number;
  endY: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pickColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const buildPieces = (origin: Origin): PieceConfig[] =>
  Array.from({ length: PIECE_COUNT }, () => {
    if (origin === 'bottom') {
      // Mərkəzdən-aşağıdan yelpik kimi yuxarı atılıb sonra düşür
      const launchHeight = SCREEN_HEIGHT * rand(0.4, 0.85);
      return {
        x: SCREEN_WIDTH / 2 + rand(-SCREEN_WIDTH * 0.22, SCREEN_WIDTH * 0.22),
        size: 7 + Math.random() * 9,
        delay: Math.random() * 180,
        color: pickColor(),
        rotateStart: Math.random() * 360,
        rotateEnd: 360 + Math.random() * 900,
        driftX: rand(-SCREEN_WIDTH * 0.45, SCREEN_WIDTH * 0.45),
        totalDuration: 1700 + Math.random() * 1000,
        fallDistance: 0,
        peakY: -launchHeight,
        endY: SCREEN_HEIGHT * 0.25,
      };
    }
    return {
      x: Math.random() * SCREEN_WIDTH,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 400,
      color: pickColor(),
      rotateStart: Math.random() * 360,
      rotateEnd: 360 + Math.random() * 720,
      driftX: (Math.random() - 0.5) * 120,
      totalDuration: 2200 + Math.random() * 1100,
      fallDistance: SCREEN_HEIGHT + 80,
      peakY: 0,
      endY: 0,
    };
  });

export default function Confetti({ active, duration = 2800, onDone, origin = 'top' }: Props) {
  const piecesRef = useRef<PieceConfig[]>(buildPieces(origin));
  const anims = useRef(piecesRef.current.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) return;
    Vibration.vibrate([0, 60, 40, 90]);
    hapticSuccess();
    piecesRef.current = buildPieces(origin);
    anims.forEach((v) => v.setValue(0));

    const animations = anims.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: piecesRef.current[i].totalDuration,
        delay: piecesRef.current[i].delay,
        useNativeDriver: true,
      }),
    );

    Animated.parallel(animations).start(() => {
      onDone?.();
    });
  }, [active, anims, onDone, origin]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {anims.map((v, i) => {
        const p = piecesRef.current[i];
        const translateY =
          origin === 'bottom'
            ? v.interpolate({ inputRange: [0, 0.42, 1], outputRange: [0, p.peakY, p.endY] })
            : v.interpolate({ inputRange: [0, 1], outputRange: [-40, p.fallDistance] });
        const translateX = v.interpolate({ inputRange: [0, 1], outputRange: [0, p.driftX] });
        const rotate = v.interpolate({
          inputRange: [0, 1],
          outputRange: [`${p.rotateStart}deg`, `${p.rotateEnd}deg`],
        });
        const opacity =
          origin === 'bottom'
            ? v.interpolate({ inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 1, 0] })
            : v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              origin === 'bottom' ? { bottom: 40, left: p.x } : { top: 0, left: p.x },
              {
                width: p.size,
                height: p.size * 1.6,
                backgroundColor: p.color,
                transform: [{ translateY }, { translateX }, { rotate }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    borderRadius: 2,
  },
});
