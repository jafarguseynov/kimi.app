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
