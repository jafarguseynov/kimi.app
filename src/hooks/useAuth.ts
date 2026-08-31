import { useMutation } from '@tanstack/react-query';
import { registerUser, loginUser, verifyOTP, requestOtp, forgotPassword, resetPassword } from '../api/auth.api';
import { deleteToken } from '../utils/token';
import { useAuthStore } from '../store/auth.store';
import { useUserStore } from '../store/user.store';
import { useOnboardingStore } from '../store/onboarding.store';
import { savePushToken } from '../api/notification.api';
import { RegisterPayload, LoginPayload, OTPPayload } from '../types/auth.types';

export const useRegister = () => {
  const { setToken } = useAuthStore();
  const { setUser } = useUserStore();
  const { setPendingTeacherSetup } = useOnboardingStore();

  return useMutation({
    mutationFn: (data: RegisterPayload) => registerUser(data),
    onSuccess: async (data) => {
      // Backend telefon təsdiqi tələb edirsə (məcburi OTP gate) hesabı hələ girişə salma —
      // ekran OTP-yə yönləndirir, təsdiqdən sonra token verilir.
      if (data.requiresOtp && !data.user?.isVerified) return;
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
  const { setPendingTeacherSetup } = useOnboardingStore();

  return useMutation({
    mutationFn: (data: OTPPayload) => verifyOTP(data),
    onSuccess: async (data) => {
      await setToken(data.token);
      setUser(data.user);
      // Təsdiqdən sonra yeni müəllim → profil tamamlama addımı (qeydiyyat gate-lidirsə burada işarələnir)
      if (data.user?.role === 'teacher') setPendingTeacherSetup(true);
    },
  });
};

// Şifrəni unutdum: nömrəyə bərpa kodu göndər
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (phone: string) => forgotPassword(phone),
  });
};

// Şifrəni unutdum: kod + yeni şifrə → token saxla (avtomatik giriş)
export const useResetPassword = () => {
  const { setToken } = useAuthStore();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: { phone: string; code: string; newPassword: string }) => resetPassword(data),
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
    // Cihazın push tokenini SERVERDƏ də bu hesabdan ayır. Əks halda hesab
    // sətrində qalır və istifadəçi çıxandan sonra da köhnə hesaba aid
    // bildirişlər (məs. "profilini tamamla") bu cihaza gəlirdi.
    // Token hələ etibarlıdır — sorğu çıxışdan ƏVVƏL göndərilməlidir.
    try {
      await savePushToken(null);
    } catch {
      /* şəbəkə yoxdur — çıxış yenə də baş tutmalıdır */
    }
    await clearAuth();
    clearUser();
  };
};
