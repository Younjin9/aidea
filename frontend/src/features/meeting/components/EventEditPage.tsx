// 정모 수정하기
import React, { useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Camera, Search, MapPin } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Modal from '@/shared/components/ui/Modal';
import KakaoMapModal, { type SelectedPlace } from './KakaoMapModal';
import { useUpdateEvent, useDeleteEvent } from '../hooks/useEvents';
import type { MeetingEvent } from '@/shared/types/Meeting.types';

const EventEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { meetingId, eventId } = useParams();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 전달받은 정모 데이터
  const eventData = (location.state as { event?: MeetingEvent })?.event;

  // API Mutations
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent(String(meetingId || ''), String(eventId || eventData?.eventId || ''));
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent(String(meetingId || ''));

  // 날짜/시간 파싱
  const parseDateTime = (scheduledAt?: string) => {
    if (!scheduledAt) return { date: '', time: '' };
    const [datePart, timePart] = scheduledAt.split(' ');
    return { date: datePart || '', time: timePart || '' };
  };

  const initialDateTime = eventData ? parseDateTime(eventData.scheduledAt) : { date: '', time: '' };

  // Form State
  const [eventImage, setEventImage] = useState<string | undefined>(eventData?.imageUrl);
  const [eventName, setEventName] = useState(eventData?.title || '');
  const [shortDescription, setShortDescription] = useState(eventData?.description || '');
  const [date, setDate] = useState(initialDateTime.date);
  const [time, setTime] = useState(initialDateTime.time);
  const [eventLocation, setEventLocation] = useState(
    typeof eventData?.location === 'string' ? eventData.location : ''
  );
  const [description, setDescription] = useState(eventData?.description || '');
  const [cost, setCost] = useState(eventData?.cost || '');
  const [maxParticipants, setMaxParticipants] = useState<number>(typeof eventData?.maxParticipants === 'number' ? eventData.maxParticipants : 10);

  // Map State
  const [selectedLocation, setSelectedLocation] = useState<SelectedPlace | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEventImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (place: SelectedPlace) => {
    setSelectedLocation(place);
    setEventLocation(place.address);
  };

  const handleSubmit = () => {
    const updatedEvent: MeetingEvent = {
      eventId: Number(eventId || eventData?.eventId || 0),
      title: eventName,
      date,
      description,
      scheduledAt: `${date} ${time}`,
      location: eventLocation,
      mapUrl: selectedLocation
        ? `https://map.kakao.com/link/map/${selectedLocation.name},${selectedLocation.lat},${selectedLocation.lng}`
        : eventData?.mapUrl,
      cost: typeof cost === 'number' ? cost : 0,
      maxParticipants,
      participantCount: eventData?.participantCount || 0,
      participants: eventData?.participants || [],
      imageUrl: eventImage,
    };

    // API 호출 시도
    updateEvent(
      {
        title: eventName,
        notes: description,
        scheduledAt: `${date}T${time}:00`,
        placeName: eventLocation,
        location: selectedLocation
          ? { lat: Number(selectedLocation.lat), lng: Number(selectedLocation.lng) }
          : { lat: 0, lng: 0 },
        maxParticipants,
        cost: cost || undefined,
        imageUrl: eventImage || undefined,
      },
      {
        onError: () => {
          // API 실패 시 로컬에서 처리 (fallback)
          navigate(`/meetings/${meetingId}`, { state: { updatedEvent } });
        },
      }
    );
  };

  const handleDelete = () => {
    const targetEventId = eventId || eventData?.eventId;
    if (!targetEventId) return;

    // API 호출 시도String(targetEventId)
    deleteEvent(typeof targetEventId === 'string' ? targetEventId : String(targetEventId), {
      onError: () => {
        // API 실패 시 로컬에서 처리 (fallback)
        navigate(`/meetings/${meetingId}`, { state: { deletedEventId: targetEventId } });
      },
    });
  };

  const isFormValid = eventName && shortDescription && date && time && eventLocation && description;

  // 데이터가 없으면 뒤로가기
  if (!eventData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">정모 정보를 찾을 수 없습니다.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-center p-4 relative">
          <div className="absolute left-4"><BackButton /></div>
          <h1 className="font-semibold text-base">정모 수정</h1>
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
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="주소 검색"
            rightElement={<Search size={20} className="text-gray-400" />}
          />
        </div>

        {/* 지도 버튼 */}
        <button
          onClick={() => setShowMapModal(true)}
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
              -
            </button>
            <span className="text-base font-medium w-8 text-center">{maxParticipants}</span>
            <button
              onClick={() => setMaxParticipants(prev => Math.min(300, prev + 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="space-y-3">
          <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} disabled={!isFormValid || isUpdating}>
            {isUpdating ? '수정 중...' : '수정 완료'}
          </Button>
          <Button variant="outline" size="lg" fullWidth onClick={() => setShowDeleteModal(true)} disabled={isDeleting} className="text-red-500 border-red-300 hover:bg-red-50">
            {isDeleting ? '삭제 중...' : '정모 삭제하기'}
          </Button>
        </div>
      </main>

      {/* Map Modal */}
      <KakaoMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSelect={handleLocationSelect}
        currentLocation={selectedLocation ? { latitude: selectedLocation.lat, longitude: selectedLocation.lng } : undefined}
        initialAddress={eventLocation}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="정모 삭제"
        message="정모를 삭제하시겠습니까? 삭제된 정모는 복구할 수 없습니다."
        showCheckbox
        checkboxLabel="삭제에 동의합니다"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EventEditPage;
