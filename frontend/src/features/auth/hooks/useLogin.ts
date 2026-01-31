import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/shared/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { LoginRequest, AuthResponse } from '@/shared/types/auth.types';
import { AxiosError } from 'axios';

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, AxiosError, LoginRequest>({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        localStorage.setItem('refreshToken', refreshToken);
        setAuth(user, accessToken);
        
        // 필수 정보 및 관심사 확인 후 이동
        if (!user.gender || !user.location) {
          navigate('/onboarding/required-info');
        } else if (!user.interests || user.interests.length === 0) {
          navigate('/onboarding/interest');
        } else {
          navigate('/shorts');
        }
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // 에러 처리는 UI 컴포넌트에서 isError 등을 통해 수행하거나 여기서 토스트 메시지 등을 띄울 수 있음
    },
  });
};
