import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getCertificate, getExamResult, certificateVerifyUrl, type Certificate } from '../../api/certificate.api';
import { tierOfCertificate } from '../../utils/certificateTier';
import CertificatePreview from '../../components/certificate/CertificatePreview';
import { azOrdinal } from '../../utils/certificateMeta';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.CertificatePreview>;
  route: RouteProp<ExamStackParamList, typeof Routes.CertificatePreview>;
};

export default function CertificatePreviewScreen({ navigation, route }: Props) {
  const { t, language } = useTranslation();
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
        message: t('cert.shareMsg', {
          title: cert.examTitle,
          pct: cert.percentage,
          score: cert.score,
          total: cert.total,
          link: certificateVerifyUrl(cert.id),
        }),
        title: t('cert.shareTitle'),
      });
    } catch { Alert.alert(t('cert.errorTitle'), t('cert.shareFailed')); }
  };

  /**
   * «Sertifikatı aç» — ictimai yoxlama səhifəsi sistem brauzerində açılır.
   *
   * ⚠️ Burada `expo-web-browser` İŞLƏDİLMİR: o, native modul olmasına baxmayaraq
   * mövcud native buildə daxil deyil (`ios/Podfile.lock`-da ExpoWebBrowser yoxdur) —
   * import edildikdə ekran «Cannot find native module 'ExpoWebBrowser'» ilə açılmır.
   * `Linking` React Native nüvəsindədir, yəni OTA ilə gedir və hər buildə var.
   * (Eyni səbəbdən `useGoogleSignIn` də həmin paketi lazy `require` ilə çağırır.)
   *
   * Real PDF yükləmə üçün `expo-print` lazımdır və o, YENİ STORE BUILD tələb edir.
   */
  const openVerification = async () => {
    if (!cert) return;
    const url = certificateVerifyUrl(cert.id);
    try {
      const ok = await Linking.canOpenURL(url);
      if (!ok) throw new Error('cannot open');
      await Linking.openURL(url);
    } catch { Alert.alert(t('cert.errorTitle'), t('cert.openFailed')); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('cert.previewTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !cert ? (
        <View style={styles.center}>
          <Ionicons name="ribbon-outline" size={56} color={Colors.primaryFixed} />
          <Text style={styles.errTitle}>{t('cert.notFoundTitle')}</Text>
          <Text style={styles.errSub}>{t('cert.notFoundSub')}</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Sertifikatın özü — paylaşıla bilən əsas vizual (komponent) */}
            <CertificatePreview cert={cert} studentName={user?.name ?? t('cert.userFallback')} />

            {/* Ətraflı Məlumat */}
            <Text style={styles.sectionTitle}>{t('cert.details')}</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={[styles.infoIconBox, { backgroundColor: Colors.primary + '1A' }]}>
                  <Ionicons name="medal-outline" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('cert.certType')}</Text>
                  <Text style={styles.infoValue}>{t(tierOfCertificate(cert).labelKey)}</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <View style={[styles.infoIconBox, { backgroundColor: Colors.tertiary + '1A' }]}>
                  <Ionicons name="stats-chart-outline" size={22} color={Colors.tertiary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('cert.resultLabel')}</Text>
                  <Text style={styles.infoValue}>{cert.percentage}% ({cert.score}/{cert.total})</Text>
                </View>
              </View>
              {/* Fənn/sinif YALNIZ backend göndərdikdə — boş sətir yaradılmır. */}
              {!!(cert.subject || cert.grade) && (
                <View style={styles.infoCard}>
                  <View style={[styles.infoIconBox, { backgroundColor: Colors.primary + '1A' }]}>
                    <Ionicons name="book-outline" size={22} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>{t('cert.subjectLabel')}</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {[cert.subject, cert.grade ? t('cert.gradeLabel', {
                        grade: language === 'az' ? azOrdinal(cert.grade) : cert.grade,
                      }) : null].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
              )}
              {/* Yoxlama kodu — sertifikatın üzərindəki və ictimai səhifədəki
                  nömrə ilə EYNİ (xam UUID göstərilmir). */}
              <View style={styles.infoCard}>
                <View style={[styles.infoIconBox, { backgroundColor: Colors.tertiary + '1A' }]}>
                  <Ionicons name="shield-checkmark-outline" size={22} color={Colors.tertiary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('cert.verifyLabel')}</Text>
                  <Text style={styles.verifyCode} numberOfLines={1}>{cert.certificateNo ?? cert.id}</Text>
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
                <Text style={styles.hintTitle}>{t('cert.hintTitle')}</Text>
                <Text style={styles.hintSub}>
                  {t('cert.hintSub')}
                </Text>
              </View>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }} onPress={handleShare}>
              <LinearGradient
                colors={GRADIENT}
                style={styles.primaryBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="share-social-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>{t('cert.shareCta')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={openVerification} activeOpacity={0.85}>
              <Ionicons name="open-outline" size={22} color={Colors.textPrimary} />
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

  /* Badge */

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
  verifyCode: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.2 },

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
