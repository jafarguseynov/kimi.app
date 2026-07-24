import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/config';

/**
 * Canlı duel üçün ayrıca socket (backend `/duel` namespace).
 * Chat socket-dən ayrıdır — duel-in öz həyat dövrü var.
 */
class DuelSocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) return this.socket;
    if (this.socket) this.socket.disconnect();
    const baseUrl = API_BASE_URL.replace('/api', '');
    this.socket = io(`${baseUrl}/duel`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      forceNew: true,
    });
    return this.socket;
  }

  get connected() {
    return !!this.socket?.connected;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
  }

  // ─── Matchmaking ───────────────────────────────────────────────
  joinQueue(p: { subject: string; questionCount: number; stake: number }) {
    this.socket?.emit('queue:join', p);
  }
  cancelQueue() {
    this.socket?.emit('queue:cancel');
  }

  // ─── Gedişat ───────────────────────────────────────────────────
  answer(p: { roomId: string; questionIndex: number; optionId: string | null; elapsedMs: number }) {
    this.socket?.emit('duel:answer', p);
  }
  leave(roomId: string) {
    this.socket?.emit('duel:leave', { roomId });
  }

  // ─── Hadisə dinləyiciləri ──────────────────────────────────────
  on(event: string, cb: (...args: any[]) => void) {
    this.socket?.on(event, cb);
  }
  off(event: string, cb?: (...args: any[]) => void) {
    this.socket?.off(event, cb as any);
  }
}

export const duelSocket = new DuelSocketService();
