import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { getQuestion, createAnswer, acceptAnswer, MarketAnswer } from '../../api/marketplace.api';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { formatDate } from '../../utils/formatters';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

type TabKey = 'answers' | 'ai';

export default function QuestionDetailScreen({ navigation, route }: Props) {
  const { questionId } = route.params as { questionId: string };
  const { user } = useUserStore();
  const qc = useQueryClient();

  const [tab, setTab] = useState<TabKey>('answers');
  const [answerText, setAnswerText] = useState('');
  const [showWriteAnswer, setShowWriteAnswer] = useState(false);

  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [pendingAnswerId, setPendingAnswerId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => getQuestion(questionId),
  });

  const { mutate: submitAnswer, isPending: isSubmitting } = useMutation({
    mutationFn: () => createAnswer(questionId, answerText),
    onSuccess: () => {
      setAnswerText('');
      setShowWriteAnswer(false);
      qc.invalidateQueries({ queryKey: ['question', questionId] });
    },
  });

  const { mutate: accept } = useMutation({
    mutationFn: acceptAnswer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['question', questionId] }),
  });

  const handleSubmitAnswer = () => {
    if (answerText.trim().length < 10) {
      Alert.alert('Xəta', 'Cavab ən azı 10 hərf olmalıdır');
      return;
    }
    submitAnswer();
  };

  const openRateModal = (answerId: string) => {
    setPendingAnswerId(answerId);
    setRating(0);
    setFeedback('');
    setRateModalOpen(true);
  };

  const confirmRating = () => {
    if (!pendingAnswerId) return;
    accept(pendingAnswerId);
    setRateModalOpen(false);
    setPendingAnswerId(null);
    Alert.alert('Təşəkkürlər', 'Rəyiniz qeyd olundu.');
  };

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const { question, answers } = data;
  const isOwner = question.author.id === user?.id;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sualın Təfərrüatları</Text>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="ellipsis-vertical" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Question block */}
          <View style={styles.questionCard}>
            <View style={styles.subjectHeader}>
              <View style={styles.subjectIcon}>
                <Ionicons name="school-outline" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subjectMeta}>MÖVZU: {(question.subject ?? 'Ümumi').toUpperCase()}</Text>
                <Text style={styles.subjectTitle} numberOfLines={1}>{question.title}</Text>
              </View>
            </View>
            <Text style={styles.questionBody}>{question.body}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={12} color={Colors.outline} />
              <Text style={styles.metaText}>{question.author.name}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{formatDate(question.createdAt)}</Text>
              {question.price > 0 && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={[styles.metaText, { color: Colors.primary, fontWeight: '700' }]}>
                    {question.price.toFixed(2)} AZN
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'answers' && styles.tabActive]}
              onPress={() => setTab('answers')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tab === 'answers' && styles.tabTextActive]}>
                Cavablar {answers.length > 0 && `(${answers.length})`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'ai' && styles.tabActive]}
              onPress={() => setTab('ai')}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={14} color={tab === 'ai' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.tabText, tab === 'ai' && styles.tabTextActive]}>AI cavab</Text>
            </TouchableOpacity>
          </View>

          {/* Tab content */}
          {tab === 'answers' ? (
            <View style={{ gap: 16 }}>
              {answers.length === 0 ? (
                <View style={styles.emptyAnswers}>
                  <Ionicons name="chatbubbles-outline" size={36} color={Colors.outlineVariant} />
                  <Text style={styles.emptyText}>Hələ cavab yoxdur</Text>
                </View>
              ) : (
                answers.map((a: MarketAnswer) => (
                  <View key={a.id} style={[styles.answerCard, a.isAccepted && styles.answerCardAccepted]}>
                    <View style={styles.answerHeader}>
                      <View style={styles.answerAuthor}>
                        <View style={styles.authorAvatar}>
                          <Ionicons name="person" size={22} color={Colors.primary} />
                        </View>
                        <View>
                          <Text style={styles.authorName}>{a.author.name}</Text>
                          <View style={styles.ratingRow}>
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text style={styles.ratingText}>4.9</Text>
                            <Text style={styles.ratingMeta}>• {formatDate(a.createdAt)}</Text>
                          </View>
                        </View>
                      </View>
                      {a.isAccepted && (
                        <View style={styles.expertBadge}>
                          <Text style={styles.expertBadgeText}>SEÇİLDİ</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.answerBody} numberOfLines={3}>"{a.body}"</Text>
                    {isOwner && !question.isResolved && (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => openRateModal(a.id)}
                      >
                        <LinearGradient
                          colors={[Colors.gradientStart, Colors.gradientEnd]}
                          style={styles.selectBtn}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        >
                          <Text style={styles.selectBtnText}>Bu cavabı seç</Text>
                          <Ionicons name="chevron-forward" size={16} color="#fff" />
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}

              {!question.isResolved && user?.id !== question.author.id && !showWriteAnswer && (
                <TouchableOpacity
                  style={styles.writeBtn}
                  activeOpacity={0.85}
                  onPress={() => setShowWriteAnswer(true)}
                >
                  <Ionicons name="create-outline" size={18} color={Colors.primary} />
                  <Text style={styles.writeBtnText}>Cavab yaz</Text>
                </TouchableOpacity>
              )}

              {showWriteAnswer && (
                <View style={styles.writeBox}>
                  <TextInput
                    style={styles.writeInput}
                    placeholder="Cavabını yaz..."
                    placeholderTextColor={Colors.textMuted}
                    value={answerText}
                    onChangeText={setAnswerText}
                    multiline
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    style={{ width: '100%' }}
                    activeOpacity={0.85}
                    onPress={handleSubmitAnswer}
                    disabled={isSubmitting}
                  >
                    <LinearGradient
                      colors={[Colors.gradientStart, Colors.gradientEnd]}
                      style={styles.sendBtn}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.sendBtnText}>
                        {isSubmitting ? 'Göndərilir...' : 'Cavabı göndər'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.aiBadge}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="hardware-chip" size={14} color="#fff" />
                </LinearGradient>
                <Text style={styles.aiTitle}>Kimi AI</Text>
              </View>
              <Text style={styles.aiBody}>
                AI sualınızı analiz edib detallı izah hazırlayır. Cavab gəldikdə bildiriş alacaqsınız.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Rating modal */}
        <Modal
          visible={rateModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setRateModalOpen(false)}
          statusBarTranslucent
        >
          <Pressable style={styles.rateBackdrop} onPress={() => setRateModalOpen(false)}>
            <Pressable style={styles.rateCard} onPress={(e) => e.stopPropagation()}>
              <TouchableOpacity
                style={styles.rateClose}
                onPress={() => setRateModalOpen(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>

              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                style={styles.rateMascot}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <View style={styles.rateMascotInner}>
                  <Ionicons name="hardware-chip" size={32} color={Colors.primary} />
                </View>
              </LinearGradient>

              <Text style={styles.rateTitle}>Cavabdan razısan?</Text>
              <Text style={styles.rateSub}>Müəllimi daha yaxşı qiymətləndirmək üçün təcrübəni bölüş.</Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setRating(n)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={n <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={n <= rating ? Colors.primaryFixed : Colors.outlineVariant}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.rateFieldLabel}>Əlavə qeydlər</Text>
              <TextInput
                style={styles.rateInput}
                placeholder="Rəyinizi buraya yazın..."
                placeholderTextColor={Colors.outlineVariant}
                value={feedback}
                onChangeText={setFeedback}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={{ width: '100%' }}
                activeOpacity={0.85}
                onPress={confirmRating}
                disabled={rating === 0}
              >
                <LinearGradient
                  colors={rating === 0 ? [Colors.outlineVariant, Colors.outlineVariant] : [Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.rateConfirm}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.rateConfirmText}>Təsdiqlə</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rateLater}
                onPress={() => setRateModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.rateLaterText}>Daha sonra</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
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

  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 20 },

  questionCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 20, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subjectIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  subjectMeta: { fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 1, marginBottom: 2 },
  subjectTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  questionBody: { fontSize: 15, color: Colors.textPrimary, lineHeight: 23 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.textSecondary },
  metaDot: { fontSize: 11, color: Colors.outline, marginHorizontal: 2 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLow,
    padding: 6, borderRadius: 999, gap: 4,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 999,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  emptyAnswers: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 13, color: Colors.textSecondary },

  answerCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 20, gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2,
  },
  answerCardAccepted: { borderLeftWidth: 4, borderLeftColor: Colors.tertiary },
  answerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  answerAuthor: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  authorAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryFixed + '1A',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primaryFixed + '33',
  },
  authorName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  ratingMeta: { fontSize: 10, color: Colors.outline, marginLeft: 4 },
  expertBadge: {
    backgroundColor: Colors.primary + '14',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3,
  },
  expertBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 0.8 },
  answerBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },
  selectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 999, gap: 6,
  },
  selectBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  writeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: Colors.primaryFixed + '33',
    borderStyle: 'dashed',
  },
  writeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  writeBox: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 16, gap: 12,
  },
  writeInput: {
    backgroundColor: Colors.surfaceLow, borderRadius: 14, padding: 14,
    fontSize: 14, color: Colors.textPrimary, minHeight: 100,
  },
  sendBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  sendBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  aiCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 20, gap: 12,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiBadge: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  aiTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  aiBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 21 },

  // Rating Modal
  rateBackdrop: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.4)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  rateCard: {
    width: '100%', maxWidth: 380,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24, padding: 28, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 12,
  },
  rateClose: { position: 'absolute', top: 14, right: 14, padding: 4 },
  rateMascot: {
    width: 84, height: 84, borderRadius: 42, padding: 4,
    marginTop: -64, marginBottom: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 6,
  },
  rateMascotInner: {
    flex: 1, borderRadius: 38,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  rateTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 6 },
  rateSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 22, lineHeight: 20 },
  starsRow: { flexDirection: 'row', gap: 6, marginBottom: 22 },
  rateFieldLabel: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '700', color: Colors.outline, marginBottom: 6, paddingLeft: 4 },
  rateInput: {
    width: '100%', backgroundColor: Colors.surfaceLow,
    borderRadius: 12, padding: 12,
    fontSize: 13, color: Colors.textPrimary,
    minHeight: 80, marginBottom: 22,
  },
  rateConfirm: { borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  rateConfirmText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  rateLater: { marginTop: 12, paddingVertical: 4 },
  rateLaterText: { fontSize: 13, fontWeight: '600', color: Colors.outline },
});
