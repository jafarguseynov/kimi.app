import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type SavedIcon = 'calculator-outline' | 'school-outline' | 'list-outline';
type ResultVariant = 'success' | 'primary' | 'neutral';

interface SavedItem {
  icon: SavedIcon;
  title: string;
  date: string;
  resultLabel: string;
  result: string;
  resultVariant: ResultVariant;
}

const SAVED: SavedItem[] = [
  {
    icon: 'calculator-outline',
    title: 'Yarımillik qiymətləndirmə',
    date: '24 May, 2024',
    resultLabel: 'NƏTİCƏ',
    result: 'Əla (5)',
    resultVariant: 'success',
  },
  {
    icon: 'school-outline',
    title: 'DİM Kalkulyatoru',
    date: '15 May, 2024',
    resultLabel: 'ÜMUMİ BAL',
    result: '450 Bal',
    resultVariant: 'primary',
  },
  {
    icon: 'list-outline',
    title: 'Sual sayına görə bal',
    date: '02 Aprel, 2024',
    resultLabel: 'NƏTİCƏ',
    result: '85.5 Bal',
    resultVariant: 'neutral',
  },
];

const RESULT_STYLES: Record<ResultVariant, { bg: string; color: string }> = {
  success: { bg: Colors.tertiaryContainer + '40', color: Colors.tertiary },
  primary: { bg: Colors.primary, color: '#fff' },
  neutral: { bg: Colors.surfaceLow, color: Colors.textPrimary },
};

export default function CalcSavedScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('calc.savedHeader')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('calc.yourCalcs')}</Text>
          <Text style={styles.sectionSub}>{t('calc.savedCount')}</Text>
        </View>

        {/* Saved cards */}
        <View style={styles.savedList}>
          {SAVED.map((item, idx) => {
            const rs = RESULT_STYLES[item.resultVariant];
            return (
              <View key={idx} style={styles.savedCard}>
                <View style={styles.savedCardTop}>
                  <View style={styles.savedLeft}>
                    <View style={styles.savedIconWrap}>
                      <Ionicons name={item.icon} size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.savedInfo}>
                      <Text style={styles.savedTitle}>{item.title}</Text>
                      <Text style={styles.savedDate}>{item.date}</Text>
                    </View>
                  </View>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Ionicons name="bookmark" size={24} color={Colors.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.savedCardBottom}>
                  <Text style={styles.resultLabel}>{item.resultLabel}</Text>
                  <View style={[styles.resultBadge, { backgroundColor: rs.bg }]}>
                    <Text style={[styles.resultBadgeText, { color: rs.color }]}>{item.result}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bento grid */}
        <View style={styles.bentoRow}>
          <View style={styles.bentoCard}>
            <View style={styles.bentoIconWrap}>
              <Ionicons name="trending-up-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.bentoTextGroup}>
              <Text style={styles.bentoTitle}>{t('calc.growth')}</Text>
              <Text style={styles.bentoSub}>
                {t('calc.growthPre')}<Text style={styles.bentoGreen}>+12%</Text>
              </Text>
            </View>
          </View>

          <LinearGradient colors={GRADIENT} style={styles.bentoAiCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.bentoAiGlow} />
            <View style={styles.bentoAiIconWrap}>
              <Ionicons name="sparkles-outline" size={22} color="#fff" />
            </View>
            <View style={styles.bentoTextGroup}>
              <Text style={styles.bentoAiTitle}>{t('calc.aiAnalysis')}</Text>
              <Text style={styles.bentoAiSub}>{t('calc.aiNewOffers')}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Load more */}
        <TouchableOpacity style={styles.loadMoreBtn} activeOpacity={0.8}>
          <Text style={styles.loadMoreText}>{t('calc.loadMore')}</Text>
        </TouchableOpacity>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 24, gap: 20, paddingBottom: 40 },

  sectionHeader: { gap: 4 },
  sectionTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  sectionSub: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },

  savedList: { gap: 12 },
  savedCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
    gap: 16,
  },
  savedCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  savedLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  savedIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  savedInfo: { gap: 4, flex: 1 },
  savedTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  savedDate: { fontSize: 12, fontWeight: '500', color: Colors.textMuted },

  savedCardBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.surfaceLow,
  },
  resultLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.2 },
  resultBadge: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  resultBadgeText: { fontSize: 13, fontWeight: '700' },

  bentoRow: { flexDirection: 'row', gap: 12 },
  bentoCard: {
    flex: 1, aspectRatio: 1,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    justifyContent: 'space-between',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  bentoIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  bentoTextGroup: { gap: 4 },
  bentoTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  bentoSub: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
  bentoGreen: { color: Colors.tertiary, fontWeight: '700' },

  bentoAiCard: {
    flex: 1, aspectRatio: 1, borderRadius: 20, padding: 20,
    justifyContent: 'space-between', overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  bentoAiGlow: {
    position: 'absolute', top: -16, right: -16,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bentoAiIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  bentoAiTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  bentoAiSub: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },

  loadMoreBtn: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 999,
    height: 52, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, alignSelf: 'center',
    borderWidth: 1.5, borderColor: Colors.borderLight,
  },
  loadMoreText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
