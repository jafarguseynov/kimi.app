// Rəsmi DİM imtahan strukturları — 2026 il məlumatları əsasında.
// Mənbə: dim.gov.az, Bakalavriat 2026 elanı, Bal hesablama qaydası.

export interface ExamSubjectInfo {
  name: string;
  questions: number;
  coefficient?: number; // 1.5 və ya 1 (ixtisas fənninə görə)
  type?: 'closed' | 'open' | 'mixed';
  note?: string;
}

export interface ExamPhaseInfo {
  name: string;
  description?: string;
  subjects: ExamSubjectInfo[];
  totalQuestions: number;
  totalScore: number;
  durationMin?: number;
}

export interface ExamStructure {
  key: string;
  totalQuestions: number;
  totalScore: number;
  totalDurationMin?: number;
  phases?: ExamPhaseInfo[];
  note?: string; // qeyri-müəyyən və ya qismən təsdiqlənmiş data üçün
}

// ─── Abituriyent (Bakalavriat 2026) ────────────────────────────────────────
// Mənbə: https://eservices.dim.gov.az/erizebak/erize/App_Docs/Elan_ali_2026.pdf

const ABIT_PHASE_1: ExamPhaseInfo = {
  name: '1-ci mərhələ (Buraxılış)',
  description: 'Bütün qruplar üçün ortaq',
  subjects: [
    { name: 'Ana dil (Azərbaycan/Rus)', questions: 30 },
    { name: 'Xarici dil', questions: 30 },
    { name: 'Riyaziyyat', questions: 25 },
  ],
  totalQuestions: 85,
  totalScore: 300,
  durationMin: 180,
};

function abitPhase2(s1: string, s2: string, s3: string): ExamPhaseInfo {
  return {
    name: '2-ci mərhələ (İxtisas)',
    description: '22 qapalı + 8 açıq (5 hesablama/seçim/uyğunlaşdırma + 3 yazılı)',
    subjects: [
      { name: s1, questions: 30, coefficient: 1.5, type: 'mixed' },
      { name: s2, questions: 30, coefficient: 1.5, type: 'mixed' },
      { name: s3, questions: 30, coefficient: 1.0, type: 'mixed' },
    ],
    totalQuestions: 90,
    totalScore: 400,
    durationMin: 180,
  };
}

export const DIM_STRUCTURES: Record<string, ExamStructure> = {
  // ─── Abituriyent qrupları ──────────────────────────────────────
  'abituriyent.I-RK': {
    key: 'abituriyent.I-RK',
    totalQuestions: 175, totalScore: 700, totalDurationMin: 360,
    phases: [ABIT_PHASE_1, abitPhase2('Riyaziyyat', 'Fizika', 'Kimya')],
  },
  'abituriyent.I-Ri': {
    key: 'abituriyent.I-Ri',
    totalQuestions: 175, totalScore: 700, totalDurationMin: 360,
    phases: [ABIT_PHASE_1, abitPhase2('Riyaziyyat', 'Fizika', 'İnformatika')],
  },
  'abituriyent.II': {
    key: 'abituriyent.II',
    totalQuestions: 175, totalScore: 700, totalDurationMin: 360,
    phases: [ABIT_PHASE_1, abitPhase2('Riyaziyyat', 'Coğrafiya', 'Tarix')],
  },
  'abituriyent.III-DT': {
    key: 'abituriyent.III-DT',
    totalQuestions: 175, totalScore: 700, totalDurationMin: 360,
    phases: [ABIT_PHASE_1, abitPhase2('Ana dil (genişləndirilmiş)', 'Tarix', 'Ədəbiyyat')],
  },
  'abituriyent.III-TC': {
    key: 'abituriyent.III-TC',
    totalQuestions: 175, totalScore: 700, totalDurationMin: 360,
    phases: [ABIT_PHASE_1, abitPhase2('Ana dil (genişləndirilmiş)', 'Coğrafiya', 'Tarix')],
  },
  'abituriyent.IV': {
    key: 'abituriyent.IV',
    totalQuestions: 175, totalScore: 700, totalDurationMin: 360,
    phases: [ABIT_PHASE_1, abitPhase2('Biologiya', 'Kimya', 'Fizika')],
  },
  'abituriyent.V': {
    key: 'abituriyent.V',
    totalQuestions: 85, totalScore: 300, totalDurationMin: 180,
    phases: [ABIT_PHASE_1],
    note: '2-ci mərhələ yoxdur; əlavə qabiliyyət imtahanı tələb olunur',
  },

  // ─── Orta məktəb buraxılış/attestasiya ─────────────────────────
  'middle.9-attestasiya': {
    key: 'middle.9-attestasiya',
    totalQuestions: 60, totalScore: 100, totalDurationMin: 120,
    note: '9-cu sinif yekun attestasiyası — məktəb bazasında, ana dil + riyaziyyat + əsas fənlər',
  },
  'middle.11-buraxilish': {
    key: 'middle.11-buraxilish',
    totalQuestions: 75, totalScore: 100, totalDurationMin: 150,
    note: '11-ci sinif buraxılış imtahanı — tam orta təhsil sənədi üçün',
  },

  // ─── Magistratura (köhnə format, hazırlıq üçün) ─────────────────
  'magistr': {
    key: 'magistr',
    totalQuestions: 110, totalScore: 100, totalDurationMin: 240,
    note: 'Köhnə DİM format (2018-ə qədər). İndi DİM-də rəsmi test yoxdur — yalnız ərizə (e-gov.az). App-da hazırlıq materialları üçün.',
  },
  'magistr.logic': {
    key: 'magistr.logic',
    totalQuestions: 50, totalScore: 100, totalDurationMin: 100,
    note: 'Məntiq bloku — ənənəvi format',
  },
  'magistr.informatics': {
    key: 'magistr.informatics',
    totalQuestions: 60, totalScore: 100, totalDurationMin: 90,
  },
  'magistr.lang': {
    key: 'magistr.lang',
    totalQuestions: 80, totalScore: 100, totalDurationMin: 120,
  },
  'magistr.specialty': {
    key: 'magistr.specialty',
    totalQuestions: 100, totalScore: 100, totalDurationMin: 180,
    note: 'İxtisas üzrə fərdi format',
  },

  // ─── MIQ (Müəllimlərin İşə Qəbulu) ─────────────────────────────
  'miq': {
    key: 'miq',
    totalQuestions: 100, totalScore: 100, totalDurationMin: 180,
    note: 'İxtisas (60-70%) + Metodika + Pedaqogika/Psixologiya blokları',
  },

  // ─── Rezidentura ────────────────────────────────────────────────
  'rezidentura': {
    key: 'rezidentura',
    totalQuestions: 100, totalScore: 100, totalDurationMin: 180,
    note: 'Tibb bakalavrı sonrası, ixtisas üzrə test imtahanı',
  },

  // ─── Doktorantura ───────────────────────────────────────────────
  'doctorate': {
    key: 'doctorate',
    totalQuestions: 80, totalScore: 100, totalDurationMin: 150,
    note: 'Xarici dil + ixtisas imtahanı',
  },

  // ─── Dövlət qulluğu ─────────────────────────────────────────────
  'govservice': {
    key: 'govservice',
    totalQuestions: 60, totalScore: 100, totalDurationMin: 120,
    note: 'Konstitusiya, hüquq, ümumi bilik blokları + müsahibə mərhələsi',
  },

  // ─── Qabiliyyət imtahanları ────────────────────────────────────
  'ability': {
    key: 'ability',
    totalQuestions: 0, totalScore: 100,
    note: 'Format ixtisasdan asılıdır: incəsənət (yaradıcılıq sınağı), idman (fiziki test), hərbi (qabiliyyət testi)',
  },

  // ─── Kollec / Orta ixtisas ─────────────────────────────────────
  'college': {
    key: 'college',
    totalQuestions: 60, totalScore: 100, totalDurationMin: 120,
    note: '9 illik bazada qəbul. Əsas fənlər + ixtisas seçim',
  },

  // ─── Beynəlxalq sertifikatlar ──────────────────────────────────
  'international.toefl': {
    key: 'international.toefl',
    totalQuestions: 80, totalScore: 120, totalDurationMin: 180,
    note: 'TOEFL iBT — 4 bölmə: Reading, Listening, Speaking, Writing',
  },
  'international.sat': {
    key: 'international.sat',
    totalQuestions: 154, totalScore: 1600, totalDurationMin: 180,
    note: 'SAT — Math + Evidence-Based Reading/Writing',
  },
  'international.gre': {
    key: 'international.gre',
    totalQuestions: 80, totalScore: 340, totalDurationMin: 210,
    note: 'GRE — Verbal + Quantitative + Analytical Writing',
  },
  'international.cambridge': {
    key: 'international.cambridge',
    totalQuestions: 0, totalScore: 100,
    note: 'Cambridge English səviyyələri: KET, PET, FCE, CAE, CPE',
  },
  'international.icdl': {
    key: 'international.icdl',
    totalQuestions: 36, totalScore: 100, totalDurationMin: 45,
    note: 'ICDL modul başına test',
  },
  'international.pearson': {
    key: 'international.pearson',
    totalQuestions: 0, totalScore: 0,
    note: 'Pearson VUE — peşəkar sertifikatlar (Cisco, Microsoft, AWS, vs.)',
  },

  // ─── Peşəkar sertifikatlar ─────────────────────────────────────
  'pro.accountant': {
    key: 'pro.accountant',
    totalQuestions: 100, totalScore: 100, totalDurationMin: 180,
    note: 'Peşəkar Mühasib Sertifikatı — çoxmərhələli',
  },
  'pro.agroinsurance': {
    key: 'pro.agroinsurance',
    totalQuestions: 50, totalScore: 100, totalDurationMin: 90,
    note: 'Aqrar Sığorta sertifikatı',
  },
  'pro.executor': {
    key: 'pro.executor',
    totalQuestions: 60, totalScore: 100, totalDurationMin: 120,
    note: 'Xüsusi İcra Məmuru imtahanı',
  },
  'pro.appraiser': {
    key: 'pro.appraiser',
    totalQuestions: 60, totalScore: 100, totalDurationMin: 120,
    note: 'Qiymətləndirici peşə sertifikatı',
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getOfficialStructure(examKey: string): ExamStructure | undefined {
  return DIM_STRUCTURES[examKey];
}

export function getStructureSummary(examKey: string): string | undefined {
  const s = DIM_STRUCTURES[examKey];
  if (!s) return undefined;
  if (s.totalQuestions === 0) return `${s.totalScore} bal`;
  return `${s.totalQuestions} sual · ${s.totalScore} bal`;
}

export function getCoefficient(examKey: string, subjectName: string): number | undefined {
  const s = DIM_STRUCTURES[examKey];
  if (!s?.phases) return undefined;
  for (const phase of s.phases) {
    const found = phase.subjects.find((sub) => sub.name === subjectName);
    if (found?.coefficient) return found.coefficient;
  }
  return undefined;
}
