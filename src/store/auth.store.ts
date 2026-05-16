import { create } from 'zustand';
import { saveToken, deleteToken } from '../utils/token';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setToken: async (token) => {
    await saveToken(token);
    set({ token, isAuthenticated: true });
  },

  clearAuth: async () => {
    await deleteToken();
    set({ token: null, isAuthenticated: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
