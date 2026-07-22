import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { hapticLight } from '../../utils/haptics';
import { useTranslation } from '../../i18n';

interface Props {
  visible: boolean;
  onFinish: () => void;
}

const { width } = Dimensions.get('window');

/**
 * İlk açılış "spotlight" turu — yeni istifadəçiyə aşağı naviqasiyadakı əsas
 * bölmələri (İmtahan / AI / Müəllim / Profil) qısa izahla tanıdır.
 * Bir dəfə göstərilir; "Keç" və ya son addımdan sonra bir daha çıxmır.
 */
export default function HomeTourOverlay({ visible, onFinish }: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const steps = [
    { icon: 'document-text' as const, title: t('getStarted.tourExamsTitle'), body: t('getStarted.tourExamsBody') },
    { icon: 'sparkles' as const, title: t('getStarted.tourAiTitle'), body: t('getStarted.tourAiBody') },
    { icon: 'people' as const, title: t('getStarted.tourTeacherTitle'), body: t('getStarted.tourTeacherBody') },
    { icon: 'person' as const, title: t('getStarted.tourProfileTitle'), body: t('getStarted.tourProfileBody') },
  ];

  // 5 tab var: Home | Exams | AI | Booking | Profile. Turdakı addımlar
  // Exams(1), AI(2), Booking(3), Profile(4) tab-larına uyğun gəlir.
  const tabPositions = [1, 2, 3, 4];
  const tabCount = 5;
  const step = steps[index];
  const isLast = index === steps.length - 1;

  const next = () => {
    hapticLight();
    if (isLast) onFinish();
    else setIndex((i) => i + 1);
  };
  const skip = () => {
    hapticLight();
    onFinish();
  };

  // İşarə oxunun aşağıdakı tab mərkəzinə uyğun üfüqi mövqeyi
  const tabIndex = tabPositions[index];
  const arrowLeft = (width / tabCount) * (tabIndex + 0.5) - 8;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={skip}>
      <View style={s.backdrop}>
        <View style={s.spacer} />
        <View style={s.card}>
          <View style={s.iconWrap}>
            <Ionicons name={step.icon} size={26} color="#fff" />
          </View>
          <Text style={s.title}>{step.title}</Text>
          <Text style={s.body}>{step.body}</Text>

          <View style={s.dots}>
            {steps.map((_, i) => (
              <View key={i} style={[s.dot, i === index && s.dotActive]} />
            ))}
          </View>

          <View style={s.actions}>
            <TouchableOpacity onPress={skip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.skip}>{t('getStarted.tourSkip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.nextBtn} activeOpacity={0.85} onPress={next}>
              <Text style={s.nextText}>{isLast ? t('getStarted.tourDone') : t('getStarted.tourNext')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Aşağıdakı tab-a işarə edən ox */}
        <View style={[s.arrow, { left: arrowLeft }]} />
        <View style={s.tabHint} />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.72)', justifyContent: 'flex-end' },
  spacer: { flex: 1 },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  dots: { flexDirection: 'row', gap: 6, marginTop: 16 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 18 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
  },
  skip: { fontSize: 15, fontWeight: '600', color: Colors.textMuted, paddingVertical: 8, paddingHorizontal: 4 },
  nextBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  nextText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  arrow: {
    width: 0,
    height: 0,
    marginTop: 6,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.surface,
  },
  tabHint: { height: 64 },
});
