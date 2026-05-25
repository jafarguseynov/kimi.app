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
