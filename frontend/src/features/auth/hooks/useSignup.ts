import { useMutation } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';
import { authApi } from '@/shared/api/authApi';
import type { SignUpRequest, JoinResponse } from '@/shared/types/auth.types';
import { AxiosError } from 'axios';

export const useSignup = () => {
  // const navigate = useNavigate();

  return useMutation<JoinResponse, AxiosError, SignUpRequest>({
    mutationFn: (data: SignUpRequest) => authApi.join(data),
    onError: (error) => {
      console.error('Signup failed:', error);
    },
  });
};
