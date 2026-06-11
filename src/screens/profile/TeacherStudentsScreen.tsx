import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { getTeacherStudents, TeacherStudent } from '../../api/user.api';

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function scoreColor(avg: number | null): string {
  if (avg == null) return Colors.textMuted;
  if (avg >= 80) return '#059669';
  if (avg >= 60) return '#d97706';
  return '#e11d48';
}

export default function TeacherStudentsScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: students = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['teacherStudents'],
    queryFn: getTeacherStudents,
    retry: 1,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şagirdlərim</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.emptySub}>Yüklənir...</Text>
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Məlumat yüklənmədi</Text>
            <Text style={styles.emptySub}>Serverə qoşula bilmədik. Yenidən cəhd et.</Text>
            <TouchableOpacity style={styles.retryBtn} activeOpacity={0.85} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.retryBtnText}>Yenidən cəhd et</Text>
            </TouchableOpacity>
          </View>
        ) : students.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="people-outline" size={48} color={Colors.primaryFixed} />
            <Text style={styles.emptyText}>Hələ şagird yoxdur</Text>
            <Text style={styles.emptySub}>Sorğuları qəbul etdikcə şagirdlər burada görünəcək.</Text>
          </View>
        ) : (
          students.map((s: TeacherStudent) => (
            <View key={s.id} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(s.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{s.name}</Text>
                  <Text style={styles.subjects}>
                    {s.subjects.length ? s.subjects.join(', ') : 'Fənn qeyd olunmayıb'}
                  </Text>
                </View>
                <View style={styles.scorePill}>
                  <Text style={[styles.scoreValue, { color: scoreColor(s.avgScore) }]}>
                    {s.avgScore != null ? `${s.avgScore}%` : '—'}
                  </Text>
                  <Text style={styles.scoreLabel}>Orta</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="document-text-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{s.examsTaken} imtahan</Text>
                </View>
                {s.weakSubjects.length > 0 && (
                  <View style={styles.metaItem}>
                    <Ionicons name="alert-circle-outline" size={14} color="#e11d48" />
                    <Text style={[styles.metaText, { color: '#e11d48' }]}>
                      {s.weakSubjects.length} zəif fənn
                    </Text>
                  </View>
                )}
              </View>

              {s.weakSubjects.length > 0 && (
                <View style={styles.weakWrap}>
                  {s.weakSubjects.map((w) => (
                    <View key={w.subject} style={styles.weakChip}>
                      <Text style={styles.weakChipText}>{w.subject} · {w.avg}%</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
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

  center: { paddingTop: 60, alignItems: 'center', gap: 10 },
  emptyText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
    backgroundColor: Colors.primary, borderRadius: 999, paddingHorizontal: 22, paddingVertical: 12,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 18, gap: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.05, shadowRadius: 32, elevation: 2,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  subjects: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  scorePill: { alignItems: 'center' },
  scoreValue: { fontSize: 20, fontWeight: '800' },
  scoreLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },

  metaRow: { flexDirection: 'row', gap: 18 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  weakWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  weakChip: {
    backgroundColor: '#fff1f2', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#fecdd3',
  },
  weakChipText: { fontSize: 11, fontWeight: '700', color: '#e11d48' },
});
