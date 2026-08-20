import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { hapticSuccess } from '../../utils/haptics';
import Confetti from '../effects/Confetti';
import { useTeacherProfileCompletion } from '../../hooks/useTeacherProfileCompletion';
import {
  publishTeacherProfile, asIncompleteError,
  type CompletionField, type TeacherProfileStatus,
} from '../../api/teacherProfile.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

/** §8 — tamamlanma səviyyəsinin rəngi. */
const LEVEL_COLOR: Record<string, string> = {
  low: '#EF4444',
  medium: '#F59E0B',
  high: '#EAB308',
  complete: '#10B981',
};

const STATUS_ICON: Record<TeacherProfileStatus, keyof typeof Ionicons.glyphMap> = {
  draft: 'document-outline',
  incomplete: 'alert-circle-outline',
  ready: 'checkmark-done-outline',
  published: 'eye-outline',
  unpublished: 'eye-off-outline',
  suspended: 'ban-outline',
};

/**
 * §5, §6, §9, §29, §36 — MÜƏLLİM PROFİL TAMAMLAMA KARTI.
 *
 * Dörd suala cavab verir: nə çatışmır → niyə tamamlamalıdır →
 * harada tamamlamalıdır → bir kliklə necə (§35).
 *
 * ⚠️ Bütün rəqəmlər və "yayımlana bilər?" qərarı serverdən gəlir.
 */
export default function TeacherCompletionCard() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { pct, missing, nextStep, complete, state, isLoading, refresh } = useTeacherProfileCompletion();

  const [celebrate, setCelebrate] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // §30 — faiz zolağı yumşaq artır (75% → 100% sıçrayış yox).
  //
  // ⚠️ En FAİZ SƏTRİ ilə deyil, ölçülmüş PİKSEL eni ilə animasiya olunur:
  // '100%' interpolasiyası valideynin daxili en hesabı ilə birləşəndə zolağı
  // sona qədər doldurmurdu (100%-də belə boşluq qalırdı).
  const [trackWidth, setTrackWidth] = useState(0);
  const barAnim = useRef(new Animated.Value(0)).current;
  const prevPct = useRef(0);
  useEffect(() => {
    if (!trackWidth) return;
    Animated.timing(barAnim, {
      toValue: (Math.min(100, Math.max(0, pct)) / 100) * trackWidth,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // en (width) animasiyası native driver-i dəstəkləmir
    }).start();

    // 100%-ə ilk dəfə çatanda təbrik (§29). Ekran hər açılanda təkrarlanmır.
    if (pct >= 100 && prevPct.current > 0 && prevPct.current < 100) {
      setCelebrate(true);
      hapticSuccess();
      setTimeout(() => setCelebrate(false), 3000);
    }
    prevPct.current = pct;
  }, [pct, barAnim, trackWidth]);

  const publish = useMutation({
    mutationFn: publishTeacherProfile,
    onSuccess: () => {
      hapticSuccess();
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 3000);
      refresh();
    },
    onError: (err: any) => {
      // §14 — backend "çatışır" desə, konkret siyahını göstəririk.
      const inc = asIncompleteError(err);
      Alert.alert(
        inc ? t('teacherCompletion.publishBlockedTitle') : t('common.error'),
        inc
          ? `${inc.message}:\n\n${inc.missing.map((m) => `• ${m.label}`).join('\n')}`
          : err?.response?.data?.message ?? t('common.retry'),
      );
      refresh();
    },
  });

  if (isLoading && !state) {
    return (
      <View style={s.card}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }
  if (!state) return null;

  const status = state.status;
  const levelColor = LEVEL_COLOR[state.level] ?? Colors.primary;

  /** §7 — ağıllı yönləndirmə: sahəni doldurmaq üçün doğru ekrana aparır. */
  const goToField = (field: CompletionField) => {
    if (field.editTarget === 'avatar') {
      navigation.navigate(Routes.EditProfile, { focusField: 'avatarUrl' });
      return;
    }
    navigation.navigate(Routes.EditProfile, { focusField: field.key });
  };

  const onTrackLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - trackWidth) > 0.5) setTrackWidth(w);
  };

  // ─── Profil yayımdadır → KART GİZLƏNİR ──────────────────────────
  // İş bitib: müəllim artıq hər dəfə profil ekranını açanda "profilin
  // hazırdır" kartını görmür. Statusu bundan sonra adının yanındakı mavi
  // təsdiq nişanı bildirir (şagirdlər də eyni nişanı görür).
  // Yalnız yayımlandığı andakı təbrik konfetisi göstərilir.
  if (status === 'published') {
    return <Confetti active={celebrate} origin="bottom" />;
  }

  return (
    <>
      <View style={s.card}>
        {/* Başlıq + faiz */}
        <View style={s.rowBetween}>
          <View style={s.rowCenter}>
            <View style={[s.iconCircle, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name={STATUS_ICON[status] ?? 'person-outline'} size={20} color={Colors.primary} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={s.title}>
                {complete ? t('teacherCompletion.readyTitle') : t('teacherCompletion.title')}
              </Text>
              <Text style={[s.levelLabel, { color: levelColor }]}>{state.levelLabel}</Text>
            </View>
          </View>
          <Text style={[s.pct, { color: levelColor }]}>{pct}%</Text>
        </View>

        {/* Progress */}
        <View style={s.barTrack} onLayout={onTrackLayout}>
          <Animated.View style={[s.barFill, { width: barAnim, backgroundColor: levelColor }]} />
        </View>

        {/* Qalan bölmə sayı + motivasiya (§16) */}
        {!complete && (
          <>
            <Text style={s.remaining}>
              {t('teacherCompletion.remaining', { count: state.remainingSections })}
            </Text>
            <Text style={s.motivation}>{state.messages.incomplete}</Text>
          </>
        )}

        {/* ─── 100%: təbrik + yayımla (§9, §13) ─── */}
        {complete ? (
          <View style={s.readyBox}>
            <Text style={s.readyEmoji}>🎉</Text>
            <Text style={s.readyHeading}>{t('teacherCompletion.allDoneHeading')}</Text>
            <Text style={s.readyText}>{t('teacherCompletion.allDoneBody')}</Text>
            <TouchableOpacity activeOpacity={0.9} onPress={() => publish.mutate()} disabled={publish.isPending}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.publishBtn}>
                {publish.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={s.publishBtnText}>{t('teacherCompletion.publishCta')}</Text>
                    <Ionicons name="arrow-forward" size={17} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Çatışmayan məlumatlar (§6) */}
            <TouchableOpacity style={s.toggleRow} onPress={() => setExpanded((v) => !v)} activeOpacity={0.7}>
              <Text style={s.toggleText}>{t('teacherCompletion.missingHeading')}</Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textSecondary} />
            </TouchableOpacity>

            {expanded && (
              <View style={s.missingList}>
                {missing.map((field) => (
                  <TouchableOpacity
                    key={field.key}
                    style={s.missingRow}
                    activeOpacity={0.75}
                    onPress={() => goToField(field)}
                  >
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.missingLabel}>{field.label}</Text>
                      <Text style={s.missingHint}>{field.hint}</Text>
                    </View>
                    <View style={s.addBtn}>
                      <Text style={s.addBtnText}>{t('teacherCompletion.add')}</Text>
                      <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Tamamlananlar — motivasiya üçün (§6 ✅ siyahısı) */}
                {state.fields
                  .filter((f) => f.required && f.done)
                  .map((f) => (
                    <View key={f.key} style={s.doneRow}>
                      <Ionicons name="checkmark-circle" size={17} color="#10B981" />
                      <Text style={s.doneLabel}>{f.label}</Text>
                    </View>
                  ))}
              </View>
            )}

            {/* Əsas CTA — ilk tamamlanmamış sahəyə aparır (§7) */}
            {nextStep && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => goToField(nextStep)}>
                <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
                  <Text style={s.primaryBtnText}>{t('teacherCompletion.completeCta')}</Text>
                  <Ionicons name="arrow-forward" size={17} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Yayımlanma vəziyyəti — nə üçün görünmədiyini izah edir (§13) */}
            <View style={s.lockRow}>
              <Ionicons name="lock-closed" size={13} color={Colors.textMuted} />
              <Text style={s.lockText}>
                {state.inGrace
                  ? t('teacherCompletion.graceNotice')
                  : status === 'suspended'
                  ? t('teacherCompletion.suspendedNotice')
                  : t('teacherCompletion.lockedNotice')}
              </Text>
            </View>
          </>
        )}
      </View>
      <Confetti active={celebrate} origin="bottom" />
    </>
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
  levelLabel: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  pct: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },

  barTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.surfaceHighest, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },

  remaining: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  motivation: { fontSize: 12.5, color: Colors.textSecondary, lineHeight: 19 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  toggleText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  missingList: { gap: 8 },
  missingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLow, borderRadius: 12, padding: 10,
  },
  missingLabel: { fontSize: 13.5, fontWeight: '700', color: Colors.textPrimary },
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

  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  lockText: { flex: 1, fontSize: 11.5, color: Colors.textMuted, lineHeight: 16 },

  readyBox: { alignItems: 'center', gap: 6, paddingTop: 4 },
  readyEmoji: { fontSize: 34 },
  readyHeading: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  readyText: { fontSize: 12.5, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8 },
  publishBtn: {
    height: 50, borderRadius: 999, marginTop: 8, paddingHorizontal: 28,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  publishBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

});
