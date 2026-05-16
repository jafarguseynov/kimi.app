import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type SubjectType = 'math' | 'physics' | 'english' | 'chemistry';

type Teacher = {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  subject: string;
  subjectType: SubjectType;
  bio: string;
  gradientColors: [string, string];
  highlight?: boolean;
};

const TEACHERS: Teacher[] = [
  {
    id: '1', name: 'Aygün Məmmədova', rating: 4.9, reviewCount: 42,
    subject: 'Riyaziyyat', subjectType: 'math',
    bio: '10 illik təcrübəyə malik riyaziyyat müəllimiyəm. Abituriyent hazırlığı və olimpiada məsələləri üzrə ixtisaslaşmışam.',
    gradientColors: [Colors.gradientStart, Colors.gradientEnd],
  },
  {
    id: '2', name: 'Rəşad Əliyev', rating: 5.0, reviewCount: 18,
    subject: 'Fizika', subjectType: 'physics',
    bio: 'Mürəkkəb fizika qanunlarını sadə dildə izah edirəm. Hazırlıqlarım tamamilə interaktiv keçir.',
    gradientColors: ['#7C3AED', '#A78BFA'],
    highlight: true,
  },
  {
    id: '3', name: 'Nigar Qasımova', rating: 4.8, reviewCount: 29,
    subject: 'İngilis dili', subjectType: 'english',
    bio: 'IELTS və Danışıq (Speaking) dərsləri üzrə mütəxəssis. Sizinlə qısa müddətdə nəticə əldə edəcəyik.',
    gradientColors: [Colors.tertiary, '#58e7ab'],
  },
  {
    id: '4', name: 'Elvin Muradov', rating: 4.7, reviewCount: 12,
    subject: 'Kimya', subjectType: 'chemistry',
    bio: 'Laboratoriya təcrübələri və nəzəriyyənin vəhdəti. Kimyanı sevdirmək mənim işimdir.',
    gradientColors: [Colors.gradientStart, Colors.gradientEnd],
  },
];

const SUBJECT_BADGE: Record<SubjectType, { bg: string; color: string }> = {
  math: { bg: Colors.tertiaryContainer + '40', color: Colors.tertiary },
  physics: { bg: Colors.primaryLight, color: Colors.primaryDim },
  english: { bg: Colors.secondaryContainer, color: Colors.secondary },
  chemistry: { bg: Colors.tertiaryContainer + '40', color: Colors.tertiary },
};

export default function InterestedTeachersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<{
    params: { requestId?: string; requestTitle?: string }
  }, 'params'>>();
  const { requestTitle = 'Müəllim Sorğunuz' } = route.params ?? {};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Maraqlanan Müəllimlər</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={16} color={Colors.primary} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Kimi mascot section */}
        <View style={styles.mascotSection}>
          <View style={styles.mascotIconWrap}>
            <LinearGradient
              colors={GRADIENT}
              style={styles.mascotGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="hardware-chip" size={26} color="#fff" />
            </LinearGradient>
            <View style={styles.mascotDot} />
          </View>
          <View style={styles.mascotBubble}>
            <Text style={styles.mascotText}>Bu müəllimlər sənə kömək edə bilər!</Text>
          </View>
        </View>

        {/* Teacher Cards */}
        <View style={styles.cardsGrid}>
          {TEACHERS.map(teacher => {
            const initial = teacher.name[0]?.toUpperCase() ?? '?';
            const badge = SUBJECT_BADGE[teacher.subjectType];
            return (
              <View
                key={teacher.id}
                style={[styles.teacherCard, teacher.highlight && styles.teacherCardHighlight]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.cardTopLeft}>
                    <LinearGradient
                      colors={teacher.gradientColors}
                      style={styles.teacherAvatar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.avatarInitial}>{initial}</Text>
                    </LinearGradient>
                    <View>
                      <Text style={styles.teacherName}>{teacher.name}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={13} color={Colors.primary} />
                        <Text style={styles.ratingText}>
                          {teacher.rating.toFixed(1)} ({teacher.reviewCount} rəy)
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.subjectBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.subjectBadgeText, { color: badge.color }]}>
                      {teacher.subject.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.teacherBio} numberOfLines={2}>{teacher.bio}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={0.85}
                    onPress={() => Alert.alert('Müəllim seçildi', `${teacher.name} ilə dərs təyin edildi`)}
                  >
                    <LinearGradient
                      colors={GRADIENT}
                      style={styles.selectBtn}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.selectBtnText}>Seç</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.msgBtn, { flex: 1 }]}
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Mesaj', 'Chat funksiyası tezliklə əlavə olunacaq')}
                  >
                    <Text style={styles.msgBtnText}>Mesaj yaz</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Empty placeholder */}
          <View style={styles.emptyCard}>
            <View style={styles.emptyIllustration}>
              <View style={styles.emptyAura} />
              <View style={styles.emptyMascot}>
                <View style={styles.emptyMailFloat}>
                  <Ionicons name="mail-outline" size={22} color={Colors.primary + '66'} />
                </View>
                <View style={styles.emptySearchFloat}>
                  <Ionicons name="search" size={28} color={Colors.primary + '4D'} />
                </View>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.emptyIconCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person-add-outline" size={36} color="#fff" />
                </LinearGradient>
              </View>
            </View>
            <View style={styles.emptyChip}>
              <Text style={styles.emptyChipText}>Sorğu yoxdur</Text>
            </View>
            <Text style={styles.emptyTitle}>Hələ sorğu yoxdur</Text>
            <Text style={styles.emptySub}>
              Görünür, hələ heç bir dərs sorğusu göndərməmisiniz.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.emptyCtaWrap}
              onPress={() => navigation.navigate(Routes.TeacherList)}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={styles.emptyCta}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="search-outline" size={20} color="#fff" />
                <Text style={styles.emptyCtaText}>Müəllim tap</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.emptyHowBtn} activeOpacity={0.7}>
              <Text style={styles.emptyHowText}>Necə işləyir?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },
  avatarCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  mascotSection: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 14,
    backgroundColor: Colors.primary + '12',
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  mascotIconWrap: { position: 'relative', flexShrink: 0 },
  mascotGrad: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  mascotDot: {
    position: 'absolute', top: -4, right: -2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.tertiaryContainer,
    borderWidth: 2, borderColor: Colors.background,
  },
  mascotBubble: {
    flex: 1, backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, borderBottomLeftRadius: 4,
    padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: Colors.primary + '08',
  },
  mascotText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, lineHeight: 20 },

  cardsGrid: { gap: 14 },

  teacherCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },
  teacherCardHighlight: {
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },

  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  teacherAvatar: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitial: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' },
  teacherName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  subjectBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, flexShrink: 0 },
  subjectBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },

  teacherBio: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  actionRow: { flexDirection: 'row', gap: 10 },
  selectBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  selectBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  msgBtn: {
    backgroundColor: Colors.surfaceContainer, borderRadius: 999,
    paddingVertical: 14, alignItems: 'center',
  },
  msgBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  emptyCard: {
    borderRadius: 24, padding: 32, alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04, shadowRadius: 32, elevation: 2,
  },
  emptyIllustration: {
    width: 200, height: 200, alignItems: 'center', justifyContent: 'center',
  },
  emptyAura: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.primary + '08', borderRadius: 100,
  },
  emptyMascot: {
    width: 160, height: 160, alignItems: 'center', justifyContent: 'center',
  },
  emptyMailFloat: {
    position: 'absolute', top: 8, right: 8,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  emptySearchFloat: {
    position: 'absolute', bottom: 12, left: 4,
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    transform: [{ rotate: '12deg' }],
  },
  emptyIconCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5,
  },
  emptyChip: {
    backgroundColor: Colors.secondaryContainer, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  emptyChipText: { fontSize: 10, fontWeight: '800', color: Colors.secondary, textTransform: 'uppercase', letterSpacing: 1.5 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  emptySub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  emptyCtaWrap: { width: '100%', borderRadius: 999, overflow: 'hidden', marginTop: 4 },
  emptyCta: {
    height: 56, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  emptyCtaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  emptyHowBtn: { paddingHorizontal: 24, paddingVertical: 8 },
  emptyHowText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
