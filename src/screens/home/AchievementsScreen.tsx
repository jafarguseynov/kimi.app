import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { getExamResults, getCertificates, type Certificate } from '../../api/certificate.api';

type Props = { navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.Achievements> };

const STREAK_GOAL = 30;
const XP_PER_LEVEL = 1000;

type MedalDef = { id: string; label: string; bg: string; border: string; color: string };
type BadgeDef = { id: string; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; unlocked: boolean };

export default function AchievementsScreen({ navigation }: Props) {
  const user = useUserStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'şagird';
  const { data: results = [] } = useQuery({ queryKey: ['examResults'], queryFn: getExamResults });
  const { data: certs = [] } = useQuery({ queryKey: ['certificates'], queryFn: getCertificates });

  const stats = useMemo(() => {
    const examCount = results.length;
    const certCount = certs.length;
    const passedCount = results.filter((r) => r.percentage >= 70).length;
    const topCount = results.filter((r) => r.percentage >= 90).length;
    const xpFromExams = results.reduce((s, r) => s + r.score * 10, 0);
    const xpFromCerts = certCount * 100;
    const totalXp = xpFromExams + xpFromCerts;
    const currentLevel = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
    const xpInLevel = totalXp % XP_PER_LEVEL;
    const levelPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

    // Real consecutive-day streak from completedAt timestamps.
    const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const days = new Set<string>();
    for (const r of results) {
      if (!r.completedAt) continue;
      const d = new Date(r.completedAt);
      if (!isNaN(d.getTime())) days.add(dayKey(d));
    }
    let streak = 0;
    if (days.size > 0) {
      const cursor = new Date();
      if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
      while (days.has(dayKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
    const streakPct = Math.min(100, Math.round((streak / STREAK_GOAL) * 100));
    return { examCount, certCount, passedCount, topCount, totalXp, currentLevel, xpInLevel, levelPct, streak, streakPct };
  }, [results, certs]);

  const medals: MedalDef[] = useMemo(() => {
    const list: MedalDef[] = [];
    if (stats.topCount >= 1) list.push({ id: 'gold', label: 'Qızıl Lider', bg: '#FFFBEB', border: '#FEF3C7', color: '#F59E0B' });
    if (stats.passedCount >= 3) list.push({ id: 'silver', label: 'Gümüş Sürət', bg: '#F8FAFC', border: '#F1F5F9', color: '#94A3B8' });
    if (stats.examCount >= 1) list.push({ id: 'bronze', label: 'Bürünc Əzm', bg: '#FFF7ED', border: '#FFEDD5', color: '#FB923C' });
    return list;
  }, [stats]);

  const badges: BadgeDef[] = useMemo(() => [
    { id: 'fast',   label: 'Sürətli Öyrənən',    icon: 'flash',     color: Colors.primary, unlocked: stats.examCount >= 3 },
    { id: 'night',  label: 'Gecə Quşu',          icon: 'moon',      color: '#6366F1',     unlocked: stats.examCount >= 5 },
    { id: 'math',   label: 'Riyaziyyat Dahisi',  icon: 'calculator',color: '#F59E0B',     unlocked: stats.topCount >= 1 },
    { id: 'book',   label: 'Kitab Qurdu',        icon: 'book',      color: '#10B981',     unlocked: stats.certCount >= 2 },
    { id: 'precise',label: 'Dəqiq Şagird',       icon: 'eye',       color: '#0EA5E9',     unlocked: stats.passedCount >= 5 },
    { id: 'master', label: 'Master',             icon: 'star',      color: '#A855F7',     unlocked: stats.currentLevel >= 7 },
  ], [stats]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.brandAvatar}>
            <Ionicons name="school" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Nailiyyətlər</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={{ gap: 6 }}>
          <Text style={styles.greetingTitle}>Uğurlarınla fəxr edirik, {firstName}!</Text>
          <Text style={styles.greetingSub}>
            {stats.examCount > 0
              ? `Bu vaxta qədər ${stats.examCount} imtahan tamamlamısan.`
              : 'Bu gün ilk imtahanına başlamaq üçün ən yaxşı andır.'}
          </Text>
        </View>

        {/* Streak card */}
        <TouchableOpacity
          style={styles.streakCard}
          activeOpacity={0.92}
          onPress={() => (navigation as any).navigate(Routes.StreakProtection, { currentStreak: stats.streak })}
        >
          <View style={styles.streakAura} pointerEvents="none" />
          <TouchableOpacity
            style={styles.streakInfoBtn}
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => Alert.alert(
              'Streak necə işləyir?',
              'Streak — ardıcıl günlərdə tətbiqdə fəal olduğun gün sayıdır. Hər gün ən azı 1 imtahan tamamladığında streak +1 olur.\n\n• Hədəf: 30 gün üst-üstə davam etmək\n• Bir gün belə dərs etməsən streak sıfırlanır\n• Yuxarıdakı zolaq cari irəliləyişini göstərir\n• Kartı tıkla → Streak qoruması ekranı (premium dondurma)\n\nStreak sənə intizam verir və yüksək streak nailiyyət xalları (XP) qazandırır.',
              [{ text: 'Anladım' }],
            )}
          >
            <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
          <View style={styles.streakHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
              <Ionicons name="flame" size={22} color="#fff" />
              <Text style={styles.streakTitle}>
                {stats.streak > 0 ? `${stats.streak} günlük streak!` : 'Streak başlat'}
              </Text>
            </View>
            <Text style={styles.streakGoal}>Hədəf: {STREAK_GOAL} gün</Text>
          </View>
          <View style={{ gap: 8 }}>
            <View style={styles.streakTrack}>
              <View style={[styles.streakFill, { width: `${stats.streakPct}%` }]} />
            </View>
            <View style={styles.streakLabels}>
              <Text style={styles.streakLabel}>Başlanğıc</Text>
              <Text style={styles.streakLabel}>Məqsəd</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <TouchableOpacity
              style={styles.statInfoBtn}
              activeOpacity={0.7}
              hitSlop={8}
              onPress={() => Alert.alert(
                'Qələbə nədir?',
                'Qələbə — keçid balından (50%) yuxarı nəticə ilə bitirdiyin imtahanların sayıdır.\n\nHər uğurlu imtahan bir qələbə kimi sayılır və profilinə əlavə olunur. Qələbə sayı medallar (Bürünc Əzm, Gümüş Sürət) və nişanlar (Dəqiq Şagird) qazanmaq üçün vacibdir.',
                [{ text: 'Anladım' }],
              )}
            >
              <Ionicons name="information-circle-outline" size={16} color={Colors.outline} />
            </TouchableOpacity>
            <Text style={styles.statNum}>{stats.passedCount}</Text>
            <Text style={styles.statLabel}>QƏLƏBƏ</Text>
          </View>
          <View style={styles.statCard}>
            <TouchableOpacity
              style={styles.statInfoBtn}
              activeOpacity={0.7}
              hitSlop={8}
              onPress={() => Alert.alert(
                'TOP 10 nədir?',
                'TOP 10 — imtahanda 90%-dən yuxarı nəticə qazanaraq ən yaxşı 10 iştirakçı sırasına düşdüyün dəfələrin sayıdır.\n\nTOP 10-a düşmək çətindir və hər dəfə Qızıl Lider medalına yaxınlaşırsan. Liderlik cədvəlində adın görünür, başqa şagirdlərə nümunə olursan.',
                [{ text: 'Anladım' }],
              )}
            >
              <Ionicons name="information-circle-outline" size={16} color={Colors.outline} />
            </TouchableOpacity>
            <Text style={styles.statNum}>{stats.topCount}</Text>
            <Text style={styles.statLabel}>TOP 10</Text>
          </View>
        </View>

        {/* Medals */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Medallar</Text>
            <TouchableOpacity
              style={styles.infoBtn}
              activeOpacity={0.7}
              hitSlop={8}
              onPress={() => Alert.alert(
                'Medallar nədir?',
                'Medallar imtahan nəticələrinə görə qazandığın xüsusi mükafatlardır. 3 növü var:\n\n🥇 Qızıl Lider — ən azı 1 imtahanda top sıralamaya düş\n🥈 Gümüş Sürət — 3 imtahandan keç\n🥉 Bürünc Əzm — ilk imtahanını tamamla\n\nNişanlardan fərqli olaraq medallar yalnız imtahan performansına əsaslanır və avtomatik qazanılır.',
                [{ text: 'Anladım' }],
              )}
            >
              <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {medals.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.medalsRow}
            >
              {medals.map((m) => (
                <View key={m.id} style={styles.medalItem}>
                  <View style={[styles.medalCircle, { backgroundColor: m.bg, borderColor: m.border }]}>
                    <Ionicons name="medal" size={36} color={m.color} />
                  </View>
                  <Text style={styles.medalLabel}>{m.label}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyHint}>İlk imtahanını tamamla — medallarını burada görəcəksən.</Text>
          )}
        </View>

        {/* Level milestones timeline */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Səviyyə Mərhələləri</Text>
            <TouchableOpacity
              style={styles.infoBtn}
              activeOpacity={0.7}
              hitSlop={8}
              onPress={() => Alert.alert(
                'Səviyyə Mərhələləri necə işləyir?',
                'Hər fəaliyyətinə görə XP (təcrübə xalları) qazanırsan. 1000 XP topladıqda növbəti səviyyəyə yüksəlirsən.\n\n• ✅ Tamamlanmış səviyyələr yaşıl işarələnir\n• 🔵 Cari səviyyə mavi rənglə göstərilir + irəliləyiş indikatoru\n• 🔒 Növbəti səviyyələr kilidli qalır — onları açmaq üçün cari səviyyənin XP-sini doldurmalısan\n\nXP qazanmaq üçün: imtahan tamamla, gündəlik missiyaları yerinə yetir, sertifikat qazan və ya AI mentor ilə öyrən.',
                [{ text: 'Anladım' }],
              )}
            >
              <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.timelineCard}>
            <View style={styles.timelineLine} />

            {/* Completed (previous level) */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#22C55E' }]}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineTitle}>Səviyyə {Math.max(1, stats.currentLevel - 1)}</Text>
                <Text style={styles.timelineSub}>Tamamlandı</Text>
              </View>
            </View>

            {/* Active */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: Colors.primary }]}>
                <View style={styles.timelineDotInner} />
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <View>
                  <Text style={[styles.timelineTitle, { color: Colors.primary }]}>
                    Səviyyə {stats.currentLevel} (Cari)
                  </Text>
                  <Text style={styles.timelineSub}>
                    {stats.xpInLevel} / {XP_PER_LEVEL} XP
                  </Text>
                </View>
                <View style={styles.timelineTrack}>
                  <View style={[styles.timelineFill, { width: `${stats.levelPct}%` }]} />
                </View>
              </View>
            </View>

            {/* Locked */}
            <View style={[styles.timelineItem, { opacity: 0.45 }]}>
              <View style={[styles.timelineDot, { backgroundColor: '#E2E8F0' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineTitle}>Səviyyə {stats.currentLevel + 1}</Text>
                <Text style={styles.timelineSub}>Kilidi açılmayıb</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Certificates */}
        {certs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sertifikatlar</Text>
              <TouchableOpacity
                hitSlop={8}
                onPress={() => (navigation.getParent() as any)?.navigate('Exams', { screen: Routes.CertificateList })}
              >
                <Text style={styles.sectionLink}>Hamısı</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.certsRow}
            >
              {certs.slice(0, 6).map((c: Certificate) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.certCard}
                  activeOpacity={0.88}
                  onPress={() =>
                    (navigation.getParent() as any)?.navigate('Exams', {
                      screen: Routes.CertificatePreview,
                      params: { examId: c.examId },
                    })
                  }
                >
                  <View style={styles.certImageWrap}>
                    <View style={styles.certPlaceholder}>
                      <Ionicons name="ribbon" size={36} color={Colors.primary} />
                      <Text style={styles.certScore}>{c.percentage}%</Text>
                    </View>
                  </View>
                  <View style={{ padding: 14, gap: 4 }}>
                    <Text style={styles.certTitle} numberOfLines={1}>{c.examTitle}</Text>
                    <Text style={styles.certDate}>
                      {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('az-Latn-AZ', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Badges grid */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Nişanlar</Text>
            <TouchableOpacity
              style={styles.infoBtn}
              activeOpacity={0.7}
              hitSlop={8}
              onPress={() => Alert.alert(
                'Nişanlar nədir?',
                'Nişanlar tətbiqdəki fəaliyyətinə görə qazandığın xüsusi simvollardır. Hər nişanın öz şərti var:\n\n• Sürətli Öyrənən — 3 imtahan tamamla\n• Gecə Quşu — 5 imtahan tamamla\n• Riyaziyyat Dahisi — 1 dəfə top sıralamaya çıx\n• Kitab Qurdu — 2 sertifikat qazan\n• Dəqiq Şagird — 5 imtahandan keç\n• Master — 7-ci səviyyəyə çat\n\nKilidli (🔒) nişanlar şərt tamamlandıqdan sonra avtomatik açılır.',
                [{ text: 'Anladım' }],
              )}
            >
              <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.badgesGrid}>
            {badges.map((b) => (
              <View key={b.id} style={styles.badgeItem}>
                <View style={[
                  styles.badgeBox,
                  b.unlocked ? styles.badgeBoxUnlocked : styles.badgeBoxLocked,
                ]}>
                  <Ionicons
                    name={b.unlocked ? b.icon : 'lock-closed'}
                    size={26}
                    color={b.unlocked ? b.color : Colors.textSecondary}
                  />
                </View>
                <Text style={[styles.badgeLabel, !b.unlocked && { opacity: 0.45 }]} numberOfLines={2}>
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, gap: 32 },

  greetingTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6, lineHeight: 32 },
  greetingSub: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },

  /* Streak */
  streakCard: {
    backgroundColor: Colors.primary,
    borderRadius: 28, padding: 28, gap: 24, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6,
  },
  streakAura: {
    position: 'absolute', top: -48, right: -48,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  streakTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  streakGoal: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 6 },
  streakTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' },
  streakFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },
  streakLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  streakLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#fcfcfc',
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: 20, paddingVertical: 22,
    alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  statNum: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.6 },

  /* Section */
  section: { gap: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  streakInfoBtn: {
    position: 'absolute', top: 12, right: 12, zIndex: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  statInfoBtn: {
    position: 'absolute', top: 8, right: 8, zIndex: 2,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionLink: { fontSize: 13, fontWeight: '800', color: Colors.primary },

  /* Medals */
  medalsRow: { gap: 22, paddingVertical: 4, paddingRight: 24 },
  medalItem: { alignItems: 'center', gap: 12, minWidth: 100 },
  medalCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  medalLabel: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },

  /* Timeline */
  timelineCard: {
    backgroundColor: '#fcfcfc',
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: 24, padding: 28, gap: 36,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 28 + 11,
    top: 38, bottom: 38,
    width: 1, backgroundColor: Colors.borderLight,
  },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#fff',
  },
  timelineDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  timelineTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  timelineSub: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  timelineTrack: { height: 6, backgroundColor: Colors.borderLight, borderRadius: 999, overflow: 'hidden' },
  timelineFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },

  /* Certificates */
  certsRow: { gap: 16, paddingBottom: 4, paddingRight: 24 },
  certCard: {
    width: 240,
    backgroundColor: '#fcfcfc',
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  certImageWrap: { aspectRatio: 16 / 9, backgroundColor: Colors.primaryLight },
  certPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  certScore: { fontSize: 13, fontWeight: '800', color: Colors.primary, letterSpacing: 0.5 },
  certTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  certDate: { fontSize: 11, color: Colors.textSecondary },

  /* Badges */
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 20 },
  badgeItem: {
    width: '30%',
    alignItems: 'center', gap: 10,
  },
  badgeBox: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeBoxUnlocked: {
    backgroundColor: '#fcfcfc',
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  badgeBoxLocked: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.borderLight,
  },
  badgeLabel: { fontSize: 10, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', lineHeight: 13 },

  emptyHint: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
});
