import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/client';
import { getTeacherBookings, confirmBooking, cancelBooking, Booking } from '../../api/booking.api';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

interface Analytics {
  totalBookings: number;
  confirmedBookings: number;
  uniqueStudents: number;
  monthlyRevenue: number;
  rating: number;
  hourlyRate: number;
}

function StatBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function TeacherDashboardScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const { data: analytics, isLoading: aLoading } = useQuery<Analytics>({
    queryKey: ['teacherAnalytics'],
    queryFn: () => api.get('/user/teacher/analytics').then((r) => r.data),
  });

  const { data: bookings = [], isLoading: bLoading } = useQuery<Booking[]>({
    queryKey: ['teacherBookings'],
    queryFn: getTeacherBookings,
  });

  const { mutate: doConfirm } = useMutation({
    mutationFn: confirmBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacherBookings'] }),
  });

  const pending = bookings.filter((b) => b.status === 'pending');
  const upcoming = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.scheduledAt) >= new Date(),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Müəllim Paneli</Text>

      {aLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.statsGrid}>
          <StatBox label="Ümumi Sifariş" value={analytics?.totalBookings ?? 0} />
          <StatBox label="Tələbə" value={analytics?.uniqueStudents ?? 0} />
          <StatBox label="Aylıq Gəlir" value={`${analytics?.monthlyRevenue ?? 0} AZN`} color={Colors.success} />
          <StatBox label="Reytinq" value={`⭐ ${Number(analytics?.rating ?? 0).toFixed(1)}`} />
        </View>
      )}

      {pending.length > 0 && (
        <>
          <Text style={styles.section}>Gözləyən Sifarişlər ({pending.length})</Text>
          {pending.map((b) => (
            <View key={b.id} style={styles.bookingCard}>
              <Text style={styles.studentName}>{b.student?.name ?? 'Tələbə'}</Text>
              <Text style={styles.bookingDate}>
                {new Date(b.scheduledAt).toLocaleDateString('az-AZ', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {b.subject && <Text style={styles.subject}>{b.subject}</Text>}
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => doConfirm(b.id)}
              >
                <Text style={styles.confirmText}>Təsdiqlə</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      <Text style={styles.section}>Yaxınlaşan Dərslər</Text>
      {bLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : upcoming.length === 0 ? (
        <Text style={styles.empty}>Yaxınlaşan dərs yoxdur</Text>
      ) : (
        upcoming.slice(0, 5).map((b) => (
          <View key={b.id} style={[styles.bookingCard, styles.confirmedCard]}>
            <Text style={styles.studentName}>{b.student?.name ?? 'Tələbə'}</Text>
            <Text style={styles.bookingDate}>
              {new Date(b.scheduledAt).toLocaleDateString('az-AZ', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {b.subject && <Text style={styles.subject}>{b.subject}</Text>}
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.scheduleBtn}
        onPress={() => navigation.navigate(Routes.TeacherList)}
      >
        <Text style={styles.scheduleBtnText}>📅 Cədvəlimi İdarə Et</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: 16, marginBottom: 20 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 24,
  },
  statBox: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  section: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: 16, marginBottom: 12 },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmedCard: { borderLeftWidth: 3, borderLeftColor: Colors.success },
  studentName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  bookingDate: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  subject: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  confirmBtn: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scheduleBtn: {
    margin: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  scheduleBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  empty: { textAlign: 'center', color: Colors.textMuted, padding: 20 },
});
