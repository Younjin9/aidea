import type { User } from './User.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SocialLoginRequest {
    token: string;
    provider: 'kakao' | 'google' | 'naver';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignUpRequest {
    email: string;
    password: string;
    nickname: string;
}
