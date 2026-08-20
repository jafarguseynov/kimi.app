import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { CALC_BY_ID } from '../../constants/calculators';
import { useCalcRecordsStore } from '../../store/calcRecords.store';
import { rf, rs } from '../../utils/responsive';
import { useTranslation } from '../../i18n';
import CalcRecordCard from '../../components/calculators/CalcRecordCard';

/**
 * YADDAŞ — istifadəçinin əl ilə saxladığı nəticələr (§15).
 *
 * ⚠️ Əvvəl burada da saxta nümunələr və uydurma "Artım +12%" / "AI Analiz"
 * kartları vardı — arxasında heç bir hesablama yox idi. İndi yalnız real
 * saxlanılmış qeydlər göstərilir.
 */
export default function CalcSavedScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const records = useCalcRecordsStore((s) => s.records);
  const toggleSaved = useCalcRecordsStore((s) => s.toggleSaved);
  const saved = useMemo(() => records.filter((r) => r.saved), [records]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('calc.savedHeader')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bookmark-outline" size={rf(28)} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('calc.savedEmpty')}</Text>
          <Text style={styles.emptySub}>{t('calc.savedEmptySub')}</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.emptyBtnText}>{t('calc.goCalculators')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.countLine}>{t('calc.savedCount', { n: saved.length })}</Text>
          {saved.map((r) => (
            <CalcRecordCard
              key={r.id}
              record={r}
              meta={CALC_BY_ID[r.calcId]}
              onToggleSaved={() => toggleSaved(r.id)}
            />
          ))}
        </ScrollView>
      )}
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
  headerTitle: { fontSize: rf(18), fontWeight: '700', color: Colors.primary },

  scroll: { padding: rs(20), gap: rs(10), paddingBottom: rs(40) },
  countLine: { fontSize: rf(12), fontWeight: '600', color: Colors.textMuted },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: rs(32) },
  emptyIcon: {
    width: rs(64), height: rs(64), borderRadius: 32,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: rf(17), fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  emptySub: { fontSize: rf(13), color: Colors.textMuted, textAlign: 'center', lineHeight: rf(19) },
  emptyBtn: {
    marginTop: 12, backgroundColor: Colors.primary, borderRadius: 999,
    paddingHorizontal: rs(22), paddingVertical: rs(12),
  },
  emptyBtnText: { fontSize: rf(13.5), fontWeight: '700', color: '#fff' },
});
