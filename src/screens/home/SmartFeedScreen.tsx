import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const { height: SCREEN_H } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_H - 200;

type TabKey = 'foryou' | 'trends';
type CardKind = 'featured' | 'weak' | 'teacher';
type Card = {
  id: string;
  kind: CardKind;
  titleKey: string;
  subject?: string;
  duration?: string;
  questions?: number;
  xp?: number;
  description?: string;
  weakTopic?: string;
  weakScore?: number;
  teacherName?: string;
  teacherRating?: number;
  teacherTags?: string[];
};

const CARDS: Card[] = [
  {
    id: '1', kind: 'featured',
    titleKey: 'smartFeed.titleFeatured',
    subject: 'Riyaziyyat: Funksiyalar və Qrafiklər',
    duration: '15 dəq', questions: 20, xp: 50,
    description: 'Bu günə olan xüsusi seçilmiş riyaziyyat sınağıdır. Səviyyənizə uyğun çətinlik dərəcəsi tənzimlənib.',
  },
  {
    id: '2', kind: 'weak',
    titleKey: 'smartFeed.titleWeak',
    weakTopic: 'Kəsrlər',
    weakScore: 45,
    description: '"Kimi deyir: Kəsrlərin vurulması mövzusunda kiçik boşluqların var. Gəl bu gün bu bölməni tamamlayaq!"',
  },
  {
    id: '3', kind: 'teacher',
    titleKey: 'smartFeed.titleTeacher',
    teacherName: 'Gülər Məmmədova',
    teacherRating: 4.9,
    subject: 'Riyaziyyat',
    teacherTags: ['Abituriyent hazırlığı', 'Sürətli metodika', 'Online & Əyani'],
    description: 'Sizin öyrənmə tərzinizə və kəsrlər mövzusundakı boşluqlarınıza ən yaxşı Gülər müəllimənin vizual izah metodu uyğun gəlir.',
  },
];

function FeaturedCard({ card, navigation }: { card: Card; navigation: any }) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryFixed]}
        style={styles.featuredHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.featuredHeroOverlay} />
        <View style={styles.featuredLabel}>
          <Text style={styles.featuredLabelText}>{t('smartFeed.featured')}</Text>
        </View>
        <View style={styles.featuredHeroBottom}>
          <Text style={styles.featuredHeroTitle}>{t(card.titleKey)}</Text>
          <Text style={styles.featuredHeroSub}>{card.subject}</Text>
        </View>
        <Ionicons name="calculator-outline" size={84} color="rgba(255,255,255,0.18)" style={styles.featuredBgIcon} />
      </LinearGradient>
      <View style={styles.featuredBody}>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons name="time-outline" size={14} color={Colors.primary} />
            <Text style={styles.metaPillText}>{card.duration}</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="help-circle-outline" size={14} color={Colors.primary} />
            <Text style={styles.metaPillText}>{t('smartFeed.questionsUnit', { n: card.questions ?? 0 })}</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="trending-up" size={14} color={Colors.primary} />
            <Text style={styles.metaPillText}>{t('smartFeed.xpUnit', { n: card.xp ?? 0 })}</Text>
          </View>
        </View>
        <Text style={styles.bodyText}>{card.description}</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => (navigation.getParent() as any)?.navigate('Exams' as never)}
        >
          <LinearGradient colors={GRADIENT} style={styles.cardCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.cardCtaText}>{t('smartFeed.start')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function WeakCard({ card, navigation }: { card: Card; navigation: any }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.card, styles.cardWeak]}>
      <View style={styles.weakHeader}>
        <View>
          <View style={styles.weakLabelRow}>
            <Ionicons name="analytics" size={16} color={Colors.primary} />
            <Text style={styles.weakLabel}>{t('smartFeed.aiAnalysis')}</Text>
          </View>
          <Text style={styles.weakTitle}>{t(card.titleKey)}</Text>
        </View>
        <View style={styles.weakIconBox}>
          <Ionicons name="bulb" size={26} color={Colors.primary} />
        </View>
      </View>

      <View style={styles.weakBubble}>
        <View style={styles.weakBubbleHeader}>
          <View style={styles.weakBubbleAvatar}>
            <Ionicons name="hardware-chip" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.weakBubbleTopic}>{card.weakTopic}</Text>
            <Text style={styles.weakBubbleMeta}>{t('smartFeed.weakMeta', { n: card.weakScore ?? 0 })}</Text>
          </View>
        </View>
        <View style={styles.weakProgressTrack}>
          <View style={[styles.weakProgressFill, { width: `${card.weakScore ?? 0}%` }]} />
        </View>
        <Text style={styles.weakQuote}>{card.description}</Text>
      </View>

      <View style={styles.weakGrid}>
        <View style={styles.weakGridCell}>
          <Text style={styles.weakGridLabel}>{t('smartFeed.lessonVideoLabel')}</Text>
          <Text style={styles.weakGridValue}>{t('smartFeed.lessonVideoValue')}</Text>
        </View>
        <View style={styles.weakGridCell}>
          <Text style={styles.weakGridLabel}>{t('smartFeed.practiceLabel')}</Text>
          <Text style={styles.weakGridValue}>{t('smartFeed.practiceValue')}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.weakCta}
        activeOpacity={0.9}
        onPress={() => (navigation.getParent() as any)?.navigate('Learn' as never)}
      >
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={styles.weakCtaText}>{t('smartFeed.repeat')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function TeacherCard({ card, navigation }: { card: Card; navigation: any }) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[Colors.tertiary + 'CC', Colors.primary + '99']}
        style={styles.teacherHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.teacherAvatarWrap}>
          <Ionicons name="person" size={72} color="#fff" />
        </View>
        <View style={styles.teacherRatingChip}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.teacherRatingText}>{card.teacherRating}</Text>
        </View>
      </LinearGradient>
      <View style={styles.teacherBody}>
        <View style={styles.teacherTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.teacherTitle}>{t(card.titleKey)}</Text>
            <Text style={styles.teacherName}>{card.teacherName}</Text>
          </View>
          <View style={styles.teacherSubjectChip}>
            <Text style={styles.teacherSubjectText}>{card.subject?.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.tagRow}>
          {card.teacherTags?.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.bodyText} numberOfLines={3}>{card.description}</Text>
        <View style={styles.teacherActions}>
          <TouchableOpacity
            style={styles.teacherProfileBtn}
            activeOpacity={0.85}
            onPress={() => (navigation.getParent() as any)?.navigate('Booking' as never)}
          >
            <Text style={styles.teacherProfileText}>{t('smartFeed.viewProfile')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.teacherChatBtn}
            activeOpacity={0.85}
            onPress={() => (navigation.getParent() as any)?.navigate('Chat' as never)}
          >
            <Ionicons name="chatbubble" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function SmartFeedScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>('foryou');

  const renderCard = ({ item }: { item: Card }) => (
    <View style={styles.cardWrap}>
      {item.kind === 'featured' && <FeaturedCard card={item} navigation={navigation} />}
      {item.kind === 'weak' && <WeakCard card={item} navigation={navigation} />}
      {item.kind === 'teacher' && <TeacherCard card={item} navigation={navigation} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('smartFeed.headerTitle')}</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="sparkles" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsRow}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'foryou' && styles.tabActive]}
            onPress={() => setTab('foryou')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === 'foryou' && styles.tabTextActive]}>{t('smartFeed.tabForYou')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'trends' && styles.tabActive]}
            onPress={() => setTab('trends')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === 'trends' && styles.tabTextActive]}>{t('smartFeed.tabTrends')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={CARDS}
        keyExtractor={(c) => c.id}
        renderItem={renderCard}
        snapToInterval={CARD_HEIGHT + 16}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  tabsRow: { alignItems: 'center', paddingVertical: 12 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLow,
    padding: 4, borderRadius: 999, gap: 4,
  },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
  tabActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  cardWrap: {
    height: CARD_HEIGHT + 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    flex: 1, backgroundColor: Colors.surfaceLowest,
    borderRadius: 24, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 4,
  },
  cardWeak: { borderLeftWidth: 8, borderLeftColor: Colors.primary, padding: 24 },

  // Featured
  featuredHero: { flex: 2, justifyContent: 'flex-end', padding: 24, overflow: 'hidden' },
  featuredHeroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.1)' },
  featuredBgIcon: { position: 'absolute', top: 24, right: 24, opacity: 0.6 },
  featuredLabel: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: 12,
  },
  featuredLabelText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  featuredHeroBottom: { gap: 4 },
  featuredHeroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.6 },
  featuredHeroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  featuredBody: { flex: 1, padding: 24, gap: 14, justifyContent: 'space-between' },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  metaPillText: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary },
  bodyText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  cardCta: { borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  cardCtaText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Weak
  weakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  weakLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  weakLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5 },
  weakTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  weakIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  weakBubble: { backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 18, gap: 12, marginBottom: 14 },
  weakBubbleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weakBubbleAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  weakBubbleTopic: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  weakBubbleMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  weakProgressTrack: { height: 6, backgroundColor: Colors.surfaceHigh, borderRadius: 999, overflow: 'hidden' },
  weakProgressFill: { height: '100%', backgroundColor: Colors.error, borderRadius: 999 },
  weakQuote: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', lineHeight: 19 },
  weakGrid: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  weakGridCell: { flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: 14, padding: 14 },
  weakGridLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2, marginBottom: 4 },
  weakGridValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  weakCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.textPrimary,
    borderRadius: 999, paddingVertical: 16,
  },
  weakCtaText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Teacher
  teacherHero: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  teacherAvatarWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  teacherRatingChip: {
    position: 'absolute', top: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  teacherRatingText: { fontSize: 12, fontWeight: '800', color: Colors.textPrimary },
  teacherBody: { flex: 1, padding: 24, gap: 12 },
  teacherTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  teacherTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  teacherName: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginTop: 2 },
  teacherSubjectChip: { backgroundColor: Colors.tertiary + '20', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  teacherSubjectText: { fontSize: 9, fontWeight: '800', color: Colors.tertiary, letterSpacing: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: Colors.surfaceLow, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  teacherActions: { flexDirection: 'row', gap: 10, marginTop: 'auto' },
  teacherProfileBtn: {
    flex: 1, backgroundColor: Colors.surfaceHigh,
    borderRadius: 999, paddingVertical: 14, alignItems: 'center',
  },
  teacherProfileText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  teacherChatBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
});
