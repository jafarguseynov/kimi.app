import { useEffect, useState } from 'react';
import { getExamConfig, ExamConfigBundle, ResolvedExamConfig } from '../api/exam.api';

/**
 * Admin paneldən idarə olunan imtahan parametrlərini yükləyir.
 * Şəbəkə xətası və ya boş cavab olarsa `null` qaytarır — ekranlar
 * öz hardcode dəyərlərinə düşürlər.
 */
export function useExamConfig(): ExamConfigBundle | null {
  const [bundle, setBundle] = useState<ExamConfigBundle | null>(null);

  useEffect(() => {
    let alive = true;
    getExamConfig()
      .then((data) => {
        if (alive && data?.global) setBundle(data);
      })
      .catch(() => {
        /* offline / köhnə backend — fallback işləyəcək */
      });
    return () => {
      alive = false;
    };
  }, []);

  return bundle;
}

/**
 * Verilmiş imtahan növü / kateqoriya üçün effektiv konfiqurasiyanı seçir.
 * Override yoxdursa qlobala düşür; bundle yoxdursa `null`.
 */
export function pickExamConfig(
  bundle: ExamConfigBundle | null,
  opts: { type?: string; category?: string } = {},
): ResolvedExamConfig | null {
  if (!bundle) return null;
  if (opts.category && bundle.categories[opts.category]) return bundle.categories[opts.category];
  if (opts.type && bundle.types[opts.type]) return bundle.types[opts.type];
  return bundle.global;
}
