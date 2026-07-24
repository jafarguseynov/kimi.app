import api from './client';

export interface PromoPreview {
  valid: boolean;
  reason?: string;
  code?: string;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
}

// Seçilmiş paket üçün endirim kodunu yoxla (checkout önizləməsi).
export const validatePromo = (code: string, planKey: string) =>
  api.post<PromoPreview>('/promo/validate', { code, planKey }).then((r) => r.data);

// İstifadəçinin qeydiyyatda yazdığı promo kodu (checkout-da avtomatik doldurmaq üçün).
export const getMyPromo = () =>
  api.get<{ code: string | null }>('/promo/mine').then((r) => r.data);
