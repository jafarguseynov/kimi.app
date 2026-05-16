import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MarketplaceStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createQuestion } from '../../api/marketplace.api';
import { getWallet } from '../../api/payment.api';

type Props = { navigation: NativeStackNavigationProp<MarketplaceStackParamList, typeof Routes.AskQuestion> };

export default function AskQuestionScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const dot1Anim = useRef(new Animated.Value(0.2)).current;
  const dot2Anim = useRef(new Animated.Value(0.2)).current;
  const dot3Anim = useRef(new Animated.Value(0.2)).current;

  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: getWallet });
  const balance = wallet?.balance ?? 0;

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => createQuestion({
      title: text.trim().slice(0, 80) || 'Yeni sual',
      body: text.trim(),
      subject: 'general',
      price: 0,
    }),
    onSuccess: (q) => {
      navigation.navigate(Routes.QuestionDetail, { questionId: q.id });
    },
    onError: () => Alert.alert('Xəta', 'Sual göndərilmədi. Yenidən cəhd edin.'),
  });

  useEffect(() => {
    if (isPending) {
      const pulse = (val: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(val, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(val, { toValue: 0.2, duration: 400, useNativeDriver: true }),
          ])
        );
      pulse(dot1Anim, 0).start();
      pulse(dot2Anim, 200).start();
      pulse(dot3Anim, 400).start();
    }
    return () => {
      dot1Anim.stopAnimation(); dot2Anim.stopAnimation(); dot3Anim.stopAnimation();
    };
  }, [isPending]);

  const handleSubmit = () => {
    if (text.trim().length < 5) {
      Alert.alert('Sual qısa', 'Zəhmət olmasa daha ətraflı sual yazın (minimum 5 simvol).');
      return;
    }
    submit();
  };

  if (isPending) {
    return (
      <View style={styles.aiLoadingScreen}>
        <View style={styles.aiLoadingAura} />
        <View style={styles.aiLoadingMascotWrap}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.aiLoadingMascot}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="hardware-chip" size={64} color="#fff" />
          </LinearGradient>
          <View style={styles.aiThinkBubble}>
            <View style={styles.aiThinkDots}>
              <Animated.View style={[styles.aiThinkDot, { opacity: dot1Anim }]} />
              <Animated.View style={[styles.aiThinkDot, { opacity: dot2Anim }]} />
              <Animated.View style={[styles.aiThinkDot, { opacity: dot3Anim }]} />
            </View>
          </View>
        </View>
        <Text style={styles.aiLoadingTitle}>Kimi AI sualı təhlil edir...</Text>
        <Text style={styles.aiLoadingSub}>
          Sizin üçün ən dəqiq və faydalı cavabı hazırlayırıq. Bir az gözləyin.
        </Text>
        <View style={styles.aiHintCard}>
          <View style={styles.aiHintIconBox}>
            <Ionicons name="bulb" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiHintTitle}>Bilirsinizmi?</Text>
            <Text style={styles.aiHintText}>
              Kimi Robot 10,000-dən çox sualı saniyələr içində təhlil edə bilir.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sualını soruş</Text>
          <TouchableOpacity
            style={styles.balanceChip}
            onPress={() => setShowBalanceModal(true)}
            activeOpacity={0.8}
            hitSlop={8}
          >
            <Text style={styles.balanceChipText}>Balans: {balance.toFixed(2)} ₼</Text>
          </TouchableOpacity>
        </View>

        {/* Insufficient Balance Modal */}
        <Modal
          visible={showBalanceModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBalanceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {/* Mascot */}
              <View style={styles.modalMascotWrap}>
                <View style={styles.modalMascotAura} />
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.modalMascotCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="hardware-chip-outline" size={48} color="rgba(255,255,255,0.9)" />
                </LinearGradient>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>Balans kifayət deyil</Text>
                <Text style={styles.modalSub}>
                  Sual vermək üçün balansınızda kifayət qədər vəsait yoxdur. Zəhmət olmasa balansınızı artırın.
                </Text>

                <View style={styles.balanceDisplay}>
                  <Text style={styles.balanceDisplayLabel}>Mövcud balans:</Text>
                  <Text style={styles.balanceDisplayValue}>{balance.toFixed(2)} ₼</Text>
                </View>

                <TouchableOpacity
                  style={{ width: '100%' }}
                  activeOpacity={0.9}
                  onPress={() => {
                    setShowBalanceModal(false);
                    navigation.navigate(Routes.TopUp as never);
                  }}
                >
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    style={styles.modalPrimaryBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.modalPrimaryBtnText}>Balans artır</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => setShowBalanceModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalSecondaryBtnText}>Ləğv et</Text>
                </TouchableOpacity>
              </View>

              {/* Gradient tint */}
              <View style={styles.modalGradientTint} pointerEvents="none" />
            </View>
          </View>
        </Modal>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroText}>
              Sualının şəklini çək və ya bura yaz, mən sənə izah edim!
            </Text>
            <View style={styles.dotsRow}>
              <View style={styles.dot} />
              <View style={[styles.dot, { opacity: 0.6 }]} />
              <View style={[styles.dot, { opacity: 0.3 }]} />
            </View>
          </View>

          {/* Photo actions */}
          <View style={styles.photoRow}>
            <TouchableOpacity
              style={styles.photoCard}
              activeOpacity={0.85}
              onPress={() => Alert.alert('Kamera', 'Kamera inteqrasiyası tezliklə əlavə olunacaq')}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={styles.photoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="camera" size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.photoLabel}>Şəkil çək</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoCard}
              activeOpacity={0.85}
              onPress={() => Alert.alert('Qalereya', 'Qalereya inteqrasiyası tezliklə əlavə olunacaq')}
            >
              <View style={[styles.photoCircle, { backgroundColor: Colors.surfaceLow }]}>
                <Ionicons name="image-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.photoLabel}>Şəkil yüklə</Text>
            </TouchableOpacity>
          </View>

          {/* Text input */}
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textArea}
              placeholder="Sualını yaz..."
              placeholderTextColor={Colors.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <View style={styles.inputFooter}>
              <View style={styles.inputIcons}>
                <TouchableOpacity hitSlop={8}>
                  <Ionicons name="attach-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity hitSlop={8}>
                  <Ionicons name="mic-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.charLimit}>Maksimum 500 simvol</Text>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.85} onPress={handleSubmit}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.submitBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.submitText}>Göndər</Text>
              <Ionicons name="send" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsLabel}>TEZ-TEZ SORUŞULANLAR</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipRow}>
                <View style={styles.tipIconBox}>
                  <Ionicons name="calculator-outline" size={22} color={Colors.primary} />
                </View>
                <Text style={styles.tipText}>Riyaziyyat məsələləri</Text>
              </View>
              <View style={styles.tipRow}>
                <View style={styles.tipIconBox}>
                  <Ionicons name="flask-outline" size={22} color={Colors.primary} />
                </View>
                <Text style={styles.tipText}>Kimya təcrübələri</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 20 },

  heroCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 32, alignItems: 'center', gap: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
    borderWidth: 1, borderColor: Colors.primaryFixed + '18',
  },
  heroText: { fontSize: 17, fontWeight: '500', color: Colors.textPrimary, textAlign: 'center', lineHeight: 26 },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  photoRow: { flexDirection: 'row', gap: 14 },
  photoCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 20,
    paddingVertical: 24, alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 16, elevation: 1,
  },
  photoCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  photoLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  inputCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 16, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  textArea: {
    minHeight: 160, padding: 20,
    fontSize: 15, color: Colors.textPrimary,
  },
  inputFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  inputIcons: { flexDirection: 'row', gap: 14 },
  charLimit: { fontSize: 10, fontWeight: '500', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 999, paddingVertical: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  submitText: { fontSize: 18, fontWeight: '800', color: '#fff' },

  tipsSection: { gap: 14 },
  tipsLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 2, textTransform: 'uppercase', paddingHorizontal: 4 },
  tipsList: { gap: 10 },
  tipRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLow + '80',
    borderRadius: 16, padding: 14,
  },
  tipIconBox: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  tipText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },

  // ── AI Loading state ───────────────────────────────────────────────────
  aiLoadingScreen: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 24,
  },
  aiLoadingAura: {
    position: 'absolute', top: '10%' as any, left: '10%' as any,
    right: '10%' as any, bottom: '30%' as any,
    backgroundColor: Colors.primary + '0D',
    borderRadius: 999,
  },
  aiLoadingMascotWrap: {
    width: 192, height: 192,
    alignItems: 'center', justifyContent: 'center',
  },
  aiLoadingMascot: {
    width: 160, height: 160, borderRadius: 80,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 8,
  },
  aiThinkBubble: {
    position: 'absolute', top: 0, right: -8,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3,
    transform: [{ rotate: '12deg' }],
  },
  aiThinkDots: { flexDirection: 'row', gap: 6 },
  aiThinkDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  aiLoadingTitle: {
    fontSize: 26, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.5,
  },
  aiLoadingSub: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 22, maxWidth: 280,
  },
  aiHintCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 20,
    width: '100%', marginTop: 8,
  },
  aiHintIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryLight + '60',
    alignItems: 'center', justifyContent: 'center',
  },
  aiHintTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  aiHintText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  // ── Balance chip ───────────────────────────────────────────────────────
  balanceChip: {
    backgroundColor: Colors.primary + '1A', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  balanceChipText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  // ── Balance Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(44,47,49,0.4)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest,
    borderRadius: 24, alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 32 }, shadowOpacity: 0.15, shadowRadius: 64, elevation: 12,
    paddingBottom: 32,
  },
  modalMascotWrap: {
    width: 112, height: 112, alignItems: 'center', justifyContent: 'center',
    marginTop: -32, marginBottom: 8,
  },
  modalMascotAura: {
    position: 'absolute', width: 112, height: 112, borderRadius: 56,
    backgroundColor: Colors.primary + '1A',
  },
  modalMascotCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 6,
  },
  modalBody: { paddingHorizontal: 28, alignItems: 'center', gap: 14, width: '100%' },
  modalTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  modalSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  balanceDisplay: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  balanceDisplayLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  balanceDisplayValue: { fontSize: 13, fontWeight: '800', color: Colors.danger },
  modalPrimaryBtn: {
    width: '100%', height: 58, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  modalPrimaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  modalSecondaryBtn: { width: '100%', height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  modalSecondaryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
  modalGradientTint: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 80,
    backgroundColor: Colors.primary + '06',
  },
});
