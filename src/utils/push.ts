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
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
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
      await N.setNotificationChannelAsync('default', {
        name: 'Ümumi bildirişlər',
        importance: N.AndroidImportance.DEFAULT,
        lightColor: '#006190',
      }).catch(() => {});
    }

    const existing = await N.getPermissionsAsync();
    let status = existing.status as PushPermissionStatus;
    if (status !== 'granted') {
      const req = await N.requestPermissionsAsync();
      status = req.status as PushPermissionStatus;
    }
    if (status !== 'granted') return { status, token: null };

    let token: string | null = null;
    try {
      const res = projectId
        ? await N.getExpoPushTokenAsync({ projectId })
        : await N.getExpoPushTokenAsync();
      token = res.data;
    } catch {
      // EAS projectId hələ yoxdursa (eas init işlədilməyib) token alınmır — app pozulmur.
      token = null;
    }
    return { status, token };
  } catch {
    return { status: 'unsupported', token: null };
  }
}
