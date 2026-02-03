import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Users, Clock, Share2 } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import Button from '@/shared/components/ui/Button';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import Modal from '@/shared/components/ui/Modal';
import type { MeetingEvent } from '@/shared/types/Meeting.types';
import { useJoinEvent, useCancelEventParticipation } from '../hooks/useEvents';
import { shareApi, eventApi } from '@/shared/api';
import { useAuthStore } from '@/features/auth/store/authStore';

interface EventDetailLocation {
  event: MeetingEvent;
  meetingId: string;
  meetingTitle: string;
  meetingMaxMembers: number;
  isHost: boolean;
  isMember: boolean;
  userId?: string;
}

const EventDetailPage: React.FC = () => {
  const { meetingId, eventId } = useParams<{ meetingId: string; eventId: string }>();
  const location = useLocation();
  const state = location.state as EventDetailLocation | null;
  const user = useAuthStore((state) => state.user);

  const [isParticipating, setIsParticipating] = React.useState(false);
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showJoinMeetingFirstModal, setShowJoinMeetingFirstModal] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  const { mutate: joinEvent } = useJoinEvent(meetingId || '');
  const { mutate: cancelEvent } = useCancelEventParticipation(meetingId || '');

  // API로 이벤트 상세 정보 가져오기
  const { data: eventDetailData, isLoading } = useQuery({
    queryKey: ['eventDetail', meetingId, eventId],
    queryFn: () => eventApi.getEventDetail(meetingId!, eventId!),
    enabled: !!meetingId && !!eventId,
  });

  // API 응답에서 이벤트 데이터 추출
  const eventFromApi = eventDetailData?.data;

  // API 데이터가 있으면 우선 사용하고, 없으면 location.state 사용
  const event = eventFromApi ?? state?.event;
  const isMember = state?.isMember ?? true; // API에서 가져오면 멤버 여부 확인 필요
  const meetingMaxMembers = state?.meetingMaxMembers || 10;

  // 참가 여부 확인 (hook으로 이동)
  const isParticipant = React.useMemo(() => {
    if (!event) return false;
    return (event.participants || []).some(p => String(p.userId) === String(user?.userId));
  }, [event, user?.userId]);

  React.useEffect(() => {
    setIsParticipating(isParticipant);
  }, [isParticipant]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="mt-4 text-gray-500 text-sm">로딩 중...</p>
      </div>
    );
  }

  if (!event || !meetingId) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
          <BackButton />
          <span className="text-sm font-semibold">정모 상세</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '일시 미정';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
    const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToastMessage('링크가 복사되었습니다.');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showToastMessage('링크가 복사되었습니다.');
      } catch {
        showToastMessage('복사에 실패했습니다.');
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleShare = async () => {
    if (!meetingId) return;
    try {
      const response = await shareApi.createShare(meetingId);
      const shareUrl = response.data?.shareUrl;
      if (!shareUrl) {
        showToastMessage('공유 링크 생성에 실패했습니다.');
        return;
      }
      await copyToClipboard(shareUrl);
    } catch (error) {
      console.error('공유 링크 생성 실패:', error);
      showToastMessage('공유 링크 생성에 실패했습니다.');
    }
  };

  const handleJoin = () => {
    if (!isMember) {
      setShowJoinMeetingFirstModal(true);
      return;
    }
    setShowJoinModal(true);
  };

  const confirmJoin = () => {
    setShowJoinModal(false);
    joinEvent(String(event.eventId));
    setIsParticipating(true);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    cancelEvent(String(event.eventId));
    setIsParticipating(false);
  };

  const isFull = event.participantCount! >= (event.maxParticipants || meetingMaxMembers);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <header className="flex items-center justify-center px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        {/* 왼쪽 BackButton */}
        <div className="absolute left-4">
          <BackButton />
        </div>

        {/* 중앙 정모 이름 */}
        <h2 className="text-sm font-semibold text-gray-900 text-center">{event.title}</h2>

        {/* 오른쪽 공유 아이콘 */}
        <button
          onClick={handleShare}
          className="absolute right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="share"
        >
          <Share2 size={20} className="text-gray-600" />
        </button>
      </header>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* 이미지 */}
        {event.imageUrl && (
          <div className="w-full h-48 bg-gray-200 overflow-hidden flex items-center justify-center">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 제목 */}
          <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
          {/* 기본 정보 */}
          <div className="space-y-1.5">
            {/* 날짜 & 시간 */}
            <div className="flex gap-2 items-start">
              <Clock size={14} className="text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">날짜 및 시간</p>
                <p className="text-xs font-medium text-gray-900">{formatDateTime(event.scheduledAt)}</p>
              </div>
            </div>

            {/* 장소 */}
            <div className="flex gap-2 items-start">
              <MapPin size={14} className="text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">장소</p>
                <p className="text-xs font-medium text-gray-900">{event.placeName || '미정'}</p>
              </div>
            </div>

            {/* 최대인원 */}
            <div className="flex gap-2 items-start">
              <Users size={14} className="text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">참여 인원</p>
                <p className="text-xs font-medium text-gray-900">
                  {event.participantCount}/{event.maxParticipants || meetingMaxMembers}명
                </p>
              </div>
            </div>

            {/* 비용 */}
            {(event.cost !== undefined && event.cost !== null) && (
              <div className="flex gap-2 items-start">
                <span className="text-gray-600 mt-0.5 flex-shrink-0 text-sm">₩</span>
                <div>
                  <p className="text-xs text-gray-500">비용</p>
                  <p className="text-xs font-medium text-gray-900">
                    {event.cost === '' || event.cost === '0' || event.cost === 0 
                      ? '무료' 
                      : typeof event.cost === 'number' 
                        ? `${event.cost.toLocaleString()}원` 
                        : event.cost}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 구분선 */}
          <div className="h-px bg-gray-100" />

          {/* 모임 설명 */}
          {event.notes && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">모임 설명</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.notes}</p>
            </div>
          )}

          {/* 참여자 */}
          {event.participants && event.participants.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-3">참여자 ({event.participants.length}명)</p>
              <div className="flex flex-wrap gap-3">
                {event.participants.map((p) => (
                  <div key={p.userId} className="flex flex-col items-center gap-2">
                    <ProfileImage src={p.profileImage} alt={p.nickname} size="md" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-[430px] mx-auto">
        {isParticipating ? (
          <Button
            variant="primary"
            size="md"
            fullWidth
            className="bg-gray-500 hover:bg-gray-600 border-gray-500"
            onClick={handleCancel}
          >
            참가 취소
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleJoin}
            disabled={isFull}
          >
            {isFull ? '마감' : '참가'}
          </Button>
        )}
      </div>

      {/* 모달들 */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        message={`"${event.title}" 정모에 참가하시겠습니까?`}
        confirmText="참가"
        cancelText="취소"
        onConfirm={confirmJoin}
      />

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        message={`"${event.title}" 정모 참여를 취소하시겠습니까?`}
        confirmText="취소"
        cancelText="닫기"
        onConfirm={confirmCancel}
      />

      <Modal
        isOpen={showJoinMeetingFirstModal}
        onClose={() => setShowJoinMeetingFirstModal(false)}
        message="모임에 먼저 가입 후 참가할 수 있습니다."
        confirmText="확인"
        singleButton
        onConfirm={() => setShowJoinMeetingFirstModal(false)}
      />

      {/* Toast 알림 */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
