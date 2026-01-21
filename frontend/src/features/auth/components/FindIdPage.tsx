import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';

const FindIdPage: React.FC = () => {
  return (
    <AuthLayout title="아이디 찾기" showBackButton>
      <div className="w-full flex-1 flex flex-col mt-4">
        <p className="text-gray-light text-sm mb-6 text-center">
          가입 시 등록한 휴대전화 번호로 아이디를 찾을 수 있습니다.
        </p>
        
        <form className="flex flex-col gap-4">
          <Input 
            placeholder="이름을 입력해 주세요" 
            label="이름"
          />
          <Input 
            placeholder="휴대전화 번호를 입력해 주세요 (-제외)" 
            label="휴대전화 번호"
            type="tel"
          />
          
          <div className="mt-8">
            <Button fullWidth size="lg">아이디 찾기</Button>
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

export default FindIdPage;
