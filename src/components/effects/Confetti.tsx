import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Vibration } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = ['#F59E0B', '#16A34A', '#DC2626', '#3B82F6', '#A855F7', '#EC4899', '#10B981', '#EAB308'];

const PIECE_COUNT = 36;

type Props = {
  active: boolean;
  duration?: number;
  onDone?: () => void;
};

type PieceConfig = {
  x: number;
  size: number;
  delay: number;
  color: string;
  rotateStart: number;
  rotateEnd: number;
  driftX: number;
  fallDistance: number;
  totalDuration: number;
};

const buildPieces = (): PieceConfig[] =>
  Array.from({ length: PIECE_COUNT }, () => ({
    x: Math.random() * SCREEN_WIDTH,
    size: 6 + Math.random() * 8,
    delay: Math.random() * 400,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotateStart: Math.random() * 360,
    rotateEnd: 360 + Math.random() * 720,
    driftX: (Math.random() - 0.5) * 120,
    fallDistance: SCREEN_HEIGHT + 80,
    totalDuration: 2200 + Math.random() * 1100,
  }));

export default function Confetti({ active, duration = 2800, onDone }: Props) {
  const piecesRef = useRef<PieceConfig[]>(buildPieces());
  const anims = useRef(piecesRef.current.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) return;
    Vibration.vibrate([0, 60, 40, 80]);
    piecesRef.current = buildPieces();
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
  }, [active, anims, onDone]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {anims.map((v, i) => {
        const p = piecesRef.current[i];
        const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-40, p.fallDistance] });
        const translateX = v.interpolate({ inputRange: [0, 1], outputRange: [0, p.driftX] });
        const rotate = v.interpolate({
          inputRange: [0, 1],
          outputRange: [`${p.rotateStart}deg`, `${p.rotateEnd}deg`],
        });
        const opacity = v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              {
                left: p.x,
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
    top: 0,
    borderRadius: 2,
  },
});
