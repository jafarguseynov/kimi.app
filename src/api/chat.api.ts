import client from './client';

export interface ChatSummary {
  id: string;
  participant1: { id: string; name: string };
  participant2: { id: string; name: string };
  createdAt: string;
}

export const listChats = (): Promise<ChatSummary[]> =>
  client.get('/chat').then((r) => r.data);

export const getOrCreateChat = (userId2: string): Promise<ChatSummary> =>
  client.post('/chat/create', { userId2 }).then((r) => r.data);

export const getMessages = (chatId: string) =>
  client.get(`/chat/${chatId}/messages`).then((r) => r.data);

// REST fallback — socket bağlantısı qurulmasa belə mesaj göndərir.
export const sendChatMessage = (chatId: string, content: string, type: 'text' | 'sticker' = 'text') =>
  client.post(`/chat/${chatId}/messages`, { content, type }).then((r) => r.data);

// REST fallback — oxu qəbzi (görüldü).
export const markChatRead = (chatId: string) =>
  client.post(`/chat/${chatId}/read`).then((r) => r.data).catch(() => null);
