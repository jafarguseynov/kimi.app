import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const KEY = 'spin_wheel_v1';

const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export type HistoryEntry = {
  id: string;
  label: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  at: number;
};

interface SpinWheelState {
  spinsLeft: number;
  coins: number;
  stars: number;
  history: HistoryEntry[];
  lastResetDate: string | null;
  ownedShopItems: string[];
  hydrated: boolean;

  hydrate: () => Promise<void>;
  ensureDailyReset: () => void;
  decrementSpin: () => void;
  addCoins: (n: number) => void;
  addStars: (n: number) => void;
  setCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;
  grantExtraSpin: () => void;
  markShopItemOwned: (id: string) => void;
  addHistoryEntry: (e: HistoryEntry) => void;
}

// Yalnız davamlı (qalıcı) sahələri yaddaşa yaz — qazanılan sikkə/XP və tarixçə
// tətbiq arxa fonda öldürülsə belə itməsin.
type Persisted = Pick<SpinWheelState, 'coins' | 'stars' | 'history' | 'lastResetDate' | 'ownedShopItems'>;

const persist = (s: SpinWheelState) => {
  const data: Persisted = {
    coins: s.coins,
    stars: s.stars,
    history: s.history.slice(0, 20),
    lastResetDate: s.lastResetDate,
    ownedShopItems: s.ownedShopItems,
  };
  SecureStore.setItemAsync(KEY, JSON.stringify(data)).catch(() => {});
};

export const useSpinWheelStore = create<SpinWheelState>((set, get) => ({
  spinsLeft: 1,
  coins: 0,
  stars: 0,
  history: [],
  lastResetDate: null,
  ownedShopItems: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      if (raw) {
        const d: Partial<Persisted> = JSON.parse(raw);
        set({
          coins: Number(d.coins) || 0,
          stars: Number(d.stars) || 0,
          history: Array.isArray(d.history) ? d.history : [],
          lastResetDate: d.lastResetDate ?? null,
          ownedShopItems: Array.isArray(d.ownedShopItems) ? d.ownedShopItems : [],
          hydrated: true,
        });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },

  ensureDailyReset: () => {
    const today = todayKey();
    const { lastResetDate } = get();
    if (lastResetDate !== today) {
      set({ spinsLeft: 1, lastResetDate: today });
      persist(get());
    }
  },

  decrementSpin: () => set((s) => ({ spinsLeft: Math.max(0, s.spinsLeft - 1) })),

  addCoins: (n) => { set((s) => ({ coins: s.coins + n })); persist(get()); },
  addStars: (n) => { set((s) => ({ stars: s.stars + n })); persist(get()); },

  // Serverdəki real cüzdan balansını göstərmək üçün (load zamanı sinxronlaşdırılır).
  setCoins: (n) => { set({ coins: Math.max(0, Math.floor(n)) }); persist(get()); },

  spendCoins: (n) => {
    if (get().coins < n) return false;
    set((s) => ({ coins: s.coins - n }));
    persist(get());
    return true;
  },

  grantExtraSpin: () => set((s) => ({ spinsLeft: s.spinsLeft + 1 })),

  markShopItemOwned: (id) => {
    set((s) => (s.ownedShopItems.includes(id) ? s : { ownedShopItems: [...s.ownedShopItems, id] }));
    persist(get());
  },

  addHistoryEntry: (e) => {
    set((s) => ({ history: [e, ...s.history].slice(0, 20) }));
    persist(get());
  },
}));
