import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, Text, TextStyle } from 'react-native';

interface Props {
  value: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  /** ms — qısa saxlanılır ki, diqqət yayındırmasın */
  duration?: number;
}

/**
 * Rəqəmin köhnə dəyərdən yenisinə yumşaq keçidi (XP sayğacı, reytinq sırası).
 *
 * Qeyd: mətn məzmunu animasiya edildiyi üçün native driver mümkün deyil,
 * amma dəyişən yalnız BİR mətn qovşağıdır — ağır layout işi yaranmır.
 * İlk render-də animasiya olmur (ekran açılanda rəqəmlər "qaçmır").
 */
export default function AnimatedNumber({ value, style, prefix = '', duration = 700 }: Props) {
  const anim = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);
  const mounted = useRef(false);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeListener(id);
  }, [anim]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      anim.setValue(value);
      setDisplay(value);
      return;
    }
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, anim, duration]);

  return <Text style={style}>{prefix}{display.toLocaleString()}</Text>;
}
