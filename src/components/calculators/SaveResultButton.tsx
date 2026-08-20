import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { useCalcRecordsStore } from '../../store/calcRecords.store';
import { rf, rs } from '../../utils/responsive';
import { useTranslation } from '../../i18n';

/**
 * §15 — "Yadda saxla".
 *
 * Hesablama onsuz da tarixçəyə düşür (kalkulyator ekranı `addRecord` çağırır);
 * bu düymə həmin qeydi "Yaddaş" bölməsinə sancaqlayır. Eyni davranış hər
 * kalkulyatorda təkrarlanmasın deyə ortaq komponentdir.
 */
export default function SaveResultButton({ recordId }: { recordId: string | null }) {
  const { t } = useTranslation();
  const toggleSaved = useCalcRecordsStore((s) => s.toggleSaved);
  const records = useCalcRecordsStore((s) => s.records);
  const [busy, setBusy] = useState(false);

  if (!recordId) return null;
  const saved = records.find((r) => r.id === recordId)?.saved ?? false;

  const onPress = () => {
    if (busy) return;
    setBusy(true);
    toggleSaved(recordId);
    setTimeout(() => setBusy(false), 250);
  };

  return (
    <TouchableOpacity style={[s.btn, saved && s.btnSaved]} onPress={onPress} activeOpacity={0.85}>
      <Ionicons
        name={saved ? 'bookmark' : 'bookmark-outline'}
        size={rf(17)}
        color={saved ? '#fff' : Colors.primary}
      />
      <Text style={[s.text, saved && s.textSaved]}>
        {saved ? t('calc.savedOk') : t('calc.saveResult')}
      </Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    height: rs(50), paddingHorizontal: rs(20),
  },
  btnSaved: { backgroundColor: Colors.primary },
  text: { fontSize: rf(14.5), fontWeight: '700', color: Colors.primary },
  textSaved: { color: '#fff' },
});
