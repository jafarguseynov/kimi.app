import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { hapticLight } from '../../utils/haptics';
import { useTranslation } from '../../i18n';

export interface GetStartedStep {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  done: boolean;
  onPress: () => void;
}

interface Props {
  steps: GetStartedStep[];
  onDismiss: () => void;
}

/**
 * "Başlanğıc yol xəritəsi" — yeni istifadəçiyə tətbiqdə ilk atacağı addımları
 * aydın göstərir ki, "hara girim, nə edim?" sualı yaranmasın.
 * Bütün addımlar bitəndə və ya bağlananda görünmür (HomeScreen idarə edir).
 */
export default function GetStartedCard({ steps, onDismiss }: Props) {
  const { t } = useTranslation();
  const doneCount = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  const total = steps.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.headerIcon}>
          <Ionicons name="rocket" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{t('getStarted.title')}</Text>
          <Text style={s.sub}>{t('getStarted.progress', { done: doneCount, total })}</Text>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            hapticLight();
            onDismiss();
          }}
          accessibilityLabel={t('getStarted.dismiss')}
        >
          <Ionicons name="close" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* İrəliləyiş zolağı */}
      <View style={s.track}>
        <View style={[s.fill, { width: `${pct}%` }]} />
      </View>

      {/* Addımlar */}
      <View style={{ marginTop: 12, gap: 8 }}>
        {steps.map((step) => (
          <TouchableOpacity
            key={step.key}
            style={[s.step, step.done && s.stepDone]}
            activeOpacity={0.8}
            disabled={step.done}
            onPress={() => {
              hapticLight();
              step.onPress();
            }}
          >
            <View style={[s.check, step.done && s.checkDone]}>
              <Ionicons
                name={step.done ? 'checkmark' : step.icon}
                size={16}
                color={step.done ? '#fff' : Colors.primary}
              />
            </View>
            <Text style={[s.stepLabel, step.done && s.stepLabelDone]} numberOfLines={1}>
              {step.label}
            </Text>
            {!step.done && <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginTop: 1 },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceLow,
    marginTop: 12,
    overflow: 'hidden',
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: Colors.success },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
  },
  stepDone: { backgroundColor: 'transparent', opacity: 0.6 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: Colors.success },
  stepLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  stepLabelDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
