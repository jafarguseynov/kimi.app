import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Vibration } from 'react-native';
import { hapticSuccess } from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Premium palitra — qızılı/firuzəyi vurğularla, parıltı üçün ağ.
const COLORS = ['#FBBF24', '#F59E0B', '#34D399', '#22D3EE', '#3B82F6', '#A855F7', '#EC4899', '#F43F5E', '#FFD700'];
const SPARKLE = '#FFFFFF';

const PIECE_COUNT = 52;

type Origin = 'top' | 'bottom';
type Shape = 'ribbon' | 'circle' | 'streamer' | 'sparkle';

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
  shape: Shape;
  rotateStart: number;
  rotateEnd: number;
  driftX: number;
  totalDuration: number;
  spinDir: 1 | -1;
  // top rejimi:
  fallDistance: number;
  // bottom rejimi (parabola):
  peakY: number;
  endY: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pickColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
const pickShape = (): Shape => {
  const r = Math.random();
  if (r < 0.46) return 'ribbon';
  if (r < 0.74) return 'circle';
  if (r < 0.9) return 'streamer';
  return 'sparkle';
};

const buildPieces = (origin: Origin): PieceConfig[] =>
  Array.from({ length: PIECE_COUNT }, () => {
    const shape = pickShape();
    const color = shape === 'sparkle' ? SPARKLE : pickColor();
    const spinDir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    if (origin === 'bottom') {
      // Mərkəzdən-aşağıdan yelpik kimi yuxarı atılıb sonra düşür (fişəng)
      const launchHeight = SCREEN_HEIGHT * rand(0.45, 0.92);
      return {
        x: SCREEN_WIDTH / 2 + rand(-SCREEN_WIDTH * 0.18, SCREEN_WIDTH * 0.18),
        size: 7 + Math.random() * 9,
        delay: Math.random() * 220,
        color,
        shape,
        rotateStart: Math.random() * 360,
        rotateEnd: spinDir * (360 + Math.random() * 1000),
        driftX: rand(-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.5),
        totalDuration: 1800 + Math.random() * 1100,
        spinDir,
        fallDistance: 0,
        peakY: -launchHeight,
        endY: SCREEN_HEIGHT * 0.28,
      };
    }
    return {
      x: Math.random() * SCREEN_WIDTH,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 450,
      color,
      shape,
      rotateStart: Math.random() * 360,
      rotateEnd: spinDir * (360 + Math.random() * 800),
      driftX: (Math.random() - 0.5) * 140,
      totalDuration: 2300 + Math.random() * 1200,
      spinDir,
      fallDistance: SCREEN_HEIGHT + 80,
      peakY: 0,
      endY: 0,
    };
  });

// Formaya görə ölçü/forma stilini qaytar.
const shapeStyle = (p: PieceConfig) => {
  switch (p.shape) {
    case 'circle':
      return { width: p.size, height: p.size, borderRadius: p.size / 2 };
    case 'streamer':
      return { width: Math.max(3, p.size * 0.35), height: p.size * 2.6, borderRadius: 2 };
    case 'sparkle':
      return { width: p.size * 0.6, height: p.size * 0.6, borderRadius: 1, transform: [] as any };
    case 'ribbon':
    default:
      return { width: p.size, height: p.size * 1.7, borderRadius: 2 };
  }
};

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
    <View pointerEvents="none" style={styles.layer}>
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
        // Pop: kiçikdən tez böyüyür, sonda yığılır — premium hiss.
        const scale = v.interpolate({
          inputRange: [0, 0.12, 0.85, 1],
          outputRange: [0.3, 1, 1, p.shape === 'sparkle' ? 0.2 : 0.7],
        });
        const opacity =
          origin === 'bottom'
            ? v.interpolate({ inputRange: [0, 0.08, 0.78, 1], outputRange: [0, 1, 1, 0] })
            : v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
        const sStyle = shapeStyle(p);
        const isSparkle = p.shape === 'sparkle';
        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              origin === 'bottom' ? { bottom: 40, left: p.x } : { top: 0, left: p.x },
              sStyle,
              {
                backgroundColor: p.color,
                transform: [{ translateY }, { translateX }, { rotate }, { scale }],
                opacity,
              },
              isSparkle && styles.sparkleGlow,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Ən üst qatda render olunsun deyə yüksək zIndex + Android elevation.
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  piece: {
    position: 'absolute',
  },
  // Parıltı parçaları üçün yumşaq işıq halosu.
  sparkleGlow: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
