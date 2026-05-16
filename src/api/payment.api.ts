import client from './client';

export interface WalletData {
  id: string;
  balance: number;
  currency: string;
}

export interface TransactionItem {
  id: string;
  type: 'topup' | 'spend' | 'earn' | 'refund' | 'withdraw';
  amount: number;
  description: string | null;
  createdAt: string;
}

export const getWallet = async (): Promise<WalletData> => {
  const res = await client.get('/payment/wallet');
  return res.data;
};

export const getTransactions = async (): Promise<TransactionItem[]> => {
  const res = await client.get('/payment/transactions');
  return res.data;
};

export const topUp = async (amount: number): Promise<{ balance: number }> => {
  const res = await client.post('/payment/wallet/topup', { amount });
  return res.data;
};

export const withdraw = async (amount: number, reference?: string): Promise<{ balance: number }> => {
  const res = await client.post('/payment/withdraw', { amount, reference });
  return res.data;
};
