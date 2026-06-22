import client from './client';

export type SpinRewardType = 'coin' | 'xp' | 'premium' | 'spin' | 'item';
export type SpinRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface SpinReward {
  id: string;
  label: string;
  type: SpinRewardType;
  value: number;
  weight: number;
  rarity: SpinRarity;
  icon: string;   // Ionicons adı (admin paneldən idarə olunur)
  color: string;  // #RRGGBB
  isActive: boolean;
}

export interface SpinStatus {
  spinsUsed: number;
  spinsLeft: number;
  maxDaily: number;
  bonusSpins: number;
}

export interface SpinResultDto {
  reward: SpinReward;
  log: { id: string; spunAt: string };
}

/** Çarx seqmentləri — admin paneldə idarə olunan aktiv mükafatlar (çəkiyə görə sıralı). */
export const getSpinRewards = async (): Promise<SpinReward[]> => {
  const { data } = await client.get<SpinReward[]>('/spin/rewards');
  return data;
};

/** İstifadəçinin bu günkü spin limiti (bonus daxil). */
export const getSpinStatus = async (): Promise<SpinStatus> => {
  const { data } = await client.get<SpinStatus>('/spin/status');
  return data;
};

/**
 * Serverdə fırlatma — mükafatı SERVER seçir (çəkiyə görə), limiti yoxlayır/azaldır
 * və spin_logs-a yazır (admin paneldə dərhal görünür). Mobil yalnız nəticəni göstərir.
 */
export const spinServer = async (): Promise<SpinResultDto> => {
  const { data } = await client.post<SpinResultDto>('/spin');
  return data;
};
