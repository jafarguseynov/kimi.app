import { Dimensions, PixelRatio, Platform } from 'react-native';

/**
 * Ekran ölçüsünə görə responsiv miqyaslama.
 *
 * Problem: dizayn iPhone-a yaxın enə (≈375dp) görə hazırlanıb. Samsung A5 2017
 * kimi dar/balaca ekranlarda (≈320–360dp) sabit dp ölçüləri proporsional olaraq
 * daha böyük görünür və ekrana sığmır. Burada eni baza enə görə miqyaslayırıq.
 */

const BASE_WIDTH = 375; // dizayn referans eni (dp)

const getWidth = () => {
  const { width, height } = Dimensions.get('window');
  // Landscape-də belə qısa kənarı əsas götür.
  return Math.min(width, height);
};

/** Verilmiş ölçünü ekran eninə görə miqyaslayır (çox kiçilməsin deyə 0.85 mərtəbə). */
export const scale = (size: number): number => {
  const factor = Math.max(0.85, Math.min(getWidth() / BASE_WIDTH, 1.15));
  return Math.round(size * factor);
};

/**
 * Şrift üçün responsiv ölçü. Eni miqyaslayır, sonra cihazın font miqyasını
 * (PixelRatio.getFontScale) məhdud saxlayır ki, böyük sistem şrifti layoutu dağıtmasın.
 */
export const rf = (size: number): number => {
  const scaled = scale(size);
  const fontScale = Math.min(PixelRatio.getFontScale(), 1.15);
  const px = scaled / Math.max(fontScale, 1); // sistem böyütməsini geri normalize et
  return Platform.OS === 'ios' ? Math.round(px) : Math.round(px) + 0.5;
};

/** Boşluq/ölçü üçün responsiv miqyas (rf-dən fərqli — font scale tətbiq olunmur). */
export const rs = (size: number): number => scale(size);
