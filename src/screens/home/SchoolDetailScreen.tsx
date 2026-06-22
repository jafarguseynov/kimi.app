import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type RouteProps = RouteProp<HomeStackParamList, typeof Routes.SchoolDetail>;

const TOP_STUDENTS = [
  { name: 'Elmir Məmmədov', grade: '11A', score: '98.4', rank: 1 },
  { name: 'Leyla Əliyeva', grade: '10C', score: '97.2', rank: 2 },
  { name: 'Aytən Hüseynova', grade: '11B', score: '96.8', rank: 3 },
];

const ACHIEVEMENTS = [
  { icon: 'trophy-outline' as const, bg: '#FEF3C7', color: '#D97706', titleKey: 'schoolDetail.ach1Title', subKey: 'schoolDetail.ach1Sub' },
  { icon: 'ribbon-outline' as const, bg: Colors.primaryLight, color: Colors.primary, titleKey: 'schoolDetail.ach2Title', subKey: 'schoolDetail.ach2Sub' },
  { icon: 'flask-outline' as const, bg: '#D1FAE5', color: '#059669', titleKey: 'schoolDetail.ach3Title', subKey: 'schoolDetail.ach3Sub' },
  { icon: 'globe-outline' as const, bg: '#EDE9FE', color: '#7C3AED', titleKey: 'schoolDetail.ach4Title', subKey: 'schoolDetail.ach4Sub' },
];

export default function SchoolDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProps>();
  const { t } = useTranslation();
  const schoolName = route.params?.schoolName ?? t('schoolDetail.defaultName');

  const handleShare = () => {
    Share.share({ message: t('schoolDetail.shareMsg', { name: schoolName }) });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{t('schoolDetail.headerTitle')}</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero — photo-like */}
        <View style={styles.heroWrap}>
          <LinearGradient colors={GRADIENT} style={styles.heroBg} start={{ x: 0.2, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.heroBlob1} pointerEvents="none" />
            <View style={styles.heroBlob2} pointerEvents="none" />
            <Ionicons name="school" size={92} color="rgba(255,255,255,0.18)" style={styles.heroEmblem} />
          </LinearGradient>
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
            style={styles.heroOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            pointerEvents="none"
          />
          <View style={styles.heroFoot}>
            <Text style={styles.heroName} numberOfLines={2}>{schoolName}</Text>
            <View style={styles.heroLocationRow}>
              <Ionicons name="location" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroLocation}>{t('schoolDetail.location')}</Text>
            </View>
          </View>
        </View>

        {/* Rating & Stats */}
        <View style={styles.bentoRow}>
          {/* Rating */}
          <View style={[styles.bentoCard, styles.bentoFull, styles.ratingCard]}>
            <Text style={styles.ratingScore}>4.9 / 5</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons key={i} name="star" size={18} color={Colors.primaryFixed} />
              ))}
            </View>
            <Text style={styles.ratingLabel}>{t('schoolDetail.overallRating')}</Text>
          </View>

          {/* Stats column */}
          <View style={styles.statsCol}>
            <View style={[styles.bentoCard, styles.statCard]}>
              <View style={[styles.statIconBox, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="people-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>1,240+</Text>
              <Text style={styles.statLabel}>{t('schoolDetail.activeStudents')}</Text>
            </View>
            <View style={[styles.bentoCard, styles.statCard]}>
              <View style={[styles.statIconBox, { backgroundColor: Colors.onTertiary }]}>
                <Ionicons name="podium-outline" size={18} color={Colors.tertiary} />
              </View>
              <Text style={[styles.statValue, { color: Colors.tertiary }]}>#3</Text>
              <Text style={styles.statLabel}>{t('schoolDetail.cityRank')}</Text>
            </View>
          </View>
        </View>

        {/* AI Insight */}
        <View style={styles.aiCard}>
          <LinearGradient colors={GRADIENT} style={styles.aiIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="hardware-chip-outline" size={26} color="#fff" />
          </LinearGradient>
          <View style={styles.aiBody}>
            <Text style={styles.aiTitle}>{t('schoolDetail.aiTitle')}</Text>
            <Text style={styles.aiText}>{t('schoolDetail.aiText')}</Text>
          </View>
        </View>

        {/* Top Students */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>{t('schoolDetail.topStudents')}</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>{t('schoolDetail.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          {TOP_STUDENTS.map((s) => (
            <View key={s.name} style={styles.studentCard}>
              <View style={styles.studentLeft}>
                <View style={styles.studentAvatarWrap}>
                  <LinearGradient
                    colors={s.rank === 1 ? GRADIENT : [Colors.surfaceHigh, Colors.surfaceContainer]}
                    style={styles.studentAvatar}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    <Text style={[styles.studentInitial, s.rank !== 1 && { color: Colors.textSecondary }]}>
                      {s.name[0]}
                    </Text>
                  </LinearGradient>
                  <View style={[styles.rankBadge, s.rank === 1 ? styles.rankBadgeGold : styles.rankBadgeGray]}>
                    <Text style={[styles.rankBadgeText, s.rank !== 1 && { color: Colors.textPrimary }]}>{s.rank}</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.studentName}>{s.name}</Text>
                  <Text style={styles.studentGrade}>{t('schoolDetail.gradeClass', { grade: s.grade })}</Text>
                </View>
              </View>
              <View style={styles.studentRight}>
                <Text style={styles.studentScore}>{s.score}</Text>
                <Text style={styles.studentScoreLabel}>{t('schoolDetail.totalScore')}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('schoolDetail.achievementsTitle')}</Text>
          <View style={styles.achievementGrid}>
            {ACHIEVEMENTS.map((a) => (
              <View key={a.titleKey} style={styles.achievementCard}>
                <View style={[styles.achievementIconBox, { backgroundColor: a.bg }]}>
                  <Ionicons name={a.icon} size={24} color={a.color} />
                </View>
                <Text style={styles.achievementTitle}>{t(a.titleKey)}</Text>
                <Text style={styles.achievementSub}>{t(a.subKey)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subscribe */}
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient colors={GRADIENT} style={styles.subscribeBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="bookmark-outline" size={20} color="#fff" />
            <Text style={styles.subscribeBtnText}>{t('schoolDetail.subscribe')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },

  scroll: { padding: 20, gap: 20, paddingBottom: 48 },

  heroWrap: {
    height: 256, borderRadius: 22, overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.18, shadowRadius: 26, elevation: 6,
  },
  heroBg: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroEmblem: { opacity: 0.9 },
  heroOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  heroBlob1: { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroBlob2: { position: 'absolute', top: 40, left: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroFoot: { position: 'absolute', left: 22, right: 22, bottom: 20, gap: 6 },
  heroName: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5, lineHeight: 32 },
  heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLocation: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  bentoRow: { flexDirection: 'row', gap: 12 },
  bentoCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
  },
  bentoFull: { flex: 0, width: '48%' },
  ratingCard: { padding: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
  ratingScore: { fontSize: 22, fontWeight: '900', color: Colors.primary },
  starsRow: { flexDirection: 'row', gap: 2 },
  ratingLabel: { fontSize: 9, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 1 },

  statsCol: { flex: 1, gap: 12 },
  statCard: { flex: 1, padding: 14, gap: 4, justifyContent: 'center' },
  statIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 9, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.8 },

  aiCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  aiIconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiBody: { flex: 1, gap: 6 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  aiText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },

  section: { gap: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  seeAll: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  studentCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  studentLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  studentAvatarWrap: { position: 'relative' },
  studentAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  studentInitial: { fontSize: 18, fontWeight: '800', color: '#fff' },
  rankBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  rankBadgeGold: { backgroundColor: Colors.gradientStart },
  rankBadgeGray: { backgroundColor: Colors.surfaceHigh },
  rankBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  studentName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  studentGrade: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  studentRight: { alignItems: 'flex-end', gap: 2 },
  studentScore: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  studentScoreLabel: { fontSize: 9, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5 },

  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  achievementCard: {
    width: '47%', backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  achievementIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  achievementTitle: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', lineHeight: 18 },
  achievementSub: { fontSize: 9, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.8 },

  subscribeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 999, height: 58,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  subscribeBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
