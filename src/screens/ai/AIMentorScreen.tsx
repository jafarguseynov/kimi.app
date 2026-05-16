import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation } from '@tanstack/react-query';
import { sendAiMessage } from '../../api/ai.api';
import { Colors } from '../../constants/colors';

interface Message { id: string; role: 'user' | 'ai'; text: string; }

const WELCOME: Message = {
  id: 'welcome',
  role: 'ai',
  text: 'Salam! Keçən həftəki performansını analiz etdim. Bu həftə zəif mövzun: Faizlər. Gəl bu mövzunu birlikdə gücləndirək.',
};

export default function AIMentorScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);
  const { mutate, isPending } = useMutation({ mutationFn: sendAiMessage });

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    mutate(input, {
      onSuccess: (data) => {
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: data.reply || '' };
        setMessages((prev) => [...prev, aiMsg]);
      },
    });
  };

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
          {item.id === 'welcome' && (
            <View style={styles.aiActions}>
              <TouchableOpacity activeOpacity={0.85}>
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.aiActionBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={styles.aiActionBtnText}>Təkrar et</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aiActionBtnSecondary} activeOpacity={0.8}>
                <Ionicons name="play-circle-outline" size={16} color={Colors.textPrimary} />
                <Text style={styles.aiActionBtnSecondaryText}>Test başlat</Text>
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
            <Text style={styles.headerTitle}>Kimi AI Mentor</Text>
            <Text style={styles.headerOnline}>Onlayn</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
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

        {/* Daily Goal Card */}
        <View style={styles.goalCard}>
          <View style={styles.goalLeft}>
            <View style={styles.goalIconCircle}>
              <Ionicons name="stats-chart-outline" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.goalTitle}>Gündəlik Hədəf</Text>
              <Text style={styles.goalSub}>Bu gün 20 yeni sual həll etməlisən</Text>
            </View>
          </View>
          <View style={styles.goalProgressBar}>
            <View style={styles.goalProgressFill} />
          </View>
          <View style={styles.goalProgressRow}>
            <Text style={styles.goalProgressLeft}>5/20 sual</Text>
            <Text style={styles.goalProgressRight}>25% tamamlandı</Text>
          </View>
        </View>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Sualını yaz..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={500}
            />
            <View style={styles.inputActions}>
              <View style={styles.inputIconRow}>
                <TouchableOpacity style={styles.inputIconBtn} activeOpacity={0.7}>
                  <Ionicons name="attach-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIconBtn} activeOpacity={0.7}>
                  <Ionicons name="image-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIconBtn} activeOpacity={0.7}>
                  <Ionicons name="mic-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={send} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.sendFab}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Ionicons name="send" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
