// Production API (kimi.creativegroup.az serverində — pm2 + nginx/PHP bridge)
export const API_BASE_URL = __DEV__
  ? 'https://kimi.creativegroup.az/api'
  : 'https://kimi.creativegroup.az/api';

// API origin (/api olmadan).
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

// Server-idarəli versiya/update məlumatı — admin paneldən idarə olunur
// (GET /api/app-version). Dəyişmək üçün build/OTA lazım deyil.
export const APP_VERSION_URL = `${API_BASE_URL}/app-version`;

export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 dəqiqə
export const OTP_RESEND_SECONDS = 60;
