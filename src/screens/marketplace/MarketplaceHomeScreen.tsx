import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { getQuestions, MarketQuestion } from '../../api/marketplace.api';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type TabKey = 'active' | 'mine';

type IconName = keyof typeof Ionicons.glyphMap;
const SUBJECT_ICON: Record<string, IconName> = {
  Riyaziyyat: 'calculator-outline',
  Kimya: 'flask-outline',
  Fizika: 'planet-outline',
  Biologiya: 'leaf-outline',
  Tarix: 'book-outline',
  Coğrafiya: 'globe-outline',
  Ədəbiyyat: 'library-outline',
  İngilis: 'language-outline',
  Azərbaycan: 'create-outline',
  İnformatika: 'desktop-outline',
};

const subjectIcon = (subject: string): IconName => {
  for (const key of Object.keys(SUBJECT_ICON)) {
    if (subject?.toLowerCase().includes(key.toLowerCase())) return SUBJECT_ICON[key];
  }
  return 'help-circle-outline';
};

// Fənnə görə rəng teması — siyahını rəngli/enerjili edir (thumb gradient, çip, qiymət, düymə).
type SubjectTheme = { grad: [string, string]; accent: string; tint: string };
const SUBJECT_THEME: Record<string, SubjectTheme> = {
  Riyaziyyat: { grad: ['#EA580C', '#FB923C'], accent: '#EA580C', tint: '#FFF1E8' },
  Kimya: { grad: ['#7C3AED', '#A855F7'], accent: '#7C3AED', tint: '#F3ECFF' },
  Fizika: { grad: ['#0077b6', '#4cc9f0'], accent: '#0077b6', tint: '#EAF4FF' },
  Biologiya: { grad: ['#0a8f5f', '#34d399'], accent: '#0a8f5f', tint: '#E7F8F0' },
  Tarix: { grad: ['#B45309', '#F59E0B'], accent: '#B45309', tint: '#FEF3C7' },
  Coğrafiya: { grad: ['#0891B2', '#22D3EE'], accent: '#0891B2', tint: '#E0F7FB' },
  Ədəbiyyat: { grad: ['#BE185D', '#F472B6'], accent: '#BE185D', tint: '#FCE7F3' },
  İngilis: { grad: ['#4F46E5', '#818CF8'], accent: '#4F46E5', tint: '#EEF2FF' },
  Azərbaycan: { grad: ['#0D9488', '#2DD4BF'], accent: '#0D9488', tint: '#E0F7F4' },
  İnformatika: { grad: ['#475569', '#94A3B8'], accent: '#475569', tint: '#EEF2F6' },
};
const DEFAULT_THEME: SubjectTheme = { grad: ['#0077b6', '#47b4fa'], accent: '#0077b6', tint: '#EAF4FF' };
const subjectTheme = (subject: string): SubjectTheme => {
  for (const key of Object.keys(SUBJECT_THEME)) {
    if (subject?.toLowerCase().includes(key.toLowerCase())) return SUBJECT_THEME[key];
  }
  return DEFAULT_THEME;
};

const timeAgo = (iso: string, t: TFn): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('marketplace.timeNow');
  if (m < 60) return t('marketplace.minAgo', { m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('marketplace.hourAgo', { h });
  const d = Math.floor(h / 24);
  return t('marketplace.dayAgo', { d });
};

const isUrgent = (q: MarketQuestion): boolean => {
  const ageMin = (Date.now() - new Date(q.createdAt).getTime()) / 60000;
  return q.price >= 1 || (!q.isResolved && ageMin < 60);
};

export default function MarketplaceHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const { user } = useUserStore();
  const [tab, setTab] = useState<TabKey>('active');
  const [refreshing, setRefreshing] = useState(false);

  const { data: questions = [], isLoading, refetch } = useQuery({
    queryKey: ['marketplace-questions'],
    queryFn: () => getQuestions(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const visible = (() => {
    if (tab === 'mine') return questions.filter((q) => q.author?.id === user?.id);
    return questions.filter((q) => !q.isResolved);
  })();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : (navigation.getParent() as any)?.navigate(Routes.Home))}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>{t('marketplace.title')}</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => (navigation.getParent() as any)?.navigate('Home', { screen: Routes.Notifications })}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'active' && styles.tabActive]}
            activeOpacity={0.8}
            onPress={() => setTab('active')}
          >
            <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>{t('marketplace.tabActive')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'mine' && styles.tabActive]}
            activeOpacity={0.8}
            onPress={() => setTab('mine')}
          >
            <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>{t('marketplace.tabMine')}</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : visible.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="help-circle-outline" size={48} color={Colors.primaryFixed} />
            <Text style={styles.emptyText}>
              {tab === 'mine' ? t('marketplace.emptyMine') : t('marketplace.emptyActive')}
            </Text>
          </View>
        ) : (
          visible.map((q) => {
            const urgent = isUrgent(q);
            const theme = subjectTheme(q.subject);
            const iconName = subjectIcon(q.subject).replace('-outline', '') as IconName;
            return (
              <TouchableOpacity
                key={q.id}
                activeOpacity={0.9}
                style={[styles.card, { shadowColor: theme.accent }]}
                onPress={() => navigation.navigate(Routes.QuestionDetail, { questionId: q.id })}
              >
                <LinearGradient
                  colors={theme.grad}
                  style={styles.thumb}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={iconName} size={38} color="#fff" />
                </LinearGradient>

                <View style={styles.cardBody}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.subjectChip, { backgroundColor: theme.tint }]}>
                      <Text style={[styles.subjectChipText, { color: theme.accent }]} numberOfLines={1}>{q.subject}</Text>
                    </View>
                    {urgent && (
                      <View style={styles.urgentChip}>
                        <Ionicons name="flame" size={10} color="#fff" />
                        <Text style={styles.urgentChipText}>{t('marketplace.urgent')}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={12} color={Colors.outline} />
                    <Text style={styles.metaText}>{timeAgo(q.createdAt, t)}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <View style={[styles.statusDot, { backgroundColor: q.isResolved ? Colors.outline : '#0a8f5f' }]} />
                    <Text style={styles.metaText}>{q.isResolved ? t('marketplace.resolved') : t('marketplace.open')}</Text>
                  </View>

                  <View style={styles.bottomRow}>
                    <View style={[styles.priceChip, { backgroundColor: theme.tint }]}>
                      <Ionicons name="cash" size={13} color={theme.accent} />
                      <Text style={[styles.price, { color: theme.accent }]}>{q.price.toFixed(2)} AZN</Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate(Routes.QuestionDetail, { questionId: q.id })}
                    >
                      <LinearGradient
                        colors={theme.grad}
                        style={[styles.answerBtn, { shadowColor: theme.accent }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.answerBtnText}>{t('marketplace.answerVerb')}</Text>
                        <Ionicons name="arrow-forward" size={13} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate(Routes.AskQuestion)}
      >
        <LinearGradient
          colors={GRADIENT}
          style={styles.fabGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.fabText}>{t('marketplace.shareQuestion')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 60,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBackBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2, borderColor: Colors.primaryFixed + '33',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3,
  },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 16 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLow,
    padding: 6, borderRadius: 16, gap: 4,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  tabText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  center: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },

  card: {
    flexDirection: 'row', gap: 14,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 22, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.13, shadowRadius: 20, elevation: 3,
  },
  thumb: {
    width: 84, height: 84, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1, justifyContent: 'space-between' },

  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  subjectChip: {
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    maxWidth: '70%',
  },
  subjectChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  urgentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#EF4444',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
  },
  urgentChipText: {
    fontSize: 9, fontWeight: '900', color: '#fff',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  metaText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  metaDot: { fontSize: 11, color: Colors.outline, marginHorizontal: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  price: { fontSize: 15, fontWeight: '900', letterSpacing: -0.3 },
  answerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 3,
  },
  answerBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },

  fab: {
    position: 'absolute', right: 20, bottom: 28,
    borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  fabGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 22, paddingVertical: 14,
    borderRadius: 999,
  },
  fabText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
