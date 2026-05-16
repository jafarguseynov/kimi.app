import apiClient from './client';
import { RegisterPayload, LoginPayload, OTPPayload, AuthResponse } from '../types/auth.types';

export const registerUser = (data: RegisterPayload) =>
  apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const loginUser = (data: LoginPayload) =>
  apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data);

export const verifyOTP = (data: OTPPayload) =>
  apiClient.post<AuthResponse>('/auth/verify', data).then((r) => r.data);
