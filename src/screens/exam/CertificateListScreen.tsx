import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getCertificates, type Certificate } from '../../api/certificate.api';
import { useTranslation } from '../../i18n';
import { useMarkBadgeSeen } from '../../hooks/useBadges';
import Skeleton from '../../components/common/Skeleton';
import CertificateStats from '../../components/certificate/CertificateStats';
import NextAchievementCard from '../../components/certificate/NextAchievementCard';
import CertificateCard from '../../components/certificate/CertificateCard';
import CertificateEmptyState from '../../components/certificate/CertificateEmptyState';

/**
 * NAİLİYYƏT MƏRKƏZİ (əvvəl sadəcə «sertifikat siyahısı»).
 *
 * Quruluş: hero + CTA → real statistika → növbəti nailiyyət → sertifikatlar.
 * Bütün rəqəmlər `GET /exam/certificates` cavabından hesablanır — sabit dəyər
 * yoxdur (bax [CertificateStats], [NextAchievementCard]).
 *
 * Ekran həm İmtahanlar, həm də Profil stack-ində qeydiyyatdadır, ona görə
 * «İmtahanlara bax» keçidi VALIDEYN naviqator üzərindən Exams tabına gedir —
 * yalnız bir stack-də mövcud olan route-a birbaşa keçid etmir.
 */
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const PAGE_SIZE = 8;
const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

type Props = { navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.CertificateList> };

export default function CertificateListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const markSeen = useMarkBadgeSeen();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);

  const listFade = useRef(new Animated.Value(0)).current;

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
      markSeen('certificates');
    }, [markSeen]),
  );

  useEffect(() => {
    if (loading) return;
    listFade.setValue(0);
    Animated.timing(listFade, {
      toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();
  }, [loading, listFade]);

  /** İmtahanlar tabı — hər iki giriş nöqtəsindən işləyir. */
  const goExams = useCallback(() => {
    (navigation.getParent() as any)?.navigate('Exams');
  }, [navigation]);

  /** Sertifikatı yüksəltmək üçün həmin imtahanın hazırlıq ekranı. */
  const goRetake = useCallback((cert: Certificate) => {
    (navigation.getParent() as any)?.navigate('Exams', {
      screen: Routes.ExamDetail,
      params: { examId: cert.examId, title: cert.examTitle, subject: cert.subject ?? undefined },
      initial: false,
    });
  }, [navigation]);

  const visible = useMemo(() => certs.slice(0, shown), [certs, shown]);
  const hasMore = shown < certs.length;
  const newThreshold = Date.now() - NEW_WINDOW_MS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('cert.listTitle')}</Text>
          <Text style={styles.headerSub}>{t('cert.listSubtitle')}</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
      >
        {/* Hero — qısa, bir CTA */}
        <View style={styles.hero}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.heroTitle}>{t('cert.heroTitle')}</Text>
            <Text style={styles.heroSub}>{t('cert.heroSub')}</Text>
            <TouchableOpacity activeOpacity={0.9} onPress={goExams} style={{ alignSelf: 'flex-start', marginTop: 10 }}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>{t('cert.heroCta')}</Text>
                <Ionicons name="arrow-forward" size={15} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <>
            <View style={styles.skelRow}>
              <View style={styles.skelStat}><Skeleton width="60%" height={26} /><Skeleton width="80%" height={11} style={{ marginTop: 8 }} /></View>
              <View style={styles.skelStat}><Skeleton width="60%" height={26} /><Skeleton width="80%" height={11} style={{ marginTop: 8 }} /></View>
            </View>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skelCard}>
                <Skeleton width="35%" height={18} radius={999} />
                <Skeleton width="85%" height={16} style={{ marginTop: 12 }} />
                <Skeleton width="55%" height={12} style={{ marginTop: 8 }} />
                <Skeleton width="70%" height={12} style={{ marginTop: 12 }} />
              </View>
            ))}
          </>
        ) : certs.length === 0 ? (
          <CertificateEmptyState onBrowse={goExams} />
        ) : (
          <Animated.View style={{ gap: 20, opacity: listFade }}>
            <CertificateStats certs={certs} />

            <NextAchievementCard certs={certs} onRetake={goRetake} onBrowse={goExams} />

            <View style={{ gap: 12 }}>
              <Text style={styles.sectionTitle}>
                {t('cert.allTitle', { n: certs.length })}
              </Text>
              {visible.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  cert={cert}
                  isNew={new Date(cert.issuedAt).getTime() > newThreshold}
                  onPress={() => navigation.navigate(Routes.CertificatePreview, { examId: cert.examId })}
                />
              ))}

              {hasMore && (
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  onPress={() => setShown((s) => s + PAGE_SIZE)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loadMoreText}>{t('cert.loadMore')}</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginTop: 1 },

  scroll: { padding: 20, gap: 20, paddingBottom: 40 },

  /* Hero */
  hero: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2,
  },
  heroTitle: { fontSize: 19, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.4 },
  heroSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  heroBtn: {
    height: 44, paddingHorizontal: 20, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3,
  },
  heroBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },

  /* Skeleton */
  skelRow: { flexDirection: 'row', gap: 10 },
  skelStat: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  skelCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },

  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, borderRadius: 999,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  loadMoreText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
});
