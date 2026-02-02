// 정모 개설하기
import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Search, Plus, Minus, MapPin } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import KakaoMapModal, { type SelectedPlace } from './KakaoMapModal';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCreateEvent } from '../hooks/useEvents';
import { uploadImage } from '@/shared/api';
import LocationSearchModal from '../../meeting/components/LocationSearchModal';

const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user);

  // API Mutation
  const { mutate: createEvent, isPending } = useCreateEvent(meetingId || '');

  // Form State
  const [eventImage, setEventImage] = useState<string>();
  const [eventName, setEventName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);

  // Map State
  const [selectedLocation, setSelectedLocation] = useState<SelectedPlace | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showLocationSearchModal, setShowLocationSearchModal] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await uploadImage(file);
        const imageUrl = response.profileImage;
        setEventImage(imageUrl);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
      }
    }
  };

  const handleLocationSelect = (place: SelectedPlace) => {
    setSelectedLocation(place);
    setLocation(place.address);
  };

  const handleSubmit = () => {
    // 모임장을 자동 참석자로 추가
    const hostParticipant = user ? {
      userId: user.userId,
      nickname: user.nickname,
      profileImage: user.profileImage,
      isHost: true,
    } : undefined;

    const newEvent = {
      eventId: `event-${Date.now()}`,
      title: eventName,
      summary: shortDescription,
      description,
      scheduledAt: `${date} ${time}`,
      location,
      mapUrl: selectedLocation
        ? `https://map.kakao.com/link/map/${selectedLocation.name},${selectedLocation.lat},${selectedLocation.lng}`
        : '',
      cost,
      maxParticipants,
      participantCount: hostParticipant ? 1 : 0,
      participants: hostParticipant ? [hostParticipant] : [],
      imageUrl: eventImage,
    };

    const imageUrlForApi = eventImage;

    // API 호출 시도
    createEvent(
      {
        title: eventName,
        summary: shortDescription,
        notes: description,
        scheduledAt: `${date}T${time}:00`,
        placeName: location,
        location: selectedLocation
          ? { lat: Number(selectedLocation.lat), lng: Number(selectedLocation.lng) }
          : { lat: 0, lng: 0 },
        maxParticipants,
        cost: cost || undefined,
        imageUrl: imageUrlForApi,
      },
      {
        onError: () => {
          // API 실패 시 로컬에서 처리 (fallback)
          console.log('새 정모 생성 (로컬):', newEvent);
          navigate(`/meetings/${meetingId}`, { state: { newEvent } });
        },
      }
    );
  };

  const isFormValid = eventName && shortDescription && date && time && location && description;

  const handleLocationInputClick = () => {
    setShowLocationSearchModal(true);
  };

  const handleOpenMapModal = () => {
    if (selectedLocation) {
      setCurrentLocation({ latitude: selectedLocation.lat, longitude: selectedLocation.lng });
      setShowMapModal(true);
      return;
    }

    if (location.trim()) {
      setCurrentLocation(undefined);
      setShowMapModal(true);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setShowMapModal(true);
        },
        (error) => {
          console.error('Error fetching current location:', error);
          setShowMapModal(true); // 현재 위치를 가져오지 못해도 모달은 열림
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setShowMapModal(true);
    }
  };

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-center p-4 relative">
          <div className="absolute left-4"><BackButton /></div>
          <h1 className="font-semibold text-base">정모 개설</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {/* 이미지 & 이름 */}
        <div className="flex gap-4 mb-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            {eventImage ? (
              <img src={eventImage} alt="정모 이미지" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Camera size={24} className="text-gray-400" />
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          <div className="flex-1">
            <Input
              label="모임 이름"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="정모 이름을 입력하세요"
            />
          </div>
        </div>

        {/* 한줄 설명 */}
        <div className="mb-6">
          <Input
            label="모임 한줄 설명"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="정모를 한 줄로 설명해주세요"
          />
        </div>

        {/* 날짜 & 시간 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-dark mb-1 ml-1">모임 날짜</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-gray-dark placeholder-gray-light focus:outline-none text-sm"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-gray-dark placeholder-gray-light focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* 장소 */}
        <div className="mb-2">
          <Input
            label="모임 장소"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onClick={handleLocationInputClick} // 클릭 시 모달 열기
            placeholder="주소 검색"
            rightElement={<Search size={20} className="text-gray-400" onClick={handleLocationInputClick} />} // 아이콘 클릭 시 모달 열기
          />
        </div>

        {/* 지도 버튼 */}
        <button
          onClick={handleOpenMapModal}
          className="flex items-center gap-2 px-3 py-2 mb-6 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <MapPin size={16} />
          {selectedLocation?.name || '지도 URL'}
        </button>

        {/* 설명 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-dark mb-1 ml-1">모임 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="모임에 대한 설명"
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-gray-dark placeholder-gray-light focus:outline-none text-sm resize-none h-32"
          />
        </div>

        {/* 비용 */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-dark w-10">비용</label>
          <input
            type="text"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="비용을 입력하세요"
            className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-gray-dark placeholder-gray-light focus:outline-none text-sm"
          />
        </div>

        {/* 최대 인원 */}
        <div className="flex items-center justify-between mb-8">
          <label className="text-sm font-medium text-gray-900">최대 인원 설정</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMaxParticipants(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
            >
              <Minus size={16} className="text-gray-600" />
            </button>
            <span className="text-base font-medium w-8 text-center">{maxParticipants}</span>
            <button
              onClick={() => setMaxParticipants(prev => Math.min(300, prev + 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
            >
              <Plus size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* 개설 버튼 */}
        <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} disabled={!isFormValid || isPending}>
          {isPending ? '생성 중...' : '정모 개설하기'}
        </Button>
      </main>

      {/* Map Modal */}
      <KakaoMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSelect={handleLocationSelect}
        currentLocation={currentLocation} // 현재 위치 전달
        initialAddress={location}
      />

      {/* Location Search Modal */}
      <LocationSearchModal
        isOpen={showLocationSearchModal}
        onClose={() => setShowLocationSearchModal(false)}
        onSelectLocation={(selectedLocation) => {
          setLocation(selectedLocation.address);
          setShowLocationSearchModal(false);
        }}
      />
    </div>
  );
};

export default EventCreatePage;