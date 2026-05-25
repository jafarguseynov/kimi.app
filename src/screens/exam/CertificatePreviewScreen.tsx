import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getCertificate, getExamResult, type Certificate } from '../../api/certificate.api';
import { useUserStore } from '../../store/user.store';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const GOLD = '#D4AF37';

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.CertificatePreview>;
  route: RouteProp<ExamStackParamList, typeof Routes.CertificatePreview>;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function tierForPct(pct: number): 'Champion' | 'Excellence' | 'Uğur' {
  if (pct >= 95) return 'Champion';
  if (pct >= 85) return 'Excellence';
  return 'Uğur';
}

export default function CertificatePreviewScreen({ navigation, route }: Props) {
  const { examId } = route.params;
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    (async () => {
      try {
        const c = await getCertificate(examId);
        setCert(c);
      } catch {
        try {
          const r = await getExamResult(examId);
          setCert({
            id: r.id, examId: r.examId, examTitle: r.examTitle,
            score: r.score, total: r.total, percentage: r.percentage,
            issuedAt: r.completedAt,
          } as Certificate);
        } catch { setCert(null); }
      } finally { setLoading(false); }
    })();
  }, [examId]);

  const handleShare = async () => {
    if (!cert) return;
    try {
      await Share.share({
        message: `🎉 Kimi.az-da ${cert.examTitle} imtahanında ${cert.percentage}% nəticə əldə etdim! (${cert.score}/${cert.total})\n\nSən də sına: https://kimi.az`,
        title: 'Kimi.az Sertifikatım',
      });
    } catch { Alert.alert('Xəta', 'Paylaşma alınmadı'); }
  };

  const handleDownload = () => {
    Alert.alert('PDF yüklə', 'Sertifikat PDF kimi paylaşılacaq.', [
      { text: 'İmtina', style: 'cancel' },
      { text: 'Davam et', onPress: handleShare },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sertifikat Təfərrüatı</Text>
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
          <Text style={styles.errSub}>Bu imtahan üçün sertifikat hələ verilməyib.</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Certificate Preview Card */}
            <View style={styles.certCard}>
              {/* Decorative borders */}
              <View style={styles.borderOuter} pointerEvents="none" />
              <View style={styles.borderInner} pointerEvents="none" />

              {/* Soft background blobs */}
              <View style={styles.blob1} pointerEvents="none" />
              <View style={styles.blob2} pointerEvents="none" />

              {/* Brand */}
              <Text style={styles.brandWordmark}>
                Kimi<Text style={styles.brandAccent}>.az</Text>
              </Text>

              <Text style={styles.kicker}>MÜVƏFFƏQİYYƏT SERTİFİKATI</Text>

              <Text style={styles.intro}>Bu sertifikat təqdim olunur:</Text>
              <Text style={styles.name}>{user?.name ?? 'İstifadəçi'}</Text>

              <View style={styles.divider} />

              <Text style={styles.desc}>
                <Text style={styles.descBold}>{cert.examTitle}</Text> imtahanını{' '}
                <Text style={styles.descScore}>{cert.score}/{cert.total}</Text> nəticə ilə uğurla başa vurduğu üçün.
              </Text>

              {/* Gold champion badge */}
              <View style={styles.badgeWrap}>
                <View style={styles.badgeAura} pointerEvents="none" />
                <Ionicons name="star" size={68} color={GOLD} />
                <LinearGradient
                  colors={GRADIENT}
                  style={styles.badgePill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.badgePillText}>{tierForPct(cert.percentage)}</Text>
                </LinearGradient>
              </View>

              <View style={styles.dateBlock}>
                <Text style={styles.dateLabel}>TARİX</Text>
                <Text style={styles.dateValue}>{formatDate(cert.issuedAt)}</Text>
              </View>
            </View>

            {/* Ətraflı Məlumat */}
            <Text style={styles.sectionTitle}>Ətraflı Məlumat</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={[styles.infoIconBox, { backgroundColor: Colors.primary + '1A' }]}>
                  <Ionicons name="medal-outline" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Sertifikat növü</Text>
                  <Text style={styles.infoValue}>{tierForPct(cert.percentage)}</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <View style={[styles.infoIconBox, { backgroundColor: Colors.tertiary + '1A' }]}>
                  <Ionicons name="document-text-outline" size={22} color={Colors.tertiary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>İmtahan</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>Sınaq</Text>
                </View>
              </View>
            </View>

            {/* Hint card */}
            <View style={styles.hintCard}>
              <View style={styles.hintDecor} pointerEvents="none" />
              <View style={styles.hintIconBox}>
                <Ionicons name="bulb-outline" size={28} color={Colors.primaryDim} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hintTitle}>Möhtəşəm nəticə!</Text>
                <Text style={styles.hintSub}>
                  Siz bu kursu ən yüksək 5% tələbə sırasına daxil olaraq bitirdiniz. Sertifikatınızı PDF olaraq yükləyə və ya paylaşa bilərsiniz.
                </Text>
              </View>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }} onPress={handleDownload}>
              <LinearGradient
                colors={GRADIENT}
                style={styles.primaryBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>PDF yüklə</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare} activeOpacity={0.85}>
              <Ionicons name="share-social-outline" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </>
      )}
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  errTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  errSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260 },

  scroll: { padding: 20, paddingBottom: 24, gap: 24 },

  /* Certificate card */
  certCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24,
    padding: 32, alignItems: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.outlineVariant + '1A',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.08, shadowRadius: 40, elevation: 4,
  },
  borderOuter: {
    position: 'absolute', top: 16, left: 16, right: 16, bottom: 16,
    borderWidth: 6, borderColor: Colors.primaryFixed + '33', borderRadius: 6,
  },
  borderInner: {
    position: 'absolute', top: 24, left: 24, right: 24, bottom: 24,
    borderWidth: 1, borderColor: Colors.primary + '1A', borderRadius: 4,
  },
  blob1: {
    position: 'absolute', top: -64, right: -64,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: Colors.primary + '0D',
  },
  blob2: {
    position: 'absolute', bottom: -64, left: -64,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: Colors.primaryFixed + '1A',
  },

  brandWordmark: {
    fontSize: 22, fontWeight: '900', color: Colors.primary,
    letterSpacing: -0.5, marginBottom: 22,
  },
  brandAccent: { color: Colors.primaryFixed },
  kicker: {
    fontSize: 11, fontWeight: '800', color: Colors.outline,
    letterSpacing: 3, marginBottom: 22,
  },
  intro: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  name: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, textAlign: 'center' },

  divider: {
    width: 80, height: 1,
    backgroundColor: Colors.surfaceHighest,
    marginVertical: 24,
  },

  desc: {
    fontSize: 13, color: Colors.textSecondary,
    textAlign: 'center', maxWidth: 280, lineHeight: 22, marginBottom: 28,
  },
  descBold: { fontWeight: '700', color: Colors.primary },
  descScore: { fontWeight: '800', color: Colors.textPrimary },

  /* Badge */
  badgeWrap: {
    width: 100, height: 100,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', marginBottom: 28,
  },
  badgeAura: {
    position: 'absolute', inset: 0 as any,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primary + '14',
  },
  badgePill: {
    position: 'absolute', bottom: -6,
    paddingHorizontal: 14, paddingVertical: 4, borderRadius: 999,
  },
  badgePillText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1, textTransform: 'uppercase' },

  dateBlock: { alignItems: 'center', gap: 2 },
  dateLabel: { fontSize: 9, fontWeight: '700', color: Colors.outline, letterSpacing: 1.5 },
  dateValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  /* Info section */
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, paddingHorizontal: 4 },
  infoGrid: { gap: 12 },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '600', color: Colors.outline, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },

  /* Hint card */
  hintCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 20,
    overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  hintDecor: {
    position: 'absolute', right: -20, top: 0, bottom: 0,
    width: 80, backgroundColor: Colors.primary + '0D',
    transform: [{ skewX: '-12deg' }],
  },
  hintIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primary + '14',
    alignItems: 'center', justifyContent: 'center',
  },
  hintTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2, marginBottom: 4 },
  hintSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  /* Footer */
  footer: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 56, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 18, elevation: 4,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  iconBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
});
