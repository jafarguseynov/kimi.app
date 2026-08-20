import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { getExamResults, getCertificates } from '../../api/certificate.api';
import { getEntitlements } from '../../api/shop.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const XP_PER_EXAM_POINT = 10; // hər düz cavab balı = 10 XP (ProfileScreen ilə eyni)
const XP_PER_CERT = 100; // hər sertifikat = 100 XP
const XP_PER_LEVEL = 2000; // ProfileScreen ilə eyni səviyyə formulu

type RewardKind = 'exam' | 'cert';

interface RewardEntry {
  id: string;
  kind: RewardKind;
  source: string;
  xp: number;
  date: number; // epoch ms
  icon: keyof typeof Ionicons.glyphMap;
}

export default function RewardHistoryScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ['examResults'],
    queryFn: getExamResults,
  });
  const { data: certs = [], isLoading: loadingCerts } = useQuery({
    queryKey: ['certificates'],
    queryFn: getCertificates,
  });
  const { data: entitlements } = useQuery({
    queryKey: ['entitlements'],
    queryFn: getEntitlements,
  });

  const isLoading = loadingResults || loadingCerts;

  const { totalXp, level, premiumDays, history } = useMemo(() => {
    const examXp = results.reduce((s, r) => s + (r.score ?? 0) * XP_PER_EXAM_POINT, 0);
    const certXp = certs.length * XP_PER_CERT;
    const totalXp = examXp + certXp;
    const level = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);

    let premiumDays = 0;
    if (entitlements?.premiumUntil) {
      const diff = new Date(entitlements.premiumUntil).getTime() - Date.now();
      premiumDays = diff > 0 ? Math.ceil(diff / (24 * 60 * 60 * 1000)) : 0;
    }

    const entries: RewardEntry[] = [
      ...results.map((r) => ({
        id: `exam-${r.id}`,
        kind: 'exam' as const,
        source: r.examTitle,
        xp: (r.score ?? 0) * XP_PER_EXAM_POINT,
        date: new Date(r.completedAt).getTime(),
        icon: (r.percentage >= 90 ? 'sparkles' : 'star') as keyof typeof Ionicons.glyphMap,
      })),
      ...certs.map((c) => ({
        id: `cert-${c.id}`,
        kind: 'cert' as const,
        source: c.examTitle,
        xp: XP_PER_CERT,
        date: new Date(c.issuedAt).getTime(),
        icon: 'ribbon' as keyof typeof Ionicons.glyphMap,
      })),
    ]
      .filter((e) => !isNaN(e.date))
      .sort((a, b) => b.date - a.date)
      .slice(0, 40);

    return { totalXp, level, premiumDays, history: entries };
  }, [results, certs, entitlements]);

  const formatWhen = (ms: number): string => {
    const d = new Date(ms);
    const today = new Date();
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const same = (a: Date, b: Date) =>
      a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    if (same(d, today)) return t('rewardHistory.today');
    if (same(d, yest)) return t('rewardHistory.yesterday');
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('rewardHistory.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.heroLabel}>{t('rewardHistory.heroLabel')}</Text>

          <View style={styles.heroBlock}>
            <View style={styles.heroRow}>
              <Text style={styles.heroValue}>
                {totalXp.toLocaleString('az-AZ')}
                <Text style={styles.heroUnit}>{t('rewardHistory.unitXp')}</Text>
              </Text>
              <View style={styles.levelBadge}>
                <Ionicons name="medal" size={14} color="#fff" />
                <Text style={styles.levelText}>{t('rewardHistory.level', { n: level })}</Text>
              </View>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroRow}>
              <Text style={styles.heroValue}>
                {premiumDays}
                <Text style={styles.heroUnit}>{t('rewardHistory.unitDays')}</Text>
              </Text>
              <Text style={styles.heroSub}>{t('rewardHistory.premiumStatus')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* List header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t('rewardHistory.listTitle')}</Text>
        </View>

        {/* Transactions */}
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
        ) : history.length === 0 ? (
          <View style={styles.helper}>
            <Ionicons name="gift-outline" size={44} color={Colors.primaryFixed} />
            <Text style={styles.emptyTitle}>{t('rewardHistory.emptyTitle')}</Text>
            <Text style={styles.helperText}>{t('rewardHistory.emptySub')}</Text>
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.DailyMissions)}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.helperBtn}>
                <Text style={styles.helperBtnText}>{t('rewardHistory.helperBtn')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {history.map((r) => (
              <View key={r.id} style={styles.card}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: r.kind === 'cert' ? Colors.warningLight : Colors.primaryLight },
                  ]}
                >
                  <Ionicons name={r.icon} size={20} color={r.kind === 'cert' ? Colors.warning : Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {r.kind === 'cert' ? t('rewardHistory.certEarned') : t('rewardHistory.xpEarned')}
                  </Text>
                  <Text style={styles.cardSub} numberOfLines={1}>{r.source}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.amount}>+{r.xp} XP</Text>
                  <Text style={styles.when}>{formatWhen(r.date)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 20, paddingBottom: 40, gap: 24 },

  hero: {
    borderRadius: 24, padding: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6,
  },
  heroLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, textTransform: 'uppercase' },
  heroBlock: { marginTop: 20, gap: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  heroValue: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.8 },
  heroUnit: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  heroSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  levelText: { fontSize: 11, fontWeight: '800', color: '#fff' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 18, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  iconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  cardSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '900', color: Colors.primary },
  when: { fontSize: 9, color: Colors.textMuted, marginTop: 2, letterSpacing: 0.8, textTransform: 'uppercase' },

  helper: {
    backgroundColor: Colors.surfaceLow, borderRadius: 18, padding: 24,
    alignItems: 'center', gap: 12,
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.borderLight,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  helperText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  helperBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 999, marginTop: 4 },
  helperBtnText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 1.2 },
});
