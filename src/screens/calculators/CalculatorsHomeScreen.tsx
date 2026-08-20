import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import {
  CALCULATORS,
  CALC_CATEGORIES,
  CALC_BY_ID,
  CalcMeta,
  normSearch,
  suggestedCalculators,
} from '../../constants/calculators';
import { useCalcRecordsStore } from '../../store/calcRecords.store';
import { rf, rs } from '../../utils/responsive';
import { useTranslation } from '../../i18n';

/**
 * KALKULYATORLAR — "kataloq" deyil, "lazım olanı tez tap" mərkəzi.
 *
 * İnformasiya iyerarxiyası (§18):
 *   1. Axtarış → 2. Son istifadə → 3. Ən çox istifadə olunanlar →
 *   4. Kateqoriyalar → 5. Tarixçə / Yaddaş (ikinci dərəcəli)
 *
 * Böyük mavi banner silindi (§2): yer tuturdu, funksiya vermirdi.
 * Kalkulyator siyahısı artıq `constants/calculators.ts` reyestrindən gəlir —
 * ekranın içində siyahı saxlanılmır, yeni kalkulyator yaradılmır.
 */

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** §13 — nəticə tapılmayanda təklif olunan sözlər. */
const SUGGEST_CHIPS = ['DİM', 'bal', 'KSQ', 'qiymət'];

export default function CalculatorsHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const recents = useCalcRecordsStore((s) => s.recents);
  const touch = useCalcRecordsStore((s) => s.touch);

  const open = (c: CalcMeta) => {
    touch(c.id);
    navigation.navigate(c.route as any);
  };

  // ─── Axtarış (§3) — başlıq + açıqlama + açar sözlər üzrə, real vaxtda ───
  const q = normSearch(query);
  const results = useMemo(() => {
    if (!q) return [];
    return CALCULATORS.filter((c) => {
      const hay = normSearch(`${t(c.titleKey)} ${t(c.descKey)} ${t(c.searchKey)}`);
      return hay.includes(q);
    });
  }, [q, t]);

  // ─── Son istifadə etdiklərin (§4) — heç nə yoxdursa bölmə göstərilmir ───
  const recentCalcs = useMemo(
    () => recents.map((r) => CALC_BY_ID[r.calcId]).filter(Boolean).slice(0, 4),
    [recents],
  );

  const popular = useMemo(() => CALCULATORS.filter((c) => c.popular), []);

  // §12 — davranış siqnalı hələ mövcud deyil → boş qayıdır, bölmə gizlənir.
  // Uydurma tövsiyə göstərilmir; siqnal əlavə olunanda UI olduğu kimi işləyəcək.
  const suggestions = useMemo(() => suggestedCalculators(), []);

  const setQueryAnimated = (v: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity'));
    setQuery(v);
  };

  // ─── Kart (§7) — ikon · ad · 1 sətir açıqlama · ox ───
  const renderRow = (c: CalcMeta, highlight = false) => (
    <TouchableOpacity
      key={c.id}
      style={[styles.row, highlight && styles.rowHighlight]}
      onPress={() => open(c)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconBox, highlight && styles.iconBoxHighlight]}>
        <Ionicons name={c.icon} size={rf(20)} color={highlight ? '#fff' : Colors.primary} />
      </View>
      <View style={styles.rowInfo}>
        <View style={styles.rowTitleLine}>
          <Text style={styles.rowTitle} numberOfLines={2}>{t(c.titleKey)}</Text>
          {highlight && c.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('calc.badgePopular')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.rowDesc} numberOfLines={2}>{t(c.descKey)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={rf(18)} color={Colors.outlineVariant} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('calc.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>{t('calc.subtitle')}</Text>

        {/* §3 — Axtarış */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={rf(18)} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQueryAnimated}
            placeholder={t('calc.searchPlaceholder')}
            placeholderTextColor={Colors.outlineVariant}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQueryAnimated('')} hitSlop={8} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={rf(18)} color={Colors.outlineVariant} />
            </TouchableOpacity>
          )}
        </View>

        {q ? (
          // ─── Axtarış rejimi ───────────────────────────────────────────
          results.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('calc.searchResults', { n: results.length })}</Text>
              <View style={styles.list}>{results.map((c) => renderRow(c))}</View>
            </View>
          ) : (
            // §13 — boş vəziyyət
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search" size={rf(26)} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>{t('calc.noResults')}</Text>
              <Text style={styles.emptySub}>{t('calc.noResultsSub')}</Text>
              <View style={styles.chipRow}>
                {SUGGEST_CHIPS.map((c) => (
                  <TouchableOpacity key={c} style={styles.chip} onPress={() => setQueryAnimated(c)} activeOpacity={0.8}>
                    <Text style={styles.chipText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )
        ) : (
          <>
            {/* §4 — Son istifadə etdiklərin (yalnız real istifadə varsa) */}
            {recentCalcs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🕘  {t('calc.recent')}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentRow}
                >
                  {recentCalcs.map((c) => (
                    <TouchableOpacity key={c.id} style={styles.recentChip} onPress={() => open(c)} activeOpacity={0.8}>
                      <View style={styles.recentIcon}>
                        <Ionicons name={c.icon} size={rf(15)} color={Colors.primary} />
                      </View>
                      <Text style={styles.recentText} numberOfLines={1}>{t(c.titleKey)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* §12 — Sənin üçün (real siqnal olmadan render olunmur) */}
            {suggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✨  {t('calc.forYou')}</Text>
                <View style={styles.list}>{suggestions.map((c) => renderRow(c))}</View>
              </View>
            )}

            {/* §5 — Ən çox istifadə olunanlar (max 3, vizual olaraq ön planda) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⭐  {t('calc.popular')}</Text>
              <View style={styles.list}>{popular.map((c) => renderRow(c, true))}</View>
            </View>

            {/* §6 — Kateqoriyalar.
                Yuxarıda "ən çox istifadə olunanlar"da göstərilən kalkulyatorlar
                burada TƏKRAR göstərilmir — eyni kart bir ekranda iki dəfə
                görünsə, "lazım olanı tez tap" məqsədi pozulur. Kateqoriya tam
                boşalırsa, başlığı da göstərilmir. */}
            {CALC_CATEGORIES.map((cat) => {
              const items = CALCULATORS.filter((c) => c.category === cat.key && !c.popular);
              if (items.length === 0) return null;
              return (
                <View key={cat.key} style={styles.section}>
                  <Text style={styles.sectionTitle}>{cat.emoji}  {t(cat.titleKey)}</Text>
                  <View style={styles.list}>{items.map((c) => renderRow(c))}</View>
                </View>
              );
            })}

            {/* §11 — Tarixçə / Yaddaş: ikinci dərəcəli, kompakt */}
            <View style={styles.secondaryRow}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate(Routes.CalcHistory as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={rf(16)} color={Colors.primary} />
                <Text style={styles.secondaryText}>{t('calc.history')}</Text>
                <Ionicons name="chevron-forward" size={rf(14)} color={Colors.outlineVariant} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate(Routes.CalcSaved as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="bookmark-outline" size={rf(16)} color={Colors.primary} />
                <Text style={styles.secondaryText}>{t('calc.saved')}</Text>
                <Ionicons name="chevron-forward" size={rf(14)} color={Colors.outlineVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Ionicons name="shield-checkmark-outline" size={rf(16)} color={Colors.outlineVariant} />
              <Text style={styles.footerText}>{t('calc.footerStandard')}</Text>
            </View>
          </>
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
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: rf(18), fontWeight: '700', color: Colors.primary },

  scroll: { paddingHorizontal: rs(20), paddingTop: rs(14), paddingBottom: rs(40), gap: rs(18) },
  subtitle: { fontSize: rf(13), color: Colors.textSecondary, lineHeight: rf(19), marginBottom: -rs(6) },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLowest, borderRadius: 14,
    paddingHorizontal: 14, height: rs(48),
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  searchInput: { flex: 1, fontSize: rf(14), color: Colors.textPrimary, padding: 0 },

  section: { gap: rs(10) },
  sectionTitle: { fontSize: rf(14), fontWeight: '700', color: Colors.textPrimary },
  list: { gap: rs(8) },

  // §7/§8 — bir sütunlu, kompakt, mətn kəsilmir
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    paddingVertical: rs(12), paddingHorizontal: rs(14),
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  rowHighlight: { borderColor: Colors.primaryFixed + '55', backgroundColor: '#fff' },
  rowInfo: { flex: 1, gap: 2 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rowTitle: { flexShrink: 1, fontSize: rf(14.5), fontWeight: '700', color: Colors.textPrimary, lineHeight: rf(19) },
  rowDesc: { fontSize: rf(11.5), color: Colors.textMuted, lineHeight: rf(16) },

  // §10 — vahid ikon sistemi
  iconBox: {
    width: rs(44), height: rs(44), borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  iconBoxHighlight: { backgroundColor: Colors.primary },

  badge: {
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  badgeText: { fontSize: rf(9), fontWeight: '800', color: Colors.primary },

  recentRow: { gap: 8, paddingRight: 4 },
  recentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceLowest, borderRadius: 999,
    paddingVertical: rs(9), paddingHorizontal: rs(12),
    borderWidth: 1, borderColor: Colors.borderLight,
    maxWidth: rs(190),
  },
  recentIcon: {
    width: rs(24), height: rs(24), borderRadius: 8,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  recentText: { flexShrink: 1, fontSize: rf(12), fontWeight: '600', color: Colors.textPrimary },

  empty: { alignItems: 'center', gap: 8, paddingVertical: rs(36) },
  emptyIcon: {
    width: rs(56), height: rs(56), borderRadius: 28,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: rf(16), fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: rf(12.5), color: Colors.textMuted, textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 },
  chip: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  chipText: { fontSize: rf(12), fontWeight: '600', color: Colors.primary },

  secondaryRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceLowest, borderRadius: 12,
    paddingVertical: rs(11), paddingHorizontal: rs(12),
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  secondaryText: { flex: 1, fontSize: rf(12.5), fontWeight: '600', color: Colors.textPrimary },

  footer: { alignItems: 'center', gap: 6, paddingTop: 4 },
  footerText: { fontSize: rf(9.5), fontWeight: '700', color: Colors.outlineVariant, textTransform: 'uppercase', letterSpacing: 1.2 },
});
