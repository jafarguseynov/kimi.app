import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { getQuestion, createAnswer, acceptAnswer } from '../../api/marketplace.api';
import AnswerCard from '../../components/marketplace/AnswerCard';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { formatDate, formatCurrency } from '../../utils/formatters';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

export default function QuestionDetailScreen({ navigation, route }: Props) {
  const { questionId } = route.params as { questionId: string };
  const { user } = useUserStore();
  const qc = useQueryClient();
  const [answerText, setAnswerText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => getQuestion(questionId),
  });

  const { mutate: submitAnswer, isPending: isSubmitting } = useMutation({
    mutationFn: () => createAnswer(questionId, answerText),
    onSuccess: () => {
      setAnswerText('');
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const { question, answers } = data!;
  const isOwner = question.author.id === user?.id;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Geri</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.questionBlock}>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{question.subject}</Text>
              </View>
              {question.price > 0 && (
                <View style={styles.priceTag}>
                  <Text style={styles.priceTagText}>{formatCurrency(question.price)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.questionTitle}>{question.title}</Text>
            <Text style={styles.questionBody}>{question.body}</Text>
            <Text style={styles.meta}>{question.author.name} · {formatDate(question.createdAt)}</Text>
          </View>

          <Text style={styles.sectionTitle}>
            Cavablar ({answers.length})
          </Text>

          {answers.map((a) => (
            <View key={a.id} style={{ marginBottom: 12 }}>
              <AnswerCard
                item={a}
                isOwner={isOwner}
                isResolved={question.isResolved}
                onAccept={accept}
              />
            </View>
          ))}

          {!question.isResolved && user?.id !== question.author.id && (
            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>Cavabını yaz</Text>
              <TextInput
                style={styles.answerInput}
                placeholder="Cavabın..."
                placeholderTextColor={Colors.textMuted}
                value={answerText}
                onChangeText={setAnswerText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleSubmitAnswer}
                disabled={isSubmitting}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? 'Göndərilir...' : 'Cavabı Göndər'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  back: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  scroll: { padding: 20, paddingBottom: 40 },
  questionBlock: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tag: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  priceTag: { backgroundColor: '#FEF9C3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  priceTagText: { fontSize: 12, color: Colors.warning, fontWeight: '700' },
  questionTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10 },
  questionBody: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 12 },
  meta: { fontSize: 12, color: Colors.textMuted },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  answerBox: { marginTop: 24 },
  answerLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  answerInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 100,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
