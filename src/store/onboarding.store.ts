import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const KEY = 'pending_teacher_setup';

interface OnboardingState {
  pendingTeacherSetup: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPendingTeacherSetup: (v: boolean) => void;
}

const persist = (v: boolean) => {
  SecureStore.setItemAsync(KEY, v ? '1' : '0').catch(() => {});
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  pendingTeacherSetup: false,
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      set({ pendingTeacherSetup: raw === '1', hydrated: true });
      return;
    } catch {}
    set({ hydrated: true });
  },
  setPendingTeacherSetup: (v) => {
    set({ pendingTeacherSetup: v });
    persist(v);
  },
}));
