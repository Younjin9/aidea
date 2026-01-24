// 모임 개설하기
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronDown, Search, Plus, Minus, MapPin } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Modal from '@/shared/components/ui/Modal';
import LocationSearchModal from './LocationSearchModal';
import { INTEREST_CATEGORIES } from '@/shared/config/constants';
import defaultLogo from '@/assets/images/logo.png';
import { useMeetingStore } from '../store/meetingStore';
import { useMyPageStore } from '@/features/mypage/store/myPageStore';
import { useCreateMeeting } from '../hooks/useMeetings';

const MeetingCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMeeting = useMeetingStore((state) => state.addMeeting);

  // 유저 프로필 이미지 가져오기
  const user = useMyPageStore((state) => state.user);
  const currentUserProfileImage = user?.profileImage;

  // API Mutation
  const { mutate: createMeeting, isPending } = useCreateMeeting();

  // Form State
  const [meetingImage, setMeetingImage] = useState<string>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [meetingName, setMeetingName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [region, setRegion] = useState('');
  const [coords, setCoords] = useState({ lat: 0, lng: 0 }); // 좌표 상태 추가
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false); // 검색 모달 상태

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMeetingImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 현재 위치 찾기 핸들러
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('브라우저가 위치 정보를 지원하지 않습니다.');
      return;
    }

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

        const callback = (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            // 행정동 주소 정보 가져오기
            const address = result[0].address;
            const fullAddress = address ? address.address_name : '주소를 찾을 수 없습니다';

            // "서울시 관악구" 형태로 지역명 추출 (2단계까지)
            // 예: "서울 관악구 신림동" -> "서울 관악구"
            // address_name 그대로 사용해도 무방함
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

  // 장소 선택 핸들러
  const handleSelectLocation = (location: { address: string; lat: number; lng: number }) => {
    setRegion(location.address);
    setCoords({ lat: location.lat, lng: location.lng });
  };

  const handleSubmit = () => {
    if (!currentUserProfileImage) {
      setShowProfileModal(true);
      return;
    }

    const groupId = `${Date.now()}`;
    const finalImage = meetingImage || defaultLogo;

    // API 호출 시도
    createMeeting(
      {
        title: meetingName,
        description,
        interestCategoryId: selectedCategoryId || '1',
        maxMembers: capacity,
        location: { lat: coords.lat, lng: coords.lng, region },
        isPublic: true,
        image: imageFile || undefined,
      },
      {
        onError: () => {
          // API 실패 시 로컬 store에 추가 (fallback)
          addMeeting({
            groupId,
            image: finalImage,
            title: meetingName,
            category: selectedCategory,
            location: region,
            members: 1,
            maxMembers: capacity,
            description,
            date: new Date().toISOString().split('T')[0],
            isLiked: false,
            ownerUserId: user?.userId ? String(user.userId) : undefined,
            myStatus: 'APPROVED',
            myRole: 'HOST',
          });

          navigate('/meetings');
        },
      }
    );
  };

  const isFormValid = meetingName && shortDescription && selectedCategory && region && description && agreeToTerms;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-center p-4 relative">
          <div className="absolute left-4"><BackButton /></div>
          <h1 className="font-semibold text-base">모임 개설</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {/* 모임 이미지 & 이름 */}
        <div className="flex gap-4 mb-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            {meetingImage ? (
              <img src={meetingImage} alt="모임 이미지" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Camera size={24} className="text-gray-400" />
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          <div className="flex-1">
            <Input
              label="모임 이름"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              placeholder="모임 이름을 입력하세요"
              className="text-sm placeholder:text-sm"
            />
          </div>
        </div>

        {/* 모임 한줄 설명 */}
        <div className="mb-6">
          <Input
            label="모임 한줄 설명"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="모임을 한 줄로 설명해주세요"
            className="text-sm placeholder:text-sm"
          />
        </div>

        {/* 카테고리 선택 */}
        <div className="mb-6" onClick={() => setShowCategoryModal(true)}>
          <Input
            label="카테고리 선택"
            value={selectedCategory}
            placeholder="선택해주세요"
            readOnly
            rightElement={<ChevronDown size={20} className="text-gray-400" />}
            className="cursor-pointer text-sm placeholder:text-sm"
          />
        </div>

        {/* 중심지역 */}
        <div className="mb-6">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                label="중심지역"
                value={region}
                readOnly
                placeholder="장소를 검색하거나 현재 위치를 사용하세요"
                onClick={() => setShowSearchModal(true)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCurrentLocation();
              }}
              className="mb-[1px] h-[46px] w-[46px] flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
              title="현재 위치 찾기"
              type="button"
            >
              <MapPin size={22} />
            </button>
          </div>
        </div>

        {/* 모임 설명 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-dark mb-1 ml-1">모임 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="모임에 대한 설명"
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-gray-dark placeholder-gray-light focus:outline-none resize-none h-32 text-sm placeholder:text-sm"
          />
        </div>

        {/* 정원 */}
        <div className="flex items-center justify-between mb-8">
          <label className="text-sm font-medium text-gray-900">정원(3~300명)</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCapacity(prev => Math.max(3, prev - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
            >
              <Minus size={16} className="text-gray-600" />
            </button>
            <span className="text-base font-medium w-8 text-center">{capacity}</span>
            <button
              onClick={() => setCapacity(prev => Math.min(300, prev + 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
            >
              <Plus size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* 동의 체크박스 */}
        <label className="flex items-center gap-2 cursor-pointer justify-center mb-6">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer accent-primary"
          />
          <span className="text-sm text-gray-600">정모 중심의 모임을 만들 것을 약속합니다.</span>
        </label>

        {/* 개설 버튼 */}
        <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} disabled={!isFormValid || isPending}>
          {isPending ? '생성 중...' : '모임 개설하기'}
        </Button>
      </main>

      {/* 카테고리 선택 모달 */}
      <Modal
        type="bottom"
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="카테고리 선택"
        actions={INTEREST_CATEGORIES.map(cat => ({
          label: cat.label,
          onClick: () => {
            setSelectedCategory(cat.label);
            setSelectedCategoryId(cat.id);
          },
        }))}
      />

      {/* 장소 검색 모달 */}
      <LocationSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectLocation={handleSelectLocation}
      />

      {/* 프로필 등록 필요 모달 */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        message="프로필 사진을 등록해주세요."
        showLogo={true}
        confirmText="OK"
        singleButton={true}
        onConfirm={() => navigate('/mypage/edit')}
      />
    </div>
  );
};

export default MeetingCreatePage;
