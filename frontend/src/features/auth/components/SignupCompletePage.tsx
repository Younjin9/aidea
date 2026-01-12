import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout';
import Button from '@/shared/components/ui/Button';

const SignupCompletePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.name || '회원'; // 전달받은 이름이 없으면 기본값

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center flex-1 w-full pb-10">
        
        <div className="flex flex-col items-center text-center mt-10 mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            회원가입이 완료되었습니다.
          </h2>
          <p className="text-gray-500 text-base">
            {userName}님, 회원가입을 축하합니다.
          </p>
        </div>

        <div className="w-full mt-auto">
          <Button 
            onClick={() => navigate('/login')} 
            fullWidth 
            size="lg"
            className="bg-[#F11958] hover:bg-[#D01248] text-white border-none py-4"
          >
            로그인
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupCompletePage;
