import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { getToken } from '../utils/token';
import { useAuthStore } from '../store/auth.store';
import { useUserStore } from '../store/user.store';

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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      useUserStore.getState().clearUser();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
