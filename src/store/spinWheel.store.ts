import { create } from 'zustand';

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

  ensureDailyReset: () => void;
  decrementSpin: () => void;
  addCoins: (n: number) => void;
  addStars: (n: number) => void;
  spendCoins: (n: number) => boolean;
  grantExtraSpin: () => void;
  addHistoryEntry: (e: HistoryEntry) => void;
}

export const useSpinWheelStore = create<SpinWheelState>((set, get) => ({
  spinsLeft: 1,
  coins: 0,
  stars: 1250,
  history: [],
  lastResetDate: null,

  ensureDailyReset: () => {
    const today = todayKey();
    const { lastResetDate } = get();
    if (lastResetDate !== today) {
      set({ spinsLeft: 1, lastResetDate: today });
    }
  },

  decrementSpin: () => set((s) => ({ spinsLeft: Math.max(0, s.spinsLeft - 1) })),
  addCoins: (n) => set((s) => ({ coins: s.coins + n })),
  addStars: (n) => set((s) => ({ stars: s.stars + n })),

  spendCoins: (n) => {
    if (get().coins < n) return false;
    set((s) => ({ coins: s.coins - n }));
    return true;
  },

  grantExtraSpin: () => set((s) => ({ spinsLeft: s.spinsLeft + 1 })),

  addHistoryEntry: (e) =>
    set((s) => ({ history: [e, ...s.history].slice(0, 20) })),
}));
