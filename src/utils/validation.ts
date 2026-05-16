import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 hərf olmalıdır'),
  email: z.string().email('Email düzgün deyil'),
  phone: z.string().regex(/^\+994[0-9]{9}$/, 'Telefon +994XXXXXXXXX formatında olmalıdır'),
  password: z.string().min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
});

export const loginSchema = z.object({
  email: z.string().email('Email düzgün deyil'),
  password: z.string().min(1, 'Şifrə daxil edin'),
});

export const otpSchema = z.object({
  code: z.string().length(6, 'OTP 6 rəqəm olmalıdır'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
