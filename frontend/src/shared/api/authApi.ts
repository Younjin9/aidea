import { apiClient } from '@/shared/api/client';
import type {
  LoginRequest,
  SignUpRequest,
  RefreshTokenRequest,
  AuthResponse,
  JoinResponse,
  LogoutResponse,
  RefreshResponse,
  MeResponse,
  // NicknameCheckRequest,
  BaseResponse
} from '@/shared/types/auth.types';

export const authApi = {
  // 카카오 로그인 URL 반환 (직접 이동용) or API 호출이 아니라 리다이렉트만 하면 됨
  getKakaoLoginUrl: () => {
    // 백엔드로 요청을 보내면 302 리다이렉트를 주거나, 프론트에서 바로 이 주소로 이동해야 함.
    // 명세에 "GET /oauth2/authorization/kakao" 브라우저 리디렉션을 통해 처리된다고 함.
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    return `${baseUrl}/users/oauth2/authorization/kakao`;
  },

  // 1. 회원가입
  join: async (data: SignUpRequest): Promise<JoinResponse> => {
    const response = await apiClient.post<JoinResponse>('/users/join', data);
    return response as unknown as JoinResponse;
  },

  // 2. 로그인
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/login', data);
    return response as unknown as AuthResponse;
  },

  // 3. 로그아웃
  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>('/users/logout');
    return response as unknown as LogoutResponse;
  },

  // 4. 토큰 재발급
  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshResponse> => {
      const response = await apiClient.post<RefreshResponse>('/users/refresh', data);
      return response as unknown as RefreshResponse;
  },

  // 5. 내 정보 조회
  getMe: async (): Promise<MeResponse> => {
      const response = await apiClient.get<MeResponse>('/users/me');
      return response as unknown as MeResponse;
  },

  // 6. 닉네임 중복 확인
  checkNickname: async (nickname: string): Promise<BaseResponse<boolean>> => {
      const response = await apiClient.post<BaseResponse<boolean>>('/users/nickname-check', { nickname });
      return response as unknown as BaseResponse<boolean>;
  },

  // 7. 내 정보 수정 (PATCH)
  updateMe: async (data: any): Promise<MeResponse> => {
      const response = await apiClient.patch<MeResponse>('/users/me', data);
      return response as unknown as MeResponse;
  },

  // 8. 관심사 설정 (PUT)
  updateInterests: async (interests: string[]): Promise<BaseResponse<null>> => {
      const response = await apiClient.put<BaseResponse<null>>('/users/interests', { interests });
      return response as unknown as BaseResponse<null>;
  }
};

