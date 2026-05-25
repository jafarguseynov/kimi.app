import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface DayBar { label: string; ratio: number }
interface WeakTopic {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  score: number;
  color: string;
  bg: string;
}

const DAYS: DayBar[] = [
  { label: '12 May', ratio: 0.70 },
  { label: '15 May', ratio: 0.85 },
  { label: '18 May', ratio: 0.60 },
  { label: '21 May', ratio: 0.92 },
  { label: '24 May', ratio: 0.78 },
  { label: '27 May', ratio: 0.88 },
  { label: 'Bugün', ratio: 0.95 },
];

const WEAK_TOPICS: WeakTopic[] = [
  { name: 'Riyaziyyat: Kəsrlər', icon: 'calculator-outline', score: 45, color: Colors.error, bg: Colors.dangerLight },
  { name: 'Azərbaycan dili: Morfologiya', icon: 'book-outline', score: 58, color: Colors.warning, bg: Colors.warningLight },
];

export default function ChildActivityScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const childName: string | undefined = route.params?.childName;
  const initials = childName ? childName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() : 'M';
  const overallPct = 85;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.headerTitle}>
            {childName ? `${childName.split(' ')[0]}ın fəaliyyəti` : 'Fəaliyyət'}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Overall hero */}
        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>ÜMUMİ HAZIRLIQ</Text>
              </View>
              <Text style={styles.heroTitle}>Əla nəticə!</Text>
              <Text style={styles.heroSub}>
                {childName ? `${childName.split(' ')[0]} hədəfinə çox yaxındır.` : 'Övladınız hədəfinə çox yaxındır.'}
              </Text>
            </View>
            <View style={styles.ringWrap}>
              <View style={styles.ringTrack} />
              <View style={[styles.ringFill, { borderTopColor: '#fff', borderRightColor: '#fff' }]} />
              <Text style={styles.ringText}>{overallPct}%</Text>
            </View>
          </View>
          <View style={styles.heroSparkle} pointerEvents="none">
            <Ionicons name="sparkles" size={120} color="rgba(255,255,255,0.18)" />
          </View>
        </LinearGradient>

        {/* Son nəticələr */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Son nəticələr</Text>
          <Text style={styles.sectionLink}>Son 7 imtahan</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartRow}>
            {DAYS.map((d) => (
              <View key={d.label} style={styles.chartCol}>
                <View style={styles.chartBarTrack}>
                  <LinearGradient
                    colors={GRADIENT}
                    style={[styles.chartBarFill, { height: `${d.ratio * 100}%` as any }]}
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  />
                </View>
                <Text style={styles.chartLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Recommendation */}
        <View style={styles.aiCard}>
          <View style={styles.aiHead}>
            <Text style={styles.aiTitle}>AI Tövsiyəsi</Text>
            <Ionicons name="sparkles" size={14} color={Colors.primary} />
          </View>
          <Text style={styles.aiBody}>
            {childName ? `${childName.split(' ')[0]},` : 'Övladınız'} "Kəsrlər" mövzusunda çətinlik çəkir. Bu həftə hər gün
            15 dəqiqə əlavə tapşırıq etmək onun nəticəsini 20% artıra bilər!
          </Text>
          <View style={styles.aiAccent} pointerEvents="none" />
        </View>

        {/* Zəif mövzular */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Zəif mövzular</Text>
        </View>

        <View style={{ gap: 12 }}>
          {WEAK_TOPICS.map((t) => (
            <View key={t.name} style={styles.topicCard}>
              <View style={styles.topicTopRow}>
                <View style={styles.topicLeft}>
                  <View style={[styles.topicIcon, { backgroundColor: t.bg }]}>
                    <Ionicons name={t.icon} size={18} color={t.color} />
                  </View>
                  <Text style={styles.topicName}>{t.name}</Text>
                </View>
                <Text style={[styles.topicScore, { color: t.color }]}>{t.score}%</Text>
              </View>
              <View style={styles.topicTrack}>
                <View style={[styles.topicFill, { width: `${t.score}%` as any, backgroundColor: t.color }]} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' },
  headerAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2, borderColor: Colors.primaryFixed,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  headerTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },

  scroll: { padding: 20, paddingBottom: 40, gap: 20 },

  hero: {
    borderRadius: 24, padding: 24, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  heroBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1.2 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  ringWrap: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  ringTrack: {
    position: 'absolute', width: 88, height: 88, borderRadius: 44,
    borderWidth: 7, borderColor: 'rgba(255,255,255,0.25)',
  },
  ringFill: {
    position: 'absolute', width: 88, height: 88, borderRadius: 44,
    borderWidth: 7,
    borderBottomColor: 'transparent', borderLeftColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  ringText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  heroSparkle: { position: 'absolute', bottom: -16, right: -16 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  sectionLink: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  chartCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 6 },
  chartCol: { flex: 1, alignItems: 'center', gap: 6, height: '100%' },
  chartBarTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  chartBarFill: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  chartLabel: { fontSize: 9, fontWeight: '600', color: Colors.textMuted },

  aiCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 22,
    borderWidth: 1, borderColor: Colors.primaryFixed + '20',
    overflow: 'hidden', position: 'relative',
  },
  aiHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  aiBody: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, lineHeight: 21 },
  aiAccent: {
    position: 'absolute', top: 0, right: 0, bottom: 0, width: 96,
    backgroundColor: Colors.primaryFixed + '0A',
  },

  topicCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  topicTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topicLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  topicIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  topicName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  topicScore: { fontSize: 14, fontWeight: '800' },
  topicTrack: {
    height: 8, backgroundColor: Colors.surfaceHigh,
    borderRadius: 999, overflow: 'hidden',
  },
  topicFill: { height: '100%', borderRadius: 999 },
});
