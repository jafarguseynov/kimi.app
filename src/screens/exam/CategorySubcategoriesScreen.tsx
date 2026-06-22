import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getSubcategories, SubItem, FOREIGN_LANGUAGES, isForeignLangSubject } from '../../constants/educationTaxonomy';
import { getStructureSummary } from '../../constants/dimOfficialStructure';
import { useExamCategories } from '../../hooks/useExamCategories';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.CategorySubcategories>;

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function CategorySubcategoriesScreen({ navigation, route }: Props) {
  const { categoryKey, categoryTitle } = route.params;
  const { t } = useTranslation();
  const remote = useExamCategories();
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
        <View style={styles.grid}>
          {items.map((item) => {
            const structureSummary = item.structureKey ? getStructureSummary(item.structureKey) : undefined;
            return (
              <View key={item.key} style={styles.card}>
                <View style={styles.iconBox}>
                  <Text style={{ fontSize: 22 }}>{item.emoji ?? '📂'}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {!!item.desc && <Text style={styles.cardDesc}>{item.desc}</Text>}
                {!!structureSummary && (
                  <View style={styles.structurePill}>
                    <Ionicons name="document-text-outline" size={11} color={Colors.primary} />
                    <Text style={styles.structurePillText}>{structureSummary}</Text>
                  </View>
                )}
                <TouchableOpacity activeOpacity={0.85} onPress={() => openItem(item)}>
                  <LinearGradient
                    colors={GRADIENT}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.cardCta}
                  >
                    <Text style={styles.cardCtaText}>
                      {item.subjects && item.subjects.length > 0 ? 'Fənləri gör' : 'Daxil ol'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

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
            <Text style={styles.sheetTitle}>Hansı xarici dil?</Text>
            <Text style={styles.sheetSub}>İmtahan suallarını seçdiyin dil üzrə hazırlayacağıq</Text>
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

  scroll: { padding: 24, gap: 24, paddingBottom: 48 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    flex: 1, minWidth: '46%', maxWidth: '48%',
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 2,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    backgroundColor: Colors.primary + '14',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, lineHeight: 20, marginBottom: 4 },
  cardDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16, fontWeight: '500', marginBottom: 10 },
  structurePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
    backgroundColor: Colors.primary + '12',
    marginBottom: 12,
  },
  structurePillText: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 0.2 },
  cardCta: {
    paddingVertical: 10, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 3,
  },
  cardCtaText: { fontSize: 12, fontWeight: '700', color: '#fff' },

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
