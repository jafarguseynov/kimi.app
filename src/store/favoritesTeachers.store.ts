import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { getFavoriteTeacherIds, toggleFavoriteTeacher } from '../api/user.api';

const KEY = 'favorite_teacher_ids';

interface FavoriteTeachersState {
  ids: Set<string>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  syncFromServer: () => Promise<void>;
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
    // Əvvəlcə lokal keşi yüklə (sürətli), sonra serverdən reconcile et.
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      if (raw) set({ ids: new Set<string>(JSON.parse(raw)) });
    } catch {}
    set({ hydrated: true });
    get().syncFromServer();
  },
  // Server favorit siyahısını mənbə kimi götür (giriş varsa). Ban/çıxış halında sakit keçir.
  syncFromServer: async () => {
    try {
      const serverIds = await getFavoriteTeacherIds();
      if (Array.isArray(serverIds)) {
        const next = new Set(serverIds);
        set({ ids: next });
        persist(next);
      }
    } catch {}
  },
  toggle: (id) => {
    const prev = get().ids;
    const next = new Set(prev);
    const wasFav = next.has(id);
    if (wasFav) next.delete(id);
    else next.add(id);
    set({ ids: next });
    persist(next);
    // Serverə yaz (level favorit sayına təsir edir). Xəta olarsa geri qaytar.
    toggleFavoriteTeacher(id).catch(() => {
      const revert = new Set(get().ids);
      if (wasFav) revert.add(id);
      else revert.delete(id);
      set({ ids: revert });
      persist(revert);
    });
  },
  isFavorite: (id) => get().ids.has(id),
}));
