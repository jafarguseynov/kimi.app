import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useExamList, useStartExam } from '../../hooks/useExams';

type Props = NativeStackScreenProps<ExamStackParamList, typeof Routes.ExamInfo>;
const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const DIFFICULTY: Record<string, string> = { easy: 'Asan', medium: 'Orta', hard: 'Çətin' };

export default function ExamInfoScreen({ route, navigation }: Props) {
  const { examId, title } = route.params;
  const { data: exams = [], isLoading } = useExamList();
  const exam: any = exams.find((e: any) => e.id === examId);
  const { mutate: startExamMutate, isPending: isStarting } = useStartExam();

  const displayTitle = exam?.title ?? title ?? 'İmtahan';
  const questionCount = exam?.questionCount ?? 20;
  const duration = exam?.duration ?? 25;
  const difficulty = DIFFICULTY[exam?.difficulty ?? 'medium'] ?? 'Orta';
  const category = (exam as any)?.category ?? 'Magistratura';
  const description = (exam as any)?.description ??
    'Bu imtahan magistratura hazırlığı üçün nəzərdə tutulub. Suallar cari təhsil standartlarına uyğun olaraq süni intellekt tərəfindən seçilmişdir. İmtahanı başlatdıqdan sonra taymer işə düşəcək.';

  const startExam = () => {
    if (!examId) {
      Alert.alert('Xəta', 'İmtahan ID-si tapılmadı');
      return;
    }
    startExamMutate(examId, {
      onSuccess: () => navigation.navigate(Routes.ExamSession),
      onError: (err: any) => {
        Alert.alert('İmtahan başlana bilmədi', err?.response?.data?.message ?? err?.message ?? 'Naməlum xəta');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayTitle}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading && !exam ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* Hero gradient frame */}
            <LinearGradient
              colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.heroFrame}
            >
              <View style={styles.heroInner}>
                <Ionicons name="calculator" size={72} color={Colors.primary} />
                <View style={styles.heroDecor}>
                  <Ionicons name="git-network" size={36} color={Colors.primaryFixed} />
                </View>
                <View style={styles.heroDecorSm}>
                  <Ionicons name="cube-outline" size={28} color={Colors.tertiary} />
                </View>
              </View>
            </LinearGradient>

            {/* Title + badge */}
            <View>
              <View style={styles.kickerPill}>
                <Text style={styles.kickerText}>YENİ İMTAHAN</Text>
              </View>
              <Text style={styles.bigTitle}>{displayTitle}</Text>
            </View>

            {/* Bento info grid */}
            <View style={styles.grid}>
              <View style={styles.infoCard}>
                <Ionicons name="help-circle-outline" size={22} color={Colors.primary} />
                <Text style={styles.infoLabel}>Sual sayı</Text>
                <Text style={styles.infoValue}>{questionCount} sual</Text>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="time-outline" size={22} color={Colors.primary} />
                <Text style={styles.infoLabel}>Vaxt</Text>
                <Text style={styles.infoValue}>{duration} dəqiqə</Text>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="stats-chart-outline" size={22} color={Colors.primary} />
                <Text style={styles.infoLabel}>Çətinlik</Text>
                <Text style={styles.infoValue}>{difficulty}</Text>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="apps-outline" size={22} color={Colors.primary} />
                <Text style={styles.infoLabel}>Kateqoriya</Text>
                <Text style={styles.infoValue}>{category}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={{ gap: 16 }}>
              <Text style={styles.sectionTitle}>İmtahan haqqında</Text>
              <View style={styles.descCard}>
                <Text style={styles.descText}>{description}</Text>
              </View>
              <View style={styles.infoHint}>
                <Ionicons name="information-circle" size={22} color={Colors.primary} />
                <Text style={styles.infoHintText}>
                  İmtahan bitdikdən dərhal sonra nəticələrinizi görə biləcəksiniz.
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.bookmarkBtn} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.bookmarkText}>Yadda Saxla</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} onPress={startExam} style={styles.startBtnWrap} disabled={isStarting}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
            {isStarting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.startBtnText}>İmtahanı Başlat</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginHorizontal: 12, letterSpacing: -0.2 },

  scroll: { padding: 24, paddingBottom: 120, gap: 32 },

  /* Hero */
  heroFrame: {
    aspectRatio: 4 / 3,
    borderRadius: 16, padding: 3,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 6,
  },
  heroInner: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  heroDecor: { position: 'absolute', right: 32, top: 32, opacity: 0.6 },
  heroDecorSm: { position: 'absolute', left: 32, bottom: 32, opacity: 0.7 },

  /* Title */
  kickerPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '14',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
    marginBottom: 12,
  },
  kickerText: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1.2 },
  bigTitle: { fontSize: 30, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6, lineHeight: 36 },

  /* Grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  infoCard: {
    flexBasis: '47%', flexGrow: 1,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20, gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  infoLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginTop: 4 },
  infoValue: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },

  /* Description */
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  descCard: { backgroundColor: Colors.surfaceLow, padding: 24, borderRadius: 16 },
  descText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  infoHint: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary + '0F',
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
    padding: 16, borderRadius: 12,
  },
  infoHintText: { flex: 1, fontSize: 12, fontWeight: '500', color: Colors.primary, lineHeight: 18 },

  /* Action bar */
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: -20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 12,
    gap: 12,
  },
  bookmarkBtn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  bookmarkText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, marginTop: 4 },
  startBtnWrap: { flex: 1 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 6,
  },
  startBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});
