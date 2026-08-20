import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { useBadges } from '../../hooks/useBadges';
import AllOpenRequestsScreen from './AllOpenRequestsScreen';
import BookingHistoryScreen from '../booking/BookingHistoryScreen';

/**
 * §20 — SORĞULAR MƏRKƏZİ.
 *
 * Əvvəl müəllim üçün eyni mövzu 2 ayrı yerdə idi: "Açıq sorğular" (Home
 * qısayolu) və "Dərs müraciətləri" (Booking tabı). İndi hər ikisi bir tabın
 * içində nested tab kimidir — HEÇ BİR FUNKSİYA SİLİNMƏYİB, sadəcə eyni yerə
 * yığılıb. Mövcud ekranlar olduğu kimi işlədilir (`embedded` rejimi ilə),
 * ona görə filtr/axtarış/müraciət məntiqi təkrarlanmır.
 */

type Tab = 'open' | 'applications';

export default function TeacherRequestsScreen({ navigation, route }: { navigation: any; route?: any }) {
  const { t } = useTranslation();
  const badges = useBadges();
  // Dashboard-dan gələn keçid hansı alt-tabın açılacağını göstərir.
  const initialTab: Tab = route?.params?.tab === 'applications' ? 'applications' : 'open';
  const [tab, setTab] = useState<Tab>(initialTab);

  // Tab bar-dan təkrar keçid params-ı dəyişir — ekran onsuz da mount qalır.
  useEffect(() => {
    const p = route?.params?.tab;
    if (p === 'open' || p === 'applications') setTab(p);
  }, [route?.params?.tab]);

  const TABS: { key: Tab; labelKey: string; icon: keyof typeof Ionicons.glyphMap; badge?: number }[] = [
    { key: 'open', labelKey: 'teacherRequests.tabOpen', icon: 'clipboard-outline' },
    { key: 'applications', labelKey: 'teacherRequests.tabApplications', icon: 'person-add-outline', badge: badges.requests },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        {/* Bu ekran gizli tabın köküdür (ana səhifə qısayolundan açılır),
            ona görə geri düyməsi ana səhifəyə qaytarır. */}
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.getParent()?.navigate(Routes.Home))}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('teacherRequests.headerTitle')}</Text>
      </View>

      {/* Nested tab — segment idarəsi */}
      <View style={s.segment}>
        {TABS.map((tb) => {
          const active = tab === tb.key;
          return (
            <TouchableOpacity
              key={tb.key}
              style={[s.segmentBtn, active && s.segmentBtnActive]}
              activeOpacity={0.85}
              onPress={() => setTab(tb.key)}
            >
              <Ionicons name={tb.icon} size={15} color={active ? '#fff' : Colors.textSecondary} />
              <Text style={[s.segmentText, active && s.segmentTextActive]}>{t(tb.labelKey)}</Text>
              {!!tb.badge && tb.badge > 0 && (
                <View style={[s.segBadge, active && s.segBadgeActive]}>
                  <Text style={[s.segBadgeText, active && s.segBadgeTextActive]}>{tb.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'open' ? (
          <AllOpenRequestsScreen navigation={navigation} embedded />
        ) : (
          <BookingHistoryScreen embedded />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },

  segment: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 14,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  segmentBtnActive: { backgroundColor: Colors.primary },
  segmentText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  segmentTextActive: { color: '#fff' },
  segBadge: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  segBadgeActive: { backgroundColor: 'rgba(255,255,255,0.28)' },
  segBadgeText: { fontSize: 10.5, fontWeight: '800', color: '#fff' },
  segBadgeTextActive: { color: '#fff' },
});
