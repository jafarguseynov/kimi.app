import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExamStore } from '../../store/exam.store';
import { useUserStore } from '../../store/user.store';
import { getExamLeaderboard } from '../../api/leaderboard.api';
import { getExamResult } from '../../api/certificate.api';
import Confetti from '../../components/effects/Confetti';
import { playSuccess, playSoft } from '../../utils/sound';
import { useTranslation } from '../../i18n';
import { useQueryClient } from '@tanstack/react-query';
import { completeDailyChallenge } from '../../api/dailyChallenge.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamResult>;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ExamResultScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { result, pending, examId: storeExamId, resetExam, isDailyChallenge } = useExamStore();
  const user = useUserStore((s) => s.user);
  const paramExamId = route.params?.examId;
  const examId = paramExamId ?? storeExamId;
  const fromHistory = !!paramExamId && !result;
  const [rank, setRank] = useState<number | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const celebratedRef = useRef(false);
  const [fallback, setFallback] = useState<{ score: number; total: number; correct?: number; wrong?: number; unanswered?: number; percentage: number; examTitle: string; timeSpent: number; subject?: string; completedAt?: string } | null>(null);

  useEffect(() => {
    if (!fromHistory) return () => { resetExam(); };
  }, [fromHistory]);

  // ⚡ Günün çağırışı: nəticə hazır olan kimi serverə bir dəfə göndər.
  // Xalı SERVER verir (unikal (challenge,user) indeksi ilə) — burada təkrar
  // göndərilsə belə ikinci dəfə xal yazılmır, yəni "sonsuz xal" mümkün deyil.
  const dcReportedRef = useRef(false);
  useEffect(() => {
    if (fromHistory || !isDailyChallenge || !result || dcReportedRef.current) return;
    dcReportedRef.current = true;
    completeDailyChallenge(result.score, result.total)
      .then(() => {
        qc.invalidateQueries({ queryKey: ['daily-challenge'] });
        qc.invalidateQueries({ queryKey: ['user-stats'] });
      })
      .catch(() => {
        // Şəbəkə yoxdursa səssiz keç — istifadəçi nəticəsini onsuz da görür,
        // növbəti açılışda kart serverdəki həqiqi vəziyyəti göstərəcək.
      });
  }, [fromHistory, isDailyChallenge, result, qc]);

  // İmtahan sonu təntənəsi — yalnız təzə təqdimdən sonra (köhnə nəticəyə baxışda yox),
  // bir dəfə: yaxşı nəticədə aşağıdan konfeti + səs + titrəyiş, zəif nəticədə yumşaq səs.
  useEffect(() => {
    if (fromHistory || celebratedRef.current || !result) return;
    celebratedRef.current = true;
    const pct = result.percentage ?? 0;
    if (pct >= 60) {
      setShowConfetti(true);
      playSuccess();
    } else {
      playSoft();
    }
  }, [result, fromHistory]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!examId || !user?.id) return;
      try {
        const board = await getExamLeaderboard(examId);
        if (cancelled) return;
        const me = board.find((e) => e.userId === user.id);
        setRank(me?.rank ?? null);
        setTotalParticipants(board.length);
      } catch {
        if (!cancelled) setRank(null);
      }
    })();
    return () => { cancelled = true; };
  }, [examId, user?.id]);

  useEffect(() => {
    let cancelled = false;
    // Always fetch result from backend so we get fields the store doesn't
    // carry (subject, examTitle) — needed for subject-aware topic analysis.
    if (!examId) return;
    (async () => {
      try {
        const r = await getExamResult(examId);
        if (!cancelled) setFallback({ score: r.score, total: r.total, correct: r.correct, wrong: r.wrong, unanswered: r.unanswered, percentage: r.percentage, examTitle: r.examTitle, timeSpent: r.timeSpent, subject: r.subject, completedAt: r.completedAt });
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [examId]);

  // Submit nəticəsi öncə store-da (anlıq, dəqiq), sonra fallback API-dən gəlir
  const scorePercent = result?.percentage ?? fallback?.percentage ?? 0;
  const correctCount = result?.correct ?? result?.score ?? fallback?.correct ?? fallback?.score ?? 0;
  const total = result?.total ?? fallback?.total ?? 0;
  // Task 14 — boş buraxılan suallar SƏHV deyil, ayrıca sayılır.
  const unansweredCount = result?.unanswered ?? fallback?.unanswered ?? 0;
  const wrongCount = result?.wrong ?? fallback?.wrong ?? Math.max(0, total - correctCount - unansweredCount);
  const timeSpent = result?.timeSpent ?? fallback?.timeSpent ?? 0;
  // Subject — submit nəticəsində artıq gəlir (store), API fallback əlavə təhlükəsizlik
  const subjectRaw = result?.subject ?? fallback?.subject ?? '';
  const subject = subjectRaw.toLowerCase();
  const examTitle = result?.examTitle ?? fallback?.examTitle ?? t('examResult.resultFallback');
  const examDate = fallback?.completedAt ? new Date(fallback.completedAt) : new Date();
  const MONTHS = t('examResult.months').split('|');
  const examDateStr = `${examDate.getDate()} ${MONTHS[examDate.getMonth()]} ${examDate.getFullYear()}`;

  // Subject-aware topic pool. Question entity-də topic field yoxdur, ona görə
  // hər fənn üçün ümumi mövzu siyahısı saxlayırıq, score əsasında bölünür.
  const TOPIC_POOLS: { match: RegExp; label: string; topics: string[] }[] = [
    { match: /az[əe]rbaycan dili|^az(?!\w)/, label: 'Azərbaycan dili', topics: ['Morfologiya', 'Sintaksis', 'Orfoqrafiya', 'Bədii ədəbiyyat', 'İnşa'] },
    { match: /[əe]d[əe]biyyat|literature/, label: 'Ədəbiyyat', topics: ['Klassik dövr', 'Sovet dövrü', 'Müasir ədəbiyyat', 'Şeir təhlili', 'Roman təhlili'] },
    { match: /ingilis|english/, label: 'İngilis dili', topics: ['Grammar', 'Tenses', 'Reading', 'Listening', 'Writing'] },
    { match: /rus dili|russian/, label: 'Rus dili', topics: ['Грамматика', 'Лексика', 'Чтение', 'Падежи', 'Глаголы'] },
    { match: /xarici dil/, label: 'Xarici dil', topics: ['Qrammatika', 'Söz ehtiyatı', 'Oxu', 'Dinləmə', 'Yazı'] },
    { match: /fizika|physics/, label: 'Fizika', topics: ['Mexanika', 'Elektrik', 'Optika', 'Termodinamika', 'Atom fizikası'] },
    { match: /kimya|chemistry/, label: 'Kimya', topics: ['Atom', 'Reaksiyalar', 'Üzvi kimya', 'Qeyri-üzvi kimya', 'Məhlullar'] },
    { match: /biologiya|biology/, label: 'Biologiya', topics: ['Hüceyrə', 'Genetika', 'Anatomiya', 'Ekologiya', 'Bitkilər'] },
    { match: /tarix|history/, label: 'Tarix', topics: ['Qədim dövr', 'Orta əsrlər', 'Yeni dövr', 'Müasir dövr', 'Azərbaycan tarixi'] },
    { match: /co[ğg]rafiya|geography/, label: 'Coğrafiya', topics: ['Fiziki coğrafiya', 'İqtisadi coğrafiya', 'Xəritələr', 'İqlim', 'Azərbaycan coğrafiyası'] },
    { match: /informatika|informatics|computer/, label: 'İnformatika', topics: ['Alqoritmlər', 'Verilənlər bazası', 'Şəbəkələr', 'Proqramlaşdırma', 'Kompüter arxitekturası'] },
    { match: /m[əe]ntiq|logic/, label: 'Məntiq', topics: ['Sillogizm', 'Ardıcıllıqlar', 'Çıxarış', 'Şərt mülahizələr', 'Set nəzəriyyəsi'] },
    { match: /pedaqogika|psixologiya|pedagogy/, label: 'Pedaqogika', topics: ['Didaktika', 'Sinif idarəetməsi', 'Qiymətləndirmə', 'Psixologiya', 'Metodika'] },
    { match: /h[əe]yat bilgisi/, label: 'Həyat bilgisi', topics: ['Təbiət', 'Cəmiyyət', 'Sağlamlıq', 'Vətən', 'Texnologiya'] },
    { match: /riyaziyyat|c[əe]br|h[əe]nd[əe]s[əe]|math/, label: 'Riyaziyyat', topics: ['Funksiyalar', 'Həndəsə', 'Triqonometriya', 'Tənliklər', 'Vektorlar'] },
  ];

  // Mövcud subject-ə uyğun pool tap; tapılmırsa subject-in özünü label kimi göstər
  const matchedPool = TOPIC_POOLS.find((p) => p.match.test(subject));
  const subjectPool = matchedPool ?? {
    label: subjectRaw || t('examResult.examFallback'),
    topics: t('examResult.genericTopics').split('|'),
  };
  const allTopics = subjectPool.topics;
  const strongCount = scorePercent >= 75 ? Math.min(3, Math.ceil(allTopics.length / 2))
                    : scorePercent >= 50 ? 2
                    : 1;
  const strongTopics = allTopics.slice(0, strongCount);
  const weakTopics = allTopics.slice(strongCount, strongCount + 2);

  const aiAnalysis =
    scorePercent >= 85
      ? t('examResult.aiStrong', { subject: subjectPool.label })
    : scorePercent >= 60
      ? t('examResult.aiGood', { subject: subjectPool.label })
    : t('examResult.aiWeak', { subject: subjectPool.label });

  const readiness = Math.min(100, Math.round(scorePercent * 0.95 + 5));

  const handleShare = () => {
    Share.share({ message: t('examResult.shareMsg', { correct: correctCount, total }) });
  };

  // Offline-da təqdim edilib, nəticə hələ hesablanmayıb → gözləmə ekranı.
  if (pending && !result && !fromHistory) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.pendingWrap}>
          <View style={styles.pendingIcon}>
            <Ionicons name="cloud-offline-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.pendingTitle}>{t('examResult.pendingTitle')}</Text>
          <Text style={styles.pendingSub}>{t('examResult.pendingSub')}</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => { resetExam(); navigation.popToTop(); }}
            style={{ marginTop: 24, borderRadius: 999, overflow: 'hidden' }}
          >
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.pendingBtn}>
              <Text style={styles.pendingBtnText}>{t('examResult.pendingClose')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Confetti active={showConfetti} origin="bottom" onDone={() => setShowConfetti(false)} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (fromHistory ? navigation.goBack() : navigation.navigate(Routes.ExamList))}
          hitSlop={8}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('examResult.headerTitle')}</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare} hitSlop={8} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary Score Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryBlob1} />
          <View style={styles.summaryBlob2} />

          {/* Metadata row */}
          <View style={styles.metaRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              {!!subjectPool.label && (
                <View style={styles.subjectPill}>
                  <Text style={styles.subjectPillText}>{subjectPool.label}</Text>
                </View>
              )}
              <Text style={styles.examTitle} numberOfLines={2}>{examTitle}</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.dateText}>{examDateStr}</Text>
              </View>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreBoxLabel}>{t('examResult.score')}</Text>
              <Text style={styles.scoreBoxValue}>
                {total > 0 ? `${scorePercent}` : '—'}
                <Text style={styles.scoreBoxOf}> /100</Text>
              </Text>
              {total > 0 && (
                <Text style={styles.scoreBoxFraction}>{t('examResult.correctFraction', { correct: correctCount, total })}</Text>
              )}
            </View>
          </View>

          <View style={styles.summaryStatsRow}>
            <TouchableOpacity
              activeOpacity={examId ? 0.7 : 1}
              style={styles.summaryStatItem}
              disabled={!examId}
              onPress={() => examId && navigation.navigate(Routes.ExamReview, { examId, filter: 'correct' })}
            >
              <Ionicons name="checkmark-circle" size={22} color={Colors.tertiary} />
              <Text style={[styles.summaryStatValue, { color: Colors.tertiary }]}>{t('examResult.correctAnswers', { n: correctCount })}</Text>
              <Text style={styles.summaryStatLabel}>{t('examResult.answers')} {examId ? '↗' : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={examId ? 0.7 : 1}
              style={[styles.summaryStatItem, styles.summaryStatItemMid]}
              disabled={!examId}
              onPress={() => examId && navigation.navigate(Routes.ExamReview, { examId, filter: 'wrong' })}
            >
              <Ionicons name="close-circle" size={22} color={Colors.danger} />
              <Text style={[styles.summaryStatValue, { color: Colors.danger }]}>{t('examResult.wrongN', { n: wrongCount })}</Text>
              <Text style={styles.summaryStatLabel}>{t('examResult.mistakes')} {examId ? '↗' : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={examId ? 0.7 : 1}
              style={[styles.summaryStatItem, styles.summaryStatItemMid]}
              disabled={!examId}
              onPress={() => examId && navigation.navigate(Routes.ExamReview, { examId, filter: 'unanswered' })}
            >
              <Ionicons name="remove-circle" size={22} color={Colors.warning} />
              <Text style={[styles.summaryStatValue, { color: Colors.warning }]}>{t('examResult.unansweredN', { n: unansweredCount })}</Text>
              <Text style={styles.summaryStatLabel}>{t('examResult.skipped')} {examId ? '↗' : ''}</Text>
            </TouchableOpacity>
            <View style={styles.summaryStatItem}>
              <Ionicons name="time-outline" size={22} color={Colors.textSecondary} />
              <Text style={[styles.summaryStatValue, { color: Colors.textPrimary }]}>
                {timeSpent ? formatTime(timeSpent) : '—'}
              </Text>
              <Text style={styles.summaryStatLabel}>{t('examResult.time')}</Text>
            </View>
          </View>
        </View>

        {/* Kimi AI Analysis */}
        <View style={styles.aiCard}>
          <View style={styles.aiTop}>
            <LinearGradient
              colors={GRADIENT}
              style={styles.aiAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="sparkles" size={28} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <View style={styles.aiTitleRow}>
                <Text style={styles.aiTitle}>{t('examResult.aiTitle')}</Text>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>{t('examResult.smart')}</Text>
                </View>
              </View>
              <Text style={styles.aiQuote}>“{aiAnalysis}”</Text>
            </View>
          </View>
        </View>

        {/* Topic Breakdown */}
        <Text style={styles.sectionTitle}>{t('examResult.topicAnalysis')}</Text>

        <View style={styles.topicCard}>
          <View style={styles.topicHeaderRow}>
            <View style={[styles.topicIconBox, { backgroundColor: Colors.tertiary + '1A' }]}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.tertiary} />
            </View>
            <Text style={styles.topicTitle}>{t('examResult.strongTopics')}</Text>
          </View>
          <View style={styles.topicChips}>
            {strongTopics.map((t) => (
              <View key={t} style={[styles.topicChip, { backgroundColor: Colors.tertiary + '1A', borderColor: Colors.tertiary + '33' }]}>
                <Text style={[styles.topicChipText, { color: Colors.tertiary }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.topicCard}>
          <View style={styles.topicHeaderRow}>
            <View style={[styles.topicIconBox, { backgroundColor: Colors.danger + '1A' }]}>
              <Ionicons name="trending-down" size={18} color={Colors.danger} />
            </View>
            <Text style={styles.topicTitle}>{t('examResult.weakTopics')}</Text>
          </View>
          <View style={styles.topicChips}>
            {weakTopics.map((t) => (
              <View key={t} style={[styles.topicChip, { backgroundColor: Colors.danger + '15', borderColor: Colors.danger + '33' }]}>
                <Text style={[styles.topicChipText, { color: Colors.danger }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Readiness gradient card */}
        <LinearGradient
          colors={GRADIENT}
          style={styles.readyCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.readyDecorRing} />
          <View style={{ flex: 1 }}>
            <Text style={styles.readyTitle}>{t('examResult.readiness', { n: readiness })}</Text>
            <Text style={styles.readySub}>
              {rank !== null && totalParticipants > 0
                ? t('examResult.rankLine', { rank, total: totalParticipants })
                : t('examResult.nextGoal', { topic: weakTopics[0] ?? subjectPool.label })}
            </Text>
          </View>
          <View style={styles.readyCircle}>
            <Text style={styles.readyCircleText}>{readiness}</Text>
          </View>
        </LinearGradient>

        <View style={{ height: 12 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        {examId ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={{ flex: 1 }}
            onPress={() => navigation.navigate(Routes.CertificatePreview, { examId })}
          >
            <LinearGradient
              colors={GRADIENT}
              style={styles.primaryBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="ribbon" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>{t('examResult.viewCert')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.ExamList)}
        >
          <Ionicons name="refresh" size={20} color={Colors.textPrimary} />
          <Text style={styles.secondaryBtnText}>{t('examResult.retry')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pendingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  pendingIcon: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  pendingTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  pendingSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  pendingBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999 },
  pendingBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },

  scroll: { padding: 24, gap: 20, paddingBottom: 24 },

  /* Summary card */
  summaryCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  summaryBlob1: { position: 'absolute', top: -48, right: -48, width: 128, height: 128, borderRadius: 64, backgroundColor: Colors.primaryFixed + '14' },
  summaryBlob2: { position: 'absolute', bottom: -48, left: -48, width: 128, height: 128, borderRadius: 64, backgroundColor: Colors.tertiaryContainer + '20' },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', marginBottom: 22, gap: 12,
  },
  subjectPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryFixed + '1A',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    marginBottom: 8,
  },
  subjectPillText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.2, textTransform: 'uppercase' },
  examTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, marginBottom: 6, lineHeight: 23 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  scoreBox: {
    backgroundColor: Colors.primaryFixed + '0F',
    borderWidth: 1, borderColor: Colors.primaryFixed + '20',
    borderRadius: 18, paddingVertical: 14, paddingHorizontal: 14,
    alignItems: 'center', justifyContent: 'center',
    minWidth: 110,
  },
  scoreBoxLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5, marginBottom: 2 },
  scoreBoxValue: { fontSize: 26, fontWeight: '900', color: Colors.primary, letterSpacing: -0.8 },
  scoreBoxOf: { fontSize: 14, fontWeight: '700', color: Colors.primary, opacity: 0.6 },
  scoreBoxFraction: { fontSize: 11, fontWeight: '700', color: Colors.primary, opacity: 0.7, marginTop: 2 },
  summaryStatsRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingTop: 22, borderTopWidth: 1, borderTopColor: Colors.borderLight,
    width: '100%',
  },
  summaryStatItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryStatItemMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.borderLight },
  summaryStatValue: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  summaryStatLabel: { fontSize: 9, fontWeight: '800', color: Colors.outline, letterSpacing: 1.5, textTransform: 'uppercase' },

  /* AI card */
  aiCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 24, padding: 22,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  aiTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  aiAvatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 3,
  },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  aiTitle: { fontSize: 17, fontWeight: '800', color: Colors.primaryDim, letterSpacing: -0.3 },
  aiBadge: {
    backgroundColor: Colors.primaryFixed + '40',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
  },
  aiBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.primaryDim, letterSpacing: 0.5 },
  aiQuote: { fontSize: 14, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 22, fontWeight: '500' },

  /* Section title */
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, paddingHorizontal: 4, marginTop: 4 },

  /* Topic cards */
  topicCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
    gap: 14,
  },
  topicHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topicIconBox: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  topicTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  topicChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1,
  },
  topicChipText: { fontSize: 13, fontWeight: '700' },

  /* Readiness gradient card */
  readyCard: {
    borderRadius: 20, padding: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 4,
  },
  readyDecorRing: {
    position: 'absolute', bottom: -40, right: -40,
    width: 128, height: 128, borderRadius: 64,
    borderWidth: 16, borderColor: 'rgba(255,255,255,0.1)',
  },
  readyTitle: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.3, marginBottom: 2 },
  readySub: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  readyCircle: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  readyCircleText: { fontSize: 15, fontWeight: '900', color: '#fff' },

  /* Footer */
  footer: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 54, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 54, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
});
