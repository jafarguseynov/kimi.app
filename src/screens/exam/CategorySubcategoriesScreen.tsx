import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { getSubcategories, SubItem } from '../../constants/educationTaxonomy';
import { getStructureSummary } from '../../constants/dimOfficialStructure';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.CategorySubcategories>;

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function CategorySubcategoriesScreen({ navigation, route }: Props) {
  const { categoryKey, categoryTitle } = route.params;
  const items = getSubcategories(categoryKey);

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
    navigation.navigate(Routes.CategoryExams, {
      categoryKey,
      categoryTitle: `${categoryTitle} · ${item.title}`,
      subKey: item.key,
      subject: item.title,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{categoryTitle}</Text>
          <Text style={styles.headerSub}>ALT KATEQORİYA SEÇ</Text>
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
});
