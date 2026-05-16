// Development-da localhost:3000, production-da real URL
export const API_BASE_URL = __DEV__
  ? 'https://kimi-az-api.onrender.com/api'
  : 'https://kimi-az-api.onrender.com/api';

export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 dəqiqə
export const OTP_RESEND_SECONDS = 60;
