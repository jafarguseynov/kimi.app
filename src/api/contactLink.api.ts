import apiClient from './client';

/**
 * Əlaqə linkləri — admin paneldən idarə olunur (Əlaqə linkləri səhifəsi).
 * Yeni kanal əlavə etmək üçün mobil yeniləmə lazım deyil.
 */
export interface ContactLink {
  id: string;
  /** instagram | whatsapp | tiktok | telegram | x | website | facebook | youtube | email | phone */
  platform: string;
  label: string | null;
  subtitle: string | null;
  url: string;
  sortOrder: number;
  isActive: boolean;
}

export const getContactLinks = () =>
  apiClient.get<ContactLink[]>('/contact-links').then((r) => r.data);
