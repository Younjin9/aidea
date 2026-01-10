import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';

const FindPwPage: React.FC = () => {
  return (
    <AuthLayout title="비밀번호 찾기" showBackButton>
       <div className="w-full flex-1 flex flex-col mt-4">
        <p className="text-gray-light text-sm mb-6 text-center">
          가입 시 등록한 이메일로 임시 비밀번호를 발송해 드립니다.
        </p>

        <form className="flex flex-col gap-4">
          <Input 
            placeholder="아이디(이메일)를 입력해 주세요" 
            label="아이디"
            type="email"
          />
          <Input 
            placeholder="이름을 입력해 주세요" 
            label="이름"
          />
          
          <div className="mt-8">
            <Button fullWidth size="lg">비밀번호 찾기</Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-gray-500 text-sm hover:text-primary underline">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default FindPwPage;
