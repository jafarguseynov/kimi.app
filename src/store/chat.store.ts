import { create } from 'zustand';

interface ChatMessage {
  id: string;
  content: string;
  sender: { id: string; name: string };
  createdAt: string;
  isRead: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  markReadBy: (readerId: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) =>
    set((s) => (s.messages.some((m) => m.id === msg.id) ? s : { messages: [...s.messages, msg] })),
  // readerId qarşı tərəfdir → onun göndərmədiyi (yəni bizim) mesajlar "görüldü" olur.
  markReadBy: (readerId) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.sender.id !== readerId && !m.isRead ? { ...m, isRead: true } : m)),
    })),
  clearChat: () => set({ messages: [], activeChatId: null }),
}));
