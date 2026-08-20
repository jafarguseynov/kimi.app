import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.MyExams>;
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const RECS = [
  { id: 'r1', titleKey: 'myExams.recLogic', count: 15, icon: 'calculator' as const },
  { id: 'r2', titleKey: 'myExams.recEnglish', count: 12, icon: 'language' as const },
];

export default function MyExamsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'S';

  const start = () => navigation.navigate(Routes.ExamInfo, { examId: 'magistr-riy-1', title: t('myExams.packTitle') });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{initial}</Text>
          </View>
          <Text style={styles.headerTitle}>{t('myExams.title')}</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ gap: 8 }}>
          <Text style={styles.heroTitle}>{t('myExams.heroTitle')}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>{t('myExams.activePill')}</Text>
            </View>
            <Text style={styles.updatedText}>{t('myExams.updated')}</Text>
          </View>
        </View>

        {/* Main exam card */}
        <View style={styles.mainCard}>
          <View style={styles.glow} pointerEvents="none" />
          <View style={{ gap: 16, zIndex: 1 }}>
            <View style={{ gap: 4 }}>
              <Text style={styles.kicker}>{t('myExams.packKicker')}</Text>
              <Text style={styles.mainCardTitle}>{t('myExams.packTitle')}</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{t('myExams.nQuestions', { n: 20 })}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{t('myExams.nMinutes', { n: 25 })}</Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={start}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
                <Text style={styles.startBtnText}>{t('myExams.start')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommendations */}
        <View>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('myExams.recommended')}</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate(Routes.ExamCategories)}>
              <Text style={styles.sectionMore}>{t('myExams.all')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recGrid}>
            {RECS.map((r) => (
              <View key={r.id} style={styles.recCard}>
                <View style={styles.recIconBox}>
                  <Ionicons name={r.icon} size={22} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.recTitle}>{t(r.titleKey)}</Text>
                  <Text style={styles.recCount}>{t('myExams.nMocks', { n: r.count })}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={styles.statsKicker}>{t('myExams.nearGoal')}</Text>
            <View style={styles.progressTrack}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.progressFill, { width: '75%' }]} />
            </View>
          </View>
          <Text style={styles.statsValue}>75%</Text>
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
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 24, gap: 40, paddingBottom: 48 },

  heroTitle: { fontSize: 38, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.8, lineHeight: 44 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  activePill: { backgroundColor: Colors.tertiary + '1A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  activePillText: { fontSize: 11, fontWeight: '700', color: Colors.tertiary },
  updatedText: { fontSize: 11, color: Colors.textSecondary },

  mainCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24,
    overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  glow: {
    position: 'absolute', bottom: -48, left: -48,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: Colors.primary + '14',
  },
  kicker: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5 },
  mainCardTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, lineHeight: 28 },
  metaRow: { flexDirection: 'row', gap: 16, paddingVertical: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 18, elevation: 4,
  },
  startBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  sectionMore: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  recGrid: { flexDirection: 'row', gap: 16 },
  recCard: {
    flex: 1, aspectRatio: 1, backgroundColor: Colors.surfaceLow,
    borderRadius: 16, padding: 20, justifyContent: 'space-between',
  },
  recIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  recTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  recCount: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  statsCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surfaceHigh + '80',
    padding: 24, borderRadius: 16,
  },
  statsKicker: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2, textTransform: 'uppercase' },
  progressTrack: { height: 8, backgroundColor: Colors.surfaceLow, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  statsValue: { fontSize: 26, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
});
