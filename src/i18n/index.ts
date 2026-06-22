import { useCallback } from 'react';
import { useSettingsStore, AppLanguage } from '../store/settings.store';
import { az } from './translations/az';
import { ru } from './translations/ru';
import { en } from './translations/en';

export type Dict = { [key: string]: string | Dict };

const DICTS: Record<AppLanguage, Dict> = { az, ru, en };

function lookup(dict: Dict, path: string[]): string | undefined {
  let node: string | Dict | undefined = dict;
  for (const seg of path) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = node[seg];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`,
  );
}

/**
 * Açar yolu (məs. 'nav.home') ilə tərcümə qaytarır.
 * Düşmə sırası: cari dil → Azərbaycan dili → açarın özü.
 */
export function translate(
  lang: AppLanguage,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const path = key.split('.');
  const hit = lookup(DICTS[lang], path) ?? lookup(DICTS.az, path) ?? key;
  return interpolate(hit, vars);
}

/**
 * Komponentlərdə istifadə üçün reaktiv tərcümə hook-u.
 * Dil dəyişəndə store yenilənir → komponent yenidən render olunur.
 */
export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(language, key, vars),
    [language],
  );
  return { t, language };
}
