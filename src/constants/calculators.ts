import Ionicons from '@expo/vector-icons/Ionicons';
import { Routes } from './routes';

/**
 * KALKULYATOR REYESTRİ — tək həqiqət mənbəyi.
 *
 * Əvvəl kalkulyatorların siyahısı yalnız `CalculatorsHomeScreen`-in içində
 * JSX massivi kimi vardı; axtarış, kateqoriya, tarixçə və "son istifadə
 * etdiklərin" üçün eyni siyahıya bir neçə yerdən ehtiyac yarandı. Ona görə
 * meta-məlumat bura çıxarıldı — YENİ kalkulyator əlavə etmir, sadəcə mövcud
 * ekranları təsvir edir.
 */

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** §6 — kateqoriyalar. */
export type CalcCategory = 'score' | 'school' | 'exam' | 'analysis';

export interface CalcMeta {
  /** Yaddaşda (tarixçə/yaddaş/son istifadə) işlədilən sabit id. Dəyişdirmə. */
  id: string;
  /** Naviqasiya marşrutu — mövcud ekranlar olduğu kimi qalır. */
  route: string;
  titleKey: string;
  /** §7 — maksimum 1 sətirlik açıqlama. */
  descKey: string;
  icon: IconName;
  category: CalcCategory;
  /** §5 — ən çox istifadə olunan üçlük. */
  popular?: boolean;
  /** §9 — badge YALNIZ həqiqətən vacib olanda. */
  badge?: boolean;
  /** Axtarış açar sözləri (dilə görə i18n-dən gəlir). */
  searchKey: string;
}

export const CALCULATORS: CalcMeta[] = [
  {
    id: 'dim',
    route: Routes.DIMCalc,
    titleKey: 'calc.dimTitle',
    descKey: 'calc.dimShort',
    icon: 'school-outline',
    category: 'exam',
    popular: true,
    badge: true,
    searchKey: 'calc.kwDim',
  },
  {
    id: 'semester',
    route: Routes.SemesterCalc,
    titleKey: 'calc.semesterTitle',
    descKey: 'calc.semesterShort',
    icon: 'calendar-outline',
    category: 'school',
    popular: true,
    searchKey: 'calc.kwSemester',
  },
  {
    id: 'score',
    route: Routes.ScoreCalc,
    titleKey: 'calc.scoreTitle',
    descKey: 'calc.scoreShort',
    icon: 'help-circle-outline',
    category: 'score',
    popular: true,
    searchKey: 'calc.kwScore',
  },
  {
    id: 'annual',
    route: Routes.AnnualCalc,
    titleKey: 'calc.annualTitle',
    descKey: 'calc.annualShort',
    icon: 'calendar-clear-outline',
    category: 'school',
    searchKey: 'calc.kwAnnual',
  },
  {
    id: 'classGrade',
    route: Routes.ClassGradeCalc,
    titleKey: 'calc.classTitle',
    descKey: 'calc.classShort',
    icon: 'people-outline',
    category: 'school',
    searchKey: 'calc.kwClass',
  },
  {
    id: 'quality',
    route: Routes.QualityCalc,
    titleKey: 'calc.qualityTitle',
    descKey: 'calc.qualityShort',
    icon: 'stats-chart-outline',
    category: 'analysis',
    searchKey: 'calc.kwQuality',
  },
];

export const CALC_BY_ID: Record<string, CalcMeta> = CALCULATORS.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<string, CalcMeta>,
);

/** §6 — kateqoriya sırası (ekranda bu ardıcıllıqla göstərilir). */
export const CALC_CATEGORIES: { key: CalcCategory; titleKey: string; emoji: string }[] = [
  { key: 'score', titleKey: 'calc.catScore', emoji: '📊' },
  { key: 'school', titleKey: 'calc.catSchool', emoji: '📚' },
  { key: 'exam', titleKey: 'calc.catExam', emoji: '🎓' },
  { key: 'analysis', titleKey: 'calc.catAnalysis', emoji: '📈' },
];

/**
 * §12 — "Sənin üçün" (personalizasiya) üçün struktur.
 *
 * ⚠️ Hazırda backend-də istifadəçinin davranış siqnalı YOXDUR (hansı fənn üzrə
 * imtahan həll edir, hansı sinifdədir və s. kalkulyator kontekstinə bağlanmayıb).
 * Uydurma tövsiyə göstərməmək üçün siqnal gəlmədikcə bu funksiya boş massiv
 * qaytarır və ekranda "Sənin üçün" bölməsi ümumiyyətlə render olunmur.
 *
 * Siqnal mənbəyi əlavə olunanda (məs. son imtahan fənləri) yalnız bu funksiya
 * doldurulur — UI hazırdır.
 */
export interface CalcSignals {
  /** Son həll edilmiş imtahan fənləri (hələ mövcud deyil). */
  recentExamSubjects?: string[];
  /** İstifadəçinin sinfi (hələ kalkulyator kontekstinə bağlanmayıb). */
  grade?: string | null;
}

export function suggestedCalculators(signals?: CalcSignals): CalcMeta[] {
  if (!signals || (!signals.recentExamSubjects?.length && !signals.grade)) return [];
  // Abituriyent/buraxılış siqnalı varsa imtahan kateqoriyası önə çıxır.
  return CALCULATORS.filter((c) => c.category === 'exam');
}

/**
 * Azərbaycan əlifbası: `'İ'.toLowerCase()` JS-də `i` + U+0307 (birləşən nöqtə)
 * verir və sadə `i` ilə uyğunlaşmır → "İllik" yazanda "illik" tapılmır.
 * Axtarışdan əvvəl həmin nöqtəni silirik.
 */
export const normSearch = (s: string): string =>
  s.trim().toLowerCase().replace(/̇/g, '');
