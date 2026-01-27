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
  NicknameCheckResult,
  BaseResponse
} from '@/shared/types/auth.types';

export const authApi = {
  // 카카오 로그인 URL 반환 (직접 이동용) or API 호출이 아니라 리다이렉트만 하면 됨
  getKakaoLoginUrl: () => {
    // 백엔드로 요청을 보내면 302 리다이렉트를 주거나, 프론트에서 바로 이 주소로 이동해야 함.
    // 명세에 "GET /oauth2/authorization/kakao" 브라우저 리디렉션을 통해 처리된다고 함.
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/oauth2/authorization/kakao`;
  },

  // 1. 회원가입
  join: async (data: SignUpRequest): Promise<JoinResponse> => {
    // API Spec: POST /api/auth/signup
    const response = await apiClient.post<JoinResponse>('/auth/signup', data);
    return response as unknown as JoinResponse;
  },

  // 2. 로그인
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // API Spec: POST /api/auth/login
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
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
    // API Spec: GET /api/users/me
    const response = await apiClient.get<MeResponse>('/users/me');
    return response as unknown as MeResponse;
  },

  // 6. 위치 업데이트
  updateLocation: async (data: { lat: number; lng: number; region: string }): Promise<BaseResponse<null>> => {
      // API Spec: PUT /api/users/me/location
      const response = await apiClient.put<BaseResponse<null>>('/users/me/location', data);
      return response as unknown as BaseResponse<null>;
  },

  // 7. 닉네임 중복 확인
  checkNickname: async (nickname: string): Promise<BaseResponse<NicknameCheckResult>> => {
    // API Spec: POST /api/users/nickname-check
    const response = await apiClient.post<BaseResponse<NicknameCheckResult>>('/users/nickname-check', { nickname });
    return response as unknown as BaseResponse<NicknameCheckResult>;
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

