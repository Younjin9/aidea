// 모임 상세 페이지
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Ellipsis, UsersRound, Crown } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';
import meetingApi from '@/shared/api/meeting/meetingApi';
import { useMeetingStore } from '../store/meetingStore';
import { useMyPageStore } from '@/features/mypage/store/myPageStore';
import { useJoinMeeting, useLeaveMeeting } from '../hooks/useMeetings';
import { useJoinEvent, useCancelEventParticipation } from '../hooks/useEvents';
import type { MeetingDetail, MeetingEvent } from '@/shared/types/Meeting.types';
import defaultLogo from '@/assets/images/logo.png';

// ============================================
// Constants & Types
// ============================================

type ModalType = 'profile' | 'greeting' | 'actionSheet' | 'cancelParticipation' | 'joinEvent' | 'joinMeetingFirst' | 'leaveMeeting' | 'report' | null;

const MOCK_MEETING_DETAIL: MeetingDetail = {
  groupId: '1',
  title: '맛집 탐방',
  description: '우리와 함께 맛집을 탐방해보세요. 다양한 맛을 즐길 수 있습니다.',
  imageUrl: 'https://i.pinimg.com/736x/44/e7/7e/44e77e3a2d34a147afc6a384ebd7a42f.jpg',
  interestCategoryId: '1',
  interestCategoryName: '맛집 탐방',
  memberCount: 2,
  maxMembers: 10,
  location: { lat: 37.5665, lng: 126.978, region: '성수동' },
  distanceKm: 0,
  isPublic: true,
  ownerUserId: 'user1',
  createdAt: '2024-01-20',
  updatedAt: '2024-01-20',
  members: [
    { userId: 'user1', nickname: '김구름', profileImage: undefined, role: 'HOST', status: 'APPROVED', joinedAt: '2024-01-20' },
    { userId: 'user2', nickname: '김구름2', profileImage: undefined, role: 'MEMBER', status: 'APPROVED', joinedAt: '2024-01-20' },
  ],
  events: [{
    eventId: '1',
    title: '성수 맛집 탐방',
    scheduledAt: '2024-01-22 11:00',
    participantCount: 2,
    participants: [
      { userId: 'user1', nickname: '김구름', profileImage: undefined, isHost: true },
      { userId: 'user2', nickname: '김구름2', profileImage: undefined },
    ],
  }],
  myRole: 'HOST',
  myStatus: 'APPROVED',
};

// ============================================
// Utility Functions
// ============================================

const createMeetingDetailFromStore = (
  storedMeeting: { id: number; title: string; description?: string; image: string; category: string; members: number; maxMembers?: number; location: string; ownerUserId?: string; myStatus?: 'PENDING' | 'APPROVED'; myRole?: 'HOST' | 'MEMBER' },
  isOwner: boolean,
  user: { userId: string; nickname: string; profileImage?: string } | null,
  existingEvents: MeetingEvent[] = MOCK_EVENTS
): MeetingDetail => {
  const hostUserId = storedMeeting.ownerUserId || 'user1';
  const hostNickname = isOwner ? (user?.nickname || '방장') : '모임장';
  const hostProfileImage = isOwner ? user?.profileImage : undefined;

  return {
    groupId: String(storedMeeting.id),
    title: storedMeeting.title,
    description: storedMeeting.description || '모임 설명이 없습니다.',
    imageUrl: storedMeeting.image,
    interestCategoryId: '1',
    interestCategoryName: storedMeeting.category,
    memberCount: storedMeeting.members,
    maxMembers: storedMeeting.maxMembers || 10,
    location: { lat: 37.5665, lng: 126.978, region: storedMeeting.location },
    distanceKm: 0,
    isPublic: true,
    ownerUserId: hostUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      { userId: hostUserId, nickname: hostNickname, profileImage: hostProfileImage, role: 'HOST', status: 'APPROVED', joinedAt: new Date().toISOString() },
    ],
    events: existingEvents,
    myRole: storedMeeting.myRole === 'MEMBER' ? 'USER' : storedMeeting.myRole || (isOwner ? 'HOST' : undefined),
    myStatus: storedMeeting.myStatus,
  };
};

// ============================================
// Sub Components
// ============================================

// --- DetailHeader ---
interface DetailHeaderProps {
  title: string;
  isLiked: boolean;
  activeTab: 'home' | 'chat';
  onLikeToggle: () => void;
  onActionSheet: () => void;
  onTabChange: (tab: 'home' | 'chat') => void;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  title,
  isLiked,
  activeTab,
  onLikeToggle,
  onActionSheet,
  onTabChange,
}) => (
  <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
    <div className="flex items-center p-4 relative">
      <BackButton />
      <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-sm">{title}</h1>
      <div className="flex items-center gap-1 ml-auto">
        <button onClick={onLikeToggle} className="p-2 hover:bg-gray-100 rounded-full transition">
          <Heart size={20} fill={isLiked ? '#e91e63' : 'none'} stroke={isLiked ? '#e91e63' : 'currentColor'} />
        </button>
        <button onClick={onActionSheet} className="p-2 hover:bg-gray-100 rounded-full transition">
          <Ellipsis size={20} />
        </button>
      </div>
    </div>
    <div className="flex px-4 border-t border-gray-100">
      {(['home', 'chat'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 py-3 font-medium text-sm relative text-center ${activeTab === tab ? 'text-black' : 'text-gray-500'}`}
        >
          {tab === 'home' ? '홈' : '채팅'}
          {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-dark" />}
        </button>
      ))}
    </div>
  </header>
);

// --- MeetingImage ---
interface MeetingImageProps {
  imageUrl: string;
  title: string;
}

const MeetingImage: React.FC<MeetingImageProps> = ({ imageUrl, title }) => (
  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
    {imageUrl && !imageUrl.includes('logo') ? (
      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
    ) : (
      <img src={defaultLogo} alt="로고" className="w-20 h-20 object-contain opacity-50 mx-auto" />
    )}
  </div>
);

// --- MeetingInfo ---
interface MeetingInfoProps {
  meeting: MeetingDetail;
}

const MeetingInfo: React.FC<MeetingInfoProps> = ({ meeting }) => (
  <section className="p-4 border-b border-gray-200">
    <div className="flex gap-2 mb-2">
      <span className="px-3 py-1 bg-mint text-white rounded-full text-xs font-medium">{meeting.interestCategoryName}</span>
      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{meeting.location.region}</span>
    </div>
    <h2 className="font-bold text-lg mb-3">{meeting.title}</h2>
    <p className="text-gray-700 text-sm leading-relaxed">{meeting.description}</p>
  </section>
);

// --- EventCard ---
interface EventCardProps {
  event: MeetingEvent;
  meeting: MeetingDetail;
  isHost: boolean;
  isMember: boolean;
  isParticipating: boolean;
  onTitleClick: () => void;
  onCancelParticipation: () => void;
  onJoin: () => void;
  onJoinMeetingFirst: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  meeting,
  isHost,
  isMember,
  isParticipating,
  onTitleClick,
  onCancelParticipation,
  onJoin,
  onJoinMeetingFirst,
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', weekday: 'short' });
    const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
  };

  return (
  <div className="border-b border-gray-100 pb-4 last:border-b-0">
    {isHost ? (
      <h3 className="font-semibold text-sm mb-3 cursor-pointer hover:opacity-60 transition" onClick={onTitleClick}>{event.title}</h3>
    ) : (
      <h3 className="font-semibold text-sm mb-3">{event.title}</h3>
    )}
    <div className="space-y-2 text-sm mb-4">
      <div className="flex gap-3"><p className="text-gray-500 w-12">일시</p><p className="font-medium">{formatDateTime(event.scheduledAt)}</p></div>
      <div className="flex gap-3"><p className="text-gray-500 w-12">위치</p><p className="font-medium">{event.location || meeting.location.region}</p></div>
      <div className="flex gap-3"><p className="text-gray-500 w-12">비용</p><p className="font-medium">{event.cost || '무료'}</p></div>
      <div className="flex gap-3"><p className="text-gray-500 w-12">참석</p><p className="font-medium">{event.participantCount}명 ({event.participantCount}/{event.maxParticipants || meeting.maxMembers})</p></div>
    </div>

    {/* Participants */}
    {event.participants && event.participants.length > 0 && (
      <div className="flex gap-2 mb-3 items-center">
        {event.participants.slice(0, 3).map((p) => (
          <div key={p.userId} className="relative">
            <ProfileImage src={p.profileImage} alt={p.nickname} size="sm" className="border-2 border-white" />
            {p.isHost && (
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
    <div className="flex gap-2">
      <Button variant="outline" size="md" className="flex-1">공유</Button>
      {isHost || isMember ? (
        isParticipating ? (
          <Button variant="primary" size="md" className="flex-1" onClick={onCancelParticipation}>취소</Button>
        ) : (
          <Button variant="primary" size="md" className="flex-1" onClick={onJoin}>참석</Button>
        )
      ) : (
        <Button variant="primary" size="md" className="flex-1" onClick={onJoinMeetingFirst}>참석</Button>
      )}
    </div>
  </div>
  );
};

// --- EventSection ---
interface EventSectionProps {
  events: MeetingEvent[];
  meeting: MeetingDetail;
  isHost: boolean;
  isMember: boolean;
  userId?: string;
  meetingId?: string;
  onEventTitleClick: (event: MeetingEvent) => void;
  onEventAction: (eventId: string, title: string, action: 'cancelParticipation' | 'join') => void;
  onJoinMeetingFirst: () => void;
  onCreateEvent: () => void;
}

const EventSection: React.FC<EventSectionProps> = ({
  events,
  meeting,
  isHost,
  isMember,
  userId,
  onEventTitleClick,
  onEventAction,
  onJoinMeetingFirst,
  onCreateEvent,
}) => (
  <section className="p-4 space-y-6">
    {events.length > 0 ? (
      events.map((event) => {
        const isParticipating = (event.participants || []).some(p => p.userId === userId);
        return (
          <EventCard
            key={event.eventId}
            event={event}
            meeting={meeting}
            isHost={isHost}
            isMember={isMember}
            isParticipating={isParticipating}
            onTitleClick={() => onEventTitleClick(event)}
            onCancelParticipation={() => onEventAction(event.eventId, event.title, 'cancelParticipation')}
            onJoin={() => onEventAction(event.eventId, event.title, 'join')}
            onJoinMeetingFirst={onJoinMeetingFirst}
          />
        );
      })
    ) : (
      <p className="text-center text-sm text-gray-400 py-4">예정된 정모가 없습니다</p>
    )}
    {isHost && (
      <Button variant="primary" size="md" fullWidth onClick={onCreateEvent}>
        정모 만들기
      </Button>
    )}
  </section>
);

// --- MemberSection ---
interface MemberSectionProps {
  members: MeetingDetail['members'];
  isHost: boolean;
  onManage: () => void;
}

const MemberSection: React.FC<MemberSectionProps> = ({ members, isHost, onManage }) => (
  <section className="px-4 pb-8 border-t border-gray-200">
    <div className="flex items-center justify-between py-4">
      <h3 className="font-semibold">멤버</h3>
      {isHost && (
        <button onClick={onManage} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:opacity-60 transition">
          <UsersRound size={16} />관리
        </button>
      )}
    </div>
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.userId} className="flex items-center gap-3 py-2">
          <ProfileImage src={member.profileImage} alt={member.nickname} size="md" />
          <p className="font-medium text-sm">{member.nickname}</p>
        </div>
      ))}
    </div>
  </section>
);

// --- MeetingModals ---
interface MeetingModalsProps {
  activeModal: ModalType;
  selectedEvent: { id: string; title: string } | null;
  user: { userId: string; nickname: string; profileImage?: string } | null;
  greeting: string;
  reportContent: string;
  isMember: boolean;
  onClose: () => void;
  onGreetingChange: (value: string) => void;
  onReportChange: (value: string) => void;
  onNavigateProfile: () => void;
  onJoinMeeting: () => void;
  onOpenReport: () => void;
  onOpenLeaveMeeting: () => void;
  onReportMeeting: () => void;
  onLeaveMeeting: () => void;
  onCancelParticipation: () => void;
  onJoinEvent: () => void;
}

const MeetingModals: React.FC<MeetingModalsProps> = ({
  activeModal,
  selectedEvent,
  user,
  greeting,
  reportContent,
  isMember,
  onClose,
  onGreetingChange,
  onReportChange,
  onNavigateProfile,
  onJoinMeeting,
  onOpenReport,
  onOpenLeaveMeeting,
  onReportMeeting,
  onLeaveMeeting,
  onCancelParticipation,
  onJoinEvent,
}) => {
  // 멤버 여부에 따라 액션 버튼 구성
  const actionSheetActions = isMember
    ? [
        { label: '모임 신고하기', onClick: onOpenReport },
        { label: '모임 탈퇴하기', onClick: onOpenLeaveMeeting, variant: 'danger' as const },
      ]
    : [
        { label: '모임 신고하기', onClick: onOpenReport },
      ];

  return (
  <>
    <Modal
      isOpen={activeModal === 'profile'}
      onClose={onClose}
      message="프로필 사진을 등록해주세요."
      showLogo
      confirmText="OK"
      singleButton
      onConfirm={onNavigateProfile}
    />

    <Modal
      isOpen={activeModal === 'greeting'}
      onClose={onClose}
      message="가입인사를 작성해주세요."
      image={<ProfileImage src={user?.profileImage} alt="프로필" size="md" />}
      showInput
      inputPlaceholder="가입인사를 작성해주세요!"
      inputValue={greeting}
      onInputChange={onGreetingChange}
      confirmText="확인"
      cancelText="취소"
      onConfirm={onJoinMeeting}
    />

    <Modal
      type="bottom"
      isOpen={activeModal === 'actionSheet'}
      onClose={onClose}
      actions={actionSheetActions}
    />

    <Modal
      isOpen={activeModal === 'report'}
      onClose={onClose}
      title="모임 신고"
      message="신고 사유를 작성해주세요."
      showInput
      inputPlaceholder="신고 내용을 입력해주세요"
      inputValue={reportContent}
      onInputChange={onReportChange}
      confirmText="신고"
      cancelText="취소"
      onConfirm={onReportMeeting}
    />

    <Modal
      isOpen={activeModal === 'leaveMeeting'}
      onClose={onClose}
      message="모임에서 탈퇴하시겠습니까?"
      showCheckbox
      checkboxLabel="탈퇴에 동의합니다"
      confirmText="탈퇴"
      cancelText="취소"
      onConfirm={onLeaveMeeting}
    />

    <Modal
      isOpen={activeModal === 'cancelParticipation'}
      onClose={onClose}
      message={`"${selectedEvent?.title}" 정모 참석을 취소하시겠습니까?`}
      confirmText="취소"
      cancelText="닫기"
      onConfirm={onCancelParticipation}
    />

    <Modal
      isOpen={activeModal === 'joinEvent'}
      onClose={onClose}
      message={`"${selectedEvent?.title}" 정모에 참여하시겠습니까?`}
      confirmText="참여"
      cancelText="취소"
      onConfirm={onJoinEvent}
    />

    <Modal
      isOpen={activeModal === 'joinMeetingFirst'}
      onClose={onClose}
      message="모임에 먼저 가입 후 참석할 수 있습니다."
      confirmText="확인"
      singleButton
      onConfirm={onClose}
    />
  </>
  );
};

// ============================================
// Main Component
// ============================================

const MeetingDetailPage: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    newEvent?: MeetingEvent;
    updatedEvent?: MeetingEvent;
    deletedEventId?: string;
    updatedMembers?: MeetingDetail['members'];
  } | null;

  // Store
  const { getMeetingByGroupId, toggleLikeByGroupId, joinMeeting, leaveMeeting, getEventsByGroupId, addEvent, updateEvent: updateEventInStore, deleteEvent: deleteEventInStore, initializeMockData: initializeMeetingMockData, isInitialized: isMeetingInitialized } = useMeetingStore();
  const { user, initializeMockData: initializeUserMockData, isInitialized: isUserInitialized } = useMyPageStore();

  // API Mutations
  const { mutate: joinMeetingApi, isPending: isJoining } = useJoinMeeting();
  const { mutate: leaveMeetingApi, isPending: isLeaving } = useLeaveMeeting();
  const { mutate: joinEventApi, isPending: isJoiningEvent } = useJoinEvent(meetingId || '');
  const { mutate: cancelEventApi, isPending: isCancellingEvent } = useCancelEventParticipation(meetingId || '');

  // API 호출 - 모임 상세 조회
  const { data: apiMeetingDetail, isLoading, error } = useQuery({
    queryKey: ['meeting', 'detail', meetingId],
    queryFn: async () => {
      const response = await meetingApi.getDetail(meetingId || '');
      return response.data;
    },
    enabled: !!meetingId,
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });

  // Mock 데이터 초기화
  if (!isMeetingInitialized) {
    initializeMeetingMockData();
  }
  if (!isUserInitialized) {
    initializeUserMockData();
  }

  // meetingStore에서 모임 찾기
  const storedMeeting = getMeetingByGroupId(meetingId || '');
  // myRole로 호스트 여부 판단 (myRole이 있으면 우선 사용, 없으면 ownerUserId로 판단)
  const isOwner = storedMeeting?.myRole === 'HOST' || (storedMeeting?.myRole === undefined && storedMeeting?.ownerUserId === user?.userId);

  // State
  const [activeTab, setActiveTab] = useState<'home' | 'chat'>('home');
  const [isLiked, setIsLiked] = useState(storedMeeting?.isLiked || false);
  const [greeting, setGreeting] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [reportContent, setReportContent] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null);

  // store에서 이벤트 목록 가져오기
  const storedEvents = getEventsByGroupId(meetingId || '');

  // 모임 상세 정보 state (API 데이터 또는 Mock 데이터)
  const [meeting, setMeeting] = useState<MeetingDetail>(() => {
    // store에 저장된 이벤트가 있으면 사용, 없으면 빈 배열
    const events = storedEvents.length > 0 ? storedEvents : [];
    let baseMeeting: MeetingDetail;
    if (storedMeeting) {
      baseMeeting = createMeetingDetailFromStore(storedMeeting, isOwner, user, events);
    } else {
      baseMeeting = { ...MOCK_MEETING_DETAIL, events };
    }

    return baseMeeting;
  });

  // locationState로 전달된 이벤트 변경사항 처리
  useEffect(() => {
    if (!locationState || !meetingId) return;

    // history state 초기화 (새로고침 시 중복 처리 방지)
    window.history.replaceState({}, document.title);

    if (locationState.newEvent) {
      // store에 이벤트 추가 (영구 저장)
      const exists = getEventsByGroupId(meetingId).some(e => e.eventId === locationState.newEvent!.eventId);
      if (!exists) {
        addEvent(meetingId, locationState.newEvent);
      }
      // 로컬 state도 업데이트
      setMeeting(prev => {
        const localExists = prev.events.some(e => e.eventId === locationState.newEvent!.eventId);
        if (localExists) return prev;
        return {
          ...prev,
          events: [...prev.events, locationState.newEvent!],
        };
      });
    }

    if (locationState.updatedMembers) {
      setMeeting(prev => ({
        ...prev,
        members: locationState.updatedMembers!,
        memberCount: locationState.updatedMembers!.filter(m => m.status === 'APPROVED').length,
      }));
    }

    if (locationState.updatedEvent) {
      // store에 이벤트 업데이트
      updateEventInStore(meetingId, locationState.updatedEvent.eventId, locationState.updatedEvent);
      // 로컬 state도 업데이트
      setMeeting(prev => ({
        ...prev,
        events: prev.events.map(e => e.eventId === locationState.updatedEvent!.eventId ? locationState.updatedEvent! : e),
      }));
    }

    if (locationState.deletedEventId) {
      // store에서 이벤트 삭제
      deleteEventInStore(meetingId, locationState.deletedEventId);
      // 로컬 state도 업데이트
      setMeeting(prev => ({
        ...prev,
        events: prev.events.filter(e => e.eventId !== locationState.deletedEventId),
      }));
    }
  }, [locationState, meetingId, getEventsByGroupId, addEvent, updateEventInStore, deleteEventInStore]);

  // store의 이벤트가 변경되면 meeting state도 업데이트
  useEffect(() => {
    if (storedEvents.length > 0) {
      setMeeting(prev => ({
        ...prev,
        events: storedEvents,
      }));
    }
  }, [storedEvents]);

  // API 데이터가 로드되면 meeting state 업데이트
  useEffect(() => {
    if (apiMeetingDetail) {
      setMeeting(apiMeetingDetail);
    } else if (error) {
      // API 실패 시 Mock 데이터 사용 (이미 초기화된 상태 유지)
      console.warn('모임 상세 API 호출 실패, Mock 데이터 사용:', error);
    }
  }, [apiMeetingDetail, error]);

  // Derived State
  const isHost = meeting.myRole === 'HOST';
  const isMember = meeting.myStatus === 'APPROVED';

  // Modal Helpers
  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => {
    setActiveModal(null);
    if (activeModal === 'report') setReportContent('');
    if (activeModal === 'cancelParticipation' || activeModal === 'joinEvent') setSelectedEvent(null);
  };

  // Handlers
  const handleLikeToggle = () => {
    setIsLiked(prev => !prev);
    if (meetingId) {
      toggleLikeByGroupId(meetingId);
    }
  };

  const handleCancelParticipation = () => {
    if (!selectedEvent || !user) return;

    // API 호출 시도
    cancelEventApi(selectedEvent.id, {
      onSuccess: () => {
        setMeeting(prev => ({
          ...prev,
          events: prev.events.map(e =>
            e.eventId === selectedEvent.id
              ? { ...e, participantCount: Math.max(0, e.participantCount - 1), participants: (e.participants || []).filter(p => p.userId !== user.userId) }
              : e
          ),
        }));
        closeModal();
      },
      onError: () => {
        // API 실패 시 로컬에서 처리 (fallback)
        setMeeting(prev => ({
          ...prev,
          events: prev.events.map(e =>
            e.eventId === selectedEvent.id
              ? { ...e, participantCount: Math.max(0, e.participantCount - 1), participants: (e.participants || []).filter(p => p.userId !== user.userId) }
              : e
          ),
        }));
        closeModal();
      },
    });
  };

  const handleJoinEvent = () => {
    if (!selectedEvent || !user) return;

    // API 호출 시도
    joinEventApi(selectedEvent.id, {
      onSuccess: () => {
        setMeeting(prev => ({
          ...prev,
          events: prev.events.map(e =>
            e.eventId === selectedEvent.id
              ? { ...e, participantCount: e.participantCount + 1, participants: [...(e.participants || []), { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, isHost: isHost }] }
              : e
          ),
        }));
        closeModal();
      },
      onError: () => {
        // API 실패 시 로컬에서 처리 (fallback)
        setMeeting(prev => ({
          ...prev,
          events: prev.events.map(e =>
            e.eventId === selectedEvent.id
              ? { ...e, participantCount: e.participantCount + 1, participants: [...(e.participants || []), { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, isHost: isHost }] }
              : e
          ),
        }));
        closeModal();
      },
    });
  };

  const handleJoinClick = () => openModal(user?.profileImage ? 'greeting' : 'profile');

  const handleJoinMeeting = () => {
    if (!user || !meetingId) return;

    // API 호출 시도
    joinMeetingApi(
      { groupId: meetingId, message: greeting },
      {
        onSuccess: () => {
          setMeeting(prev => ({
            ...prev,
            memberCount: prev.memberCount + 1,
            members: [...prev.members, { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, role: 'MEMBER', status: 'APPROVED', joinedAt: new Date().toISOString() }],
            myStatus: 'APPROVED',
          }));
          // meetingStore에서 가입 처리 (useJoinMeeting 훅에서 이미 처리됨)
          setGreeting('');
          closeModal();
        },
        onError: () => {
          // API 실패 시 로컬에서 처리 (fallback)
          setMeeting(prev => ({
            ...prev,
            memberCount: prev.memberCount + 1,
            members: [...prev.members, { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, role: 'MEMBER', status: 'APPROVED', joinedAt: new Date().toISOString() }],
            myStatus: 'APPROVED',
          }));
          // meetingStore에서 가입 처리
          if (meetingId) joinMeeting(meetingId, 'MEMBER');
          setGreeting('');
          closeModal();
        },
      }
    );
  };

  const handleReportMeeting = () => {
    console.log('신고 내용:', reportContent);
    closeModal();
    alert('신고가 접수되었습니다.');
  };

  const handleLeaveMeeting = () => {
    if (!user || !meetingId) return;

    // API 호출 시도
    leaveMeetingApi(meetingId, {
      onSuccess: () => {
        // API 성공 시 useLeaveMeeting에서 처리
        closeModal();
      },
      onError: () => {
        // API 실패 시 로컬에서 처리 (fallback)
        setMeeting(prev => ({
          ...prev,
          memberCount: prev.memberCount - 1,
          members: prev.members.filter(m => m.userId !== user.userId),
          myStatus: undefined,
        }));
        // meetingStore에서 탈퇴 처리
        leaveMeeting(meeting.groupId);
        closeModal();
        navigate('/meetings');
      },
    });
  };

  const handleEventTitleClick = (event: MeetingEvent) => {
    navigate(`/meetings/${meetingId}/events/${event.eventId}/edit`, { state: { event } });
  };

  const handleEventAction = (eventId: string, title: string, action: 'cancelParticipation' | 'join') => {
    setSelectedEvent({ id: eventId, title });
    openModal(action === 'cancelParticipation' ? 'cancelParticipation' : 'joinEvent');
  };

  // Render
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="mt-4 text-gray-500 text-sm">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <DetailHeader
        title={meeting.title}
        isLiked={isLiked}
        activeTab={activeTab}
        onLikeToggle={handleLikeToggle}
        onActionSheet={() => openModal('actionSheet')}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' ? (
          <>
            <MeetingImage imageUrl={meeting.imageUrl} title={meeting.title} />
            <MeetingInfo meeting={meeting} />
            <EventSection
              events={meeting.events}
              meeting={meeting}
              isHost={isHost}
              isMember={isMember}
              userId={user?.userId}
              meetingId={meetingId}
              onEventTitleClick={handleEventTitleClick}
              onEventAction={handleEventAction}
              onJoinMeetingFirst={() => openModal('joinMeetingFirst')}
              onCreateEvent={() => navigate(`/meetings/${meetingId}/events/create`)}
            />
            <MemberSection
              members={meeting.members}
              isHost={isHost}
              onManage={() => navigate(`/meetings/${meetingId}/members`, { state: { members: meeting.members } })}
            />
          </>
        ) : (
          <div className="p-4 text-center py-20">
            <p className="text-gray-500">채팅 기능은 준비 중입니다.</p>
          </div>
        )}
      </main>

      {/* Fixed Bottom Button */}
      {!isHost && !isMember && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[398px] px-4">
          <Button variant="primary" size="md" fullWidth onClick={handleJoinClick} disabled={isJoining}>
            {isJoining ? '가입 중...' : '참석하기'}
          </Button>
        </div>
      )}

      <MeetingModals
        activeModal={activeModal}
        selectedEvent={selectedEvent}
        user={user}
        greeting={greeting}
        reportContent={reportContent}
        isMember={isMember}
        onClose={closeModal}
        onGreetingChange={setGreeting}
        onReportChange={setReportContent}
        onNavigateProfile={() => navigate('/mypage/edit')}
        onJoinMeeting={handleJoinMeeting}
        onOpenReport={() => setActiveModal('report')}
        onOpenLeaveMeeting={() => setActiveModal('leaveMeeting')}
        onReportMeeting={handleReportMeeting}
        onLeaveMeeting={handleLeaveMeeting}
        onCancelParticipation={handleCancelParticipation}
        onJoinEvent={handleJoinEvent}
      />
    </div>
  );
};

export default MeetingDetailPage;