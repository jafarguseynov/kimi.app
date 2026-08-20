import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { createDuelInvite } from '../../api/duel.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Mode = 'bot' | 'live';

const SUBJECTS = [
  { key: 'Riyaziyyat', tKey: 'examFilter.subjMath', icon: 'calculator' as const },
  { key: 'Azərbaycan Dili', tKey: 'examFilter.subjAz', icon: 'book' as const },
  { key: 'Fizika', tKey: 'examFilter.subjPhysics', icon: 'flash' as const },
  { key: 'Kimya', tKey: 'examFilter.subjChem', icon: 'flask' as const },
  { key: 'Tarix', tKey: 'examFilter.subjHistory', icon: 'time' as const },
  { key: 'İngilis Dili', tKey: 'examFilter.subjEn', icon: 'language' as const },
];

const STAKES = [10, 25, 50];
const QUESTION_COUNTS = [5, 10, 15, 20];

const BOT_NAMES = ['Robo-Kimi', 'AI Murad', 'Beyin-Bot', 'Cyber-Aysu'];

export default function DuelModeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  // Dostdan-dosta çağırış: MyFriends "Yarış" düyməsindən gəlir.
  const challengeFriend: { id: string; name: string } | undefined = route.params?.challengeFriend;
  const [mode, setMode] = useState<Mode>(challengeFriend ? 'live' : 'bot');
  const [subject, setSubject] = useState<string>('Riyaziyyat');
  const [stake, setStake] = useState<number>(25);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [sending, setSending] = useState(false);

  const start = async () => {
    // Dosta adresli çağırış → real dəvət yarat, sonra xüsusi növbədə gözlə.
    if (challengeFriend) {
      if (sending) return;
      setSending(true);
      try {
        const invite = await createDuelInvite(challengeFriend.id, { subject, questionCount, stake });
        navigation.replace(Routes.DuelMatch, {
          mode: 'live',
          opponentName: challengeFriend.name,
          subject,
          questionCount,
          prize: stake * 2,
          stake,
          inviteCode: invite.id,
        });
      } catch (e: any) {
        Alert.alert(
          t('duel.prep'),
          e?.response?.data?.message || t('duel.inviteFailed'),
        );
      } finally {
        setSending(false);
      }
      return;
    }

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
        <Text style={styles.headerTitle}>{t('duel.prep')}</Text>
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
                t('duel.howTitle'),
                t('duel.howBody'),
                [{ text: t('duel.gotIt') }],
              )
            }
          >
            <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Dosta çağırış başlığı */}
        {challengeFriend && (
          <View style={styles.friendBanner}>
            <View style={styles.friendBannerIcon}>
              <Ionicons name="flash" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.friendBannerTitle}>{t('duel.inviteFriendTitle', { name: challengeFriend.name })}</Text>
              <Text style={styles.friendBannerSub}>{t('duel.inviteFriendSub')}</Text>
            </View>
          </View>
        )}

        {/* Step 1: Mode */}
        {!challengeFriend && (
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={styles.stepTitle}>{t('duel.step1')}</Text>
          </View>

          <View style={{ gap: 12 }}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => setMode('bot')}>
              <View style={[styles.modeCard, mode === 'bot' && styles.modeCardActive]}>
                <View style={[styles.modeIcon, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="hardware-chip" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.modeTitleRow}>
                    <Text style={styles.modeTitle}>{t('duel.botTitle')}</Text>
                    <View style={styles.fastChip}><Text style={styles.fastChipText}>{t('duel.instant')}</Text></View>
                  </View>
                  <Text style={styles.modeSub}>{t('duel.botSub')}</Text>
                </View>
                <View style={[styles.radio, mode === 'bot' && styles.radioActive]}>
                  {mode === 'bot' && <View style={styles.radioDot} />}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={() => setMode('live')}>
              <View style={[styles.modeCard, mode === 'live' && styles.modeCardActive]}>
                <View style={[styles.modeIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="people" size={22} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.modeTitleRow}>
                    <Text style={styles.modeTitle}>{t('duel.liveTitle')}</Text>
                    <View style={styles.liveChip}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveChipText}>{t('duel.real')}</Text>
                    </View>
                  </View>
                  <Text style={styles.modeSub}>{t('duel.liveSub')}</Text>
                </View>
                <View style={[styles.radio, mode === 'live' && styles.radioActive]}>
                  {mode === 'live' && <View style={styles.radioDot} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        )}

        {/* Step 2: Subject */}
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={styles.stepTitle}>{t('duel.step2')}</Text>
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
                    {t(s.tKey)}
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
            <Text style={styles.stepTitle}>{t('duel.step3')}</Text>
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
                  <Text style={[styles.qcLabel, active && { color: 'rgba(255,255,255,0.85)' }]}>{t('duel.qUnit')}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.qcNote}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.qcNoteText}>
              {t('duel.perQPre')}<Text style={{ fontWeight: '800' }}>{t('duel.perQSeconds')}</Text>{t('duel.perQMid')}
              <Text style={{ fontWeight: '800' }}>{t('duel.perQApprox', { n: Math.ceil((questionCount * 15) / 60) })}</Text>
            </Text>
          </View>
        </View>

        {/* Step 4: Stake */}
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>4</Text></View>
            <Text style={styles.stepTitle}>{t('duel.step4')}</Text>
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
                  <Ionicons name="flash" size={18} color={active ? '#fff' : '#F59E0B'} />
                  <Text style={[styles.stakeValue, active && { color: '#fff' }]}>{s}</Text>
                  <Text style={[styles.stakeLabel, active && { color: 'rgba(255,255,255,0.85)' }]}>{t('duel.xpUnit')}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.prizeNote}>
            <Ionicons name="trophy" size={14} color={Colors.primary} />
            <Text style={styles.prizeNoteText}>
              {t('duel.prizePre')}<Text style={{ fontWeight: '800' }}>{t('duel.prizeXp', { n: stake * 2 })}</Text>{t('duel.prizePost')}
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={start} disabled={sending} style={{ marginTop: 8 }}>
          <LinearGradient
            colors={GRADIENT}
            style={styles.cta}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name="flash" size={18} color="#fff" />
            <Text style={styles.ctaText}>
              {sending
                ? t('duel.waitDots')
                : challengeFriend
                ? t('duel.inviteFriendCta', { name: challengeFriend.name })
                : mode === 'bot'
                ? t('duel.startBot')
                : t('duel.findOpponent')}
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

  scroll: { padding: 18, paddingBottom: 36, gap: 22 },

  section: { gap: 12 },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  stepNum: {
    width: 22, height: 22, borderRadius: 7,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: 12, fontWeight: '900', color: Colors.primary },
  stepTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },

  modeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, padding: 13,
    borderWidth: 1.5, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 1,
  },
  modeCardActive: { borderColor: Colors.primary, backgroundColor: '#F5F8FF' },
  modeIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  modeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  modeTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  modeSub: { fontSize: 11.5, color: Colors.textSecondary, lineHeight: 16 },
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
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  subjectChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  subjectChipText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  subjectChipTextActive: { color: '#fff' },

  stakeRow: { flexDirection: 'row', gap: 9 },
  stakeCard: {
    flex: 1, alignItems: 'center', gap: 3,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: Colors.borderLight,
  },
  stakeCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stakeValue: { fontSize: 19, fontWeight: '900', color: Colors.textPrimary, marginTop: 1 },
  stakeLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2 },
  prizeNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryFixed + '14',
    borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9,
  },
  prizeNoteText: { fontSize: 11.5, color: Colors.textSecondary },

  qcRow: { flexDirection: 'row', gap: 9 },
  qcCard: {
    flex: 1, alignItems: 'center', gap: 1,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: Colors.borderLight,
  },
  qcCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  qcValue: { fontSize: 19, fontWeight: '900', color: Colors.textPrimary },
  qcLabel: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8 },
  qcNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9,
  },
  qcNoteText: { fontSize: 11.5, color: Colors.textSecondary },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 16, paddingVertical: 15,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 18, elevation: 6,
  },
  ctaText: { fontSize: 14.5, fontWeight: '900', color: '#fff', letterSpacing: 0.4 },

  friendBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  friendBannerIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  friendBannerTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  friendBannerSub: { fontSize: 11.5, color: Colors.textSecondary, marginTop: 2 },
});
