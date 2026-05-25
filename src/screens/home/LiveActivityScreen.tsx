import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type ActivityKind = 'exam' | 'league' | 'streak' | 'course';

interface Activity {
  id: string;
  name: string;
  initial: string;
  kind: ActivityKind;
  badgeColor: string;
  badgeIcon: keyof typeof Ionicons.glyphMap;
  highlight: string;
  highlightColor: string;
  prefix?: string;
  suffix: string;
  meta: string;
}

const ACTIVITIES: Activity[] = [
  {
    id: 'a1', name: 'Ali', initial: 'A', kind: 'exam',
    badgeColor: Colors.primary, badgeIcon: 'help-circle',
    highlight: '95% nəticə', highlightColor: Colors.primary,
    suffix: ' aldı', meta: 'İndi · İngilis dili sınağı',
  },
  {
    id: 'a2', name: 'Leyla', initial: 'L', kind: 'league',
    badgeColor: '#EAB308', badgeIcon: 'school',
    highlight: 'Qızıl Liqaya', highlightColor: '#CA8A04',
    suffix: ' yüksəldi', meta: '2 dəqiqə əvvəl · Həftəlik sıralama',
  },
  {
    id: 'a3', name: 'Murad', initial: 'M', kind: 'streak',
    badgeColor: '#F97316', badgeIcon: 'flame',
    highlight: '10 günlük streak', highlightColor: '#EA580C',
    suffix: ' qazandı', meta: '5 dəqiqə əvvəl · Müntəzəm öyrənmə',
  },
  {
    id: 'a4', name: 'Günel', initial: 'G', kind: 'course',
    badgeColor: '#10B981', badgeIcon: 'sparkles',
    highlight: 'Riyaziyyat', highlightColor: '#059669',
    suffix: ' kursunu bitirdi', meta: '12 dəqiqə əvvəl · Sertifikat qazandı',
  },
];

function LivePulse() {
  const pulse = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ).start();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.75, 0] });
  return (
    <View style={liveStyles.wrap}>
      <Animated.View style={[liveStyles.ring, { transform: [{ scale }], opacity }]} />
      <View style={liveStyles.dot} />
    </View>
  );
}

const liveStyles = StyleSheet.create({
  wrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
});

export default function LiveActivityScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="star" size={18} color={Colors.primary} />
          <Text style={styles.headerTitle}>Canlı Fəaliyyət</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8} onPress={() => navigation.navigate(Routes.Notifications)}>
          <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pair-tab switcher: Fəaliyyət / Xəbərlər */}
        <View style={pairTab.row}>
          <View style={[pairTab.btn, pairTab.btnActive]}>
            <Text style={[pairTab.text, pairTab.textActive]}>Fəaliyyət</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.replace(Routes.News)}
            style={pairTab.btn}
          >
            <Text style={pairTab.text}>Xəbərlər</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>İNDİ CANLI</Text>
          </View>
          <Text style={styles.heroTitle}>Cəmiyyətimiz parlayır!</Text>
          <Text style={styles.heroSub}>
            Bu gün 1,240 tələbə yeni nailiyyətlər qazandı. Sən də onlara qoşul!
          </Text>
        </LinearGradient>

        {/* Section header */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Son fəaliyyətlər</Text>
          <View style={styles.activeRow}>
            <LivePulse />
            <Text style={styles.activeText}>42 Aktiv İnsan</Text>
          </View>
        </View>

        {/* Activity feed */}
        <View style={{ gap: 14 }}>
          {ACTIVITIES.map((a) => (
            <TouchableOpacity key={a.id} style={styles.card} activeOpacity={0.88}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{a.initial}</Text>
                </View>
                <View style={[styles.avatarBadge, { backgroundColor: a.badgeColor }]}>
                  <Ionicons name={a.badgeIcon} size={12} color="#fff" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLine}>
                  {a.name}{' '}
                  <Text style={[styles.highlight, { color: a.highlightColor }]}>{a.highlight}</Text>
                  {a.suffix}
                </Text>
                <Text style={styles.meta}>{a.meta}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.surfaceHigh} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.loadMore} activeOpacity={0.85}>
          <Text style={styles.loadMoreText}>Daha çox göstər</Text>
        </TouchableOpacity>

        {/* Bento stats */}
        <View style={styles.bentoRow}>
          <View style={styles.bentoCard}>
            <Ionicons name="people" size={22} color={Colors.primary} style={{ marginBottom: 10 }} />
            <Text style={styles.bentoNum}>45.2K</Text>
            <Text style={styles.bentoLabel}>Aktiv Tələbə</Text>
          </View>
          <View style={styles.bentoCard}>
            <Ionicons name="checkmark-done-circle" size={22} color={Colors.tertiary} style={{ marginBottom: 10 }} />
            <Text style={styles.bentoNum}>128</Text>
            <Text style={styles.bentoLabel}>Yeni Uğur</Text>
          </View>
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
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  /* Hero */
  hero: {
    borderRadius: 20, padding: 32, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 40, elevation: 6,
  },
  livePill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    marginBottom: 16,
  },
  livePillText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -0.5, marginBottom: 8 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 18 },

  /* Section head */
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeText: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },

  /* Card */
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surfaceLow,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  avatarBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  cardLine: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, lineHeight: 19 },
  highlight: { fontWeight: '800' },
  meta: { fontSize: 11, color: Colors.textMuted, fontWeight: '500', marginTop: 4 },

  loadMore: { paddingVertical: 16, alignItems: 'center' },
  loadMoreText: { fontSize: 13, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },

  /* Bento */
  bentoRow: { flexDirection: 'row', gap: 14 },
  bentoCard: {
    flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 22,
  },
  bentoNum: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  bentoLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
});

const pairTab = StyleSheet.create({
  row: {
    flexDirection: 'row', gap: 4,
    backgroundColor: Colors.surfaceLow,
    padding: 4, borderRadius: 999,
  },
  btn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999 },
  btnActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  text: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  textActive: { fontWeight: '800', color: Colors.primary },
});
