/**
 * Onlayn/offline statusu — NetInfo native modulu OLMADAN (OTA uyğunluğu üçün).
 * Status axios interceptor-undan yenilənir: uğurlu cavab → online, şəbəkə xətası → offline.
 * Offline → online keçidində submit növbəsi avtomatik boşaldılır (onReconnect).
 */
let online = true;
let onReconnect: (() => void) | null = null;

export function isOnlineNow(): boolean {
  return online;
}

export function setOnReconnect(cb: () => void) {
  onReconnect = cb;
}

/** API çağırışı uğurlu oldu → onlayn (offline idisə → reconnect callback). */
export function reportOnline() {
  const was = online;
  online = true;
  if (!was && onReconnect) onReconnect();
}

/** API çağırışı şəbəkə xətası ilə bitdi → offline. */
export function reportOffline() {
  online = false;
}
