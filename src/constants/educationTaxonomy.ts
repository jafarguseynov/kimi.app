export interface SubItem {
  key: string;
  title: string;
  desc?: string;
  emoji?: string;
  subjects?: string[];
  structureKey?: string; // dimOfficialStructure-da uyğun açar
}

export const SCHOOL_GRADES: SubItem[] = [
  { key: '1',  title: '1-ci sinif',  desc: 'İbtidai',    subjects: ['Azərbaycan dili', 'Riyaziyyat', 'Həyat bilgisi', 'Musiqi', 'Texnologiya'] },
  { key: '2',  title: '2-ci sinif',  desc: 'İbtidai',    subjects: ['Azərbaycan dili', 'Riyaziyyat', 'Həyat bilgisi', 'İngilis dili', 'Musiqi'] },
  { key: '3',  title: '3-cü sinif',  desc: 'İbtidai',    subjects: ['Azərbaycan dili', 'Riyaziyyat', 'Həyat bilgisi', 'İngilis dili', 'Rus dili'] },
  { key: '4',  title: '4-cü sinif',  desc: 'İbtidai',    subjects: ['Azərbaycan dili', 'Riyaziyyat', 'Həyat bilgisi', 'İngilis dili', 'İnformatika'] },
  { key: '5',  title: '5-ci sinif',  desc: 'Ümumi orta', subjects: ['Azərbaycan dili', 'Riyaziyyat', 'İngilis dili', 'Rus dili', 'Tarix', 'Coğrafiya', 'Biologiya', 'İnformatika'] },
  { key: '6',  title: '6-cı sinif',  desc: 'Ümumi orta', subjects: ['Azərbaycan dili', 'Ədəbiyyat', 'Riyaziyyat', 'İngilis dili', 'Tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'İnformatika'] },
  { key: '7',  title: '7-ci sinif',  desc: 'Ümumi orta', subjects: ['Azərbaycan dili', 'Ədəbiyyat', 'Riyaziyyat', 'İngilis dili', 'Tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'İnformatika'] },
  { key: '8',  title: '8-ci sinif',  desc: 'Ümumi orta', subjects: ['Azərbaycan dili', 'Ədəbiyyat', 'Riyaziyyat', 'Cəbr', 'Həndəsə', 'İngilis dili', 'Tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'Kimya', 'İnformatika'] },
  { key: '9',  title: '9-cu sinif',  desc: 'Yekun attestasiya', structureKey: 'middle.9-attestasiya', subjects: ['Azərbaycan dili', 'Ədəbiyyat', 'Cəbr', 'Həndəsə', 'İngilis dili', 'Tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'Kimya', 'İnformatika'] },
  { key: '10', title: '10-cu sinif', desc: 'Tam orta',   subjects: ['Azərbaycan dili', 'Ədəbiyyat', 'Cəbr', 'Həndəsə', 'İngilis dili', 'Azərbaycan tarixi', 'Ümumi tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'Kimya'] },
  { key: '11', title: '11-ci sinif', desc: 'Buraxılış imtahanı', structureKey: 'middle.11-buraxilish', subjects: ['Azərbaycan dili', 'Ədəbiyyat', 'Cəbr', 'Həndəsə', 'İngilis dili', 'Azərbaycan tarixi', 'Ümumi tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'Kimya'] },
];

// Rus bölməsi (rus sektoru) sinifləri — tədris dili rus.
// Fərq: əsas dil "Rus dili"dir, "Azərbaycan dili" isə dövlət dili kimi keçilir.
// Buraxılış-9 rəsmi fənləri: Rus dili, Riyaziyyat, Xarici dil, Azərbaycan dili (dövlət dili).
export const RUSSIAN_SCHOOL_GRADES: SubItem[] = [
  { key: '1',  title: '1-ci sinif',  desc: 'İbtidai',    subjects: ['Rus dili', 'Riyaziyyat', 'Həyat bilgisi', 'Azərbaycan dili'] },
  { key: '2',  title: '2-ci sinif',  desc: 'İbtidai',    subjects: ['Rus dili', 'Riyaziyyat', 'Həyat bilgisi', 'Azərbaycan dili', 'İngilis dili'] },
  { key: '3',  title: '3-cü sinif',  desc: 'İbtidai',    subjects: ['Rus dili', 'Riyaziyyat', 'Həyat bilgisi', 'Azərbaycan dili', 'İngilis dili'] },
  { key: '4',  title: '4-cü sinif',  desc: 'İbtidai',    subjects: ['Rus dili', 'Riyaziyyat', 'Həyat bilgisi', 'Azərbaycan dili', 'İngilis dili', 'İnformatika'] },
  { key: '5',  title: '5-ci sinif',  desc: 'Ümumi orta', subjects: ['Rus dili', 'Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Tarix', 'Coğrafiya', 'Biologiya', 'İnformatika'] },
  { key: '6',  title: '6-cı sinif',  desc: 'Ümumi orta', subjects: ['Rus dili', 'Rus ədəbiyyatı', 'Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'İnformatika'] },
  { key: '7',  title: '7-ci sinif',  desc: 'Ümumi orta', subjects: ['Rus dili', 'Rus ədəbiyyatı', 'Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'İnformatika'] },
  { key: '8',  title: '8-ci sinif',  desc: 'Ümumi orta', subjects: ['Rus dili', 'Rus ədəbiyyatı', 'Cəbr', 'Həndəsə', 'Azərbaycan dili', 'İngilis dili', 'Tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'Kimya', 'İnformatika'] },
  { key: '9',  title: '9-cu sinif',  desc: 'Yekun attestasiya', structureKey: 'middle.9-attestasiya', subjects: ['Rus dili', 'Riyaziyyat', 'İngilis dili', 'Azərbaycan dili', 'Rus ədəbiyyatı', 'Cəbr', 'Həndəsə', 'Tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'Kimya', 'İnformatika'] },
  { key: '10', title: '10-cu sinif', desc: 'Tam orta',   subjects: ['Rus dili', 'Rus ədəbiyyatı', 'Cəbr', 'Həndəsə', 'Azərbaycan dili', 'İngilis dili', 'Azərbaycan tarixi', 'Ümumi tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'Kimya'] },
  { key: '11', title: '11-ci sinif', desc: 'Buraxılış imtahanı', structureKey: 'middle.11-buraxilish', subjects: ['Rus dili', 'Rus ədəbiyyatı', 'Cəbr', 'Həndəsə', 'Azərbaycan dili', 'İngilis dili', 'Azərbaycan tarixi', 'Ümumi tarix', 'Coğrafiya', 'Biologiya', 'Fizika', 'Kimya'] },
];

// DİM 2026 rəsmi strukturuna uyğun — 7 alt-qrup
export const ABITURIYENT_GROUPS: SubItem[] = [
  { key: 'I-RK',   title: 'I qrup (RK)',   desc: 'Riy · Fiz · Kimya — texniki',         emoji: '⚗️',  structureKey: 'abituriyent.I-RK',
    subjects: ['Ana dil', 'Xarici dil', 'Riyaziyyat', 'Fizika', 'Kimya'] },
  { key: 'I-Ri',   title: 'I qrup (Rİ)',   desc: 'Riy · Fiz · İnformatika — IT',        emoji: '💻',  structureKey: 'abituriyent.I-Ri',
    subjects: ['Ana dil', 'Xarici dil', 'Riyaziyyat', 'Fizika', 'İnformatika'] },
  { key: 'II',     title: 'II qrup',       desc: 'Riy · Coğ · Tarix — iqtisad',         emoji: '📊',  structureKey: 'abituriyent.II',
    subjects: ['Ana dil', 'Xarici dil', 'Riyaziyyat', 'Coğrafiya', 'Tarix'] },
  { key: 'III-DT', title: 'III qrup (DT)', desc: 'Dil · Tarix · Ədəbiyyat — humanitar', emoji: '📚',  structureKey: 'abituriyent.III-DT',
    subjects: ['Ana dil (genişləndirilmiş)', 'Xarici dil', 'Tarix', 'Ədəbiyyat'] },
  { key: 'III-TC', title: 'III qrup (TC)', desc: 'Dil · Coğ · Tarix — humanitar',       emoji: '🌍',  structureKey: 'abituriyent.III-TC',
    subjects: ['Ana dil (genişləndirilmiş)', 'Xarici dil', 'Coğrafiya', 'Tarix'] },
  { key: 'IV',     title: 'IV qrup',       desc: 'Bio · Kim · Fiz — tibb',              emoji: '🩺',  structureKey: 'abituriyent.IV',
    subjects: ['Ana dil', 'Xarici dil', 'Biologiya', 'Kimya', 'Fizika'] },
  { key: 'V',      title: 'V qrup',        desc: 'İncəsənət / idman / hərbi',           emoji: '🎨',  structureKey: 'abituriyent.V',
    subjects: ['Ana dil', 'Xarici dil', 'Qabiliyyət imtahanı'] },
];

export const MAGISTR_SUBJECTS: SubItem[] = [
  { key: 'logic',       title: 'Məntiq',       desc: 'Ümumi məntiq blok', emoji: '🧠', structureKey: 'magistr.logic' },
  { key: 'informatics', title: 'İnformatika',  desc: 'Kompüter biliyi',   emoji: '💻', structureKey: 'magistr.informatics' },
  { key: 'lang',        title: 'Xarici dil',   desc: 'İngilis / Rus',     emoji: '🌐', structureKey: 'magistr.lang' },
  { key: 'specialty',   title: 'İxtisas üzrə', desc: 'Magistr ixtisası',  emoji: '🎓', structureKey: 'magistr.specialty' },
];

export const MIQ_SUBJECTS: SubItem[] = [
  { key: 'math',     title: 'Riyaziyyat müəllimi',     emoji: '📐' },
  { key: 'physics',  title: 'Fizika müəllimi',          emoji: '🧪' },
  { key: 'chem',     title: 'Kimya müəllimi',           emoji: '⚗️' },
  { key: 'bio',      title: 'Biologiya müəllimi',       emoji: '🧬' },
  { key: 'az',       title: 'Azərbaycan dili müəllimi', emoji: '📖' },
  { key: 'lit',      title: 'Ədəbiyyat müəllimi',       emoji: '📚' },
  { key: 'eng',      title: 'İngilis dili müəllimi',    emoji: '🇬🇧' },
  { key: 'hist',     title: 'Tarix müəllimi',           emoji: '🏛️' },
  { key: 'geo',      title: 'Coğrafiya müəllimi',       emoji: '🌍' },
  { key: 'info',     title: 'İnformatika müəllimi',     emoji: '🖥️' },
  { key: 'primary',  title: 'İbtidai sinif müəllimi',   emoji: '🍎' },
  { key: 'pedagogy', title: 'Pedaqogika / Psixologiya', emoji: '🧩' },
];

export const PRESCHOOL_GROUPS: SubItem[] = [
  { key: '3-4', title: '3–4 yaş', desc: 'Kiçik qrup',     emoji: '🧸' },
  { key: '4-5', title: '4–5 yaş', desc: 'Orta qrup',      emoji: '🎨' },
  { key: '5-6', title: '5–6 yaş', desc: 'Hazırlıq qrupu', emoji: '✏️' },
];

export const MOCK_TYPES: SubItem[] = [
  { key: 'weekly',     title: 'Həftəlik sınaq',   desc: 'Hər həftə yeni',      emoji: '📅' },
  { key: 'monthly',    title: 'Aylıq sınaq',      desc: 'Tam-həcm imitasiya',  emoji: '🗓️' },
  { key: 'graduation', title: 'Buraxılış sınağı', desc: '9-cu və 11-ci sinif', emoji: '🎓' },
  { key: 'dim',        title: 'DİM sınağı',       desc: 'Real DİM formatı',    emoji: '📊' },
];

// ─── YENİ DİM kateqoriyaları (2.0) ──────────────────────────────────────────

export const REZIDENTURA_SUBJECTS: SubItem[] = [
  { key: 'therapy',    title: 'Terapiya',           emoji: '🩺' },
  { key: 'surgery',    title: 'Cərrahiyyə',         emoji: '🔪' },
  { key: 'pediatric',  title: 'Pediatriya',         emoji: '👶' },
  { key: 'gyno',       title: 'Mama-ginekologiya',  emoji: '🤰' },
  { key: 'cardio',     title: 'Kardiologiya',       emoji: '❤️' },
  { key: 'neuro',      title: 'Nevrologiya',        emoji: '🧠' },
  { key: 'radiology',  title: 'Radiologiya',        emoji: '☢️' },
  { key: 'dentist',    title: 'Stomatologiya',      emoji: '🦷' },
  { key: 'other',      title: 'Digər ixtisaslar',   emoji: '➕' },
];

export const DOCTORATE_SUBJECTS: SubItem[] = [
  { key: 'foreign-lang', title: 'Xarici dil',     desc: 'TOEFL / IELTS / DAAD ekvivalenti', emoji: '🌐' },
  { key: 'specialty',    title: 'İxtisas üzrə',   desc: 'Fəlsəfə doktoru proqramı',         emoji: '🎓' },
  { key: 'philosophy',   title: 'Fəlsəfə',        desc: 'Ümumi fəlsəfə bloku',              emoji: '🤔' },
];

export const GOV_SERVICE_SUBJECTS: SubItem[] = [
  { key: 'constitution', title: 'Konstitusiya',          emoji: '⚖️' },
  { key: 'law',          title: 'İdarəetmə hüququ',       emoji: '📜' },
  { key: 'general',      title: 'Ümumi bilik',            emoji: '🌐' },
  { key: 'interview',    title: 'Müsahibə hazırlığı',     emoji: '🗣️' },
  { key: 'azhistory',    title: 'Azərbaycan tarixi',      emoji: '🏛️' },
];

export const ABILITY_SUBJECTS: SubItem[] = [
  { key: 'art',     title: 'İncəsənət (rəssamlıq, dizayn)', emoji: '🎨' },
  { key: 'music',   title: 'Musiqi',                          emoji: '🎵' },
  { key: 'sport',   title: 'İdman',                           emoji: '⚽' },
  { key: 'military',title: 'Hərbi qabiliyyət',                emoji: '🪖' },
  { key: 'drama',   title: 'Teatr / aktyorluq',               emoji: '🎭' },
];

export const COLLEGE_SUBJECTS: SubItem[] = [
  { key: 'tech',     title: 'Texniki ixtisas',     emoji: '🔧' },
  { key: 'medical',  title: 'Tibb (kollec)',       emoji: '💊' },
  { key: 'pedagogy', title: 'Pedaqoji',            emoji: '📚' },
  { key: 'economy',  title: 'İqtisadi',            emoji: '💰' },
  { key: 'art',      title: 'İncəsənət',           emoji: '🎨' },
  { key: 'agro',     title: 'Aqrar / kənd təs.',   emoji: '🌾' },
];

export const INTERNATIONAL_SUBJECTS: SubItem[] = [
  { key: 'toefl',     title: 'TOEFL iBT',         desc: 'Akademik ingilis dili',     emoji: '🇺🇸', structureKey: 'international.toefl' },
  { key: 'sat',       title: 'SAT',               desc: 'ABŞ universitetləri',        emoji: '🎓', structureKey: 'international.sat' },
  { key: 'gre',       title: 'GRE',               desc: 'Magistr / Doktora',          emoji: '📊', structureKey: 'international.gre' },
  { key: 'cambridge', title: 'Cambridge English', desc: 'KET / PET / FCE / CAE / CPE',emoji: '🇬🇧', structureKey: 'international.cambridge' },
  { key: 'icdl',      title: 'ICDL',              desc: 'Kompüter sürücülüyü',        emoji: '💻', structureKey: 'international.icdl' },
  { key: 'pearson',   title: 'Pearson VUE',       desc: 'Peşəkar sertifikatlar',      emoji: '🏅', structureKey: 'international.pearson' },
];

export const PROFESSIONAL_SUBJECTS: SubItem[] = [
  { key: 'accountant',    title: 'Peşəkar Mühasib',     desc: 'Çoxmərhələli sertifikat', emoji: '🧮', structureKey: 'pro.accountant' },
  { key: 'agroinsurance', title: 'Aqrar Sığorta',       desc: 'Sığorta agenti sertifikatı', emoji: '🌾', structureKey: 'pro.agroinsurance' },
  { key: 'executor',      title: 'Xüsusi İcra Məmuru',  desc: 'Hüquqi peşə sertifikatı', emoji: '⚖️', structureKey: 'pro.executor' },
  { key: 'appraiser',     title: 'Qiymətləndirici',     desc: 'Qiymətləndirmə peşə sert.', emoji: '📏', structureKey: 'pro.appraiser' },
];

// "Xarici dil" hər yerdə ümumi etiketdir — namizəd konkret dili özü seçir.
export const FOREIGN_LANGUAGES = ['İngilis dili', 'Rus dili', 'Fransız dili', 'Alman dili'];
export const isForeignLangSubject = (s?: string) => s === 'Xarici dil';

export function getSubcategories(categoryKey: string): SubItem[] {
  switch (categoryKey) {
    case 'middle':        return SCHOOL_GRADES;
    // Rus bölməsi — rus sektoru üçün eyni orta məktəb sinifləri + abituriyent qrupları.
    // categoryKey 'russian' aşağı drill boyu daşınır, beləliklə imtahan siyahısı
    // rus sektoru imtahanlarını süzür (backend categoryKey='russian' üzrə).
    case 'russian':       return [...RUSSIAN_SCHOOL_GRADES, ...ABITURIYENT_GROUPS];
    case 'abituriyent':   return ABITURIYENT_GROUPS;
    case 'magistr':       return MAGISTR_SUBJECTS;
    case 'miq':           return MIQ_SUBJECTS;
    case 'preschool':     return PRESCHOOL_GROUPS;
    case 'mock':          return MOCK_TYPES;
    case 'rezidentura':   return REZIDENTURA_SUBJECTS;
    case 'doctorate':     return DOCTORATE_SUBJECTS;
    case 'govservice':    return GOV_SERVICE_SUBJECTS;
    case 'ability':       return ABILITY_SUBJECTS;
    case 'college':       return COLLEGE_SUBJECTS;
    case 'international': return INTERNATIONAL_SUBJECTS;
    case 'professional':  return PROFESSIONAL_SUBJECTS;
    default: return [];
  }
}

// Kateqoriya açarı → oxunaqlı başlıq (məs. 'abituriyent' → 'Abituriyent')
export const CATEGORY_TITLES: Record<string, string> = {
  middle: 'Orta Məktəb',
  russian: 'Rus bölməsi',
  abituriyent: 'Abituriyent',
  magistr: 'Magistratura',
  miq: 'MIQ',
  rezidentura: 'Rezidentura',
  doctorate: 'Doktorantura',
  govservice: 'Dövlət qulluğu',
  ability: 'Qabiliyyət',
  college: 'Kollec',
  international: 'Beynəlxalq',
  professional: 'Peşəkar sertifikat',
  preschool: 'Məktəbəqədər',
  mock: 'Sınaqlar',
};

export function getCategoryTitle(categoryKey?: string): string | undefined {
  if (!categoryKey) return undefined;
  return CATEGORY_TITLES[categoryKey];
}

// Yuxarı səviyyə kateqoriyaların özünə də structure key qeydiyyatı —
// məsələn abituriyent kartının altında "175 sual · 700 bal" göstərmək üçün
export function getCategoryStructureKey(categoryKey: string, subKey?: string): string | undefined {
  if (subKey) return `${categoryKey}.${subKey}`;
  switch (categoryKey) {
    case 'miq':         return 'miq';
    case 'rezidentura': return 'rezidentura';
    case 'doctorate':   return 'doctorate';
    case 'govservice':  return 'govservice';
    case 'ability':     return 'ability';
    case 'college':     return 'college';
    case 'magistr':     return 'magistr';
    default: return undefined;
  }
}
