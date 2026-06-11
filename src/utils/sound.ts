import { Platform } from 'react-native';

// In-app səs effektləri (expo-audio). Modul lazy yüklənir; web-də və ya modul
// yoxdursa səssiz no-op. Player-lər bir dəfə yaradılıb keş-lənir.
type AudioModule = typeof import('expo-audio');

type SoundKey = 'success' | 'soft' | 'spin' | 'jackpot' | 'win_small' | 'win_big';

const SOURCES: Record<SoundKey, number> = {
  success: require('../../assets/sounds/success.wav'),
  soft: require('../../assets/sounds/soft.wav'),
  spin: require('../../assets/sounds/spin.wav'),
  jackpot: require('../../assets/sounds/jackpot.wav'),
  win_small: require('../../assets/sounds/win_small.wav'),
  win_big: require('../../assets/sounds/win_big.wav'),
};

let _mod: AudioModule | null | undefined;
let _modeSet = false;
const _players: Partial<Record<SoundKey, any>> = {};

function getMod(): AudioModule | null {
  if (_mod !== undefined) return _mod;
  if (Platform.OS === 'web' || !nativeAudioAvailable()) {
    _mod = null;
    return null;
  }
  try {
    // @ts-ignore — Metro runtime require
    _mod = require('expo-audio') as AudioModule;
  } catch {
    _mod = null;
  }
  return _mod;
}

// ExpoAudio native modulu cari runtime-da varmı? (Expo Go / köhnə dev build-də ola
// bilməz.) requireOptionalNativeModule heç vaxt throw etmir — yoxdursa null qaytarır.
// Beləcə modul olmayanda `require('expo-audio')` ÜMUMİYYƏTLƏ çağırılmır → xəta yox.
function nativeAudioAvailable(): boolean {
  try {
    // @ts-ignore — Metro runtime require; expo-modules-core həmişə mövcuddur
    const core = require('expo-modules-core');
    return !!core?.requireOptionalNativeModule?.('ExpoAudio');
  } catch {
    return false;
  }
}

function ensureMode(A: AudioModule): void {
  if (_modeSet) return;
  _modeSet = true;
  try {
    // Cihaz səssiz (silent) rejimdə olsa belə effekt eşidilsin (iOS).
    A.setAudioModeAsync({ playsInSilentMode: true });
  } catch {}
}

function getPlayer(key: SoundKey): any | null {
  const A = getMod();
  if (!A) return null;
  ensureMode(A);
  if (!_players[key]) {
    try {
      _players[key] = A.createAudioPlayer(SOURCES[key]);
    } catch {
      _players[key] = null;
    }
  }
  return _players[key] ?? null;
}

function play(key: SoundKey): void {
  try {
    const p = getPlayer(key);
    if (!p) return;
    // Başa qaytar ki, ardıcıl çağırışlarda hər dəfə ba.dan səslənsin
    p.seekTo?.(0);
    p.play?.();
  } catch {}
}

/** Təntənəli "uğur" effekti — yaxşı nəticə, sertifikat və s. */
export function playSuccess(): void {
  play('success');
}

/** Yumşaq "tamamlandı" effekti — neytral hadisələr. */
export function playSoft(): void {
  play('soft');
}

/** Çarx fırlanma səsi — yavaşlayan tıqqıltı (~4.5s). */
export function playSpin(): void {
  play('spin');
}

/** Çarx fırlanmasını dayandır (ekrandan çıxılsa və ya erkən bitsə). */
export function stopSpin(): void {
  try {
    const p = getPlayer('spin');
    if (!p) return;
    p.pause?.();
    p.seekTo?.(0);
  } catch {}
}

/** Mükafat səsi — nadirliyə görə uyğunlaşır (canlı arkada səsləri). */
export function playReward(rarity: 'common' | 'rare' | 'epic' | 'legendary'): void {
  if (rarity === 'legendary') play('jackpot');
  else if (rarity === 'common') play('win_small');
  else play('win_big');
}
