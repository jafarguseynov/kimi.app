// Production API (kimi.creativegroup.az serverində — pm2 + nginx/PHP bridge)
export const API_BASE_URL = __DEV__
  ? 'https://kimi.creativegroup.az/api'
  : 'https://kimi.creativegroup.az/api';

export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 dəqiqə
export const OTP_RESEND_SECONDS = 60;
