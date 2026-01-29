import React from 'react';
import { authApi } from '@/shared/api/authApi';

const KakaoLoginButton: React.FC = () => {
    
  const handleKakaoLogin = () => {
    const kakaoLoginUrl = authApi.getKakaoLoginUrl();
    window.location.href = kakaoLoginUrl;
  };

  return (
    <button
      onClick={handleKakaoLogin}
      className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#000000] py-4 rounded-xl font-medium text-lg hover:bg-[#FDD835] transition-colors"
    >
        {/* 카카오 아이콘 */}
        <img 
          src="https://www.svgrepo.com/show/368252/kakao.svg" 
          alt="카카오" 
          width="20" 
          height="20"
          className="flex-shrink-0"
        />
      카카오로 시작하기
    </button>
  );
};

export default KakaoLoginButton;
