import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/client';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';
import { useMonetization } from '../../store/featureFlag.store';

interface Analytics {
  totalBookings: number;
  confirmedBookings: number;
  uniqueStudents: number;
  monthlyRevenue: number;
  rating: number;
  hourlyRate: number;
}

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function TeacherDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const { t } = useTranslation();
  const { withdrawals: withdrawVisible } = useMonetization();

  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ['teacherAnalytics'],
    queryFn: () => api.get('/user/teacher/analytics').then((r) => r.data),
  });

  const balance = analytics?.monthlyRevenue ?? 0;
  const answersCount = analytics?.confirmedBookings ?? 0;
  const acceptanceRate = analytics?.totalBookings
    ? Math.round((analytics.confirmedBookings / analytics.totalBookings) * 100)
    : 0;
  const lastMonthDelta = 15;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>{t('teacherDashboard.headerTitle')}</Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (navigation.getParent() as any)?.navigate('Home', { screen: Routes.Notifications })}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Text style={styles.bigTitle}>{t('teacherDashboard.bigTitle')}</Text>
          <Text style={styles.bigSub}>{t('teacherDashboard.bigSub')}</Text>
        </View>

        {/* Premium balance card */}
        <LinearGradient
          colors={GRADIENT}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceAura} pointerEvents="none" />
          <Text style={styles.balanceLabel}>{t('teacherDashboard.totalBalance')}</Text>
          <View style={styles.balanceRow}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Text style={styles.balanceAmount}>{balance.toFixed(2)}</Text>
                <Text style={styles.balanceCurrency}>AZN</Text>
              </>
            )}
          </View>
          {user?.isVerified && (
            <View style={styles.verifiedChip}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={styles.verifiedChipText}>{t('teacherDashboard.verifiedAccount')}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: Colors.primary + '1A' }]}>
              <Ionicons name="chatbubbles-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{answersCount}</Text>
            <Text style={styles.statLabel}>{t('teacherDashboard.answersLabel')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: Colors.tertiary + '1A' }]}>
              <Ionicons name="checkmark-done-circle" size={20} color={Colors.tertiary} />
            </View>
            <Text style={styles.statValue}>{acceptanceRate}%</Text>
            <Text style={styles.statLabel}>{t('teacherDashboard.acceptedLabel')}</Text>
          </View>
        </View>

        {/* Actions — qazanc çıxarma admin monetizasiya bağlasa gizlənir */}
        {withdrawVisible && (
        <>
        <TouchableOpacity
          style={{ width: '100%' }}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.Withdrawal)}
        >
          <LinearGradient
            colors={GRADIENT}
            style={styles.primaryAction}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="cash-outline" size={20} color="#fff" />
            <Text style={styles.primaryActionText}>{t('teacherDashboard.withdraw')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAction}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.Withdrawal)}
        >
          <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.secondaryActionText}>{t('teacherDashboard.history')}</Text>
        </TouchableOpacity>
        </>
        )}

        {/* AI Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightBar} />
          <View style={styles.insightIconBox}>
            <Ionicons name="sparkles" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>{t('teacherDashboard.aiInsight')}</Text>
            <Text style={styles.insightBody}>
              {t('teacherDashboard.insightPre')}<Text style={styles.insightHighlight}>{t('teacherDashboard.insightHighlight', { delta: lastMonthDelta })}</Text>{t('teacherDashboard.insightPost')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primaryFixed + '33',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 60, gap: 22 },

  titleBlock: { gap: 4 },
  bigTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6 },
  bigSub: { fontSize: 13, color: Colors.textSecondary },

  balanceCard: {
    borderRadius: 24, padding: 32, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.18, shadowRadius: 40, elevation: 8,
    overflow: 'hidden',
  },
  balanceAura: {
    position: 'absolute', top: -60, right: -60,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  balanceLabel: {
    fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2, marginBottom: 6,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  balanceAmount: { fontSize: 48, fontWeight: '800', color: '#fff', letterSpacing: -1.5 },
  balanceCurrency: { fontSize: 22, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  verifiedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
    marginTop: 18,
  },
  verifiedChipText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  statsGrid: { flexDirection: 'row', gap: 14 },
  statCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 22, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
  },
  statIconBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  primaryAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 999, paddingVertical: 18,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  primaryActionText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  secondaryAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 999, paddingVertical: 18,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  secondaryActionText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },

  insightCard: {
    position: 'relative',
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: Colors.primary + '0D',
    borderRadius: 20, padding: 20,
    overflow: 'hidden',
  },
  insightBar: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: 4, backgroundColor: Colors.primary,
  },
  insightIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 4,
  },
  insightTitle: { fontSize: 13, fontWeight: '800', color: Colors.primary, marginBottom: 4, letterSpacing: 0.3 },
  insightBody: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  insightHighlight: { color: Colors.tertiary, fontWeight: '800' },
});
