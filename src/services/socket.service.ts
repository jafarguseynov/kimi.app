import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/config';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) return this.socket;

    const baseUrl = API_BASE_URL.replace('/api', '');
    this.socket = io(`${baseUrl}/chat`, {
      auth: { token },
      // websocket üstün tutulur, lakin proxy upgrade-i bloklayarsa polling-ə düşür
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinChat(chatId: string) {
    this.socket?.emit('joinChat', chatId);
  }

  leaveChat(chatId: string) {
    this.socket?.emit('leaveChat', chatId);
  }

  sendMessage(chatId: string, content: string, type: 'text' | 'sticker' = 'text') {
    this.socket?.emit('sendMessage', { chatId, content, type });
  }

  onNewMessage(callback: (msg: any) => void) {
    this.socket?.on('newMessage', callback);
  }

  offNewMessage(callback: (msg: any) => void) {
    this.socket?.off('newMessage', callback);
  }

  // ─── Presence (onlayn/offline + son görülmə) ───────────────────────────
  subscribePresence(userId: string) {
    this.socket?.emit('subscribePresence', userId, (res: any) => {
      if (res?.userId) this.presenceCallbacks.forEach((cb) => cb(res));
    });
  }

  private presenceCallbacks = new Set<(p: any) => void>();
  onPresence(callback: (p: { userId: string; online: boolean; lastSeenAt: string | null }) => void) {
    this.presenceCallbacks.add(callback);
    this.socket?.on('presence', callback);
  }
  offPresence(callback: (p: any) => void) {
    this.presenceCallbacks.delete(callback);
    this.socket?.off('presence', callback);
  }

  // ─── Oxu qəbzi (görüldü) ───────────────────────────────────────────────
  markRead(chatId: string) {
    this.socket?.emit('markRead', chatId);
  }
  onMessagesRead(callback: (p: { chatId: string; readerId: string }) => void) {
    this.socket?.on('messagesRead', callback);
  }
  offMessagesRead(callback: (p: any) => void) {
    this.socket?.off('messagesRead', callback);
  }
}

export const socketService = new SocketService();
