import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../../constants/colors';
import { RecentExam } from '../../types/dashboard.types';
import { formatDate } from '../../utils/formatters';

interface Props {
  results: RecentExam[];
}

export default function RecentExamsList({ results }: Props) {
  if (results.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Hələ imtahan yoxdur</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(_, i) => String(i)}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Text style={styles.title} numberOfLines={1}>{item.examTitle}</Text>
            <Text style={styles.subject}>{item.subject} · {formatDate(item.completedAt)}</Text>
          </View>
          <View style={[styles.badge, item.percentage >= 70 ? styles.badgeGood : styles.badgeBad]}>
            <Text style={[styles.pct, item.percentage >= 70 ? styles.pctGood : styles.pctBad]}>
              {item.percentage}%
            </Text>
          </View>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
    />
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  itemLeft: { flex: 1, marginRight: 12 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  subject: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeGood: { backgroundColor: '#DCFCE7' },
  badgeBad: { backgroundColor: '#FEE2E2' },
  pct: { fontSize: 13, fontWeight: '700' },
  pctGood: { color: Colors.success },
  pctBad: { color: Colors.danger },
  sep: { height: 1, backgroundColor: Colors.border },
});
