import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import { useUserStore } from '../../store/user.store';
import { getMyChildren, ChildItem } from '../../api/parent.api';

function initialsOf(name?: string | null): string {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?';
}

export default function ParentChildrenScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const parentName = useUserStore((s) => (s.user as any)?.name) ?? '';

  const { data, isLoading, refetch, isRefetching } = useQuery<ChildItem[]>({
    queryKey: ['myChildren'],
    queryFn: () => getMyChildren().catch(() => [] as ChildItem[]),
  });
  const children: ChildItem[] = Array.isArray(data) ? data : [];

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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>{t('parentChildren.heroLabel')}</Text>
          <Text style={styles.heroName}>{parentName || t('parentChildren.headerTitle')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('parentChildren.heroSubtitle')}
          </Text>
        </View>

        {/* Children list */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 8 }} />
        ) : children.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('parentChildren.emptyTitle')}</Text>
            <Text style={styles.emptySub}>{t('parentChildren.emptySub')}</Text>
          </View>
        ) : (
          <View style={styles.childrenList}>
            {children.map((child) => {
              const pct = Math.max(0, Math.min(100, child.avgScore || 0));
              const progress = pct / 100;
              return (
                <View key={child.linkId} style={styles.childCard}>
                  <View style={styles.childCardTop}>
                    <View style={styles.childLeft}>
                      <View style={styles.avatarWrap}>
                        <View style={styles.avatar}>
                          {child.avatarUrl ? (
                            <Image source={{ uri: child.avatarUrl }} style={styles.avatarImg} resizeMode="cover" />
                          ) : (
                            <Text style={styles.avatarText}>{initialsOf(child.name)}</Text>
                          )}
                        </View>
                        {child.online && <View style={styles.onlineDot} />}
                      </View>
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>{child.name}</Text>
                        <View style={styles.childMeta}>
                          {!!child.grade && <Text style={styles.childMetaText}>{child.grade}</Text>}
                          {!!child.grade && !!child.school && <View style={styles.metaDot} />}
                          {!!child.school && <Text style={styles.childMetaText}>{child.school}</Text>}
                          {!child.grade && !child.school && (
                            <Text style={styles.childMetaText}>{child.online ? t('parentChildren.online') : t('parentChildren.offline')}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={[styles.badgeChip, { backgroundColor: Colors.primaryLight }]}>
                      <Ionicons name="document-text-outline" size={14} color={Colors.primary} />
                      <Text style={[styles.badgeText, { color: Colors.primary }]}>{t('parentChildren.examsCount', { n: child.attempts })}</Text>
                    </View>
                  </View>

                  {child.attempts > 0 && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabelText}>{t('parentChildren.avgScore')}</Text>
                        <Text style={[styles.progressPct, { color: Colors.primary }]}>{pct}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { flex: progress, backgroundColor: Colors.primary }]} />
                        <View style={{ flex: 1 - progress }} />
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.viewBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate(Routes.ChildAcademicReport, { childName: child.name, childId: child.id })}
                  >
                    <Text style={styles.viewBtnText}>{t('parentChildren.viewProgress')}</Text>
                    <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

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
  avatarImg: { width: '100%', height: '100%', borderRadius: 13 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, lineHeight: 19 },
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
