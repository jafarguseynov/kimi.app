import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import client from '../../api/client';
import { sendChatMessage, markChatRead, getChatPresence } from '../../api/chat.api';
import { reportContent } from '../../api/user.api';
import { socketService } from '../../services/socket.service';
import { setActiveChatId } from '../../utils/push';
import { useChatStore } from '../../store/chat.store';
import { useAuthStore } from '../../store/auth.store';
import { useUserStore } from '../../store/user.store';
import MessageBubble from '../../components/chat/MessageBubble';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { STICKERS } from '../../constants/cosmetics';
import { getEntitlements } from '../../api/shop.api';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

export default function ChatRoomScreen({ navigation, route }: Props) {
  const { chatId, name, userId: paramUserId, avatarUrl: paramAvatarUrl } = route.params as {
    chatId: string;
    name: string;
    userId?: string;
    avatarUrl?: string | null;
  };
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { messages, setMessages, addMessage, replaceMessage, removeMessage, markReadBy } = useChatStore();
  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [ownsStickerPack, setOwnsStickerPack] = useState(false);
  const [presence, setPresence] = useState<{ online: boolean; lastSeenAt: string | null }>({ online: false, lastSeenAt: null });
  const listRef = useRef<FlatList>(null);

  // Geri düyməsi həmişə söhbətlər siyahısına aparsın. Söhbət başqa ekrandan
  // (məs. müəllim profilindən) birbaşa açılıbsa, yığında ChatList olmaya bilər —
  // belə halda sadə goBack() bütün tabı bağlayıb ana səhifəyə atır.
  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace(Routes.ChatList);
  };

  // Bu söhbət açıq ikən onun ön-plan push bildirişini sus (WhatsApp kimi — mesaj onsuz da ekranda).
  useEffect(() => {
    setActiveChatId(chatId);
    return () => setActiveChatId(null);
  }, [chatId]);

  // REST presence — socket qurulmasa belə online statusu düzgün göstərilir (20s-də bir yenilənir).
  const { data: presenceRest } = useQuery({
    queryKey: ['presence', chatId],
    queryFn: () => getChatPresence(chatId),
    enabled: !!chatId,
    refetchInterval: 20000,
    staleTime: 5000,
  });
  useEffect(() => {
    if (presenceRest) setPresence({ online: !!presenceRest.online, lastSeenAt: presenceRest.lastSeenAt ?? null });
  }, [presenceRest]);

  // Qarşı tərəfin id-si: route param-dan, yoxsa mesajlardan (göndərəni biz olmayan) götür.
  const counterpartId = paramUserId ?? messages.find((m) => m.sender.id !== user?.id)?.sender.id ?? null;

  // Qarşı tərəfin profil şəkli: siyahıdan gələn param, yoxsa mesajın sender obyektindən
  // (getMessages tam sender qaytarır — push tap-ından açılanda param olmaya bilər).
  const counterpartAvatar =
    paramAvatarUrl ??
    (messages.find((m) => m.sender.id === counterpartId) as any)?.sender?.avatarUrl ??
    null;

  useEffect(() => {
    setMessages([]);
  }, [chatId]);

  useEffect(() => {
    getEntitlements().then((e) => setOwnsStickerPack(e.ownedPacks?.includes('sticker') ?? false)).catch(() => {});
  }, []);

  // Mesajları 3 saniyədə bir çək (real-time — socket işləməsə də yeni mesajlar
  // çatdan çıxmadan görünür). Yalnız dəyişiklik olanda store-u yeniləyirik.
  const { isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const res = await client.get(`/chat/${chatId}/messages`);
      const server = res.data as any[];
      const current = useChatStore.getState().messages;
      // Optimistik (pending) mesajları ayır — poll onları silməməlidir (göndəriş
      // gedişatında ekrandan itməsin). Müqayisəni yalnız real mesajlara görə aparırıq.
      const pending = current.filter((m) => (m as any).pending);
      const real = current.filter((m) => !(m as any).pending);
      // Dəyişiklik: yeni mesaj (uzunluq/son-id) VƏ YA oxu qəbzi (isRead sayı) fərqlənəndə.
      // isRead dəyişikliyini də tuturuq ki, qarşı tərəf oxuyanda ✓✓ (görüldü) real-time düşsün.
      const readSig = (arr: any[]) => arr.reduce((n, m) => n + (m?.isRead ? 1 : 0), 0);
      const changed =
        server.length !== real.length ||
        (server.length > 0 && server[server.length - 1]?.id !== real[real.length - 1]?.id) ||
        readSig(server) !== readSig(real);
      if (changed) {
        // Serverdə artıq eyni məzmunlu mesaj varsa uyğun pending-i at (dublikat olmasın);
        // yoxdursa pending-i sonda saxla ki, cavab gələnə qədər görünsün.
        const stillPending = pending.filter(
          (p) => !server.some((sv) => sv.content === p.content && sv.sender?.id === p.sender?.id),
        );
        setMessages([...server, ...stillPending]);
        const last = server[server.length - 1];
        // Yeni gələn (mənim olmayan) mesaj → dərhal oxundu + nöqtəni yenilə.
        if (last && last.sender?.id !== user?.id) {
          socketService.markRead(chatId);
          markChatRead(chatId);
          queryClient.invalidateQueries({ queryKey: ['badges'] });
        }
      }
      return server;
    },
    refetchInterval: 1500,
    refetchIntervalInBackground: false,
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
    // Aqreqat mesaj nöqtəsini yenilə (oxundu → say azalsın).
    queryClient.invalidateQueries({ queryKey: ['badges'] });

    return () => {
      socketService.offNewMessage(handler);
      socketService.offMessagesRead(readHandler);
      socketService.offPresence(presenceHandler);
      socketService.leaveChat(chatId);
    };
  }, [chatId, token, counterpartId]);

  // Çat açılanda dərhal ən son mesaja (sona) tullan. `messages.length` effekti tək başına
  // etibarsızdır — FlatList elementləri hələ ölçülməyib scrollToEnd sona çatmır. Kontent
  // ölçüsü dəyişəndə (ilk yüklənmə + hər yeni mesaj) sona sürüşdürürük.
  const didInitialScroll = useRef(false);

  // Yalnız ilk yüklənmədən SONRA gələn yeni mesaj animasiya ilə sürüşsün.
  // İlk açılışda animasiya "yuxarıdan-aşağı sürüşmə" effekti yaradırdı — onu kəsirik ki,
  // söhbət birbaşa son mesajın olduğu yerdə görünsün.
  useEffect(() => {
    if (messages.length > 0 && didInitialScroll.current) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const onListContentSizeChange = () => {
    if (messages.length === 0) return;
    // İlk dəfə animasiyasız (dərhal) sona tullan, sonrakılar üçün animasiyalı.
    listRef.current?.scrollToEnd({ animated: didInitialScroll.current });
    didInitialScroll.current = true;
  };

  // Klaviatura açılanda son mesaj input barının/klaviaturanın arxasında gizlənməsin —
  // siyahını sona sürüşdür ki, yazarkən sonuncu mesaj görünən qalsın.
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvt, () => {
      if (messages.length > 0) {
        // Klaviatura animasiyası bitəndən sonra sona sürüşməsi daha etibarlıdır.
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      }
    });
    return () => sub.remove();
  }, [messages.length]);
  // Çat dəyişəndə ilk-scroll bayrağını sıfırla (yeni söhbət yenidən sona tullansın).
  useEffect(() => {
    didInitialScroll.current = false;
  }, [chatId]);

  // Mesajı OPTİMİSTİK göndərir: dərhal ekranda göstər, sonra serverlə uzlaşdır.
  // Köhnə/yavaş cihazlarda POST serverə çatıb mesajı yazır, amma cavab gec gəlir —
  // optimistik göstərmə "getmədi" qavrayışını aradan qaldırır. Dublikat-yaradan socket
  // fallback-i çıxarıldı (REST əsas yoldur; 1.5s poll onsuz da real vəziyyəti uzlaşdırır).
  const deliver = async (content: string, type: 'text' | 'sticker' = 'text') => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    addMessage({
      id: tempId,
      content,
      type: type as any,
      sender: { id: user?.id ?? '', name: user?.name ?? '' },
      createdAt: new Date().toISOString(),
      isRead: false,
      pending: true,
    } as any);
    try {
      const saved = await sendChatMessage(chatId, content, type);
      // Uğur: müvəqqətini real mesajla əvəz et (poll artıq gətiribsə dublikat olmur).
      if (saved?.id) replaceMessage(tempId, saved as any);
      else removeMessage(tempId); // server null qaytardı → poll uzlaşdıracaq
    } catch {
      // Həqiqətən alınmadı: müvəqqətini sil (poll əslində yazılıbsa real mesajı gətirər).
      removeMessage(tempId);
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

  const handleReport = async () => {
    if (!counterpartId) return;
    try {
      await reportContent({ targetId: counterpartId, targetType: 'user', reason: 'chat' });
      Alert.alert(t('chat.reportDoneTitle'), t('chat.reportDoneMsg'));
    } catch {
      Alert.alert(t('booking.reviewNoticeTitle'), t('chat.reportFailed'));
    }
  };

  const handleMenu = () => {
    Alert.alert(name, undefined, [
      { text: t('chat.menuReport'), style: 'destructive', onPress: handleReport },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerAvatarWrap}>
              {counterpartAvatar ? (
                <Image source={{ uri: counterpartAvatar }} style={styles.headerAvatar} />
              ) : (
                <LinearGradient colors={GRADIENT} style={styles.headerAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.headerAvatarInitial}>{initial}</Text>
                </LinearGradient>
              )}
              {presence.online && <View style={styles.onlineDot} />}
            </View>
            <View>
              <Text style={styles.headerName}>{name}</Text>
              <Text style={[styles.headerStatus, !presence.online && styles.headerStatusOffline]}>{presenceLabel}</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7} hitSlop={8} onPress={handleMenu}>
            <Ionicons name="ellipsis-vertical" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={listRef}
            style={styles.msgFlex}
            data={messages}
            keyExtractor={(m) => m.id}
            onContentSizeChange={onListContentSizeChange}
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

  msgFlex: { flex: 1 },
  // Alt boşluq: son mesaj input barın arxasında yarımçıq qalmasın (scrollToEnd sonu tam açsın).
  msgList: { paddingTop: 16, paddingBottom: 24, paddingHorizontal: 4 },

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
