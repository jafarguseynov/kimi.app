import client from './client';

export interface Entitlements {
  premiumUntil: string | null;
  premiumActive: boolean;
  xpBoostUntil: string | null;
  xpBoostActive: boolean;
}

export interface RedeemResult extends Entitlements {
  balance: number;
  perkId: string;
}

// Sikkə dükanı perk-i al — serverdə xərc + entitlement (premium/xpboost/kosmetik)
export const redeemPerk = async (perkId: string): Promise<RedeemResult> => {
  const res = await client.post('/shop/redeem', { perkId });
  return res.data;
};

// Aktiv entitlement-lər (premium / xp booster)
export const getEntitlements = async (): Promise<Entitlements> => {
  const res = await client.get('/shop/entitlements');
  return res.data;
};
