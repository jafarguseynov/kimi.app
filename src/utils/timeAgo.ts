/**
 * «2 saat əvvəl» tipli nisbi vaxt.
 *
 * Eyni funksiya əvvəl `AllOpenRequestsScreen` içində lokal olaraq vardı;
 * müəllim iş panelində də lazım oldu, ona görə ora çıxarıldı. Mətnlər
 * `allOpenRequests.time*` açarlarındadır (az/ru/en-də onsuz da mövcuddur).
 */
export function timeAgo(iso: string, t: (k: string, v?: any) => string): string {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) return '';
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('allOpenRequests.timeNow');
  if (m < 60) return t('allOpenRequests.timeMin', { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('allOpenRequests.timeHour', { n: h });
  const d = Math.floor(h / 24);
  if (d < 7) return t('allOpenRequests.timeDay', { n: d });
  return t('allOpenRequests.timeWeek', { n: Math.floor(d / 7) });
}
