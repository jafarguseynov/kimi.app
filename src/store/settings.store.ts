import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type AppLanguage = 'az' | 'en' | 'ru';

const LANG_KEY = 'app_language';
const PUSH_KEY = 'push_enabled';

interface SettingsState {
  language: AppLanguage;
  hydrated: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  notificationPrefs: Record<string, boolean>;
  hydrate: () => Promise<void>;
  setLanguage: (lang: AppLanguage) => void;
  setPushEnabled: (v: boolean) => void;
  setEmailEnabled: (v: boolean) => void;
  setNotificationPrefs: (prefs: Record<string, boolean>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'az',
  hydrated: false,
  pushEnabled: true,
  emailEnabled: false,
  notificationPrefs: {},
  hydrate: async () => {
    let language: AppLanguage | null = null;
    let pushEnabled = true;
    try {
      const raw = await SecureStore.getItemAsync(LANG_KEY);
      if (raw === 'az' || raw === 'en' || raw === 'ru') language = raw;
    } catch {}
    try {
      const rawPush = await SecureStore.getItemAsync(PUSH_KEY);
      if (rawPush === '0') pushEnabled = false;
    } catch {}
    set({ ...(language ? { language } : {}), pushEnabled, hydrated: true });
  },
  setLanguage: (language) => {
    set({ language });
    SecureStore.setItemAsync(LANG_KEY, language).catch(() => {});
  },
  setPushEnabled: (pushEnabled) => {
    set({ pushEnabled });
    SecureStore.setItemAsync(PUSH_KEY, pushEnabled ? '1' : '0').catch(() => {});
  },
  setEmailEnabled: (emailEnabled) => set({ emailEnabled }),
  setNotificationPrefs: (notificationPrefs) => set({ notificationPrefs }),
}));
