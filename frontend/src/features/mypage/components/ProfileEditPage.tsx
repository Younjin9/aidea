import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import { INTEREST_CATEGORIES } from '@/shared/config/constants';
import { useMyPageStore } from '../store/myPageStore';
import LocationSearchModal from '@/features/meeting/components/LocationSearchModal';

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useMyPageStore((state) => state.user);
  const updateUser = useMyPageStore((state) => state.updateUser);
  const initializeMockData = useMyPageStore((state) => state.initializeMockData);
  const isInitialized = useMyPageStore((state) => state.isInitialized);

  // Mock 데이터 초기화
  useEffect(() => {
    if (!isInitialized) {
      initializeMockData();
    }
  }, [isInitialized, initializeMockData]);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [region, setRegion] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [showSearchModal, setShowSearchModal] = useState(false);

  // 유저 데이터가 있으면 초기값 설정
  useEffect(() => {
    if (user) {
      // 비동기 큐에 넣어 렌더링 경고를 회피
      setTimeout(() => {
        setName(user.nickname || '');
        setBio(user.bio || '');
        setRegion(user.location?.region || '');
        setSelectedInterests(user.interests || []);
        setProfileImage(user.profileImage);
      }, 0);
    }
  }, [user]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = () => {
    // Store 업데이트 (Mock)
    updateUser({
      nickname: name,
      bio,
      profileImage,
      interests: selectedInterests,
      location: user?.location
        ? { ...user.location, region, lat: coords.lat, lng: coords.lng }
        : { lat: coords.lat, lng: coords.lng, region },
    });

    // TODO: API 호출로 프로필 저장
    console.log('프로필 저장:', { name, bio, region, selectedInterests, profileImage });
    navigate(-1);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('브라우저가 위치 정보를 지원하지 않습니다.');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    if (!kakao || !kakao.maps) {
      alert('카카오 지도 API가 로드되지 않았습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        const geocoder = new kakao.maps.services.Geocoder();
        const coord = new kakao.maps.LatLng(latitude, longitude);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const callback = (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const address = result[0].address;
            const fullAddress = address ? address.address_name : '주소를 찾을 수 없습니다';
            setRegion(fullAddress);
          }
        };

        geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
      },
      (error) => {
        console.error(error);
        alert('현재 위치를 가져오는데 실패했습니다. 위치 권한을 확인해주세요.');
      }
    );
  };

  const handleSelectLocation = (location: { address: string; lat: number; lng: number }) => {
    setRegion(location.address);
    setCoords({ lat: location.lat, lng: location.lng });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between p-4">
          <BackButton />
          <h1 className="font-semibold text-base">프로필 수정</h1>
          <button
            onClick={handleSave}
            className="text-sm text-gray-500 font-medium"
          >
            저장
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Image */}
        <div className="flex justify-center py-6">
          <div className="relative">
            <ProfileImage
              src={profileImage}
              alt="프로필"
              size="xl"
              onClick={handleImageClick}
            />
            <button
              onClick={handleImageClick}
              className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md"
            >
              <Camera size={14} className="text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-4 space-y-4">
          <div className="flex items-center">
            <label className="w-16 text-sm font-medium text-gray-700 shrink-0">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-300"
            />
          </div>
          <div className="flex items-center">
            <label className="w-16 text-sm font-medium text-gray-700 shrink-0">소개</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자기소개를 입력하세요"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-300"
            />
          </div>
          <div className="flex items-center">
            <label className="w-16 text-sm font-medium text-gray-700 shrink-0">지역</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="지역을 입력하세요"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-300"
              readOnly
              onClick={() => setShowSearchModal(true)}
            />
            <button
              type="button"
              onClick={handleCurrentLocation}
              aria-label="현재 위치로 설정"
              className="w-12 h-12 ml-2 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-0"
            >
              <MapPin size={18} />
            </button>
          </div>
        </div>

        {/* Interest Categories */}
        <div className="px-4 py-6">
          <h2 className="text-base font-semibold mb-4">관심사 재설정</h2>

          {INTEREST_CATEGORIES.map((category) => (
            <div key={category.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span>{category.icon}</span>
                <h3 className="font-medium text-sm">{category.label}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleInterestToggle(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      selectedInterests.includes(item)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Search Modal */}
      <LocationSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectLocation={handleSelectLocation}
      />
    </div>
  );
};

export default ProfileEditPage;
