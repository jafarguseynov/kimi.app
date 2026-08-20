import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { CalcMeta } from '../../constants/calculators';
import { CalcRecord } from '../../store/calcRecords.store';
import { rf, rs } from '../../utils/responsive';
import { useTranslation } from '../../i18n';

/**
 * Tarixçə və Yaddaş ekranlarının ortaq qeyd kartı — eyni kart iki yerdə
 * təkrarlanmasın deyə ayrıca komponentdir.
 */

const LOCALE: Record<string, string> = { az: 'az-AZ', ru: 'ru-RU', en: 'en-US' };

export default function CalcRecordCard({
  record,
  meta,
  onToggleSaved,
  onDelete,
}: {
  record: CalcRecord;
  meta?: CalcMeta;
  onToggleSaved: () => void;
  onDelete?: () => void;
}) {
  const { t, language } = useTranslation();

  const date = new Date(record.createdAt).toLocaleDateString(LOCALE[language] ?? 'az-AZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const note = record.noteKey ? t(record.noteKey) : record.note;

  return (
    <View style={s.card}>
      <View style={s.top}>
        <View style={s.icon}>
          <Ionicons name={meta?.icon ?? 'calculator-outline'} size={rf(19)} color={Colors.primary} />
        </View>
        <View style={s.info}>
          <Text style={s.title} numberOfLines={2}>
            {meta ? t(meta.titleKey) : t('calc.title')}
          </Text>
          <Text style={s.date}>{date}</Text>
        </View>
        <TouchableOpacity onPress={onToggleSaved} activeOpacity={0.7} hitSlop={8}>
          <Ionicons
            name={record.saved ? 'bookmark' : 'bookmark-outline'}
            size={rf(19)}
            color={record.saved ? Colors.primary : Colors.outlineVariant}
          />
        </TouchableOpacity>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} activeOpacity={0.7} hitSlop={8} style={{ marginLeft: 10 }}>
            <Ionicons name="close" size={rf(18)} color={Colors.outlineVariant} />
          </TouchableOpacity>
        )}
      </View>

      <View style={s.bottom}>
        <Text style={s.note} numberOfLines={1}>{note ?? t('calc.result')}</Text>
        <Text style={s.value}>
          {record.value}
          {record.unitKey ? <Text style={s.unit}> {t(record.unitKey)}</Text> : null}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    padding: rs(14), gap: rs(12),
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: rs(40), height: rs(40), borderRadius: 13,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  info: { flex: 1, gap: 2 },
  title: { fontSize: rf(14), fontWeight: '700', color: Colors.textPrimary, lineHeight: rf(18) },
  date: { fontSize: rf(11), fontWeight: '500', color: Colors.textMuted },

  bottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    paddingTop: rs(10), borderTopWidth: 1, borderTopColor: Colors.surfaceLow,
  },
  note: { flex: 1, fontSize: rf(11.5), fontWeight: '500', color: Colors.textMuted },
  value: { fontSize: rf(20), fontWeight: '800', color: Colors.primary, letterSpacing: -0.4 },
  unit: { fontSize: rf(12), fontWeight: '600', color: Colors.textMuted, letterSpacing: 0 },
});
