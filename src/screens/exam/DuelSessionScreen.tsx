import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Params = {
  mode?: 'bot' | 'live';
  opponentName?: string;
  opponentLevel?: number;
  subject?: string;
  questionCount?: number;
  stake?: number;
};

type Question = {
  text: string;
  options: string[];
  correctIndex: number;
};

const QUESTION_BANK: Record<string, Question[]> = {
  'Riyaziyyat': [
    { text: '2x + 6 = 14 tənliyini həll et. x = ?', options: ['2', '4', '5', '6'], correctIndex: 1 },
    { text: '15-in 20%-i neçədir?', options: ['2', '3', '4', '5'], correctIndex: 1 },
    { text: '√144 = ?', options: ['10', '11', '12', '14'], correctIndex: 2 },
    { text: 'Üçbucağın daxili bucaqlarının cəmi neçə dərəcədir?', options: ['90°', '180°', '270°', '360°'], correctIndex: 1 },
    { text: '7! (faktorial) neçəyə bərabərdir?', options: ['720', '5040', '40320', '362880'], correctIndex: 1 },
  ],
  'Azərbaycan Dili': [
    { text: '"Müəllim" sözünün kökü hansıdır?', options: ['Müəl', 'Müəllim', 'Elm', 'Lim'], correctIndex: 2 },
    { text: 'Hansı söz mürəkkəbdir?', options: ['Kitab', 'Günəbaxan', 'Yaşıl', 'Qaçmaq'], correctIndex: 1 },
    { text: '"-lar/-lər" hansı şəkilçidir?', options: ['Mənsubiyyət', 'Hal', 'Cəm', 'Xəbərlik'], correctIndex: 2 },
    { text: '"Vətən" sözünün antonimi var?', options: ['Bəli, qürbət', 'Xeyr', 'Yad', 'Qonşu'], correctIndex: 0 },
    { text: 'Hansı sait deyil?', options: ['A', 'O', 'K', 'Ü'], correctIndex: 2 },
  ],
  'Fizika': [
    { text: 'İşıq sürəti vakuumda neçədir?', options: ['3×10⁵ km/s', '3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s'], correctIndex: 1 },
    { text: 'Cazibə qüvvəsinin SI-da vahidi?', options: ['Coul', 'Vatt', 'Nyuton', 'Paskal'], correctIndex: 2 },
    { text: 'Suyun qaynama nöqtəsi (1 atm)?', options: ['90°C', '100°C', '110°C', '120°C'], correctIndex: 1 },
    { text: 'Om qanunu: U = ?', options: ['I·R', 'I/R', 'R/I', 'I+R'], correctIndex: 0 },
    { text: 'Atomun mərkəzində nə var?', options: ['Elektron', 'Nüvə', 'Proton buludu', 'Boşluq'], correctIndex: 1 },
  ],
  'Kimya': [
    { text: 'Suyun kimyəvi formulu?', options: ['H₂O', 'HO₂', 'H₂O₂', 'OH'], correctIndex: 0 },
    { text: 'NaCl nədir?', options: ['Şəkər', 'Xörək duzu', 'Soda', 'Sirkə'], correctIndex: 1 },
    { text: 'Mendeleyev cədvəlində ilk element?', options: ['Helium', 'Hidrogen', 'Karbon', 'Oksigen'], correctIndex: 1 },
    { text: 'pH=7 olan məhlul necədir?', options: ['Turş', 'Neytral', 'Qələvi', 'Duzlu'], correctIndex: 1 },
    { text: 'CO₂ nədir?', options: ['Karbon qazı', 'Oksigen', 'Azot', 'Metan'], correctIndex: 0 },
  ],
  'Tarix': [
    { text: 'Azərbaycan müstəqilliyini neçənci ildə bərpa edib?', options: ['1989', '1990', '1991', '1992'], correctIndex: 2 },
    { text: '"Dədə Qorqud" hansı dövrə aiddir?', options: ['XII əsr', 'IX-XI əsr', 'XV əsr', 'XX əsr'], correctIndex: 1 },
    { text: 'Cavad xan kim idi?', options: ['Şair', 'Gəncə xanı', 'Bəstəkar', 'Sərkərdə-şah'], correctIndex: 1 },
    { text: 'ADR neçənci ildə yaradılıb?', options: ['1917', '1918', '1920', '1922'], correctIndex: 1 },
    { text: 'II Dünya müharibəsi neçə il sürüb?', options: ['4', '5', '6', '7'], correctIndex: 2 },
  ],
  'İngilis Dili': [
    { text: '"Kitab" ingiliscə nədir?', options: ['Pen', 'Book', 'Door', 'Table'], correctIndex: 1 },
    { text: '"I ___ a student." Boşluğa nə gəlir?', options: ['am', 'is', 'are', 'be'], correctIndex: 0 },
    { text: '"Beautiful" sözünün antonimi?', options: ['Pretty', 'Nice', 'Ugly', 'Good'], correctIndex: 2 },
    { text: 'Past tense of "go"?', options: ['Goed', 'Went', 'Gone', 'Going'], correctIndex: 1 },
    { text: '"Sunday" həftənin neçənci günü (BE)?', options: ['1st', '7th', '6th', '5th'], correctIndex: 1 },
  ],
};

const PER_QUESTION_SECONDS = 15;
const BASE_POINTS = 10;
const SPEED_BONUS_MAX = 5;

const speedBonus = (elapsedSec: number) =>
  Math.max(0, Math.round(SPEED_BONUS_MAX * (1 - elapsedSec / PER_QUESTION_SECONDS)));

export default function DuelSessionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useUserStore();
  const { t } = useTranslation();
  const p: Params = (route.params ?? {}) as Params;

  const mode: 'bot' | 'live' = p.mode ?? 'live';
  const opponentName = p.opponentName ?? (mode === 'bot' ? 'Robo-Kimi' : 'Leyla');
  const subject = p.subject ?? 'Riyaziyyat';
  const stake = p.stake ?? 25;
  const myName = user?.name?.split(' ')[0] ?? t('duel.me');

  const bank = QUESTION_BANK[subject] ?? QUESTION_BANK['Riyaziyyat'];
  const desiredCount = p.questionCount ?? 5;
  const questions = Array.from({ length: desiredCount }, (_, i) => bank[i % bank.length]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [oppProgress, setOppProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PER_QUESTION_SECONDS);
  const [lastBonus, setLastBonus] = useState<number | null>(null);

  const myScoreRef = useRef(0);
  const oppScoreRef = useRef(0);
  const myCorrectRef = useRef(0);
  const oppCorrectRef = useRef(0);
  const revealedRef = useRef(false);
  const finishedRef = useRef(false);
  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qStartRef = useRef<number>(Date.now());

  const total = questions.length;
  const current = questions[idx];

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
    const finalMy = myScoreRef.current;
    const finalOpp = oppScoreRef.current;
    navigation.replace(Routes.CompetitionResult, {
      userScore: finalMy,
      opponentScore: finalOpp,
      userName: myName,
      opponentName,
      mode,
      userCorrect: myCorrectRef.current,
      opponentCorrect: oppCorrectRef.current,
      totalQuestions: total,
      xpEarned: finalMy > finalOpp ? stake * 2 : 0,
      medalsEarned: finalMy > finalOpp ? 2 : 0,
    });
  };

  // Opponent simulation: each question, schedule opponent answer 2-12s in
  useEffect(() => {
    if (finishedRef.current) return;
    if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
    const delay = 2000 + Math.random() * 10000;
    const accuracy = mode === 'bot' ? 0.65 : 0.7;
    opponentTimerRef.current = setTimeout(() => {
      setOppProgress((v) => v + 1);
      if (Math.random() < accuracy) {
        oppCorrectRef.current += 1;
        const pts = BASE_POINTS + speedBonus(delay / 1000);
        oppScoreRef.current += pts;
        setOppScore(oppScoreRef.current);
      }
    }, delay);
    return () => {
      if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
    };
  }, [idx]);

  // Per-question countdown
  useEffect(() => {
    if (finishedRef.current) return;
    qStartRef.current = Date.now();
    setLastBonus(null);
    setTimeLeft(PER_QUESTION_SECONDS);
    const timer = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearInterval(timer);
          if (!revealedRef.current) handleTimeout();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const handleTimeout = () => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    setLastBonus(0);
    setTimeout(advance, 900);
  };

  const handleSelect = (optionIndex: number) => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setSelected(optionIndex);
    setRevealed(true);
    if (optionIndex === current.correctIndex) {
      const elapsed = (Date.now() - qStartRef.current) / 1000;
      const bonus = speedBonus(elapsed);
      const pts = BASE_POINTS + bonus;
      myCorrectRef.current += 1;
      myScoreRef.current += pts;
      setMyScore(myScoreRef.current);
      setLastBonus(bonus);
    } else {
      setLastBonus(0);
    }
    setTimeout(advance, 900);
  };

  const advance = () => {
    revealedRef.current = false;
    setRevealed(false);
    setSelected(null);
    if (idx + 1 >= total) {
      finish();
    } else {
      setIdx((i) => i + 1);
    }
  };

  const confirmExit = () => {
    Alert.alert(t('duel.exitTitle'), t('duel.exitBody'), [
      { text: t('duel.continue'), style: 'cancel' },
      { text: t('duel.exit'), style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { confirmExit(); return true; });
    return () => sub.remove();
  }, []);

  const myProgress = idx + (revealed ? 1 : 0);
  const myPct = (myProgress / total) * 100;
  const oppPct = (oppProgress / total) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.top}>
        <TouchableOpacity style={styles.iconBtn} onPress={confirmExit} hitSlop={8} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.timerBox}>
          <Ionicons name="time" size={14} color={timeLeft < 5 ? Colors.error : Colors.primary} />
          <Text style={[styles.timerText, timeLeft < 5 && { color: Colors.error }]}>{timeLeft}s</Text>
        </View>
        <Text style={styles.qIdx}>{idx + 1}/{total}</Text>
      </View>

      {/* Players progress */}
      <View style={styles.playersRow}>
        <View style={styles.playerBlock}>
          <View style={styles.playerHead}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.playerLabel}>{myName}</Text>
            <Text style={styles.scoreText}>{myScore}</Text>
          </View>
          <View style={styles.trackBg}>
            <LinearGradient
              colors={GRADIENT}
              style={[styles.trackFill, { width: `${myPct}%` as any }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        <View style={styles.vsMini}>
          <Text style={styles.vsMiniText}>VS</Text>
        </View>

        <View style={styles.playerBlock}>
          <View style={styles.playerHead}>
            <View style={[styles.dot, { backgroundColor: mode === 'bot' ? Colors.primaryFixed : Colors.error }]} />
            <Text style={styles.playerLabel}>{opponentName}</Text>
            <Text style={styles.scoreText}>{oppScore}</Text>
          </View>
          <View style={styles.trackBg}>
            <View style={[styles.trackFillRed, { width: `${oppPct}%`, backgroundColor: mode === 'bot' ? Colors.primaryFixed : Colors.error }]} />
          </View>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionCard}>
        <View style={styles.questionTopRow}>
          <View style={styles.subjectChip}>
            <Ionicons name="book" size={12} color={Colors.primary} />
            <Text style={styles.subjectChipText}>{subject}</Text>
          </View>
          {lastBonus !== null && (
            <View style={[styles.bonusBadge, lastBonus === 0 && styles.bonusBadgeZero]}>
              <Ionicons name="flash" size={11} color={lastBonus === 0 ? Colors.textSecondary : '#F59E0B'} />
              <Text style={[styles.bonusText, lastBonus === 0 && { color: Colors.textSecondary }]}>
                {lastBonus > 0 ? `+${BASE_POINTS + lastBonus} ${t('duel.pointsUnit')}` : `0 ${t('duel.pointsUnit')}`}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.questionText}>{current.text}</Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {current.options.map((opt, i) => {
          const isPicked = selected === i;
          const isCorrect = i === current.correctIndex;
          const showCorrect = revealed && isCorrect;
          const showWrong = revealed && isPicked && !isCorrect;
          const showDim = revealed && !isCorrect && !isPicked;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.option,
                !revealed && isPicked && styles.optionActive,
                showCorrect && styles.optionCorrect,
                showWrong && styles.optionWrong,
                showDim && { opacity: 0.55 },
              ]}
              activeOpacity={0.85}
              disabled={revealed}
              onPress={() => handleSelect(i)}
            >
              <View style={styles.optionLetter}>
                <Text style={styles.optionLetterText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={[styles.optionText, (showCorrect || showWrong) && styles.optionTextLight]}>
                {opt}
              </Text>
              {showCorrect && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 'auto' }} />
              )}
              {showWrong && (
                <Ionicons name="close-circle" size={20} color="#fff" style={{ marginLeft: 'auto' }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom hint */}
      <View style={styles.bottomHint}>
        <Text style={styles.hintText}>
          {t('duel.stakeHint', { stake, prize: stake * 2 })}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  top: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  timerBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
  },
  timerText: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  qIdx: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary },

  playersRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 16,
  },
  playerBlock: { flex: 1, gap: 6 },
  playerHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  playerLabel: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  scoreText: { fontSize: 14, fontWeight: '900', color: Colors.textPrimary },
  trackBg: { height: 6, borderRadius: 3, backgroundColor: Colors.surfaceLow, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 3 },
  trackFillRed: { height: '100%', borderRadius: 3 },
  vsMini: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  vsMiniText: { fontSize: 11, fontWeight: '900', color: Colors.textSecondary },

  questionCard: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 20, gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 2,
  },
  questionTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bonusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEF3C7',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  bonusBadgeZero: { backgroundColor: Colors.surfaceLow },
  bonusText: { fontSize: 11, fontWeight: '800', color: '#92400E' },
  subjectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryFixed + '1A',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  subjectChipText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  questionText: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, lineHeight: 26 },

  options: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 2, borderColor: 'transparent',
  },
  optionActive: { borderColor: Colors.primary, backgroundColor: '#F5F8FF' },
  optionCorrect: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  optionWrong: { backgroundColor: Colors.error, borderColor: Colors.error },
  optionLetter: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  optionLetterText: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  optionText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  optionTextLight: { color: '#fff', fontWeight: '700' },

  bottomHint: {
    marginTop: 'auto',
    paddingHorizontal: 16, paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  hintText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4 },
});
