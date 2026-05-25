import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const INVITE_LINK = 'kimi.az/invite/123';

export default function InviteFriendsScreen() {
  const navigation = useNavigation<any>();

  const onShare = async () => {
    try {
      await Share.share({ message: `Kimi.az-a qoşul! ${INVITE_LINK}` });
    } catch {}
  };

  const onCopy = () => {
    Clipboard.setString(INVITE_LINK);
    Alert.alert('Kopyalandı', 'Dəvət linki yaddaşa köçürüldü.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dostlarını dəvət et</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBlob} />
          <Text style={styles.heroTitle}>Link paylaş və mükafat qazan 🎁</Text>
          <Text style={styles.heroSub}>Dostlarınızı Kimi.az-a dəvət edərək birlikdə öyrənin.</Text>

          {/* Referral link box */}
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>{INVITE_LINK}</Text>
            <TouchableOpacity onPress={onCopy} hitSlop={6} style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Main CTA */}
          <TouchableOpacity activeOpacity={0.9} onPress={onShare}>
            <LinearGradient
              colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.shareBtn}
            >
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.shareBtnText}>Linki paylaş</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick share */}
        <View style={{ gap: 12 }}>
          <Text style={styles.sectionLabel}>SÜRƏTLİ PAYLAŞIM</Text>

          <TouchableOpacity style={styles.quickRow} activeOpacity={0.85} onPress={onShare}>
            <View style={[styles.quickIcon, { backgroundColor: '#25D36619' }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </View>
            <Text style={styles.quickText}>WhatsApp ilə paylaş</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickRow} activeOpacity={0.85} onPress={onShare}>
            <View style={[styles.quickIcon, { backgroundColor: '#0088CC19' }]}>
              <Ionicons name="paper-plane" size={20} color="#0088CC" />
            </View>
            <Text style={styles.quickText}>Telegram ilə paylaş</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
          </TouchableOpacity>
        </View>

        {/* Reward Info */}
        <View style={styles.rewardCard}>
          <View style={styles.rewardIcon}>
            <Ionicons name="cash" size={28} color={Colors.tertiary} />
          </View>
          <Text style={styles.rewardTitle}>Dostun qoşulsa +10 bal qazan</Text>
          <Text style={styles.rewardSub}>
            Dəvət etdiyiniz hər yeni istifadəçi üçün xal qazanın və reytinqdə yüksəlin.
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant + '33',
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },

  scroll: { paddingHorizontal: 24, paddingTop: 24, gap: 32 },

  heroCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24,
    position: 'relative', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3,
  },
  heroBlob: {
    position: 'absolute', top: -40, right: -40,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primaryFixed, opacity: 0.1,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3, marginBottom: 8 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },

  linkBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 14,
    marginBottom: 16,
  },
  linkText: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginRight: 8 },
  copyBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textSecondary,
    letterSpacing: 1.2, paddingHorizontal: 8,
  },
  quickRow: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  quickIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  quickText: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  rewardCard: {
    backgroundColor: Colors.tertiaryContainer + '4D',
    borderRadius: 24, padding: 24, alignItems: 'center',
  },
  rewardIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.tertiary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 2,
  },
  rewardTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, textAlign: 'center', letterSpacing: -0.3 },
  rewardSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
