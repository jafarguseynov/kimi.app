import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { GamificationState } from '../../api/gamification.api';

interface Props {
  visible: boolean;
  onClose: () => void;
  data: GamificationState;
}

/**
 * "Bura nədir, necə işləyir?" — bölmənin izahı.
 *
 * Bütün rəqəmlər (neçə XP, neçə gün, hansı liqa) `data`-dan, yəni SERVERDƏN
 * gəlir. Mətnə heç bir rəqəm sabit yazılmır: qaydalar dəyişsə izah da dəyişir,
 * şagird yanlış məlumat oxumur.
 */
export default function ProgressInfoSheet({ visible, onClose, data }: Props) {
  const { t } = useTranslation();
  const r = data.rules;

  const Row = ({ icon, text, xp }: { icon: string; text: string; xp?: string }) => (
    <View style={s.row}>
      <Text style={s.rowIcon}>{icon}</Text>
      <Text style={s.rowText}>{text}</Text>
      {!!xp && <Text style={s.rowXp}>{xp}</Text>}
    </View>
  );

  const Section = ({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) => (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{emoji} {title}</Text>
      {children}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.title}>{t('progress.infoTitle')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
            <Text style={s.intro}>{t('progress.infoIntro')}</Text>

            {/* XP */}
            <Section emoji="⚡" title={t('progress.infoXpTitle')}>
              <Text style={s.p}>{t('progress.infoXpBody')}</Text>
              <Row icon="✅" text={t('progress.infoXpCorrect')} xp={`+${r.xp.questionCorrect}`} />
              <Row icon="📝" text={t('progress.infoXpExam')} xp={`+${r.xp.examCompleted}`} />
              <Row icon="🌟" text={t('progress.infoXpHigh')} xp={`+${r.xp.examHighScore}`} />
              <Row icon="🎯" text={t('progress.infoXpGoal')} xp={`+${r.xp.dailyGoal}`} />
              <Row icon="🔥" text={t('progress.infoXpStreak')} xp={`+${r.streakMilestones[0]?.bonusXp ?? 0}…`} />
              <Row icon="⚔️" text={t('progress.infoXpOther')} />
              <Text style={s.note}>{t('progress.infoXpNote')}</Text>
            </Section>

            {/* Səviyyə */}
            <Section emoji="🎖️" title={t('progress.infoLevelTitle')}>
              <Text style={s.p}>{t('progress.infoLevelBody', { xp: r.xpPerLevel })}</Text>
              <Text style={s.p}>
                {t('progress.infoLevelNow', {
                  level: data.level,
                  xp: data.xpToNextLevel.toLocaleString(),
                })}
              </Text>
            </Section>

            {/* Streak */}
            <Section emoji="🔥" title={t('progress.infoStreakTitle')}>
              <Text style={s.p}>{t('progress.infoStreakBody')}</Text>
              <Text style={s.p}>{t('progress.infoStreakSame')}</Text>
              <View style={s.chips}>
                {r.streakMilestones.map((m) => (
                  <View key={m.days} style={s.chip}>
                    <Text style={s.chipText}>
                      {t('progress.streakDays', { count: m.days })} · +{m.bonusXp} XP
                    </Text>
                  </View>
                ))}
              </View>
            </Section>

            {/* Liqa */}
            <Section emoji="🏆" title={t('progress.infoLeagueTitle')}>
              <Text style={s.p}>{t('progress.infoLeagueBody')}</Text>
              {/* Liqanın ayrı valyuta OLMADIĞI açıq deyilir */}
              <Text style={s.p}>{t('progress.leagueRelation')}</Text>
              {data.league.leagues.map((l) => (
                <Row
                  key={l.key}
                  icon={l.emoji}
                  text={l.title}
                  xp={l.minWeeklyXp === 0 ? t('progress.infoLeagueStart') : `${l.minWeeklyXp}+ XP`}
                />
              ))}
              <Text style={s.note}>{t('progress.infoLeagueNote')}</Text>
            </Section>

            {/* Reytinq */}
            <Section emoji="⭐" title={t('progress.infoRankTitle')}>
              <Text style={s.p}>{t('progress.infoRankBody')}</Text>
              <Text style={s.note}>{t('progress.infoRankNote')}</Text>
            </Section>

            {/* Gündəlik hədəf */}
            <Section emoji="🎯" title={t('progress.infoGoalTitle')}>
              <Text style={s.p}>
                {t('progress.infoGoalBody', {
                  target: data.dailyGoal.target,
                  xp: data.dailyGoal.rewardXp,
                })}
              </Text>
              <Text style={s.note}>{t('progress.infoGoalNote')}</Text>
            </Section>

            {/* Nailiyyətlər */}
            <Section emoji="🏅" title={t('progress.infoBadgeTitle')}>
              <Text style={s.p}>{t('progress.infoBadgeBody')}</Text>
              <View style={s.chips}>
                {data.achievements.map((a) => (
                  <View key={a.key} style={[s.chip, a.unlocked && s.chipOn]}>
                    <Text style={[s.chipText, a.unlocked && s.chipTextOn]}>
                      {a.emoji} {a.title}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>

            <Text style={s.footer}>{t('progress.infoFooter')}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '86%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 8,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
    alignSelf: 'center', marginTop: 10,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10,
  },
  title: { fontSize: 17, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.3 },

  body: { paddingHorizontal: 20, paddingBottom: 30, gap: 16 },
  intro: { fontSize: 13.5, color: Colors.textSecondary, lineHeight: 20, fontWeight: '500' },

  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16, padding: 14, gap: 7,
    borderWidth: 1, borderColor: Colors.outlineVariant + '55',
  },
  sectionTitle: { fontSize: 14.5, fontWeight: '800', color: Colors.textPrimary },
  p: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19.5 },
  note: { fontSize: 11.5, color: Colors.textMuted, lineHeight: 17, fontStyle: 'italic', marginTop: 2 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 3 },
  rowIcon: { fontSize: 14, width: 20, textAlign: 'center' },
  rowText: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
  rowXp: { fontSize: 12.5, fontWeight: '800', color: Colors.tertiary },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: {
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999,
    backgroundColor: Colors.outlineVariant + '35',
  },
  chipOn: { backgroundColor: '#D1FAE5' },
  chipText: { fontSize: 11.5, fontWeight: '700', color: Colors.textSecondary },
  chipTextOn: { color: '#047857' },

  footer: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
});
