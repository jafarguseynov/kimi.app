import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/config';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) return this.socket;

    const baseUrl = API_BASE_URL.replace('/api', '');
    this.socket = io(`${baseUrl}/chat`, {
      auth: { token },
      transports: ['websocket'],
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
}

export const socketService = new SocketService();
