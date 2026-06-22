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
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function ReviewDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<{
    params: {
      reviewerName: string;
      reviewerSubtitle?: string;
      reviewDate: string;
      rating: number;
      reviewText: string;
      tags: string[];
    }
  }, 'params'>>();

  const {
    reviewerName = t('booking.defaultUser'),
    reviewerSubtitle = t('booking.student'),
    reviewDate = '—',
    rating = 5,
    reviewText = '',
    tags = [],
  } = route.params ?? {};

  const initial = reviewerName[0]?.toUpperCase() ?? '?';

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
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('booking.reviewDetailHeader')}</Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          hitSlop={8}
          onPress={() => Alert.alert(t('booking.share'), t('booking.shareSoon'))}
        >
          <Ionicons name="share-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Reviewer card */}
        <View style={styles.reviewerCard}>
          {/* Gradient ring avatar */}
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={GRADIENT}
              style={styles.avatarRingGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.avatarRingWhite}>
                <LinearGradient
                  colors={GRADIENT}
                  style={styles.avatarFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.tertiary} />
            </View>
          </View>

          <Text style={styles.reviewerName}>{reviewerName}</Text>
          <Text style={styles.reviewerSubtitle}>{reviewerSubtitle}</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons
                key={i}
                name={i <= rating ? 'star' : 'star-outline'}
                size={24}
                color={Colors.primary}
              />
            ))}
          </View>

          <Text style={styles.reviewDate}>{reviewDate.toUpperCase()}</Text>
        </View>

        {/* Content card */}
        <View style={styles.contentCard}>
          <View style={styles.quoteSection}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={40}
              color={Colors.primary + '40'}
            />
            <Text style={styles.reviewText}>{reviewText}</Text>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagsSection}>
              {tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Helpful widget */}
        <View style={styles.helpfulCard}>
          <View style={styles.helpfulLeft}>
            <View style={styles.thumbCircle}>
              <Ionicons name="thumbs-up" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.helpfulTitle}>{t('booking.helpfulReview')}</Text>
              <Text style={styles.helpfulSub}>{t('booking.helpfulCount', { count: 12 })}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.helpfulBtn} activeOpacity={0.7}>
            <Text style={styles.helpfulBtnText}>{t('booking.helpful')}</Text>
          </TouchableOpacity>
        </View>

        {/* AI verification note */}
        <View style={styles.verifyCard}>
          <Text style={styles.verifyText}>
            {t('booking.verifiedReview')}
          </Text>
        </View>
      </ScrollView>

      {/* Sticky bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={0.85}
          onPress={() => Alert.alert(t('booking.contactTitle'), t('booking.chatSoon'))}
        >
          <LinearGradient
            colors={GRADIENT}
            style={styles.contactBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.contactBtnText}>{t('booking.contactTeacher')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookmarkBtn} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32, gap: 16 },

  reviewerCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatarRingGrad: {
    width: 104, height: 104, borderRadius: 52,
    padding: 3, alignItems: 'center', justifyContent: 'center',
  },
  avatarRingWhite: {
    width: 98, height: 98, borderRadius: 49,
    backgroundColor: Colors.background,
    padding: 3, alignItems: 'center', justifyContent: 'center',
  },
  avatarFill: {
    width: 92, height: 92, borderRadius: 46,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 32, fontWeight: '900', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' },
  verifiedBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background,
  },
  reviewerName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  reviewerSubtitle: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  starsRow: { flexDirection: 'row', gap: 4, marginTop: 8 },
  reviewDate: {
    fontSize: 10, fontWeight: '800', color: Colors.textMuted,
    letterSpacing: 2, textTransform: 'uppercase', marginTop: 4,
  },

  contentCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 24, gap: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
  },
  quoteSection: { gap: 12 },
  reviewText: { fontSize: 16, color: Colors.textPrimary, lineHeight: 27, fontWeight: '400' },
  tagsSection: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  tag: {
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  tagText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  helpfulCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  helpfulLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  thumbCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  helpfulTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  helpfulSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  helpfulBtn: {
    backgroundColor: Colors.surface, borderRadius: 999,
    paddingHorizontal: 18, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  helpfulBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  verifyCard: {
    backgroundColor: Colors.surfaceHighest + '50',
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  verifyText: {
    fontSize: 13, color: Colors.textSecondary,
    fontStyle: 'italic', textAlign: 'center', lineHeight: 20,
  },

  bottomBar: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  contactBtn: {
    borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  contactBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  bookmarkBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
});
