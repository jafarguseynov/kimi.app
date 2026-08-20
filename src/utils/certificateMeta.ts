import type { Certificate } from '../api/certificate.api';

/**
 * Sertifikat kartının ikinci sətri (fənn · sinif).
 *
 * ⚠️ Niyə sadəcə `subject + grade` yazmırıq: canlı məlumatda imtahan başlığı
 * onsuz da bu hissələri saxlayır — məs. başlıq «Azərbaycan dili · 5-ci sinif».
 * Sadə birləşdirmə kartda TƏKRAR yaradardı:
 *     Azərbaycan dili · 5-ci sinif
 *     Azərbaycan dili · 5-ci sinif
 * Ona görə başlıqda ARTIQ olan hissə ikinci sətirdən çıxarılır; heç nə qalmasa
 * sətir ümumiyyətlə göstərilmir.
 *
 * Şəkilçi qaydası backend-dəki `exam/grade-label.util.ts` ilə eynidir
 * (ahəng qanunu: 6-cı, 10-cu, 3-cü …) — «6-ci sinif» kimi səhvlər olmasın.
 */

const SUFFIX_BY_LAST_DIGIT: Record<string, string> = {
  '0': 'cu', '1': 'ci', '2': 'ci', '3': 'cü', '4': 'cü',
  '5': 'ci', '6': 'cı', '7': 'ci', '8': 'ci', '9': 'cu',
};

/** «10» → «10-cu». Rəqəm deyilsə olduğu kimi qayıdır. */
export function azOrdinal(value: string | number): string {
  const s = String(value ?? '').trim();
  if (!/^\d+$/.test(s)) return s;
  return `${s}-${SUFFIX_BY_LAST_DIGIT[s.slice(-1)] ?? 'ci'}`;
}

/** Müqayisə üçün: sıra şəkilçisi və artıq boşluqlar nəzərə alınmır. */
function normalize(part: string): string {
  return String(part ?? '')
    .toLowerCase()
    .replace(/(\d+)\s*-\s*c[iıuü]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function certificateSubtitle(
  cert: Pick<Certificate, 'examTitle' | 'subject' | 'grade'>,
  language: string,
  t: (key: string, params?: Record<string, any>) => string,
): string | null {
  const title = normalize(cert.examTitle ?? '');
  const parts: string[] = [];

  if (cert.subject && !title.includes(normalize(cert.subject))) {
    parts.push(cert.subject);
  }
  if (cert.grade && !title.includes(normalize(String(cert.grade)))) {
    parts.push(t('cert.gradeLabel', {
      grade: language === 'az' ? azOrdinal(cert.grade) : cert.grade,
    }));
  }

  return parts.length ? parts.join(' · ') : null;
}
