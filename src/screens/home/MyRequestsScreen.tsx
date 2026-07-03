import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { HomeStackParamList } from '../../navigation/types';
import { listMyRequests, type MyLessonRequest } from '../../api/lessonRequest.api';
import { useTranslation } from '../../i18n';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.MyRequests>;
};

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

function timeAgo(iso: string, t: (k: string, v?: any) => string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('myRequests.timeNow');
  if (m < 60) return t('myRequests.timeMin', { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('myRequests.timeHour', { n: h });
  const d = Math.floor(h / 24);
  return t('myRequests.timeDay', { n: d });
}

export default function MyRequestsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  const { data: requests = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myLessonRequests'],
    queryFn: () => listMyRequests().catch(() => [] as MyLessonRequest[]),
  });

  const { active, completed } = useMemo(() => {
    const a: MyLessonRequest[] = [];
    const c: MyLessonRequest[] = [];
    for (const r of requests) {
      const status = (r.status ?? 'open').toLowerCase();
      if (status === 'completed' || status === 'closed' || status === 'fulfilled') c.push(r);
      else a.push(r);
    }
    return { active: a, completed: c };
  }, [requests]);

  const visible = tab === 'active' ? active : completed;

  const openCreate = () => {
    navigation.getParent()?.navigate('Booking', { screen: Routes.LessonRequest });
  };

  const openInterested = (req: MyLessonRequest) => {
    navigation.getParent()?.navigate('Booking', {
      screen: Routes.InterestedTeachers,
      params: { requestId: req.id, requestTitle: req.topic ?? req.subject },
    });
  };

  const handleEdit = () =>
    Alert.alert(t('myRequests.comingSoon'), t('myRequests.editSoon'));
  const handleDelete = () =>
    Alert.alert(t('myRequests.comingSoon'), t('myRequests.deleteSoon'));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('myRequests.headerTitle')}</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Hero + Create */}
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroKicker}>{t('myRequests.heroKicker')}</Text>
            <Text style={styles.heroTitle}>{t('myRequests.heroTitle')}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.9} onPress={openCreate}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCta}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.heroCtaText}>{t('myRequests.newRequest')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Segmented tabs */}
        <View style={styles.segWrap}>
          <TouchableOpacity
            style={[styles.segItem, tab === 'active' && styles.segItemActive]}
            onPress={() => setTab('active')}
            activeOpacity={0.85}
          >
            <Text style={[styles.segText, tab === 'active' && styles.segTextActive]}>
              {t('myRequests.tabActive')} {active.length > 0 ? `(${active.length})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segItem, tab === 'completed' && styles.segItemActive]}
            onPress={() => setTab('completed')}
            activeOpacity={0.85}
          >
            <Text style={[styles.segText, tab === 'completed' && styles.segTextActive]}>
              {t('myRequests.tabCompleted')} {completed.length > 0 ? `(${completed.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : visible.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {tab === 'active' ? t('myRequests.emptyActiveTitle') : t('myRequests.emptyCompletedTitle')}
            </Text>
            <Text style={styles.emptySub}>
              {tab === 'active'
                ? t('myRequests.emptyActiveSub')
                : t('myRequests.emptyCompletedSub')}
            </Text>
            {tab === 'active' && (
              <TouchableOpacity activeOpacity={0.9} onPress={openCreate} style={{ marginTop: 8 }}>
                <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyCta}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.emptyCtaText}>{t('myRequests.createFirst')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {visible.map((r) => (
              <View key={r.id} style={styles.card}>
                {/* Top: title + status pill */}
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {r.subject}{r.topic ? `: ${r.topic}` : ''}
                  </Text>
                  <View style={[styles.statusPill, tab === 'active' ? styles.statusOpen : styles.statusClosed]}>
                    <View style={[styles.statusDot, tab === 'active' ? { backgroundColor: '#10b981' } : { backgroundColor: Colors.textMuted }]} />
                    <Text style={[styles.statusPillText, tab === 'active' ? { color: '#047857' } : { color: Colors.textSecondary }]}>
                      {tab === 'active' ? t('myRequests.statusOpen') : t('myRequests.statusClosed')}
                    </Text>
                  </View>
                </View>

                {/* Subject + grade meta */}
                {r.grade && (
                  <Text style={styles.cardMeta}>
                    {r.grade}
                  </Text>
                )}

                {!!r.note && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>{t('myRequests.noteLabel')}</Text>
                    <Text style={styles.noteText}>{r.note}</Text>
                  </View>
                )}

                {/* Meta chips */}
                <View style={styles.chipsRow}>
                  <View style={styles.chipMuted}>
                    <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.chipMutedText}>{timeAgo(r.createdAt, t)}</Text>
                  </View>
                  <View style={styles.chipPrimary}>
                    <Ionicons name="people" size={13} color={Colors.primary} />
                    <Text style={styles.chipPrimaryText}>
                      {t('myRequests.interested', { n: r.interestedCount })}
                    </Text>
                  </View>
                </View>

                {/* Footer actions */}
                <View style={styles.cardFooter}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.iconBtn} onPress={handleEdit} activeOpacity={0.7}>
                      <Ionicons name="create-outline" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={handleDelete} activeOpacity={0.7}>
                      <Ionicons name="trash-outline" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => openInterested(r)} activeOpacity={0.7} style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>{t('myRequests.viewTeachers')}</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* AI Insight bottom card */}
            {tab === 'active' && (
              <View style={styles.aiCard}>
                <View style={styles.aiAura} pointerEvents="none" />
                <View style={styles.aiMascotWrap}>
                  <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiMascot}>
                    <Ionicons name="hardware-chip" size={36} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <View style={styles.aiPill}>
                    <Text style={styles.aiPillText}>{t('myRequests.aiAdvice')}</Text>
                  </View>
                  <Text style={styles.aiTitle}>{t('myRequests.aiTitle')}</Text>
                  <Text style={styles.aiText}>
                    {t('myRequests.aiTextPre')}
                    <Text style={styles.aiTextStrong}>{t('myRequests.aiTextStrong')}</Text>
                  </Text>
                  <TouchableOpacity activeOpacity={0.9} onPress={openCreate} style={styles.aiBtn}>
                    <Text style={styles.aiBtnText}>{t('myRequests.aiBtn')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 20, paddingBottom: 40, gap: 20 },

  /* Hero */
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroKicker: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5, opacity: 0.8 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginTop: 2 },
  heroCta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 4,
  },
  heroCtaText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  /* Segmented tabs */
  segWrap: {
    flexDirection: 'row', gap: 4,
    backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 6,
    alignSelf: 'flex-start',
  },
  segItem: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 12 },
  segItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  segText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  segTextActive: { color: Colors.primary, fontWeight: '800' },

  /* Empty */
  emptyBox: {
    alignItems: 'center', gap: 10, paddingVertical: 48,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 19 },
  emptyCta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999,
  },
  emptyCtaText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  /* Card */
  card: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 22, padding: 20, gap: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, lineHeight: 22 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  statusOpen: { backgroundColor: '#ECFDF5' },
  statusClosed: { backgroundColor: Colors.surfaceLow },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  cardMeta: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, fontStyle: 'italic' },
  noteBox: {
    backgroundColor: Colors.surfaceLow, borderRadius: 12, padding: 12, gap: 4,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  noteLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  noteText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 18 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipMuted: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  chipMutedText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  chipPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  chipPrimaryText: { fontSize: 11, fontWeight: '800', color: Colors.primary },

  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  iconBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  footerLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerLinkText: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1.2 },

  /* AI insight */
  aiCard: {
    backgroundColor: '#F8FAFC', borderRadius: 24, padding: 24,
    flexDirection: 'row', gap: 16, alignItems: 'center',
    overflow: 'hidden', position: 'relative',
  },
  aiAura: {
    position: 'absolute', bottom: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '0D',
  },
  aiMascotWrap: { flexShrink: 0 },
  aiMascot: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  aiPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  aiPillText: { fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5 },
  aiTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, lineHeight: 20 },
  aiText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  aiTextStrong: { fontWeight: '800', color: Colors.primary },
  aiBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 10,
    marginTop: 4,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3,
  },
  aiBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
});
