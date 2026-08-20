import { Platform } from 'react-native';
import apiClient from './client';

/**
 * Monetizasiya API-si.
 *
 * ⚠️ Bütün qiymət, limit və premium statusu SERVERDƏN gəlir. Mobil tərəfdə
 * heç bir qiymət hesablanmır, heç bir "premium açılsın" qərarı verilmir —
 * yalnız serverin dediyi göstərilir (§24: iOS/Android/Web eyni mənbə).
 */

/** Serverin platformanı tanıması üçün — provayder seçimi buna bağlıdır. */
const platformHeader = () => ({
  'x-platform': Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
});

// ─────────────────────────── Tiplər ───────────────────────────

export type Capability =
  | 'unlimited_exams' | 'premium_exams' | 'ai_custom_test' | 'unlimited_ai'
  | 'detailed_analytics' | 'weak_topics' | 'recommendations' | 'no_ads'
  | 'premium_leaderboard' | 'priority_support' | 'weekly_report';

export type PaywallSource =
  | 'exam' | 'premium_exam' | 'ai_test' | 'ai_chat' | 'analytics'
  | 'weak_topics' | 'leaderboard' | 'profile' | 'home_banner'
  | 'settings' | 'onboarding' | 'extra_product' | 'other';

export interface LimitState {
  limit: number;
  used: number;
  /** -1 = limitsiz */
  remaining: number;
  unlimited: boolean;
  /** Limitin sıfırlanmasına qalan vaxt (ms) */
  resetsInMs: number;
}

export interface Entitlements {
  premiumActive: boolean;
  status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired' | 'refunded' | 'free';
  source: string;
  until: string | null;
  planKey: string | null;
  planName: string | null;
  provider: string | null;
  autoRenew: boolean;
  cancelledAt: string | null;
  subscriptionId: string | null;
  trial: { active: boolean; used: boolean; eligible: boolean; endsAt: string | null; daysLeft: number };
  capabilities: Capability[];
  limits: Record<string, LimitState>;
  extraProducts: string[];
}

export interface MonetizationConfig {
  currency: string;
  headline: string;
  subtitle: string;
  ctaPrimary: string;
  ctaTrial: string;
  paywallTitle: string;
  trial: { enabled: boolean; days: number; autoStart: boolean; planKey: string | null };
  provider: string;
  /** false → satınalma düymələri göstərilmir (məs. iOS-da App Store 3.1.1). */
  purchasesEnabled: boolean;
  freeLimits: {
    weeklyExams: number; dailyQuestions: number; dailyAiRequests: number;
    weeklyPremiumExams: number; resultAnalysisLevel: 'basic' | 'full';
  };
}

export interface PlanCard {
  id: string;
  key: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  oldPriceDiscount: number | null;
  currency: string;
  durationDays: number;
  billingPeriod: string;
  /** Aylıq ekvivalent — "ayda cəmi X" mətni üçün (serverdə hesablanır). */
  pricePerMonth: number;
  /** REAL qənaət faizi — uydurma deyil, aylıq paketlə müqayisədən çıxır. */
  savingsPercent: number | null;
  comparedPrice: number | null;
  audience: 'all' | 'teacher' | 'student';
  badge: string | null;
  highlighted: boolean;
  features: string[];
  capabilities: Capability[];
  capabilityLabels: string[];
  trialEligible: boolean;
  sortOrder: number;
}

export interface ExtraProductCard {
  id: string; key: string; name: string; description: string | null;
  price: number; oldPrice: number | null; currency: string;
  productType: string; emoji: string | null; badge: string | null;
  features: string[]; accessDays: number; repeatable: boolean;
  owned: boolean; sortOrder: number;
}

export interface CheckoutResult {
  orderId: string;
  reference: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  provider: string;
  /** Hosted checkout ünvanı — WebView/brauzerdə açılır. */
  redirectUrl: string | null;
  /** Mağaza (IAP/Billing) məhsul id-si — native satınalma üçün. */
  nativeProductId: string | null;
  failureReason: string | null;
  success: boolean;
}

// ─────────────────────────── Sorğular ───────────────────────────

export const getEntitlements = () =>
  apiClient.get<Entitlements>('/monetization/me/entitlements').then((r) => r.data);

export const getMonetizationConfig = () =>
  apiClient.get<MonetizationConfig>('/monetization/config', { headers: platformHeader() }).then((r) => r.data);

export const getPremiumPlans = (audience?: 'teacher' | 'student') =>
  apiClient.get<PlanCard[]>('/monetization/plans', { params: { audience } }).then((r) => r.data);

export const getExtraProducts = () =>
  apiClient.get<ExtraProductCard[]>('/monetization/products').then((r) => r.data);

/**
 * Ödəniş axınını başladır.
 *
 * Məbləğ GÖNDƏRİLMİR — serverin özü plandan/məhsuldan hesablayır.
 * `idempotencyKey` təkrar basılan düymənin ikiqat sifariş yaratmasının qarşısını alır.
 */
export const startCheckout = (input: {
  kind: 'subscription' | 'extra_product';
  planKey?: string;
  productKey?: string;
  promoCode?: string;
  paywallSource?: PaywallSource;
  idempotencyKey?: string;
  returnUrl?: string;
}) =>
  apiClient
    .post<CheckoutResult>('/monetization/checkout', input, { headers: platformHeader() })
    .then((r) => r.data);

/** Ödənişi SERVERDƏ doğrulat — müştəri "ödədim" deyəndə qərarı server verir. */
export const verifyOrder = (orderId: string, receipt?: string) =>
  apiClient.post<CheckoutResult>(`/monetization/orders/${orderId}/verify`, { receipt }).then((r) => r.data);

export const getMyOrders = (limit = 50) =>
  apiClient.get('/monetization/orders', { params: { limit } }).then((r) => r.data);

export const getMySubscriptions = () =>
  apiClient.get('/monetization/subscriptions').then((r) => r.data);

export const startTrial = (planKey?: string, paywallSource?: PaywallSource) =>
  apiClient
    .post<{ success: boolean; endsAt: string; days: number; planKey: string }>(
      '/monetization/trial/start', { planKey, paywallSource }, { headers: platformHeader() },
    )
    .then((r) => r.data);

/** Ləğv — premium ödənilmiş müddətin sonuna qədər açıq qalır. */
export const cancelSubscription = (subscriptionId?: string) =>
  apiClient
    .post<{ success: boolean; activeUntil: string; message: string }>(
      '/monetization/subscriptions/cancel', { subscriptionId },
    )
    .then((r) => r.data);

/**
 * Analitika event-i (§21). Yalnız baxış/klik tipləri qəbul olunur —
 * server pul event-lərini müştəridən qəbul etmir.
 * Uğursuzluq əsas axını dayandırmamalıdır → xəta udulur.
 */
export const trackMonetizationEvent = (
  type: 'premium_view' | 'premium_cta_click' | 'paywall_view' | 'paywall_cta_click' | 'extra_product_view',
  meta?: { paywallSource?: PaywallSource; planKey?: string; productKey?: string },
) =>
  apiClient
    .post('/monetization/events', { type, ...meta }, { headers: platformHeader() })
    .then(() => undefined)
    .catch(() => undefined);

// ─────────────────── Paywall xətasının oxunması ───────────────────

/** Backend-in 403 cavabındakı paywall məlumatı. */
export interface PaywallError {
  error: 'PREMIUM_REQUIRED' | 'LIMIT_REACHED';
  message: string;
  capability: Capability;
  paywallSource: PaywallSource;
  trialEligible: boolean;
  /** Yalnız LIMIT_REACHED-də */
  feature?: string;
  limit?: number;
  used?: number;
  resetsInMs?: number;
}

/**
 * Sorğu xətasının paywall xətası olub-olmadığını yoxlayır.
 * Ekranlar bunu işlədib doğru paywall göstərir (hansı funksiyaya görə).
 */
export function asPaywallError(err: any): PaywallError | null {
  const d = err?.response?.data;
  if (err?.response?.status === 403 && (d?.error === 'PREMIUM_REQUIRED' || d?.error === 'LIMIT_REACHED')) {
    return d as PaywallError;
  }
  return null;
}
