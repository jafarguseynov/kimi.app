import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const KEY = 'recent_teachers_v1';

export interface RecentTeacher {
  id: string;
  name: string;
  avatarUrl?: string;
  subject?: string;
  hourlyRate?: number;
  rating?: number;
  experience?: string;
  isVerified?: boolean;
  viewedAt: number;
}

interface RecentTeachersState {
  list: RecentTeacher[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  push: (t: Omit<RecentTeacher, 'viewedAt'>) => void;
  clear: () => void;
}

const MAX = 20;

const persist = (list: RecentTeacher[]) => {
  SecureStore.setItemAsync(KEY, JSON.stringify(list)).catch(() => {});
};

export const useRecentTeachersStore = create<RecentTeachersState>((set, get) => ({
  list: [],
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      if (raw) {
        const arr: RecentTeacher[] = JSON.parse(raw);
        set({ list: arr, hydrated: true });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },
  push: (t) => {
    if (!t.id) return;
    const filtered = get().list.filter((x) => x.id !== t.id);
    const next = [{ ...t, viewedAt: Date.now() }, ...filtered].slice(0, MAX);
    set({ list: next });
    persist(next);
  },
  clear: () => {
    set({ list: [] });
    SecureStore.deleteItemAsync(KEY).catch(() => {});
  },
}));
