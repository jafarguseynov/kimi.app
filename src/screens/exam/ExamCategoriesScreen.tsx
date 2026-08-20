import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExamCategories } from '../../hooks/useExamCategories';
import { useExamCounts } from '../../hooks/useExams';
import { useMe } from '../../hooks/useUser';
import { getSubcategories } from '../../constants/educationTaxonomy';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamCategories>;

interface Category {
  key: string;
  title: string;
  desc: string;
  emoji: string;
  bg: string;
  /** admin paneldən gələn qrup açarı; null olarsa aşağıdakı GROUPS-a düşür */
  groupKey?: string | null;
  /** admin backend gələcəkdə ödənişli kateqoriya nişanı verərsə burada göstərilir */
  isPremium?: boolean;
}

const CATEGORIES: Category[] = [
  { key: 'middle',        title: 'Orta Məktəb',   desc: '1–11-ci sinif imtahanları',      emoji: '📘',     bg: '#EFF6FF' },
  { key: 'russian',       title: 'Rus bölməsi',   desc: 'Rus sektoru · 1–11 + abituriyent', emoji: '🇷🇺',  bg: '#EEF2FF' },
  { key: 'abituriyent',   title: 'Abituriyent',   desc: 'DİM bakalavriat I–V qrup',       emoji: '🎓',     bg: '#FFFBEB' },
  { key: 'magistr',       title: 'Magistratura',  desc: 'Magistr hazırlıq',               emoji: '📚',     bg: '#F5F3FF' },
  { key: 'miq',           title: 'MIQ',           desc: 'Müəllimlərin işə qəbulu',        emoji: '👨‍🏫', bg: '#ECFDF5' },
  { key: 'rezidentura',   title: 'Rezidentura',   desc: 'Tibb bakalavrı sonrası',         emoji: '🩺',     bg: '#FEE2E2' },
  { key: 'doctorate',     title: 'Doktorantura',  desc: 'PhD / Fəlsəfə doktoru',          emoji: '🎓',     bg: '#E0E7FF' },
  { key: 'govservice',    title: 'Dövlət qulluğu',desc: 'Test + müsahibə sertifikatı',    emoji: '🏛️',     bg: '#F3F4F6' },
  { key: 'ability',       title: 'Qabiliyyət',    desc: 'İncəsənət / idman / hərbi',      emoji: '🎨',     bg: '#FDF4FF' },
  { key: 'college',       title: 'Kollec',        desc: 'Orta ixtisas (9 il bazada)',     emoji: '🏫',     bg: '#FEF3C7' },
  { key: 'international', title: 'Beynəlxalq',    desc: 'TOEFL · SAT · GRE · Cambridge',  emoji: '🌐',     bg: '#DBEAFE' },
  { key: 'professional',  title: 'Peşəkar sert.', desc: 'Mühasib · Sığorta · Hüquq',      emoji: '🏅',     bg: '#FEF9C3' },
  { key: 'preschool',     title: 'Məktəbəqədər',  desc: 'Kiçik yaşlı uşaqlar',            emoji: '🧒',     bg: '#FFF7ED' },
  { key: 'mock',          title: 'Sınaqlar',      desc: 'Aylıq · həftəlik · DİM sınağı',  emoji: '📊',     bg: '#FCE7F3' },
];

/**
 * Kateqoriyalar eyni səviyyəli deyil — "Sınaqlar" imtahan TİPİdir, "Orta Məktəb"
 * təhsil SƏVİYYƏSİdir, "Rus bölməsi" isə DİLdir. Burada eyni ölçüdə olanlar bir
 * qrupda toplanır. Qrupu admin panel təyin edir (`groupKey`); `keys` yalnız
 * fallback-dir (backend cavab vermədikdə).
 */
const GROUPS: { key: string; titleKey: string; fallback: string; keys: string[] }[] = [
  {
    key: 'level',
    titleKey: 'examCat.groupLevel',
    fallback: 'Təhsil səviyyəsi / məqsəd',
    keys: ['preschool', 'middle', 'college', 'abituriyent', 'magistr', 'doctorate', 'rezidentura', 'miq', 'govservice', 'professional'],
  },
  { key: 'type', titleKey: 'examCat.groupType', fallback: 'İmtahan tipi', keys: ['mock', 'ability'] },
  { key: 'lang', titleKey: 'examCat.groupLang', fallback: 'Dil / bölmə', keys: ['russian', 'international'] },
];

/**
 * Vizual çəki: ən çox istifadə olunan kateqoriyalar həm yuxarıda, həm də daha
 * iri sətirdə göstərilir. Siyahıda olmayan (adminin sonradan əlavə etdiyi)
 * kateqoriyalar öz sırasını qoruyaraq sonda gəlir.
 */
const PRIORITY: Record<string, number> = {
  middle: 1, abituriyent: 2, miq: 3, magistr: 4, rezidentura: 5, doctorate: 6,
};
const PRIMARY_MAX = 4; // bu prioritetə qədər olanlar iri sətir

export default function ExamCategoriesScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const remote = useExamCategories();
  const { data: counts } = useExamCounts();
  const { data: me } = useMe();
  const [query, setQuery] = useState('');

  // Açar üzrə tərcümə varsa onu götür, yoxsa backend/statik başlığa düş.
  const tOr = (key: string, fallback: string) => {
    const hit = t(key);
    return hit === key ? fallback : hit;
  };

  const categories: Category[] = remote
    ? remote.map((c) => ({
        key: c.key,
        title: tOr(`examCat.${c.key}.title`, c.title),
        desc: tOr(`examCat.${c.key}.desc`, c.description ?? ''),
        emoji: c.emoji ?? '📂',
        bg: c.bg ?? '#EFF6FF',
        groupKey: c.groupKey ?? null,
        isPremium: (c as any).isPremium === true,
      }))
    : CATEGORIES.map((c) => ({
        ...c,
        title: tOr(`examCat.${c.key}.title`, c.title),
        desc: tOr(`examCat.${c.key}.desc`, c.desc),
      }));

  const groupOf = (c: Category): string | null =>
    c.groupKey || GROUPS.find((g) => g.keys.includes(c.key))?.key || null;

  const rank = (c: Category, idx: number) => PRIORITY[c.key] ?? 100 + idx;
  const sortByPriority = (list: Category[]) =>
    [...list].sort((a, b) => rank(a, categories.indexOf(a)) - rank(b, categories.indexOf(b)));

  const grouped = GROUPS
    .map((g) => ({
      key: g.key,
      title: tOr(g.titleKey, g.fallback),
      items: sortByPriority(categories.filter((c) => groupOf(c) === g.key)),
    }))
    .filter((g) => g.items.length > 0);

  // Qrupu olmayanlar (admin yeni kateqoriya əlavə edib qrup seçməyibsə) itmir.
  const rest = categories.filter((c) => groupOf(c) == null);
  if (rest.length > 0) {
    grouped.push({ key: 'other', title: tOr('examCat.groupOther', 'Digər'), items: rest });
  }

  const openCategory = (cat: Category) => {
    navigation.navigate(Routes.CategorySubcategories, { categoryKey: cat.key, categoryTitle: cat.title });
  };

  // ── Axtarış: kateqoriya + alt bölmə (admin uşaqları, yoxdursa taksonomiya) ──
  const subIndex = useMemo(
    () =>
      categories.flatMap((c) => {
        const remoteKids = remote?.find((r) => r.key === c.key)?.children ?? [];
        const kids = remoteKids.length > 0
          ? remoteKids.map((k) => ({ key: k.key, title: k.title }))
          : getSubcategories(c.key).map((k) => ({ key: k.key, title: k.title }));
        return kids.map((k) => ({ ...k, cat: c }));
      }),
    [categories, remote],
  );

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return null;
    const cats = categories.filter(
      (c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
    );
    const subs = subIndex.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 20);
    return { cats, subs };
  }, [q, categories, subIndex]);

  // ── «Sənin üçün» — YALNIZ profil məlumatı varsa ──────────────────────────
  // Mənbə: profildəki sinif («11-ci») və məqsəd (university|school|general).
  const myGrade: string | undefined = (me as any)?.grade ?? (me as any)?.profile?.grade;
  const myGoal: string | undefined = (me as any)?.goal ?? (me as any)?.profile?.goal;
  const gradeNum = parseInt(String(myGrade ?? '').match(/\d+/)?.[0] ?? '', 10);

  const suggestion = useMemo(() => {
    const find = (key: string) => categories.find((c) => c.key === key);
    if (gradeNum >= 10 || myGoal === 'university') {
      const c = find('abituriyent');
      if (c) {
        return {
          cat: c,
          reason: gradeNum >= 10
            ? t('examCat.forYouGrade', { grade: myGrade ?? '' })
            : t('examCat.forYouGoalUni'),
        };
      }
    }
    if (gradeNum >= 1 && gradeNum <= 9) {
      const c = find('middle');
      if (c) return { cat: c, reason: t('examCat.forYouGrade', { grade: myGrade ?? '' }) };
    }
    if (myGoal === 'school') {
      const c = find('middle');
      if (c) return { cat: c, reason: t('examCat.forYouGoalSchool') };
    }
    return null;
  }, [categories, gradeNum, myGoal, myGrade, t]);

  const countOf = (key: string) => counts?.categories?.[key];

  const renderRow = (c: Category, primary: boolean) => {
    const n = countOf(c.key);
    return (
      <TouchableOpacity
        key={c.key}
        style={[styles.row, primary && styles.rowPrimary]}
        activeOpacity={0.75}
        onPress={() => openCategory(c)}
      >
        <View style={[styles.iconBox, primary && styles.iconBoxPrimary, { backgroundColor: c.bg }]}>
          <Text style={{ fontSize: primary ? 22 : 18 }}>{c.emoji}</Text>
        </View>
        <View style={styles.rowText}>
          <View style={styles.rowTitleLine}>
            <Text style={[styles.rowTitle, primary && styles.rowTitlePrimary]} numberOfLines={1}>{c.title}</Text>
            {c.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>{t('examCat.premium')}</Text>
              </View>
            )}
          </View>
          {!!c.desc && <Text style={styles.rowDesc} numberOfLines={1}>{c.desc}</Text>}
        </View>
        {counts && (
          n ? (
            <Text style={styles.countPill}>{t('examCat.nExams', { n })}</Text>
          ) : (
            <Text style={styles.soonPill}>{t('examCat.soon')}</Text>
          )
        )}
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Text style={{ fontSize: 18 }}>🤖</Text>
            </View>
            <Text style={styles.headerTitle}>{t('examCat.headerTitle')}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Axtarış */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('examCat.searchPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {results ? (
          // ── Axtarış nəticələri ──
          results.cats.length === 0 && results.subs.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>{t('examCat.noResults')}</Text>
              <Text style={styles.emptySub}>{t('examCat.noResultsSub')}</Text>
            </View>
          ) : (
            <View style={{ gap: 20 }}>
              {results.cats.length > 0 && (
                <View style={styles.group}>
                  <View style={styles.groupHeader}>
                    <View style={styles.groupBar} />
                    <Text style={styles.groupTitle}>{t('examCat.resultCategories')}</Text>
                  </View>
                  <View style={styles.list}>{results.cats.map((c) => renderRow(c, false))}</View>
                </View>
              )}
              {results.subs.length > 0 && (
                <View style={styles.group}>
                  <View style={styles.groupHeader}>
                    <View style={styles.groupBar} />
                    <Text style={styles.groupTitle}>{t('examCat.resultSubs')}</Text>
                  </View>
                  <View style={styles.list}>
                    {results.subs.map((s) => (
                      <TouchableOpacity
                        key={`${s.cat.key}:${s.key}`}
                        style={styles.row}
                        activeOpacity={0.75}
                        // Alt bölmə nəticəsi → həmin kateqoriyanın alt siyahısı
                        onPress={() => openCategory(s.cat)}
                      >
                        <View style={[styles.iconBox, { backgroundColor: s.cat.bg }]}>
                          <Text style={{ fontSize: 18 }}>{s.cat.emoji}</Text>
                        </View>
                        <View style={styles.rowText}>
                          <Text style={styles.rowTitle} numberOfLines={1}>{s.title}</Text>
                          <Text style={styles.rowDesc} numberOfLines={1}>{s.cat.title}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )
        ) : (
          <>
            {/* Sənin üçün — yalnız profildə sinif/məqsəd varsa */}
            {suggestion && (
              <View style={styles.group}>
                <View style={styles.groupHeader}>
                  <Text style={styles.forYouIcon}>🎯</Text>
                  <Text style={styles.groupTitle}>{t('examCat.forYouTitle')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.suggestCard}
                  activeOpacity={0.85}
                  onPress={() => openCategory(suggestion.cat)}
                >
                  <View style={styles.suggestTop}>
                    <View style={[styles.iconBox, styles.iconBoxPrimary, { backgroundColor: suggestion.cat.bg }]}>
                      <Text style={{ fontSize: 22 }}>{suggestion.cat.emoji}</Text>
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.suggestTitle} numberOfLines={1}>{suggestion.cat.title}</Text>
                      <Text style={styles.suggestReason}>{suggestion.reason}</Text>
                    </View>
                  </View>
                  <View style={styles.suggestBottom}>
                    {!!countOf(suggestion.cat.key) && (
                      <Text style={styles.countPill}>
                        {t('examCat.nExams', { n: countOf(suggestion.cat.key) ?? 0 })}
                      </Text>
                    )}
                    <View style={{ flex: 1 }} />
                    <Text style={styles.suggestCta}>{t('examCat.viewExams')}</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Qruplaşdırılmış siyahı */}
            {grouped.map((g) => (
              <View key={g.key} style={styles.group}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupBar} />
                  <Text style={styles.groupTitle}>{g.title}</Text>
                </View>
                <View style={styles.list}>
                  {g.items.map((c) => renderRow(c, (PRIORITY[c.key] ?? 99) <= PRIMARY_MAX))}
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBackBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 20, gap: 22, paddingBottom: 40 },

  /* Axtarış */
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceLowest, borderRadius: 14,
    paddingHorizontal: 14, height: 46,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0 },

  /* Qruplar */
  group: { gap: 12 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: Colors.primary },
  forYouIcon: { fontSize: 15 },
  groupTitle: { fontSize: 15, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.2 },

  /* Sətir kartları */
  list: { gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  rowPrimary: { paddingVertical: 14 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconBoxPrimary: { width: 48, height: 48, borderRadius: 14 },
  rowText: { flex: 1, gap: 2 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowTitle: { fontSize: 14.5, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2, flexShrink: 1 },
  rowTitlePrimary: { fontSize: 16.5, fontWeight: '800' },
  rowDesc: { fontSize: 12, color: Colors.textSecondary },
  countPill: {
    fontSize: 11, fontWeight: '800', color: Colors.primary,
    backgroundColor: Colors.primary + '14',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden',
  },
  soonPill: {
    fontSize: 11, fontWeight: '700', color: Colors.textMuted,
    backgroundColor: Colors.surfaceHigh,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden',
  },
  premiumBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  premiumBadgeText: { fontSize: 9, fontWeight: '800', color: '#B45309', letterSpacing: 0.4 },

  /* Sənin üçün */
  suggestCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16, gap: 14,
    borderWidth: 1.5, borderColor: Colors.primary + '33',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2,
  },
  suggestTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  suggestTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  suggestReason: { fontSize: 12.5, color: Colors.textSecondary, lineHeight: 18 },
  suggestBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  suggestCta: { fontSize: 13.5, fontWeight: '800', color: Colors.primary },

  /* Boş nəticə */
  empty: { alignItems: 'center', gap: 6, paddingVertical: 48 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 6 },
  emptySub: { fontSize: 12.5, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260 },
});
