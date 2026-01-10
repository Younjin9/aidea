import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';

const EmailLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 로그인 로직 처리 후 메인으로 이동
    navigate('/shorts');
  };

  return (
    <AuthLayout showBackButton>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full mt-10">
        <Input 
          type="text" 
          placeholder="아이디를 입력하세요." 
          className="py-4 text-base"
        />
        <Input 
          type="password" 
          placeholder="비밀번호를 입력하세요." 
          className="py-4 text-base"
        />
        
        <div className="mt-6">
          <Button type="submit" fullWidth size="lg">
            로그인
          </Button>
        </div>
      </form>

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
