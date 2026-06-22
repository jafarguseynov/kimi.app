import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const AVATAR = `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent('Aysel Məmmədova')}&backgroundColor=eef1f3&textColor=006190`;

type StatItem = { icon: keyof typeof Ionicons.glyphMap; labelKey: string; value: string; suffix?: string };
const STATS: StatItem[] = [
  { icon: 'briefcase-outline', labelKey: 'teacherPremium.statExperience', value: '8 il' },
  { icon: 'cash-outline', labelKey: 'teacherPremium.statPrice', value: '30 ₼', suffix: '/saat' },
  { icon: 'laptop-outline', labelKey: 'teacherPremium.statFormat', value: 'Hibrid' },
];

const SUBJECTS = [
  'Abituriyent Riyaziyyat',
  'Məntiq (Magistratura)',
  'Olimpiada hazırlığı',
  'Buraxılış imtahanı',
];

export default function TeacherProfilePremiumScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cover with overlay buttons */}
        <View style={styles.cover}>
          <LinearGradient
            colors={[Colors.primaryLight, Colors.surfaceLow]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.coverBlobA} />
          <View style={styles.coverBlobB} />

          <View style={styles.coverNav}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn} hitSlop={6}>
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} hitSlop={6}>
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: AVATAR }} style={styles.avatar} />
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>Aysel Məmmədova</Text>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.role}>Riyaziyyat və Məntiq</Text>

          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingValue}>4.9</Text>
              <Text style={styles.ratingSub}>{t('teacherPremium.reviews', { count: 124 })}</Text>
            </View>
            <View style={styles.superBadge}>
              <Ionicons name="school" size={14} color={Colors.primary} />
              <Text style={styles.superBadgeText}>{t('teacherPremium.superTeacher')}</Text>
            </View>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.labelKey} style={styles.statCard}>
              <View style={styles.statIconBubble}>
                <Ionicons name={s.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.statLabel}>{t(s.labelKey)}</Text>
              <Text style={styles.statValue}>
                {s.value}
                {s.suffix && <Text style={styles.statSuffix}>{s.suffix}</Text>}
              </Text>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{t('teacherPremium.aboutTitle')}</Text>
          </View>
          <Text style={styles.bioText} numberOfLines={3}>
            Salam! Mən Aysel, 8 illik pedaqoji təcrübəyə malik Riyaziyyat və Məntiq müəllimiyəm. Şagirdlərimə riyaziyyatı sevdirmək və mürəkkəb mövzuları sadə yollarla izah etmək mənim əsas məqsədimdir. Hər bir şagirdin fərdi öyrənmə tərzinə uyğun yanaşma tətbiq edirəm.
          </Text>
          <TouchableOpacity hitSlop={6}>
            <Text style={styles.readMore}>{t('teacherPremium.readMore')}</Text>
          </TouchableOpacity>
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="book-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{t('teacherPremium.subjectsTitle')}</Text>
          </View>
          <View style={styles.chipWrap}>
            {SUBJECTS.map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="library-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{t('teacherPremium.educationTitle')}</Text>
          </View>
          <View style={styles.eduRow}>
            <View style={styles.eduIcon}>
              <Ionicons name="school-outline" size={22} color={Colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eduName}>Bakı Dövlət Universiteti</Text>
              <Text style={styles.eduSpec}>Tətbiqi Riyaziyyat (Bakalavr və Magistr)</Text>
              <Text style={styles.eduYears}>2010 - 2016</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85}>
          <Ionicons name="share-outline" size={18} color={Colors.textPrimary} />
          <Text style={styles.shareBtnText}>{t('teacherPremium.share')}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.editBtnText}>{t('teacherPremium.edit')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 16 },

  cover: { height: 160, position: 'relative', overflow: 'hidden' },
  coverBlobA: {
    position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '1A',
  },
  coverBlobB: {
    position: 'absolute', bottom: -24, right: -24, width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '1A',
  },
  coverNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 16,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#ffffffCC',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },

  profileHeader: {
    paddingHorizontal: 24, marginTop: -64, alignItems: 'center', gap: 0,
  },
  avatarWrap: {
    width: 128, height: 128, borderRadius: 64,
    borderWidth: 4, borderColor: Colors.surfaceLowest,
    backgroundColor: Colors.surfaceHigh,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4 },
  role: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEF3C7',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  ratingValue: { fontSize: 13, fontWeight: '700', color: '#B45309' },
  ratingSub: { fontSize: 11, color: '#B45309AA', marginLeft: 2 },
  superBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.primary + '1A',
  },
  superBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.primaryDim },

  statsGrid: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 24, marginTop: 24,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 14,
    alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  statIconBubble: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  statSuffix: { fontSize: 10, fontWeight: '400', color: Colors.textSecondary },

  section: { paddingHorizontal: 24, marginTop: 28 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
  bioText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  readMore: { fontSize: 13, fontWeight: '600', color: Colors.primary, marginTop: 6 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  chipText: { fontSize: 13, color: Colors.textPrimary },

  eduRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  eduIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  eduName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  eduSpec: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  eduYears: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24,
    backgroundColor: Colors.surfaceLowest,
    borderTopWidth: 1, borderTopColor: Colors.surfaceVariant + '4D',
  },
  shareBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: 20, paddingVertical: 14,
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 20, paddingVertical: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
  },
  editBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
