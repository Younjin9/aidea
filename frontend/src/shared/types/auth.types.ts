import type { User } from './User.types';

// ==========================================
// Auth Request Types
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  phoneNumber?: string;
  birthDate?: string; // "YYYY-MM-DD"
  gender?: 'MALE' | 'FEMALE';
  profileImage?: string;
  location?: string; // "서울특별시 강남구"
  latitude?: number;
  longitude?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface NicknameCheckRequest {
  nickname: string;
}

export interface NicknameCheckResult {
  available: boolean;
  message: string;
}

// ==========================================
// Auth Response Data Types
// ==========================================

export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface JoinResponseData extends User {
  // User interface fields + potentially others if any
}

// ==========================================
// API Response Wrappers
// ==========================================

// Generic response wrapper based on the spec
// { success: true, data: T, error: null }
export interface BaseResponse<T> {
  success: boolean;
  data: T;
  error?: any | null;
  message?: string | null; // Keep for backward compatibility if needed
}

export type AuthResponse = BaseResponse<AuthTokenData>;
export type JoinResponse = BaseResponse<JoinResponseData>;
export type RefreshResponse = BaseResponse<AuthTokenData>;
export type LogoutResponse = BaseResponse<null>;
export type MeResponse = BaseResponse<User>;

