import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// Giriş karuseli (WelcomeScreen) yalnız ilk açılışda — tətbiq təzə quraşdırılanda —
// göstərilməlidir. İstifadəçi qeydiyyatdan keçib çıxış edəndə hər dəfə bu ekranı
// yenidən görməsin: bir dəfə keçəndən sonra bayraq yadda saxlanır və AuthNavigator
// birbaşa Login-dən başlayır.
const KEY = 'has_seen_welcome_v1';

interface WelcomeState {
  hasSeenWelcome: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markWelcomeSeen: () => void;
}

export const useWelcomeStore = create<WelcomeState>((set, get) => ({
  hasSeenWelcome: false,
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      set({ hasSeenWelcome: raw === '1', hydrated: true });
      return;
    } catch {}
    set({ hydrated: true });
  },
  markWelcomeSeen: () => {
    if (get().hasSeenWelcome) return;
    set({ hasSeenWelcome: true });
    SecureStore.setItemAsync(KEY, '1').catch(() => {});
  },
}));
