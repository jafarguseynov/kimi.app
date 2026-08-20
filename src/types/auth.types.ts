export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  school?: string;
  grade?: string;
  goal?: string;
  childName?: string;
  referralCode?: string;
  /** İstifadə şərtləri + məxfilik siyasətinin qəbulu (qeydiyyatda məcburi). */
  acceptedTerms?: boolean;
}

export interface LoginPayload {
  identifier: string; // email və ya telefon nömrəsi
  password: string;
}

export interface OTPPayload {
  phone: string;
  code: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  // Qeydiyyatda backend telefon təsdiqi tələb edirsə true olur → OTP ekranına yönləndir.
  requiresOtp?: boolean;
  otpStatus?: string;
}
