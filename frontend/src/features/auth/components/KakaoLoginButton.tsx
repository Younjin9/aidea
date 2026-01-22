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
      className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#000000] py-3 rounded-lg font-medium hover:bg-[#FDD835] transition-colors"
    >
        {/* 카카오 아이콘 SVG (Optional) */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C7.58 3 4 5.28 4 8.1c0 1.97 1.74 3.7 4.36 4.6-.2 1.3-1.03 4.3-.1 4.5.15 0 .34-.1.7-.6 2.05-2.8 3.25-4.43 3.4-4.66.55.08 1.1.12 1.64.12 4.42 0 8-2.28 8-5.1S16.42 3 12 3z"/>
        </svg>
      카카오로 시작하기
    </button>
  );
};

export default KakaoLoginButton;
