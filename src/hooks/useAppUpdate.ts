import { useCallback, useEffect, useState } from 'react';
import { Platform, Linking } from 'react-native';
import Constants from 'expo-constants';
import { APP_VERSION_URL } from '../constants/config';

// expo-updates native modulu (ExpoUpdates) yalnız EAS build-də mövcuddur.
// Dev / run:ios build-ində olmaya bilər — statik import açılışda crash verir,
// ona görə təhlükəsiz require ilə yükləyirik (yoxdursa OTA sadəcə passiv qalır).
let Updates: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Updates = require('expo-updates');
} catch {
  Updates = null;
}

export interface StoreUpdate {
  version: string;
  url: string;
  message: string;
  force: boolean;
}

interface VersionInfo {
  enabled?: boolean;
  latestVersion?: string;
  minVersion?: string;
  ios?: string;
  android?: string;
  message?: string;
}

const CURRENT_VERSION = Constants.expoConfig?.version ?? '1.0.0';

/** "1.2.0" > "1.1.5" → true (sadə semver müqayisəsi). */
function isNewer(latest: string, current: string): boolean {
  const a = latest.split('.').map((n) => parseInt(n, 10) || 0);
  const b = current.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

/**
 * İki növ güncəlləməni idarə edir:
 *  1) OTA (expo-updates) — JS/dizayn dəyişikliyi, store-suz. Yüklənib hazır olanda
 *     banner göstərilir; tıklananda reloadAsync ilə tətbiqə tətbiq olunur.
 *  2) Store versiyası — serverdəki app-version.json-dakı latestVersion cari native
 *     versiyadan böyükdürsə, banner App Store / Play Store-a yönləndirir.
 */
export function useAppUpdate() {
  const [otaReady, setOtaReady] = useState(false);
  const [storeUpdate, setStoreUpdate] = useState<StoreUpdate | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // 1) OTA yoxlaması (yalnız real build-də; dev/Expo Go-da isEnabled=false)
    (async () => {
      try {
        if (!Updates?.isEnabled || __DEV__) return;
        const check = await Updates.checkForUpdateAsync();
        if (check.isAvailable) {
          await Updates.fetchUpdateAsync();
          if (!cancelled) setOtaReady(true);
        }
      } catch {
        // sükutla keç — update mexanizmi UX-i bloklamamalıdır
      }
    })();

    // 2) Store versiyası (server-idarəli statik JSON)
    (async () => {
      try {
        const res = await fetch(APP_VERSION_URL, { cache: 'no-store' as RequestCache });
        if (!res.ok) return;
        const info: VersionInfo = await res.json();
        if (info.enabled === false) return; // admin banneri söndürüb
        const latest = info.latestVersion;
        if (!latest || !isNewer(latest, CURRENT_VERSION)) return;
        const url = (Platform.OS === 'ios' ? info.ios : info.android) ?? info.ios ?? info.android;
        if (!url) return;
        const force = !!info.minVersion && isNewer(info.minVersion, CURRENT_VERSION);
        if (!cancelled) {
          setStoreUpdate({ version: latest, url, message: info.message ?? 'Yeni versiya mövcuddur', force });
        }
      } catch {
        // şəbəkə xətası — banner göstərilməsin
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const applyOta = useCallback(async () => {
    try {
      if (Updates?.reloadAsync) await Updates.reloadAsync();
    } catch {
      /* no-op */
    }
  }, []);

  const openStore = useCallback(() => {
    if (storeUpdate?.url) Linking.openURL(storeUpdate.url).catch(() => {});
  }, [storeUpdate]);

  const dismiss = useCallback(() => setDismissed(true), []);

  // Store update OTA-dan üstündür (native versiya köhnədirsə əvvəl onu göstər)
  const mode: 'store' | 'ota' | null = storeUpdate ? 'store' : otaReady ? 'ota' : null;
  const visible = mode !== null && (!dismissed || (mode === 'store' && storeUpdate!.force));

  return {
    visible,
    mode,
    storeUpdate,
    currentVersion: CURRENT_VERSION,
    applyOta,
    openStore,
    dismiss,
  };
}
