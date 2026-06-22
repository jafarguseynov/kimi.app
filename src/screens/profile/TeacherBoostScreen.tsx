import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { boostTeacher } from '../../api/user.api';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

interface BoostPackage {
  id: string;
  days: number;
  price: number;
  titleKey: string;
  subKey: string;
  best?: boolean;
}

const PACKAGES: BoostPackage[] = [
  { id: 'b-1', days: 1, price: 5, titleKey: 'teacherBoost.pkg1Title', subKey: 'teacherBoost.pkg1Sub' },
  { id: 'b-7', days: 7, price: 25, titleKey: 'teacherBoost.pkg7Title', subKey: 'teacherBoost.pkg7Sub', best: true },
  { id: 'b-30', days: 30, price: 80, titleKey: 'teacherBoost.pkg30Title', subKey: 'teacherBoost.pkg30Sub' },
];

const DATE_LOCALE: Record<string, string> = { az: 'az-AZ', ru: 'ru-RU', en: 'en-US' };

export default function TeacherBoostScreen() {
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<BoostPackage>(PACKAGES[1]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => boostTeacher(selected.days),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      const until = new Date(data.featuredUntil).toLocaleDateString(DATE_LOCALE[language] ?? 'az-AZ', { day: 'numeric', month: 'long' });
      Alert.alert(
        t('teacherBoost.successTitle'),
        t('teacherBoost.successBody', { until }),
        [{ text: t('teacherBoost.great'), onPress: () => navigation.goBack() }],
      );
    },
    onError: (err: any) => Alert.alert(t('teacherBoost.errorTitle'), err?.response?.data?.message ?? t('teacherBoost.errorBody')),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('teacherBoost.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={GRADIENT} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroAura} pointerEvents="none" />
          <View style={styles.heroIcon}>
            <Ionicons name="rocket" size={32} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{t('teacherBoost.heroTitle')}</Text>
          <Text style={styles.heroSub}>
            {t('teacherBoost.heroSub')}
          </Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>{t('teacherBoost.selectPackage')}</Text>

        {PACKAGES.map((p) => {
          const active = selected.id === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.pkgCard, active && styles.pkgCardActive]}
              activeOpacity={0.9}
              onPress={() => setSelected(p)}
            >
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.pkgTitleRow}>
                  <Text style={styles.pkgTitle}>{t(p.titleKey)}</Text>
                  {p.best && (
                    <View style={styles.bestBadge}>
                      <Text style={styles.bestBadgeText}>{t('teacherBoost.recommended')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pkgSub}>{t(p.subKey)}</Text>
              </View>
              <View style={styles.priceWrap}>
                <Text style={styles.priceNum}>{p.price}</Text>
                <Text style={styles.priceCur}>AZN</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity activeOpacity={0.9} onPress={() => mutate()} disabled={isPending} style={{ marginTop: 8 }}>
          <LinearGradient colors={GRADIENT} style={styles.payBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.payBtnText}>{t('teacherBoost.payBtn', { price: selected.price })}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.note}>
          {t('teacherBoost.note')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 20, gap: 14, paddingBottom: 40 },

  hero: {
    borderRadius: 24, padding: 24, alignItems: 'center', gap: 10, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32, elevation: 6,
  },
  heroAura: {
    position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroIcon: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20, maxWidth: 300 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 8 },

  pkgCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    borderWidth: 2, borderColor: Colors.borderLight,
  },
  pkgCardActive: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 3,
  },
  radio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  pkgTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pkgTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  bestBadge: { backgroundColor: Colors.primaryLight, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  bestBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 0.5 },
  pkgSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  priceWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  priceNum: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  priceCur: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },

  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 18,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  payBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  note: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16, marginTop: 4 },
});
