import React, { useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createBooking, getTeacherSlots, TeacherSlot } from '../../api/booking.api';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const DATE_LOCALE: Record<string, string> = { az: 'az-AZ', ru: 'ru-RU', en: 'en-US' };

const DAY_NAMES = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'];
const SUBJECTS = ['Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'İngilis dili', 'Tarix'];

function computeSlotDate(slot: TeacherSlot): Date {
  const now = new Date();
  const targetDay = slot.dayOfWeek;
  const currentDay = (now.getDay() + 6) % 7;
  const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
  const d = new Date(now);
  d.setDate(now.getDate() + daysUntil);
  const [h, m] = slot.startTime.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

function defaultFallbackDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(18, 0, 0, 0);
  return d;
}

export default function BookingConfirmScreen() {
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const route = useRoute<any>();
  const { teacher, slot: paramSlot } = route.params ?? {};
  const queryClient = useQueryClient();

  const [subject, setSubject] = useState('');
  const [note, setNote] = useState('');
  const [pickedSlotId, setPickedSlotId] = useState<string | undefined>(paramSlot?.id);

  const { data: slotsData, isLoading: slotsLoading } = useQuery<TeacherSlot[]>({
    queryKey: ['teacherSlots', teacher?.id],
    queryFn: () => getTeacherSlots(teacher.id).catch(() => [] as TeacherSlot[]),
    enabled: !!teacher?.id && !paramSlot,
  });

  const availableSlots = useMemo(() => {
    const arr = Array.isArray(slotsData) ? slotsData : [];
    return arr.filter((s) => s.isAvailable !== false);
  }, [slotsData]);

  const activeSlot: TeacherSlot | undefined = paramSlot
    ?? availableSlots.find((s) => s.id === pickedSlotId)
    ?? availableSlots[0];

  const scheduledDate = activeSlot ? computeSlotDate(activeSlot) : defaultFallbackDate();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createBooking({
        teacherId: teacher.id,
        scheduledAt: scheduledDate.toISOString(),
        subject: subject || undefined,
        note: note || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['studentBookings'] });
      Alert.alert(t('booking.successTitle'), t('booking.orderSent'), [
        { text: 'OK', onPress: () => navigation.navigate(Routes.BookingHistory) },
      ]);
    },
    onError: (err: any) => {
      const reason = err?.response?.data?.message;
      Alert.alert(t('booking.errorTitle'), reason ?? t('booking.orderFailed'));
    },
  });

  if (!teacher) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('booking.confirmOrderHeader')}</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ padding: 24, gap: 16 }}>
          <Text style={styles.emptyText}>{t('booking.noTeacherSelected')}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>{t('booking.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sifarişi Təsdiqlə</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryCard}>
        <Row label={t('booking.teacher')} value={teacher.name} />
        {activeSlot ? (
          <>
            <Row label={t('booking.day')} value={DAY_NAMES[activeSlot.dayOfWeek]} />
            <Row label={t('booking.hour')} value={`${activeSlot.startTime} – ${activeSlot.endTime}`} />
          </>
        ) : (
          <Row label={t('booking.timeWord')} value={t('booking.teacherWillContact')} />
        )}
        <Row
          label={t('booking.dateLabel')}
          value={scheduledDate.toLocaleDateString(DATE_LOCALE[language] ?? 'az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
        />
        {teacher.hourlyRate != null && (
          <Row label={t('booking.price')} value={`${teacher.hourlyRate} AZN`} />
        )}
      </View>

      {!paramSlot && availableSlots.length > 0 && (
        <>
          <Text style={styles.label}>{t('booking.pickTime')}</Text>
          <View style={styles.chipRow}>
            {availableSlots.slice(0, 8).map((s) => {
              const active = (activeSlot?.id ?? '') === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setPickedSlotId(s.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {DAY_NAMES[s.dayOfWeek].slice(0, 3)} · {s.startTime}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {!paramSlot && !slotsLoading && availableSlots.length === 0 && (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            {t('booking.noScheduleNotice')}
          </Text>
        </View>
      )}

      <Text style={styles.label}>{t('booking.subject')}</Text>
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

      <Text style={styles.label}>{t('booking.noteOptional')}</Text>
      <TextInput
        style={styles.textarea}
        placeholder={t('booking.notePlaceholder')}
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
          <Text style={styles.btnText}>{t('booking.sendOrder')}</Text>
        )}
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
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
  noticeBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryFixed + '33',
  },
  noticeText: { fontSize: 13, color: Colors.primary, lineHeight: 19, fontWeight: '500' },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
