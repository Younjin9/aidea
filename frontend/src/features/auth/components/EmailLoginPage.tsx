import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout';
import LoginForm from './LoginForm';

const EmailLoginPage: React.FC = () => {
  return (
    <AuthLayout showBackButton>
      <LoginForm />

      {/* Footer Links */}
      <div className="flex justify-center items-center gap-4 text-gray-500 text-sm mt-8 mb-20">
        <Link to="/signup" className="hover:text-primary transition-colors">회원가입</Link>
        <span className="w-[1px] h-3 bg-gray-300"></span>
        <Link to="/find-id" className="hover:text-primary transition-colors">아이디 찾기</Link>
        <span className="w-[1px] h-3 bg-gray-300"></span>
        <Link to="/find-pw" className="hover:text-primary transition-colors">비밀번호 찾기</Link>
      </div>
    </AuthLayout>
  );
};

export default EmailLoginPage;
