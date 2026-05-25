import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getCertificates, type Certificate } from '../../api/certificate.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const PAGE_SIZE = 6;

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.CertificateList> };

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function badgeForPct(pct: number): { label: string; icon: IconName } {
  if (pct >= 95) return { label: 'Champion', icon: 'trophy' };
  if (pct >= 85) return { label: 'Excellence', icon: 'ribbon' };
  if (pct >= 50) return { label: 'Uğur', icon: 'star' };
  return { label: 'İştirakçı', icon: 'school' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function recent30Count(certs: Certificate[]) {
  const threshold = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return certs.filter((c) => new Date(c.issuedAt).getTime() > threshold).length;
}

export default function CertificateListScreen({ navigation }: Props) {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      const data = await getCertificates();
      setCerts(data);
    } catch {
      setCerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const newCount = recent30Count(certs);
  const visible = certs.slice(0, shown);
  const hasMore = shown < certs.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sertifikatlar</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
      >
        {/* Motivational Section with Kimi Robot */}
        <View style={styles.motivCard}>
          <View style={styles.motivMascotWrap}>
            <View style={styles.motivAura} pointerEvents="none" />
            <LinearGradient
              colors={GRADIENT}
              style={styles.motivMascot}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="happy" size={36} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.motivText}>
            <Text style={styles.motivTitle}>Uğurlarının sayı artır!</Text>
            <Text style={styles.motivSub}>
              Bütün sertifikatlarını burada görə bilərsən. Səninlə fəxr edirik!
            </Text>
          </View>
        </View>

        {/* Stats Overview (asymmetric) */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={GRADIENT}
            style={[styles.statCard, styles.statCardLarge]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statCardChip}>Ümumi Nailiyyət</Text>
            <View style={styles.statCardNumRow}>
              <Text style={styles.statCardNum}>{certs.length}</Text>
              <Text style={styles.statCardUnit}>Sertifikat</Text>
            </View>
          </LinearGradient>

          <View style={[styles.statCard, styles.statCardSmall]}>
            <View style={styles.statSmallIcon}>
              <Ionicons name="ribbon" size={22} color={Colors.tertiary} />
            </View>
            <Text style={styles.statSmallPeriod}>Son 30 gün</Text>
            <Text style={styles.statSmallNum}>+{newCount} Yeni</Text>
          </View>
        </View>

        {/* Cards grid */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : certs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="ribbon-outline" size={56} color={Colors.primaryFixed} />
            <Text style={styles.emptyTitle}>Sertifikat yoxdur</Text>
            <Text style={styles.emptySub}>İmtahan həll etdikdən sonra burada görünəcək. Hər yeni imtahan yeni sertifikat qazandırır.</Text>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {visible.map((cert) => {
                const b = badgeForPct(cert.percentage);
                return (
                  <TouchableOpacity
                    key={cert.id}
                    style={styles.certCard}
                    onPress={() => navigation.navigate(Routes.CertificatePreview, { examId: cert.examId })}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={[Colors.primaryFixed + '33', Colors.primary + '22']}
                      style={styles.certPreview}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={b.icon} size={48} color={Colors.primary + '88'} />
                      <View style={styles.previewBadge}>
                        <Ionicons name={b.icon} size={14} color="#f59e0b" />
                        <Text style={styles.previewBadgeText}>{b.label}</Text>
                      </View>
                    </LinearGradient>
                    <View style={styles.certInfo}>
                      <Text style={styles.certTitle} numberOfLines={2}>{cert.examTitle}</Text>
                      <View style={styles.certBottom}>
                        <View style={styles.certDateRow}>
                          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                          <Text style={styles.certDate}>{formatDate(cert.issuedAt)}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Locked placeholder card */}
              <View style={styles.lockedCard}>
                <View style={styles.lockedIconBox}>
                  <Ionicons name="lock-closed-outline" size={26} color={Colors.outline} />
                </View>
                <Text style={styles.lockedText}>Növbəti imtahanı tamamla və yeni sertifikat qazan!</Text>
              </View>
            </View>

            {hasMore ? (
              <View style={styles.loadMoreWrap}>
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  onPress={() => setShown((s) => s + PAGE_SIZE)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loadMoreText}>Daha çox göstər</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 20, gap: 20, paddingBottom: 40 },

  /* Motivational card */
  motivCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  motivMascotWrap: { position: 'relative', width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  motivAura: {
    position: 'absolute', width: 76, height: 76, borderRadius: 38,
    backgroundColor: Colors.primary + '0D',
  },
  motivMascot: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3,
  },
  motivText: { flex: 1 },
  motivTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4, letterSpacing: -0.3 },
  motivSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: 14 },
  statCard: { borderRadius: 20, padding: 18, height: 132 },
  statCardLarge: { flex: 7, justifyContent: 'space-between' },
  statCardSmall: {
    flex: 5, backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  statCardChip: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1.5 },
  statCardNumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  statCardNum: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  statCardUnit: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  statSmallIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  statSmallPeriod: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  statSmallNum: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 240, lineHeight: 20 },

  /* Grid */
  grid: { gap: 16 },
  certCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  certPreview: {
    height: 156, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  previewBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  previewBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.5, textTransform: 'uppercase' },
  certInfo: { padding: 18, gap: 14 },
  certTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  certBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  certDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  certDate: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },

  /* Locked card */
  lockedCard: {
    backgroundColor: Colors.surfaceLow + '80', borderRadius: 20, padding: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.outlineVariant + '4D',
    borderStyle: 'dashed', minHeight: 200, gap: 12,
  },
  lockedIconBox: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  lockedText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center', lineHeight: 18, maxWidth: 240 },

  /* Load more */
  loadMoreWrap: { alignItems: 'center', marginTop: 12 },
  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999,
  },
  loadMoreText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
