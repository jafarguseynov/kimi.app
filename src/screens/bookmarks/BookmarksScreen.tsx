import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import {
  getBookmarks,
  removeBookmark,
  type Bookmark,
  type BookmarkTargetType,
} from '../../api/bookmark.api';

const TABS: { key: BookmarkTargetType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'exam', label: 'İmtahanlar', icon: 'document-text-outline' },
  { key: 'question', label: 'Suallar', icon: 'help-circle-outline' },
  { key: 'flashcard', label: 'Flashcard', icon: 'layers-outline' },
];

export default function BookmarksScreen() {
  const [activeTab, setActiveTab] = useState<BookmarkTargetType>('exam');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookmarks = useCallback(async (type: BookmarkTargetType) => {
    try {
      const data = await getBookmarks(type);
      setBookmarks(data);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBookmarks(activeTab);
  }, [activeTab, fetchBookmarks]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookmarks(activeTab);
  };

  const handleRemove = async (bookmark: Bookmark) => {
    Alert.alert(
      'Silinsin?',
      `"${bookmark.title ?? 'Bu yer işarəsi'}" silinsin?`,
      [
        { text: 'Ləğv et', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBookmark(bookmark.id);
              setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id));
            } catch {
              Alert.alert('Xəta', 'Silinə bilmədi. Yenidən cəhd edin.');
            }
          },
        },
      ],
    );
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Ionicons name="bookmark" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Yer işarələrim</Text>
        </View>
        <Text style={styles.headerCount}>{bookmarks.length} əşya</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={activeTab === tab.key ? '#fff' : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
        >
          {bookmarks.length === 0 ? (
            <View style={styles.emptyWrap}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={styles.emptyIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="bookmark-outline" size={36} color="#fff" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>Yer işarəsi yoxdur</Text>
              <Text style={styles.emptySub}>
                {activeTab === 'exam' ? 'İmtahanları' : activeTab === 'question' ? 'Sualları' : 'Flashcardları'} yer işarəsi olaraq əlavə et
              </Text>
            </View>
          ) : (
            bookmarks.map((bm) => (
              <View key={bm.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    style={styles.cardIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name={TABS.find((t) => t.key === bm.targetType)?.icon ?? 'document-outline'}
                      size={22}
                      color="#fff"
                    />
                  </LinearGradient>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {bm.title ?? 'Başlıq yoxdur'}
                  </Text>
                  <View style={styles.cardMeta}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {bm.targetType === 'exam' ? 'İmtahan' : bm.targetType === 'question' ? 'Sual' : 'Flashcard'}
                      </Text>
                    </View>
                    <Text style={styles.cardDate}>{formatDate(bm.createdAt)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleRemove(bm)}
                  hitSlop={8}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },
  headerCount: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  tabBar: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, borderRadius: 12,
    backgroundColor: Colors.surfaceLow,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 20, gap: 12 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 16 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 240, lineHeight: 20 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
  },
  cardLeft: {},
  cardIcon: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardDate: { fontSize: 11, color: Colors.textMuted },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fef2f2',
  },
});
