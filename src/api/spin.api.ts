import client from './client';

export type SpinRewardType = 'xp' | 'coin' | 'premium' | 'book' | 'tablet' | 'surprise';
export type SpinRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface SpinResult {
  label: string;
  rarity: SpinRarity;
  rewardType: SpinRewardType;
  amount?: number;
  streak: number;
  isBonusDay: boolean;
  pityTriggered?: boolean;
}

/**
 * Records a spin result on the backend.
 * Endpoint is not yet implemented — the call is best-effort: it silently
 * no-ops on failure so the demo flow is unaffected. Once `/spin/log` lands
 * on the server, physical rewards (Tablet/Dərslik) will appear in the
 * admin panel automatically.
 */
export const logSpin = async (result: SpinResult): Promise<void> => {
  try {
    await client.post('/spin/log', result);
  } catch {
    // Endpoint not yet available — ignore.
  }
};
