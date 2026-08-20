import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { hapticSuccess } from '../../utils/haptics';

interface Props {
  levelUp: { from: number; to: number } | null;
  /** bu səviyyədə açılan mükafat (admin təyin edibsə) */
  reward?: { coins: number; streakFreezes: number; title: string | null } | null;
  onDone: () => void;
}

/**
 * "SƏVİYYƏ ARTDI!" — qısa, premium hiss verən qeyd.
 *
 * Yalnız səviyyə HƏQİQƏTƏN artdıqda görünür (hər açılışda deyil) və
 * 2.2 saniyədən sonra özü bağlanır. Animasiya native driver-lidir.
 */
export default function LevelUpOverlay({ levelUp, reward, onDone }: Props) {
  const { t } = useTranslation();
  const anim = useRef(new Animated.Value(0)).current;
  // `onDone` çağıran tərəfdə inline funksiya ola bilər (hər render-də yeni istinad).
  // Effekt asılılığına salsaq animasiya hər render-də yenidən başlayardı —
  // ona görə ref-də saxlayırıq və effekt YALNIZ levelUp dəyişəndə işə düşür.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!levelUp) return;
    hapticSuccess();
    anim.setValue(0);
    const seq = Animated.sequence([
      Animated.timing(anim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.delay(1600),
      Animated.timing(anim, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]);
    seq.start(({ finished }) => finished && doneRef.current());
    return () => seq.stop();
  }, [levelUp, anim]);

  if (!levelUp) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onDone}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDone}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: anim,
              transform: [
                { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.inner}
          >
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.title}>{t('progress.levelUpTitle')}</Text>
            <Text style={styles.levels}>
              {t('progress.level', { n: levelUp.from })} → {t('progress.level', { n: levelUp.to })}
            </Text>
            {reward && (reward.coins > 0 || reward.streakFreezes > 0 || reward.title) ? (
              <View style={styles.rewardBox}>
                <Text style={styles.rewardLabel}>{t('progress.levelUpReward')}</Text>
                {!!reward.title && <Text style={styles.rewardItem}>{reward.title}</Text>}
                {reward.coins > 0 && (
                  <Text style={styles.rewardItem}>🪙 {t('progress.rewardCoins', { n: reward.coins })}</Text>
                )}
                {reward.streakFreezes > 0 && (
                  <Text style={styles.rewardItem}>🧊 {t('progress.rewardFreeze', { n: reward.streakFreezes })}</Text>
                )}
              </View>
            ) : (
              <Text style={styles.sub}>{t('progress.levelUpSub')}</Text>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', alignItems: 'center', justifyContent: 'center' },
  card: { width: '78%', borderRadius: 24, overflow: 'hidden' },
  inner: { paddingVertical: 30, paddingHorizontal: 24, alignItems: 'center', gap: 6 },
  emoji: { fontSize: 44 },
  title: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  levels: { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 2 },
  sub: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: '600', textAlign: 'center', marginTop: 4 },
  rewardBox: {
    marginTop: 10, paddingVertical: 10, paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 14,
    alignItems: 'center', gap: 3,
  },
  rewardLabel: {
    fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  rewardItem: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
