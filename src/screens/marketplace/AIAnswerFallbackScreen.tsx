import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MarketplaceStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = { navigation: NativeStackNavigationProp<MarketplaceStackParamList, typeof Routes.AIAnswerFallback> };

export default function AIAnswerFallbackScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kimi AI Köməkçisi</Text>
        <View style={styles.avatarCircle}>
          <Ionicons name="hardware-chip-outline" size={20} color={Colors.primary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>Təhsilin Gələcəyi</Text>
          <Text style={styles.heroTitle}>AI-dan Müəllimə</Text>
          <Text style={styles.heroSub}>Süni intellektin gücü və insan müəllimin təcrübəsi bir arada.</Text>
        </View>

        {/* Main Anchor Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardIconWrap}>
            <Ionicons name="chatbubbles-outline" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.mainCardTitle}>AI cavab yetərli olmadı?</Text>
          <Text style={styles.mainCardSub}>
            Bəzən mövzunu daha dərindən anlamaq üçün canlı izah lazımdır. Bizim peşəkar müəllimlərimiz sizə kömək etməyə hazırdır.
          </Text>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate(Routes.MarketplaceHome)}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.mainCta}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.mainCtaText}>Real müəllimdən cavab al</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 2-column Secondary Cards */}
        <View style={styles.secondaryGrid}>
          <View style={styles.secondaryCard}>
            <Ionicons name="flash-outline" size={28} color={Colors.primary} />
            <View style={{ marginTop: 'auto' as any }}>
              <Text style={styles.secondaryCardTitle}>Sürətli</Text>
              <Text style={styles.secondaryCardSub}>5 dəqiqəyə cavab</Text>
            </View>
          </View>
          <View style={styles.secondaryCard}>
            <Ionicons name="shield-checkmark-outline" size={28} color={Colors.tertiary} />
            <View style={{ marginTop: 'auto' as any }}>
              <Text style={styles.secondaryCardTitle}>Ekspert</Text>
              <Text style={styles.secondaryCardSub}>Təsdiqlənmiş müəllimlər</Text>
            </View>
          </View>
        </View>

        {/* Info Tip Card */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.primary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Faydalı məsləhət</Text>
            <Text style={styles.tipText}>
              Müəllimə sual verərkən problemin şəklini əlavə etməyi unutmayın. Bu, izahın daha dəqiq olmasına kömək edəcək.
            </Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 56,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceContainer, overflow: 'hidden',
    borderWidth: 2, borderColor: Colors.primaryFixed,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { padding: 24, gap: 24 },

  heroSection: { marginTop: 8, gap: 8 },
  heroLabel: {
    fontSize: 11, fontWeight: '600', color: Colors.primary,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  heroTitle: { fontSize: 36, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, lineHeight: 44 },
  heroSub: { fontSize: 17, color: Colors.textSecondary, lineHeight: 26, maxWidth: '85%' },

  mainCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 28, gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 2,
  },
  mainCardIconWrap: {
    width: 56, height: 56, borderRadius: 20,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  mainCardTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  mainCardSub: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24 },
  mainCta: {
    borderRadius: 999, paddingVertical: 18, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  mainCtaText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  secondaryGrid: { flexDirection: 'row', gap: 16 },
  secondaryCard: {
    flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 24,
    aspectRatio: 1,
  },
  secondaryCardTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  secondaryCardSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  tipTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  tipText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
