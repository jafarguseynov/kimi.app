import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import type { Certificate } from '../api/certificate.api';

/**
 * SERTİFİKAT SƏVİYYƏSİ.
 *
 * Astanalar artıq SERVERDƏ, admin idarəli `certificate_settings` sətrindədir və
 * hər sertifikat cavabı hazır `tier` daşıyır (`{ key, label, min }`). Mobil
 * tərəf ilk növbədə həmin dəyəri işlədir — beləcə admin astananı dəyişdikdə
 * tətbiqə OTA göndərmək lazım gəlmir.
 *
 * Aşağıdakı `FALLBACK_TIERS` yalnız köhnə/keşlənmiş cavablar üçün ehtiyatdır
 * (server `tier` göndərməyibsə). Dəyərlər serverin ilkin astanaları ilə eynidir.
 */

export type TierKey = 'champion' | 'gold' | 'silver' | 'bronze' | 'participant';
type IconName = keyof typeof Ionicons.glyphMap;

export interface TierMeta {
  key: TierKey;
  /** Bu səviyyə üçün minimum faiz (serverdən gəldikdə real dəyər). */
  min: number;
  labelKey: string;
  icon: IconName;
  color: string;
}

/** Görünüş — səviyyə adının tərcüməsi, ikonu və rəngi. */
const TIER_STYLE: Record<TierKey, { labelKey: string; icon: IconName; color: string }> = {
  champion: { labelKey: 'cert.tierChampion', icon: 'trophy', color: '#D4901F' },
  gold: { labelKey: 'cert.tierGold', icon: 'medal', color: '#C08A2E' },
  silver: { labelKey: 'cert.tierSilver', icon: 'ribbon', color: '#7A8A99' },
  bronze: { labelKey: 'cert.tierBronze', icon: 'ribbon-outline', color: '#A56A3A' },
  participant: { labelKey: 'cert.tierParticipant', icon: 'school', color: Colors.textSecondary },
};

/** Server `tier` göndərməyəndə istifadə olunan ehtiyat astanalar. */
const FALLBACK_TIERS: { key: TierKey; min: number }[] = [
  { key: 'champion', min: 90 },
  { key: 'gold', min: 80 },
  { key: 'silver', min: 70 },
  { key: 'bronze', min: 60 },
  { key: 'participant', min: 0 },
];

const meta = (key: TierKey, min: number): TierMeta => ({ key, min, ...TIER_STYLE[key] });

/** Yalnız faizə görə (server məlumatı olmayan yerlərdə). */
export function tierOfPercentage(percentage: number): TierMeta {
  const t = FALLBACK_TIERS.find((x) => percentage >= x.min) ?? FALLBACK_TIERS[FALLBACK_TIERS.length - 1];
  return meta(t.key, t.min);
}

/** Sertifikatın səviyyəsi — serverin dediyi üstündür. */
export function tierOfCertificate(cert: Pick<Certificate, 'percentage' | 'tier'>): TierMeta {
  const key = cert.tier?.key as TierKey | undefined;
  if (key && TIER_STYLE[key]) return meta(key, cert.tier?.min ?? 0);
  return tierOfPercentage(cert.percentage);
}

/**
 * Növbəti səviyyəyə qalan faiz — «5% qalıb Qızıl-a» mətni üçün.
 *
 * Astanalar sertifikatların özündən toplanır (server nə deyibsə o), beləliklə
 * admin astananı dəyişsə hesablama da dərhal düzgün olur. Məlumat çatmazsa
 * ehtiyat astanalara düşür.
 */
export function nextTierGap(
  percentage: number,
  known: { key: TierKey; min: number }[] = [],
): { tier: TierMeta; gap: number } | null {
  const map = new Map<TierKey, number>(FALLBACK_TIERS.map((t) => [t.key, t.min]));
  for (const k of known) if (k?.key && typeof k.min === 'number') map.set(k.key, k.min);

  const ascending = [...map.entries()]
    .map(([key, min]) => ({ key, min }))
    .sort((a, b) => a.min - b.min);

  const next = ascending.find((t) => t.min > percentage);
  if (!next) return null;
  return { tier: meta(next.key, next.min), gap: next.min - percentage };
}
