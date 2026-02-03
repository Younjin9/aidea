import React from 'react';
import { Crown, ChevronRight } from 'lucide-react';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';
import type { MeetingDetail, MeetingEvent } from '@/shared/types/Meeting.types';

// ============================================
// EventCard Component (이벤트 카드 - 단일)
// ============================================

interface EventCardProps {
  event: MeetingEvent;
  meeting: MeetingDetail;
  isHost: boolean;
  isMember: boolean;
  isParticipating: boolean;
  onTitleClick: () => void;
  onEditClick?: () => void;
  onCancelParticipation: () => void;
  onJoin: () => void;
  onJoinMeetingFirst: () => void;
  onShare: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  meeting,
  isHost,
  isMember,
  isParticipating,
  onTitleClick,
  onEditClick,
  onCancelParticipation,
  onJoin,
  onJoinMeetingFirst,
  onShare,
}) => {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '일시 미정';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', weekday: 'short' });
    const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
  };

  // D-day 계산 함수
  const calculateDDay = (dateString?: string): string | null => {
    if (!dateString) return null;

    try {
      const targetDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);

      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return null; // 지난 날짜는 표시 안 함
      if (diffDays === 0) return 'D-day';
      return `D-${diffDays}`;
    } catch {
      return null;
    }
  };

  const dDay = calculateDDay(event.date || event.scheduledAt);

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 cursor-pointer hover:opacity-60 transition" onClick={onTitleClick}>
          {dDay && (
            <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full whitespace-nowrap">
              {dDay}
            </span>
          )}
          <h3 className="font-semibold text-sm line-clamp-1">{event.title}</h3>
        </div>
        {isHost && onEditClick && (
          <ChevronRight size={18} className="text-gray-400 flex-shrink-0 cursor-pointer hover:text-gray-600 transition" onClick={onEditClick} />
        )}
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex gap-3"><p className="text-gray-500 w-12">일시</p><p className="font-medium">{formatDateTime(event.scheduledAt)}</p></div>
        <div className="flex gap-3"><p className="text-gray-500 w-12">위치</p><p className="font-medium">{event.placeName || meeting.region || '미정'}</p></div>
        <div className="flex gap-3"><p className="text-gray-500 w-12">비용</p><p className="font-medium">{event.cost || '무료'}</p></div>
        <div className="flex gap-3"><p className="text-gray-500 w-12">참석</p><p className="font-medium">{event.participantCount}명 ({event.participantCount}/{event.maxParticipants || meeting.maxMembers})</p></div>
      </div>

      {/* Participants */}
      {event.participants && event.participants.length > 0 && (
        <div className="flex gap-2 mb-3 items-center">
          {event.participants.slice(0, 3).map((p) => (
            <div key={p.userId} className="relative">
              <ProfileImage src={p.profileImage} alt={p.nickname} size="sm" className="border-2 border-white" />
              {'role' in p && p.role === 'HOST' && (
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
                  <Crown size={12} className="text-white fill-white" />
                </div>
              )}
            </div>
          ))}
          {event.participants.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold border-2 border-white">
              +{event.participants.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 items-center">
        <Button variant="outline" size="md" className="flex-1" onClick={onShare}>공유</Button>
        {isMember || isHost ? (
          isParticipating ? (
            <Button variant="primary" size="md" className="flex-1 bg-gray-500 hover:bg-gray-600 border-gray-500" onClick={onCancelParticipation}>취소</Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={onJoin}
              disabled={event.participantCount! >= (event.maxParticipants || meeting.maxMembers)}
            >
              {event.participantCount! >= (event.maxParticipants || meeting.maxMembers) ? '마감' : '참가'}
            </Button>
          )
        ) : (
          <Button variant="primary" size="md" className="flex-1" onClick={onJoinMeetingFirst}>참가</Button>
        )}
      </div>
    </div>
  );
};

// ============================================
// EventSection Component (이벤트 섹션 - 리스트)
// ============================================

export interface EventSectionProps {
  events: MeetingEvent[];
  meeting: MeetingDetail;
  isHost: boolean;
  isMember: boolean;
  userId?: string;
  onEventTitleClick: (event: MeetingEvent) => void;
  onEditEvent: (event: MeetingEvent) => void;
  onEventAction: (eventId: string, title: string, action: 'cancelParticipation' | 'join') => void;
  onJoinMeetingFirst: () => void;
  // onShare removed as it is unused
  onCreateEvent: () => void;
  onShareEvent: (event: MeetingEvent) => void;
  // 모달 상태 props
  showCancelModal: boolean;
  showJoinEventModal: boolean;
  showJoinMeetingFirstModal: boolean;
  selectedEventTitle?: string;
  onCloseCancelModal: () => void;
  onCloseJoinEventModal: () => void;
  onCloseJoinMeetingFirstModal: () => void;
  onConfirmCancel: () => void;
  onConfirmJoin: () => void;
}

const EventSection: React.FC<EventSectionProps> = ({
  events = [],
  meeting,
  isHost,
  isMember,
  userId,
  onEventTitleClick,
  onEditEvent,
  onEventAction,
  onJoinMeetingFirst,
  onCreateEvent,
  onShareEvent,
  showCancelModal,
  showJoinEventModal,
  showJoinMeetingFirstModal,
  selectedEventTitle,
  onCloseCancelModal,
  onCloseJoinEventModal,
  onCloseJoinMeetingFirstModal,
  onConfirmCancel,
  onConfirmJoin,
}) => (
  <>
    <section className="p-4 space-y-6">
      {events.length > 0 ? (
        events.map((event) => {
          const isParticipating = (event.participants || []).some(p => String(p.userId) === String(userId));
          return (
            <EventCard
              key={event.eventId}
              event={event}
              meeting={meeting}
              isHost={isHost}
              isMember={isMember}
              isParticipating={isParticipating}
              onTitleClick={() => onEventTitleClick(event)}
              onEditClick={isHost ? () => onEditEvent(event) : undefined}
              onCancelParticipation={() => onEventAction(String(event.eventId), event.title, 'cancelParticipation')}
              onJoin={() => onEventAction(String(event.eventId), event.title, 'join')}
              onJoinMeetingFirst={() => onJoinMeetingFirst()}
              onShare={() => onShareEvent(event)}
            />
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 text-sm">예정된 정모가 없습니다.</p>
        </div>
      )}
      {isHost && (
        <Button variant="primary" size="md" fullWidth onClick={onCreateEvent}>
          정모 만들기
        </Button>
      )}
    </section>

    {/* EventSection 전용 모달들 */}
    <Modal
      isOpen={showCancelModal}
      onClose={onCloseCancelModal}
      message={`"${selectedEventTitle}" 정모 참여를 취소하시겠습니까?`}
      confirmText="취소"
      cancelText="닫기"
      onConfirm={onConfirmCancel}
    />

    <Modal
      isOpen={showJoinEventModal}
      onClose={onCloseJoinEventModal}
      message={`"${selectedEventTitle}" 정모에 참가하시겠습니까?`}
      confirmText="참가"
      cancelText="취소"
      onConfirm={onConfirmJoin}
    />

    <Modal
      isOpen={showJoinMeetingFirstModal}
      onClose={onCloseJoinMeetingFirstModal}
      message="모임에 먼저 가입 후 참가할 수 있습니다."
      confirmText="확인"
      singleButton
      onConfirm={onCloseJoinMeetingFirstModal}
    />
  </>
);

export default EventSection;
