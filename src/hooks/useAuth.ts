import { useMutation } from '@tanstack/react-query';
import { registerUser, loginUser, verifyOTP, requestOtp } from '../api/auth.api';
import { deleteToken } from '../utils/token';
import { useAuthStore } from '../store/auth.store';
import { useUserStore } from '../store/user.store';
import { useOnboardingStore } from '../store/onboarding.store';
import { RegisterPayload, LoginPayload, OTPPayload } from '../types/auth.types';

export const useRegister = () => {
  const { setToken } = useAuthStore();
  const { setUser } = useUserStore();
  const { setPendingTeacherSetup } = useOnboardingStore();

  return useMutation({
    mutationFn: (data: RegisterPayload) => registerUser(data),
    onSuccess: async (data) => {
      await setToken(data.token);
      setUser(data.user);
      // Yeni müəllim → ilk açılışda profil tamamlama addımı göstərilsin
      if (data.user?.role === 'teacher') setPendingTeacherSetup(true);
    },
  });
};

export const useLogin = () => {
  const { setToken } = useAuthStore();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: LoginPayload) => loginUser(data),
    onSuccess: async (data) => {
      await setToken(data.token);
      setUser(data.user);
    },
  });
};

export const useRequestOtp = () => {
  return useMutation({
    mutationFn: (phone: string) => requestOtp(phone),
  });
};

export const useVerifyOTP = () => {
  const { setToken } = useAuthStore();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: OTPPayload) => verifyOTP(data),
    onSuccess: async (data) => {
      await setToken(data.token);
      setUser(data.user);
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const { clearUser } = useUserStore();

  return async () => {
    await clearAuth();
    clearUser();
  };
};
