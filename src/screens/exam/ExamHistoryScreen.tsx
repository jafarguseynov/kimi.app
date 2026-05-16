import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useQuery } from '@tanstack/react-query';
import { getCertificates, type Certificate } from '../../api/certificate.api';

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.ExamHistory> };

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function gradeLabel(pct: number): { label: string; color: string; bg: string } {
  if (pct >= 90) return { label: 'Əla', color: Colors.tertiary, bg: Colors.tertiary + '18' };
  if (pct >= 70) return { label: 'Yaxşı', color: Colors.primary, bg: Colors.primaryFixed + '33' };
  return { label: 'Kafi', color: Colors.danger, bg: Colors.danger + '18' };
}

export default function ExamHistoryScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const { data: certs = [], isLoading, refetch } = useQuery({
    queryKey: ['certificates'],
    queryFn: getCertificates,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const avgPct = certs.length
    ? Math.round(certs.reduce((s, c) => s + c.percentage, 0) / certs.length)
    : 0;
  const bestPct = certs.length ? Math.max(...certs.map((c) => c.percentage)) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İmtahan Tarixçəsi</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Hero stats */}
        <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroAura} />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroMeta}>Ümumi Performans</Text>
              <Text style={styles.heroTitle}>Nəticələrin</Text>
            </View>
            <View style={styles.heroScoreCircle}>
              <Text style={styles.heroScoreNum}>{avgPct}<Text style={styles.heroScorePercent}>%</Text></Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatMeta}>Ümumi İmtahan</Text>
              <Text style={styles.heroStatNum}>{certs.length}</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatMeta}>Ən yüksək</Text>
              <Text style={styles.heroStatNum}>{bestPct}%</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Sertifikatlar</Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : certs.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="ribbon-outline" size={48} color={Colors.primaryFixed} />
            <Text style={styles.emptyText}>Hələ heç bir imtahan verməmisən.</Text>
          </View>
        ) : (
          certs.map((cert: Certificate) => {
            const grade = gradeLabel(cert.percentage);
            return (
              <TouchableOpacity
                key={cert.id}
                style={styles.certCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(Routes.CertificatePreview, { examId: cert.examId })}
              >
                <View style={styles.certTop}>
                  <View style={styles.certInfo}>
                    <Text style={styles.certTitle} numberOfLines={2}>{cert.examTitle}</Text>
                    <Text style={styles.certDate}>{formatDate(cert.issuedAt)}</Text>
                  </View>
                  <View style={[styles.gradeBadge, { backgroundColor: grade.bg }]}>
                    <Text style={[styles.gradeText, { color: grade.color }]}>{grade.label}</Text>
                  </View>
                </View>
                <View style={styles.certBottom}>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreWin}>{cert.score}</Text>
                    <Text style={styles.scoreDash}>/{cert.total}</Text>
                  </View>
                  <View style={styles.pctBadge}>
                    <Ionicons name="ribbon-outline" size={14} color={Colors.primary} />
                    <Text style={styles.pctText}>{cert.percentage}%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 56,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 20, gap: 20 },

  heroCard: {
    borderRadius: 24, padding: 24, gap: 28, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 4,
  },
  heroAura: { position: 'absolute', top: -16, right: -16, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroMeta: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroScoreCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  heroScoreNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
  heroScorePercent: { fontSize: 13, fontWeight: '700', color: '#fff' },
  heroStats: { flexDirection: 'row', gap: 16 },
  heroStatItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 16, alignItems: 'center', gap: 4 },
  heroStatMeta: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  heroStatNum: { fontSize: 24, fontWeight: '800', color: '#fff' },

  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },

  center: { paddingTop: 32, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  certCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.02, shadowRadius: 30, elevation: 1,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  certTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  certInfo: { flex: 1 },
  certTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22 },
  certDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  gradeBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  gradeText: { fontSize: 11, fontWeight: '700' },

  certBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  scoreWin: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  scoreDash: { fontSize: 16, fontWeight: '600', color: Colors.textMuted },
  pctBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryFixed + '33', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  pctText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
