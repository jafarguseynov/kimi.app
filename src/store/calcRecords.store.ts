import { create } from 'zustand';
import { storage } from '../services/offline/storage';

/**
 * KALKULYATOR TARİXÇƏSİ / YADDAŞI / SON İSTİFADƏ.
 *
 * ⚠️ Backend-də kalkulyator tarixçəsi YOXDUR (nə endpoint, nə cədvəl) — əvvəl
 * "Tarixçə" və "Yaddaş" ekranları ekranın içinə yazılmış SAXTA nümunələr
 * göstərirdi ("24 May 2024 · 450 Bal"). Saxta məlumat göstərməmək üçün hər
 * ikisi burada REAL, cihazda saxlanılan qeydlərə bağlandı.
 *
 * Yaddaş qatı layihədə artıq mövcud olan chunked SecureStore-dur (offline
 * imtahan növbəsi ilə eyni) — YENİ NATIVE MODUL tələb etmir, yəni OTA ilə
 * çatdırıla bilir. Nəticələr şəxsi olduğu üçün cihazda qalır; sonradan
 * backend əlavə olunarsa, bu store sync qatı ilə əvəzlənə bilər.
 */

const KEY = 'calc_records_v1';
const MAX_HISTORY = 60;
const MAX_RECENTS = 8;

export interface CalcRecord {
  /** Yerli unikal id. */
  id: string;
  /** `CALCULATORS` reyestrindəki id (başlıq/ikon oradan gəlir). */
  calcId: string;
  createdAt: number;
  /** Əsas nəticə — artıq formatlanmış rəqəm/mətn (məs. "450", "88.5"). */
  value: string;
  /** Vahid i18n açarı (məs. `calc.balUnit`); qiymət/faiz üçün boş ola bilər. */
  unitKey?: string;
  /** Əlavə izah i18n açarı (məs. `calc.gradeExcellentFull`). */
  noteKey?: string;
  /** Tərcümə olunmayan qısa izah (məs. "3 KSQ · BSQ var"). */
  note?: string;
  saved: boolean;
}

interface Persisted {
  records: CalcRecord[];
  recents: { calcId: string; at: number }[];
}

interface CalcRecordsState extends Persisted {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  /** Kalkulyator açıldı — "son istifadə etdiklərin" üçün. */
  touch: (calcId: string) => void;
  /** Hesablama nəticəsi tarixçəyə yazılır. */
  addRecord: (r: Omit<CalcRecord, 'id' | 'createdAt' | 'saved'>) => string;
  toggleSaved: (id: string) => void;
  removeRecord: (id: string) => void;
  clearHistory: () => void;
}

const persist = (s: Persisted) => {
  storage.set(KEY, { records: s.records, recents: s.recents }).catch(() => {});
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const useCalcRecordsStore = create<CalcRecordsState>((set, get) => ({
  records: [],
  recents: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await storage.get<Persisted>(KEY);
      if (raw) {
        set({
          records: Array.isArray(raw.records) ? raw.records : [],
          recents: Array.isArray(raw.recents) ? raw.recents : [],
          hydrated: true,
        });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },

  touch: (calcId) => {
    if (!calcId) return;
    const rest = get().recents.filter((r) => r.calcId !== calcId);
    const recents = [{ calcId, at: Date.now() }, ...rest].slice(0, MAX_RECENTS);
    set({ recents });
    persist({ records: get().records, recents });
  },

  addRecord: (r) => {
    const rec: CalcRecord = { ...r, id: newId(), createdAt: Date.now(), saved: false };
    // Yadda saxlanılanlar limitə görə silinməsin — əvvəlcə onlar qorunur.
    const all = [rec, ...get().records];
    const kept = all.filter((x) => x.saved);
    const unsaved = all.filter((x) => !x.saved).slice(0, MAX_HISTORY);
    const records = [...kept, ...unsaved].sort((a, b) => b.createdAt - a.createdAt);

    const rest = get().recents.filter((x) => x.calcId !== r.calcId);
    const recents = [{ calcId: r.calcId, at: Date.now() }, ...rest].slice(0, MAX_RECENTS);

    set({ records, recents });
    persist({ records, recents });
    return rec.id;
  },

  toggleSaved: (id) => {
    const records = get().records.map((r) => (r.id === id ? { ...r, saved: !r.saved } : r));
    set({ records });
    persist({ records, recents: get().recents });
  },

  removeRecord: (id) => {
    const records = get().records.filter((r) => r.id !== id);
    set({ records });
    persist({ records, recents: get().recents });
  },

  clearHistory: () => {
    // Yalnız yadda saxlanılmayanları sil — "Yaddaş" toxunulmaz qalır.
    const records = get().records.filter((r) => r.saved);
    set({ records });
    persist({ records, recents: get().recents });
  },
}));
