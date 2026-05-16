import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createBooking } from '../../api/booking.api';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const DAY_NAMES = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'];
const SUBJECTS = ['Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'İngilis dili', 'Tarix'];

export default function BookingConfirmScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { teacher, slot } = route.params ?? {};
  const queryClient = useQueryClient();

  const [subject, setSubject] = useState('');
  const [note, setNote] = useState('');

  const nextSlotDate = (): Date => {
    const now = new Date();
    const targetDay = slot.dayOfWeek; // 0=Mon
    const currentDay = (now.getDay() + 6) % 7; // convert Sun=0 to Mon=0
    const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
    const d = new Date(now);
    d.setDate(now.getDate() + daysUntil);
    const [h, m] = slot.startTime.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createBooking({
        teacherId: teacher.id,
        scheduledAt: nextSlotDate().toISOString(),
        subject: subject || undefined,
        note: note || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentBookings'] });
      Alert.alert('Uğurlu!', 'Sifarişiniz göndərildi. Müəllim təsdiqləyəcək.', [
        { text: 'OK', onPress: () => navigation.navigate(Routes.BookingHistory) },
      ]);
    },
    onError: () => Alert.alert('Xəta', 'Sifariş göndərilə bilmədi'),
  });

  if (!teacher || !slot) return null;

  const scheduledDate = nextSlotDate();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.title}>Sifarişi Təsdiqlə</Text>

      <View style={styles.summaryCard}>
        <Row label="Müəllim" value={teacher.name} />
        <Row label="Gün" value={DAY_NAMES[slot.dayOfWeek]} />
        <Row label="Saat" value={`${slot.startTime} – ${slot.endTime}`} />
        <Row
          label="Tarix"
          value={scheduledDate.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
        />
        {teacher.hourlyRate != null && (
          <Row label="Qiymət" value={`${teacher.hourlyRate} AZN`} />
        )}
      </View>

      <Text style={styles.label}>Fənn</Text>
      <View style={styles.chipRow}>
        {SUBJECTS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, subject === s && styles.chipActive]}
            onPress={() => setSubject(subject === s ? '' : s)}
          >
            <Text style={[styles.chipText, subject === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Qeyd (ixtiyari)</Text>
      <TextInput
        style={styles.textarea}
        placeholder="Müəllimə mesajınız..."
        placeholderTextColor={Colors.textMuted}
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.btn, isPending && { opacity: 0.6 }]}
        onPress={() => mutate()}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Sifariş Göndər</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  rowLabel: { fontSize: 14, color: Colors.textSecondary },
  rowValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  textarea: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 24,
    minHeight: 80,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
