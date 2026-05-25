import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.SchoolExams>;
type SubjectFilter = 'Hamısı' | 'Riyaziyyat' | 'Azərbaycan dili' | 'İngilis dili' | 'Digər';

const SUBJECTS: SubjectFilter[] = ['Hamısı', 'Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Digər'];
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type ExamTier = 'free' | 'premium' | 'paid';
type ExamBadge = 'Populyar' | 'Yeni' | 'Canlı';

interface SchoolExam {
  id: string;
  title: string;
  subject: SubjectFilter;
  badge: ExamBadge;
  tier: ExamTier;
  price?: number;
  questions: number;
  durationMin: number;
  difficulty: 'Asan' | 'Orta' | 'Çətin';
}

const EXAMS: SchoolExam[] = [
  { id: 's1', subject: 'Digər',          badge: 'Populyar', tier: 'free',                   title: 'Məntiq Sınaq – 7-ci sinif',   questions: 20, durationMin: 25, difficulty: 'Orta' },
  { id: 's2', subject: 'Riyaziyyat',     badge: 'Yeni',     tier: 'premium', price: 1.50,   title: 'Riyaziyyat Sınağı – 8-ci sinif', questions: 25, durationMin: 30, difficulty: 'Çətin' },
  { id: 's3', subject: 'İngilis dili',   badge: 'Canlı',    tier: 'paid',    price: 0.80,   title: 'İngilis dili – Qrammatika',   questions: 15, durationMin: 15, difficulty: 'Asan' },
];

const DIFFICULTY_COLOR: Record<SchoolExam['difficulty'], string> = {
  Asan: Colors.tertiary,
  Orta: Colors.primary,
  Çətin: Colors.danger,
};

const RECS = [
  { id: 'r1', title: 'Təkmilləşdirilmiş Kimya', sub: 'Zəif olduğun mövzulara əsasən hazırlanıb.', icon: 'sparkles' as const, tint: Colors.primary, bg: '#E0F2FE', cta: 'İndi başla' },
  { id: 'r2', title: 'Tarix – Ümumi Təkrar',    sub: 'Son 3 ayın ən populyar sualları burada.',     icon: 'time' as const,     tint: Colors.tertiary, bg: '#DCFCE7',     cta: 'Daha çox' },
];

export default function SchoolExamsScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<SubjectFilter>('Hamısı');

  const filtered = useMemo(() => {
    return EXAMS.filter((e) => {
      if (subject !== 'Hamısı' && e.subject !== subject) return false;
      if (query && !e.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [subject, query]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>İmtahanlar</Text>
          <Text style={styles.headerSub}>UYĞUN İMTAHANI SEÇ</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={query} onChangeText={setQuery}
            placeholder="İmtahan axtar..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* Filters row + advanced filter button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            style={styles.advancedBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.ExamFilterSheet)}
          >
            <Ionicons name="options-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={{ flex: 1 }}>
          {SUBJECTS.map((s) => {
            const active = subject === s;
            if (active) {
              return (
                <TouchableOpacity key={s} activeOpacity={0.85} onPress={() => setSubject(s)}>
                  <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.chipActive}>
                    <Text style={styles.chipActiveText}>{s}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity key={s} style={styles.chip} activeOpacity={0.85} onPress={() => setSubject(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            );
          })}
          </ScrollView>
        </View>

        {/* List header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Məktəb İmtahanları</Text>
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>{filtered.length} nəticə</Text>
          </View>
        </View>

        {/* Cards */}
        <View style={{ gap: 24 }}>
          {filtered.map((e) => renderCard(e, navigation))}
        </View>

        {/* Recommendations */}
        <View style={styles.recSection}>
          <Text style={styles.recTitle}>Sənə tövsiyə olunur</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recRow}>
            {RECS.map((r) => (
              <TouchableOpacity key={r.id} style={styles.recCard} activeOpacity={0.85}>
                <View style={[styles.recIconBox, { backgroundColor: r.bg }]}>
                  <Ionicons name={r.icon} size={22} color={r.tint} />
                </View>
                <Text style={styles.recCardTitle}>{r.title}</Text>
                <Text style={styles.recCardSub}>{r.sub}</Text>
                <View style={styles.recLinkRow}>
                  <Text style={styles.recLinkText}>{r.cta}</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function renderCard(e: SchoolExam, navigation: Props['navigation']) {
  const diffColor = DIFFICULTY_COLOR[e.difficulty];
  const isFree = e.tier === 'free';
  const isPremium = e.tier === 'premium';
  const isPaid = e.tier === 'paid';

  const BadgePill = () => {
    if (e.badge === 'Populyar') {
      return (
        <View style={[styles.badgePill, { backgroundColor: '#DCFCE7' }]}>
          <Text style={[styles.badgeText, { color: Colors.tertiary }]}>POPULYAR</Text>
        </View>
      );
    }
    if (e.badge === 'Yeni') {
      return (
        <View style={[styles.badgePill, { backgroundColor: Colors.primary }]}>
          <Text style={[styles.badgeText, { color: '#fff' }]}>YENİ</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badgePill, styles.liveBadge]}>
        <View style={styles.livePulse} />
        <Text style={[styles.badgeText, { color: Colors.danger }]}>CANLI</Text>
      </View>
    );
  };

  const PriceBlock = () => {
    if (isFree) {
      return (
        <View style={styles.priceRow}>
          <Ionicons name="lock-open" size={16} color={Colors.tertiary} />
          <Text style={[styles.priceText, { color: Colors.tertiary }]}>Pulsuz</Text>
        </View>
      );
    }
    return (
      <View style={{ alignItems: 'flex-end' }}>
        <View style={styles.priceRow}>
          <Ionicons name="lock-closed" size={16} color={isPremium ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.priceText, { color: isPremium ? Colors.primary : Colors.textPrimary }]}>
            {e.price?.toFixed(2)} AZN
          </Text>
        </View>
        {isPremium && <Text style={styles.premiumKicker}>PREMIUM</Text>}
      </View>
    );
  };

  const cardStyle = [
    styles.card,
    isPremium && styles.cardPremium,
    isPaid && styles.cardPaid,
  ];

  return (
    <View key={e.id} style={cardStyle as any}>
      <View style={styles.cardTopRow}>
        <BadgePill />
        <PriceBlock />
      </View>
      <Text style={styles.cardTitle}>{e.title}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="help-circle-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{e.questions} sual</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{e.durationMin} dəq</Text>
        </View>
        <Text style={[styles.metaText, { color: diffColor, fontWeight: '600' }]}>{e.difficulty}</Text>
      </View>

      {isPremium ? (
        <View style={styles.ctaRow}>
          <TouchableOpacity
            activeOpacity={0.85} style={{ flex: 1 }}
            onPress={() => navigation.navigate(Routes.ExamPurchaseConfirm, { examId: e.id, title: e.title, price: e.price ?? 0, subject: e.subject, questions: e.questions })}
          >
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Al və başla</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.outlineBtn} onPress={() => navigation.navigate(Routes.ExamDetail, { examId: e.id, title: e.title })}>
            <Text style={styles.outlineBtnText}>Detallara bax</Text>
          </TouchableOpacity>
        </View>
      ) : isFree ? (
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate(Routes.ExamInfo, { examId: e.id, title: e.title })}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Başla</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity activeOpacity={0.85} style={styles.mutedBtn} onPress={() => navigation.navigate(Routes.ExamInfo, { examId: e.id, title: e.title })}>
          <Text style={styles.mutedBtnText}>Yoxla</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 64,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    gap: 8,
  },
  headerBackBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, letterSpacing: -0.2 },
  headerSub: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 1.2, marginTop: -2 },

  scroll: { padding: 16, gap: 28, paddingBottom: 48 },

  searchWrap: {
    position: 'relative', backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  searchIcon: { position: 'absolute', left: 16, top: 16, zIndex: 1 },
  searchInput: { paddingVertical: 16, paddingLeft: 48, paddingRight: 16, fontSize: 15, color: Colors.textPrimary },

  filterRow: { gap: 12, paddingRight: 8 },
  advancedBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  chip: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceLow,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  chipActive: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 3,
  },
  chipActiveText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  listTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  counterPill: {
    backgroundColor: Colors.primary + '1A',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
  },
  counterText: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  /* Card */
  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 30, elevation: 2,
  },
  cardPremium: {
    borderWidth: 2, borderColor: Colors.primary + '4D',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 40, elevation: 4,
  },
  cardPaid: {
    borderLeftWidth: 4, borderLeftColor: Colors.danger,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  badgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
  },
  liveBadge: { backgroundColor: '#FEE2E2' },
  livePulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceText: { fontSize: 14, fontWeight: '800' },
  premiumKicker: { fontSize: 9, fontWeight: '800', color: Colors.textMuted, marginTop: 2 },

  cardTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, letterSpacing: -0.2, lineHeight: 22 },
  metaRow: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 24 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  primaryBtn: {
    paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 3,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  ctaRow: { flexDirection: 'row', gap: 12 },
  outlineBtn: {
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.borderLight,
    justifyContent: 'center',
  },
  outlineBtnText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  mutedBtn: { paddingVertical: 14, borderRadius: 999, alignItems: 'center', backgroundColor: Colors.surfaceHigh },
  mutedBtnText: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },

  /* Recommendations */
  recSection: { paddingTop: 8 },
  recTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20, paddingHorizontal: 4, letterSpacing: -0.3 },
  recRow: { gap: 20, paddingRight: 16, paddingBottom: 16 },
  recCard: {
    width: 240,
    backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.04, shadowRadius: 30, elevation: 2,
  },
  recIconBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  recCardTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  recCardSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  recLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  recLinkText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 0.8 },
});
