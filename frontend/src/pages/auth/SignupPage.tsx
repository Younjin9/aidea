import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';
import BackButton from '@/shared/components/ui/BackButton';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [gender, setGender] = useState<'M' | 'F' | null>(null);

  const handleSignup = () => {
    // 회원가입 로직
    // 성공 시 완료 페이지 또는 로그인 페이지로 이동
    // alert('회원가입 완료! (로직 구현 필요)');
    navigate('/onboarding/interest');
  };

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-6 pb-6">
      <header className="mb-8 relative flex items-center justify-center h-12">
        <BackButton className="absolute left-0" />
        <h2 className="text-xl font-bold text-gray-dark">회원가입</h2>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="flex flex-col gap-4">
          {/* 이름 & 성별 */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input placeholder="이름" />
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setGender('M')}
                className={`w-12 rounded-lg border flex items-center justify-center text-sm font-medium transition-colors ${
                  gender === 'M' 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                남
              </button>
              <button
                type="button"
                onClick={() => setGender('F')}
                className={`w-12 rounded-lg border flex items-center justify-center text-sm font-medium transition-colors ${
                  gender === 'F' 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                여
              </button>
            </div>
          </div>

          {/* 닉네임 */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input placeholder="닉네임" />
            </div>
            <Button variant="outline" className="mb-[1px] h-[50px] whitespace-nowrap" size="md">
              중복확인
            </Button>
          </div>

          {/* 이메일 */}
          <Input placeholder="이메일(name@gmail.com)" type="email" />

          {/* 번호 */}
          <Input placeholder="번호(예:010-1234-1234)" type="tel" />

          {/* 비밀번호 */}
          <Input placeholder="비밀번호" type="password" />
          <Input placeholder="비밀번호 확인" type="password" />

          {/* 지역 */}
          <Input 
            placeholder="지역" 
            readOnly 
            rightElement={<span className="text-gray-400 text-lg">📍</span>}
            className="cursor-pointer"
          />
        </div>
      </div>

      <div className="absolute bottom-6 left-0 w-full px-6">
        <Button onClick={handleSignup} fullWidth size="lg">
          가입하기
        </Button>
      </div>
    </div>
  );
};
export default SignupPage;
