import apiClient from './client';

/**
 * MÜƏLLİM PAKETİNİN VƏZİYYƏTİ.
 *
 * ⚠️ Burada `useEntitlements().isPremium` İŞLƏNMİR: backend-də müəllim ROLU
 * özü premium sayılır (tətbiqdaxili AI/imtahan funksiyaları üçün), ona görə
 * hər müəllim üçün `premiumActive: true` qayıdır. Satış səhifəsi ona baxsaydı
 * heç kimə paket təklif etməzdi. Bu endpoint isə şagird sorğusu / rezervasiya
 * qapısı ilə EYNİ mənbələrə baxır (müəllim paketi + abunəlik sətri + köhnə
 * `premiumUntil`).
 */
export interface TeacherPlanState {
  active: boolean;
  source: 'teacher_plan' | 'subscription' | 'legacy_profile' | 'none';
  /** ISO tarix. null + active=true → müddətsiz. */
  until: string | null;
  unlimited: boolean;
  planKey: string | null;
  planName: string | null;
}

export const getTeacherPlanState = () =>
  apiClient.get<TeacherPlanState>('/teacher-plan/me').then((r) => r.data);
