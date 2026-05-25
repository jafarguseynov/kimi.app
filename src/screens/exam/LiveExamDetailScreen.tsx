import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.LiveExamDetail>;
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

function pad(n: number) { return String(n).padStart(2, '0'); }

function computeStartTs(startAt?: string): number {
  if (startAt) {
    const t = Date.parse(startAt);
    if (!isNaN(t)) return t;
  }
  return Date.now() + 2 * 3600 * 1000 + 45 * 60 * 1000 + 12 * 1000;
}

export default function LiveExamDetailScreen({ route, navigation }: Props) {
  const { examId, title, startAt, participants } = route.params;
  const displayTitle = title ?? 'Ümumi Sınaq İmtahanı';
  const audience = participants ?? 1240;

  const targetTs = useMemo(() => computeStartTs(startAt), [startAt]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, targetTs - now);
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const startDate = new Date(targetTs);
  const startTime = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
  const isToday = (() => {
    const d = new Date();
    return d.toDateString() === startDate.toDateString();
  })();
  const dateLabel = isToday ? 'Bugün' : startDate.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' });

  const register = () => {
    Alert.alert('Qeydiyyatdan keçdiniz!', 'İmtahan başlayanda sizə bildiriş gələcək.', [
      { text: 'Anladım' },
      { text: 'İndi qoşul', onPress: () => navigation.navigate(Routes.LiveExamWaiting, { examId, title: displayTitle }) },
    ]);
  };

  const setReminder = () => {
    Alert.alert('Xatırlatma quruldu', 'Bizdə bunu xatırlayacağıq və imtahandan 15 dəq əvvəl bildirəcəyik.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Canlı İmtahan</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>CANLI</Text>
          </View>
          <Text style={styles.heroTitle}>{displayTitle}</Text>
          <Text style={styles.heroSub}>Blok imtahanına hazırlıq mərhələsi</Text>
        </View>

        {/* Bento grid */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoSmall}>
            <View style={styles.bentoIconBox}>
              <Ionicons name="time-outline" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.bentoLabel}>Başlama vaxtı</Text>
              <Text style={styles.bentoValue}>{startTime}</Text>
            </View>
          </View>
          <View style={styles.bentoSmall}>
            <View style={styles.bentoIconBox}>
              <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.bentoLabel}>Tarix</Text>
              <Text style={styles.bentoValue}>{dateLabel}</Text>
            </View>
          </View>
          <View style={styles.bentoWide}>
            <View style={styles.bentoLeft}>
              <View style={styles.bentoIconLg}>
                <Ionicons name="people" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.bentoLabel}>İştirakçı sayı</Text>
                <Text style={styles.bentoValueLg}>{audience.toLocaleString('az-AZ')}+</Text>
              </View>
            </View>
            <View style={styles.avatarStack}>
              <View style={[styles.stackAvatar, { backgroundColor: '#F472B6', marginLeft: 0 }]}>
                <Text style={styles.stackAvatarText}>A</Text>
              </View>
              <View style={[styles.stackAvatar, { backgroundColor: Colors.primary }]}>
                <Text style={styles.stackAvatarText}>L</Text>
              </View>
              <View style={[styles.stackAvatarCount]}>
                <Text style={styles.stackAvatarCountText}>+1k</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.countdownSection}>
          <Text style={styles.countdownLabel}>Qalan vaxt</Text>
          <View style={styles.countdownRow}>
            {[
              { value: hours, label: 'SAAT' },
              { value: minutes, label: 'DƏQİQƏ' },
              { value: seconds, label: 'SANİYƏ', accent: true },
            ].map((part, i, arr) => (
              <React.Fragment key={part.label}>
                <View style={styles.countCol}>
                  {part.accent ? (
                    <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.countBox, styles.countBoxAccent]}>
                      <Text style={[styles.countText, styles.countTextAccent]}>{pad(part.value)}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.countBox}>
                      <Text style={styles.countText}>{pad(part.value)}</Text>
                    </View>
                  )}
                  <Text style={styles.countLabel}>{part.label}</Text>
                </View>
                {i < arr.length - 1 && <Text style={styles.countSep}>:</Text>}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Description */}
        <View>
          <Text style={styles.sectionTitle}>İmtahan haqqında</Text>
          <View style={styles.descCard}>
            <Text style={styles.descText}>
              Bu imtahan Dövlət İmtahan Mərkəzinin ən son proqramına uyğun hazırlanmışdır. İmtahan müddəti 180 dəqiqədir və hər bir fənn üzrə biliklərinizi real vaxt rejimində sınaqdan keçirmək üçün nəzərdə tutulmuşdur.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 16 }}>
          <TouchableOpacity activeOpacity={0.85} onPress={register}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Qeydiyyatdan keç</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reminderBtn} activeOpacity={0.85} onPress={setReminder}>
            <Ionicons name="notifications" size={22} color={Colors.textPrimary} />
            <Text style={styles.reminderBtnText}>Xatırlatma qur</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3 },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  /* Hero */
  heroCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 32,
    alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  livePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
    marginBottom: 12,
  },
  livePillText: { fontSize: 10, fontWeight: '800', color: Colors.tertiary, letterSpacing: 1.4 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3, marginBottom: 6, lineHeight: 28 },
  heroSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  /* Bento grid */
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  bentoSmall: {
    flexBasis: '47%', flexGrow: 1, aspectRatio: 1,
    backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 24,
    justifyContent: 'space-between',
  },
  bentoIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  bentoLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginBottom: 4 },
  bentoValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },

  bentoWide: {
    flexBasis: '100%',
    backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  bentoLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bentoIconLg: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  bentoValueLg: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },

  avatarStack: { flexDirection: 'row' },
  stackAvatar: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: -12,
  },
  stackAvatarText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  stackAvatarCount: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: '#fff',
    backgroundColor: Colors.primary + '33',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: -12,
  },
  stackAvatarCountText: { fontSize: 10, fontWeight: '800', color: Colors.primary },

  /* Countdown */
  countdownSection: { alignItems: 'center', gap: 16 },
  countdownLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  countCol: { alignItems: 'center', gap: 8 },
  countBox: {
    width: 64, height: 80, borderRadius: 16,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.02, shadowRadius: 20, elevation: 2,
  },
  countBoxAccent: {
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 6,
  },
  countText: { fontSize: 30, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
  countTextAccent: { color: '#fff' },
  countLabel: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 1.2 },
  countSep: { fontSize: 30, fontWeight: '800', color: Colors.textMuted, marginBottom: 28 },

  /* Description */
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16, letterSpacing: -0.2 },
  descCard: {
    backgroundColor: Colors.surfaceLowest, padding: 24, borderRadius: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  descText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 21 },

  /* Buttons */
  primaryBtn: {
    paddingVertical: 18, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  reminderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
  },
  reminderBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 0.2 },
});
