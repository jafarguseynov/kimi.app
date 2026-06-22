import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import client from '../../api/client';
import { socketService } from '../../services/socket.service';
import { useChatStore } from '../../store/chat.store';
import { useAuthStore } from '../../store/auth.store';
import { useUserStore } from '../../store/user.store';
import MessageBubble from '../../components/chat/MessageBubble';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

export default function ChatRoomScreen({ navigation, route }: Props) {
  const { chatId, name } = route.params as { chatId: string; name: string };
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { token } = useAuthStore();
  const { messages, setMessages, addMessage } = useChatStore();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([]);
  }, [chatId]);

  const { isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const res = await client.get(`/chat/${chatId}/messages`);
      setMessages(res.data);
      return res.data;
    },
  });

  useEffect(() => {
    if (!token) return;
    socketService.connect(token);
    socketService.joinChat(chatId);
    const handler = (msg: any) => {
      if (msg?.chatId && msg.chatId !== chatId) return;
      if (msg?.chat?.id && msg.chat.id !== chatId) return;
      addMessage(msg);
    };
    socketService.onNewMessage(handler);
    return () => {
      socketService.offNewMessage(handler);
      socketService.leaveChat(chatId);
    };
  }, [chatId, token]);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const send = () => {
    if (!text.trim()) return;
    socketService.sendMessage(chatId, text.trim());
    setText('');
  };

  const initial = name?.[0]?.toUpperCase() ?? '?';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerAvatarWrap}>
              <LinearGradient colors={GRADIENT} style={styles.headerAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.headerAvatarInitial}>{initial}</Text>
              </LinearGradient>
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.headerName}>{name}</Text>
              <Text style={styles.headerStatus}>{t('chat.online')}</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="ellipsis-vertical" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.msgList}
            ListHeaderComponent={
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>{t('chat.today')}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <MessageBubble
                content={item.content}
                isOwn={item.sender.id === user?.id}
                senderName={item.sender.name}
                time={new Date(item.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
              />
            )}
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.inputActionBtn} activeOpacity={0.7}>
              <Ionicons name="attach" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.inputActionBtn} activeOpacity={0.7}>
              <Ionicons name="mic" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder={t('chat.inputPlaceholder')}
              placeholderTextColor={Colors.outline}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity activeOpacity={0.7}>
              <Ionicons name="happy-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={send}
            disabled={!text.trim()}
            activeOpacity={0.85}
          >
            <LinearGradient colors={GRADIENT} style={styles.sendBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="send" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  headerAvatarInitial: { fontSize: 18, fontWeight: '800', color: '#fff', fontStyle: 'italic' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff',
  },
  headerName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  headerStatus: { fontSize: 12, fontWeight: '600', color: Colors.primary, marginTop: 1 },

  msgList: { paddingVertical: 16, paddingHorizontal: 4 },

  datePill: {
    alignSelf: 'center', marginBottom: 16,
    backgroundColor: Colors.surfaceHigh, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 5,
  },
  datePillText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  inputActions: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 },
  inputActionBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19 },

  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLow, borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 6, gap: 8, minHeight: 46,
  },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary, maxHeight: 100 },

  sendBtn: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', marginBottom: 1 },
  sendBtnGrad: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
});
