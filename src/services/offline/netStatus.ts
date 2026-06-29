import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

interface NetState {
  isOnline: boolean;
  setOnline: (v: boolean) => void;
}

/** Onlayn/offline statusu — NetInfo dinləyicisindən yenilənir. */
export const useNetStatus = create<NetState>((set) => ({
  isOnline: true, // başlanğıcda optimist; NetInfo dərhal düzəldir
  setOnline: (isOnline) => set({ isOnline }),
}));

let started = false;
let onReconnect: (() => void) | null = null;

/** Onlayn vəziyyət qayıdanda çağırılacaq callback (məs. submit növbəsini boşalt). */
export function setOnReconnect(cb: () => void) {
  onReconnect = cb;
}

/** Tətbiq başlananda bir dəfə çağırılır — NetInfo dinləyicisini qoşur. */
export function startNetWatcher() {
  if (started) return;
  started = true;
  NetInfo.addEventListener((state) => {
    const online = !!state.isConnected && state.isInternetReachable !== false;
    const wasOnline = useNetStatus.getState().isOnline;
    useNetStatus.getState().setOnline(online);
    // offline → online keçidində növbəni boşalt
    if (online && !wasOnline && onReconnect) onReconnect();
  });
}

/** Anlıq yoxlama (NetInfo store-undan). */
export function isOnlineNow(): boolean {
  return useNetStatus.getState().isOnline;
}
