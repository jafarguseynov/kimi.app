import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Easing,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const { width: W, height: H } = Dimensions.get('window');

// Kiçik ekranlar (məs. Samsung A5 2017 ~360×640dp) üçün — illüstrasiya
// həm enə, həm hündürlüyə görə kiçilməlidir ki, başlıqla üst-üstə düşməsin.
const SMALL = H < 720;

// Illustration stage geometry (scales down on small phones)
const STAGE = Math.min(310, W - 56, Math.round(H * (SMALL ? 0.32 : 0.4)));
const CARD = Math.round(STAGE * 0.74);
const AURA = Math.round(STAGE * 0.84);
const RING_R = STAGE / 2 - 5;
const RING_DOTS = Array.from({ length: 8 }).map((_, i) => {
  const a = (Math.PI / 4) * i;
  return {
    left: STAGE / 2 + RING_R * Math.cos(a) - 4,
    top: STAGE / 2 + RING_R * Math.sin(a) - 4,
  };
});

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, typeof Routes.Welcome> };

type IconName = keyof typeof Ionicons.glyphMap;

interface Satellite {
  icon: IconName;
  color: string;
}

interface Slide {
  id: string;
  titleKey: string;
  subtitleKey: string;
  icon: IconName;
  gradient: [string, string];
  accent: string;
  badgeIcon: IconName;
  badgeLabelKey: string;
  badgeColors: [string, string];
  chipIcon: IconName;
  chipLabelKey: string;
  satellites: [Satellite, Satellite];
}

const slides: Slide[] = [
  {
    id: '1',
    titleKey: 'welcome.slide1Title',
    subtitleKey: 'welcome.slide1Sub',
    icon: 'school',
    gradient: ['#006190', '#47b4fa'],
    accent: '#47b4fa',
    badgeIcon: 'checkmark-circle',
    badgeLabelKey: 'welcome.slide1Badge',
    badgeColors: ['#006947', '#0a8a5f'],
    chipIcon: 'star',
    chipLabelKey: 'welcome.slide1Chip',
    satellites: [
      { icon: 'people', color: '#47b4fa' },
      { icon: 'ribbon', color: '#F59E0B' },
    ],
  },
  {
    id: '2',
    titleKey: 'welcome.slide2Title',
    subtitleKey: 'welcome.slide2Sub',
    icon: 'hardware-chip',
    gradient: ['#5B2BD9', '#9168F0'],
    accent: '#9168F0',
    badgeIcon: 'sparkles',
    badgeLabelKey: 'welcome.slide2Badge',
    badgeColors: ['#5B2BD9', '#7c4ddb'],
    chipIcon: 'flash',
    chipLabelKey: 'welcome.slide2Chip',
    satellites: [
      { icon: 'checkmark-done', color: '#22C55E' },
      { icon: 'bulb', color: '#F59E0B' },
    ],
  },
  {
    id: '3',
    titleKey: 'welcome.slide3Title',
    subtitleKey: 'welcome.slide3Sub',
    icon: 'trending-up',
    gradient: ['#006947', '#16C088'],
    accent: '#16C088',
    badgeIcon: 'rocket',
    badgeLabelKey: 'welcome.slide3Badge',
    badgeColors: ['#006947', '#0a8a5f'],
    chipIcon: 'flame',
    chipLabelKey: 'welcome.slide3Chip',
    satellites: [
      { icon: 'trophy', color: '#F59E0B' },
      { icon: 'library', color: '#16C088' },
    ],
  },
];

/** Animated, layered hero illustration for a single slide. */
function Stage({ slide }: { slide: Slide }) {
  const { t } = useTranslation();
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 26000, easing: Easing.linear, useNativeDriver: true }),
    ).start();
  }, [enter, float, pulse, spin]);

  const cardY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const cardRot = float.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] });
  const auraScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.12] });
  const auraOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.18] });
  const ringRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const enterScale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const satAY = float.interpolate({ inputRange: [0, 1], outputRange: [5, -7] });
  const satBY = float.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] });
  const badgeY = float.interpolate({ inputRange: [0, 1], outputRange: [3, -4] });
  const chipY = float.interpolate({ inputRange: [0, 1], outputRange: [-3, 4] });

  return (
    <Animated.View style={[styles.stage, { opacity: enter, transform: [{ scale: enterScale }] }]}>
      {/* Soft glow */}
      <Animated.View
        style={[
          styles.aura,
          { backgroundColor: slide.accent + '33', opacity: auraOpacity, transform: [{ scale: auraScale }] },
        ]}
      />

      {/* Orbiting dots */}
      <Animated.View style={[styles.ring, { transform: [{ rotate: ringRotate }] }]} pointerEvents="none">
        {RING_DOTS.map((p, i) => (
          <View
            key={i}
            style={[
              styles.ringDot,
              { left: p.left, top: p.top, backgroundColor: slide.accent, opacity: i % 2 ? 0.35 : 0.7 },
            ]}
          />
        ))}
      </Animated.View>

      {/* Main card */}
      <Animated.View style={{ transform: [{ translateY: cardY }, { rotate: cardRot }] }}>
        <LinearGradient
          colors={slide.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.gloss} />
          <View style={styles.iconHalo} />
          <Ionicons name={slide.icon} size={Math.round(CARD * 0.42)} color="#fff" />
        </LinearGradient>
      </Animated.View>

      {/* Floating chip — top-right */}
      <Animated.View style={[styles.chip, { transform: [{ translateY: chipY }] }]}>
        <LinearGradient
          colors={slide.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chipIcon}
        >
          <Ionicons name={slide.chipIcon} size={14} color="#fff" />
        </LinearGradient>
        <Text style={styles.chipText}>{t(slide.chipLabelKey)}</Text>
      </Animated.View>

      {/* Status badge — bottom-left */}
      <Animated.View style={[styles.badgeWrap, { transform: [{ translateY: badgeY }] }]}>
        <LinearGradient
          colors={slide.badgeColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Ionicons name={slide.badgeIcon} size={13} color="#fff" />
          <Text style={styles.badgeText}>{t(slide.badgeLabelKey)}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Satellite bubbles */}
      <Animated.View style={[styles.satA, { transform: [{ translateY: satAY }] }]}>
        <View style={styles.satBubble}>
          <Ionicons name={slide.satellites[0].icon} size={20} color={slide.satellites[0].color} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.satB, { transform: [{ translateY: satBY }] }]}>
        <View style={styles.satBubble}>
          <Ionicons name={slide.satellites[1].icon} size={20} color={slide.satellites[1].color} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function WelcomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList<Slide>>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    if (idx !== currentIndex) setCurrentIndex(idx);
  };

  const onNext = () => {
    if (currentIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.navigate(Routes.Login);
    }
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={() => navigation.navigate(Routes.Login)} hitSlop={12}>
          <Text style={styles.skip}>{t('welcome.skip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.illustrationWrap}>
              <Stage slide={item} />
            </View>

            {/* Text */}
            <View style={styles.textSection}>
              <Text style={styles.title}>{t(item.titleKey)}</Text>
              <Text style={styles.subtitle}>{t(item.subtitleKey)}</Text>
            </View>
          </View>
        )}
      />

      {/* Progress dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={onNext} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>{isLast ? t('welcome.start') : t('welcome.continue')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.terms}>
          {t('welcome.termsPre')}
          <Text style={styles.termsLink}>{t('welcome.termsLink')}</Text>
          {t('welcome.termsPost')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 8,
  },
  logo: {
    width: 220,
    height: 82,
  },
  skip: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },

  slide: {
    width: W,
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SMALL ? 20 : 40,
  },

  stage: {
    width: STAGE,
    height: STAGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    width: AURA,
    height: AURA,
    borderRadius: AURA / 2,
    top: (STAGE - AURA) / 2,
    left: (STAGE - AURA) / 2,
  },
  ring: {
    position: 'absolute',
    width: STAGE,
    height: STAGE,
    top: 0,
    left: 0,
  },
  ringDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  card: {
    width: CARD,
    height: CARD,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 12,
  },
  gloss: {
    position: 'absolute',
    width: CARD * 0.7,
    height: CARD * 0.7,
    borderRadius: (CARD * 0.7) / 2,
    top: -CARD * 0.2,
    left: -CARD * 0.12,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  iconHalo: {
    position: 'absolute',
    width: CARD * 0.62,
    height: CARD * 0.62,
    borderRadius: (CARD * 0.62) / 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  chip: {
    position: 'absolute',
    top: 4,
    right: -2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 5,
  },
  chipIcon: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },

  badgeWrap: { position: 'absolute', bottom: 18, left: -2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  satA: { position: 'absolute', top: 8, left: 0 },
  satB: { position: 'absolute', bottom: 6, right: 6 },
  satBubble: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  textSection: { alignItems: 'center', paddingHorizontal: 8 },
  title: {
    fontSize: SMALL ? 28 : 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: SMALL ? 8 : 12,
    lineHeight: SMALL ? 34 : 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: SMALL ? 15 : 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: SMALL ? 22 : 26,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: SMALL ? 12 : 24,
    marginBottom: 12,
  },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 32, backgroundColor: Colors.primary },
  dotInactive: { width: 8, backgroundColor: Colors.surfaceHigh },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 28,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  terms: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, marginTop: 14 },
  termsLink: { textDecorationLine: 'underline' },
});
