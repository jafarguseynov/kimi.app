import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import Skeleton from '../common/Skeleton';
import type { DailyChallenge, DailyChallengeResult } from '../../api/dailyChallenge.api';

type Props = {
  loading: boolean;
  challenge: DailyChallenge | null;
  result: DailyChallengeResult | null;
  starting: boolean;
  onStart: () => void;
  onSeeExams: () => void;
};

/**
 * ⚡ Günün çağırışı — ana səhifədəki əsas gündəlik motivasiya kartı.
 *
 * Dörd vəziyyəti var:
 *   1. loading   → skeleton (ölçü eyni qalır, səhifə tullanmır)
 *   2. yoxdur    → kompakt "hazırlanır" vəziyyəti + imtahanlara keçid
 *   3. hazırdır  → başlıq + 3 metrik çipi (sual / dəqiqə / xal) + "Başla →"
 *   4. tamamlanıb→ yaşıl təsdiq + nəticə; xal TƏKRAR verilmir (server qoruyur)
 *
 * Rəng/şrift/ikon sistemi mövcud dizayndan götürülüb — köhnə hero kartla eyni
 * mavi qradiyent və eyni künc radiusu, sadəcə daha yığcam (padding 26 → 20).
 */
export default function DailyChallengeCard({
  loading,
  challenge,
  result,
  starting,
  onStart,
  onSeeExams,
}: Props) {
  const { t } = useTranslation();

  // ── 1. Skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.card, styles.skeleton]}>
        <Skeleton width={120} height={14} />
        <Skeleton width={'85%'} height={20} style={{ marginTop: 12 }} />
        <View style={styles.skelChips}>
          <Skeleton width={70} height={26} radius={999} />
          <Skeleton width={86} height={26} radius={999} />
          <Skeleton width={74} height={26} radius={999} />
        </View>
        <Skeleton width={130} height={40} radius={999} style={{ marginTop: 16 }} />
      </View>
    );
  }

  // ── 2. Bu gün çağırış yoxdur ─────────────────────────────────────────
  if (!challenge) {
    return (
      <View style={[styles.card, styles.emptyCard]}>
        <View style={styles.emptyRow}>
          <View style={styles.emptyIcon}>
            <Ionicons name="hourglass-outline" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.emptyText}>{t('home.student.dcEmpty')}</Text>
        </View>
        <TouchableOpacity onPress={onSeeExams} activeOpacity={0.7} style={styles.emptyLink}>
          <Text style={styles.emptyLinkText}>{t('home.student.dcOtherExams')}</Text>
          <Ionicons name="arrow-forward" size={15} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  const done = !!result;

  return (
    <LinearGradient
      colors={done ? ['#047857', '#059669', '#34D399'] : ['#00476b', '#0077b6', '#4cc9f0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, done ? styles.cardDone : styles.cardReady]}
    >
      <View style={styles.orb} pointerEvents="none" />
      <Ionicons
        name={done ? 'trophy' : 'flash'}
        size={104}
        color="rgba(255,255,255,0.10)"
        style={styles.watermark}
      />

      <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name={done ? 'checkmark-circle' : 'flash'} size={12} color="#fff" />
          <Text style={styles.badgeText}>
            {done ? t('home.student.dcDoneBadge') : t('home.student.dcBadge')}
          </Text>
        </View>

        {done ? (
          <>
            <Text style={styles.title}>🎉 {t('home.student.dcDoneTitle')}</Text>
            <View style={styles.doneRow}>
              <Text style={styles.doneScore}>
                {t('home.student.dcDoneScore', { score: result!.score, total: result!.total })}
              </Text>
              <View style={styles.doneXp}>
                <Text style={styles.doneXpText}>
                  {t('home.student.dcXp', { n: result!.xpAwarded || challenge.rewardXp })}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.85} onPress={onSeeExams}>
              <Text style={styles.ghostBtnText}>{t('home.student.dcOtherExams')}</Text>
              <Ionicons name="arrow-forward" size={15} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>{challenge.title}</Text>

            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  🎯 {t('home.student.dcQuestions', { n: challenge.questionCount })}
                </Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  ⏱️ {t('home.student.dcMinutes', { n: challenge.durationMinutes })}
                </Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  🏆 {t('home.student.dcXp', { n: challenge.rewardXp })}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startBtn}
              activeOpacity={0.85}
              onPress={onStart}
              disabled={starting}
            >
              {starting ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Text style={styles.startBtnText}>{t('home.student.dcStart')}</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Köhnə hero kartla eyni radius/kölgə — sadəcə daha yığcam padding.
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardReady: {
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 7,
  },
  cardDone: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 7,
  },
  content: { zIndex: 2 },
  orb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -60,
    top: -70,
  },
  watermark: { position: 'absolute', right: -8, bottom: -18 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },

  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
    lineHeight: 27,
    letterSpacing: -0.3,
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 18,
    minWidth: 132,
    minHeight: 44,
  },
  startBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '800' },

  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  doneScore: { color: '#fff', fontSize: 17, fontWeight: '800' },
  doneXp: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  doneXpText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 16,
  },
  ghostBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // ── Skeleton ──
  skeleton: { backgroundColor: Colors.surfaceLow, paddingVertical: 24 },
  skelChips: { flexDirection: 'row', gap: 8, marginTop: 14 },

  // ── Boş vəziyyət ──
  emptyCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 16,
  },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  emptyLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, marginLeft: 52 },
  emptyLinkText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
