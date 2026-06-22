import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { useUserStats } from '../../hooks/useDashboard';
import StatCard from '../../components/dashboard/StatCard';
import RecentExamsList from '../../components/dashboard/RecentExamsList';
import DailyMissionsWidget from '../home/DailyMissionsWidget';
import { useTranslation } from '../../i18n';

export default function DashboardScreen() {
  const { user } = useUserStore();
  const { t } = useTranslation();
  const { data, isLoading, refetch, isRefetching } = useUserStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{t('dashboard.greeting', { name: user?.name?.split(' ')[0] || t('dashboard.guest') })}</Text>
          <Text style={styles.subtitle}>{t('dashboard.subtitle')}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('dashboard.statistics')}</Text>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 32 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard
                icon="📝"
                label={t('dashboard.totalExams')}
                value={data?.totalExams ?? 0}
                color={Colors.primary}
              />
              <StatCard
                icon="⭐"
                label={t('dashboard.averageScore')}
                value={`${data?.averageScore ?? 0}%`}
                color={Colors.secondary}
              />
            </View>
            <View style={[styles.statsGrid, { marginTop: 12 }]}>
              <StatCard
                icon="🔥"
                label={t('dashboard.activeDays')}
                value={data?.activeDays ?? 0}
                color={Colors.warning}
              />
              <StatCard
                icon="🏆"
                label={t('dashboard.highest')}
                value={`${data?.highestScore ?? 0}%`}
                color={Colors.success}
              />
            </View>

            <View style={{ marginTop: 28 }}>
              <DailyMissionsWidget />
            </View>

            <Text style={[styles.sectionTitle]}>{t('dashboard.recentExams')}</Text>
            <View style={styles.recentCard}>
              <RecentExamsList results={data?.recentResults ?? []} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  recentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
