import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../../store/user.store';
import { getTeacherSlots, TeacherSlot } from '../../api/booking.api';
import api from '../../api/client';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

interface SlotDraft {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function TeacherScheduleScreen() {
  const user = useUserStore((s) => s.user);
  const { t } = useTranslation();
  const DAY_NAMES = t('teacherSchedule.days').split('|');
  const queryClient = useQueryClient();

  const { data: currentSlots = [], isLoading } = useQuery<TeacherSlot[]>({
    queryKey: ['teacherSlots', user?.id],
    queryFn: () => getTeacherSlots(user!.id),
    enabled: !!user?.id,
  });

  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [drafts, setDrafts] = useState<SlotDraft[]>([]);

  const dayDrafts = drafts.filter((d) => d.dayOfWeek === selectedDay);
  const dayExisting = currentSlots.filter((s) => s.dayOfWeek === selectedDay);

  const addSlot = () => {
    setDrafts((prev) => [
      ...prev,
      { dayOfWeek: selectedDay, startTime: '09:00', endTime: '10:00' },
    ]);
  };

  const removeSlot = (index: number) => {
    const globalIndex = drafts.findIndex(
      (d, i) => d.dayOfWeek === selectedDay && drafts.filter((x) => x.dayOfWeek === selectedDay).indexOf(d) === index,
    );
    setDrafts((prev) => prev.filter((_, i) => i !== globalIndex));
  };

  const updateSlot = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    let globalI = -1;
    let count = 0;
    for (let i = 0; i < drafts.length; i++) {
      if (drafts[i].dayOfWeek === selectedDay) {
        if (count === dayIndex) { globalI = i; break; }
        count++;
      }
    }
    if (globalI === -1) return;
    setDrafts((prev) => prev.map((d, i) => (i === globalI ? { ...d, [field]: value } : d)));
  };

  const { mutate: saveAll, isPending } = useMutation({
    mutationFn: () =>
      api.post('/booking/schedule', { slots: [...currentSlots.filter((s) => s.dayOfWeek !== selectedDay), ...dayDrafts] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherSlots'] });
      Alert.alert(t('teacherSchedule.savedTitle'), t('teacherSchedule.savedBody'));
      setDrafts((prev) => prev.filter((d) => d.dayOfWeek !== selectedDay));
    },
    onError: () => Alert.alert(t('teacherSchedule.errorTitle'), t('teacherSchedule.errorBody')),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>{t('teacherSchedule.title')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayBar}>
        {DAY_NAMES.map((name, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dayChip, selectedDay === i && styles.dayChipActive]}
            onPress={() => setSelectedDay(i)}
          >
            <Text style={[styles.dayChipText, selectedDay === i && styles.dayChipTextActive]}>
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <>
          {dayExisting.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('teacherSchedule.existingSlots')}</Text>
              {dayExisting.map((s) => (
                <View key={s.id} style={styles.existingSlot}>
                  <Text style={styles.slotTime}>{s.startTime} – {s.endTime}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('teacherSchedule.newSlots', { day: DAY_NAMES[selectedDay] ?? '' })}</Text>
            {dayDrafts.map((draft, i) => (
              <View key={i} style={styles.draftRow}>
                <View style={styles.timeSelect}>
                  <Text style={styles.timeLabel}>{t('teacherSchedule.start')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TIME_OPTIONS.slice(0, -1).map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timeChip, draft.startTime === time && styles.timeChipActive]}
                        onPress={() => updateSlot(i, 'startTime', time)}
                      >
                        <Text style={[styles.timeChipText, draft.startTime === time && styles.timeChipTextActive]}>{time}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={styles.timeSelect}>
                  <Text style={styles.timeLabel}>{t('teacherSchedule.end')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TIME_OPTIONS.slice(1).map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timeChip, draft.endTime === time && styles.timeChipActive]}
                        onPress={() => updateSlot(i, 'endTime', time)}
                      >
                        <Text style={[styles.timeChipText, draft.endTime === time && styles.timeChipTextActive]}>{time}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <TouchableOpacity onPress={() => removeSlot(i)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>{t('teacherSchedule.remove')}</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addSlot}>
              <Text style={styles.addText}>{t('teacherSchedule.addSlot')}</Text>
            </TouchableOpacity>
          </View>

          {dayDrafts.length > 0 && (
            <TouchableOpacity
              style={[styles.saveBtn, isPending && { opacity: 0.6 }]}
              onPress={() => saveAll()}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>{t('teacherSchedule.save')}</Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: 16, marginBottom: 16 },
  dayBar: { paddingLeft: 16, marginBottom: 20, flexGrow: 0 },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  dayChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayChipText: { fontSize: 13, color: Colors.textSecondary },
  dayChipTextActive: { color: '#fff', fontWeight: '600' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },
  existingSlot: {
    backgroundColor: Colors.successLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  slotTime: { fontSize: 15, fontWeight: '600', color: Colors.success },
  draftRow: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeSelect: { marginBottom: 8 },
  timeLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    marginRight: 6,
  },
  timeChipActive: { backgroundColor: Colors.primary },
  timeChipText: { fontSize: 13, color: Colors.textSecondary },
  timeChipTextActive: { color: '#fff', fontWeight: '600' },
  removeBtn: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 6 },
  removeText: { color: Colors.danger, fontWeight: '600', fontSize: 13 },
  addBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  addText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
  saveBtn: {
    marginHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
