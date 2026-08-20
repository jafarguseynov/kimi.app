import apiClient from './client';

/** Dəstək müraciəti — «Problemi bildir» forması. Admin paneldə görünür. */
export interface SupportTicket {
  id: string;
  type: string;
  subject: string;
  description: string;
  attachmentUrl: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminNote: string | null;
  createdAt: string;
}

export interface CreateTicketInput {
  type: string;
  subject: string;
  description: string;
  attachmentUrl?: string | null;
  appVersion?: string | null;
  platform?: string | null;
}

export const createSupportTicket = (data: CreateTicketInput) =>
  apiClient.post<SupportTicket>('/support/tickets', data).then((r) => r.data);

export const getMySupportTickets = () =>
  apiClient.get<SupportTicket[]>('/support/tickets').then((r) => r.data);
