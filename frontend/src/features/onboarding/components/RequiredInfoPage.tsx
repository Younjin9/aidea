import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import userApi from '@/shared/api/user/userApi';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';
import LocationSearchModal from '@/features/meeting/components/LocationSearchModal';
import type { Gender } from '@/shared/types/common.types';

const RequiredInfoPage: React.FC = () => {
    const navigate = useNavigate();
    // Selector 분리로 불필요한 리렌더링 방지
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);

    const [nickname, setNickname] = useState('');
    const [gender, setGender] = useState<Gender | null>(null);
    const [location, setLocation] = useState<{ region: string; lat: number; lng: number } | null>(null);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // 초기화 여부 체크 (한 번만 로드하여 덮어쓰기/무한루프 방지)
    const isInitialized = React.useRef(false);

    useEffect(() => {
        if (user && !isInitialized.current) {
            if (user.nickname) setNickname(user.nickname);
            if (user.gender) setGender(user.gender);
            if (user.location) {
                const loc = user.location as any;
                if (loc.region || loc.latitude || loc.lat) {
                    setLocation({
                        region: loc.region || '',
                        lat: loc.lat || loc.latitude || 0,
                        lng: loc.lng || loc.longitude || 0
                    });
                }
            }
            isInitialized.current = true;
        }
    }, [user]);

    const handleLocationSelect = (selected: { address: string; latitude: number; longitude: number }) => {
        setLocation({
            region: selected.address,
            lat: selected.latitude,
            lng: selected.longitude
        });
        setIsLocationModalOpen(false);
    };

    const handleSubmit = async () => {
        if (!nickname.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }
        if (!gender) {
            alert('성별을 선택해주세요.');
            return;
        }
        if (!location) {
            alert('지역을 선택해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            // [테스트용] 백엔드 없이 UI 흐름 확인을 위한 예외 처리
            try {
                // 1. Update Profile (Nickname, Gender)
                await userApi.updateProfile({
                    nickname: nickname,
                    gender: gender
                });

                // 2. Update Location
                await userApi.updateLocation({
                    region: location.region,
                    latitude: location.lat,
                    longitude: location.lng
                });
            } catch (apiError) {
                console.warn('Backend is offline or failed. Proceeding with local state only.', apiError);
            }

            // Update local store
            if (user) {
                updateUser({
                    ...user,
                    nickname: nickname,
                    gender: gender,
                    location: {
                        region: location.region,
                        latitude: location.lat,
                        longitude: location.lng
                    }
                });
            }

            // Navigate to Interest Page
            navigate('/onboarding/interest');
        } catch (error) {
            console.error('Critical Error:', error);
            // alert('정보 저장에 실패했습니다. 다시 시도해주세요.'); // Blocking Alert 제거
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white px-6">
            <h1 className="text-xl font-bold text-center mt-10 mb-12">필수 정보 입력 요청</h1>

            <div className="flex flex-col gap-6 flex-1">
                {/* 이름 입력 */}
                <div>
                    <Input
                        type="text"
                        placeholder="이름"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5"
                    />
                </div>

                {/* 성별 선택 */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setGender('MALE')}
                        className={`flex-1 py-3.5 rounded-xl border transition-colors ${
                            gender === 'MALE'
                                ? 'border-primary text-primary bg-primary/5 font-medium'
                                : 'border-gray-200 text-gray-400 bg-white hover:bg-gray-50'
                        }`}
                    >
                        남
                    </button>
                    <button
                        type="button"
                        onClick={() => setGender('FEMALE')}
                        className={`flex-1 py-3.5 rounded-xl border transition-colors ${
                            gender === 'FEMALE'
                                ? 'border-primary text-primary bg-primary/5 font-medium'
                                : 'border-gray-200 text-gray-400 bg-white hover:bg-gray-50'
                        }`}
                    >
                        여
                    </button>
                </div>

                {/* 지역 선택 */}
                <div onClick={() => setIsLocationModalOpen(true)} className="cursor-pointer">
                    <div className={`w-full rounded-xl px-4 py-3.5 text-left border-none bg-gray-50 flex items-center ${location ? 'text-gray-900' : 'text-gray-400'}`}>
                         {location ? location.region : '지역'}
                    </div>
                </div>
            </div>

            <div className="py-6 mt-auto">
                <Button
                    fullWidth
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isLoading || !nickname || !gender || !location}
                    className="font-bold text-lg h-14"
                >
                    {isLoading ? '저장 중...' : '완료'}
                </Button>
            </div>

            <LocationSearchModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onSelectLocation={handleLocationSelect}
            />
        </div>
    );
};

export default RequiredInfoPage;
