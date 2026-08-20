import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { getToken } from '../utils/token';
import { useAuthStore } from '../store/auth.store';
import { useUserStore } from '../store/user.store';
import { reportOnline, reportOffline } from '../services/offline/netStatus';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    reportOnline(); // server cavab verdi → onlayn (offline idisə növbə boşalır)
    return response;
  },
  (error) => {
    // Şəbəkə xətası (server cavabı yoxdur) → offline işarələ.
    if (!error.response) reportOffline();
    // 401 → token etibarsız/bitmiş: yalnız auth-DAN KƏNAR route-larda çıxış et.
    // Auth route-larının (login/register) 401-i öz xəta mesajını göstərsin (səssiz logout yox).
    const url = error.config?.url ?? '';
    const isAuthRoute = /\/auth\//.test(url);
    if (error.response?.status === 401 && !isAuthRoute) {
      useAuthStore.getState().clearAuth();
      useUserStore.getState().clearUser();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
