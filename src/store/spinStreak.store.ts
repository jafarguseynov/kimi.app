import { create } from 'zustand';

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

  registerSpin: (gotRarePlus: boolean) => { newStreak: number; isBonusDay: boolean };
  isBonusDay: () => boolean;
  shouldGuaranteeRarePlus: () => boolean;
  resetPity: () => void;
}

export const useSpinStreakStore = create<SpinStreakState>((set, get) => ({
  streak: 3, // demo: seeded for visibility
  lastSpinDate: null,
  spinsSinceRarePlus: 0,

  registerSpin: (gotRarePlus) => {
    const today = todayKey();
    const yesterday = yesterdayKey();
    const { lastSpinDate, streak, spinsSinceRarePlus } = get();

    let newStreak = streak;
    if (lastSpinDate !== today) {
      if (lastSpinDate === yesterday) newStreak = streak + 1;
      else if (lastSpinDate !== null) newStreak = 1; // broke streak
      else newStreak = Math.max(streak, 1);
    }

    set({
      streak: newStreak,
      lastSpinDate: today,
      spinsSinceRarePlus: gotRarePlus ? 0 : spinsSinceRarePlus + 1,
    });

    return { newStreak, isBonusDay: newStreak % STREAK_BONUS_DAY === 0 };
  },

  isBonusDay: () => {
    const { streak } = get();
    return streak > 0 && streak % STREAK_BONUS_DAY === 0;
  },

  // After 10 spins without rare+, the 11th is guaranteed
  shouldGuaranteeRarePlus: () => get().spinsSinceRarePlus >= 10,
  resetPity: () => set({ spinsSinceRarePlus: 0 }),
}));

export const STREAK_BONUS_THRESHOLD = STREAK_BONUS_DAY;
