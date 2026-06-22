import { create } from 'zustand';
import api from '../api/client';

interface FeatureFlagState {
  flags: Record<string, boolean>;
  loaded: boolean;
  loadFlags: () => Promise<void>;
  isEnabled: (key: string) => boolean;
}

export const useFeatureFlagStore = create<FeatureFlagState>((set, get) => ({
  flags: {},
  loaded: false,
  loadFlags: async () => {
    try {
      const { data } = await api.get<Record<string, boolean>>('/feature-flags');
      set({ flags: data, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  isEnabled: (key) => get().flags[key] ?? false,
}));

// Monetizasiya açarları — admin paneldən idarə olunur.
export const FLAGS = {
  subscription: 'monetization_subscription',
  payments: 'monetization_payments',
  withdrawals: 'monetization_withdrawals',
} as const;

// Fail-open: flag yüklənənə qədər və ya açar yoxdursa GÖRÜNÜR sayılır
// (heç nə yanlışlıqla gizlənməsin; admin açıq-aşkar bağlamalıdır).
function visible(flags: Record<string, boolean>, loaded: boolean, key: string): boolean {
  if (!loaded) return true;
  return flags[key] ?? true;
}

/** Komponentlərdə monetizasiya görünüşünü oxumaq üçün rahat hook (flags dəyişəndə yenidən render olur). */
export function useMonetization() {
  const flags = useFeatureFlagStore((s) => s.flags);
  const loaded = useFeatureFlagStore((s) => s.loaded);
  return {
    subscription: visible(flags, loaded, FLAGS.subscription),
    payments: visible(flags, loaded, FLAGS.payments),
    withdrawals: visible(flags, loaded, FLAGS.withdrawals),
  };
}
