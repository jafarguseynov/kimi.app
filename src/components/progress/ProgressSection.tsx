import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import Skeleton from '../common/Skeleton';
import { getGamification, GamificationState, LevelReward } from '../../api/gamification.api';
import AnimatedNumber from './AnimatedNumber';
import ProgressBar from './ProgressBar';
import LevelUpOverlay from './LevelUpOverlay';
import XpFloat from './XpFloat';
import ProgressInfoSheet from './ProgressInfoSheet';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

/** "50 sikkə · 1 qoruyucu" kimi qısa mükafat mətni. */
export function rewardLabel(r: { coins: number; streakFreezes: number; title: string | null }): string {
  if (r.title) return r.title;
  const parts: string[] = [];
  if (r.coins > 0) parts.push(`${r.coins} 🪙`);
  if (r.streakFreezes > 0) parts.push(`${r.streakFreezes} 🧊`);
  return parts.join(' · ');
}

/**
 * "Sənin irəliləyişin" — XP, streak, liqa, reytinq və bugünkü hədəf.
 *
 * BÜTÜN dəyərlər `/gamification/me`-dən gəlir. Burada heç nə hesablanmır —
 * hesablama serverdədir (bax: kimi-az-backend/src/gamification).
 *
 * Bölmənin məqsədi statistika göstərmək deyil: şagird bir baxışda
 * "haradayam / növbəti hədəfim nədir / bu gün nə etməliyəm" suallarına
 * cavab tapmalı və CTA ilə dərhal fəaliyyətə keçməlidir.
 */
export default function ProgressSection() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const { data } = useQuery<GamificationState>({
    queryKey: ['gamification'],
    queryFn: getGamification,
    staleTime: 30 * 1000,
    retry: false,
  });

  const [expanded, setExpanded] = useState<'streak' | 'league' | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [levelUp, setLevelUp] = useState<{ from: number; to: number } | null>(null);
  const [levelReward, setLevelReward] = useState<LevelReward | null>(null);
  const [xpFloat, setXpFloat] = useState<number | null>(null);
  const prevXp = useRef<number | null>(null);
  const prevLevel = useRef<number | null>(null);
  const prevReward = useRef<LevelReward | null>(null);

  // XP artımını yaxala → "+65 XP" üzən animasiya + səviyyə artımı qeydi.
  // (İlk yükləmədə göstərmirik: hər açılışda eyni bayram effekti olmasın.)
  useEffect(() => {
    if (!data) return;
    if (prevXp.current !== null && data.xp > prevXp.current) {
      setXpFloat(data.xp - prevXp.current);
    }
    if (prevLevel.current !== null && data.level > prevLevel.current) {
      setLevelUp({ from: prevLevel.current, to: data.level });
      // Növbəti mükafat artıq YENİ səviyyəyə aiddir; qeyd üçün əvvəlki
      // sorğuda göstərdiyimiz mükafatı işlədirik (elə indicə açılan odur).
      setLevelReward(prevReward.current);
    }
    prevReward.current = data.nextLevelReward;
    prevXp.current = data.xp;
    prevLevel.current = data.level;
  }, [data]);

  const goal = data?.dailyGoal;
  const streak = data?.streak;
  const league = data?.league;
  const rank = data?.rank;

  const goalPct = goal && goal.target > 0 ? goal.progress / goal.target : 0;
  const levelPct = data && data.xpForLevel > 0 ? data.xpIntoLevel / data.xpForLevel : 0;

  /**
   * Liqa həftəsinin tarix aralığı: "12–18 avq".
   * Ay adı i18n-dəndir (cihaz dilindən yox) — app hansı dildədirsə o dildə çıxır.
   */
  const weekRange = useMemo(() => {
    const start = league?.weekStart ? new Date(`${league.weekStart}T00:00:00Z`) : null;
    if (!start || Number.isNaN(start.getTime())) return '';
    const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    const mon = (d: Date) => t(`progress.monthShort.${d.getUTCMonth()}`);
    const sameMonth = start.getUTCMonth() === end.getUTCMonth();
    return sameMonth
      ? `${start.getUTCDate()}–${end.getUTCDate()} ${mon(end)}`
      : `${start.getUTCDate()} ${mon(start)} – ${end.getUTCDate()} ${mon(end)}`;
  }, [league?.weekStart, t]);

  const newBadge = useMemo(
    () => (data?.newlyUnlocked?.length ? data.newlyUnlocked[0] : null),
    [data],
  );

  // ── Kartların hədəfləri (§23: hər metrik real fəaliyyətə bağlıdır) ──
  const openXpHistory = () => navigation.navigate(Routes.XpHistory);
  /**
   * Liqa cədvəli `HomeNavigator`-dadır — başqa tabdan açanda geri düyməsi
   * Ana səhifəyə atmasın deyə `returnTab` ötürülür (bax: useReturnTab).
   */
  const openLeaderboard = () =>
    navigation
      .getParent?.()
      ?.navigate(Routes.Home, {
        screen: Routes.Leaderboard,
        params: { returnTab: Routes.Profile },
        initial: false,
      });
  const startActivity = () => {
    // Hədəfi tamamlamaq üçün ən qısa yol — İmtahanlar tabı.
    const parent = navigation.getParent?.();
    if (parent) parent.navigate('Exams');
    else navigation.navigate('Exams');
  };

  if (!data) {
    return (
      <View style={s.card}>
        <Text style={s.sectionTitle}>{t('progress.title')}</Text>
        {/* Formа real kartla eynidir: XP sətri + tərəqqi zolağı + 3 çip */}
        <View style={s.skeletonHead}>
          <Skeleton width={96} height={22} />
          <Skeleton width={62} height={20} radius={999} />
        </View>
        <Skeleton width={'100%'} height={10} radius={999} style={{ marginTop: 4 }} />
        <View style={s.skeletonChips}>
          <Skeleton width={78} height={26} radius={999} />
          <Skeleton width={92} height={26} radius={999} />
          <Skeleton width={70} height={26} radius={999} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      {/* Başlıq + "bura nədir?" izahı */}
      <View style={s.titleRow}>
        <Text style={s.sectionTitle}>{t('progress.title')}</Text>
        <TouchableOpacity
          onPress={() => setInfoOpen(true)}
          hitSlop={12}
          accessibilityLabel={t('progress.infoTitle')}
          style={s.infoBtn}
        >
          <Ionicons name="information-circle-outline" size={19} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── XP + səviyyə ── */}
      <TouchableOpacity activeOpacity={0.9} onPress={openXpHistory} style={s.card}>
        <View style={s.xpHead}>
          <View style={s.xpLeft}>
            <Text style={s.xpBolt}>⚡</Text>
            <AnimatedNumber value={data.xp} style={s.xpValue} />
            <Text style={s.xpUnit}>XP</Text>
          </View>
          <View style={s.levelChip}>
            <Text style={s.levelChipText}>{t('progress.level', { n: data.level })}</Text>
          </View>
        </View>

        <Text style={s.xpSub}>
          {t('progress.toNextLevel', { xp: data.xpToNextLevel.toLocaleString() })}
        </Text>

        <ProgressBar progress={levelPct} colors={GRADIENT} height={10} />

        {/* Səviyyənin nəyə yaradığı görünsün — mükafat təyin olunubsa */}
        {!!data.nextLevelReward && (
          <View style={s.unlockRow}>
            <Text style={s.unlockIcon}>🎁</Text>
            <Text style={s.unlockText} numberOfLines={1}>
              {t('progress.nextUnlock', {
                level: data.nextLevelReward.level,
                reward: rewardLabel(data.nextLevelReward),
              })}
            </Text>
          </View>
        )}

        <View style={s.xpFootRow}>
          <Text style={s.xpFoot}>{data.xp.toLocaleString()} XP</Text>
          <Text style={[s.xpFoot, { color: Colors.primary }]}>
            {data.levelCeilingXp.toLocaleString()} XP
          </Text>
        </View>

        {xpFloat !== null && (
          <XpFloat amount={xpFloat} onDone={() => setXpFloat(null)} />
        )}
      </TouchableOpacity>

      {/* ── 3 metrik kartı ── */}
      <View style={s.statsRow}>
        {/* Streak */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={s.statCard}
          onPress={() => setExpanded((e) => (e === 'streak' ? null : 'streak'))}
        >
          <Text style={s.statEmoji}>🔥</Text>
          <Text style={s.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {streak && streak.current > 0
              ? t('progress.streakDays', { count: streak.current })
              : t('progress.streakStartShort')}
          </Text>
          <Text style={s.statLabel} numberOfLines={1}>{t('progress.streak')}</Text>
        </TouchableOpacity>

        {/* Liqa */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={s.statCard}
          onPress={() => setExpanded((e) => (e === 'league' ? null : 'league'))}
        >
          <Text style={s.statEmoji}>{league?.league.emoji ?? '🏆'}</Text>
          <Text style={s.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {league?.league.title ?? '—'}
          </Text>
          <Text style={s.statLabel} numberOfLines={1}>{t('progress.league')}</Text>
        </TouchableOpacity>

        {/* Reytinq */}
        <TouchableOpacity activeOpacity={0.85} style={s.statCard} onPress={openLeaderboard}>
          <Text style={s.statEmoji}>⭐</Text>
          {rank?.rank ? (
            <AnimatedNumber value={rank.rank} prefix="#" style={s.statValue} />
          ) : (
            <Text style={s.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {t('progress.rankEmpty')}
            </Text>
          )}
          <Text style={s.statLabel} numberOfLines={1}>{t('progress.rank')}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Streak detalı (7 günlük təqvim) ── */}
      {expanded === 'streak' && streak && (
        <View style={s.panel}>
          <View style={s.weekRow}>
            {streak.week.map((d) => {
              const label = t(`progress.dayShort.${new Date(`${d.date}T00:00:00Z`).getUTCDay()}`);
              return (
                <View key={d.date} style={s.dayCol}>
                  <View style={[s.dayDot, d.active && s.dayDotActive, d.isToday && s.dayDotToday]}>
                    <Text style={{ fontSize: d.active ? 15 : 12 }}>{d.active ? '🔥' : '○'}</Text>
                  </View>
                  <Text style={[s.dayLabel, d.isToday && { color: Colors.primary, fontWeight: '800' }]}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={s.panelMetaRow}>
            <Text style={s.panelMeta}>{t('progress.bestStreak', { n: streak.best })}</Text>
            {streak.nextMilestone && (
              <Text style={s.panelMeta}>
                {t('progress.nextMilestone', {
                  days: streak.nextMilestone.days,
                  xp: streak.nextMilestone.bonusXp,
                })}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* ── Liqa detalı (yaxın rəqiblər) ── */}
      {expanded === 'league' && league && (
        <View style={s.panel}>
          {/* Ekranda YALNIZ BİR mütləq XP rəqəmi olmalıdır — yuxarıdakı ümumi XP.
              Əvvəl burada həftəlik cəm ("230 XP") də göstərilirdi və şagird
              "2.930 vs 230" fərqini başa düşmürdü. Etiket də, ayrı ad da
              ("bal") kifayət etmədi. İndi rəqiblərin mütləq balı yox, səninlə
              FƏRQİ göstərilir — bu həm çaşdırmır, həm daha motivasiyaedicidir. */}
          <Text style={s.panelCaption}>
            {t('progress.leaguePanelCaption', { range: weekRange })}
          </Text>
          {league.neighbors.length > 0 ? (
            league.neighbors.map((n) => {
              const diff = n.weeklyXp - league.weeklyXp;
              return (
                <View key={n.userId} style={[s.rivalRow, n.isCurrentUser && s.rivalRowMe]}>
                  <Text style={[s.rivalRank, n.isCurrentUser && { color: Colors.primary }]}>#{n.rank}</Text>
                  <Text style={[s.rivalName, n.isCurrentUser && { fontWeight: '800' }]} numberOfLines={1}>
                    {n.isCurrentUser ? t('progress.you') : n.name}
                  </Text>
                  {!n.isCurrentUser && (
                    <Text style={[s.rivalDiff, diff > 0 && { color: Colors.primary }]}>
                      {diff > 0
                        ? t('progress.rivalAhead', { xp: diff.toLocaleString() })
                        : t('progress.rivalBehind', { xp: Math.abs(diff).toLocaleString() })}
                    </Text>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={s.panelMeta}>{t('progress.leagueEmpty')}</Text>
          )}

          {/* "Yuxarıdakını keçmək üçün N XP" sətri SİLİNDİ — rəqib sətrindəki
              fərq artıq eyni məlumatı verir, təkrar yalnız yer tuturdu. */}

          {league.nextLeague && league.xpToNextLeague != null && (
            <View style={{ marginTop: 10, gap: 6 }}>
              <Text style={s.panelMeta}>
                {t('progress.toNextLeague', {
                  league: league.nextLeague.title,
                  xp: league.xpToNextLeague,
                })}
              </Text>
              <ProgressBar
                progress={
                  league.nextLeague.minWeeklyXp > 0
                    ? league.weeklyXp / league.nextLeague.minWeeklyXp
                    : 0
                }
                colors={[Colors.tertiary, Colors.primary]}
                height={8}
              />
            </View>
          )}

          <TouchableOpacity onPress={openLeaderboard} activeOpacity={0.7} style={s.panelLink}>
            <Text style={s.panelLinkText}>{t('progress.fullTable')}</Text>
            <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bugünkü hədəf ── */}
      {goal && (
        <TouchableOpacity activeOpacity={0.9} style={s.goalCard} onPress={startActivity}>
          <View style={s.goalHead}>
            <Text style={s.goalTitle}>
              🎯 {goal.isFirstGoal ? t('progress.firstGoalTitle') : t('progress.goalTitle')}
            </Text>
            {goal.completed && (
              <View style={s.goalDoneChip}>
                <Text style={s.goalDoneChipText}>{t('progress.goalDoneChip')}</Text>
              </View>
            )}
          </View>

          {goal.completed ? (
            <Text style={s.goalSub}>{t('progress.goalDoneSub', { xp: goal.rewardXp })}</Text>
          ) : (
            <Text style={s.goalSub}>
              {t('progress.goalCount', { done: goal.progress, total: goal.target })}
            </Text>
          )}

          <ProgressBar
            progress={goalPct}
            colors={goal.completed ? ['#10B981', '#34D399'] : GRADIENT}
            height={10}
          />

          <View style={s.goalFoot}>
            <Text style={s.goalReward}>
              {goal.completed
                ? t('progress.goalTomorrow')
                : t('progress.goalReward', { xp: goal.rewardXp })}
            </Text>
            {!goal.completed && (
              <View style={s.goalCta}>
                <Text style={s.goalCtaText}>{t('progress.goalCta')}</Text>
                <Ionicons name="arrow-forward" size={13} color="#fff" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* ── Yeni nişan ── */}
      {newBadge && (
        <View style={s.badgeCard}>
          <Text style={{ fontSize: 26 }}>{newBadge.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.badgeTitle}>{t('progress.newBadge')}</Text>
            <Text style={s.badgeSub}>{newBadge.title} · +{newBadge.bonusXp} XP</Text>
          </View>
        </View>
      )}

      <ProgressInfoSheet visible={infoOpen} onClose={() => setInfoOpen(false)} data={data} />
      <LevelUpOverlay
        levelUp={levelUp}
        reward={levelReward}
        onDone={() => {
          setLevelUp(null);
          setLevelReward(null);
        }}
      />
    </View>
  );
}

const CARD: any = {
  backgroundColor: Colors.surface,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: Colors.outlineVariant + '55',
  ...Platform.select({
    ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
    android: { elevation: 1 },
  }),
};

const s = StyleSheet.create({
  wrap: { gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoBtn: { padding: 2 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 2,
  },

  card: { ...CARD, padding: 16, gap: 8, overflow: 'hidden' },
  skeletonHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skeletonChips: { flexDirection: 'row', gap: 8, marginTop: 6 },

  xpHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  xpLeft: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  xpBolt: { fontSize: 18 },
  xpValue: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  xpUnit: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary },
  levelChip: {
    backgroundColor: Colors.primary + '14',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  levelChipText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  xpSub: { fontSize: 12.5, color: Colors.textSecondary, fontWeight: '600' },
  xpFootRow: { flexDirection: 'row', justifyContent: 'space-between' },
  unlockRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFBEB', borderRadius: 10,
    paddingHorizontal: 9, paddingVertical: 6,
  },
  unlockIcon: { fontSize: 13 },
  unlockText: { flex: 1, fontSize: 11.5, fontWeight: '700', color: '#92400E' },
  xpFoot: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { ...CARD, flex: 1, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', gap: 3 },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  panel: { ...CARD, padding: 14, gap: 10 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 5, flex: 1 },
  dayDot: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.outlineVariant + '35',
  },
  dayDotActive: { backgroundColor: '#FEF3C7' },
  dayDotToday: { borderWidth: 2, borderColor: Colors.primary },
  dayLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
  panelMetaRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  panelMeta: { fontSize: 11.5, color: Colors.textSecondary, fontWeight: '600' },
  panelCaption: {
    fontSize: 10.5, fontWeight: '800', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2,
  },
  panelHint: { fontSize: 12, color: Colors.primary, fontWeight: '700', marginTop: 6 },
  panelLink: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginTop: 4 },
  panelLinkText: { fontSize: 12, fontWeight: '800', color: Colors.primary },

  rivalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  rivalRowMe: {
    backgroundColor: Colors.primary + '0D',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginHorizontal: -4,
  },
  rivalRank: { fontSize: 12, fontWeight: '800', color: Colors.textMuted, width: 34 },
  rivalName: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
  rivalDiff: { fontSize: 11.5, fontWeight: '700', color: Colors.textMuted },

  goalCard: { ...CARD, padding: 16, gap: 8 },
  goalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalTitle: { fontSize: 14.5, fontWeight: '800', color: Colors.textPrimary },
  goalDoneChip: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  goalDoneChipText: { fontSize: 10, fontWeight: '800', color: '#047857' },
  goalSub: { fontSize: 12.5, color: Colors.textSecondary, fontWeight: '600' },
  goalFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  goalReward: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  goalCta: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
  },
  goalCtaText: { fontSize: 12, fontWeight: '800', color: '#fff' },

  badgeCard: {
    ...CARD,
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    backgroundColor: '#FFFBEB', borderColor: '#FDE68A',
  },
  badgeTitle: { fontSize: 13, fontWeight: '800', color: '#92400E' },
  badgeSub: { fontSize: 12, color: '#B45309', fontWeight: '600', marginTop: 1 },
});
