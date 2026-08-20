import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Capability, Entitlements, LimitState,
  getEntitlements, getMonetizationConfig,
} from '../api/monetization.api';

/**
 * Premium statusunun MOBİLDƏKİ yeganə oxu nöqtəsi.
 *
 * Vacib: bu hook yalnız GÖSTƏRİŞ üçündür. Backend hər qorunan əməliyyatda
 * eyni yoxlamanı özü aparır — yəni "düyməni gizlətmək" heç vaxt yeganə
 * müdafiə deyil (§4). Hook offline/xəta halında premium VERMİR (fail-closed).
 */
export function useEntitlements() {
  const qc = useQueryClient();

  const query = useQuery<Entitlements>({
    queryKey: ['entitlements'],
    queryFn: getEntitlements,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const data = query.data;

  /** İmkan açıqdırmı. Məlumat yoxdursa FALSE (təhlükəsiz default). */
  const can = useCallback(
    (cap: Capability) => !!data?.capabilities?.includes(cap),
    [data],
  );

  /** Limitli funksiyanın cari vəziyyəti (free istifadəçi üçün "2/5 qalıb"). */
  const limitOf = useCallback(
    (feature: 'exam' | 'ai_request' | 'premium_exam' | 'question'): LimitState | null =>
      data?.limits?.[feature] ?? null,
    [data],
  );

  /** Premium/entitlement dəyişdikdən sonra (alış, trial, ləğv) yenilə. */
  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['entitlements'] });
    // Köhnə shop entitlement sorğusu da premium oxuyur — o da təzələnsin.
    qc.invalidateQueries({ queryKey: ['shop-entitlements'] });
    qc.invalidateQueries({ queryKey: ['subscriptionStatus'] });
    qc.invalidateQueries({ queryKey: ['me'] });
  }, [qc]);

  return {
    entitlements: data ?? null,
    isPremium: !!data?.premiumActive,
    isTrial: data?.status === 'trial',
    /** Ləğv edilib, amma müddət hələ bitməyib. */
    isCancelledButActive: data?.status === 'cancelled' && !!data?.premiumActive,
    trial: data?.trial ?? null,
    can,
    limitOf,
    refresh,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Satış mətnləri, trial parametrləri və platformaya uyğun provayder.
 *
 * Mətnlər admin paneldən dəyişir → OTA lazım gəlmədən kampaniya mətni
 * yenilənə bilir.
 */
export function useMonetizationConfig() {
  return useQuery({
    queryKey: ['monetization-config'],
    queryFn: getMonetizationConfig,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/** Limitin sıfırlanmasına qalan vaxtı insani formata çevirir. */
export function formatResetIn(ms: number, t: (k: string, p?: any) => string): string {
  const hours = Math.ceil(ms / 3600000);
  if (hours <= 1) return t('premium.resetSoon');
  if (hours < 24) return t('premium.resetHours', { hours });
  return t('premium.resetDays', { days: Math.ceil(hours / 24) });
}
