import React, { useEffect, useRef, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Linking, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getBanners } from '../api/banner.api';
import { Colors } from '../constants/colors';
import { rs } from '../utils/responsive';

const SCREEN_W = Dimensions.get('window').width;
const H_PADDING = rs(16);
const CARD_W = SCREEN_W - H_PADDING * 2;
const CARD_H = Math.round(CARD_W * 0.42);
const AUTO_MS = 4000;

type Props = { placement?: string };

export default function BannerSlider({ placement = 'home' }: Props) {
  const { data: banners = [] } = useQuery({
    queryKey: ['banners', placement],
    queryFn: () => getBanners(placement),
    staleTime: 5 * 60 * 1000,
  });

  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const count = banners.length;

  // Avtomatik slayd
  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % count;
        scrollRef.current?.scrollTo({ x: next * CARD_W, animated: true });
        return next;
      });
    }, AUTO_MS);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;

  const openLink = (url: string | null) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  const onScrollEnd = (e: any) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
    if (i !== index) setIndex(i);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        decelerationRate="fast"
        snapToInterval={CARD_W}
      >
        {banners.map((b) => (
          <TouchableOpacity
            key={b.id}
            activeOpacity={b.linkUrl ? 0.85 : 1}
            onPress={() => openLink(b.linkUrl)}
            style={{ width: CARD_W }}
          >
            <Image source={{ uri: b.imageUrl }} style={styles.image} resizeMode="cover" />
            {!!b.title && (
              <View style={styles.titleBar}>
                <Text style={styles.title} numberOfLines={1}>{b.title}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {count > 1 && (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: rs(12) },
  image: { width: CARD_W, height: CARD_H, borderRadius: rs(16), backgroundColor: Colors.surfaceHighest },
  titleBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: rs(14), paddingVertical: rs(8),
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderBottomLeftRadius: rs(16), borderBottomRightRadius: rs(16),
  },
  title: { color: '#fff', fontSize: rs(13), fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: rs(8) },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.borderLight },
  dotActive: { width: 16, backgroundColor: Colors.primary },
});
