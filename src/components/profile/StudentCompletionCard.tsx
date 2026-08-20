import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import {
  getStudentCompletion, STUDENT_COMPLETION_KEY,
  type StudentCompletionField,
} from '../../api/studentProfile.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

/** Faizə görə rəng — müəllim kartındakı ilə eyni dil. */
function colorFor(pct: number): string {
  if (pct >= 100) return '#10B981';
  if (pct >= 70) return '#EAB308';
  if (pct >= 40) return '#F59E0B';
  return '#EF4444';
}

/**
 * ŞAGİRD PROFİL TAMAMLAMA KARTI.
 *
 * Müəllimdəki kartın sadələşdirilmiş qarşılığı: faiz + çatışan sahələr +
 * hər sahəyə birbaşa keçid. Fərq — burada "yayımlama" anlayışı yoxdur,
 * kart heç bir funksiyanı bloklamır, sadəcə yönləndirir.
 *
 * Profil 100% olanda kart tamamilə gizlənir (daimi xatırlatma qalmasın).
 */
export default function StudentCompletionCard() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const { data: state } = useQuery({
    queryKey: STUDENT_COMPLETION_KEY,
    queryFn: getStudentCompletion,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const [expanded, setExpanded] = useState(true);

  // Faiz zolağı ölçülmüş piksel eni ilə animasiya olunur (faiz sətri ilə deyil —
  // '100%' interpolasiyası zolağı sona qədər doldurmurdu).
  const [trackWidth, setTrackWidth] = useState(0);
  const barAnim = useRef(new Animated.Value(0)).current;
  const pct = state?.pct ?? 0;

  useEffect(() => {
    if (!trackWidth) return;
    Animated.timing(barAnim, {
      toValue: (Math.min(100, Math.max(0, pct)) / 100) * trackWidth,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, barAnim, trackWidth]);

  // Məlumat yoxdur və ya profil tamdır → kart göstərilmir.
  if (!state || state.complete) return null;

  const tint = colorFor(pct);

  const goToField = (field: StudentCompletionField) =>
    navigation.navigate(Routes.EditProfile, {
      focusField: field.editTarget === 'avatar' ? 'avatarUrl' : field.key,
    });

  const requiredMissing = state.missing.filter((f) => f.required);

  return (
    <View style={s.card}>
      {/* Başlıq + faiz */}
      <View style={s.rowBetween}>
        <View style={s.rowCenter}>
          <View style={[s.iconCircle, { backgroundColor: Colors.primaryLight }]}>
            <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={s.title}>{t('studentCompletion.title')}</Text>
            <Text style={s.sub}>
              {t('studentCompletion.doneOf', { done: state.doneCount, total: state.totalCount })}
            </Text>
          </View>
        </View>
        <Text style={[s.pct, { color: tint }]}>{pct}%</Text>
      </View>

      {/* Progress */}
      <View
        style={s.barTrack}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w && Math.abs(w - trackWidth) > 0.5) setTrackWidth(w);
        }}
      >
        <Animated.View style={[s.barFill, { width: barAnim, backgroundColor: tint }]} />
      </View>

      {/* Niyə lazımdır — məcburi sahələr qalıbsa açıq deyilir */}
      <Text style={s.motivation}>
        {requiredMissing.length > 0
          ? t('studentCompletion.whyRequired')
          : t('studentCompletion.whyOptional')}
      </Text>

      {/* Çatışmayanlar */}
      <TouchableOpacity style={s.toggleRow} onPress={() => setExpanded((v) => !v)} activeOpacity={0.7}>
        <Text style={s.toggleText}>
          {t('studentCompletion.missingHeading', { n: state.missing.length })}
        </Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      {expanded && (
        <View style={s.missingList}>
          {state.missing.map((field) => (
            <TouchableOpacity
              key={field.key}
              style={s.missingRow}
              activeOpacity={0.75}
              onPress={() => goToField(field)}
            >
              <Ionicons
                name={field.required ? 'alert-circle' : 'ellipse-outline'}
                size={18}
                color={field.required ? '#EF4444' : Colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <View style={s.labelRow}>
                  <Text style={s.missingLabel}>{field.label}</Text>
                  {field.required && (
                    <View style={s.reqPill}>
                      <Text style={s.reqPillText}>{t('studentCompletion.required')}</Text>
                    </View>
                  )}
                </View>
                <Text style={s.missingHint}>{field.hint}</Text>
              </View>
              <View style={s.addBtn}>
                <Text style={s.addBtnText}>{t('studentCompletion.add')}</Text>
                <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          ))}

          {/* Tamamlananlar — irəliləyiş görünsün */}
          {state.fields
            .filter((f) => f.done)
            .map((f) => (
              <View key={f.key} style={s.doneRow}>
                <Ionicons name="checkmark-circle" size={17} color="#10B981" />
                <Text style={s.doneLabel}>{f.label}</Text>
              </View>
            ))}
        </View>
      )}

      {/* Əsas CTA — ilk çatışan sahəyə aparır */}
      {state.nextStep && (
        <TouchableOpacity activeOpacity={0.9} onPress={() => goToField(state.nextStep!)}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
            <Text style={s.primaryBtnText}>
              {t('studentCompletion.completeCta', { label: state.nextStep.label })}
            </Text>
            <Ionicons name="arrow-forward" size={17} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  title: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  sub: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginTop: 1 },
  pct: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },

  barTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.surfaceHighest, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },

  motivation: { fontSize: 12.5, color: Colors.textSecondary, lineHeight: 19 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  toggleText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  missingList: { gap: 8 },
  missingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLow, borderRadius: 12, padding: 10,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  missingLabel: { fontSize: 13.5, fontWeight: '700', color: Colors.textPrimary },
  reqPill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999, backgroundColor: '#FEE2E2' },
  reqPillText: { fontSize: 9.5, fontWeight: '800', color: '#B91C1C' },
  missingHint: { fontSize: 11.5, color: Colors.textSecondary, marginTop: 1, lineHeight: 16 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, backgroundColor: Colors.primaryLight,
  },
  addBtnText: { fontSize: 11.5, fontWeight: '800', color: Colors.primary },

  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  doneLabel: { fontSize: 12.5, color: Colors.textSecondary, fontWeight: '600' },

  primaryBtn: {
    height: 48, borderRadius: 999, marginTop: 4,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
  },
  primaryBtnText: { fontSize: 14.5, fontWeight: '800', color: '#fff' },
});
