import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getCertificate, type Certificate } from '../../api/certificate.api';
import { useUserStore } from '../../store/user.store';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const STARS = [1, 2, 3, 4, 5];

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.CertificatePreview>;
  route: RouteProp<ExamStackParamList, typeof Routes.CertificatePreview>;
};

function starsForPct(pct: number) {
  if (pct >= 95) return 5;
  if (pct >= 85) return 4;
  if (pct >= 75) return 3;
  return 2;
}

export default function CertificatePreviewScreen({ navigation, route }: Props) {
  const { examId } = route.params;
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    getCertificate(examId)
      .then(setCert)
      .catch(() => setCert(null))
      .finally(() => setLoading(false));
  }, [examId]);

  const starCount = cert ? starsForPct(cert.percentage) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nəticə</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !cert ? (
        <View style={styles.center}>
          <Ionicons name="ribbon-outline" size={56} color={Colors.primaryFixed} />
          <Text style={styles.errTitle}>Sertifikat tapılmadı</Text>
          <Text style={styles.errSub}>Bu imtahan üçün sertifikat hələ verilib ya mövcud deyil.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Nəticəni paylaş</Text>
            <Text style={styles.mainSub}>Uğurlarını hər kəsə nümayiş etdir!</Text>
          </View>

          {/* Certificate Card */}
          <View style={styles.previewCard}>
            <View style={styles.previewAura} pointerEvents="none" />
            <View style={styles.previewContent}>
              <View style={styles.mascotWrap}>
                <View style={styles.mascotAura} />
                <LinearGradient colors={GRADIENT} style={styles.mascotCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Ionicons name="hardware-chip-outline" size={56} color="rgba(255,255,255,0.9)" />
                </LinearGradient>
                <View style={styles.exclamBadge}>
                  <Text style={styles.exclamText}>{cert.percentage >= 90 ? 'Əla!' : 'Uğur!'}</Text>
                </View>
              </View>

              <View style={styles.userSection}>
                <Text style={styles.congratsLabel}>Təbrik edirik!</Text>
                <Text style={styles.studentName}>{user?.name ?? 'İstifadəçi'}</Text>
                <Text style={styles.examName}>{cert.examTitle}</Text>
              </View>

              <View style={styles.scoreSection}>
                <Text style={styles.scoreValue}>
                  {cert.score}<Text style={styles.scoreTotal}>/{cert.total}</Text>
                </Text>
                <View style={styles.starsRow}>
                  {STARS.map((s) => (
                    <Ionicons key={s} name="star" size={20} color={s <= starCount ? '#F59E0B' : Colors.surfaceHigh} />
                  ))}
                </View>
                <Text style={styles.pctLabel}>{cert.percentage}%</Text>
              </View>

              <View style={styles.brandRow}>
                <View style={styles.brandBox}><Text style={styles.brandBoxText}>K.</Text></View>
                <Text style={styles.brandText}>kimi.az</Text>
              </View>
            </View>
          </View>

          <Text style={styles.shareTitle}>Dostlarınla paylaş və onları ruhlandır!</Text>

          <View style={styles.shareGrid}>
            <TouchableOpacity style={styles.shareCard} activeOpacity={0.8}>
              <View style={[styles.shareIconCircle, { backgroundColor: '#FFF0F3' }]}>
                <Ionicons name="camera-outline" size={26} color="#E91E8C" />
              </View>
              <Text style={styles.shareLabel}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareCard} activeOpacity={0.8}>
              <View style={[styles.shareIconCircle, { backgroundColor: '#F0FFF4' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={26} color="#22C55E" />
              </View>
              <Text style={styles.shareLabel}>WhatsApp</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.8}>
            <Ionicons name="download-outline" size={22} color={Colors.textPrimary} />
            <Text style={styles.downloadBtnText}>Şəkli yüklə</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  errTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  errSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 240, lineHeight: 20 },

  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48, gap: 24 },

  titleSection: { gap: 6 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  mainSub: { fontSize: 15, color: Colors.textSecondary },

  previewCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  previewAura: { position: 'absolute', top: -96, right: -96, width: 256, height: 256, borderRadius: 128, backgroundColor: Colors.primary, opacity: 0.10 },
  previewContent: { padding: 32, alignItems: 'center', gap: 20 },

  mascotWrap: { alignItems: 'center', position: 'relative' },
  mascotAura: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.primary + '0D', top: -16 },
  mascotCircle: {
    width: 128, height: 128, borderRadius: 64, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.15, shadowRadius: 32, elevation: 6,
  },
  exclamBadge: { position: 'absolute', bottom: -8, right: -8, backgroundColor: Colors.tertiaryContainer, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  exclamText: { fontSize: 10, fontWeight: '800', color: Colors.tertiary },

  userSection: { alignItems: 'center', gap: 4 },
  congratsLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 2 },
  studentName: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  examName: { fontSize: 13, color: Colors.textSecondary },

  scoreSection: { alignItems: 'center', gap: 8, backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 24, width: '100%' },
  scoreValue: { fontSize: 56, fontWeight: '900', color: Colors.primary, letterSpacing: -2, lineHeight: 64 },
  scoreTotal: { fontSize: 22, fontWeight: '700', color: Colors.textMuted },
  starsRow: { flexDirection: 'row', gap: 4 },
  pctLabel: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  brandBoxText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  brandText: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },

  shareTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },

  shareGrid: { flexDirection: 'row', gap: 16 },
  shareCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 20,
    padding: 20, alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  shareIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  shareLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  downloadBtn: {
    backgroundColor: Colors.surfaceHigh, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 60, gap: 12,
  },
  downloadBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});
