import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
  Modal, ScrollView, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import {
  sendAiMessage, analyzePerformance, analyzeTeacher,
  getConversations, getConversation, deleteConversation,
} from '../../api/ai.api';
import { getExamResults } from '../../api/certificate.api';
import { getTeacherAnalytics } from '../../api/user.api';
import { useUserStore } from '../../store/user.store';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

interface Message { id: string; role: 'user' | 'ai'; text: string; isWelcome?: boolean; }

const STUDENT_WELCOME =
  'Salam! Keçən həftəki performansını analiz etdim. Gəl zəif mövzularını birlikdə gücləndirək.';
const TEACHER_WELCOME =
  'Salam! İmtahan sualı, dərs planı və şagird analizi üçün buradayam. Nədən başlayaq?';

function makeWelcome(isTeacher: boolean): Message {
  return { id: 'welcome', role: 'ai', isWelcome: true, text: isTeacher ? TEACHER_WELCOME : STUDENT_WELCOME };
}

const pad2 = (n: number) => n.toString().padStart(2, '0');
function formatChatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return `Bugün ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  if (d.toDateString() === yest.toDateString()) return 'Dünən';
  return d.toLocaleDateString('az-AZ');
}

// Müəllim sürətli düymələri üçün input şablonları (müəllim [...] yerlərini doldurur)
const TEACHER_TEMPLATES = {
  exam: '[Fənn] fənni, [sinif] sinif üçün orta çətinlikdə 5 test sualı hazırla (hər biri 4 variantlı, düzgün cavabı qeyd et).',
  lesson: '[Fənn], [mövzu] üzrə 45 dəqiqəlik dərs planı hazırla.',
  homework: '[Fənn], [mövzu] üzrə şagirdlər üçün ev tapşırığı hazırla.',
};

const DAILY_GOAL = 20;

export default function AIMentorScreen() {
  const navigation = useNavigation<any>();
  const user = useUserStore((s) => s.user);
  const isTeacher = user?.role === 'teacher';

  const [messages, setMessages] = useState<Message[]>(() => [makeWelcome(isTeacher)]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const listRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const didInit = useRef(false);
  const { mutate, isPending } = useMutation({
    mutationFn: (vars: { message: string; conversationId: string | null }) =>
      sendAiMessage(vars.message, vars.conversationId),
  });

  // Söhbət tarixçəsi
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: getConversations,
  });

  // Köhnə söhbəti aç (tarixçədən və ya başlanğıcda ən sonuncunu)
  const openConversation = async (id: string) => {
    setHistoryOpen(false);
    try {
      const detail = await getConversation(id);
      setConversationId(id);
      setMessages(
        detail.messages.length
          ? detail.messages.map((m) => ({ id: m.id, role: m.role, text: m.text }))
          : [makeWelcome(isTeacher)],
      );
    } catch {
      Alert.alert('Xəta', 'Söhbət yüklənmədi.');
    }
  };

  const startNewChat = () => {
    setHistoryOpen(false);
    setConversationId(null);
    setMessages([makeWelcome(isTeacher)]);
  };

  const removeConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      if (id === conversationId) startNewChat();
      refetchConversations();
    } catch {
      Alert.alert('Xəta', 'Söhbət silinmədi.');
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Söhbəti sil', 'Bu söhbət silinsin?', [
      { text: 'Ləğv', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => removeConversation(id) },
    ]);
  };

  // İlk açılışda ən son söhbəti bərpa et (ekrandan çıxıb-girəndə sıfırlanmasın)
  useEffect(() => {
    if (didInit.current || conversations.length === 0) return;
    didInit.current = true;
    openConversation(conversations[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);
  const { mutate: runAnalyze, isPending: isAnalyzing } = useMutation({ mutationFn: analyzePerformance });
  const { mutate: runTeacherAnalyze, isPending: isTeacherAnalyzing } = useMutation({ mutationFn: analyzeTeacher });
  const { data: results = [] } = useQuery({ queryKey: ['examResults'], queryFn: getExamResults, enabled: !isTeacher });
  const { data: teacherStats } = useQuery({ queryKey: ['teacherAnalytics'], queryFn: getTeacherAnalytics, enabled: isTeacher });

  const todayProgress = useMemo(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const todayResults = results.filter((r) => {
      const d = new Date(r.completedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayKey;
    });
    const solved = todayResults.reduce((s, r) => s + r.total, 0);
    const pct = Math.min(100, Math.round((solved / DAILY_GOAL) * 100));
    return { solved, pct };
  }, [results]);

  const appendAi = (text: string) => {
    setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: 'ai', text }]);
  };
  const appendUser = (text: string) => {
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
  };

  const send = (override?: string) => {
    const msg = (override ?? input).trim();
    if (!msg || isPending) return;
    appendUser(msg);
    if (!override) setInput('');
    mutate({ message: msg, conversationId }, {
      onSuccess: (data) => {
        appendAi(data.reply || 'Cavab boş gəldi.');
        if (data.conversationId && data.conversationId !== conversationId) setConversationId(data.conversationId);
        refetchConversations();
      },
      onError: (err: any) => {
        const detail = err?.response?.data?.message;
        appendAi(detail ? `Xəta: ${detail}` : 'Hal-hazırda AI-ya qoşula bilmədim. Bir az sonra yenidən cəhd et.');
      },
    });
  };

  const handleAnalyze = () => {
    if (isAnalyzing) return;
    appendUser('Performansımı analiz et');
    runAnalyze(undefined, {
      onSuccess: (data) => {
        const weak = data.weakTopics.length
          ? `Zəif mövzular: ${data.weakTopics.map((t) => `${t.subject} (${t.avg}%)`).join(', ')}`
          : 'Zəif mövzu görünmür — yaxşı gedirsən!';
        const recs = data.recommendations.length
          ? `\n\nTövsiyələr:\n• ${data.recommendations.join('\n• ')}`
          : '';
        appendAi(`Orta xal: ${data.averageScore}%\n${weak}${recs}`);
      },
      onError: () => appendAi('Analiz alınmadı. İmtahan verdiyini yoxla və yenidən cəhd et.'),
    });
  };

  const handleTeacherAnalyze = () => {
    if (isTeacherAnalyzing) return;
    appendUser('Müəllim fəaliyyətimi analiz et');
    runTeacherAnalyze(undefined, {
      onSuccess: (data) => {
        const m = data.metrics;
        const head = `Bu ay: ${m.monthlyEarnings} AZN  •  Şagird: ${m.totalStudents}  •  Aktiv sorğu: ${m.activeQueries}  •  Reytinq: ${m.rating}/5`;
        const weak = data.studentWeakTopics.length
          ? `\nŞagirdlərin zəif fənləri: ${data.studentWeakTopics.map((t) => `${t.subject} (${t.avg}%)`).join(', ')}`
          : '\nŞagirdlərdə qabarıq zəif fənn görünmür.';
        const recs = data.recommendations.length
          ? `\n\nTövsiyələr:\n• ${data.recommendations.join('\n• ')}`
          : '';
        appendAi(`${head}${weak}${recs}`);
      },
      onError: () => appendAi('Analiz alınmadı. Bir az sonra yenidən cəhd et.'),
    });
  };

  const prefill = (template: string) => {
    setInput(template);
    inputRef.current?.focus();
  };

  const handleReplay = () => {
    startNewChat();
  };

  const handleAttach = () => Alert.alert('Tezliklə', 'Fayl əlavə etmə funksiyası tezliklə əlavə olunacaq.');
  const handleImage = () => Alert.alert('Tezliklə', 'Şəkil yükləmə funksiyası tezliklə əlavə olunacaq.');
  const handleMic = () => Alert.alert('Tezliklə', 'Səs yazma funksiyası tezliklə əlavə olunacaq.');

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === 'user') {
      return (
        <View style={styles.userRow}>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{item.text}</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.aiRow}>
        <View style={styles.aiBubble}>
          <View style={styles.aiBubbleAura} />
          <Text style={styles.aiText}>{item.text}</Text>
          {item.isWelcome && isTeacher && (
            <View style={styles.aiActions}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => prefill(TEACHER_TEMPLATES.exam)}>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.aiActionBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="document-text-outline" size={16} color="#fff" />
                  <Text style={styles.aiActionBtnText}>İmtahan sualları</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aiActionBtnSecondary} activeOpacity={0.8} onPress={() => prefill(TEACHER_TEMPLATES.lesson)}>
                <Ionicons name="easel-outline" size={16} color={Colors.textPrimary} />
                <Text style={styles.aiActionBtnSecondaryText}>Dərs planı</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aiActionBtnSecondary} activeOpacity={0.8} onPress={() => prefill(TEACHER_TEMPLATES.homework)}>
                <Ionicons name="reader-outline" size={16} color={Colors.textPrimary} />
                <Text style={styles.aiActionBtnSecondaryText}>Ev tapşırığı</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aiActionBtnSecondary} activeOpacity={0.8} onPress={handleTeacherAnalyze} disabled={isTeacherAnalyzing}>
                <Ionicons name="analytics-outline" size={16} color={Colors.textPrimary} />
                <Text style={styles.aiActionBtnSecondaryText}>{isTeacherAnalyzing ? 'Analiz olunur...' : 'Müəllim Analizi'}</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.isWelcome && !isTeacher && (
            <View style={styles.aiActions}>
              <TouchableOpacity activeOpacity={0.85} onPress={handleReplay}>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.aiActionBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={styles.aiActionBtnText}>Təkrar et</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.aiActionBtnSecondary}
                activeOpacity={0.8}
                onPress={handleAnalyze}
                disabled={isAnalyzing}
              >
                <Ionicons name="analytics-outline" size={16} color={Colors.textPrimary} />
                <Text style={styles.aiActionBtnSecondaryText}>{isAnalyzing ? 'Analiz olunur...' : 'AI Analiz'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Ionicons name="hardware-chip-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{isTeacher ? 'Kimi Müəllim Asistenti' : 'Kimi AI Mentor'}</Text>
            <Text style={styles.headerOnline}>Onlayn</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            activeOpacity={0.7}
            onPress={() => { refetchConversations(); setHistoryOpen(true); }}
          >
            <Ionicons name="time-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7} onPress={startNewChat}>
            <Ionicons name="create-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>Bugün</Text>
            </View>
          }
          renderItem={renderMessage}
          ListFooterComponent={
            isPending ? (
              <View style={styles.typingRow}>
                <Text style={styles.typingText}>Kimi yazır...</Text>
              </View>
            ) : null
          }
        />

        {/* Teacher status card / Student daily goal card */}
        {isTeacher ? (
          <View style={styles.goalCard}>
            <View style={styles.goalLeft}>
              <View style={styles.goalIconCircle}>
                <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.goalTitle}>Müəllim Paneli</Text>
                <Text style={styles.goalSub}>Cavab gözləyən sorğular və bu ayın gəliri</Text>
              </View>
            </View>
            <View style={styles.teacherStatsRow}>
              <View style={styles.teacherStat}>
                <Text style={styles.teacherStatValue}>{teacherStats?.activeQueries ?? '—'}</Text>
                <Text style={styles.teacherStatLabel}>Aktiv sorğu</Text>
              </View>
              <View style={styles.teacherStatDivider} />
              <View style={styles.teacherStat}>
                <Text style={styles.teacherStatValue}>{teacherStats?.monthlyEarnings ?? '—'} AZN</Text>
                <Text style={styles.teacherStatLabel}>Bu ay</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.goalCard}>
            <View style={styles.goalLeft}>
              <View style={styles.goalIconCircle}>
                <Ionicons name="stats-chart-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.goalTitle}>Gündəlik Hədəf</Text>
                <Text style={styles.goalSub}>Bu gün {DAILY_GOAL} yeni sual həll etməlisən</Text>
              </View>
            </View>
            <View style={styles.goalProgressBar}>
              <View style={[styles.goalProgressFill, { width: `${todayProgress.pct}%` }]} />
            </View>
            <View style={styles.goalProgressRow}>
              <Text style={styles.goalProgressLeft}>{todayProgress.solved}/{DAILY_GOAL} sual</Text>
              <Text style={styles.goalProgressRight}>{todayProgress.pct}% tamamlandı</Text>
            </View>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputCard}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={isTeacher ? 'Sual, mövzu və ya tapşırıq yaz...' : 'Sualını yaz...'}
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={500}
            />
            <View style={styles.inputActions}>
              <View style={styles.inputIconRow}>
                <TouchableOpacity style={styles.inputIconBtn} activeOpacity={0.7} onPress={handleAttach}>
                  <Ionicons name="attach-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIconBtn} activeOpacity={0.7} onPress={handleImage}>
                  <Ionicons name="image-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIconBtn} activeOpacity={0.7} onPress={handleMic}>
                  <Ionicons name="mic-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => send()} activeOpacity={0.85} disabled={isPending || !input.trim()}>
            <LinearGradient
              colors={isPending || !input.trim() ? [Colors.surfaceHighest, Colors.surfaceHighest] : [Colors.gradientStart, Colors.gradientEnd]}
              style={styles.sendFab}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Ionicons name={isPending ? 'hourglass' : 'send'} size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Söhbət tarixçəsi paneli (sol tərəfdən) */}
      <Modal visible={historyOpen} transparent animationType="fade" onRequestClose={() => setHistoryOpen(false)}>
        <Pressable style={styles.historyBackdrop} onPress={() => setHistoryOpen(false)}>
          <Pressable style={styles.historyPanel} onPress={() => {}}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Söhbət tarixçəsi</Text>
              <TouchableOpacity style={styles.historyNewBtn} activeOpacity={0.85} onPress={startNewChat}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.historyNewText}>Yeni</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              {conversations.length === 0 ? (
                <View style={styles.historyEmptyWrap}>
                  <Ionicons name="chatbubbles-outline" size={32} color={Colors.textMuted} />
                  <Text style={styles.historyEmpty}>Hələ söhbət yoxdur</Text>
                </View>
              ) : (
                conversations.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.historyRow, c.id === conversationId && styles.historyRowActive]}
                    activeOpacity={0.7}
                    onPress={() => openConversation(c.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyRowTitle} numberOfLines={1}>{c.title}</Text>
                      {!!c.preview && <Text style={styles.historyRowPreview} numberOfLines={1}>{c.preview}</Text>}
                      <Text style={styles.historyRowDate}>{formatChatDate(c.updatedAt)}</Text>
                    </View>
                    <TouchableOpacity hitSlop={10} onPress={() => confirmDelete(c.id)} style={styles.historyDelBtn}>
                      <Ionicons name="trash-outline" size={17} color={Colors.danger} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
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
  avatarWrap: { position: 'relative' },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryFixed + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  headerOnline: { fontSize: 11, fontWeight: '600', color: '#10b981', letterSpacing: 1, textTransform: 'uppercase' },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Söhbət tarixçəsi paneli */
  historyBackdrop: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.35)' },
  historyPanel: {
    width: '82%', maxWidth: 340, height: '100%',
    backgroundColor: Colors.background,
    paddingTop: 56, paddingHorizontal: 14,
    borderTopRightRadius: 20, borderBottomRightRadius: 20,
  },
  historyHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12, paddingHorizontal: 4,
  },
  historyTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  historyNewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
  },
  historyNewText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  historyEmptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  historyEmpty: { fontSize: 13, color: Colors.textMuted },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  historyRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  historyRowTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  historyRowPreview: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  historyRowDate: { fontSize: 10, color: Colors.textMuted, marginTop: 4, fontWeight: '600' },
  historyDelBtn: { padding: 4 },

  list: { padding: 16, gap: 20, paddingBottom: 8 },

  dateBadge: {
    alignSelf: 'center', marginBottom: 8,
    backgroundColor: Colors.surfaceLow,
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 999,
  },
  dateBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },

  userRow: { alignItems: 'flex-end' },
  userBubble: {
    maxWidth: '85%', backgroundColor: Colors.primary,
    borderRadius: 20, borderTopRightRadius: 4,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  userText: { fontSize: 15, color: Colors.onPrimary, lineHeight: 22 },

  aiRow: { alignItems: 'flex-start' },
  aiBubble: {
    maxWidth: '92%', backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, borderTopLeftRadius: 4,
    padding: 20, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06, shadowRadius: 20, elevation: 2,
  },
  aiBubbleAura: {
    position: 'absolute', top: -20, right: -20,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + '0D',
  },
  aiText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24, fontWeight: '500' },
  aiActions: { flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap' },
  aiActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
  },
  aiActionBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  aiActionBtnSecondary: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
  },
  aiActionBtnSecondaryText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  typingRow: { paddingHorizontal: 16, paddingBottom: 4 },
  typingText: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },

  goalCard: {
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.surfaceLow + 'CC',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceLowest + '80',
    gap: 10,
  },
  goalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  goalTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  goalSub: { fontSize: 12, color: Colors.textSecondary },
  goalProgressBar: {
    height: 8, backgroundColor: Colors.surfaceHighest, borderRadius: 4, overflow: 'hidden',
  },
  goalProgressFill: { width: '25%', height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  goalProgressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalProgressLeft: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  goalProgressRight: { fontSize: 10, color: Colors.textSecondary },

  teacherStatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  teacherStat: { flex: 1, alignItems: 'center' },
  teacherStatValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  teacherStatLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  teacherStatDivider: { width: 1, alignSelf: 'stretch', backgroundColor: Colors.surfaceHighest, marginVertical: 4 },

  inputArea: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.background + 'CC',
  },
  inputCard: {
    flex: 1, backgroundColor: Colors.surfaceLowest,
    borderRadius: 24, paddingTop: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  textInput: {
    paddingHorizontal: 18, paddingVertical: 12,
    fontSize: 15, color: Colors.textPrimary,
    maxHeight: 120,
  },
  inputActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 8 },
  inputIconRow: { flexDirection: 'row', gap: 2 },
  inputIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sendFab: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
    marginBottom: 2,
  },
});
