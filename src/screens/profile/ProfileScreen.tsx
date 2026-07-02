import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { PREMIUM_ENTRY_ROUTE } from '../../config/iap';
import { useUserStore } from '../../store/user.store';
import { useTeacherProfileCompletion } from '../../hooks/useTeacherProfileCompletion';
import { useLogout } from '../../hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getUserStats } from '../../api/dashboard.api';
import { getTeacherAnalytics, TeacherAnalytics, getTeachers, getMe } from '../../api/user.api';
import { avatarEmoji } from '../../constants/cosmetics';
import { getWallet } from '../../api/payment.api';
import { getEntitlements } from '../../api/shop.api';
import { getExamResults, getCertificates } from '../../api/certificate.api';
import { UserStats } from '../../types/dashboard.types';
import { Switch } from 'react-native';
import { LanguageChips } from '../../components/LanguageSwitch';
import { useTranslation } from '../../i18n';
import { useBadges } from '../../hooks/useBadges';
import UnreadDot from '../../components/common/UnreadDot';
import { useMonetization } from '../../store/featureFlag.store';
import { rs } from '../../utils/responsive';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

// ─── Student ──────────────────────────────────────────────────────────────────

type MenuTab = 'self' | 'home' | 'exams';
const BASE_STUDENT_MENU = [
  { id: 'joinTeacher', icon: 'people-outline', labelKey: 'profileScreen.menuJoinTeacher', subKey: 'profileScreen.menuJoinTeacherSub', tab: 'self' as MenuTab, route: Routes.JoinTeacher },
  { id: 'results', icon: 'analytics-outline', labelKey: 'profileScreen.menuResults', subKey: 'profileScreen.menuResultsSub', tab: 'self' as MenuTab, route: Routes.ExamHistory },
  { id: 'history', icon: 'time-outline', labelKey: 'profileScreen.menuHistory', subKey: 'profileScreen.menuHistorySub', tab: 'self' as MenuTab, route: Routes.ExamHistory },
  { id: 'questions', icon: 'help-circle-outline', labelKey: 'profileScreen.menuQuestions', subKey: 'profileScreen.menuQuestionsSub', tab: 'self' as MenuTab, route: Routes.Achievements },
  { id: 'balance', icon: 'wallet-outline', labelKey: 'profileScreen.menuBalance', subKey: '', tab: 'self' as MenuTab, route: Routes.Wallet },
  { id: 'subscription', icon: 'diamond-outline', labelKey: 'profileScreen.menuSubscription', subKey: 'profileScreen.menuSubscriptionSub', tab: 'home' as MenuTab, route: PREMIUM_ENTRY_ROUTE },
  { id: 'goals', icon: 'flag-outline', labelKey: 'profileScreen.menuGoals', subKey: 'profileScreen.menuGoalsSub', tab: 'home' as MenuTab, route: Routes.DailyMissions },
  { id: 'medals', icon: 'trophy-outline', labelKey: 'profileScreen.menuMedals', subKey: '', tab: 'self' as MenuTab, route: Routes.Achievements },
  { id: 'certs', icon: 'ribbon-outline', labelKey: 'profileScreen.menuCerts', subKey: '', tab: 'self' as MenuTab, route: Routes.CertificateList },
  { id: 'rewards', icon: 'gift-outline', labelKey: 'profileScreen.menuRewards', subKey: '', tab: 'self' as MenuTab, route: Routes.RewardHistory },
  { id: 'duels', icon: 'flash-outline', labelKey: 'profileScreen.menuDuels', subKey: '', tab: 'self' as MenuTab, route: Routes.DuelHistory },
  { id: 'referral', icon: 'share-social-outline', labelKey: 'profileScreen.menuReferral', subKey: 'profileScreen.menuReferralSub', tab: 'self' as MenuTab, route: Routes.Referral },
] as const;

// Pull-to-refresh: profil sorğularını yenidən çək.
function useProfileRefresh() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries();
    } finally {
      setRefreshing(false);
    }
  };
  return { refreshing, onRefresh };
}

function StudentView({ name, subtitle, logout, stats, walletBalance, avatarUrl, avatarId, premiumActive, navigation }: {
  name: string;
  subtitle?: string;
  logout: () => void;
  stats?: UserStats;
  walletBalance?: number;
  avatarUrl?: string;
  avatarId?: string | null;
  premiumActive?: boolean;
  navigation: NativeStackNavigationProp<any>;
}) {
  const { t } = useTranslation();
  const { subscription: subVisible, payments: payVisible } = useMonetization();
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const emoji = avatarEmoji(avatarId);
  const firstName = name.split(' ')[0];

  // Monetizasiya bağlıdırsa balans (payments) və abunə (subscription) menyu sətirlərini gizlət.
  const menu = BASE_STUDENT_MENU.filter((item) => {
    if (item.id === 'balance' && !payVisible) return false;
    if (item.id === 'subscription' && !subVisible) return false;
    return true;
  });

  const { data: results = [] } = useQuery({ queryKey: ['examResults'], queryFn: getExamResults });
  const { data: certs = [] } = useQuery({ queryKey: ['certificates'], queryFn: getCertificates });
  const badges = useBadges();

  const totalXp = React.useMemo(() => {
    const examXp = results.reduce((s, r) => s + r.score * 10, 0);
    return examXp + certs.length * 100;
  }, [results, certs]);
  const level = Math.max(1, Math.floor(totalXp / 2000) + 1);
  const nextLevelXp = level * 2000;
  const prevLevelXp = (level - 1) * 2000;
  const xpProgress = Math.min(1, Math.max(0, (totalXp - prevLevelXp) / (nextLevelXp - prevLevelXp || 1)));
  const tier = totalXp >= 5000 ? t('profileScreen.tierDiamond')
    : totalXp >= 2000 ? t('profileScreen.tierPlatinum')
    : totalXp >= 1000 ? t('profileScreen.tierGold')
    : totalXp >= 500 ? t('profileScreen.tierSilver')
    : t('profileScreen.tierBronze');
  const streak = stats?.streak ?? 0;
  const rating = 1000 + Math.round((stats?.averageScore ?? 0) * 4);
  const { refreshing, onRefresh } = useProfileRefresh();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          {emoji ? (
            <LinearGradient colors={GRADIENT} style={styles.bigAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={{ fontSize: 44 }}>{emoji}</Text>
            </LinearGradient>
          ) : avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.bigAvatar} />
          ) : (
            <LinearGradient colors={GRADIENT} style={styles.bigAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.bigAvatarInitial}>{initial}</Text>
            </LinearGradient>
          )}
          <TouchableOpacity
            style={styles.editAvatarBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(Routes.EditProfile)}
          >
            <Ionicons name="pencil" size={12} color="#fff" />
          </TouchableOpacity>
          <View style={styles.levelChip}>
            <Text style={styles.levelChipText}>{t('profileScreen.level', { n: level })}</Text>
          </View>
        </View>
        <Text style={[styles.userName, { marginTop: 18 }]}>{firstName}</Text>
        {premiumActive && (
          <View style={styles.premiumChip}>
            <Ionicons name="sparkles" size={12} color="#B45309" />
            <Text style={styles.premiumChipText}>{t('profileScreen.premiumBadge')}</Text>
          </View>
        )}
        {!!subtitle && <Text style={styles.userMeta}>{subtitle}</Text>}

        {/* XP progress */}
        <View style={styles.xpBarWrap}>
          <View style={styles.xpBarTrack}>
            <LinearGradient
              colors={GRADIENT}
              style={[styles.xpBarFill, { width: `${xpProgress * 100}%` as any }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
          </View>
          <View style={styles.xpBarLabels}>
            <Text style={styles.xpBarLabel}>{totalXp.toLocaleString()} XP</Text>
            <Text style={[styles.xpBarLabel, { color: Colors.primary }]}>{nextLevelXp.toLocaleString()} XP</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{t('profileScreen.streakDays', { count: streak })}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>{t('profileScreen.statStreak')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{tier}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>{t('profileScreen.statLeague')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{rating}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>{t('profileScreen.statRating')}</Text>
        </View>
      </View>

      {/* AI card */}
      <TouchableOpacity
        style={styles.aiCard}
        activeOpacity={0.88}
        onPress={() => (navigation.getParent() as any)?.navigate(Routes.AIMentor)}
      >
        <View style={styles.aiIconWrap}>
          <Ionicons name="sparkles" size={22} color={Colors.tertiary} />
        </View>
        <View style={styles.aiCardBody}>
          <Text style={styles.aiCardTitle}>{t('profileScreen.aiCardTitle')}</Text>
          <Text style={styles.aiCardSub}>{t('profileScreen.aiCardSub')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.tertiary} />
      </TouchableOpacity>

      {/* Dil — birbaşa dəyiş */}
      <Text style={styles.langSectionLabel}>{t('language.title')}</Text>
      <LanguageChips />

      {/* Menu */}
      <View style={styles.menuCard}>
        {menu.map((item, i) => {
          const isBalance = item.id === 'balance';
          const sub = isBalance && walletBalance !== undefined
            ? t('profileScreen.walletSub', { amount: walletBalance.toFixed(2) })
            : (item.subKey ? t(item.subKey) : '');
          return (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, i < menu.length - 1 && styles.menuItemDivider]}
            activeOpacity={0.7}
            onPress={() => {
              if (item.tab === 'self') {
                navigation.navigate(item.route);
              } else {
                const parent = navigation.getParent() as any;
                const target = item.tab === 'home' ? Routes.Home : 'Exams';
                parent?.navigate(target, { screen: item.route, initial: false });
              }
            }}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name={item.icon} size={20} color={Colors.primary} />
              {item.id === 'certs' && badges.certificates > 0 && (
                <UnreadDot count={1} style={{ position: 'absolute', top: -3, right: -3 }} />
              )}
            </View>
            <View style={styles.menuItemBody}>
              <Text style={styles.menuItemLabel}>{t(item.labelKey)}</Text>
              {sub ? <Text style={styles.menuItemSub}>{sub}</Text> : null}
            </View>
            {isBalance && walletBalance !== undefined && walletBalance > 0 && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{t('profileScreen.activeBadge')}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
          </TouchableOpacity>
          );
        })}
      </View>

      {/* Kimi tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>{t('profileScreen.tipTitle')}</Text>
        <Text style={styles.tipText}>
          {t('profileScreen.tipText', { name: firstName })}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>{t('profileScreen.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Teacher ──────────────────────────────────────────────────────────────────

function TeacherView({ name, logout, analytics, subjects, bio, avatarUrl, navigation }: {
  name: string; logout: () => void;
  analytics?: TeacherAnalytics;
  subjects?: string[];
  bio?: string;
  avatarUrl?: string;
  navigation: NativeStackNavigationProp<any>;
}) {
  const { t } = useTranslation();
  const { withdrawals: withdrawVisible, subscription: subVisible } = useMonetization();
  const badges = useBadges();
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const teacherSubjects = subjects?.length ? subjects : [];
  const teacherBio = bio ?? '';

  // Profil gücü (tamamlama) — ortaq hook (backend ilə eyni 6 element)
  const { pct: trustPct, nextStep } = useTeacherProfileCompletion();

  const metrics = [
    { label: t('profileScreen.metricEarnings'), value: analytics?.monthlyEarnings?.toString() ?? '—', unit: 'AZN', primary: true },
    { label: t('profileScreen.metricStudents'), value: analytics?.totalStudents?.toString() ?? '—', unit: '', primary: false },
    { label: t('profileScreen.metricViews'), value: analytics?.profileViews?.toString() ?? '—', unit: '', primary: false },
    { label: t('profileScreen.metricQueries'), value: analytics?.activeQueries?.toString() ?? '—', unit: '', primary: true },
  ];
  const { refreshing, onRefresh } = useProfileRefresh();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
    >
      {/* Avatar + rating */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.bigAvatar} />
          ) : (
            <LinearGradient colors={GRADIENT} style={styles.bigAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.bigAvatarInitial}>{initial}</Text>
            </LinearGradient>
          )}
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        </View>
        <Text style={styles.userName}>{name}</Text>
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}>{t('profileScreen.ratingLabel', { rating: analytics?.rating?.toFixed(1) ?? '—' })}</Text>
        </View>
      </View>

      {/* Metrics grid */}
      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
          <View key={m.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricValue, m.primary && { color: Colors.primary }]}>{m.value}</Text>
              {m.unit ? <Text style={styles.metricUnit}>{m.unit}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      {/* Earnings actions — admin monetizasiya bağlasa gizlənir */}
      {withdrawVisible && (
      <View style={styles.earningsRow}>
        <TouchableOpacity
          style={styles.earningsPrimary}
          activeOpacity={0.88}
          onPress={() => navigation.navigate(Routes.Withdrawal)}
        >
          <LinearGradient colors={GRADIENT} style={styles.earningsGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="wallet-outline" size={18} color="#fff" />
            <Text style={styles.earningsPrimaryText}>{t('profileScreen.withdrawEarnings')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.earningsSecondary}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.PayoutHistory)}
        >
          <Ionicons name="time-outline" size={18} color={Colors.primary} />
          <Text style={styles.earningsSecondaryText}>{t('profileScreen.history')}</Text>
        </TouchableOpacity>
      </View>
      )}

      {/* Boost card */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.TeacherBoost)}>
        <LinearGradient colors={GRADIENT} style={styles.premiumCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.premiumLeft}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>{t('profileScreen.boostBadge')}</Text>
            </View>
            <Text style={styles.premiumTitle}>{t('profileScreen.boostTitle')}</Text>
            <Text style={styles.premiumSub}>
              {t('profileScreen.boostSub')}
            </Text>
          </View>
          <View style={styles.premiumIconWrap}>
            <Ionicons name="rocket" size={42} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Profil gücü (tamamlama) */}
      {trustPct < 100 && (
        <TouchableOpacity
          style={trustStyles.card}
          activeOpacity={0.9}
          onPress={() => navigation.navigate(Routes.EditProfile)}
        >
          <View style={trustStyles.headerRow}>
            <View style={trustStyles.iconWrap}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={trustStyles.title}>{t('profileScreen.trustTitle')}</Text>
              <Text style={trustStyles.sub}>{t('profileScreen.trustSub')}</Text>
            </View>
            <Text style={trustStyles.pct}>{trustPct}%</Text>
          </View>
          <View style={trustStyles.barTrack}>
            <View style={[trustStyles.barFill, { width: `${trustPct}%` }]} />
          </View>
          {nextStep && (
            <View style={trustStyles.nextRow}>
              <Ionicons name="add-circle-outline" size={15} color={Colors.primary} />
              <Text style={trustStyles.nextText}>{t('profileScreen.trustNext', { step: nextStep.label })}</Text>
              <Ionicons name="chevron-forward" size={15} color={Colors.textSecondary} />
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Müəllim İnkişafı */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profileScreen.teacherDevTitle')}</Text>
        <View style={progStyles.list}>
          {[
            { key: 'subscription', icon: 'diamond' as const, title: t('profileScreen.menuSubscription'), sub: t('profileScreen.menuSubscriptionSub'), route: PREMIUM_ENTRY_ROUTE },
            { key: 'class', icon: 'people-circle' as const, title: t('profileScreen.progClassTitle'), sub: t('profileScreen.progClassSub'), route: Routes.TeacherClass, local: true },
            { key: 'students', icon: 'people' as const, title: t('profileScreen.progStudentsTitle'), sub: t('profileScreen.progStudentsSub'), route: Routes.TeacherStudents, local: true },
            { key: 'gradeCalc', icon: 'calculator' as const, title: t('profileScreen.progGradeCalcTitle'), sub: t('profileScreen.progGradeCalcSub'), route: Routes.ClassGradeCalc, local: true },
            { key: 'calculators', icon: 'apps' as const, title: t('profileScreen.progCalculatorsTitle'), sub: t('profileScreen.progCalculatorsSub'), route: Routes.Calculators, tab: 'Calculators' },
            { key: 'referral', icon: 'share-social' as const, title: t('profileScreen.progReferralTitle'), sub: t('profileScreen.progReferralSub'), route: Routes.Referral, local: true },
            { key: 'badges', icon: 'ribbon' as const, title: t('profileScreen.progBadgesTitle'), sub: t('profileScreen.progBadgesSub'), route: Routes.TeacherBadges },
            { key: 'level', icon: 'flash' as const, title: t('profileScreen.progLevelTitle'), sub: t('profileScreen.progLevelSub'), route: Routes.TeacherLevel },
            { key: 'verified', icon: 'checkmark-done' as const, title: t('profileScreen.progVerifiedTitle'), sub: t('profileScreen.progVerifiedSub'), route: Routes.VerifiedTeacher },
            { key: 'top', icon: 'trophy' as const, title: t('profileScreen.progTopTitle'), sub: t('profileScreen.progTopSub'), route: Routes.TopTeachersLeaderboard },
            { key: 'premium', icon: 'person-circle' as const, title: t('profileScreen.progPremiumTitle'), sub: t('profileScreen.progPremiumSub'), route: Routes.TeacherProfilePremium },
          ].filter((it) => it.key !== 'subscription' || subVisible).map((it) => (
            <TouchableOpacity
              key={it.key}
              style={progStyles.row}
              activeOpacity={0.85}
              onPress={() => {
                if ((it as any).tab) {
                  (navigation.getParent() as any)?.navigate((it as any).tab);
                } else if ((it as any).local) {
                  navigation.navigate(it.route);
                } else {
                  (navigation.getParent() as any)?.navigate(Routes.Home, {
                    screen: it.route,
                    initial: false,
                  });
                }
              }}
            >
              <View style={progStyles.iconWrap}>
                <Ionicons name={it.icon} size={20} color={Colors.primary} />
                {it.key === 'students' && badges.students > 0 && (
                  <UnreadDot count={1} style={{ position: 'absolute', top: -3, right: -3 }} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={progStyles.rowTitle}>{it.title}</Text>
                <Text style={progStyles.rowSub}>{it.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Subjects */}
      {teacherSubjects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profileScreen.subjectsTitle')}</Text>
          <View style={styles.chipsRow}>
            {teacherSubjects.map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bio */}
      {!!teacherBio && (
        <View style={styles.section}>
          <View style={styles.bioTitleRow}>
            <Text style={styles.sectionTitle}>{t('profileScreen.aboutTitle')}</Text>
            <View style={styles.expBadge}>
              <Text style={styles.expBadgeText}>{t('profileScreen.experiencedBadge')}</Text>
            </View>
          </View>
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{teacherBio}</Text>
          </View>
        </View>
      )}

      {/* Edit profile */}
      <TouchableOpacity
        style={styles.editProfileBtn}
        activeOpacity={0.88}
        onPress={() => navigation.navigate(Routes.EditProfile)}
      >
        <LinearGradient colors={GRADIENT} style={styles.editProfileGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Ionicons name="pencil" size={20} color="#fff" />
          <Text style={styles.editProfileText}>{t('profileScreen.editProfile')}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>{t('profileScreen.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Parent ───────────────────────────────────────────────────────────────────

const PARENT_PERFORMANCE = [
  { subject: 'Riyaziyyat', pct: 84, color: Colors.primary, noteKey: 'profileScreen.perfNote1' },
  { subject: 'Azərbaycan dili', pct: 92, color: Colors.tertiary, noteKey: 'profileScreen.perfNote2' },
];
const WEAK_TOPICS = ['Kəsrlər', 'Sifətin dərəcələri'];
const PARENT_EXAMS = [
  { month: 'Mar', day: '15', titleKey: 'profileScreen.exam1Title', subKey: 'profileScreen.exam1Sub', accentColor: Colors.primary },
  { month: 'Apr', day: '02', titleKey: 'profileScreen.exam2Title', subKey: 'profileScreen.exam2Sub', accentColor: Colors.secondary },
];

function ParentView({ name, logout, childName, childGrade, childSchool, navigation }: { name: string; logout: () => void; childName?: string; childGrade?: string; childSchool?: string; navigation: NativeStackNavigationProp<any> }) {
  const { t } = useTranslation();
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const displayChild = childName || t('profileScreen.defaultChild');
  const metaParts = [childGrade, childSchool].filter(Boolean).join(' • ') || t('profileScreen.noChildMeta');

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers', { limit: 6 }],
    queryFn: () => getTeachers({ limit: 6 }),
  });

  const [notifExam, setNotifExam] = React.useState(true);
  const [notifLesson, setNotifLesson] = React.useState(true);
  const [notifMessages, setNotifMessages] = React.useState(false);
  const { refreshing, onRefresh } = useProfileRefresh();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          <LinearGradient colors={GRADIENT} style={styles.bigAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.bigAvatarInitial}>{initial}</Text>
          </LinearGradient>
          <TouchableOpacity
            style={styles.editAvatarBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(Routes.EditProfile)}
          >
            <Ionicons name="pencil" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{t('profileScreen.parentBadge')}</Text>
        </View>
      </View>

      {/* Linked child */}
      <View style={styles.childCard}>
        <View style={styles.childCardTop}>
          <View style={styles.childIconBox}>
            <Ionicons name="people-outline" size={22} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.childName}>{t('profileScreen.childMeta', { child: displayChild })}</Text>
            <Text style={styles.childMeta}>{metaParts}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.childBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(Routes.ParentChildren)}
        >
          <Text style={styles.childBtnText}>{t('profileScreen.viewReport')}</Text>
        </TouchableOpacity>
      </View>

      {/* Performance */}
      <View style={styles.perfGrid}>
        {PARENT_PERFORMANCE.map((p) => (
          <View key={p.subject} style={styles.perfCard}>
            <View style={styles.perfCardHeader}>
              <Text style={styles.perfSubject}>{p.subject}</Text>
              <Text style={[styles.perfPct, { color: p.color }]}>{p.pct}%</Text>
            </View>
            <View style={styles.perfTrack}>
              <View style={[styles.perfFill, { width: `${p.pct}%` as any, backgroundColor: p.color }]} />
            </View>
            <Text style={styles.perfNote}>{t(p.noteKey)}</Text>
          </View>
        ))}
      </View>

      {/* Weak topics */}
      <View style={styles.section}>
        <Text style={styles.sectionSmallTitle}>{t('profileScreen.weakTopicsTitle')}</Text>
        <View style={styles.chipsRow}>
          {WEAK_TOPICS.map((topic) => (
            <View key={topic} style={styles.weakChip}>
              <Ionicons name="trending-down" size={14} color={Colors.danger} />
              <Text style={styles.weakChipText}>{topic}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Upcoming exams */}
      <View style={styles.section}>
        <Text style={styles.sectionSmallTitle}>{t('profileScreen.upcomingExamsTitle')}</Text>
        <View style={styles.examList}>
          {PARENT_EXAMS.map((e) => (
            <View key={e.titleKey} style={[styles.examCard, { borderLeftColor: e.accentColor }]}>
              <View style={styles.examDate}>
                <Text style={[styles.examMonth, { color: e.accentColor }]}>{e.month}</Text>
                <Text style={styles.examDay}>{e.day}</Text>
              </View>
              <View style={styles.examInfo}>
                <Text style={styles.examTitle}>{t(e.titleKey)}</Text>
                <Text style={styles.examSub}>{t(e.subKey)}</Text>
              </View>
              <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
            </View>
          ))}
        </View>
      </View>

      {/* Teacher suggestions */}
      {teachers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.suggestHeader}>
            <Text style={styles.sectionSmallTitle}>{t('profileScreen.teacherSuggestionsTitle')}</Text>
            <TouchableOpacity
              onPress={() => (navigation.getParent() as any)?.navigate('Marketplace')}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestLink}>{t('profileScreen.all')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
            {teachers.map((teacher) => {
              const tInitial = teacher.name?.[0]?.toUpperCase() ?? '?';
              const subj = teacher.subjects?.[0] ?? t('profileScreen.defaultTeacher');
              return (
                <TouchableOpacity
                  key={teacher.id}
                  style={styles.suggestCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    (navigation.getParent() as any)?.navigate('Marketplace', {
                      screen: Routes.TeacherProfile,
                      params: { teacherId: teacher.id },
                      initial: false,
                    })
                  }
                >
                  <LinearGradient colors={GRADIENT} style={styles.suggestAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.suggestAvatarText}>{tInitial}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestName} numberOfLines={1}>{teacher.name}</Text>
                    <Text style={styles.suggestSubject} numberOfLines={1}>{subj}</Text>
                    <View style={styles.suggestRating}>
                      <Ionicons name="star" size={11} color="#F59E0B" />
                      <Text style={styles.suggestRatingText}>
                        {(teacher.rating ?? 0).toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Notification preferences */}
      <View style={styles.notifCard}>
        <Text style={styles.sectionSmallTitle}>{t('profileScreen.notifTitle')}</Text>
        <View style={styles.notifList}>
          <View style={styles.notifRow}>
            <Text style={styles.notifLabel}>{t('profileScreen.notifExam')}</Text>
            <Switch
              value={notifExam}
              onValueChange={setNotifExam}
              trackColor={{ false: Colors.surfaceVariant, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.notifRow}>
            <Text style={styles.notifLabel}>{t('profileScreen.notifLesson')}</Text>
            <Switch
              value={notifLesson}
              onValueChange={setNotifLesson}
              trackColor={{ false: Colors.surfaceVariant, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.notifRow}>
            <Text style={styles.notifLabel}>{t('profileScreen.notifMessages')}</Text>
            <Switch
              value={notifMessages}
              onValueChange={setNotifMessages}
              trackColor={{ false: Colors.surfaceVariant, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>{t('profileScreen.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, setUser } = useUserStore();
  const { t } = useTranslation();
  const logout = useLogout();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const name = user?.name ?? t('profileScreen.defaultName');
  const isTeacher = user?.role === 'teacher';
  const isStudent = !isTeacher && user?.role !== 'parent';

  const { data: stats } = useQuery({ queryKey: ['user-stats'], queryFn: getUserStats, enabled: isStudent });
  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: getWallet, enabled: isStudent });
  const { data: entitlements } = useQuery({ queryKey: ['entitlements'], queryFn: getEntitlements, enabled: isStudent });
  const { data: analytics } = useQuery({ queryKey: ['teacher-analytics'], queryFn: getTeacherAnalytics, enabled: isTeacher });
  // Tam profil (avatarUrl, subjects, bio...) serverdən təzələnir — store köhnə ola bilər.
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe });
  React.useEffect(() => {
    if (me) setUser({ ...(user as any), ...(me as any) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const userAny = { ...(user as any), ...((me as any) ?? {}) };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          hitSlop={8}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : (navigation.getParent() as any)?.navigate(Routes.Home))}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profileScreen.headerTitle')}</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => {
            const parent = navigation.getParent() as any;
            parent?.navigate(Routes.Home, { screen: Routes.Settings, initial: false });
          }}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isTeacher ? (
        <TeacherView name={name} logout={logout} analytics={analytics} subjects={userAny?.subjects} bio={userAny?.bio} avatarUrl={userAny?.avatarUrl} navigation={navigation} />
      ) : user?.role === 'parent' ? (
        <ParentView
          name={name}
          logout={logout}
          childName={userAny?.profile?.childName ?? userAny?.childName}
          childGrade={userAny?.profile?.grade ?? userAny?.grade}
          childSchool={userAny?.profile?.school ?? userAny?.school}
          navigation={navigation}
        />
      ) : (
        <StudentView
          name={name}
          subtitle={[userAny?.grade, userAny?.school].filter(Boolean).join(', ') || undefined}
          logout={logout}
          stats={stats}
          walletBalance={wallet?.balance}
          avatarUrl={userAny?.avatarUrl}
          avatarId={userAny?.avatarId ?? userAny?.profile?.avatarId}
          premiumActive={entitlements?.premiumActive}
          navigation={navigation}
        />
      )}
    </SafeAreaView>
  );
}

const progStyles = StyleSheet.create({
  list: { marginTop: 12, gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  rowSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});

const trustStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16, gap: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  pct: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.surfaceHighest, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextText: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 48, gap: 20 },

  // ── Avatar shared ──
  avatarSection: { alignItems: 'center', gap: 10 },
  avatarWrap: { position: 'relative' },
  bigAvatar: {
    width: 112, height: 112, borderRadius: 56,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#fff',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 6,
  },
  bigAvatarInitial: { fontSize: 42, fontWeight: '800', color: '#fff', fontStyle: 'italic' },
  editAvatarBtn: {
    position: 'absolute', bottom: 4, right: 4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  userMeta: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  premiumChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'center',
    backgroundColor: '#FEF9C3', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginTop: 8,
  },
  premiumChipText: { fontSize: 12, fontWeight: '900', color: '#B45309', letterSpacing: 0.3 },

  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surfaceLowest, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  ratingText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  roleBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },

  // ── Stats (student) ──
  statsRow: { flexDirection: 'row', gap: rs(10) },
  statItem: {
    flex: 1, minWidth: 0, backgroundColor: Colors.surfaceLowest, borderRadius: 18,
    paddingVertical: 16, paddingHorizontal: rs(8),
    alignItems: 'center', justifyContent: 'center', gap: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  statItemGrad: { shadowColor: Colors.primary, shadowOpacity: 0.15 },
  statEmoji: { fontSize: 22, marginBottom: 2 },
  statLabel: { fontSize: 9, fontWeight: '800', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  statValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 2, textAlign: 'center' },

  // ── Level badge below avatar ──
  levelChip: {
    position: 'absolute', bottom: -10, left: '50%',
    transform: [{ translateX: -34 }],
    backgroundColor: Colors.primary,
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    minWidth: 68, alignItems: 'center',
  },
  levelChipText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  // ── XP bar ──
  xpBarWrap: { width: '100%', marginTop: 16, gap: 6 },
  xpBarTrack: {
    height: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
    overflow: 'hidden',
  },
  xpBarFill: { height: '100%', borderRadius: 999 },
  xpBarLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  xpBarLabel: { fontSize: 10, fontWeight: '800', color: Colors.outline },

  // ── AKTİV badge on Balansım ──
  activeBadge: {
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
    marginRight: 4,
  },
  activeBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.tertiary, letterSpacing: 0.5 },

  // ── AI card (student) ──
  aiCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.tertiaryContainer + '22',
    borderRadius: 18, padding: 18,
    borderLeftWidth: 4, borderLeftColor: Colors.tertiary,
    overflow: 'hidden',
  },
  aiIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.tertiaryContainer + '66',
    alignItems: 'center', justifyContent: 'center',
  },
  aiCardBody: { flex: 1 },
  aiCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  aiCardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // ── Menu (student) ──
  langSectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5, marginBottom: -8, marginLeft: 4 },
  menuCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
    paddingVertical: 4,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 16 },
  menuItemDivider: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  menuItemBody: { flex: 1 },
  menuItemLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  menuItemSub: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 1 },

  // ── Tip card (student) ──
  tipCard: {
    backgroundColor: Colors.primaryLight + 'AA',
    borderRadius: 18, padding: 20,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
    gap: 6,
  },
  tipTitle: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  tipText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  // ── Metrics grid (teacher) ──
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: {
    width: '47%', backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
    gap: 6,
  },
  metricLabel: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  metricValue: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  metricUnit: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  // ── Earnings actions (teacher) ──
  earningsRow: { flexDirection: 'row', gap: 12 },
  earningsPrimary: { flex: 1, borderRadius: 999, overflow: 'hidden' },
  earningsGrad: {
    height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 3,
  },
  earningsPrimaryText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  earningsSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 52, paddingHorizontal: 18, borderRadius: 999,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  earningsSecondaryText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  // ── Premium card (teacher) ──
  premiumCard: {
    borderRadius: 20, padding: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
    overflow: 'hidden',
  },
  premiumLeft: { flex: 1, gap: 6 },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  premiumBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 1.5 },
  premiumTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  premiumSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  premiumIconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },

  // ── Sections shared ──
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  sectionSmallTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 2 },

  bioTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  expBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  expBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.8 },
  bioCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  bioText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  // ── Chips shared ──
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 999,
    paddingHorizontal: 18, paddingVertical: 9,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02, shadowRadius: 6, elevation: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  weakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.dangerLight + 'AA',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
  },
  weakChipText: { fontSize: 13, fontWeight: '500', color: Colors.danger },

  // ── Edit profile button (teacher) ──
  editProfileBtn: { borderRadius: 999, overflow: 'hidden' },
  editProfileGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 18,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  editProfileText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // ── Child card (parent) ──
  childCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
    overflow: 'hidden',
  },
  childCardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  childIconBox: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  childName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  childMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  childBtn: {
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingVertical: 12, alignItems: 'center',
  },
  childBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  // ── Performance (parent) ──
  perfGrid: { flexDirection: 'row', gap: 12 },
  perfCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  perfCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  perfSubject: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  perfPct: { fontSize: 15, fontWeight: '800' },
  perfTrack: { height: 8, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  perfFill: { height: '100%', borderRadius: 999 },
  perfNote: { fontSize: 11, color: Colors.textMuted },

  // ── Exam list (parent) ──
  examList: { gap: 10 },
  examCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  examDate: { alignItems: 'center', minWidth: 32 },
  examMonth: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  examDay: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  examInfo: { flex: 1 },
  examTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  examSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // ── Teacher suggestions (parent) ──
  suggestHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  suggestLink: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  suggestRow: { gap: 12, paddingBottom: 4, paddingRight: 4 },
  suggestCard: {
    width: 240, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  suggestAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  suggestAvatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  suggestName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  suggestSubject: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  suggestRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  suggestRatingText: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },

  // ── Notification preferences (parent) ──
  notifCard: {
    backgroundColor: Colors.surfaceLow + '80',
    borderRadius: 18, padding: 18, gap: 14,
  },
  notifList: { gap: 6 },
  notifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  notifLabel: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },

  // ── Logout shared ──
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.danger + '40',
    backgroundColor: Colors.dangerLight + '40',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.danger },
});
