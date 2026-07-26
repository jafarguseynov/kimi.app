import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// ⚠️ expo-notifications Expo Go-da (SDK 53+) native push modulu ('ExpoPushTokenManager')
// daşımır — statik import edilsə app açılışda çökür. Ona görə həm bu modul, həm də cihaz
// yoxlaması üçün YALNIZ lazy `require` istifadə olunur (heç vaxt eager deyil). Statik olaraq
// yalnız core `expo-constants` import olunur. Push dəstəklənməyən runtime-da → "unsupported".
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === 'expo';

// EAS projectId — `eas init` app.json-a `extra.eas.projectId` yazır; token üçün lazımdır.
const projectId =
  ((Constants.expoConfig as any)?.extra?.eas?.projectId as string | undefined) ||
  ((Constants as any)?.easConfig?.projectId as string | undefined) ||
  undefined;

type NotificationsModule = typeof import('expo-notifications');
let _mod: NotificationsModule | null | undefined;
let _handlerSet = false;

// Hazırda açıq olan chat otağının id-si (fokusda). WhatsApp kimi: istifadəçi məhz həmin
// söhbətə baxırsa, o söhbətin ön-plan bildirişini göstərmə (mesaj onsuz da ekrandadır).
let _activeChatId: string | null = null;
export function setActiveChatId(chatId: string | null) {
  _activeChatId = chatId;
}

// Modulu yalnız çağırıldıqda və yalnız Expo Go-dan kənarda yüklə.
function getMod(): NotificationsModule | null {
  if (_mod !== undefined) return _mod;
  if (isExpoGo) {
    _mod = null;
    return null;
  }
  try {
    // @ts-ignore — Metro runtime require; bu sətir yalnız Expo Go-dan kənarda icra olunur
    _mod = require('expo-notifications') as NotificationsModule;
  } catch {
    _mod = null;
  }
  if (_mod && !_handlerSet) {
    _handlerSet = true;
    try {
      _mod.setNotificationHandler({
        handleNotification: async (notification: any) => {
          // Ön-plan davranışı: bildiriş banner + səs (WhatsApp kimi telefon ekranında).
          const data = notification?.request?.content?.data ?? {};
          // İstifadəçi məhz həmin söhbətə baxırsa — o çatın bildirişini sus (mesaj görünür).
          const muteThisChat =
            data?.type === 'chat_message' && !!_activeChatId && data?.chatId === _activeChatId;
          return {
            shouldShowBanner: !muteThisChat,
            shouldShowList: true,
            shouldPlaySound: !muteThisChat,
            shouldSetBadge: false,
          };
        },
      });
    } catch {
      /* handler qurula bilmədi — kritik deyil */
    }
  }
  return _mod;
}

// Real cihaz? (simulyatorda push token alınmır.) expo-device olmasa belə pozulmasın.
function isRealDevice(): boolean {
  if (isExpoGo) return true; // Expo Go-da onsuz da getMod() null qaytarır
  try {
    // @ts-ignore — Metro runtime require
    const Device = require('expo-device');
    return Device?.isDevice !== false;
  } catch {
    return true; // modul yoxdursa, mane olma
  }
}

// Expo push token-i al. ⚠️ İcazə ilk dəfə veriləndən DƏRHAL sonra `getExpoPushTokenAsync`
// tez-tez null/xəta qaytarır — çünki APNs (iOS) / FCM (Android) cihaz qeydiyyatı hələ
// tamamlanmayıb. Bu, yeni qeydiyyatdan keçən istifadəçilərin bildiriş almamasının əsas
// səbəbi idi (token serverə heç vaxt getmirdi). Ona görə bir neçə dəfə qısa gecikmə ilə
// təkrar cəhd edirik.
async function fetchExpoTokenWithRetry(N: NotificationsModule, attempts = 3): Promise<string | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = projectId
        ? await N.getExpoPushTokenAsync({ projectId })
        : await N.getExpoPushTokenAsync();
      if (res?.data) return res.data;
    } catch {
      // EAS projectId yoxdursa və ya cihaz qeydiyyatı hazır deyilsə — növbəti cəhd.
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';

// Cari OS icazə statusunu oxu (dialoq AÇMADAN). Dəstəklənməyən runtime → 'unsupported'.
export async function getPermissionStatus(): Promise<PushPermissionStatus> {
  try {
    const N = getMod();
    if (!N || !isRealDevice()) return 'unsupported';
    const { status } = await N.getPermissionsAsync();
    return status as PushPermissionStatus;
  } catch {
    return 'unsupported';
  }
}

// İcazə istə (OS dialoqu) və mümkünsə Expo push token al.
// Heç vaxt throw etmir — Expo Go / EAS konfiqurasiyasız hallarda da təhlükəsizdir.
export async function requestAndRegister(): Promise<{ status: PushPermissionStatus; token: string | null }> {
  try {
    const N = getMod();
    if (!N || !isRealDevice()) return { status: 'unsupported', token: null };

    if (Platform.OS === 'android') {
      await setupAndroidChannels(N);
    }

    const existing = await N.getPermissionsAsync();
    let status = existing.status as PushPermissionStatus;
    if (status !== 'granted') {
      const req = await N.requestPermissionsAsync();
      status = req.status as PushPermissionStatus;
    }
    if (status !== 'granted') return { status, token: null };

    // İcazə yeni verilibsə cihaz qeydiyyatı bir anlıq gecikə bilər — təkrar cəhdli al.
    const token = await fetchExpoTokenWithRetry(N);
    return { status, token };
  } catch {
    return { status: 'unsupported', token: null };
  }
}

// Səssiz token yeniləmə (OS dialoqu AÇMADAN). Yalnız icazə ARTIQ verilibsə token qaytarır.
// Hər tətbiq açılışında çağırılır ki, tokeni rotasiya olan və ya onboarding-i push əlavə
// olunmadan keçən köhnə istifadəçilər üçün də token serverdə güncəl qalsın.
export async function refreshTokenIfGranted(): Promise<string | null> {
  try {
    const N = getMod();
    if (!N || !isRealDevice()) return null;
    if (Platform.OS === 'android') await setupAndroidChannels(N);
    const { status } = await N.getPermissionsAsync();
    if (status !== 'granted') return null;
    return await fetchExpoTokenWithRetry(N);
  } catch {
    return null;
  }
}

// kimi.az bildiriş səsləri (app bundle-a app.json `sounds` ilə yığılır).
// Admin paneldən hansının aktiv olacağı seçilir; backend push payload-da
// `sound: '<fayl>.wav'` göndərir. Android-də səs yalnız həmin səslə qurulmuş
// kanal vasitəsilə işləyir — ona görə hər səs üçün ayrıca kanal yaradılır.
// ⚠️ Bu siyahı app.json `sounds` massivi və admin dropdown ilə sinxron olmalıdır.
export const NOTIFICATION_SOUNDS = [
  'kimi_notify.wav',
  'kimi_ding.wav',
  'kimi_chime.wav',
  'kimi_pop.wav',
  'kimi_soft.wav',
] as const;

// Səs faylı → Android kanal id-si (backend ExpoPushService ilə eyni qayda).
export function soundChannelId(sound: string): string {
  return 'snd_' + sound.replace(/\.[^.]+$/, '');
}

// Android bildiriş kanallarını qurur ('default' + hər səs üçün ayrıca səsli kanal).
// WhatsApp kimi titrəmə ritmi (ms): gözlə, titrə, gözlə, titrə.
const VIBRATION_PATTERN = [0, 250, 250, 250];

async function setupAndroidChannels(N: NotificationsModule) {
  // Əsas kanal: sistem səsi + HIGH importance (kilid ekranı/heads-up banner) + vibrasiya.
  // Backend `sound` göndərməyəndə və ya 'default' olanda push bu kanala düşür (ExpoPushService).
  await N.setNotificationChannelAsync('default', {
    name: 'Ümumi bildirişlər',
    importance: N.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: VIBRATION_PATTERN,
    enableVibrate: true,
    showBadge: true,
    lightColor: '#006190',
    lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
  }).catch(() => {});
  for (const sound of NOTIFICATION_SOUNDS) {
    await N.setNotificationChannelAsync(soundChannelId(sound), {
      name: `Kimi.az — ${sound.replace(/\.[^.]+$/, '')}`,
      importance: N.AndroidImportance.HIGH,
      sound,
      vibrationPattern: VIBRATION_PATTERN,
      enableVibrate: true,
      showBadge: true,
      lightColor: '#006190',
      lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
    }).catch(() => {});
  }
}

// App açılışında kanalları əvvəlcədən qur (icazədən asılı olmadan). Təhlükəsiz no-op.
export async function ensureNotificationChannels(): Promise<void> {
  try {
    const N = getMod();
    if (!N || Platform.OS !== 'android') return;
    await setupAndroidChannels(N);
  } catch {
    /* kritik deyil */
  }
}

type Sub = { remove: () => void };

// İstifadəçi bildirişə toxunduqda çağırılır (app açıq/arxa planda/bağlı).
// Qaytarılan abunəliyi useEffect cleanup-da remove() ilə ləğv et.
export function addNotificationResponseListener(
  handler: (data: Record<string, any>) => void,
): Sub | null {
  try {
    const N = getMod();
    if (!N) return null;
    const sub = N.addNotificationResponseReceivedListener((response: any) => {
      const data = response?.notification?.request?.content?.data ?? {};
      handler(data as Record<string, any>);
    });
    return sub as Sub;
  } catch {
    return null;
  }
}

// Bildiriş app ön planda olarkən gəldikdə (banner/səs handler tərəfindən idarə olunur).
export function addNotificationReceivedListener(
  handler: (data: Record<string, any>) => void,
): Sub | null {
  try {
    const N = getMod();
    if (!N) return null;
    const sub = N.addNotificationReceivedListener((notification: any) => {
      const data = notification?.request?.content?.data ?? {};
      handler(data as Record<string, any>);
    });
    return sub as Sub;
  } catch {
    return null;
  }
}
