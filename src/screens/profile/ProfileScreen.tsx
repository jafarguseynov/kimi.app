import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { useLogout } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '../../api/dashboard.api';
import { getTeacherAnalytics, TeacherAnalytics, getTeachers } from '../../api/user.api';
import { getWallet } from '../../api/payment.api';
import { getExamResults, getCertificates } from '../../api/certificate.api';
import { UserStats } from '../../types/dashboard.types';
import { Switch } from 'react-native';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

// ─── Student ──────────────────────────────────────────────────────────────────

type MenuTab = 'self' | 'home' | 'exams';
const BASE_STUDENT_MENU = [
  { id: 'results', icon: 'analytics-outline', label: 'Mənim nəticələrim', sub: 'Ümumi performansın təhlili', tab: 'self' as MenuTab, route: Routes.ExamHistory },
  { id: 'history', icon: 'time-outline', label: 'İmtahan tarixçəsi', sub: 'Keçirilən bütün sınaqlar', tab: 'self' as MenuTab, route: Routes.ExamHistory },
  { id: 'questions', icon: 'help-circle-outline', label: 'Sual fəaliyyətim', sub: 'Düzgün və səhv cavablar', tab: 'self' as MenuTab, route: Routes.Achievements },
  { id: 'balance', icon: 'wallet-outline', label: 'Balansım', sub: '', tab: 'self' as MenuTab, route: Routes.Wallet },
  { id: 'goals', icon: 'flag-outline', label: 'Məqsədlərim', sub: 'Həftəlik hədəflər: 3/5', tab: 'home' as MenuTab, route: Routes.DailyMissions },
  { id: 'medals', icon: 'trophy-outline', label: 'Medallar', sub: '', tab: 'self' as MenuTab, route: Routes.Achievements },
  { id: 'certs', icon: 'ribbon-outline', label: 'Sertifikatlar', sub: '', tab: 'self' as MenuTab, route: Routes.CertificateList },
  { id: 'rewards', icon: 'gift-outline', label: 'Mükafat tarixçəsi', sub: '', tab: 'self' as MenuTab, route: Routes.RewardHistory },
  { id: 'duels', icon: 'flash-outline', label: 'Yarış tarixçəsi', sub: '', tab: 'self' as MenuTab, route: Routes.DuelHistory },
  { id: 'referral', icon: 'share-social-outline', label: 'Referal sistemi', sub: '5 dostunu dəvət et', tab: 'self' as MenuTab, route: Routes.Referral },
] as const;

function StudentView({ name, subtitle, logout, stats, walletBalance, navigation }: {
  name: string;
  subtitle?: string;
  logout: () => void;
  stats?: UserStats;
  walletBalance?: number;
  navigation: NativeStackNavigationProp<any>;
}) {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const firstName = name.split(' ')[0];

  const { data: results = [] } = useQuery({ queryKey: ['examResults'], queryFn: getExamResults });
  const { data: certs = [] } = useQuery({ queryKey: ['certificates'], queryFn: getCertificates });

  const totalXp = React.useMemo(() => {
    const examXp = results.reduce((s, r) => s + r.score * 10, 0);
    return examXp + certs.length * 100;
  }, [results, certs]);
  const level = Math.max(1, Math.floor(totalXp / 2000) + 1);
  const nextLevelXp = level * 2000;
  const prevLevelXp = (level - 1) * 2000;
  const xpProgress = Math.min(1, Math.max(0, (totalXp - prevLevelXp) / (nextLevelXp - prevLevelXp || 1)));
  const tier = totalXp >= 5000 ? 'Almaz'
    : totalXp >= 2000 ? 'Platin'
    : totalXp >= 1000 ? 'Qızıl'
    : totalXp >= 500 ? 'Gümüş'
    : 'Bürünc';
  const streak = stats?.streak ?? 0;
  const rating = 1000 + Math.round((stats?.averageScore ?? 0) * 4);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
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
          <View style={styles.levelChip}>
            <Text style={styles.levelChipText}>Level {level}</Text>
          </View>
        </View>
        <Text style={[styles.userName, { marginTop: 18 }]}>{firstName}</Text>
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
          <Text style={styles.statValue}>{streak} gün</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>{tier}</Text>
          <Text style={styles.statLabel}>Liqa</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue}>{rating}</Text>
          <Text style={styles.statLabel}>Reytinq</Text>
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
          <Text style={styles.aiCardTitle}>AI Plan Statistikası</Text>
          <Text style={styles.aiCardSub}>Süni intellekt analizi ilə tərəqqini izlə</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.tertiary} />
      </TouchableOpacity>

      {/* Menu */}
      <View style={styles.menuCard}>
        {BASE_STUDENT_MENU.map((item, i) => {
          const isBalance = item.id === 'balance';
          const sub = isBalance && walletBalance !== undefined
            ? `Cari vəsait: ${walletBalance.toFixed(2)} AZN`
            : item.sub;
          return (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, i < BASE_STUDENT_MENU.length - 1 && styles.menuItemDivider]}
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
            </View>
            <View style={styles.menuItemBody}>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
              {sub ? <Text style={styles.menuItemSub}>{sub}</Text> : null}
            </View>
            {isBalance && walletBalance !== undefined && walletBalance > 0 && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>AKTİV</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
          </TouchableOpacity>
          );
        })}
      </View>

      {/* Kimi tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Kimi-dən məsləhət!</Text>
        <Text style={styles.tipText}>
          {firstName}, bu gün Azərbaycan dili dərsinə 15 dəqiqə vaxt ayırsan, Qızıl Liqadakı yerini qoruya bilərsən! 🚀
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Çıxış</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Teacher ──────────────────────────────────────────────────────────────────

function TeacherView({ name, logout, analytics, subjects, bio, navigation }: {
  name: string; logout: () => void;
  analytics?: TeacherAnalytics;
  subjects?: string[];
  bio?: string;
  navigation: NativeStackNavigationProp<any>;
}) {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const teacherSubjects = subjects?.length ? subjects : [];
  const teacherBio = bio ?? '';

  const metrics = [
    { label: 'Aylıq Gəlir', value: analytics?.monthlyEarnings?.toString() ?? '—', unit: 'AZN', primary: true },
    { label: 'Tələbələr', value: analytics?.totalStudents?.toString() ?? '—', unit: '', primary: false },
    { label: 'Baxış sayı', value: analytics?.profileViews?.toString() ?? '—', unit: '', primary: false },
    { label: 'Aktiv Sorğular', value: analytics?.activeQueries?.toString() ?? '—', unit: '', primary: true },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* Avatar + rating */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          <LinearGradient colors={GRADIENT} style={styles.bigAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.bigAvatarInitial}>{initial}</Text>
          </LinearGradient>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        </View>
        <Text style={styles.userName}>{name}</Text>
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}>{analytics?.rating?.toFixed(1) ?? '—'} Reytinq</Text>
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

      {/* Earnings actions */}
      <View style={styles.earningsRow}>
        <TouchableOpacity
          style={styles.earningsPrimary}
          activeOpacity={0.88}
          onPress={() => navigation.navigate(Routes.Withdrawal)}
        >
          <LinearGradient colors={GRADIENT} style={styles.earningsGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="wallet-outline" size={18} color="#fff" />
            <Text style={styles.earningsPrimaryText}>Qazancı çıxar</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.earningsSecondary}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.PayoutHistory)}
        >
          <Ionicons name="time-outline" size={18} color={Colors.primary} />
          <Text style={styles.earningsSecondaryText}>Tarixçə</Text>
        </TouchableOpacity>
      </View>

      {/* Premium card */}
      <LinearGradient colors={GRADIENT} style={styles.premiumCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View style={styles.premiumLeft}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>Premium Status</Text>
          </View>
          <Text style={styles.premiumTitle}>Premium Müəllim</Text>
          <Text style={styles.premiumSub}>
            Profiliniz ön sıralarda göstərilir{'\n'}və daha çox tələbə sizi tapır.
          </Text>
        </View>
        <View style={styles.premiumIconWrap}>
          <Ionicons name="ribbon" size={42} color="#fff" />
        </View>
      </LinearGradient>

      {/* Müəllim İnkişafı */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Müəllim İnkişafı</Text>
        <View style={progStyles.list}>
          {[
            { key: 'badges', icon: 'ribbon' as const, title: 'Nailiyyətlər', sub: 'Qazandığın badges', route: Routes.TeacherBadges },
            { key: 'level', icon: 'flash' as const, title: 'Səviyyə', sub: 'XP & perks', route: Routes.TeacherLevel },
            { key: 'verified', icon: 'checkmark-done' as const, title: 'Verified ol', sub: 'Tələblər və status', route: Routes.VerifiedTeacher },
            { key: 'top', icon: 'trophy' as const, title: 'TOP Müəllim', sub: 'Leaderboard', route: Routes.TopTeachersLeaderboard },
            { key: 'premium', icon: 'person-circle' as const, title: 'Premium Profil', sub: 'Önizləmə', route: Routes.TeacherProfilePremium },
          ].map((it) => (
            <TouchableOpacity
              key={it.key}
              style={progStyles.row}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(it.route)}
            >
              <View style={progStyles.iconWrap}>
                <Ionicons name={it.icon} size={20} color={Colors.primary} />
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
          <Text style={styles.sectionTitle}>Fənlər</Text>
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
            <Text style={styles.sectionTitle}>Haqqımda</Text>
            <View style={styles.expBadge}>
              <Text style={styles.expBadgeText}>Təcrübəli</Text>
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
          <Text style={styles.editProfileText}>Profil Redaktə Et</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Çıxış</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Parent ───────────────────────────────────────────────────────────────────

const PARENT_PERFORMANCE = [
  { subject: 'Riyaziyyat', pct: 84, color: Colors.primary, note: 'Keçən aya nisbətən +5% artım' },
  { subject: 'Azərbaycan dili', pct: 92, color: Colors.tertiary, note: 'Mükəmməl nəticə!' },
];
const WEAK_TOPICS = ['Kəsrlər', 'Sifətin dərəcələri'];
const PARENT_EXAMS = [
  { month: 'Mar', day: '15', title: 'Aylıq Sınaq', sub: 'Bütün fənlər üzrə', accentColor: Colors.primary },
  { month: 'Apr', day: '02', title: 'Milli İmtahan', sub: 'Yekun qiymətləndirmə', accentColor: Colors.secondary },
];

function ParentView({ name, logout, childName, childGrade, childSchool, navigation }: { name: string; logout: () => void; childName?: string; childGrade?: string; childSchool?: string; navigation: NativeStackNavigationProp<any> }) {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const displayChild = childName || 'Övladın';
  const metaParts = [childGrade, childSchool].filter(Boolean).join(' • ') || 'Sinif və məktəb əlavə edilməyib';

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers', { limit: 6 }],
    queryFn: () => getTeachers({ limit: 6 }),
  });

  const [notifExam, setNotifExam] = React.useState(true);
  const [notifLesson, setNotifLesson] = React.useState(true);
  const [notifMessages, setNotifMessages] = React.useState(false);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
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
          <Text style={styles.roleBadgeText}>Valideyn</Text>
        </View>
      </View>

      {/* Linked child */}
      <View style={styles.childCard}>
        <View style={styles.childCardTop}>
          <View style={styles.childIconBox}>
            <Ionicons name="people-outline" size={22} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.childName}>Övladım: {displayChild}</Text>
            <Text style={styles.childMeta}>{metaParts}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.childBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(Routes.ParentChildren)}
        >
          <Text style={styles.childBtnText}>Hesabata bax</Text>
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
            <Text style={styles.perfNote}>{p.note}</Text>
          </View>
        ))}
      </View>

      {/* Weak topics */}
      <View style={styles.section}>
        <Text style={styles.sectionSmallTitle}>Zəif Mövzular</Text>
        <View style={styles.chipsRow}>
          {WEAK_TOPICS.map((t) => (
            <View key={t} style={styles.weakChip}>
              <Ionicons name="trending-down" size={14} color={Colors.danger} />
              <Text style={styles.weakChipText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Upcoming exams */}
      <View style={styles.section}>
        <Text style={styles.sectionSmallTitle}>Növbəti İmtahanlar</Text>
        <View style={styles.examList}>
          {PARENT_EXAMS.map((e) => (
            <View key={e.title} style={[styles.examCard, { borderLeftColor: e.accentColor }]}>
              <View style={styles.examDate}>
                <Text style={[styles.examMonth, { color: e.accentColor }]}>{e.month}</Text>
                <Text style={styles.examDay}>{e.day}</Text>
              </View>
              <View style={styles.examInfo}>
                <Text style={styles.examTitle}>{e.title}</Text>
                <Text style={styles.examSub}>{e.sub}</Text>
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
            <Text style={styles.sectionSmallTitle}>Müəllim Təklifləri</Text>
            <TouchableOpacity
              onPress={() => (navigation.getParent() as any)?.navigate('Marketplace')}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestLink}>Hamısı</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
            {teachers.map((t) => {
              const tInitial = t.name?.[0]?.toUpperCase() ?? '?';
              const subj = t.subjects?.[0] ?? 'Müəllim';
              return (
                <TouchableOpacity
                  key={t.id}
                  style={styles.suggestCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    (navigation.getParent() as any)?.navigate('Marketplace', {
                      screen: Routes.TeacherProfile,
                      params: { teacherId: t.id },
                      initial: false,
                    })
                  }
                >
                  <LinearGradient colors={GRADIENT} style={styles.suggestAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.suggestAvatarText}>{tInitial}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestName} numberOfLines={1}>{t.name}</Text>
                    <Text style={styles.suggestSubject} numberOfLines={1}>{subj}</Text>
                    <View style={styles.suggestRating}>
                      <Ionicons name="star" size={11} color="#F59E0B" />
                      <Text style={styles.suggestRatingText}>
                        {(t.rating ?? 0).toFixed(1)}
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
        <Text style={styles.sectionSmallTitle}>Bildiriş tənzimləmələri</Text>
        <View style={styles.notifList}>
          <View style={styles.notifRow}>
            <Text style={styles.notifLabel}>İmtahan nəticələri</Text>
            <Switch
              value={notifExam}
              onValueChange={setNotifExam}
              trackColor={{ false: Colors.surfaceVariant, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.notifRow}>
            <Text style={styles.notifLabel}>Dərs xatırlatmaları</Text>
            <Switch
              value={notifLesson}
              onValueChange={setNotifLesson}
              trackColor={{ false: Colors.surfaceVariant, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.notifRow}>
            <Text style={styles.notifLabel}>Yeni mesajlar</Text>
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
        <Text style={styles.logoutText}>Çıxış</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user } = useUserStore();
  const logout = useLogout();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const name = user?.name ?? 'İstifadəçi';
  const isTeacher = user?.role === 'teacher';
  const isStudent = !isTeacher && user?.role !== 'parent';

  const { data: stats } = useQuery({ queryKey: ['user-stats'], queryFn: getUserStats, enabled: isStudent });
  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: getWallet, enabled: isStudent });
  const { data: analytics } = useQuery({ queryKey: ['teacher-analytics'], queryFn: getTeacherAnalytics, enabled: isTeacher });

  const userAny = user as any;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <Text style={styles.headerTitle}>Profil</Text>
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
        <TeacherView name={name} logout={logout} analytics={analytics} subjects={userAny?.subjects} bio={userAny?.bio} navigation={navigation} />
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
  statsRow: { flexDirection: 'row', gap: 12 },
  statItem: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16,
    alignItems: 'center', justifyContent: 'center', gap: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  statItemGrad: { shadowColor: Colors.primary, shadowOpacity: 0.15 },
  statEmoji: { fontSize: 22, marginBottom: 2 },
  statLabel: { fontSize: 9, fontWeight: '800', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },

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
