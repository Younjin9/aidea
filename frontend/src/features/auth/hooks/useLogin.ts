import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/shared/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { LoginRequest, AuthResponse } from '@/shared/types/auth.types';
import { AxiosError } from 'axios';

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, AxiosError, LoginRequest>({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // API 응답 구조에 따라 조정 필요 (예: data.user, data.accessToken)
      setAuth(data.user, data.accessToken);
      // 로그인 성공 후 메인 페이지(피드)로 이동
      navigate('/shorts');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // 에러 처리는 UI 컴포넌트에서 isError 등을 통해 수행하거나 여기서 토스트 메시지 등을 띄울 수 있음
    },
  });
};
