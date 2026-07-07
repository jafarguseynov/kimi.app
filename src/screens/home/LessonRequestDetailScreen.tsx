import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { PREMIUM_ENTRY_ROUTE } from '../../config/iap';
import { HomeStackParamList } from '../../navigation/types';
import { useUserStore } from '../../store/user.store';
import {
  expressInterest,
  listOpenRequests,
  type PublicLessonRequest,
} from '../../api/lessonRequest.api';
import { useTranslation } from '../../i18n';
import SuccessOverlay from '../../components/common/SuccessOverlay';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.LessonRequestDetail>;
  route: RouteProp<HomeStackParamList, typeof Routes.LessonRequestDetail>;
};

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const DATE_LOCALE: Record<string, string> = { az: 'az-AZ', ru: 'ru-RU', en: 'en-US' };
function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE[lang] ?? 'az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function LessonRequestDetailScreen({ navigation, route }: Props) {
  const { t, language } = useTranslation();
  const { requestId } = route.params;
  const user = useUserStore((s) => s.user);
  const isTeacher = user?.role === 'teacher';
  const qc = useQueryClient();
  const [successVisible, setSuccessVisible] = useState(false);

  const { data: list = [], isLoading } = useQuery<PublicLessonRequest[]>({
    queryKey: ['openLessonRequests', 'all'],
    queryFn: () => listOpenRequests().catch(() => []),
  });

  const request = useMemo(() => list.find((r) => r.id === requestId), [list, requestId]);

  const { mutate: doInterest, isPending: interestPending } = useMutation({
    mutationFn: () => expressInterest(requestId),
    onSuccess: () => {
      setSuccessVisible(true);
      qc.invalidateQueries({ queryKey: ['openLessonRequests'] });
      qc.invalidateQueries({ queryKey: ['myLessonRequests'] });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      if (msg === 'SUBSCRIPTION_REQUIRED' || e?.response?.status === 403) {
        Alert.alert(t('lessonReqDetail.alertPremiumTitle'), t('lessonReqDetail.alertPremiumMsg'), [
          { text: t('lessonReqDetail.cancel'), style: 'cancel' },
          { text: t('lessonReqDetail.buyPlan'), onPress: () => navigation.navigate(PREMIUM_ENTRY_ROUTE) },
        ]);
      } else {
        Alert.alert(t('lessonReqDetail.alertErrorTitle'), msg || t('lessonReqDetail.alertErrorMsg'));
      }
    },
  });

  const handleCta = () => {
    if (!isTeacher) {
      Alert.alert(t('lessonReqDetail.alertTeacherTitle'), t('lessonReqDetail.alertTeacherMsg'));
      return;
    }
    doInterest();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header onBack={() => navigation.goBack()} />
        <View style={styles.centerLoad}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header onBack={() => navigation.goBack()} />
        <View style={styles.centerLoad}>
          <Ionicons name="document-text-outline" size={42} color={Colors.textMuted} />
          <Text style={styles.emptyText}>{t('lessonReqDetail.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initial = request.studentName?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero student identity */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </LinearGradient>
          </View>
          <Text style={styles.studentName}>{request.studentName}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.dateText}>{t('lessonReqDetail.requestDate', { date: formatDate(request.createdAt, language) })}</Text>
          </View>
        </View>

        {/* Main detail card */}
        <View style={styles.mainCard}>
          <View style={styles.mainTopRow}>
            <View style={styles.subjectPill}>
              <Text style={styles.subjectPillText}>{request.subject}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.budgetLabel}>{t('lessonReqDetail.budgetLabel')}</Text>
              <Text style={styles.budgetValue}>{t('lessonReqDetail.budgetValue')}</Text>
            </View>
          </View>

          {/* Learning goal */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="locate" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t('lessonReqDetail.goalTitle')}</Text>
            </View>
            <Text style={styles.goalText}>
              {request.topic || request.note || t('lessonReqDetail.goalFallback', { subject: request.subject })}
            </Text>
            {!!request.note && !!request.topic && (
              <Text style={[styles.goalText, { marginTop: 8, color: Colors.textSecondary, fontSize: 14 }]}>
                {request.note}
              </Text>
            )}
          </View>

          {/* Info bento */}
          <View style={styles.bentoRow}>
            <View style={styles.bentoCard}>
              <View style={styles.bentoIconCircle}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bentoLabel}>{t('lessonReqDetail.lessonTimeLabel')}</Text>
                <Text style={styles.bentoValue}>
                  {request.frequency ? t('lessonReqDetail.freqValue', { n: request.frequency }) : t('lessonReqDetail.byAgreement')}
                </Text>
                <Text style={styles.bentoSub}>{t('lessonReqDetail.agreedWithStudent')}</Text>
              </View>
            </View>
            <View style={styles.bentoCard}>
              <View style={styles.bentoIconCircle}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bentoLabel}>{t('lessonReqDetail.formatLabel')}</Text>
                <Text style={styles.bentoValue}>{request.format ?? t('lessonReqDetail.online')}</Text>
                {!!request.grade && <Text style={styles.bentoSub}>{request.grade}</Text>}
              </View>
            </View>
          </View>
        </View>

        {/* Interested teachers count */}
        <View style={styles.interestedHeader}>
          <Text style={styles.interestedTitle}>{t('lessonReqDetail.interestedTitle')}</Text>
          <Text style={styles.interestedCount}>{t('lessonReqDetail.peopleCount', { n: request.interestedCount })}</Text>
        </View>

        {request.interestedCount === 0 ? (
          <View style={styles.interestedEmpty}>
            <Ionicons name="people-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.interestedEmptyText}>
              {t('lessonReqDetail.emptyInterested')}
            </Text>
          </View>
        ) : (
          <View style={styles.interestedNoticeCard}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.interestedNoticeText}>
              {t('lessonReqDetail.noticeText', { n: request.interestedCount })}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleCta} disabled={interestPending}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
            {interestPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="hand-right" size={20} color="#fff" />
                <Text style={styles.ctaText}>{t('lessonReqDetail.ctaText')}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <SuccessOverlay
        visible={successVisible}
        title={t('lessonReqDetail.alertSuccessTitle')}
        message={t('lessonReqDetail.alertSuccessMsg')}
        onClose={() => setSuccessVisible(false)}
      />
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('lessonReqDetail.headerTitle')}</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="share-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  centerLoad: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120, gap: 24 },

  /* Hero */
  hero: { alignItems: 'center', gap: 8 },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatar: {
    width: 96, height: 96, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 6,
    borderWidth: 4, borderColor: '#fff',
  },
  avatarInitial: { fontSize: 36, fontWeight: '800', color: '#fff', fontStyle: 'italic' },
  studentName: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  /* Main card */
  mainCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 24, gap: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.06, shadowRadius: 32, elevation: 4,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  mainTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  subjectPill: {
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  subjectPillText: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 0.8, textTransform: 'uppercase' },
  budgetLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2 },
  budgetValue: { fontSize: 18, fontWeight: '800', color: Colors.primary, marginTop: 2 },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  goalText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 23 },

  bentoRow: { flexDirection: 'row', gap: 10 },
  bentoCard: {
    flex: 1,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.surfaceLow, borderRadius: 14, padding: 14,
  },
  bentoIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  bentoLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 3 },
  bentoValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  bentoSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  /* Interested */
  interestedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  interestedTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  interestedCount: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  interestedEmpty: {
    alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: Colors.borderLight, borderStyle: 'dashed',
  },
  interestedEmptyText: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', maxWidth: 240, lineHeight: 18 },
  interestedNoticeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLow, borderRadius: 14, padding: 14,
  },
  interestedNoticeText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  /* CTA */
  ctaBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: 20, paddingBottom: 32,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 18, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 8,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
