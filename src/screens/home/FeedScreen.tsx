import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useFeed } from '../../hooks/useFeed';
import { FeedItem } from '../../api/feed.api';
import { formatDate } from '../../utils/formatters';

const FEED_ICONS: Record<string, string> = {
  exam_result: '📝',
  tip: '💡',
  announcement: '📢',
};

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.icon}>{FEED_ICONS[item.type] ?? '📌'}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.cardBody}>{item.body}</Text>
    </View>
  );
}

export default function FeedScreen() {
  const { data, isLoading, refetch, isRefetching } = useFeed();
  const items = data?.items ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lent</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeedCard item={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Hələ heç nə yoxdur</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  list: { padding: 20, paddingTop: 8 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  icon: { fontSize: 24, marginRight: 12, marginTop: 2 },
  cardMeta: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cardBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
});
