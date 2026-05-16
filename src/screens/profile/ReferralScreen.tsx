import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface ReferralData {
  code: string;
  link: string;
  earnings: number;
}

export default function ReferralScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { data, isLoading } = useQuery<ReferralData>({
    queryKey: ['referral'],
    queryFn: async () => {
      const res = await client.get('/referral/link');
      return res.data;
    },
  });

  const displayLink = data?.link ?? 'kimi.az/invite/123';

  const handleShare = async () => {
    await Share.share({
      message: `Kimi.az tətbiqini yüklə! ${displayLink}`,
      url: displayLink,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dostlarını dəvət et</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero card */}
          <View style={styles.heroCard}>
            <View style={styles.heroOrb} pointerEvents="none" />
            <Text style={styles.heroTitle}>Link paylaş və mükafat qazan 🎁</Text>
            <Text style={styles.heroSub}>
              Dostlarınızı Kimi.az-a dəvət edərək birlikdə öyrənin.
            </Text>

            {/* Link box */}
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1}>{displayLink}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={handleShare} activeOpacity={0.75}>
                <Ionicons name="copy-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Main CTA */}
            <TouchableOpacity activeOpacity={0.9} onPress={handleShare}>
              <LinearGradient
                colors={GRADIENT}
                style={styles.mainCta}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="share-social-outline" size={20} color="#fff" />
                <Text style={styles.mainCtaText}>Linki paylaş</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick share section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sürətli Paylaşım</Text>
            <View style={styles.shareList}>
              <TouchableOpacity style={styles.shareRow} activeOpacity={0.8} onPress={handleShare}>
                <View style={[styles.shareIconBox, { backgroundColor: '#25D366' + '1A' }]}>
                  <Ionicons name="chatbubble-outline" size={22} color="#25D366" />
                </View>
                <Text style={styles.shareRowText}>WhatsApp ilə paylaş</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareRow} activeOpacity={0.8} onPress={handleShare}>
                <View style={[styles.shareIconBox, { backgroundColor: '#0088CC' + '1A' }]}>
                  <Ionicons name="paper-plane-outline" size={22} color="#0088CC" />
                </View>
                <Text style={styles.shareRowText}>Telegram ilə paylaş</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reward info */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardIconCircle}>
              <Ionicons name="cash-outline" size={28} color={Colors.tertiary} />
            </View>
            <Text style={styles.rewardTitle}>Dostun qoşulsa +10 bal qazan</Text>
            <Text style={styles.rewardSub}>
              Dəvət etdiyiniz hər yeni istifadəçi üçün xal qazanın və reytinqdə yüksəlin.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  backBtn: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 20, fontWeight: '600', color: Colors.textPrimary,
  },
  headerSpacer: { width: 48 },

  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48, gap: 20 },

  heroCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24,
    gap: 16, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 2,
  },
  heroOrb: {
    position: 'absolute', top: -40, right: -40,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.gradientEnd,
    opacity: 0.1,
  },
  heroTitle: {
    fontSize: 20, fontWeight: '700', color: Colors.textPrimary,
    lineHeight: 28,
  },
  heroSub: {
    fontSize: 15, color: Colors.textSecondary, lineHeight: 22,
  },

  linkBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLow, borderRadius: 16,
    paddingLeft: 16, paddingRight: 8, paddingVertical: 12,
    gap: 12,
  },
  linkText: {
    flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary,
  },
  copyBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background,
  },

  mainCta: {
    height: 56, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 4,
  },
  mainCtaText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  section: { gap: 12 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1.5,
    paddingHorizontal: 4,
  },
  shareList: { gap: 10 },
  shareRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  shareIconBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  shareRowText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },

  rewardCard: {
    backgroundColor: Colors.tertiaryContainer + '4D',
    borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 12,
  },
  rewardIconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  rewardTitle: {
    fontSize: 18, fontWeight: '700', color: Colors.textPrimary,
    textAlign: 'center',
  },
  rewardSub: {
    fontSize: 14, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
});
