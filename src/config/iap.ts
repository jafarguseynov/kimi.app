import { Platform } from 'react-native';
import { Routes } from '../constants/routes';

/**
 * Apple App Store Review Guideline 3.1.1 uyğunluğu.
 *
 * iOS-da rəqəmsal abunəlik/premium satınalması və xarici ödənişə yönləndirmə
 * QADAĞANDIR. Bu bayraq YALNIZ iOS-da bütün ödəniş axınlarını söndürür.
 * Android və Web heç bir şəkildə təsirlənmir — onlar ePoint/kart axını ilə
 * əvvəlki kimi işləyir.
 *
 * Qeyd: Bu real bir cihaz/platforma yoxlamasıdır (Platform.OS), admin
 * feature-flag deyil — App Store buildində dəyişməz şəkildə bağlı qalır.
 */
export const PAYMENTS_ENABLED = Platform.OS !== 'ios';

/** Rahatlıq üçün: iOS-da olub-olmadığımız. */
export const IS_IOS = Platform.OS === 'ios';

/**
 * Premium "giriş nöqtələri" (menyu, alert, banner düymələri) bura yönəlir.
 * - Android/Web: qiymətli paket siyahısı (Plans → satınalma).
 * - iOS: yalnız-məlumat Premium səhifəsi (PremiumBenefits → qiymət/CTA yoxdur).
 */
export const PREMIUM_ENTRY_ROUTE = PAYMENTS_ENABLED ? Routes.Plans : Routes.PremiumBenefits;

/**
 * Rola uyğun premium səhifəsi.
 *
 * Müəllim HƏR İKİ platformada `PremiumBenefits`-ə gedir — orada rola görə
 * müəllim satış səhifəsi (paket seçimi daxil) render olunur. Ümumi `Plans`
 * ekranı şagird dilində danışır (limitsiz imtahan, AI mentor), müəllimin isə
 * paketdən aldığı şey şagird sorğularıdır.
 * Şagird/valideyn üçün davranış DƏYİŞMİR.
 */
export const premiumRouteFor = (role?: string | null) =>
  role === 'teacher' ? Routes.PremiumBenefits : PREMIUM_ENTRY_ROUTE;
