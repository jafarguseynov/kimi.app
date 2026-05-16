// Development-da localhost:3000, production-da real URL
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.kimi.az/api';

export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 dəqiqə
export const OTP_RESEND_SECONDS = 60;
