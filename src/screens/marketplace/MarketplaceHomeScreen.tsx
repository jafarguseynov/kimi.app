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

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'indi';
  if (m < 60) return `${m} dəqiqə əvvəl`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat əvvəl`;
  const d = Math.floor(h / 24);
  return `${d} gün əvvəl`;
};

const isUrgent = (q: MarketQuestion): boolean => {
  const ageMin = (Date.now() - new Date(q.createdAt).getTime()) / 60000;
  return q.price >= 1 || (!q.isResolved && ageMin < 60);
};

export default function MarketplaceHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
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
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.headerTitle}>Sual Bazarı</Text>
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
            <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Aktiv suallar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'mine' && styles.tabActive]}
            activeOpacity={0.8}
            onPress={() => setTab('mine')}
          >
            <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>Mənim suallarım</Text>
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
              {tab === 'mine' ? 'Hələ sual paylaşmamısınız' : 'Aktiv sual yoxdur'}
            </Text>
          </View>
        ) : (
          visible.map((q) => {
            const urgent = isUrgent(q);
            return (
              <TouchableOpacity
                key={q.id}
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => navigation.navigate(Routes.QuestionDetail, { questionId: q.id })}
              >
                <LinearGradient
                  colors={[Colors.primaryFixed + '33', Colors.primary + '22']}
                  style={styles.thumb}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={subjectIcon(q.subject)} size={36} color={Colors.primary} />
                </LinearGradient>

                <View style={styles.cardBody}>
                  <View style={styles.badgeRow}>
                    <View style={styles.subjectChip}>
                      <Text style={styles.subjectChipText} numberOfLines={1}>{q.subject}</Text>
                    </View>
                    {urgent && (
                      <View style={styles.urgentChip}>
                        <Text style={styles.urgentChipText}>TƏCİLİ</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={12} color={Colors.outline} />
                    <Text style={styles.metaText}>{timeAgo(q.createdAt)}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Ionicons name="chatbubble-outline" size={12} color={Colors.outline} />
                    <Text style={styles.metaText}>{q.isResolved ? 'Həll edildi' : 'Açıq'}</Text>
                  </View>

                  <View style={styles.bottomRow}>
                    <Text style={styles.price}>{q.price.toFixed(2)} AZN</Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate(Routes.QuestionDetail, { questionId: q.id })}
                    >
                      <LinearGradient
                        colors={GRADIENT}
                        style={styles.answerBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.answerBtnText}>Cavabla</Text>
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
          <Text style={styles.fabText}>Sual paylaş</Text>
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
    borderRadius: 18, padding: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 2,
  },
  thumb: {
    width: 88, height: 88, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1, justifyContent: 'space-between' },

  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  subjectChip: {
    backgroundColor: Colors.primary + '1A',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    maxWidth: '70%',
  },
  subjectChipText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  urgentChip: {
    backgroundColor: Colors.error + '1A',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
  },
  urgentChipText: {
    fontSize: 9, fontWeight: '800', color: Colors.error,
    letterSpacing: 0.8,
  },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  metaText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  metaDot: { fontSize: 11, color: Colors.outline, marginHorizontal: 2 },

  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 17, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },
  answerBtn: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3,
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
