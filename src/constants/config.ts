// Production API — kimi.az domeni üzərindən (eyni server, /api proxy host-agnostik)
export const API_BASE_URL = __DEV__
  ? 'https://kimi.az/api'
  : 'https://kimi.az/api';

// API origin (/api olmadan).
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

// Server-idarəli versiya/update məlumatı — admin paneldən idarə olunur
// (GET /api/app-version). Dəyişmək üçün build/OTA lazım deyil.
export const APP_VERSION_URL = `${API_BASE_URL}/app-version`;

export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 dəqiqə
export const OTP_RESEND_SECONDS = 60;

// ─── Google OAuth client ID-ləri ──────────────────────────────────────────
// Google Cloud Console → APIs & Services → Credentials → OAuth client ID.
// Boş qaldıqca Google girişi avtomatik gizlənir (düymə görünmür).
// expoClientId/webClientId = "Web application" client; iosClientId = "iOS"; androidClientId = "Android".
export const GOOGLE_AUTH = {
  webClientId: '',     // məs: 'xxxx.apps.googleusercontent.com'
  iosClientId: '',
  androidClientId: '',
};

export const GOOGLE_AUTH_ENABLED =
  !!(GOOGLE_AUTH.webClientId || GOOGLE_AUTH.iosClientId || GOOGLE_AUTH.androidClientId);
