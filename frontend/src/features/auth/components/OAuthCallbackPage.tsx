import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/shared/api/authApi';

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const processLogin = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (accessToken && refreshToken) {
        try {
          // 1. 토큰 저장 (임시로 user는 null 로 설정하거나, 간단한 객체로 설정 후 getMe로 갱신)
           localStorage.setItem('accessToken', accessToken);
           localStorage.setItem('refreshToken', refreshToken);

          // 2. 사용자 정보 가져오기
          const meResponse = await authApi.getMe();
          
          if (meResponse.success) {
            setAuth(meResponse.data, accessToken); // refreshToken은 store에서 관리 안하거나 따로 관리한다면 수정 필요
            // 여기서는 useAuthStore가 (user, accessToken)만 받으므로 이렇게 처리.
            // refreshToken 저장이 필요하다면 authStore 수정 필요.
            
            navigate('/shorts', { replace: true });
          } else {
             console.error('Failed to fetch user info:', meResponse.message);
             navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('OAuth login processing error:', error);
          navigate('/login', { replace: true });
        }
      } else {
        console.error('Tokens not found in URL');
        navigate('/login', { replace: true });
      }
    };

    processLogin();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">로그인 처리 중입니다...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
