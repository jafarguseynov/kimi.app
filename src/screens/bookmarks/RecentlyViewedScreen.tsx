import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useRecentTeachersStore, type RecentTeacher } from '../../store/recentTeachers.store';
import { getExamResults, type ExamResultRow } from '../../api/certificate.api';

type Tab = 'all' | 'teachers' | 'exams';
type Bucket = 'today' | 'yesterday' | 'older';
type Entry =
  | { kind: 'teacher'; data: RecentTeacher; ts: number }
  | { kind: 'exam'; data: ExamResultRow; ts: number };

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const initials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'indicə';
  if (mins < 60) return `${mins} dəq əvvəl`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat əvvəl`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 gün əvvəl';
  return `${days} gün əvvəl`;
}

function bucketOf(ts: number): Bucket {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86400000;
  if (ts >= startToday) return 'today';
  if (ts >= startYesterday) return 'yesterday';
  return 'older';
}

const BUCKET_LABEL: Record<Bucket, string> = { today: 'BUGÜN', yesterday: 'DÜNƏN', older: 'DAHA ƏVVƏL' };

export default function RecentlyViewedScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<Tab>('all');
  const recentTeachers = useRecentTeachersStore((s) => s.list);

  const { data: examResults = [], isLoading } = useQuery({
    queryKey: ['recent-exams'],
    queryFn: getExamResults,
    staleTime: 60_000,
  });

  const entries: Entry[] = useMemo(() => {
    const t: Entry[] = recentTeachers.map((x) => ({ kind: 'teacher', data: x, ts: x.viewedAt }));
    const e: Entry[] = examResults.slice(0, 10).map((x) => ({ kind: 'exam', data: x, ts: new Date(x.completedAt).getTime() }));
    const filtered: Entry[] = tab === 'teachers' ? t : tab === 'exams' ? e : [...t, ...e];
    return filtered.sort((a, b) => b.ts - a.ts);
  }, [recentTeachers, examResults, tab]);

  const groups = useMemo(() => {
    const map: Record<Bucket, Entry[]> = { today: [], yesterday: [], older: [] };
    entries.forEach((e) => map[bucketOf(e.ts)].push(e));
    return (['today', 'yesterday', 'older'] as Bucket[])
      .map((k) => ({ key: k, label: BUCKET_LABEL[k], items: map[k] }))
      .filter((g) => g.items.length > 0);
  }, [entries]);

  const renderTeacher = (t: RecentTeacher) => (
    <TouchableOpacity
      key={`t-${t.id}-${t.viewedAt}`}
      style={[styles.card, { marginLeft: 16 }]}
      activeOpacity={0.88}
      onPress={() => navigation.getParent()?.navigate('Booking', { screen: Routes.TeacherProfile, params: { teacher: t } })}
    >
      <View style={styles.photoWrap}>
        {t.avatarUrl ? (
          <Image source={{ uri: t.avatarUrl }} style={styles.photo} />
        ) : (
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.photo}>
            <Text style={styles.photoInitial}>{initials(t.name)}</Text>
          </LinearGradient>
        )}
        {t.isVerified && (
          <View style={styles.photoBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.tertiary} />
          </View>
        )}
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName} numberOfLines={1}>{t.name}</Text>
          <Text style={styles.timeChip}>{relativeTime(t.viewedAt)}</Text>
        </View>
        <Text style={styles.cardSub}>{t.subject ?? 'Müxtəlif fənlər'}{t.experience ? ` • ${t.experience}` : ''}</Text>
        <View style={styles.cardActionRow}>
          <Ionicons name="eye-outline" size={14} color={Colors.primary} />
          <Text style={styles.cardActionText}>Profilə baxıldı</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExam = (r: ExamResultRow) => (
    <TouchableOpacity
      key={`e-${r.id}`}
      style={[styles.card, { marginLeft: 16 }]}
      activeOpacity={0.88}
      onPress={() => navigation.getParent()?.navigate('Exams', { screen: Routes.ExamResult, params: { examId: r.examId } })}
    >
      <View style={styles.examIconBox}>
        <Ionicons name="help-circle" size={28} color={Colors.primary} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName} numberOfLines={1}>{r.examTitle}</Text>
          <Text style={styles.timeChip}>{relativeTime(new Date(r.completedAt).getTime())}</Text>
        </View>
        <Text style={styles.cardSub}>{r.subject ?? 'İmtahan'} • {r.score}/{r.total}</Text>
        <View style={styles.cardActionRow}>
          <Ionicons name="checkmark-done" size={14} color={Colors.tertiary} />
          <Text style={[styles.cardActionText, { color: Colors.tertiary }]}>Nəticə: {r.percentage}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Təhsil</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Son Baxılanlar</Text>
          <Text style={styles.subtitle}>Son fəaliyyətləriniz və baxış tarixçəniz</Text>
        </View>

        {/* Segmented */}
        <View style={styles.segmented}>
          {([
            { id: 'all', label: 'Hamısı' },
            { id: 'teachers', label: 'Müəllimlər' },
            { id: 'exams', label: 'İmtahanlar' },
          ] as { id: Tab; label: string }[]).map((opt) => {
            const active = tab === opt.id;
            return (
              <TouchableOpacity
                key={opt.id} activeOpacity={0.85}
                style={[styles.segItem, active && styles.segItemActive]}
                onPress={() => setTab(opt.id)}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading && entries.length === 0 ? (
          <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
        ) : groups.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={42} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Hələ baxılan yoxdur</Text>
            <Text style={styles.emptySub}>Müəllim və imtahan baxışlarınız burada görünəcək</Text>
          </View>
        ) : (
          <View style={{ gap: 40, position: 'relative' }}>
            <View style={styles.timelineBar} pointerEvents="none" />
            {groups.map((g, gi) => (
              <View key={g.key} style={{ gap: 14 }}>
                <View style={styles.dateGroupHeader}>
                  <View style={[
                    styles.dot,
                    gi === 0
                      ? { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 8 }
                      : { backgroundColor: Colors.surfaceHigh },
                  ]} />
                  <Text style={[styles.dateLabel, gi === 0 && { color: Colors.primary }]}>{g.label}</Text>
                </View>
                {g.items.map((entry) => entry.kind === 'teacher' ? renderTeacher(entry.data) : renderExam(entry.data))}
              </View>
            ))}
          </View>
        )}

        {/* AI insight */}
        <View style={{ marginLeft: 16, marginTop: 32 }}>
          <LinearGradient
            colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.aiCard}
          >
            <View style={styles.aiKickerRow}>
              <Ionicons name="flash" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.aiKicker}>KİMİ ROBOT TÖVSİYƏSİ</Text>
            </View>
            <Text style={styles.aiTitle}>Aysel müəllimənin sınaq imtahanına baxmaq istərdiniz?</Text>
            <Text style={styles.aiSub}>Onun son baxdığınız dərsinə uyğun yeni testləri var.</Text>
            <TouchableOpacity style={styles.aiCta} activeOpacity={0.85}>
              <Text style={styles.aiCtaText}>İndi bax</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 24, paddingBottom: 48 },

  pageHeader: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  segmented: {
    flexDirection: 'row', backgroundColor: Colors.surfaceLow,
    borderRadius: 16, padding: 6, marginBottom: 32, gap: 4,
  },
  segItem: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  segItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  segText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  segTextActive: { fontWeight: '700', color: Colors.primary },

  center: { paddingVertical: 60, alignItems: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 60 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', maxWidth: 240, lineHeight: 18 },

  timelineBar: {
    position: 'absolute', left: 6, top: 4, bottom: 4, width: 2,
    backgroundColor: Colors.primary + '22',
  },

  dateGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  dateLabel: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.5 },

  card: {
    flexDirection: 'row', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 2,
  },
  photoWrap: { position: 'relative' },
  photo: {
    width: 72, height: 72, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  photoInitial: { color: '#fff', fontSize: 24, fontWeight: '800' },
  photoBadge: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: '#fff', borderRadius: 8, padding: 2,
    borderWidth: 2, borderColor: '#fff',
  },
  examIconBox: {
    width: 72, height: 72, borderRadius: 16,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardName: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  timeChip: {
    fontSize: 10, fontWeight: '600', color: Colors.textSecondary,
    backgroundColor: Colors.surfaceLow,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  cardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  cardActionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  cardActionText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  /* AI */
  aiCard: {
    borderRadius: 16, padding: 24, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 6,
  },
  aiKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiKicker: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.2 },
  aiTitle: { fontSize: 17, fontWeight: '800', color: '#fff', lineHeight: 22, marginBottom: 8 },
  aiSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  aiCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
  },
  aiCtaText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
});
