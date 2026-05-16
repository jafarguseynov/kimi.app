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

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type RouteProps = RouteProp<HomeStackParamList, typeof Routes.SchoolDetail>;

const TOP_STUDENTS = [
  { name: 'Elmir Məmmədov', grade: '11A', score: '98.4', rank: 1 },
  { name: 'Leyla Əliyeva', grade: '10C', score: '97.2', rank: 2 },
  { name: 'Aytən Hüseynova', grade: '11B', score: '96.8', rank: 3 },
];

const ACHIEVEMENTS = [
  { icon: 'trophy-outline' as const, bg: '#FEF3C7', color: '#D97706', title: 'İlin Ən Yaxşı Məktəbi', sub: '2023 Qalibi' },
  { icon: 'ribbon-outline' as const, bg: Colors.primaryLight, color: Colors.primary, title: 'Yüksək İmtahan Nəticəsi', sub: '95% Uğur' },
  { icon: 'flask-outline' as const, bg: '#D1FAE5', color: '#059669', title: 'İnnovasiya Mərkəzi', sub: 'STEM Laboratoriya' },
  { icon: 'globe-outline' as const, bg: '#EDE9FE', color: '#7C3AED', title: 'Beynəlxalq Əməkdaşlıq', sub: 'Global Proqramlar' },
];

export default function SchoolDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProps>();
  const schoolName = route.params?.schoolName ?? 'Bakı Müasir Məktəbi';

  const handleShare = () => {
    Share.share({ message: `${schoolName} — Kimi.az-da ən yaxşı məktəblərdən biri!` });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Məktəb Haqqında</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient colors={GRADIENT} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroBlob1} />
          <View style={styles.heroBlob2} />
          <View style={styles.heroIconWrap}>
            <Ionicons name="school" size={36} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.heroName}>{schoolName}</Text>
          <View style={styles.heroLocationRow}>
            <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroLocation}>Bakı, Azərbaycan</Text>
          </View>
        </LinearGradient>

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
            <Text style={styles.ratingLabel}>Ümumi Reytinq</Text>
          </View>

          {/* Stats column */}
          <View style={styles.statsCol}>
            <View style={[styles.bentoCard, styles.statCard]}>
              <View style={[styles.statIconBox, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="people-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>1,240+</Text>
              <Text style={styles.statLabel}>Aktiv Şagird</Text>
            </View>
            <View style={[styles.bentoCard, styles.statCard]}>
              <View style={[styles.statIconBox, { backgroundColor: Colors.onTertiary }]}>
                <Ionicons name="podium-outline" size={18} color={Colors.tertiary} />
              </View>
              <Text style={[styles.statValue, { color: Colors.tertiary }]}>#3</Text>
              <Text style={styles.statLabel}>Şəhər üzrə</Text>
            </View>
          </View>
        </View>

        {/* AI Insight */}
        <View style={styles.aiCard}>
          <LinearGradient colors={GRADIENT} style={styles.aiIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="hardware-chip-outline" size={26} color="#fff" />
          </LinearGradient>
          <View style={styles.aiBody}>
            <Text style={styles.aiTitle}>Kimi Robot deyir ki...</Text>
            <Text style={styles.aiText}>
              "Bu məktəb rəqəmsal savadlılıq üzrə ölkədə liderdir. Riyaziyyat nəticələri ötən ilə nisbətən 12% artıb. Əla nəticədir!"
            </Text>
          </View>
        </View>

        {/* Top Students */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Top Şagirdlər</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>Hamısı</Text>
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
                  <Text style={styles.studentGrade}>{s.grade} sinfi</Text>
                </View>
              </View>
              <View style={styles.studentRight}>
                <Text style={styles.studentScore}>{s.score}</Text>
                <Text style={styles.studentScoreLabel}>Ümumi Bal</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Məktəb Nailiyyətləri</Text>
          <View style={styles.achievementGrid}>
            {ACHIEVEMENTS.map((a) => (
              <View key={a.title} style={styles.achievementCard}>
                <View style={[styles.achievementIconBox, { backgroundColor: a.bg }]}>
                  <Ionicons name={a.icon} size={24} color={a.color} />
                </View>
                <Text style={styles.achievementTitle}>{a.title}</Text>
                <Text style={styles.achievementSub}>{a.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subscribe */}
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient colors={GRADIENT} style={styles.subscribeBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="bookmark-outline" size={20} color="#fff" />
            <Text style={styles.subscribeBtnText}>Məktəbə Abunə Ol</Text>
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

  hero: {
    borderRadius: 20, padding: 28, overflow: 'hidden', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 4,
  },
  heroBlob1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroBlob2: { position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)' },
  heroIconWrap: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  heroName: { fontSize: 24, fontWeight: '900', color: '#fff', lineHeight: 32 },
  heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLocation: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },

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
