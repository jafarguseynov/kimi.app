/**
 * Expo config plugin — Android 16 (targetSdk 36) uyğunluq düzəlişləri.
 *
 * Play Console iki xəbərdarlıq verirdi (hər ikisi 113/1.1.5 buildində):
 *
 * 1) «Ön plan hizmeti türleri kısıtlandı» — expo-notifications manifestində
 *    BOOT_COMPLETED qəbuledicisi var (yenidən başlayandan sonra planlanmış
 *    bildirişləri bərpa edir), expo-audio isə foregroundServiceType="microphone"
 *    xidməti elan edir. Android 15+ məhz «microphone» kimi məhdud FGS tiplərinin
 *    BOOT_COMPLETED-dən başladılmasını qadağan edir, ona görə Play statik analizlə
 *    bu ikisini yan-yana görüb xəbərdarlıq yazır.
 *
 *    Tətbiq SƏS YAZMIR — expo-audio yalnız qısa effektlər çalmaq üçün işlədilir
 *    (src/utils/sound.ts), RECORD_AUDIO icazəsi onsuz da app.json-da bloklanıb.
 *    Yəni AudioRecordingService heç vaxt başladılmır; sadəcə manifestdə qalıb.
 *    Burada onu manifest merger səviyyəsində silirik (tools:node="remove").
 *    ⚠️ Gələcəkdə səs yazma funksiyası əlavə olunarsa, bu plugin geri götürülməlidir.
 *
 * 2) «Yön kısıtlamalarını kaldırın» — Android 16-dan etibarən targetSdk 36 olan
 *    tətbiqlərdə ≥600dp ekranlarda (planşet, qatlanan) portret kilidi nəzərə
 *    alınmır. Rəsmi müvəqqəti opt-out `PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY`
 *    xüsusiyyətidir — mövcud davranışı saxlayır, dizaynda heç nə dəyişmir.
 *    ⚠️ Bu opt-out yalnız targetSdk 36-da işləyir; targetSdk 37-yə keçəndə
 *    interfeys böyük ekrana uyğunlaşdırılmalı olacaq.
 */
const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * expo-audio-nun HƏR İKİ ön plan xidməti çıxarılır:
 *  - AudioRecordingService (microphone) — tətbiq səs yazmır
 *  - AudioControlsService  (mediaPlayback) — kilid ekranı idarəetmələri üçündür,
 *    yalnız `player.setActiveForLockScreen(...)` çağırılanda başlayır; kodda belə
 *    çağırış yoxdur (src-də axtarıldı). Android 15 BOOT_COMPLETED qadağa siyahısında
 *    mediaPlayback da olduğu üçün yalnız mikrofonu silmək Play xəbərdarlığını
 *    tam təmizləmirdi.
 * Səs effektləri (AudioPlayer) bu xidmətlərdən asılı deyil — çalınmağa davam edir.
 */
const REMOVED_SERVICES = [
  'expo.modules.audio.service.AudioRecordingService',
  'expo.modules.audio.service.AudioControlsService',
];
const RESIZE_PROPERTY = 'android.window.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY';

module.exports = function withAndroid16Compat(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    // tools: namespace olmasa `tools:node` işləmir (blockedPermissions da bunu tələb edir)
    manifest.$ = manifest.$ || {};
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const app = manifest.application && manifest.application[0];
    if (!app) return cfg;

    // 1) expo-audio-nun ön plan xidmətlərini birləşdirmə zamanı çıxar
    app.service = (app.service || []).filter(
      (s) => s.$ && !REMOVED_SERVICES.includes(s.$['android:name']),
    );
    for (const name of REMOVED_SERVICES) {
      app.service.push({ $: { 'android:name': name, 'tools:node': 'remove' } });
    }

    // 2) böyük ekranlarda portret kilidini hələlik qoru
    app.property = (app.property || []).filter(
      (p) => p.$ && p.$['android:name'] !== RESIZE_PROPERTY,
    );
    app.property.push({ $: { 'android:name': RESIZE_PROPERTY, 'android:value': 'true' } });

    return cfg;
  });
};
