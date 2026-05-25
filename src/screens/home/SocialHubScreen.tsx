import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const AVATAR = (seed: string) =>
  `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundColor=eef1f3&textColor=006190`;

interface RankRow { id: string; rank: number; name: string; points: number; me?: boolean; }
const RANKS: RankRow[] = [
  { id: 'r1', rank: 1, name: 'Aylin M.', points: 1250 },
  { id: 'r2', rank: 2, name: 'Sən', points: 1120, me: true },
  { id: 'r3', rank: 3, name: 'Cavid S.', points: 980 },
];

interface Suggestion { id: string; name: string; subject: string; }
const SUGGESTIONS: Suggestion[] = [
  { id: 's1', name: 'Elnur T.', subject: 'Biologiya' },
  { id: 's2', name: 'Ayan M.', subject: 'Riyaziyyat' },
  { id: 's3', name: 'Rəşad H.', subject: 'Fizika' },
  { id: 's4', name: 'Nigar B.', subject: 'Kimya' },
];

interface Feed { id: string; name: string; text: string; ago: string; }
const FEED: Feed[] = [
  { id: 'f1', name: 'Cavid S.', text: 'Riyaziyyat testini bitirdi və 95% nəticə göstərdi. 🚀', ago: '10 dəqiqə əvvəl' },
  { id: 'f2', name: 'Aylin M.', text: 'yeni səviyyəyə keçdi: "Qızıl Oxucu" 📚', ago: '1 saat əvvəl' },
];

export default function SocialHubScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Image source={{ uri: AVATAR('Sən') }} style={styles.headerAvatar} />
        <Text style={styles.brand}>Sosial</Text>
        <TouchableOpacity style={styles.bellBtn} hitSlop={8}>
          <Ionicons name="notifications" size={20} color={Colors.textSecondary} />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Friends widget */}
        <View style={styles.widget}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.widgetTitle}>Dostların</Text>
              <Text style={styles.widgetSub}>Sıralamada 2-cisən 🥈</Text>
            </View>
            <View style={styles.widgetIcon}>
              <Ionicons name="people" size={20} color={Colors.primary} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
            <View style={{ flexDirection: 'row' }}>
              {['Aylin M.', 'Cavid S.', 'Elnur T.'].map((n, i) => (
                <Image
                  key={n}
                  source={{ uri: AVATAR(n) }}
                  style={[styles.stackAvatar, { marginLeft: i === 0 ? 0 : -12, zIndex: 10 - i }]}
                />
              ))}
              <View style={[styles.stackAvatar, styles.plusAvatar, { marginLeft: -8 }]}>
                <Text style={styles.plusText}>+5</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewBtn} activeOpacity={0.85}>
              <Text style={styles.viewBtnText}>Bax</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ranking */}
        <View>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Dostlar arasında reytinq</Text>
            <TouchableOpacity><Text style={styles.linkText}>Hamısı</Text></TouchableOpacity>
          </View>
          <View style={styles.cardSurface}>
            {RANKS.map((r, idx) => (
              <View key={r.id} style={[styles.rankRow, r.me && styles.rankRowMe, idx < RANKS.length - 1 && { marginBottom: 4 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <Text style={[styles.rankNum, r.me && { color: Colors.primary }]}>{r.rank}</Text>
                  <Image
                    source={{ uri: AVATAR(r.name) }}
                    style={[styles.rankAvatar, r.me && { borderWidth: 2, borderColor: Colors.primary }]}
                  />
                  <Text style={styles.rankName}>{r.name}</Text>
                </View>
                <Text style={[styles.rankPoints, !r.me && idx === 2 && { color: Colors.textSecondary }]}>{r.points} xal</Text>
              </View>
            ))}
          </View>
        </View>

        {/* New requests */}
        <View>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Yeni sorğular</Text>
            <View style={styles.countBadge}><Text style={styles.countBadgeText}>1</Text></View>
          </View>
          <View style={[styles.cardSurface, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <Image source={{ uri: AVATAR('Leyla Q.') }} style={styles.reqAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reqName}>Leyla Q.</Text>
              <Text style={styles.reqSub}>2 ortaq dost</Text>
            </View>
            <TouchableOpacity style={styles.iconBtnGhost} hitSlop={6}>
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnPrimary} hitSlop={6}>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended friends */}
        <View>
          <Text style={[styles.sectionTitle, { marginBottom: 12, paddingHorizontal: 4 }]}>Tövsiyə edilən dostlar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 4 }}>
            {SUGGESTIONS.map((s) => (
              <View key={s.id} style={styles.suggestionCard}>
                <Image source={{ uri: AVATAR(s.name) }} style={styles.suggestionAvatar} />
                <Text style={styles.suggestionName}>{s.name}</Text>
                <Text style={styles.suggestionSubject}>{s.subject}</Text>
                <TouchableOpacity style={styles.followBtn} activeOpacity={0.85}>
                  <Text style={styles.followBtnText}>İzlə</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Live activity */}
        <View>
          <Text style={[styles.sectionTitle, { marginBottom: 12, paddingHorizontal: 4 }]}>Canlı fəaliyyət</Text>
          <View style={{ gap: 12 }}>
            {FEED.map((f) => (
              <View key={f.id} style={[styles.cardSurface, { flexDirection: 'row', gap: 12, padding: 16 }]}>
                <Image source={{ uri: AVATAR(f.name) }} style={styles.feedAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedText}>
                    <Text style={{ fontWeight: '700' }}>{f.name} </Text>
                    {f.text}
                  </Text>
                  <Text style={styles.feedTime}>{f.ago}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Find friend CTA */}
        <TouchableOpacity
          style={styles.findCta}
          activeOpacity={0.9}
          onPress={() => navigation.navigate(Routes.FindFriend)}
        >
          <Ionicons name="person-add" size={20} color={Colors.primary} />
          <Text style={styles.findCtaText}>Yeni dost tap</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>

        {/* Daha çox — 2×2 hub grid */}
        <View>
          <Text style={styles.sectionTitle}>Daha çox</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.moreCard} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.MyFriends)}>
                <View style={styles.moreIconWrap}><Ionicons name="people-circle" size={22} color={Colors.primary} /></View>
                <Text style={styles.moreTitle}>Dostlarım</Text>
                <Text style={styles.moreSub}>Aktiv siyahı</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreCard} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.FriendsLeaderboard)}>
                <View style={styles.moreIconWrap}><Ionicons name="trophy" size={22} color={Colors.primary} /></View>
                <Text style={styles.moreTitle}>Dostlar TOP</Text>
                <Text style={styles.moreSub}>Podium reyting</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.moreCard} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.InviteFriends)}>
                <View style={styles.moreIconWrap}><Ionicons name="gift" size={22} color={Colors.primary} /></View>
                <Text style={styles.moreTitle}>Dəvət et</Text>
                <Text style={styles.moreSub}>Link + bonus</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreCard} activeOpacity={0.85} onPress={() => navigation.navigate(Routes.LeaderboardDetail)}>
                <View style={styles.moreIconWrap}><Ionicons name="podium" size={22} color={Colors.primary} /></View>
                <Text style={styles.moreTitle}>Liderlər</Text>
                <Text style={styles.moreSub}>Həftəlik / Aylıq</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 24, height: 64,
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLow },
  brand: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.4 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },

  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 28 },

  widget: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 32, padding: 24,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '80',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 28, elevation: 3,
  },
  widgetTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  widgetSub: { fontSize: 13, color: Colors.textSecondary },
  widgetIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  stackAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: Colors.surfaceLowest, backgroundColor: Colors.surfaceLow },
  plusAvatar: { backgroundColor: Colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  plusText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  viewBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.primary + '1A' },
  viewBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  moreCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 14, gap: 8,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '4D',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  moreIconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  moreTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  moreSub: { fontSize: 11, color: Colors.textSecondary },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 },
  linkText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  countBadge: { backgroundColor: Colors.danger, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  cardSurface: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '80',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.05, shadowRadius: 22, elevation: 2,
  },

  rankRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, paddingHorizontal: 8, borderRadius: 16,
  },
  rankRowMe: { backgroundColor: Colors.primary + '0D', marginHorizontal: -8 },
  rankNum: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary, width: 18, textAlign: 'center' },
  rankAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLow },
  rankName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  rankPoints: { fontSize: 14, fontWeight: '700', color: Colors.primary, paddingRight: 8 },

  reqAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceLow },
  reqName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  reqSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  iconBtnGhost: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnPrimary: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3,
  },

  suggestionCard: {
    width: 140, backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 16,
    alignItems: 'center',
    borderWidth: 1, borderColor: Colors.surfaceVariant + '80',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 18, elevation: 2,
  },
  suggestionAvatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 12, backgroundColor: Colors.surfaceLow },
  suggestionName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  suggestionSubject: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, marginBottom: 12 },
  followBtn: {
    width: '100%', paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.primary, alignItems: 'center',
  },
  followBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  feedAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLow },
  feedText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 18 },
  feedTime: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },

  findCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary + '0D', borderRadius: 999, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  findCtaText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
