import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// "Başlanğıc yol xəritəsi" + ilk açılış turu üçün yerli vəziyyət.
// Məqsəd: yeni istifadəçi tətbiqə girəndə "hara girim, nə edim?" sualı yaranmasın.
const KEY = 'get_started_state_v1';

interface GetStartedState {
  aiVisited: boolean;       // AI Mentora ilk keçid
  teacherVisited: boolean;  // Müəllim siyahısına ilk keçid
  dismissed: boolean;       // İstifadəçi kartı əl ilə bağlayıb
  hasSeenHomeTour: boolean; // İlk açılış spotlight turu göstərilib
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markAiVisited: () => void;
  markTeacherVisited: () => void;
  dismiss: () => void;
  markTourSeen: () => void;
}

const DEFAULTS = {
  aiVisited: false,
  teacherVisited: false,
  dismissed: false,
  hasSeenHomeTour: false,
};

const persist = (state: typeof DEFAULTS) => {
  SecureStore.setItemAsync(KEY, JSON.stringify(state)).catch(() => {});
};

export const useGetStartedStore = create<GetStartedState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ ...DEFAULTS, ...parsed, hydrated: true });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },
  markAiVisited: () => {
    if (get().aiVisited) return;
    set({ aiVisited: true });
    const { aiVisited, teacherVisited, dismissed, hasSeenHomeTour } = get();
    persist({ aiVisited, teacherVisited, dismissed, hasSeenHomeTour });
  },
  markTeacherVisited: () => {
    if (get().teacherVisited) return;
    set({ teacherVisited: true });
    const { aiVisited, teacherVisited, dismissed, hasSeenHomeTour } = get();
    persist({ aiVisited, teacherVisited, dismissed, hasSeenHomeTour });
  },
  dismiss: () => {
    set({ dismissed: true });
    const { aiVisited, teacherVisited, dismissed, hasSeenHomeTour } = get();
    persist({ aiVisited, teacherVisited, dismissed, hasSeenHomeTour });
  },
  markTourSeen: () => {
    if (get().hasSeenHomeTour) return;
    set({ hasSeenHomeTour: true });
    const { aiVisited, teacherVisited, dismissed, hasSeenHomeTour } = get();
    persist({ aiVisited, teacherVisited, dismissed, hasSeenHomeTour });
  },
}));
