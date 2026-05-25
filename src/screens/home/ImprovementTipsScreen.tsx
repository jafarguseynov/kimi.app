import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface Tip {
  id: string;
  title: string;
  sub?: string;
  badge?: string;
  badgeIcon?: keyof typeof Ionicons.glyphMap;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  cta: string;
  primary?: boolean;
}

const TIPS: Tip[] = [
  {
    id: 't1',
    title: 'Faiz mövzusunda 10 sual həll et',
    badge: '+25% inkişaf',
    badgeIcon: 'trending-up',
    icon: 'flash',
    iconBg: '#DCFCE7',
    iconColor: '#16a34a',
    cta: 'Başla',
    primary: true,
  },
  {
    id: 't2',
    title: 'Flashcard istifadə et',
    sub: 'Yaddaşını möhkəmləndir',
    icon: 'albums',
    iconBg: '#DBEAFE',
    iconColor: '#2563eb',
    cta: 'Məşq et',
  },
  {
    id: 't3',
    title: 'Gündə 15 dəqiqə çalış',
    sub: 'Kiçik addımlarla hədəfə çat',
    icon: 'time',
    iconBg: '#FFEDD5',
    iconColor: '#ea580c',
    cta: 'Plan qur',
  },
];

export default function ImprovementTipsScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tövsiyələr</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} hitSlop={8}>
          <Ionicons name="notifications" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero text */}
        <View style={{ gap: 8 }}>
          <Text style={styles.h1}>Sənin üçün tövsiyələr</Text>
          <Text style={styles.h1Sub}>AI analizinə görə sənə daha çox nəticə verəcək addımlar planlaşdırıldı.</Text>
        </View>

        {/* Main AI card */}
        <View style={styles.aiCard}>
          <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.aiStripe} />
          <View style={styles.aiIcon}>
            <Ionicons name="hardware-chip" size={28} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>Ağıllı Təhlil Nəticəsi</Text>
            <Text style={styles.aiSub}>
              Sənin öyrənmə tempinə və zəif nöqtələrinə əsasən xüsusi inkişaf planı hazırladım. Aşağıdakı addımları izləyərək nəticələrini sürətlə artıra bilərsən.
            </Text>
          </View>
        </View>

        {/* Tip cards */}
        <View style={{ gap: 16 }}>
          {TIPS.map((t) => (
            <View key={t.id} style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: t.iconBg }]}>
                <Ionicons name={t.icon} size={22} color={t.iconColor} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.tipTitle}>{t.title}</Text>
                {t.sub && <Text style={styles.tipSub}>{t.sub}</Text>}
                {t.badge && (
                  <View style={styles.badgeRow}>
                    {t.badgeIcon && <Ionicons name={t.badgeIcon} size={12} color="#15803d" />}
                    <Text style={styles.badgeText}>{t.badge}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.tipBtn, t.primary && styles.tipBtnPrimary]}
              >
                <Text style={[styles.tipBtnText, t.primary && styles.tipBtnTextPrimary]}>{t.cta}</Text>
              </TouchableOpacity>
            </View>
          ))}
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
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant + '80',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary, letterSpacing: -0.3 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 16, paddingTop: 24, gap: 28 },

  h1: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  h1Sub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  aiCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 20,
    flexDirection: 'row', gap: 16,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '4D',
    position: 'relative', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
  },
  aiStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  aiIcon: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  aiTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  aiSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '4D',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12,
  },
  tipIcon: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  tipTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  tipSub: { fontSize: 13, color: Colors.textSecondary },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#15803d' },

  tipBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
  },
  tipBtnPrimary: { backgroundColor: Colors.primary },
  tipBtnText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  tipBtnTextPrimary: { color: '#fff' },
});
