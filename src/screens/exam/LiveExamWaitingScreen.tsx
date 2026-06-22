import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExamStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useStartExam } from '../../hooks/useExams';
import { useTranslation } from '../../i18n';

type Props = {
  navigation: NativeStackNavigationProp<ExamStackParamList, typeof Routes.LiveExamWaiting>;
  route: RouteProp<ExamStackParamList, typeof Routes.LiveExamWaiting>;
};

const COUNTDOWN_START = 30;
const PARTICIPANTS_TOTAL = 1248;

function format(seconds: number): { m: string; s: string } {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return { m: m.toString().padStart(2, '0'), s: s.toString().padStart(2, '0') };
}

export default function LiveExamWaitingScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { examId, title = 'Riyaziyyat' } = route.params;
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [participants, setParticipants] = useState(900);
  const [pendingStart, setPendingStart] = useState(false);
  const pulse = React.useRef(new Animated.Value(1)).current;

  const { mutate: startExam, isPending: isStarting, isSuccess: isReady, isError, error } = useStartExam();

  useEffect(() => {
    if (examId) startExam(examId);
  }, [examId]);

  useEffect(() => {
    if (isError) {
      Alert.alert(t('liveExams.errorTitle'), (error as any)?.message || t('liveExams.startFailed'), [
        { text: t('liveExams.back'), onPress: () => navigation.goBack() },
      ]);
    }
  }, [isError]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
      setParticipants((p) => Math.min(PARTICIPANTS_TOTAL, p + Math.floor(Math.random() * 20) + 5));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // When countdown ends OR user clicked Hazıram, navigate as soon as data is ready
  useEffect(() => {
    const shouldGo = (countdown === 0 || pendingStart) && isReady;
    if (shouldGo) {
      const timer = setTimeout(() => navigation.replace(Routes.LiveExamSession), 200);
      return () => clearTimeout(timer);
    }
  }, [countdown, pendingStart, isReady]);

  const onReadyPress = () => {
    if (isReady) {
      navigation.replace(Routes.LiveExamSession);
    } else {
      setPendingStart(true);
    }
  };

  const { m, s } = format(countdown);
  const fillPercent = Math.min(100, Math.round((participants / PARTICIPANTS_TOTAL) * 100));
  const ctaLoading = isStarting || (pendingStart && !isReady);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('liveExams.detailHeader')}</Text>
        </View>
        <Ionicons name="help-circle-outline" size={22} color={Colors.textMuted} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mascot */}
        <View style={styles.mascotWrap}>
          <View style={styles.readyBadge}>
            <Text style={styles.readyBadgeText}>{t('liveExams.getReady')}</Text>
          </View>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.mascotCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="hardware-chip" size={64} color="#fff" />
          </LinearGradient>
        </View>

        {/* Countdown */}
        <View style={styles.countdownWrap}>
          <Text style={styles.countdownLabel}>{t('liveExams.examStarting')}</Text>
          <View style={styles.countdownRow}>
            <Text style={styles.countdownDigit}>{m}</Text>
            <Animated.Text style={[styles.countdownColon, { opacity: pulse }]}>:</Animated.Text>
            <Text style={styles.countdownDigit}>{s}</Text>
          </View>
        </View>

        {/* Topic card */}
        <View style={styles.topicCard}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.topicIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="calculator" size={26} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.topicLabel}>{t('liveExams.examTopic')}</Text>
            <Text style={styles.topicValue} numberOfLines={1}>{title}</Text>
          </View>
        </View>

        {/* Participant card */}
        <View style={styles.participantCard}>
          <View style={styles.participantTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.participantLabel}>{t('liveExams.participantsCount')}</Text>
              <Text style={styles.participantValue}>{t('liveExams.peopleCount', { n: participants.toLocaleString() })}</Text>
            </View>
            <View style={styles.avatarStack}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.avatarBubble, { left: i * 22, zIndex: 3 - i, backgroundColor: ['#cce7fa', '#dae2fd', '#c8ffe0'][i] }]}>
                  <Ionicons name="person" size={14} color={Colors.primary} />
                </View>
              ))}
              <View style={[styles.avatarBubble, styles.avatarMore, { left: 66 }]}>
                <Text style={styles.avatarMoreText}>+1k</Text>
              </View>
            </View>
          </View>

          <View style={styles.fillTrack}>
            <View style={[styles.fillBar, { width: `${fillPercent}%` }]} />
          </View>
          <Text style={styles.participantSub}>{t('liveExams.roomFilling')}</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onReadyPress}
          disabled={ctaLoading || isError}
          style={styles.ctaWrap}
        >
          <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={[styles.ctaBtn, ctaLoading && { opacity: 0.7 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {ctaLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.ctaBtnText}>{t('liveExams.loading')}</Text>
              </View>
            ) : (
              <Text style={styles.ctaBtnText}>{t('liveExams.imReady')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          {t('liveExams.waitFooter')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },

  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, alignItems: 'center' },

  mascotWrap: { position: 'relative', marginTop: 8, marginBottom: 20, alignItems: 'center' },
  readyBadge: {
    position: 'absolute', top: -6, right: -10, zIndex: 10,
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  readyBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.tertiary },
  mascotCircle: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.2, shadowRadius: 28, elevation: 6,
  },

  countdownWrap: { alignItems: 'center', marginBottom: 28, width: '100%' },
  countdownLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4, letterSpacing: 2, textTransform: 'uppercase' },
  countdownRow: { flexDirection: 'row', alignItems: 'baseline' },
  countdownDigit: { fontSize: 64, fontWeight: '800', color: Colors.primary, letterSpacing: -3, fontVariant: ['tabular-nums'] },
  countdownColon: { fontSize: 64, fontWeight: '800', color: Colors.primary + '4D', letterSpacing: -3, paddingHorizontal: 4 },

  topicCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    width: '100%', marginBottom: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.06, shadowRadius: 32, elevation: 2,
  },
  topicIcon: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3,
  },
  topicLabel: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary, marginBottom: 2 },
  topicValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },

  participantCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 18, padding: 18, gap: 12,
    width: '100%', marginBottom: 24,
  },
  participantTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  participantLabel: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary, marginBottom: 2 },
  participantValue: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  avatarStack: { position: 'relative', width: 110, height: 34 },
  avatarBubble: {
    position: 'absolute',
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2, borderColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarMore: {
    backgroundColor: Colors.primaryFixed,
  },
  avatarMoreText: { fontSize: 10, fontWeight: '800', color: Colors.primary },

  fillTrack: { height: 6, backgroundColor: Colors.surfaceHigh, borderRadius: 999, overflow: 'hidden' },
  fillBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },
  participantSub: { fontSize: 11, color: Colors.textSecondary, fontStyle: 'italic' },

  ctaWrap: { width: '100%' },
  ctaBtn: {
    paddingVertical: 18, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },

  footerText: {
    marginTop: 18, fontSize: 13, color: Colors.textSecondary, textAlign: 'center',
    paddingHorizontal: 16, lineHeight: 19,
  },
});
