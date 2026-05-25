import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const KEY = 'favorite_teacher_ids';

interface FavoriteTeachersState {
  ids: Set<string>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const persist = (ids: Set<string>) => {
  SecureStore.setItemAsync(KEY, JSON.stringify(Array.from(ids))).catch(() => {});
};

export const useFavoriteTeachersStore = create<FavoriteTeachersState>((set, get) => ({
  ids: new Set<string>(),
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        set({ ids: new Set(arr), hydrated: true });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },
  toggle: (id) => {
    const next = new Set(get().ids);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ ids: next });
    persist(next);
  },
  isFavorite: (id) => get().ids.has(id),
}));
