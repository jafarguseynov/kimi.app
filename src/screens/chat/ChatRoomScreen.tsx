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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import client from '../../api/client';
import { sendChatMessage, markChatRead } from '../../api/chat.api';
import { socketService } from '../../services/socket.service';
import { useChatStore } from '../../store/chat.store';
import { useAuthStore } from '../../store/auth.store';
import { useUserStore } from '../../store/user.store';
import MessageBubble from '../../components/chat/MessageBubble';
import { Colors } from '../../constants/colors';
import { STICKERS } from '../../constants/cosmetics';
import { getEntitlements } from '../../api/shop.api';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

export default function ChatRoomScreen({ navigation, route }: Props) {
  const { chatId, name, userId: paramUserId } = route.params as { chatId: string; name: string; userId?: string };
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { token } = useAuthStore();
  const { messages, setMessages, addMessage, markReadBy } = useChatStore();
  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [ownsStickerPack, setOwnsStickerPack] = useState(false);
  const [presence, setPresence] = useState<{ online: boolean; lastSeenAt: string | null }>({ online: false, lastSeenAt: null });
  const listRef = useRef<FlatList>(null);

  // Qarşı tərəfin id-si: route param-dan, yoxsa mesajlardan (göndərəni biz olmayan) götür.
  const counterpartId = paramUserId ?? messages.find((m) => m.sender.id !== user?.id)?.sender.id ?? null;

  useEffect(() => {
    setMessages([]);
  }, [chatId]);

  useEffect(() => {
    getEntitlements().then((e) => setOwnsStickerPack(e.ownedPacks?.includes('sticker') ?? false)).catch(() => {});
  }, []);

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
      // Bu söhbəti aktiv izləyirik → gələn mesajı dərhal "oxundu" işarələ.
      if (msg?.sender?.id && msg.sender.id !== user?.id) socketService.markRead(chatId);
    };
    socketService.onNewMessage(handler);

    // Oxu qəbzi: qarşı tərəf bu söhbəti oxuyanda öz mesajlarımı "görüldü" et.
    const readHandler = (p: { chatId: string; readerId: string }) => {
      if (p.chatId === chatId) markReadBy(p.readerId);
    };
    socketService.onMessagesRead(readHandler);

    // Presence: qarşı tərəfin onlayn/son görülmə statusu.
    const presenceHandler = (p: { userId: string; online: boolean; lastSeenAt: string | null }) => {
      if (counterpartId && p.userId === counterpartId) setPresence({ online: p.online, lastSeenAt: p.lastSeenAt });
    };
    socketService.onPresence(presenceHandler);
    if (counterpartId) socketService.subscribePresence(counterpartId);

    // Söhbət açılanda oxu qəbzi (socket + REST fallback).
    socketService.markRead(chatId);
    markChatRead(chatId);

    return () => {
      socketService.offNewMessage(handler);
      socketService.offMessagesRead(readHandler);
      socketService.offPresence(presenceHandler);
      socketService.leaveChat(chatId);
    };
  }, [chatId, token, counterpartId]);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  // Mesajı REST ilə göndərir (socket upgrade bloklansa belə işləyir);
  // serverdən qayıdan mesaj store-a əlavə olunur (dedup id-ə görə → socket echo dublikat yaratmır).
  const deliver = async (content: string, type: 'text' | 'sticker' = 'text') => {
    try {
      const saved = await sendChatMessage(chatId, content, type);
      if (saved?.id) addMessage(saved);
    } catch {
      // REST uğursuzdursa socket ilə cəhd et (offline/keçici xəta)
      socketService.sendMessage(chatId, content, type);
      Alert.alert(t('chat.sendFailedTitle'), t('chat.sendFailedBody'));
    }
  };

  const send = () => {
    const content = text.trim();
    if (!content) return;
    setText('');
    deliver(content, 'text');
  };

  const sendSticker = (emoji: string, premium: boolean) => {
    if (premium && !ownsStickerPack) {
      Alert.alert(t('chat.stickerLockedTitle'), t('chat.stickerLockedBody'));
      return;
    }
    setShowStickers(false);
    deliver(emoji, 'sticker');
  };

  const initial = name?.[0]?.toUpperCase() ?? '?';

  // "Onlayn" / "son görülmə ..." mətni
  const presenceLabel = (() => {
    if (presence.online) return t('chat.online');
    if (!presence.lastSeenAt) return t('chat.offline');
    const diffMin = Math.floor((Date.now() - new Date(presence.lastSeenAt).getTime()) / 60000);
    if (diffMin < 1) return t('chat.lastSeenNow');
    if (diffMin < 60) return t('chat.lastSeenMin', { n: diffMin });
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return t('chat.lastSeenHour', { n: diffH });
    const time = new Date(presence.lastSeenAt).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit' });
    return t('chat.lastSeenDate', { date: time });
  })();

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
              {presence.online && <View style={styles.onlineDot} />}
            </View>
            <View>
              <Text style={styles.headerName}>{name}</Text>
              <Text style={[styles.headerStatus, !presence.online && styles.headerStatusOffline]}>{presenceLabel}</Text>
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
                type={item.type}
                isOwn={item.sender.id === user?.id}
                senderName={item.sender.name}
                time={new Date(item.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                isRead={item.isRead}
              />
            )}
          />
        )}

        {/* Stiker seçici panel */}
        {showStickers && (
          <View style={styles.stickerPanel}>
            <View style={styles.stickerGrid}>
              {STICKERS.map((s) => {
                const locked = s.premium && !ownsStickerPack;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.stickerCell, locked && { opacity: 0.5 }]}
                    activeOpacity={0.7}
                    onPress={() => sendSticker(s.emoji, s.premium)}
                  >
                    <Text style={{ fontSize: 30 }}>{s.emoji}</Text>
                    {locked && (
                      <View style={styles.stickerLock}><Ionicons name="lock-closed" size={9} color="#fff" /></View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {!ownsStickerPack && <Text style={styles.stickerHint}>{t('chat.stickerHint')}</Text>}
          </View>
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
            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowStickers((v) => !v)}>
              <Ionicons name={showStickers ? 'happy' : 'happy-outline'} size={22} color={showStickers ? Colors.primary : Colors.textSecondary} />
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
  headerStatusOffline: { color: Colors.textSecondary },

  msgList: { paddingVertical: 16, paddingHorizontal: 4 },

  datePill: {
    alignSelf: 'center', marginBottom: 16,
    backgroundColor: Colors.surfaceHigh, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 5,
  },
  datePillText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },

  stickerPanel: {
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Colors.borderLight,
    paddingVertical: 12, paddingHorizontal: 12,
  },
  stickerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  stickerCell: {
    width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  stickerLock: {
    position: 'absolute', top: 3, right: 3, width: 15, height: 15, borderRadius: 8,
    backgroundColor: '#6B7280', alignItems: 'center', justifyContent: 'center',
  },
  stickerHint: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', marginTop: 10 },
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
