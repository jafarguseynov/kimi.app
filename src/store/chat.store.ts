import { create } from 'zustand';

interface ChatMessage {
  id: string;
  content: string;
  sender: { id: string; name: string };
  createdAt: string;
  isRead: boolean;
  pending?: boolean; // optimistik (hələ serverdən təsdiq olmayan) mesaj
}

interface ChatState {
  messages: ChatMessage[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  replaceMessage: (tempId: string, real: ChatMessage) => void;
  removeMessage: (id: string) => void;
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
  // Optimistik (müvəqqəti) mesajı serverdən qayıdan real mesajla əvəz et.
  // Real mesaj artıq siyahıda varsa (poll gətirib) sadəcə müvəqqətini sil (dublikat olmasın).
  replaceMessage: (tempId, real) =>
    set((s) => {
      const withoutTemp = s.messages.filter((m) => m.id !== tempId);
      if (withoutTemp.some((m) => m.id === real.id)) return { messages: withoutTemp };
      return { messages: [...withoutTemp, real] };
    }),
  removeMessage: (id) => set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
  // readerId qarşı tərəfdir → onun göndərmədiyi (yəni bizim) mesajlar "görüldü" olur.
  markReadBy: (readerId) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.sender.id !== readerId && !m.isRead ? { ...m, isRead: true } : m)),
    })),
  clearChat: () => set({ messages: [], activeChatId: null }),
}));
