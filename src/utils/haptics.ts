import { Platform } from 'react-native';

// expo-haptics-i yalnız lazım olduqda və yalnız native-də yüklə (web-də modul yoxdur).
// Heç bir funksiya throw etmir — haptik dəstəklənməyən cihazda sadəcə susur.
type HapticsModule = typeof import('expo-haptics');
let _mod: HapticsModule | null | undefined;

function getMod(): HapticsModule | null {
  if (_mod !== undefined) return _mod;
  if (Platform.OS === 'web' || !nativeHapticsAvailable()) {
    _mod = null;
    return null;
  }
  try {
    // @ts-ignore — Metro runtime require
    _mod = require('expo-haptics') as HapticsModule;
  } catch {
    _mod = null;
  }
  return _mod;
}

// ExpoHaptics native modulu cari runtime-da varmı? requireOptionalNativeModule
// throw etmir — yoxdursa null. Modul yoxdursa `require('expo-haptics')` çağırılmır.
function nativeHapticsAvailable(): boolean {
  try {
    // @ts-ignore — Metro runtime require; expo-modules-core həmişə mövcuddur
    const core = require('expo-modules-core');
    return !!core?.requireOptionalNativeModule?.('ExpoHaptics');
  } catch {
    return false;
  }
}

/** Yüngül toxunuş (düymə, seçim). */
export function hapticLight(): void {
  try {
    const H = getMod();
    H?.impactAsync(H.ImpactFeedbackStyle.Light);
  } catch {}
}

/** Orta toxunuş (təsdiq, keçid). */
export function hapticMedium(): void {
  try {
    const H = getMod();
    H?.impactAsync(H.ImpactFeedbackStyle.Medium);
  } catch {}
}

/** Güclü toxunuş (vacib hadisə). */
export function hapticHeavy(): void {
  try {
    const H = getMod();
    H?.impactAsync(H.ImpactFeedbackStyle.Heavy);
  } catch {}
}

/** Seçim dəyişdi (segment, sürüşdürmə). */
export function hapticSelection(): void {
  try {
    getMod()?.selectionAsync();
  } catch {}
}

/** Uğur (yaxşı nəticə, tamamlandı). */
export function hapticSuccess(): void {
  try {
    const H = getMod();
    H?.notificationAsync(H.NotificationFeedbackType.Success);
  } catch {}
}

/** Xəbərdarlıq. */
export function hapticWarning(): void {
  try {
    const H = getMod();
    H?.notificationAsync(H.NotificationFeedbackType.Warning);
  } catch {}
}

/** Xəta (səhv cavab). */
export function hapticError(): void {
  try {
    const H = getMod();
    H?.notificationAsync(H.NotificationFeedbackType.Error);
  } catch {}
}
