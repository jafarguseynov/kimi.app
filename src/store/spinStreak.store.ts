import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const KEY = 'spin_streak_v1';
const STREAK_BONUS_DAY = 7;

const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
};

interface SpinStreakState {
  streak: number;
  lastSpinDate: string | null;
  // pity counter — spins since last rare+
  spinsSinceRarePlus: number;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  registerSpin: (gotRarePlus: boolean) => { newStreak: number; isBonusDay: boolean };
  isBonusDay: () => boolean;
  shouldGuaranteeRarePlus: () => boolean;
  resetPity: () => void;
}

const persist = (s: { streak: number; lastSpinDate: string | null; spinsSinceRarePlus: number }) => {
  SecureStore.setItemAsync(
    KEY,
    JSON.stringify({ streak: s.streak, lastSpinDate: s.lastSpinDate, spinsSinceRarePlus: s.spinsSinceRarePlus }),
  ).catch(() => {});
};

export const useSpinStreakStore = create<SpinStreakState>((set, get) => ({
  streak: 0,
  lastSpinDate: null,
  spinsSinceRarePlus: 0,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        set({
          streak: Number(d.streak) || 0,
          lastSpinDate: d.lastSpinDate ?? null,
          spinsSinceRarePlus: Number(d.spinsSinceRarePlus) || 0,
          hydrated: true,
        });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },

  registerSpin: (gotRarePlus) => {
    const today = todayKey();
    const yesterday = yesterdayKey();
    const { lastSpinDate, streak, spinsSinceRarePlus } = get();

    let newStreak = streak;
    if (lastSpinDate !== today) {
      if (lastSpinDate === yesterday) newStreak = streak + 1;
      else if (lastSpinDate !== null) newStreak = 1; // seriya pozulub
      else newStreak = 1; // ilk fırlatma
    }

    const next = {
      streak: newStreak,
      lastSpinDate: today,
      spinsSinceRarePlus: gotRarePlus ? 0 : spinsSinceRarePlus + 1,
    };
    set(next);
    persist(next);

    return { newStreak, isBonusDay: newStreak % STREAK_BONUS_DAY === 0 };
  },

  isBonusDay: () => {
    const { streak } = get();
    return streak > 0 && streak % STREAK_BONUS_DAY === 0;
  },

  // After 10 spins without rare+, the 11th is guaranteed
  shouldGuaranteeRarePlus: () => get().spinsSinceRarePlus >= 10,
  resetPity: () => {
    set({ spinsSinceRarePlus: 0 });
    const { streak, lastSpinDate } = get();
    persist({ streak, lastSpinDate, spinsSinceRarePlus: 0 });
  },
}));

export const STREAK_BONUS_THRESHOLD = STREAK_BONUS_DAY;
