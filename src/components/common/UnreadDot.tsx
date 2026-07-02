import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

const RED = '#EF4444';

interface Props {
  count?: number;
  /** true → say göstər (məs. "3"); false → sadə nöqtə. */
  showCount?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Oxunmamış-göstərici: say 0/undefined olsa heç nə göstərmir.
 * showCount=false → kiçik qırmızı nöqtə; showCount=true → say balonu.
 * Adətən valideyn View `position: 'relative'` olmalıdır (nöqtə absolute yerləşir).
 */
export default function UnreadDot({ count, showCount = false, size = 10, style }: Props) {
  if (!count || count <= 0) return null;

  if (showCount) {
    return (
      <View style={[styles.badge, style]}>
        <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
      </View>
    );
  }

  return <View style={[styles.dot, { width: size, height: size, borderRadius: size / 2 }, style]} />;
}

const styles = StyleSheet.create({
  dot: {
    backgroundColor: RED,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
