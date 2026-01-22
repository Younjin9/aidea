import { apiClient } from '@/shared/api/client';
import type { LoginRequest, AuthResponse, SignUpRequest } from '@/shared/types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // client.ts의 response interceptor가 response.data를 반환하므로 결과는 AuthResponse 형식이 됩니다.
    // AxiosInstance 타입 정의상 post는 Promise<AxiosResponse>를 반환한다고 되어있으나, 
    // 실제로는 interceptor에 의해 데이터만 반환되므로 타입 단언(as)을 사용합니다.
    const response = await apiClient.post<AuthResponse>('/api/users/login', data);
    return response as unknown as AuthResponse;
  },

  signup: async (data: SignUpRequest): Promise<void> => {
    await apiClient.post('/api/users/join', data);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/users/logout');
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/users/refresh');
    return response as unknown as AuthResponse;
  }
};
