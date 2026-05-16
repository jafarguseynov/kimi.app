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
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { useLogout } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '../../api/dashboard.api';
import { getTeacherAnalytics, TeacherAnalytics } from '../../api/user.api';
import { getWallet } from '../../api/payment.api';
import { UserStats } from '../../types/dashboard.types';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

// ─── Student ──────────────────────────────────────────────────────────────────

const BASE_STUDENT_MENU = [
  { id: 'medals', icon: 'trophy-outline', label: 'Medallar', sub: '' },
  { id: 'certs', icon: 'ribbon-outline', label: 'Sertifikatlar', sub: '' },
  { id: 'referral', icon: 'share-social-outline', label: 'Referal sistemi', sub: '5 dostunu dəvət et' },
  { id: 'balance', icon: 'wallet-outline', label: 'Balans', sub: '' },
  { id: 'results', icon: 'time-outline', label: 'Son nəticələr', sub: '' },
] as const;

function StudentView({ name, logout, stats, walletBalance }: { name: string; logout: () => void; stats?: UserStats; walletBalance?: number }) {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const firstName = name.split(' ')[0];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          <LinearGradient colors={GRADIENT} style={styles.bigAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.bigAvatarInitial}>{initial}</Text>
          </LinearGradient>
          <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
            <Ionicons name="pencil" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{name}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="document-text-outline" size={26} color={Colors.primary} style={{ marginBottom: 6 }} />
          <Text style={styles.statLabel}>İmtahan</Text>
          <Text style={styles.statValue}>{stats?.totalExams ?? 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="bar-chart-outline" size={26} color={Colors.primary} style={{ marginBottom: 6 }} />
          <Text style={styles.statLabel}>Orta bal</Text>
          <Text style={styles.statValue}>{stats?.averageScore ?? 0}%</Text>
        </View>
        <LinearGradient colors={GRADIENT} style={[styles.statItem, styles.statItemGrad]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="flame" size={26} color="#fff" style={{ marginBottom: 6 }} />
          <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>Aktiv gün</Text>
          <Text style={[styles.statValue, { color: '#fff' }]}>{stats?.activeDays ?? 0}</Text>
        </LinearGradient>
      </View>

      {/* AI card */}
      <TouchableOpacity style={styles.aiCard} activeOpacity={0.88}>
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
          const sub = item.id === 'balance' && walletBalance !== undefined
            ? `${walletBalance.toFixed(2)} AZN`
            : item.sub;
          return (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, i < BASE_STUDENT_MENU.length - 1 && styles.menuItemDivider]}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name={item.icon} size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuItemBody}>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
              {sub ? <Text style={styles.menuItemSub}>{sub}</Text> : null}
            </View>
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

function TeacherView({ name, logout, analytics, subjects, bio }: {
  name: string; logout: () => void;
  analytics?: TeacherAnalytics;
  subjects?: string[];
  bio?: string;
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
      <TouchableOpacity style={styles.editProfileBtn} activeOpacity={0.88}>
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

function ParentView({ name, logout }: { name: string; logout: () => void }) {
  const initial = name?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* Avatar */}
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
            <Text style={styles.childName}>Övladım: Cəfər Yusifov</Text>
            <Text style={styles.childMeta}>9-cu sinif • 160 saylı məktəb</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.childBtn} activeOpacity={0.8}>
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
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="menu" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isTeacher ? (
        <TeacherView name={name} logout={logout} analytics={analytics} subjects={userAny?.subjects} bio={userAny?.bio} />
      ) : user?.role === 'parent' ? (
        <ParentView name={name} logout={logout} />
      ) : (
        <StudentView name={name} logout={logout} stats={stats} walletBalance={wallet?.balance} />
      )}
    </SafeAreaView>
  );
}

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
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  statItemGrad: { shadowColor: Colors.primary, shadowOpacity: 0.15 },
  statLabel: { fontSize: 9, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  statValue: { fontSize: 15, fontWeight: '800', color: Colors.primary, marginTop: 2 },

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
  perfGrid: { gap: 12 },
  perfCard: {
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

  // ── Logout shared ──
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.danger + '40',
    backgroundColor: Colors.dangerLight + '40',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.danger },
});
