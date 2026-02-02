import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/shared/api/authApi';

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const authProcessed = React.useRef(false);

  useEffect(() => {
    if (authProcessed.current) return;
    authProcessed.current = true;

    const processLogin = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (accessToken && refreshToken) {
        try {
          // 1. 토큰 저장
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // 2. 사용자 정보 가져오기
          const meResponse = await authApi.getMe();

          if (meResponse.success) {
            const user = meResponse.data;
            setAuth(user, accessToken);

            // 2. 가입 시 성별/지역 정보가 누락된 경우 -> 필수 정보 입력 페이지
            if (!user.gender || !user.location) {
              navigate('/onboarding/required-info', { replace: true });
            }
            // 3. 관심사가 없는 경우 -> 관심사 설정 페이지
            else if (!user.interests || user.interests.length === 0) {
              navigate('/onboarding/interest', { replace: true });
            }
            // 4. 모두 완료된 경우 -> 메인으로
            else {
              navigate('/shorts', { replace: true });
            }
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
  }, [navigate, setAuth]); // Removed searchParams to avoid loop if it changes unexpectedly

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