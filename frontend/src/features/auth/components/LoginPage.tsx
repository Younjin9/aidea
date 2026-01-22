import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout';
import KakaoLoginButton from '@/features/auth/components/KakaoLoginButton';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col gap-4 mt-auto mb-10">
        {/* Kakao Login Button */}
        <KakaoLoginButton />

        {/* ID Login Button */}
        <button
          onClick={() => navigate('/login/email')}
          className="w-full bg-white border border-gray-200 text-gray-dark py-4 rounded-xl font-medium text-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-gray-50"
        >
          아이디로 시작하기
        </button>

        {/* Footer Links */}
        <div className="flex justify-center items-center gap-4 text-gray-500 text-sm mt-4">
          <Link to="/signup" className="hover:text-primary transition-colors">회원가입</Link>
          <span className="w-[1px] h-3 bg-gray-300"></span>
          <Link to="/find-pw" className="hover:text-primary transition-colors">비밀번호 찾기</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
