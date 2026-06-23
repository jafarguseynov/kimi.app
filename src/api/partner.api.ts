import client from './client';

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  linkUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  socials: Record<string, string> | null;
  sortOrder: number;
  isActive: boolean;
}

export const getPartners = (): Promise<Partner[]> =>
  client.get('/partners').then((r) => r.data);
