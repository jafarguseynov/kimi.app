import { create } from 'zustand';

export type AppLanguage = 'az' | 'en' | 'ru';

interface SettingsState {
  language: AppLanguage;
  pushEnabled: boolean;
  emailEnabled: boolean;
  notificationPrefs: Record<string, boolean>;
  setLanguage: (lang: AppLanguage) => void;
  setPushEnabled: (v: boolean) => void;
  setEmailEnabled: (v: boolean) => void;
  setNotificationPrefs: (prefs: Record<string, boolean>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'az',
  pushEnabled: true,
  emailEnabled: false,
  notificationPrefs: {},
  setLanguage: (language) => set({ language }),
  setPushEnabled: (pushEnabled) => set({ pushEnabled }),
  setEmailEnabled: (emailEnabled) => set({ emailEnabled }),
  setNotificationPrefs: (notificationPrefs) => set({ notificationPrefs }),
}));
