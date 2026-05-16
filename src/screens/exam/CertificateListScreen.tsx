import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getCertificates, type Certificate } from '../../api/certificate.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.CertificateList> };

function badgeForPct(pct: number): { label: string; bg: string; text: string; iconColor: string; icon: 'star' | 'trophy' | 'ribbon' } {
  if (pct >= 95) return { label: 'Excellence', bg: Colors.tertiary + '15', text: Colors.tertiary, iconColor: Colors.tertiary, icon: 'ribbon' };
  if (pct >= 85) return { label: 'Champion', bg: Colors.primaryLight, text: Colors.primary, iconColor: '#D4AF37', icon: 'trophy' };
  return { label: 'Uğur', bg: '#fffbeb', text: '#d97706', iconColor: '#f59e0b', icon: 'star' };
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

  const newCount = recent30Count(certs);

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
        {/* Motivational Card */}
        <View style={styles.motivCard}>
          <View style={styles.motivIconBox}>
            <LinearGradient colors={GRADIENT} style={styles.motivIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="ribbon-outline" size={36} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.motivText}>
            <Text style={styles.motivTitle}>Uğurlarının sayı artır!</Text>
            <Text style={styles.motivSub}>Bütün sertifikatlarını burada görə bilərsən. Səninlə fəxr edirik!</Text>
          </View>
        </View>

        {/* Stats */}
        {!loading && (
          <View style={styles.statsRow}>
            <LinearGradient colors={GRADIENT} style={[styles.statCard, styles.statCardLarge]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
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
        )}

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : certs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="ribbon-outline" size={56} color={Colors.primaryFixed} />
            <Text style={styles.emptyTitle}>Sertifikat yoxdur</Text>
            <Text style={styles.emptySub}>İmtahanda 70%+ nəticə aldıqda sertifikat qazanırsın.</Text>
          </View>
        ) : (
          certs.map((cert) => {
            const badge = badgeForPct(cert.percentage);
            return (
              <TouchableOpacity
                key={cert.id}
                style={styles.certCard}
                onPress={() => navigation.navigate(Routes.CertificatePreview, { examId: cert.examId })}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[Colors.gradientStart + '22', Colors.gradientEnd + '44']}
                  style={styles.certPreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={badge.icon} size={48} color={Colors.primary + '55'} />
                  <View style={styles.previewBadge}>
                    <Ionicons name={badge.icon} size={14} color={badge.iconColor} />
                    <Text style={styles.previewBadgeText}>{badge.label}</Text>
                  </View>
                  <View style={styles.scoreChip}>
                    <Text style={styles.scoreChipText}>{cert.percentage}%</Text>
                  </View>
                </LinearGradient>

                <View style={styles.certInfo}>
                  <Text style={styles.certSubject} numberOfLines={2}>{cert.examTitle}</Text>
                  <View style={styles.certBottom}>
                    <View style={styles.certDateRow}>
                      <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.certDate}>{formatDate(cert.issuedAt)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
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
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 20, gap: 20, paddingBottom: 40 },

  motivCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2,
  },
  motivIconBox: { flexShrink: 0 },
  motivIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  motivText: { flex: 1 },
  motivTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  motivSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  statsRow: { flexDirection: 'row', gap: 14 },
  statCard: { borderRadius: 20, padding: 20, gap: 8 },
  statCardLarge: { flex: 7 },
  statCardSmall: { flex: 5, backgroundColor: Colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  statCardChip: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 },
  statCardNumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  statCardNum: { fontSize: 36, fontWeight: '800', color: '#fff' },
  statCardUnit: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  statSmallIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.tertiaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statSmallPeriod: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  statSmallNum: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },

  empty: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 240, lineHeight: 20 },

  certCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  certPreview: { height: 140, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  previewBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  previewBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreChip: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  scoreChipText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  certInfo: { padding: 16, gap: 12 },
  certSubject: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  certBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  certDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  certDate: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
});
