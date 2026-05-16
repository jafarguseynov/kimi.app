import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
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

const { width: W } = Dimensions.get('window');

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, typeof Routes.Welcome> };

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  badgeIcon: keyof typeof Ionicons.glyphMap;
  badgeLabel: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Müəllimini tap',
    subtitle: 'Minlərlə müəllim arasından özünə uyğun müəllimi tap.',
    icon: 'school-outline',
    badgeIcon: 'checkmark-circle',
    badgeLabel: 'Təsdiqlənmiş',
  },
  {
    id: '2',
    title: 'AI ilə imtahan ver',
    subtitle: 'Süni intellekt ilə hazırlanan testlərlə biliklərini yoxla.',
    icon: 'hardware-chip-outline',
    badgeIcon: 'sparkles',
    badgeLabel: 'AI Analiz',
  },
  {
    id: '3',
    title: 'Öyrən və inkişaf et',
    subtitle: 'Flashcard-lar və AI mentor ilə hər gün bir az daha irəli get.',
    icon: 'trending-up-outline',
    badgeIcon: 'rocket-outline',
    badgeLabel: 'Gündəlik plan',
  },
];

export default function WelcomeScreen({ navigation }: Props) {
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
        <Text style={styles.logo}>Kimi.az</Text>
        <TouchableOpacity onPress={() => navigation.navigate(Routes.Login)} hitSlop={12}>
          <Text style={styles.skip}>Keçid et</Text>
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
            {/* Illustration card */}
            <View style={styles.illustrationWrap}>
              {/* Aura glow */}
              <View style={styles.aura} />
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.illustrationCard}
              >
                <Ionicons name={item.icon} size={110} color="rgba(255,255,255,0.92)" />
              </LinearGradient>

              {/* Floating badge — bottom-right */}
              <LinearGradient
                colors={[Colors.tertiary, Colors.tertiary + 'cc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.badge}
              >
                <Ionicons name={item.badgeIcon} size={13} color={Colors.onTertiary} />
                <Text style={styles.badgeText}>{item.badgeLabel}</Text>
              </LinearGradient>

              {/* Floating teacher chip — top-left */}
              <View style={styles.chip}>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.chipIcon}
                >
                  <Ionicons name="hardware-chip" size={14} color="#fff" />
                </LinearGradient>
                <Text style={styles.chipText}>AI Dəstək</Text>
              </View>
            </View>

            {/* Text */}
            <View style={styles.textSection}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Progress dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
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
            <Text style={styles.ctaText}>{isLast ? 'Başlayaq' : 'Davam et'}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.terms}>
          Davam edərək{' '}
          <Text style={styles.termsLink}>İstifadəçi şərtləri</Text>
          {' '}ilə razılaşırsınız.
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
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
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
    width: W - 48,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  aura: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.primaryFixed + '22',
  },
  illustrationCard: {
    width: 256,
    height: 256,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 12,
  },
  badge: {
    position: 'absolute',
    bottom: 32,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: Colors.tertiary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.onTertiary },

  chip: {
    position: 'absolute',
    top: 24,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  chipIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },

  textSection: { alignItems: 'center', paddingHorizontal: 8 },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
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
