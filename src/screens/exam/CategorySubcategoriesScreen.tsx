import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getSubcategories, SubItem, FOREIGN_LANGUAGES, isForeignLangSubject } from '../../constants/educationTaxonomy';
import { getStructureSummary } from '../../constants/dimOfficialStructure';
import { useExamCategories } from '../../hooks/useExamCategories';
import { useExamCounts } from '../../hooks/useExams';
import { useMe } from '../../hooks/useUser';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.CategorySubcategories>;

type StageSection = { label: string | null; items: SubItem[] };

// Rus bölməsi (və oxşar sinif-əsaslı kateqoriyalar) üçün siniflərı mərhələ başlıqları altında qruplaşdırır.
// Qruplama key-dən törədilir — backend-də ayrıca səviyyə yoxdur (model 2 səviyyəlidir).
function buildStageSections(items: SubItem[]): StageSection[] {
  const buckets: Record<string, SubItem[]> = { primary: [], middle: [], graduation: [], qabul: [], other: [] };
  for (const it of items) {
    if (it.key.startsWith('ab-')) buckets.qabul.push(it);
    else if (/^\d+$/.test(it.key)) {
      const g = parseInt(it.key, 10);
      if (g <= 4) buckets.primary.push(it);
      else if (g <= 8) buckets.middle.push(it);
      else buckets.graduation.push(it);
    } else buckets.other.push(it);
  }
  const order: { k: keyof typeof buckets; label: string | null }[] = [
    { k: 'primary', label: '📗 Başlanğıc siniflər (1–4)' },
    { k: 'middle', label: '📘 Ümumi orta (5–8)' },
    { k: 'graduation', label: '🎓 Buraxılış (9–11)' },
    { k: 'qabul', label: '🎯 Qəbul / Abituriyent' },
    { k: 'other', label: null },
  ];
  return order.filter((o) => buckets[o.k].length > 0).map((o) => ({ label: o.label, items: buckets[o.k] }));
}

export default function CategorySubcategoriesScreen({ navigation, route }: Props) {
  const { categoryKey, categoryTitle } = route.params;
  const { t } = useTranslation();
  const remote = useExamCategories();
  const { data: counts } = useExamCounts();
  const { data: me } = useMe();
  const remoteSubs = remote?.find((c) => c.key === categoryKey)?.children;
  const items: SubItem[] = remoteSubs && remoteSubs.length > 0
    ? remoteSubs.map((s) => ({
        key: s.key,
        title: s.title,
        desc: s.description ?? undefined,
        emoji: s.emoji ?? undefined,
        subjects: s.subjects ?? undefined,
      }))
    : getSubcategories(categoryKey);

  // "Xarici dil" terminal item-i seçiləndə konkret dil soruşulur (Magistr, Doktorantura).
  const [langPickerKey, setLangPickerKey] = useState<string | null>(null);

  // Açılıb-bağlanan mərhələ bölmələri (Rus bölməsi). Başlanğıcda hamısı bağlıdır.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const goToExams = (subKey: string, subject: string) => {
    navigation.navigate(Routes.CategoryExams, {
      categoryKey,
      categoryTitle: `${categoryTitle} · ${subject}`,
      subKey,
      subject,
    });
  };

  const openItem = (item: SubItem) => {
    if (item.subjects && item.subjects.length > 0) {
      navigation.navigate(Routes.GradeSubjects, {
        categoryKey,
        parentKey: item.key,
        parentTitle: item.title,
      });
      return;
    }
    // Terminal item — subjects array yoxdursa, item özü fənn rolu oynayır
    // (məs. Magistr → Məntiq, MIQ → Riyaziyyat müəllimi)
    if (isForeignLangSubject(item.title)) {
      setLangPickerKey(item.key);
      return;
    }
    goToExams(item.key, item.title);
  };

  const pickLanguage = (lang: string) => {
    const subKey = langPickerKey;
    setLangPickerKey(null);
    if (subKey) goToExams(subKey, lang);
  };

  // Rus bölməsi: siniflər + qəbul qrupları mərhələ başlıqları altında. Digər kateqoriyalar: tək qrup.
  const sections: StageSection[] =
    categoryKey === 'russian' ? buildStageSections(items) : [{ label: null, items }];

  // «Sənə uyğun» — YALNIZ real profil məlumatı ilə: şagirdin sinfi bilinirsə
  // sinif-əsaslı kateqoriyalarda (Orta Məktəb / Rus bölməsi) həmin sinif işarələnir.
  // İxtisas qrupu (I–V) üçün profildə uyğun məlumat yoxdur → nişan göstərilmir.
  const myGrade: string | undefined = (me as any)?.grade ?? (me as any)?.profile?.grade;
  const myGradeNum = parseInt(String(myGrade ?? '').match(/\d+/)?.[0] ?? '', 10);
  const isGradeCategory = categoryKey === 'middle' || categoryKey === 'russian';
  const isRecommended = (item: SubItem) =>
    isGradeCategory && !!myGradeNum && item.key === String(myGradeNum);

  const hintKey = categoryKey === 'abituriyent' ? 'examCat.pickGroupHintAbit' : 'examCat.pickGroupHint';

  const renderCard = (item: SubItem) => {
    const structureSummary = item.structureKey ? getStructureSummary(item.structureKey) : undefined;
    const n = counts?.subs?.[`${categoryKey}:${item.key}`];
    const subjectLine = item.subjects && item.subjects.length > 0
      ? item.subjects.slice(0, 3).join(' · ') + (item.subjects.length > 3 ? ` +${item.subjects.length - 3}` : '')
      : item.desc;
    const recommended = isRecommended(item);
    return (
      <TouchableOpacity
        key={item.key}
        style={[styles.row, recommended && styles.rowRecommended]}
        activeOpacity={0.75}
        onPress={() => openItem(item)}
      >
        <View style={styles.iconBox}>
          <Text style={{ fontSize: 20 }}>{item.emoji ?? '📂'}</Text>
        </View>
        <View style={styles.rowText}>
          <View style={styles.titleLine}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            {recommended && (
              <View style={styles.recBadge}>
                <Ionicons name="star" size={9} color={Colors.primary} />
                <Text style={styles.recBadgeText}>{t('examCat.recommended')}</Text>
              </View>
            )}
          </View>
          {!!subjectLine && <Text style={styles.cardDesc} numberOfLines={1}>{subjectLine}</Text>}
          <View style={styles.metaLine}>
            {!!structureSummary && (
              <View style={styles.structurePill}>
                <Ionicons name="document-text-outline" size={10} color={Colors.primary} />
                <Text style={styles.structurePillText}>{structureSummary}</Text>
              </View>
            )}
            {!!n && <Text style={styles.countPill}>{t('examCat.nExams', { n })}</Text>}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{categoryTitle}</Text>
          <Text style={styles.headerSub}>{t('examCat.pickSub')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>{t(hintKey)}</Text>

        {sections.map((section, si) => {
          // Başlıqsız bölmə (digər kateqoriyalar) — birbaşa göstər, açılma yoxdur.
          if (!section.label) {
            return (
              <View key={`sec-${si}`} style={styles.section}>
                <View style={styles.list}>{section.items.map(renderCard)}</View>
              </View>
            );
          }
          // Başlıqlı bölmə (Rus bölməsi mərhələləri) — klik edincə açılır/bağlanır.
          const id = `sec-${si}`;
          const open = !!openSections[id];
          return (
            <View key={id} style={styles.section}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.sectionHeader}
                onPress={() => toggleSection(id)}
              >
                <Text style={styles.sectionLabel}>{section.label}</Text>
                <View style={styles.sectionHeaderRight}>
                  <Text style={styles.sectionCount}>{section.items.length}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.textMuted}
                  />
                </View>
              </TouchableOpacity>
              {open && <View style={styles.list}>{section.items.map(renderCard)}</View>}
            </View>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Xarici dil seçimi */}
      <Modal
        visible={langPickerKey !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLangPickerKey(null)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setLangPickerKey(null)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('examCat.langTitle')}</Text>
            <Text style={styles.sheetSub}>{t('examCat.langSub')}</Text>
            <View style={styles.langGrid}>
              {FOREIGN_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  activeOpacity={0.85}
                  style={styles.langCard}
                  onPress={() => pickLanguage(lang)}
                >
                  <View style={styles.langIcon}>
                    <Ionicons name="language" size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.langText}>{lang}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
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

  scroll: { padding: 20, gap: 18, paddingBottom: 40 },
  introText: { fontSize: 13.5, color: Colors.textSecondary, lineHeight: 19 },

  section: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLowest, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  sectionLabel: { flex: 1, fontSize: 14, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.2 },
  sectionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionCount: {
    fontSize: 11, fontWeight: '800', color: Colors.primary,
    backgroundColor: Colors.primary + '14',
    minWidth: 22, textAlign: 'center',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: 'hidden',
  },

  list: { gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  rowRecommended: { borderColor: Colors.primary + '55', borderWidth: 1.5 },
  iconBox: {
    width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary + '14',
  },
  rowText: { flex: 1, gap: 3 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2, flexShrink: 1 },
  cardDesc: { fontSize: 12, color: Colors.textSecondary },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  recBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primary + '14',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999,
  },
  recBadgeText: { fontSize: 9.5, fontWeight: '800', color: Colors.primary, letterSpacing: 0.2 },
  structurePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999,
    backgroundColor: Colors.primary + '12',
  },
  structurePillText: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 0.2 },
  countPill: {
    fontSize: 10.5, fontWeight: '800', color: Colors.textSecondary,
    backgroundColor: Colors.surfaceHigh,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, overflow: 'hidden',
  },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surfaceLowest,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.borderLight,
    alignSelf: 'center', marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  sheetSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, marginBottom: 16 },
  langGrid: { gap: 10 },
  langCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLow, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  langIcon: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: Colors.primary + '14', alignItems: 'center', justifyContent: 'center',
  },
  langText: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
});
