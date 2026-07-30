/**
 * Kartlarda göstərmək üçün qısa ad: ad tam, soyad yalnız ilk hərf + nöqtə.
 * "Elvin Quliyev" → "Elvin Q." ; "Nurcan Hüseynova" → "Nurcan H." ; tək söz → olduğu kimi.
 */
export const shortName = (full?: string): string => {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase();
  return lastInitial ? `${first} ${lastInitial}.` : first;
};
