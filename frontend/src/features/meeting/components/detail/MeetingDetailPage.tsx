// 모임 상세 페이지 - 코드 정리 버전i// React 및 필요한 훅/라이브러리 import
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Button from '@/shared/components/ui/Button';
import DetailHeader from './DetailHeader';
import MeetingInfoSection from './MeetingInfoSection';
import EventSection from './EventSection';
import MemberSection from './MemberSection';
import { reportUser } from '@/shared/api/safety/safetyApi';
import ChatRoomPage from '@/features/chat/components/ChatRoomPage';
import meetingApi from '@/shared/api/meeting/meetingApi';
import { useMeetingStore } from '../../store/meetingStore';
import { useMyPageStore } from '@/features/mypage/store/myPageStore';
import { useJoinMeeting, useLeaveMeeting, useToggleLikeMeeting } from '../../hooks/useMeetings';
import { useJoinEvent, useCancelEventParticipation } from '../../hooks/useEvents';
import type { MeetingDetail, MeetingEvent } from '@/shared/types/Meeting.types';


// ============================================
// Types & Constants
// ============================================

// 모달 타입 정의 (모달의 종류를 관리)
type ModalType = 'greeting' | 'profile' | 'report' | 'leave' | 'actionSheet' | 'joinEvent' | 'cancelParticipation' | 'joinMeetingFirst' | null;

// API 실패 시 사용할 Mock 데이터 (개발/테스트용)
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

// 스토어에서 가져온 meeting 데이터를 MeetingDetail 타입으로 변환하는 함수
const createMeetingDetailFromStore = (
  storedMeeting: { id: number; title: string; description?: string; image: string; category: string; members: number; maxMembers?: number; location: string; ownerUserId?: string | number; myStatus?: 'PENDING' | 'APPROVED'; myRole?: 'HOST' | 'MEMBER' },
  isOwner: boolean,
  user: { userId: string; nickname: string; profileImage?: string } | null,
  existingEvents: MeetingEvent[] = []
): MeetingDetail => {
  const hostUserId = String(storedMeeting.ownerUserId || 'user1');
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
// UI Components (분리된 컴포넌트들)
// (실제 UI는 별도 파일에서 import)
// ============================================


// ============================================
// Main Component
// ============================================

// =====================
// 메인 컴포넌트
// =====================
const MeetingDetailPage: React.FC = () => {
  // 라우터 관련 훅: URL 파라미터, 네비게이션, location 상태
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { newEvent?: MeetingEvent; updatedEvent?: MeetingEvent; deletedEventId?: string; updatedMembers?: MeetingDetail['members'] } | null;

  // 상태 관리 및 커스텀 훅 사용 (store, mutation 등)
  const { getMeetingByGroupId, toggleLikeByGroupId, joinMeeting, leaveMeeting, getEventsByGroupId, addEvent, updateEvent: updateEventInStore, deleteEvent: deleteEventInStore, initializeMockData: initializeMeetingMockData, isInitialized: isMeetingInitialized } = useMeetingStore();
  const { user, initializeMockData: initializeUserMockData, isInitialized: isUserInitialized } = useMyPageStore();
  // 모임 가입/탈퇴, 이벤트 참여/취소 등 API 호출을 위한 커스텀 훅
  const { mutate: joinMeetingApi, isPending: isJoining } = useJoinMeeting();
  const { mutate: leaveMeetingApi } = useLeaveMeeting();
  const { mutate: toggleLikeApi } = useToggleLikeMeeting();
  const { mutate: joinEventApi } = useJoinEvent(meetingId || '');
  const { mutate: cancelEventApi } = useCancelEventParticipation(meetingId || '');

  // 모임 상세 정보 API 호출 (react-query 사용)
  const { data: apiMeetingDetail, isLoading, error } = useQuery({
    queryKey: ['meeting', 'detail', meetingId],
    queryFn: async () => { const response = await meetingApi.getDetail(meetingId || ''); return response.data; },
    enabled: !!meetingId, // meetingId가 있을 때만 호출
    staleTime: 1000 * 60 * 3, // 3분간 캐싱
    retry: 1, // 실패 시 1회 재시도
  });

  // mock 데이터 초기화 (스토어가 초기화 안됐을 때)
  if (!isMeetingInitialized) initializeMeetingMockData();
  if (!isUserInitialized) initializeUserMockData();

  // 스토어에서 모임 정보 조회 및 소유자 여부 판단
  const storedMeeting = getMeetingByGroupId(meetingId || '');
  const isOwner = storedMeeting?.myRole === 'HOST' || (storedMeeting?.myRole === undefined && storedMeeting?.ownerUserId === user?.userId);

  // 주요 상태값 정의
  const [activeTab, setActiveTab] = useState<'home' | 'chat'>('home'); // 탭 상태(홈/채팅)
  const [isLiked, setIsLiked] = useState(storedMeeting?.isLiked || false); // 좋아요 상태
  const [greeting, setGreeting] = useState(''); // 가입 인사 메시지
  const [activeModal, setActiveModal] = useState<ModalType>(null); // 현재 활성화된 모달
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null); // 선택된 이벤트

  // 이벤트 및 모임 정보 상태
  const storedEvents = getEventsByGroupId(meetingId || '');
  const [meeting, setMeeting] = useState<MeetingDetail>(() => {
    // 스토어에 데이터가 있으면 변환, 없으면 mock 사용
    const events = storedEvents.length > 0 ? storedEvents : [];
    let baseMeeting: MeetingDetail;
    if (storedMeeting) {
      baseMeeting = createMeetingDetailFromStore(storedMeeting, isOwner, user, events);
    } else {
      baseMeeting = { ...MOCK_MEETING_DETAIL, events };
    }
    return baseMeeting;
  });

  // location state(페이지 이동 시 전달된 값) 기반으로 모임/이벤트/멤버 정보 동기화
  useEffect(() => {
    if (!locationState || !meetingId) return;
    window.history.replaceState({}, document.title); // 새로고침 시 중복 반영 방지
    if (locationState.newEvent) {
      // 새 이벤트 추가
      const exists = getEventsByGroupId(meetingId).some(e => e.eventId === locationState.newEvent!.eventId);
      if (!exists) addEvent(meetingId, locationState.newEvent);
      setMeeting(prev => {
        const localExists = prev.events.some(e => e.eventId === locationState.newEvent!.eventId);
        if (localExists) return prev;
        return { ...prev, events: [...prev.events, locationState.newEvent!] };
      });
    }
    if (locationState.updatedMembers) {
      // 멤버 정보 업데이트
      setMeeting(prev => ({
        ...prev,
        members: locationState.updatedMembers!,
        memberCount: locationState.updatedMembers!.filter(m => m.status === 'APPROVED').length,
      }));
    }
    if (locationState.updatedEvent) {
      // 이벤트 정보 업데이트
      updateEventInStore(meetingId, locationState.updatedEvent.eventId, locationState.updatedEvent);
      setMeeting(prev => ({
        ...prev,
        events: prev.events.map(e => e.eventId === locationState.updatedEvent!.eventId ? locationState.updatedEvent! : e),
      }));
    }
    if (locationState.deletedEventId) {
      // 이벤트 삭제
      deleteEventInStore(meetingId, locationState.deletedEventId);
      setMeeting(prev => ({
        ...prev,
        events: prev.events.filter(e => e.eventId !== locationState.deletedEventId),
      }));
    }
  }, [locationState, meetingId, getEventsByGroupId, addEvent, updateEventInStore, deleteEventInStore]);

  // 스토어의 이벤트 정보가 바뀌면 meeting 상태도 동기화
  useEffect(() => {
    if (storedEvents.length > 0) {
      setMeeting(prev => ({ ...prev, events: storedEvents }));
    }
  }, [storedEvents]);

  // API에서 모임 상세 데이터가 오면 meeting 상태 갱신, 실패 시 mock 데이터 사용
  useEffect(() => {
    if (apiMeetingDetail) {
      setMeeting(apiMeetingDetail);
    } else if (error) {
      console.warn('모임 상세 API 호출 실패, Mock 데이터 사용:', error);
    }
  }, [apiMeetingDetail, error]);

  // 내 역할/상태 및 모달 오픈 함수
  const isHost = meeting.myRole === 'HOST';
  const isMember = meeting.myStatus === 'APPROVED';
  const openModal = (type: ModalType) => setActiveModal(type);
  // 모달 닫기 함수 (이벤트 선택 초기화 포함)
  const closeModal = () => {
    setActiveModal(null);
    if (activeModal === 'cancelParticipation' || activeModal === 'joinEvent') setSelectedEvent(null);
  };

  // 참석하기 버튼 클릭 시 (프로필 등록 여부에 따라 모달 분기)
  const handleJoinClick = () => openModal(user?.profileImage ? 'greeting' : 'profile');

  // 좋아요 토글 핸들러 (API 연동 및 스토어/상태 동기화)
  const handleLikeToggle = () => {
    const newLikeState = !isLiked;
    setIsLiked(newLikeState);
    if (meetingId) {
      toggleLikeByGroupId(meetingId);
      toggleLikeApi(
        { groupId: meetingId, isLiked: newLikeState },
        {
          onError: () => {
            setIsLiked(!newLikeState);
            toggleLikeByGroupId(meetingId);
          },
        }
      );
    }
  };

  // 이벤트 참여 취소 핸들러 (API 호출 및 상태 동기화)
  const handleCancelParticipation = () => {
    if (!selectedEvent || !user) return;
    
    const updateState = () => {
      setMeeting(prev => ({
        ...prev,
        events: prev.events.map(e =>
          e.eventId === selectedEvent.id
            ? { ...e, participantCount: Math.max(0, e.participantCount - 1), participants: (e.participants || []).filter(p => p.userId !== user.userId) }
            : e
        ),
      }));
      closeModal();
    };

    cancelEventApi(selectedEvent.id, {
      onSuccess: updateState,
      onError: updateState,
    });
  };

  // 이벤트 참여 핸들러 (API 호출 및 상태 동기화)
  const handleJoinEvent = () => {
    if (!selectedEvent || !user) return;
    
    const updateState = () => {
      setMeeting(prev => ({
        ...prev,
        events: prev.events.map(e =>
          e.eventId === selectedEvent.id
            ? { ...e, participantCount: e.participantCount + 1, participants: [...(e.participants || []), { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, isHost: isHost }] }
            : e
        ),
      }));
      closeModal();
    };

    joinEventApi(selectedEvent.id, {
      onSuccess: updateState,
      onError: updateState,
    });
  };

  // 모임 참석(가입) API 호출 및 상태 동기화
  const handleJoinMeeting = () => {
    if (!user || !meetingId) return;
    
    const updateState = () => {
      setMeeting(prev => ({
        ...prev,
        memberCount: prev.memberCount + 1,
        members: [...prev.members, { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, role: 'MEMBER', status: 'APPROVED', joinedAt: new Date().toISOString() }],
        myStatus: 'APPROVED',
      }));
      if (meetingId) joinMeeting(meetingId, 'MEMBER');
      setGreeting('');
      closeModal();
    };

    joinMeetingApi(
      { groupId: meetingId, requestMessage: greeting },
      {
        onSuccess: updateState,
        onError: updateState,
      }
    );
  };

  // 신고 API 호출 핸들러
  const handleConfirmReport = async (content: string) => {
    try {
      await reportUser({
        targetUserId: meeting.ownerUserId,
        reason: 'ABUSE',
        detail: content,
      });
      alert('신고가 접수되었습니다.');
    } catch (error) {
      console.warn('신고 API 호출 실패 (fallback):', error);
      alert('신고가 접수되었습니다.');
    }
  };

  // 모임 탈퇴 API 호출 및 상태 동기화
  const handleLeaveMeeting = () => {
    if (!user || !meetingId) return;
    leaveMeetingApi(meetingId, {
      onSuccess: () => closeModal(),
      onError: () => {
        setMeeting(prev => ({
          ...prev,
          memberCount: prev.memberCount - 1,
          members: prev.members.filter(m => m.userId !== user.userId),
          myStatus: undefined,
        }));
        leaveMeeting(meeting.groupId);
        closeModal();
        navigate('/meetings');
      },
    });
  };

  // 이벤트 제목 클릭 시 이벤트 수정 페이지로 이동
  const handleEventTitleClick = (event: MeetingEvent) => {
    navigate(`/meetings/${meetingId}/events/${event.eventId}/edit`, { state: { event } });
  };

  // 이벤트 참여/취소 액션 핸들러 (모달 오픈)
  const handleEventAction = (eventId: string, title: string, action: 'cancelParticipation' | 'join') => {
    setSelectedEvent({ id: eventId, title });
    openModal(action === 'cancelParticipation' ? 'cancelParticipation' : 'joinEvent');
  };

  

  // API 로딩 중일 때 로딩 UI 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="mt-4 text-gray-500 text-sm">로딩 중...</p>
      </div>
    );
  }

  // 메인 렌더링 (상세 헤더, 정보/이벤트/멤버/채팅, 모달 등)
  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* 상단 헤더: 제목, 좋아요, 탭, 신고/탈퇴 등 */}
      <DetailHeader
        title={meeting.title}
        isLiked={isLiked}
        activeTab={activeTab}
        onLikeToggle={handleLikeToggle}
        onTabChange={setActiveTab}
        isMember={!!isMember}
        onConfirmReport={handleConfirmReport}
        onConfirmLeave={handleLeaveMeeting}
      />

      {/* 메인 컨텐츠: 홈(정보/이벤트/멤버) or 채팅 */}
      <main className={`flex-1 flex flex-col relative ${activeTab === 'home' ? 'overflow-y-auto pb-20' : 'overflow-hidden pb-0'}`}>
        {activeTab === 'home' ? (
          <>
            {/* 모임 정보 섹션 */}
            <MeetingInfoSection meeting={meeting} />
            {/* 이벤트 섹션 (참여/취소 등 핸들러 전달) */}
            <EventSection
              events={meeting.events}
              meeting={meeting}
              isHost={isHost}
              isMember={isMember}
              userId={user?.userId}
              onEventTitleClick={handleEventTitleClick}
              onEventAction={handleEventAction}
              onJoinMeetingFirst={() => openModal('joinMeetingFirst')}
              onCreateEvent={() => navigate(`/meetings/${meetingId}/events/create`)}
              showCancelModal={activeModal === 'cancelParticipation'}
              showJoinEventModal={activeModal === 'joinEvent'}
              showJoinMeetingFirstModal={activeModal === 'joinMeetingFirst'}
              selectedEventTitle={selectedEvent?.title}
              onCloseCancelModal={closeModal}
              onCloseJoinEventModal={closeModal}
              onCloseJoinMeetingFirstModal={closeModal}
              onConfirmCancel={handleCancelParticipation}
              onConfirmJoin={handleJoinEvent}
            />
            {/* 멤버 섹션 */}
            <MemberSection
              members={meeting.members}
              isHost={isHost}
              onManage={() => navigate(`/meetings/${meetingId}/members`, { state: { members: meeting.members } })}
            />
          </>
        ) : (
          // 채팅 탭
          <ChatRoomPage />
        )}
      </main>

      {/* 참석하기 버튼 (비회원/비호스트만 노출) */}
      {!isHost && !isMember && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[398px] px-4">
          <Button variant="primary" size="md" fullWidth onClick={handleJoinClick} disabled={isJoining}>
            {isJoining ? '가입 중...' : '참석하기'}
          </Button>
        </div>
      )}

      {/* 프로필 등록/가입인사 모달 */}
      {activeTab === 'home' ? (
          <>
        ) : (
          <ChatRoomPage />
        )}
      </main>

      {!isHost && !isMember && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[398px] px-4">
          <Button variant="primary" size="md" fullWidth onClick={handleJoinClick} disabled={isJoining}>
            {isJoining ? '가입 중...' : '참석하기'}
          </Button>
        </div>
      )}

