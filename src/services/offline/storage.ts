import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Davamlı disk yaddaşı üçün nazik JSON wrapper (AsyncStorage üzərində).
 * Offline imtahan gedişatı və submit növbəsi burada saxlanılır — tətbiq/telefon
 * sönüb açılsa belə məlumat qalır.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* disk yazma uğursuzluğu — kritik deyil, yenidən cəhd ediləcək */
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* yoxdursa problem deyil */
    }
  },
};

// Yaddaş açarları — bir yerdə.
export const STORAGE_KEYS = {
  examSession: 'offline:exam-session',   // bitməmiş imtahan gedişatı (resume)
  examQueue: 'offline:exam-queue',       // göndərilməmiş submitlər
} as const;
