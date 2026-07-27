import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { getTopicStats } from '../../api/topicStats.api';

interface Weak {
  id: string;
  topic: string;
  errorPct: number;
  severity: 'high' | 'medium';
}

const SEVERITY: Record<Weak['severity'], { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  high:   { color: Colors.danger,  icon: 'alert-circle' },
  medium: { color: '#F59E0B',      icon: 'warning' },
};

export default function WeakTopicsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['topic-stats'],
    queryFn: getTopicStats,
  });

  // Real zəif fənlər (avg < 60) → errorPct = 100 - avg.
  const weakList = useMemo<Weak[]>(() => {
    const all = stats?.all ?? [];
    const weakNames = new Set(stats?.weak ?? []);
    return all
      .filter((s) => weakNames.has(s.subject) || s.avg < 60)
      .sort((a, b) => a.avg - b.avg)
      .map((s, i) => ({
        id: String(i),
        topic: s.subject,
        errorPct: Math.max(0, Math.min(100, 100 - s.avg)),
        severity: s.avg < 40 ? 'high' : 'medium',
      }));
  }, [stats]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('weakTopics.title')}</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* AI Analysis */}
        <View style={styles.analysisWrap}>
          <View style={styles.analysisCard}>
            <View style={styles.analysisIcon}>
              <Ionicons name="hardware-chip" size={26} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, paddingTop: 2 }}>
              <Text style={styles.analysisTitle}>{t('weakTopics.aiAnalyzed')}</Text>
              <Text style={styles.analysisSub}>{t('weakTopics.aiAnalyzedSub')}</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('weakTopics.updated')}</Text>
          </View>
        </View>

        {/* Section */}
        <View style={{ gap: 20 }}>
          <Text style={styles.sectionTitle}>{t('weakTopics.attentionSection')}</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ paddingVertical: 24 }} />
          ) : weakList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="checkmark-circle" size={40} color={Colors.tertiary} />
              <Text style={styles.emptyText}>{t('weakTopics.empty')}</Text>
            </View>
          ) : weakList.map((w) => {
            const sev = SEVERITY[w.severity];
            return (
              <View key={w.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.cardTitle}>{w.topic}</Text>
                    <View style={styles.errorRow}>
                      <Ionicons name={sev.icon} size={16} color={sev.color} />
                      <Text style={[styles.errorText, { color: sev.color }]}>{t('weakTopics.errorPct', { n: w.errorPct })}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.repeatBtn}
                    onPress={() => navigation.navigate(Routes.TopicProgress, { topic: w.topic })}
                  >
                    <Text style={styles.repeatBtnText}>{t('weakTopics.review')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${w.errorPct}%` as any, backgroundColor: sev.color }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Kimi tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipKickerRow}>
            <Ionicons name="bulb" size={20} color={Colors.primary} />
            <Text style={styles.tipKicker}>{t('weakTopics.tipKicker')}</Text>
          </View>
          <Text style={styles.tipText}>{t('weakTopics.tipText')}</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(245,247,249,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, flex: 1, textAlign: 'center' },

  scroll: { padding: 16, gap: 40, paddingBottom: 48 },

  /* Analysis */
  analysisWrap: { position: 'relative', marginTop: 8 },
  analysisCard: {
    flexDirection: 'row', gap: 16, alignItems: 'flex-start',
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 22, elevation: 3,
  },
  analysisIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  analysisTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6, lineHeight: 20 },
  analysisSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  badge: {
    position: 'absolute', top: -12, right: 24,
    backgroundColor: Colors.tertiary + '33',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
    borderWidth: 2, borderColor: Colors.surfaceLowest,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: Colors.tertiary, letterSpacing: 0.5 },

  /* Empty */
  emptyBox: { alignItems: 'center', gap: 12, paddingVertical: 28 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 },

  /* Card */
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 20, gap: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { fontSize: 13, fontWeight: '600' },
  repeatBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
  },
  repeatBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  progressTrack: { height: 10, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },

  /* Tip */
  tipCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 24, gap: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 22, elevation: 2,
  },
  tipKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipKicker: { fontSize: 12, fontWeight: '800', color: Colors.primary, letterSpacing: 1.4 },
  tipText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary, lineHeight: 22 },
});
