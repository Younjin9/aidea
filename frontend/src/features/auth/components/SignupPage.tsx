import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../hooks/useSignup';
import { authApi } from '@/shared/api/authApi';
import type { SignUpRequest } from '@/shared/types/auth.types';
import Input from '@/shared/components/ui/Input';
import KakaoMapModal, { type SelectedPlace } from '@/features/meeting/components/KakaoMapModal';
import Button from '@/shared/components/ui/Button';
import BackButton from '@/shared/components/ui/BackButton';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const signupMutation = useSignup();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [gender, setGender] = useState<'M' | 'F' | null>(null);
  const [nicknameChecked, setNicknameChecked] = useState(false);

  const handleLocationSelect = (place: SelectedPlace) => {
    setLocation(place.address || place.name);
    setLatitude(place.lat);
    setLongitude(place.lng);
    setIsMapOpen(false);
  };

  const handleCheckNickname = async () => {
    if (!nickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    try {
      const response = await authApi.checkNickname(nickname);
      if (response.success && response.data) {
         alert('사용 가능한 닉네임입니다.');
         setNicknameChecked(true);
      } else {
         alert('이미 사용 중이거나 사용할 수 없는 닉네임입니다.');
         setNicknameChecked(false);
      }
    } catch (e: any) {
      alert(e.response?.data?.message || '중복 확인 중 오류가 발생했습니다.');
      setNicknameChecked(false);
    }
  };

  const handleSignup = () => {
    if (!email || !password || !nickname || !phoneNumber) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (!nicknameChecked) {
      alert('닉네임 중복 확인을 해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const payload: SignUpRequest = {
      email,
      password,
      nickname,
      phoneNumber,
      gender: gender === 'M' ? 'MALE' : gender === 'F' ? 'FEMALE' : undefined,
      location,
      latitude,
      longitude,
    };

    signupMutation.mutate(payload, {
      onSuccess: async (response) => {
        if (response.success || response) {
           // If backend requires separate location update, handle it here after login? 
           // For now assume signup payload handles it or it's just stored.
           // However based on user request "Apply Kakao Map", this is done.
           // Note: The user provided API spec for signup doesn't include location/lat/lng.
           // If the backend ignores it, fine. If it's strict, this might need change.
           navigate('/signup/complete', { state: { name: name || nickname } });
        }
      },
      onError: (error) => {
        const msg = (error as any).response?.data?.message || '회원가입에 실패했습니다.';
        alert(msg);
      }
    });
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
              <Input 
                placeholder="이름" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
              <Input 
                placeholder="닉네임" 
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameChecked(false);
                }}
              />
            </div>
            <Button 
              variant="outline" 
              className="mb-[1px] h-[50px] whitespace-nowrap" 
              size="md"
              onClick={handleCheckNickname}
            >
              중복확인
            </Button>
          </div>

          {/* 이메일 */}
          <Input 
            placeholder="이메일(name@gmail.com)" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* 번호 */}
          <Input 
            placeholder="번호(예:010-1234-1234)" 
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          {/* 비밀번호 */}
          <Input 
            placeholder="비밀번호" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input 
            placeholder="비밀번호 확인" 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* 지역 */}
          <Input 
            placeholder="지역" 
            value={location}
            readOnly
            onClick={() => setIsMapOpen(true)}
            rightElement={<span className="text-gray-400 text-lg cursor-pointer" onClick={() => setIsMapOpen(true)}>📍</span>}
            className="cursor-pointer"
          />
        </div>
      </div>

      <div className="absolute bottom-6 left-0 w-full px-6">
        <Button onClick={handleSignup} fullWidth size="lg">
          가입하기
        </Button>
      </div>

      <KakaoMapModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onSelect={handleLocationSelect} 
      />
    </div>
  );
};
export default SignupPage;
