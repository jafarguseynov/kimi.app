// Müəllim səviyyəsi (level) → nişan meta məlumatı (rəng + ikon + i18n açarı).
// Level 0 (Yeni) üçün nişan göstərilmir (kart qarışmasın) — yalnız 1/2/3.

import { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface LevelMeta {
  key: string;      // i18n açarı: teacherLevel.<key>
  bg: string;       // nişan fonu
  fg: string;       // nişan mətn/ikon rəngi
  icon: IoniconName;
}

// index = level (0..3)
export const LEVEL_META: (LevelMeta | null)[] = [
  null, // 0 — Yeni (nişansız)
  { key: 'good', bg: '#DCFCE7', fg: '#15803D', icon: 'ribbon' },       // 1 — Yaxşı (yaşıl)
  { key: 'great', bg: '#DBEAFE', fg: '#1D4ED8', icon: 'medal' },       // 2 — Əla (mavi)
  { key: 'super', bg: '#EDE9FE', fg: '#6D28D9', icon: 'trophy' },      // 3 — Super (bənövşəyi)
];

export function levelMeta(level?: number): LevelMeta | null {
  if (level == null || level <= 0 || level > 3) return null;
  return LEVEL_META[level] ?? null;
}
