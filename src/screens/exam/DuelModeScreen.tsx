import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Mode = 'bot' | 'live';

const SUBJECTS = [
  { key: 'Riyaziyyat', icon: 'calculator' as const },
  { key: 'Azərbaycan Dili', icon: 'book' as const },
  { key: 'Fizika', icon: 'flash' as const },
  { key: 'Kimya', icon: 'flask' as const },
  { key: 'Tarix', icon: 'time' as const },
  { key: 'İngilis Dili', icon: 'language' as const },
];

const STAKES = [10, 25, 50];
const QUESTION_COUNTS = [5, 10, 15, 20];

const BOT_NAMES = ['Robo-Kimi', 'AI Murad', 'Beyin-Bot', 'Cyber-Aysu'];

export default function DuelModeScreen() {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState<Mode>('bot');
  const [subject, setSubject] = useState<string>('Riyaziyyat');
  const [stake, setStake] = useState<number>(25);
  const [questionCount, setQuestionCount] = useState<number>(10);

  const start = () => {
    if (mode === 'bot') {
      const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      navigation.replace(Routes.DuelMatch, {
        mode: 'bot',
        opponentName: botName,
        opponentLevel: 12,
        subject,
        questionCount,
        prize: stake * 2,
        stake,
      });
    } else {
      navigation.replace(Routes.DuelMatch, {
        mode: 'live',
        subject,
        questionCount,
        prize: stake * 2,
        stake,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Duel hazırlığı</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => navigation.navigate(Routes.DuelHistory)}
          >
            <Ionicons name="time-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() =>
              Alert.alert(
                'Duel necə işləyir?',
                '• Rejim seç: Bot anında hazırdır, Canlı rejim sənin səviyyəndə real şagird tapır.\n• Mövzu seç — yalnız o mövzuda suallar gəlir.\n• Mərc qoy — qalib hər iki tərəfin XP-sini götürür.\n• Qalib daha çox doğru cavab + daha sürətli olan tələbədir.',
                [{ text: 'Anladım' }],
              )
            }
          >
            <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step 1: Mode */}
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={styles.stepTitle}>Rejim seç</Text>
          </View>

          <View style={{ gap: 12 }}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => setMode('bot')}>
              <View style={[styles.modeCard, mode === 'bot' && styles.modeCardActive]}>
                <View style={[styles.modeIcon, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="hardware-chip" size={26} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.modeTitleRow}>
                    <Text style={styles.modeTitle}>Bot ilə yarış</Text>
                    <View style={styles.fastChip}><Text style={styles.fastChipText}>ANINDA</Text></View>
                  </View>
                  <Text style={styles.modeSub}>AI rəqib səviyyənə uyğun seçilir, gözləməyə ehtiyac yox.</Text>
                </View>
                <View style={[styles.radio, mode === 'bot' && styles.radioActive]}>
                  {mode === 'bot' && <View style={styles.radioDot} />}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={() => setMode('live')}>
              <View style={[styles.modeCard, mode === 'live' && styles.modeCardActive]}>
                <View style={[styles.modeIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="people" size={26} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.modeTitleRow}>
                    <Text style={styles.modeTitle}>Canlı rəqib</Text>
                    <View style={styles.liveChip}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveChipText}>REAL</Text>
                    </View>
                  </View>
                  <Text style={styles.modeSub}>Sənin səviyyəndə başqa bir şagirdlə real vaxtda yarış.</Text>
                </View>
                <View style={[styles.radio, mode === 'live' && styles.radioActive]}>
                  {mode === 'live' && <View style={styles.radioDot} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Step 2: Subject */}
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={styles.stepTitle}>Mövzu</Text>
          </View>
          <View style={styles.chipGrid}>
            {SUBJECTS.map((s) => {
              const active = subject === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  activeOpacity={0.85}
                  onPress={() => setSubject(s.key)}
                  style={[styles.subjectChip, active && styles.subjectChipActive]}
                >
                  <Ionicons
                    name={s.icon}
                    size={16}
                    color={active ? '#fff' : Colors.primary}
                  />
                  <Text style={[styles.subjectChipText, active && styles.subjectChipTextActive]}>
                    {s.key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 3: Question count */}
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
            <Text style={styles.stepTitle}>Sual sayı</Text>
          </View>
          <View style={styles.qcRow}>
            {QUESTION_COUNTS.map((n) => {
              const active = questionCount === n;
              return (
                <TouchableOpacity
                  key={n}
                  activeOpacity={0.9}
                  onPress={() => setQuestionCount(n)}
                  style={[styles.qcCard, active && styles.qcCardActive]}
                >
                  <Text style={[styles.qcValue, active && { color: '#fff' }]}>{n}</Text>
                  <Text style={[styles.qcLabel, active && { color: 'rgba(255,255,255,0.85)' }]}>sual</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.qcNote}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.qcNoteText}>
              Hər sual <Text style={{ fontWeight: '800' }}>15 saniyə</Text> • təxmini müddət{' '}
              <Text style={{ fontWeight: '800' }}>~{Math.ceil((questionCount * 15) / 60)} dəq</Text>
            </Text>
          </View>
        </View>

        {/* Step 4: Stake */}
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>4</Text></View>
            <Text style={styles.stepTitle}>XP mərc</Text>
          </View>
          <View style={styles.stakeRow}>
            {STAKES.map((s) => {
              const active = stake === s;
              return (
                <TouchableOpacity
                  key={s}
                  activeOpacity={0.9}
                  onPress={() => setStake(s)}
                  style={[styles.stakeCard, active && styles.stakeCardActive]}
                >
                  <Ionicons name="flash" size={20} color={active ? '#fff' : '#F59E0B'} />
                  <Text style={[styles.stakeValue, active && { color: '#fff' }]}>{s}</Text>
                  <Text style={[styles.stakeLabel, active && { color: 'rgba(255,255,255,0.85)' }]}>XP</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.prizeNote}>
            <Ionicons name="trophy" size={14} color={Colors.primary} />
            <Text style={styles.prizeNoteText}>
              Qalib <Text style={{ fontWeight: '800' }}>{stake * 2} XP</Text> qazanır
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={start} style={{ marginTop: 8 }}>
          <LinearGradient
            colors={GRADIENT}
            style={styles.cta}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name="flash" size={18} color="#fff" />
            <Text style={styles.ctaText}>
              {mode === 'bot' ? 'Botla başla' : 'Rəqib axtar'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },

  scroll: { padding: 20, paddingBottom: 40, gap: 24 },

  section: { gap: 14 },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  stepTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },

  modeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 18, padding: 16,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  modeCardActive: { borderColor: Colors.primary, backgroundColor: '#F5F8FF' },
  modeIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  modeTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  modeSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  fastChip: { backgroundColor: '#DCFCE7', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  fastChipText: { fontSize: 9, fontWeight: '800', color: '#15803D', letterSpacing: 0.6 },
  liveChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEE2E2', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DC2626' },
  liveChipText: { fontSize: 9, fontWeight: '800', color: '#991B1B', letterSpacing: 0.6 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: 'transparent',
  },
  subjectChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  subjectChipText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  subjectChipTextActive: { color: '#fff' },

  stakeRow: { flexDirection: 'row', gap: 10 },
  stakeCard: {
    flex: 1, alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, paddingVertical: 16,
    borderWidth: 2, borderColor: 'transparent',
  },
  stakeCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stakeValue: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, marginTop: 2 },
  stakeLabel: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2 },
  prizeNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryFixed + '14',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  prizeNoteText: { fontSize: 12, color: Colors.textSecondary },

  qcRow: { flexDirection: 'row', gap: 10 },
  qcCard: {
    flex: 1, alignItems: 'center', gap: 2,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, paddingVertical: 14,
    borderWidth: 2, borderColor: 'transparent',
  },
  qcCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  qcValue: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary },
  qcLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8 },
  qcNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  qcNoteText: { fontSize: 12, color: Colors.textSecondary },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  ctaText: { fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
});
