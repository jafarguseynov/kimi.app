import * as SecureStore from 'expo-secure-store';

/**
 * Davamlı yaddaş — tətbiqdə artıq mövcud olan expo-secure-store üzərində
 * (token/dil də burada saxlanılır). Beləcə offline imtahan YENİ NATIVE MODUL
 * tələb etmir → OTA ilə cari tətbiqə çatdırılır, store build lazım deyil.
 *
 * SecureStore (Android) bir dəyər üçün ~2KB limit qoyur, ona görə böyük dəyərlər
 * (imtahan sualları) hissələrə (chunk) bölünüb saxlanılır. Açarlar yalnız
 * [A-Za-z0-9._-] ola bilər (ona görə açarlarda ":" yox, "_" istifadə olunur).
 */

const CHUNK_CHARS = 800; // hər chunk ~800 simvol → çoxbaytlı mətnlə belə <2KB

function chunkKey(key: string, i: number): string {
  return `${key}__c${i}`;
}

async function setRaw(key: string, value: string): Promise<void> {
  // Köhnə chunk sayını oxu (artıq qalanları sonra silmək üçün).
  let prevN = 0;
  const prevManifest = await SecureStore.getItemAsync(key).catch(() => null);
  if (prevManifest) { try { prevN = JSON.parse(prevManifest).n ?? 0; } catch { prevN = 0; } }

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_CHARS) {
    chunks.push(value.slice(i, i + CHUNK_CHARS));
  }
  // Əvvəlcə chunk-ları yaz (üstünə yazır), manifest-i ən SONDA yaz (commit nöqtəsi).
  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(chunkKey(key, i), chunks[i]);
  }
  await SecureStore.setItemAsync(key, JSON.stringify({ n: chunks.length }));
  // Artıq lazım olmayan köhnə chunk-ları təmizlə.
  for (let i = chunks.length; i < prevN; i++) {
    await SecureStore.deleteItemAsync(chunkKey(key, i)).catch(() => {});
  }
}

async function getRaw(key: string): Promise<string | null> {
  const manifest = await SecureStore.getItemAsync(key);
  if (!manifest) return null;
  let n = 0;
  try { n = JSON.parse(manifest).n ?? 0; } catch { return null; }
  let out = '';
  for (let i = 0; i < n; i++) {
    const part = await SecureStore.getItemAsync(chunkKey(key, i));
    if (part == null) return null; // natamam → etibarsız
    out += part;
  }
  return out;
}

async function removeRaw(key: string): Promise<void> {
  const manifest = await SecureStore.getItemAsync(key);
  if (manifest) {
    let n = 0;
    try { n = JSON.parse(manifest).n ?? 0; } catch { n = 0; }
    for (let i = 0; i < n; i++) {
      await SecureStore.deleteItemAsync(chunkKey(key, i)).catch(() => {});
    }
  }
  await SecureStore.deleteItemAsync(key).catch(() => {});
}

// ─── Debounce + serializasiya ──────────────────────────────────────────────
// zustand persist hər dəyişiklikdə (hər cavab toxunuşunda) bütün bloku yazır.
// Chunked yazını seriallaşdırıb birləşdiririk: eyna anda yalnız bir yazı,
// sürətli dəyişikliklər ~600ms-də bir coalesce olunur (performans + yarış yox).
const pendingValue = new Map<string, string>();
const scheduled = new Map<string, ReturnType<typeof setTimeout>>();
const writing = new Map<string, boolean>();

async function flush(name: string): Promise<void> {
  if (writing.get(name)) return; // cari yazı bitəndə təkrar yoxlanılacaq
  const value = pendingValue.get(name);
  if (value == null) return;
  pendingValue.delete(name);
  writing.set(name, true);
  try {
    await setRaw(name, value);
  } finally {
    writing.set(name, false);
    if (pendingValue.has(name)) flush(name); // yazı zamanı yeni dəyər gəldisə
  }
}

function scheduleWrite(name: string, value: string): void {
  pendingValue.set(name, value);
  if (scheduled.has(name)) return;
  const t = setTimeout(() => { scheduled.delete(name); flush(name); }, 600);
  scheduled.set(name, t);
}

/** zustand persist üçün uyğun string-əsaslı interfeys (chunked + debounced). */
export const secureChunkStorage = {
  getItem: (name: string) => getRaw(name),
  setItem: (name: string, value: string) => { scheduleWrite(name, value); return Promise.resolve(); },
  removeItem: async (name: string) => {
    // gözləyən yazını ləğv et, dərhal sil
    const t = scheduled.get(name);
    if (t) { clearTimeout(t); scheduled.delete(name); }
    pendingValue.delete(name);
    await removeRaw(name);
  },
};

/** JSON köməkçiləri (submit növbəsi üçün). */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await getRaw(key).catch(() => null);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  async set<T>(key: string, value: T): Promise<void> {
    await setRaw(key, JSON.stringify(value)).catch(() => {});
  },
  async remove(key: string): Promise<void> {
    await removeRaw(key).catch(() => {});
  },
};

// Yaddaş açarları — yalnız [A-Za-z0-9._-] (SecureStore tələbi).
export const STORAGE_KEYS = {
  examSession: 'offline_exam_session',
  examQueue: 'offline_exam_queue',
} as const;
