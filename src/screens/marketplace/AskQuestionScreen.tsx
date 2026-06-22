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
  Switch,
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
import { useTranslation } from '../../i18n';

type Props = { navigation: NativeStackNavigationProp<MarketplaceStackParamList, typeof Routes.AskQuestion> };

const SUBJECTS = ['Riyaziyyat', 'Azərbaycan dili', 'Fizika', 'Kimya', 'Biologiya', 'Tarix', 'Coğrafiya', 'İngilis dili', 'Ədəbiyyat', 'İnformatika'];
const GRADES = ['5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'];

export default function AskQuestionScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<null | 'subject' | 'grade'>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const dot1Anim = useRef(new Animated.Value(0.2)).current;
  const dot2Anim = useRef(new Animated.Value(0.2)).current;
  const dot3Anim = useRef(new Animated.Value(0.2)).current;

  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: getWallet });
  const balance = wallet?.balance ?? 0;
  const price = urgent ? 1.0 : 0.5;

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => createQuestion({
      title: `${subject ?? t('marketplace.defaultQuestionWord')}${grade ? ` • ${grade}` : ''} — ${text.trim().slice(0, 60)}`,
      body: text.trim(),
      subject: subject ?? 'general',
      price,
    }),
    onSuccess: (q) => {
      navigation.navigate(Routes.AISolution, { question: text.trim(), questionId: q.id });
    },
    onError: () => Alert.alert(t('marketplace.errorTitle'), t('marketplace.submitFail')),
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
    if (!subject) { Alert.alert(t('marketplace.errSubject'), t('marketplace.errSubjectMsg')); return; }
    if (text.trim().length < 5) {
      Alert.alert(t('marketplace.errShort'), t('marketplace.errShortMsg'));
      return;
    }
    if (balance < price) { setShowBalanceModal(true); return; }
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
        <Text style={styles.aiLoadingTitle}>{t('marketplace.aiAnalyzing')}</Text>
        <Text style={styles.aiLoadingSub}>
          {t('marketplace.aiAnalyzingSub')}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.headerLogo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="hardware-chip" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.headerTitle}>{t('marketplace.askHeader')}</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{t('marketplace.askHeroTitle')}</Text>
            <Text style={styles.heroSub}>
              {t('marketplace.askHeroSub')}
            </Text>
          </View>

          <View style={styles.uploadRow}>
            <TouchableOpacity
              style={styles.uploadCard}
              activeOpacity={0.85}
              onPress={() => Alert.alert(t('marketplace.cameraTitle'), t('marketplace.cameraSoon'))}
            >
              <View style={styles.uploadIconBox}>
                <Ionicons name="camera-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.uploadLabel}>{t('marketplace.takePhoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadCard}
              activeOpacity={0.85}
              onPress={() => Alert.alert(t('marketplace.galleryTitle'), t('marketplace.gallerySoon'))}
            >
              <View style={styles.uploadIconBox}>
                <Ionicons name="cloud-upload-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.uploadLabel}>{t('marketplace.uploadPhoto')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t('marketplace.subjectLabel')}</Text>
                <TouchableOpacity
                  style={styles.select}
                  activeOpacity={0.7}
                  onPress={() => setPickerOpen('subject')}
                >
                  <Text style={[styles.selectText, !subject && styles.selectPlaceholder]}>
                    {subject ?? t('marketplace.selectSubject')}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.outline} />
                </TouchableOpacity>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t('marketplace.gradeLabel')}</Text>
                <TouchableOpacity
                  style={styles.select}
                  activeOpacity={0.7}
                  onPress={() => setPickerOpen('grade')}
                >
                  <Text style={[styles.selectText, !grade && styles.selectPlaceholder]}>
                    {grade ?? t('marketplace.selectGrade')}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.outline} />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={styles.fieldLabel}>{t('marketplace.descriptionLabel')}</Text>
              <TextInput
                style={styles.textArea}
                placeholder={t('marketplace.descPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            <View style={styles.urgentRow}>
              <View style={styles.urgentLeft}>
                <Text style={styles.urgentTitle}>{t('marketplace.urgentAnswer')}</Text>
                <Ionicons name="information-circle-outline" size={16} color={Colors.outline} />
              </View>
              <Switch
                value={urgent}
                onValueChange={setUrgent}
                trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.priceCard}>
            <View style={styles.priceLeft}>
              <Ionicons name="cash-outline" size={20} color={Colors.primary} />
              <Text style={styles.priceLabel}>{t('marketplace.forThisQuestion')}</Text>
            </View>
            <Text style={styles.priceValue}>{price.toFixed(2)} AZN</Text>
          </View>

          <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.85} onPress={handleSubmit}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.submitBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.submitText}>{t('marketplace.shareBtn')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        <Modal
          visible={pickerOpen !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setPickerOpen(null)}
        >
          <TouchableOpacity
            style={styles.pickerBackdrop}
            activeOpacity={1}
            onPress={() => setPickerOpen(null)}
          >
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerTitle}>
                {pickerOpen === 'subject' ? t('marketplace.selectSubject') : t('marketplace.selectGrade')}
              </Text>
              <ScrollView>
                {(pickerOpen === 'subject' ? SUBJECTS : GRADES).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.pickerRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (pickerOpen === 'subject') setSubject(opt); else setGrade(opt);
                      setPickerOpen(null);
                    }}
                  >
                    <Text style={styles.pickerRowText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={showBalanceModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBalanceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalMascotWrap}>
                <View style={styles.modalMascotAura} />
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.modalMascotCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="wallet-outline" size={48} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{t('marketplace.balanceInsufficient')}</Text>
                <Text style={styles.modalSub}>
                  {t('marketplace.balanceInsufficientSub')}
                </Text>
                <View style={styles.balanceDisplay}>
                  <Text style={styles.balanceDisplayLabel}>{t('marketplace.currentBalance')}</Text>
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
                    <Text style={styles.modalPrimaryBtnText}>{t('marketplace.topUp')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => setShowBalanceModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalSecondaryBtnText}>{t('marketplace.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLogo: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 20 },

  hero: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 6,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: Colors.primary, letterSpacing: -0.3, textAlign: 'center' },
  heroSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  uploadRow: { flexDirection: 'row', gap: 14 },
  uploadCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, paddingVertical: 28, alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
  },
  uploadIconBox: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  formCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 20, gap: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.02, shadowRadius: 20, elevation: 1,
  },
  fieldRow: { flexDirection: 'row', gap: 14 },
  field: { flex: 1, gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, paddingLeft: 4 },
  select: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLow, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  selectText: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  selectPlaceholder: { color: Colors.outlineVariant },
  textArea: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16, padding: 16,
    fontSize: 14, color: Colors.textPrimary,
    minHeight: 110,
  },
  urgentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  urgentLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  urgentTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  priceCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primaryFixed + '14',
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: Colors.primaryFixed + '33',
  },
  priceLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priceLabel: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  priceValue: { fontSize: 18, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  submitBtn: {
    borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  submitText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  pickerBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: Colors.surfaceLowest,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '60%',
  },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  pickerRow: {
    paddingVertical: 14, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  pickerRowText: { fontSize: 15, color: Colors.textPrimary },

  // AI loading
  aiLoadingScreen: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 20,
  },
  aiLoadingAura: {
    position: 'absolute', top: '10%' as any, left: '10%' as any,
    right: '10%' as any, bottom: '30%' as any,
    backgroundColor: Colors.primary + '0D', borderRadius: 999,
  },
  aiLoadingMascotWrap: { width: 192, height: 192, alignItems: 'center', justifyContent: 'center' },
  aiLoadingMascot: {
    width: 160, height: 160, borderRadius: 80,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 8,
  },
  aiThinkBubble: {
    position: 'absolute', top: 0, right: -8,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    transform: [{ rotate: '12deg' }],
  },
  aiThinkDots: { flexDirection: 'row', gap: 6 },
  aiThinkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  aiLoadingTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  aiLoadingSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, maxWidth: 280 },

  // Balance modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(44,47,49,0.4)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%', backgroundColor: Colors.surfaceLowest,
    borderRadius: 24, alignItems: 'center', overflow: 'hidden',
    paddingBottom: 28,
  },
  modalMascotWrap: {
    width: 112, height: 112, alignItems: 'center', justifyContent: 'center',
    marginTop: 24, marginBottom: 8,
  },
  modalMascotAura: {
    position: 'absolute', width: 112, height: 112, borderRadius: 56,
    backgroundColor: Colors.primary + '1A',
  },
  modalMascotCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  modalBody: { paddingHorizontal: 24, alignItems: 'center', gap: 14, width: '100%' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  modalSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  balanceDisplay: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  balanceDisplayLabel: { fontSize: 13, color: Colors.textSecondary },
  balanceDisplayValue: { fontSize: 13, fontWeight: '800', color: Colors.danger },
  modalPrimaryBtn: {
    width: '100%', height: 54, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  modalPrimaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  modalSecondaryBtn: { width: '100%', height: 50, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  modalSecondaryBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
});
