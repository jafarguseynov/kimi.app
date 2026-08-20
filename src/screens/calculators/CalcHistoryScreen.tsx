import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
 * HESABLAMA TARİXÇƏSİ — real qeydlər.
 *
 * ⚠️ Əvvəl bu ekran ekranın içinə yazılmış 3 saxta nümunə göstərirdi
 * ("24 May 2024 · 450 Bal") — istifadəçinin heç vaxt etmədiyi hesablamalar.
 * İndi `calcRecords.store` (cihaz yaddaşı) oxunur; hesablama edilməyibsə
 * dürüst boş vəziyyət göstərilir.
 */
export default function CalcHistoryScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const records = useCalcRecordsStore((s) => s.records);
  const toggleSaved = useCalcRecordsStore((s) => s.toggleSaved);
  const removeRecord = useCalcRecordsStore((s) => s.removeRecord);
  const clearHistory = useCalcRecordsStore((s) => s.clearHistory);

  const confirmClear = () => {
    Alert.alert(t('calc.clearTitle'), t('calc.clearSub'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('calc.clearConfirm'), style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('calc.historyHeader')}</Text>
        {records.length > 0 ? (
          <TouchableOpacity style={styles.headerBtn} onPress={confirmClear} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      {records.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="time-outline" size={rf(28)} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('calc.historyEmpty')}</Text>
          <Text style={styles.emptySub}>{t('calc.historyEmptySub')}</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.emptyBtnText}>{t('calc.goCalculators')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.countLine}>{t('calc.historyCount', { n: records.length })}</Text>
          {records.map((r) => (
            <CalcRecordCard
              key={r.id}
              record={r}
              meta={CALC_BY_ID[r.calcId]}
              onToggleSaved={() => toggleSaved(r.id)}
              onDelete={() => removeRecord(r.id)}
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
