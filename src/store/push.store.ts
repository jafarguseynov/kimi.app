import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const KEY = 'push_priming_seen';

interface PushState {
  // İcazə priming ekranı bir dəfə göstərilibmi (təkrar soruşmamaq üçün).
  primingSeen: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPrimingSeen: (v: boolean) => void;
}

export const usePushStore = create<PushState>((set) => ({
  primingSeen: false,
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      set({ primingSeen: raw === '1', hydrated: true });
      return;
    } catch {}
    set({ hydrated: true });
  },
  setPrimingSeen: (v) => {
    set({ primingSeen: v });
    SecureStore.setItemAsync(KEY, v ? '1' : '0').catch(() => {});
  },
}));
