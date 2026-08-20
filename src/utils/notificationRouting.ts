import { storage } from '../services/offline/storage';
import {
  DEFAULT_ACTION_IDENTIFIER,
  clearLastNotificationResponse,
  type NotificationResponseInfo,
} from './push';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * NİYƏ BU FAYL VAR — Android-də "Bildirişlər səhifəsi özbaşına açılır" problemi
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * expo-notifications Android-də bildiriş cavabını Activity-nin Intent extras-ından
 * oxuyur (`ExpoNotificationLifecycleListener.onCreate` → `activity.getIntent()`):
 *
 *   Intent intent = activity.getIntent();
 *   Bundle extras = intent.getExtras();
 *   if (extras != null) mNotificationManager.onNotificationResponseFromExtras(extras);
 *
 * Android-də tapşırığı (task) başladan Intent SİSTEMDƏ QALIR. Yəni istifadəçi bir
 * dəfə bildirişə toxunub tətbiqi açdıqdan sonra, MIUI/Redmi kimi arxa fon proseslərini
 * aqressiv öldürən cihazlarda proses hər dəfə bərpa olunanda Activity ELƏ HƏMİN
 * köhnə Intent ilə yenidən yaradılır → köhnə bildiriş cavabı YENİDƏN emit olunur →
 * tətbiq yenə Bildirişlər səhifəsinə keçir. iOS-da belə bir mexanizm yoxdur,
 * ona görə problem yalnız Android-də görünür.
 *
 * Proses ölüb yenidən qalxdığı üçün yaddaşdaxili (in-memory) qoruma İŞLƏMİR —
 * "bu cavab emal olundu" qeydi DİSKDƏ saxlanmalıdır. Bu faylın işi budur.
 *
 * Qayda: eyni `identifier`-li cavab ömrü boyu yalnız BİR DƏFƏ naviqasiya edir.
 */

const HANDLED_KEY = 'push_handled_response_ids';
// Son N id saxlanılır (SecureStore dəyər limiti ~2KB; id-lər ~35 simvol).
const MAX_KEPT = 25;

let handledCache: string[] | null = null;
// Eyni anda gələn cavablar üçün seriallaşdırma — yarış vəziyyəti olmasın.
let chain: Promise<unknown> = Promise.resolve();

async function loadHandled(): Promise<string[]> {
  if (handledCache) return handledCache;
  handledCache = (await storage.get<string[]>(HANDLED_KEY).catch(() => null)) ?? [];
  return handledCache;
}

/**
 * Cavab HƏQİQƏTƏN istifadəçinin bildirişə toxunmasıdırmı?
 *
 * - `identifier` yoxdursa → bu, real bildiriş deyil. Android nativ kodu Activity-nin
 *   İSTƏNİLƏN extras-ını "cavab" kimi serialize edir (launcher/deep-link intent-ləri
 *   də daxil), amma belə hallarda `identifier` (google.message_id) boş olur.
 * - `actionIdentifier` özəl action düyməsidirsə → bu ayrı hadisədir, sükutla ötür.
 */
export function isGenuineNotificationTap(res: NotificationResponseInfo | null): boolean {
  if (!res) return false;
  if (!res.identifier) return false;
  if (res.actionIdentifier && res.actionIdentifier !== DEFAULT_ACTION_IDENTIFIER) return false;
  return true;
}

/**
 * Cavabı "emal üçün" tut. `true` yalnız bir dəfə — ilk dəfə — qayıdır.
 * `false` qayıdırsa naviqasiya EDİLMƏMƏLİDİR (təkrar/köhnə cavabdır).
 */
export function claimNotificationResponse(res: NotificationResponseInfo | null): Promise<boolean> {
  if (!isGenuineNotificationTap(res)) return Promise.resolve(false);
  const id = res!.identifier as string;

  const run = chain.then(async () => {
    const ids = await loadHandled();
    if (ids.includes(id)) return false;
    const next = [...ids, id].slice(-MAX_KEPT);
    handledCache = next;
    await storage.set(HANDLED_KEY, next).catch(() => {});
    // Nativ keşi də təmizlə ki, `getLastNotificationResponse()` onu təkrar verməsin.
    clearLastNotificationResponse();
    return true;
  });
  chain = run.catch(() => undefined);
  return run;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Naviqasiya növbəsi
 * ─────────────────────────────────────────────────────────────────────────────
 * Soyuq başlanğıcda (tətbiq bildirişə toxunularaq açılanda) cavab NavigationContainer
 * hazır olmazdan ƏVVƏL gəlir. Əvvəllər belə hallar sadəcə atılırdı (`isReady()` yoxlaması),
 * yəni real toxunuş bəzən heç yerə aparmırdı. İndi bir dənə gözləyən naviqasiya saxlanılır
 * və konteyner hazır olanda icra edilir. Bu, gecikmə/timeout deyil — hadisəyə bağlıdır.
 */
let pendingNavigation: (() => void) | null = null;

export function runWhenNavigationReady(isReady: () => boolean, fn: () => void): void {
  if (isReady()) {
    fn();
    return;
  }
  pendingNavigation = fn;
}

export function flushPendingNavigation(): void {
  const fn = pendingNavigation;
  pendingNavigation = null;
  fn?.();
}
