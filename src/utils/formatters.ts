export const formatCurrency = (amount: number, currency = 'AZN') =>
  `${amount.toFixed(2)} ${currency}`;

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('az-AZ', { day: '2-digit', month: 'long', year: 'numeric' });

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const formatPercent = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100);
