import apiClient from './client';
import { RegisterPayload, LoginPayload, OTPPayload, AuthResponse } from '../types/auth.types';

export const registerUser = (data: RegisterPayload) =>
  apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const loginUser = (data: LoginPayload) => {
  // Uyğunluq: yeni backend `identifier`, köhnə backend `email` gözləyir.
  // whitelist:true artıq sahələri atdığı üçün ikisini də göndəririk.
  const isEmail = data.identifier.includes('@');
  const payload = {
    ...data,
    ...(isEmail ? { email: data.identifier } : { phone: data.identifier }),
  };
  return apiClient.post<AuthResponse>('/auth/login', payload).then((r) => r.data);
};

export const googleAuth = (idToken: string, role?: 'student' | 'teacher' | 'parent') =>
  apiClient.post<AuthResponse>('/auth/google', { idToken, role }).then((r) => r.data);

export const requestOtp = (phone: string) =>
  apiClient.post<{ message: string; status: string }>('/auth/request-otp', { phone }).then((r) => r.data);

export const verifyOTP = (data: OTPPayload) =>
  apiClient.post<AuthResponse>('/auth/verify', data).then((r) => r.data);

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  apiClient.post<{ message: string }>('/auth/change-password', data).then((r) => r.data);

// Şifrəni unudanlar üçün: nömrəyə bərpa kodu göndər
export const forgotPassword = (phone: string) =>
  apiClient.post<{ message: string; status: string }>('/auth/forgot-password', { phone }).then((r) => r.data);

// Şifrəni unudanlar üçün: kod + yeni şifrə → token (avtomatik giriş)
export const resetPassword = (data: { phone: string; code: string; newPassword: string }) =>
  apiClient.post<AuthResponse>('/auth/reset-password', data).then((r) => r.data);
