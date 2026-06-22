import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

type BadgeIcon = 'flame-outline' | 'trophy-outline';

interface ChildData {
  initials: string;
  name: string;
  grade: string;
  school: string;
  online: boolean;
  badge: { icon: BadgeIcon; text: string; bg: string; color: string };
  progress: number;
  progressColor: string;
  progressLabel: string;
  progressLabelColor: string;
}

const CHILDREN: ChildData[] = [
  {
    initials: 'CY',
    name: 'Cəfər Yusifov',
    grade: '7-ci sinif',
    school: '23 nömrəli məktəb',
    online: true,
    badge: { icon: 'flame-outline', text: '5 GÜN', bg: Colors.warningLight, color: Colors.warning },
    progress: 0.85,
    progressColor: Colors.primary,
    progressLabel: '85%',
    progressLabelColor: Colors.primary,
  },
  {
    initials: 'AY',
    name: 'Aysel Yusifova',
    grade: '5-ci sinif',
    school: '23 nömrəli məktəb',
    online: false,
    badge: { icon: 'trophy-outline', text: 'TOP 10', bg: Colors.successLight + '40', color: Colors.tertiary },
    progress: 0.92,
    progressColor: Colors.tertiary,
    progressLabel: '92%',
    progressLabelColor: Colors.tertiary,
  },
];

export default function ParentChildrenScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('parentChildren.headerTitle')}</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate(Routes.ConnectChild)} activeOpacity={0.7}>
          <Ionicons name="add" size={26} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>{t('parentChildren.heroLabel')}</Text>
          <Text style={styles.heroName}>Elnur bəy</Text>
          <Text style={styles.heroSubtitle}>
            {t('parentChildren.heroSubtitle')}
          </Text>
        </View>

        {/* Children list */}
        <View style={styles.childrenList}>
          {CHILDREN.map((child, idx) => (
            <View key={idx} style={styles.childCard}>
              <View style={styles.childCardTop}>
                <View style={styles.childLeft}>
                  <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{child.initials}</Text>
                    </View>
                    {child.online && <View style={styles.onlineDot} />}
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <View style={styles.childMeta}>
                      <Text style={styles.childMetaText}>{child.grade}</Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.childMetaText}>{child.school}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.badgeChip, { backgroundColor: child.badge.bg }]}>
                  <Ionicons name={child.badge.icon} size={14} color={child.badge.color} />
                  <Text style={[styles.badgeText, { color: child.badge.color }]}>{child.badge.text}</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabelText}>{t('parentChildren.monthlyGoal')}</Text>
                  <Text style={[styles.progressPct, { color: child.progressLabelColor }]}>
                    {child.progressLabel}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { flex: child.progress, backgroundColor: child.progressColor },
                    ]}
                  />
                  <View style={{ flex: 1 - child.progress }} />
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(Routes.ChildAcademicReport, { childName: child.name })}
              >
                <Text style={styles.viewBtnText}>{t('parentChildren.viewProgress')}</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add child */}
        <TouchableOpacity
          style={styles.addChildBtn}
          onPress={() => navigation.navigate(Routes.ConnectChild)}
          activeOpacity={0.8}
        >
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={22} color={Colors.textMuted} />
          </View>
          <Text style={styles.addChildText}>{t('parentChildren.addChild')}</Text>
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 20, paddingBottom: 40 },

  heroSection: { gap: 4, marginBottom: 8 },
  heroLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.5 },
  heroName: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, maxWidth: 280 },

  childrenList: { gap: 20 },
  childCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
    gap: 20,
  },
  childCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  childLeft: { flexDirection: 'row', gap: 14, alignItems: 'center', flex: 1 },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    borderWidth: 3, borderColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  onlineDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2, borderColor: Colors.surfaceLowest,
  },
  childInfo: { gap: 4, flex: 1 },
  childName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  childMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  childMetaText: { fontSize: 12, fontWeight: '500', color: Colors.textMuted },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.outlineVariant },
  badgeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexShrink: 0,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },

  progressSection: { gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabelText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressTrack: {
    height: 8, backgroundColor: Colors.surfaceLow, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.borderLight,
    overflow: 'hidden', flexDirection: 'row',
  },
  progressFill: { height: '100%', borderRadius: 999 },

  viewBtn: {
    backgroundColor: Colors.surfaceLow, borderRadius: 14,
    height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  viewBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  addChildBtn: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border,
    borderRadius: 20, paddingVertical: 32,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', gap: 12,
  },
  addIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  addChildText: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
});
