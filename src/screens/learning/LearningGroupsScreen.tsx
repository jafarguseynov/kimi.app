import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

type Props = { navigation: NativeStackNavigationProp<any> };

type FilterTab = 'all' | 'popular' | 'new' | 'mine';

const FILTER_TABS: { id: FilterTab; labelKey: string }[] = [
  { id: 'all', labelKey: 'learning.filterAll' },
  { id: 'popular', labelKey: 'learning.filterPopular' },
  { id: 'new', labelKey: 'learning.filterNew' },
  { id: 'mine', labelKey: 'learning.filterMine' },
];

type Group = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  members: number | null;
  online: number | null;
  badge: string | null;
  description: string | null;
  level: string | null;
  isChallenge?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
};

const GROUPS: Group[] = [
  {
    id: '1', icon: 'calculator-outline', iconBg: '#f0f9ff', iconColor: Colors.primary,
    title: 'Riyaziyyat qrupu', members: 128, online: 6, badge: null, description: null, level: null,
    isPopular: true,
  },
  {
    id: '2', icon: 'trophy-outline', iconBg: '#fffbeb', iconColor: '#f59e0b',
    title: '7-ci sinif challenge', members: null, online: null, badge: 'Aktiv yarış',
    description: 'Bu həftəlik məsələ həlli üzrə ölkə daxili yarışma.', level: null,
    isChallenge: true,
  },
  {
    id: '3', icon: 'earth-outline', iconBg: '#ecfdf5', iconColor: '#059669',
    title: 'İngilis dili söhbət', members: 856, online: 12, badge: null,
    description: null, level: 'B2-C1 Səviyyə',
    isPopular: true,
  },
  {
    id: '4', icon: 'flask-outline', iconBg: '#FCE7F3', iconColor: '#DB2777',
    title: 'Kimya olimpiada hazırlığı', members: 42, online: 3, badge: null,
    description: null, level: 'Müsabiqə',
    isNew: true,
  },
  {
    id: '5', icon: 'time-outline', iconBg: '#FEF3C7', iconColor: '#92400E',
    title: 'Tarix oxu klubu', members: 91, online: 0, badge: null,
    description: null, level: null,
    isNew: true,
  },
  {
    id: '6', icon: 'book-outline', iconBg: '#EEF2FF', iconColor: Colors.primary,
    title: 'Buraxılış imtahanı 2026', members: 1340, online: 47, badge: null,
    description: null, level: 'Final hazırlığı',
    isPopular: true,
  },
];

export default function LearningGroupsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [focused, setFocused] = useState(false);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [participating, setParticipating] = useState<Set<string>>(new Set());

  const openGroup = (g: Group) => {
    navigation.navigate(Routes.LearningGroupDetail, {
      groupId: g.id,
      title: g.title,
      members: g.members ?? undefined,
      online: g.online ?? undefined,
      level: g.level ?? undefined,
      isChallenge: g.isChallenge,
    });
  };

  const toggleJoin = (g: Group) => {
    const wasJoined = joined.has(g.id);
    setJoined((prev) => {
      const next = new Set(prev);
      if (wasJoined) next.delete(g.id);
      else next.add(g.id);
      return next;
    });
    if (!wasJoined) {
      Alert.alert(
        t('learning.joinedTitle'),
        t('learning.joinedMsg', { title: g.title }),
        [
          { text: t('learning.later'), style: 'cancel' },
          { text: t('learning.goToGroup'), onPress: () => openGroup(g) },
        ],
      );
    }
  };

  const toggleParticipate = (g: Group) => {
    const was = participating.has(g.id);
    setParticipating((prev) => {
      const next = new Set(prev);
      if (was) next.delete(g.id);
      else next.add(g.id);
      return next;
    });
    if (!was) {
      Alert.alert(
        t('learning.regDoneTitle'),
        t('learning.regDoneMsg', { title: g.title }),
        [
          { text: t('learning.later'), style: 'cancel' },
          { text: t('learning.goToGroup'), onPress: () => openGroup(g) },
        ],
      );
    }
  };

  const filteredGroups = useMemo(() => {
    let list = GROUPS;
    if (activeFilter === 'popular') list = list.filter((g) => g.isPopular);
    else if (activeFilter === 'new') list = list.filter((g) => g.isNew);
    else if (activeFilter === 'mine') list = list.filter((g) => joined.has(g.id) || participating.has(g.id));
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((g) => g.title.toLowerCase().includes(q) || (g.description?.toLowerCase().includes(q) ?? false));
    }
    return list;
  }, [activeFilter, search, joined, participating]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuBtn}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('learning.groupsTitle')}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarCircle}
          activeOpacity={0.7}
          onPress={() => Alert.alert(t('learning.createGroup'), t('learning.createGroupMsg'))}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <Ionicons name="search-outline" size={20} color={focused ? Colors.primary : Colors.outlineVariant} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t('learning.searchGroup')}
            placeholderTextColor={Colors.textMuted}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {FILTER_TABS.map((tab) =>
            tab.id === activeFilter ? (
              <TouchableOpacity key={tab.id} activeOpacity={0.85} onPress={() => setActiveFilter(tab.id)}>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.filterChipActive}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.filterChipActiveText}>{t(tab.labelKey)}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={tab.id}
                style={styles.filterChip}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(tab.id)}
              >
                <Text style={styles.filterChipText}>{t(tab.labelKey)}</Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {/* Group Cards */}
        {filteredGroups.map((group) => {
          const isJoined = joined.has(group.id);
          const isParticipating = participating.has(group.id);
          const memberDisplay = (group.members ?? 0) + (isJoined ? 1 : 0);
          return (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              activeOpacity={0.92}
              onPress={() => openGroup(group)}
            >
              <View style={[styles.groupIcon, { backgroundColor: group.iconBg }]}>
                <Ionicons name={group.icon} size={28} color={group.iconColor} />
              </View>
              <View style={styles.groupInfo}>
                {group.badge && (
                  <View style={styles.badgeRow}>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>{group.badge}</Text>
                    </View>
                  </View>
                )}
                <Text style={styles.groupTitle}>{group.title}</Text>
                {group.members != null && (
                  <View style={styles.groupMeta}>
                    <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.groupMetaText}>{t('learning.membersN', { n: memberDisplay })}</Text>
                    {group.online != null && group.online > 0 && (
                      <>
                        <View style={styles.metaDot} />
                        <Text style={styles.onlineText}>{t('learning.onlineN', { n: group.online })}</Text>
                      </>
                    )}
                  </View>
                )}
                {group.description != null && (
                  <Text style={styles.groupDescription}>{group.description}</Text>
                )}
                <View style={styles.groupBottom}>
                  {group.level != null && (
                    <Text style={styles.groupLevel}>{group.level}</Text>
                  )}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={group.isChallenge ? { width: '100%' } : undefined}
                    onPress={() => {
                      const already = group.isChallenge ? isParticipating : isJoined;
                      if (already) {
                        openGroup(group);
                      } else if (group.isChallenge) {
                        toggleParticipate(group);
                      } else {
                        toggleJoin(group);
                      }
                    }}
                  >
                    {(group.isChallenge ? isParticipating : isJoined) ? (
                      <View style={[styles.joinedBtn, group.isChallenge && styles.joinBtnFull]}>
                        <Ionicons name="checkmark" size={14} color={Colors.primary} />
                        <Text style={styles.joinedBtnText}>
                          {group.isChallenge ? t('learning.participating') : t('learning.goToGroup')}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                      </View>
                    ) : (
                      <LinearGradient
                        colors={[Colors.gradientStart, Colors.gradientEnd]}
                        style={[styles.joinBtn, group.isChallenge && styles.joinBtnFull]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.joinBtnText}>{group.isChallenge ? t('learning.participate') : t('learning.join')}</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredGroups.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={32} color={Colors.outlineVariant} />
            <Text style={styles.emptyTitle}>{t('learning.noGroupsTitle')}</Text>
            <Text style={styles.emptySub}>
              {activeFilter === 'mine' ? t('learning.noGroupsMineSub') : t('learning.noGroupsSub')}
            </Text>
          </View>
        )}

        {/* Kimi AI Suggestion */}
        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionTitle}>{t('learning.kimiSuggestion')}</Text>
          <Text style={styles.suggestionText}>
            {t('learning.suggestionPre')}{' '}
            <Text style={{ fontWeight: '800' }}>"Fizika laboratoriyası"</Text>
            {' '}{t('learning.suggestionPost')}
          </Text>
          <TouchableOpacity
            style={styles.suggestionBtn}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'Fizika laboratoriyası',
                '67 üzv · 4 onlayn\n\nMexanika, elektrik və optika üzrə həftəlik məsələ həlli sessiyaları. Səviyyəyə uyğun qruplar.',
                [
                  { text: t('learning.close'), style: 'cancel' },
                  {
                    text: t('learning.join'),
                    onPress: () =>
                      setJoined((prev) => {
                        const next = new Set(prev);
                        next.add('fizika-lab');
                        return next;
                      }),
                  },
                ],
              )
            }
          >
            <Text style={styles.suggestionBtnText}>{t('learning.learnMore')}</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 56,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryFixed + '33',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { padding: 20, gap: 16 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 2, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  searchBarFocused: { borderColor: Colors.primaryFixed + '4D' },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },

  filterScroll: { marginHorizontal: -4 },
  filterContent: { gap: 8, paddingHorizontal: 4 },
  filterChipActive: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
  filterChipActiveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  filterChip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceLow,
  },
  filterChipText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },

  groupCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 20,
    flexDirection: 'row', gap: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  groupIcon: {
    width: 56, height: 56, borderRadius: 18, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  groupInfo: { flex: 1, gap: 6 },
  badgeRow: { flexDirection: 'row' },
  activeBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2,
  },
  activeBadgeText: { fontSize: 9, fontWeight: '800', color: '#92400e', letterSpacing: 0.5, textTransform: 'uppercase' },
  groupTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  groupMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  groupMetaText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.outlineVariant },
  onlineText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  groupDescription: { fontSize: 13, color: Colors.outlineVariant, lineHeight: 18 },
  groupBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  groupLevel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  joinBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
  joinBtnFull: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  joinBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  joinedBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.primaryFixed + '1F',
    borderWidth: 1, borderColor: Colors.primaryFixed + '55',
  },
  joinedBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 6 },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },

  suggestionCard: {
    borderRadius: 16, padding: 20, gap: 10,
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.primaryFixed + '66',
    backgroundColor: Colors.primaryFixed + '0D',
  },
  suggestionTitle: { fontSize: 16, fontWeight: '800', color: Colors.primaryDim },
  suggestionText: { fontSize: 14, color: Colors.primary + 'CC', lineHeight: 21 },
  suggestionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  suggestionBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
