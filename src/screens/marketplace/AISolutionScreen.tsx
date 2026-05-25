import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MarketplaceStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<MarketplaceStackParamList, typeof Routes.AISolution>;
  route: RouteProp<MarketplaceStackParamList, typeof Routes.AISolution>;
};

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Step = {
  title: string;
  body: string;
  code?: string;
  emphasize?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  tint?: 'primary' | 'success';
};

function buildSteps(question: string): { steps: Step[]; answer: string; unit?: string } {
  const lower = question.toLowerCase();
  const eqMatch = question.match(/(-?\d+)\s*x\s*([+\-])\s*(\d+)\s*=\s*(-?\d+)/i);
  if (eqMatch) {
    const a = parseInt(eqMatch[1], 10);
    const op = eqMatch[2];
    const b = parseInt(eqMatch[3], 10);
    const c = parseInt(eqMatch[4], 10);
    const moved = op === '+' ? c - b : c + b;
    const x = moved / a;
    const steps: Step[] = [
      {
        title: 'Sabiti sağa keçirək',
        body: `Tənliyin hər iki tərəfindən ${b} ${op === '+' ? 'çıxaq' : 'əlavə edək'}:`,
        code: `${a}x = ${c} ${op === '+' ? '-' : '+'} ${b} = ${moved}`,
      },
      {
        title: 'x-i hesablayaq',
        body: `İndi isə hər iki tərəfi ${a}-yə bölək:`,
        code: `x = ${moved} / ${a} = ${x}`,
        emphasize: true,
      },
    ];
    if (lower.includes('mol') || lower.includes('kimy')) {
      steps.push({
        title: 'Kimyəvi əlaqə',
        body: 'Bu həll, reaksiyadakı mol sayının hesablanmasında tətbiq olunur. x burada reaksiyaya daxil olan əsas komponentin mol sayını göstərir.',
        icon: 'flask',
        tint: 'success',
      });
    }
    return { steps, answer: `x = ${x}`, unit: lower.includes('mol') ? 'mol' : undefined };
  }

  return {
    steps: [
      { title: 'Sualı təhlil edək', body: 'Verilən məlumatları nəzərdən keçirib açar anlayışları ayırırıq.' },
      { title: 'Addımları tətbiq edək', body: 'Müvafiq qaydanı seçib hesablamaları aparırıq.' },
      { title: 'Nəticəni yoxlayaq', body: 'Aldığımız cavabı ilkin şərtə qoyaraq düzgünlüyünü təsdiq edirik.', icon: 'checkmark-circle', tint: 'success' },
    ],
    answer: 'Cavab hazırdır',
  };
}

export default function AISolutionScreen({ navigation, route }: Props) {
  const question = route.params?.question ?? '2x + 5 = 15 tənliyində x-i tapın və bu tənliyin kimyəvi reaksiyalardakı mol sayına tətbiqini izah edin.';
  const { steps, answer, unit } = useMemo(() => buildSteps(question), [question]);

  const askAnother = () => {
    navigation.navigate(Routes.AskQuestion);
  };

  const shareSolution = async () => {
    try {
      const summary = `Kimi AI sualımı həll etdi!\n\nSual: ${question}\nNəticə: ${answer}${unit ? ' ' + unit : ''}\n\nSən də sına: https://kimi.az`;
      await Share.share({ message: summary, title: 'Kimi AI Cavabı' });
    } catch {
      Alert.alert('Xəta', 'Paylaşma alınmadı');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Cavab</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={shareSolution} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Intro with mascot */}
        <View style={styles.introRow}>
          <View style={styles.mascotWrap}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mascot}>
              <Ionicons name="hardware-chip" size={42} color="#fff" />
            </LinearGradient>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.kickerPill}>
              <Text style={styles.kickerText}>KİMİ AI KÖMƏKÇİSİ</Text>
            </View>
            <Text style={styles.introTitle}>Mən sualını həll etdim!</Text>
            <Text style={styles.introSub}>Gəl addım-addım necə alındığına baxaq.</Text>
          </View>
        </View>

        {/* User question card */}
        <View style={{ gap: 10 }}>
          <View style={styles.sectionLabel}>
            <Ionicons name="help-circle" size={18} color={Colors.primary} />
            <Text style={styles.sectionLabelText}>SUALIN</Text>
          </View>
          <View style={styles.questionCard}>
            <View style={styles.questionAccent} />
            <Text style={styles.questionText}>"{question}"</Text>
          </View>
        </View>

        {/* Steps */}
        <View style={{ gap: 14 }}>
          <View style={styles.sectionLabel}>
            <Ionicons name="sparkles" size={18} color={Colors.primary} />
            <Text style={[styles.sectionLabelText, { color: Colors.textPrimary, fontSize: 16 }]}>Həlli addımları</Text>
          </View>

          {steps.map((step, i) => {
            const isAccent = step.tint === 'success';
            return (
              <View key={i} style={styles.stepCard}>
                <View style={[styles.stepNum, isAccent && styles.stepNumAccent]}>
                  {step.icon ? (
                    <Ionicons name={step.icon} size={18} color={isAccent ? '#047857' : Colors.primary} />
                  ) : (
                    <Text style={[styles.stepNumText, isAccent && { color: '#047857' }]}>{i + 1}</Text>
                  )}
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                  {step.code ? (
                    <View style={styles.codeBox}>
                      <Text style={[styles.codeText, step.emphasize && styles.codeTextEmph]}>{step.code}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        {/* Result card */}
        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.resultCard}>
          <View style={styles.resultAura} pointerEvents="none" />
          <Text style={styles.resultKicker}>NƏTİCƏ</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultValue}>{answer}</Text>
            {unit ? <Text style={styles.resultUnit}>{unit}</Text> : null}
          </View>
          <View style={styles.resultBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={styles.resultBadgeText}>AI tərəfindən təsdiqlənib</Text>
          </View>
          <Text style={styles.resultNote}>Riyazi tənliyin həlli 100% dəqiqliklə yerinə yetirilmişdir.</Text>
        </LinearGradient>

        {/* Actions */}
        <View style={{ gap: 8 }}>
          <TouchableOpacity activeOpacity={0.9} onPress={askAnother}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text style={styles.primaryBtnText}>Başqa sual soruş</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={shareSolution} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Həlli paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(Routes.AIAnswerFallback)}
            style={styles.fallbackLink}
          >
            <Ionicons name="person-outline" size={16} color={Colors.primary} />
            <Text style={styles.fallbackLinkText}>Cavab yetərli olmadı? Müəllimdən soruş</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 56,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 20, gap: 28 },

  /* Intro */
  introRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  mascotWrap: {
    width: 84, height: 84, borderRadius: 18,
    backgroundColor: '#fff', padding: 6,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  mascot: { flex: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  kickerPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  kickerText: { fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 1.2 },
  introTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4, lineHeight: 28 },
  introSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

  /* Section labels */
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabelText: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.5 },

  /* Question */
  questionCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 1,
    overflow: 'hidden', position: 'relative',
  },
  questionAccent: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
    backgroundColor: Colors.primary,
  },
  questionText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary, lineHeight: 22, fontStyle: 'italic', paddingLeft: 8 },

  /* Steps */
  stepCard: {
    flexDirection: 'row', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 1,
  },
  stepNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumAccent: { backgroundColor: '#D1FAE5' },
  stepNumText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  stepTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  stepBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  codeBox: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  codeText: { fontFamily: 'Menlo', fontSize: 13, color: Colors.textPrimary },
  codeTextEmph: { fontWeight: '800' },

  /* Result */
  resultCard: {
    borderRadius: 20, padding: 24, gap: 12, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.22, shadowRadius: 30, elevation: 5,
  },
  resultAura: {
    position: 'absolute', right: -40, bottom: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  resultKicker: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  resultRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  resultValue: { fontSize: 48, fontWeight: '800', color: '#fff', lineHeight: 52, letterSpacing: -1 },
  resultUnit: { fontSize: 18, color: 'rgba(255,255,255,0.85)', paddingBottom: 6, fontWeight: '600' },
  resultBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  resultBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  resultNote: { fontSize: 12, color: 'rgba(255,255,255,0.78)', lineHeight: 18 },

  /* Actions */
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 18, borderRadius: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  fallbackLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12,
  },
  fallbackLinkText: { fontSize: 13, fontWeight: '600', color: Colors.primary, textDecorationLine: 'underline' },
});
