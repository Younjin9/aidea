import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/shared/api/authApi';
import type { SignUpRequest, JoinResponse } from '@/shared/types/auth.types';
import { AxiosError } from 'axios';

export const useSignup = () => {
  const navigate = useNavigate();

  return useMutation<JoinResponse, AxiosError, SignUpRequest>({
    mutationFn: (data: SignUpRequest) => authApi.join(data),
    onSuccess: (response) => {
      if (response.success) {
        // 회원가입 성공 시 추가 정보 입력 완료 페이지로 이동
        navigate('/signup/complete');
      }
    },
    onError: (error) => {
      console.error('Signup failed:', error);
    },
  });
};
