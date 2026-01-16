import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, isError, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-10">
      <Input 
        type="text" 
        placeholder="아이디(이메일)를 입력하세요." 
        className="py-4 text-base"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isPending}
      />
      <Input 
        type="password" 
        placeholder="비밀번호를 입력하세요." 
        className="py-4 text-base"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isPending}
        error={isError ? '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.' : undefined}
      />
      
      <div className="mt-6">
        <Button 
            type="submit" 
            fullWidth 
            size="lg"
            variant="primary"
            disabled={isPending}
        >
          {isPending ? '로그인 중...' : '로그인'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
